/**
 * Privacy Guard - Service Worker v2 (Background Script)
 * 
 * KEY CHANGES:
 * 1. When page ISN'T a privacy page, discovers privacy links and fetches them
 * 2. Analyzes privacy/cookie/ToS pages specifically
 * 3. Uses new GDPR compliance scoring
 * 4. Combines analysis of multiple pages (privacy + cookies + ToS) into one score
 */

import { MESSAGE_TYPES, STORAGE_CONFIG, LIMITS } from '../utils/constants.js';
import { nlpEngine } from '../analysis/nlp-engine.js';
import { clauseDetector } from '../analysis/clause-detector.js';
import { riskScorer } from '../analysis/risk-scorer.js';
import { cookieDetector } from '../analysis/cookie-detector.js';
import { llmService } from '../analysis/llm-service.js';

// Cache
const analysisCache = new Map();
const analysisQueue = new Map();

/**
 * Installation
 */
chrome.runtime.onInstalled.addListener((details) => {
    console.log('[Privacy Guard] Extension installed:', details.reason);
    if (details.reason === 'install') {
        initializeExtension();
    }
});

/**
 * Initialize extension defaults
 */
async function initializeExtension() {
    const defaultSettings = {
        autoAnalyze: true,
        showBadge: true,
        language: 'en',
        notificationsEnabled: true,
        enableCookieDetection: true,
        enableLLM: false,
        llmProvider: 'gemini',
        llmApiKey: ''
    };

    await chrome.storage.local.set({
        [STORAGE_CONFIG.KEYS.SETTINGS]: defaultSettings,
        [STORAGE_CONFIG.KEYS.ANALYSES]: {},
        [STORAGE_CONFIG.KEYS.VISITED_SITES]: []
    });

    chrome.tabs.create({
        url: 'https://github.com/simoensm/privacy-guard-extension#readme'
    });
}

/**
 * Message listener
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Service Worker] Received message:', message.type);

    switch (message.type) {
        case MESSAGE_TYPES.ANALYZE_PAGE:
            handleAnalyzePageRequest(message, sender, sendResponse);
            return true;

        case MESSAGE_TYPES.GET_CURRENT_ANALYSIS:
            handleGetAnalysisRequest(message, sendResponse);
            return true;

        case 'LEGAL_PAGE_DETECTED':
            handleLegalPageDetected(message, sender);
            return false;

        case 'PRIVACY_LINKS_DISCOVERED':
            handlePrivacyLinksDiscovered(message, sender);
            return false;

        case 'CONSENT_BANNER_DETECTED':
            handleConsentBannerDetected(message, sender);
            return false;

        case MESSAGE_TYPES.OPEN_DETAILED_VIEW:
            openDetailedView(message.analysis);
            return false;

        default:
            return false;
    }
});

/**
 * Handle analyze page request
 */
async function handleAnalyzePageRequest(message, sender, sendResponse) {
    try {
        const tabId = message.tabId || sender.tab?.id;
        const url = message.url || sender.tab?.url;

        if (!tabId || !url) {
            throw new Error('Tab ID or URL missing');
        }

        // Check cache
        const cached = await getCachedAnalysis(url);
        if (cached) {
            sendResponse({ success: true, analysis: cached, cached: true });
            updateBadge(tabId, cached.score.riskLevel.level);
            return;
        }

        // Check if already running
        if (analysisQueue.has(url)) {
            sendResponse({ success: true, queued: true });
            return;
        }

        analysisQueue.set(url, { tabId, timestamp: Date.now() });

        performAnalysis(tabId, url)
            .then(analysis => {
                sendResponse({ success: true, analysis });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            })
            .finally(() => {
                analysisQueue.delete(url);
            });

    } catch (error) {
        console.error('[Service Worker] Analysis request error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

/**
 * Handle get analysis request
 */
async function handleGetAnalysisRequest(message, sendResponse) {
    try {
        const url = message.url;
        const analysis = await getCachedAnalysis(url);
        sendResponse({ analysis: analysis || null });
    } catch (error) {
        console.error('[Service Worker] Get analysis error:', error);
        sendResponse({ analysis: null, error: error.message });
    }
}

/**
 * Handle legal page detected — auto-analyze if enabled
 */
async function handleLegalPageDetected(message, sender) {
    const tabId = sender.tab?.id;
    const url = sender.tab?.url;
    if (!tabId || !url) return;

    console.log('[Service Worker] Legal page detected:', message.detection?.pageType);

    chrome.action.setBadgeText({ text: '…', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#37ba83', tabId });

    const settings = await getSettings();
    if (settings.autoAnalyze) {
        setTimeout(() => {
            performAnalysis(tabId, url).catch(err => {
                console.error('[Service Worker] Auto-analysis failed:', err);
            });
        }, 1000);
    }
}

/**
 * Handle discovered privacy links (when user is on a non-privacy page)
 */
async function handlePrivacyLinksDiscovered(message, sender) {
    const tabId = sender.tab?.id;
    const url = sender.tab?.url;
    if (!tabId || !url) return;

    console.log('[Service Worker] Privacy links discovered:', message.links?.length);

    // Show badge indicating we found privacy pages to analyze
    if (message.links && message.links.length > 0) {
        chrome.action.setBadgeText({ text: '🔍', tabId });
        chrome.action.setBadgeBackgroundColor({ color: '#6366f1', tabId });

        const settings = await getSettings();
        if (settings.autoAnalyze) {
            setTimeout(() => {
                performAnalysis(tabId, url).catch(err => {
                    console.error('[Service Worker] Auto-analysis with linked pages failed:', err);
                });
            }, 1500);
        }
    }
}

/**
 * Handle consent banner detection
 */
function handleConsentBannerDetected(message, sender) {
    const tabId = sender.tab?.id;
    if (!tabId) return;

    console.log('[Service Worker] Consent banner detected:', {
        hasRejectAll: message.banner?.hasRejectAll,
        hasAcceptAll: message.banner?.hasAcceptAll,
        hasCustomize: message.banner?.hasCustomize
    });

    // Store consent banner info for later use in scoring
    if (tabId) {
        consentBannerCache.set(tabId, message.banner);
    }
}

// Temporary consent banner cache (per tab)
const consentBannerCache = new Map();

/**
 * MAIN ANALYSIS PIPELINE v2
 * 
 * Flow:
 * 1. Get page content + discovered privacy links
 * 2. If page IS a privacy/legal page → analyze directly
 * 3. If page is NOT → fetch discovered privacy pages and analyze those
 * 4. Combine all analyses into one GDPR score
 */
async function performAnalysis(tabId, url) {
    console.log('[Service Worker] Starting analysis for:', url);

    try {
        // ==========================================
        // STEP 1: Get content + discovered links from content script
        // ==========================================
        let contentResponse;
        try {
            contentResponse = await chrome.tabs.sendMessage(tabId, {
                type: 'GET_PAGE_CONTENT'
            });
        } catch (connectionError) {
            console.warn('[Service Worker] Content script not available:', connectionError.message);
            throw new Error('Content script not available on this page. Try reloading the page.');
        }

        if (!contentResponse || !contentResponse.success) {
            throw new Error('Failed to extract page content');
        }

        const { content, metadata, discoveredLinks } = contentResponse;
        const isLegalPage = isPrivacyRelatedContent(content, metadata);

        console.log('[Service Worker] Page type:', isLegalPage ? 'LEGAL PAGE' : 'REGULAR PAGE',
            '| Discovered links:', discoveredLinks?.length || 0);

        // ==========================================
        // STEP 2: Determine what to analyze
        // ==========================================
        let primaryContent = '';
        let fetchedPages = [];

        if (isLegalPage) {
            // This page IS a privacy/legal page — analyze it directly
            primaryContent = content;
            console.log('[Service Worker] Analyzing current page as legal content');
        }

        // Also fetch linked privacy pages (even if current is a legal page,
        // we still want to check for cookie policy, ToS, etc.)
        if (discoveredLinks && discoveredLinks.length > 0) {
            const pagesToFetch = discoveredLinks
                .filter(link => link.isSameOrigin && link.confidence >= 0.5)
                .slice(0, LIMITS.MAX_PRIVACY_PAGES_TO_FETCH);

            console.log('[Service Worker] Fetching', pagesToFetch.length, 'privacy pages...');

            for (const link of pagesToFetch) {
                try {
                    const pageResponse = await chrome.tabs.sendMessage(tabId, {
                        type: 'FETCH_LINK_CONTENT',
                        url: link.url
                    });

                    if (pageResponse?.success && pageResponse.isLegalContent) {
                        fetchedPages.push({
                            url: link.url,
                            category: link.category,
                            content: pageResponse.content,
                            title: pageResponse.title,
                            wordCount: pageResponse.wordCount
                        });
                        console.log('[Service Worker] Fetched:', link.category, '→', link.url);
                    }
                } catch (err) {
                    console.warn('[Service Worker] Failed to fetch:', link.url, err.message);
                }
            }
        }

        // If we don't have a legal page AND couldn't fetch any, analyze what we have
        if (!isLegalPage && fetchedPages.length === 0) {
            primaryContent = content;
            console.log('[Service Worker] No legal pages found, analyzing current page');
        }

        // ==========================================
        // STEP 3: Combine all text for analysis
        // ==========================================
        // Merge primary content with fetched pages
        let combinedContent = primaryContent;
        for (const page of fetchedPages) {
            combinedContent += '\n\n--- ' + page.category + ' ---\n\n' + page.content;
        }

        // Truncate if needed
        if (combinedContent.length > LIMITS.MAX_DOCUMENT_SIZE) {
            combinedContent = combinedContent.substring(0, LIMITS.MAX_DOCUMENT_SIZE);
        }

        // ==========================================
        // STEP 4: NLP Analysis
        // ==========================================
        console.log('[Service Worker] Running NLP analysis...');
        const language = metadata.language || 'en';
        const nlpResults = await nlpEngine.analyzeDocument(combinedContent, language);

        // ==========================================
        // STEP 5: Clause Detection
        // ==========================================
        console.log('[Service Worker] Detecting clauses...');
        const clauseDetection = clauseDetector.detectAll(combinedContent, nlpResults.sentences);

        // ==========================================
        // STEP 6: Cookie & Tracker Detection
        // ==========================================
        const settings = await getSettings();
        let cookieAnalysis = null;

        if (settings.enableCookieDetection) {
            console.log('[Service Worker] Detecting cookies and trackers...');
            try {
                const cookieResponse = await chrome.tabs.sendMessage(tabId, {
                    type: 'ANALYZE_COOKIES'
                });
                if (cookieResponse?.success) {
                    cookieAnalysis = cookieResponse.cookieData;
                }
            } catch (error) {
                console.warn('[Service Worker] Cookie detection failed:', error);
            }
        }

        // Get consent banner info
        const consentBanner = consentBannerCache.get(tabId) ||
            cookieAnalysis?.consentBanner || null;

        // ==========================================
        // STEP 7: GDPR Compliance Score (NEW)
        // ==========================================
        console.log('[Service Worker] Calculating GDPR compliance score...');

        // Determine what documents we found
        const hasPrivacyPolicy = isLegalPage && (metadata.title?.toLowerCase().includes('privacy') ||
            url.toLowerCase().includes('privacy')) ||
            fetchedPages.some(p => p.category === 'PRIVACY_POLICY');

        const hasCookiePolicy = isLegalPage && (metadata.title?.toLowerCase().includes('cookie') ||
            url.toLowerCase().includes('cookie')) ||
            fetchedPages.some(p => p.category === 'COOKIE_POLICY');

        const analysisData = {
            nlpResults,
            clauseDetection,
            cookieAnalysis,
            consentBanner,
            rawContent: combinedContent,
            fetchedPages,
            documentMeta: {
                ...metadata,
                hasPrivacyPolicy,
                hasCookiePolicy,
                hasContactInfo: metadata.hasContactInfo || false,
                wordCount: nlpResults.stats.wordCount,
                isComplete: nlpResults.stats.wordCount > 500,
                hardToFind: !isLegalPage && fetchedPages.length === 0,
                isOutdated: checkIfOutdated(metadata.lastUpdated),
                lastUpdated: metadata.lastUpdated
            },
            pageInfo: {
                easyToFind: metadata.easyToFind || (discoveredLinks && discoveredLinks.length > 0),
                url: url,
                isDirectLegalPage: isLegalPage,
                fetchedPageCount: fetchedPages.length
            }
        };

        const scoreResults = riskScorer.calculateTransparencyScore(analysisData);

        // ==========================================
        // STEP 8: LLM Summary (if enabled)
        // ==========================================
        let llmSummary = null;

        if (settings.enableLLM && settings.llmApiKey) {
            console.log('[Service Worker] Generating LLM-powered summary...');
            llmService.configure(settings.llmApiKey, settings.llmProvider);

            try {
                llmSummary = await llmService.summarizeDocument(combinedContent, {
                    maxLength: 500,
                    focusAreas: ['privacy', 'data collection', 'third parties', 'user rights', 'cookies'],
                    language: language
                });
            } catch (error) {
                console.warn('[Service Worker] LLM summarization failed:', error);
            }
        }

        // ==========================================
        // STEP 9: Generate basic summary
        // ==========================================
        const basicSummary = nlpResults.keywords
            ? nlpEngine.generateSummary(nlpResults.sentences, 7)
            : [];

        // ==========================================
        // STEP 10: Build final result
        // ==========================================
        const analysis = {
            url,
            score: scoreResults,
            summary: llmSummary || basicSummary,
            llmEnhanced: llmSummary !== null,
            llmSummary,
            clauseDetection,
            cookieAnalysis,
            consentBanner: consentBanner ? {
                detected: true,
                hasRejectAll: consentBanner.hasRejectAll,
                hasAcceptAll: consentBanner.hasAcceptAll,
                hasCustomize: consentBanner.hasCustomize
            } : null,
            fetchedPages: fetchedPages.map(p => ({
                url: p.url,
                category: p.category,
                title: p.title,
                wordCount: p.wordCount
            })),
            discoveredLinks: (discoveredLinks || []).slice(0, 10),
            nlpResults: {
                stats: nlpResults.stats,
                readability: nlpResults.readability,
                keywords: nlpResults.keywords.slice(0, 10)
            },
            metadata: {
                ...metadata,
                isDirectLegalPage: isLegalPage
            },
            analyzedAt: new Date().toISOString()
        };

        // Save to cache
        await saveAnalysis(url, analysis);

        // Update badge
        updateBadge(tabId, analysis.score.riskLevel.level);

        // Notify popup
        chrome.runtime.sendMessage({
            type: MESSAGE_TYPES.ANALYSIS_COMPLETE,
            analysis
        }).catch(() => { /* popup not open */ });

        console.log('[Service Worker] Analysis complete. Score:', analysis.score.score,
            '| Risk:', analysis.score.riskLevel.level,
            '| Pages analyzed:', 1 + fetchedPages.length);

        return analysis;

    } catch (error) {
        console.error('[Service Worker] Analysis error:', error);

        chrome.runtime.sendMessage({
            type: 'ANALYSIS_ERROR',
            error: error.message
        }).catch(() => { });

        throw error;
    }
}

/**
 * Check if content is privacy-related
 */
function isPrivacyRelatedContent(content, metadata) {
    const lowerContent = (content || '').toLowerCase().substring(0, 5000);
    const lowerTitle = (metadata?.title || '').toLowerCase();
    const lowerUrl = (metadata?.url || '').toLowerCase();

    // Check URL
    const urlPatterns = [
        /privacy/i, /cookie[-_]?policy/i, /terms[-_]?of/i,
        /terms[-_]?and/i, /legal/i, /gdpr/i, /rgpd/i,
        /data[-_]?protection/i, /politique/i, /conditions/i,
        /datenschutz/i, /impressum/i
    ];
    for (const pattern of urlPatterns) {
        if (pattern.test(lowerUrl)) return true;
    }

    // Check title
    const titleKeywords = [
        'privacy', 'cookie', 'terms', 'conditions', 'legal',
        'gdpr', 'rgpd', 'datenschutz', 'confidentialité'
    ];
    for (const keyword of titleKeywords) {
        if (lowerTitle.includes(keyword)) return true;
    }

    // Check content density of privacy-related terms
    const privacyTerms = [
        'personal data', 'privacy policy', 'we collect',
        'data controller', 'data processor', 'cookie policy',
        'terms of service', 'terms and conditions',
        'right to access', 'right to deletion',
        'données personnelles', 'politique de confidentialité'
    ];

    let matchCount = 0;
    for (const term of privacyTerms) {
        if (lowerContent.includes(term)) matchCount++;
    }

    return matchCount >= 3;
}

/**
 * Get cached analysis
 */
async function getCachedAnalysis(url) {
    if (analysisCache.has(url)) {
        const cached = analysisCache.get(url);
        if (Date.now() - cached.timestamp < STORAGE_CONFIG.CACHE_DURATION) {
            return cached.analysis;
        } else {
            analysisCache.delete(url);
        }
    }

    const storage = await chrome.storage.local.get(STORAGE_CONFIG.KEYS.ANALYSES);
    const analyses = storage[STORAGE_CONFIG.KEYS.ANALYSES] || {};

    if (analyses[url]) {
        const cached = analyses[url];
        if (Date.now() - new Date(cached.analyzedAt).getTime() < STORAGE_CONFIG.CACHE_DURATION) {
            analysisCache.set(url, {
                analysis: cached,
                timestamp: new Date(cached.analyzedAt).getTime()
            });
            return cached;
        }
    }

    return null;
}

/**
 * Save analysis
 */
async function saveAnalysis(url, analysis) {
    analysisCache.set(url, {
        analysis,
        timestamp: Date.now()
    });

    const storage = await chrome.storage.local.get(STORAGE_CONFIG.KEYS.ANALYSES);
    let analyses = storage[STORAGE_CONFIG.KEYS.ANALYSES] || {};

    analyses[url] = analysis;

    const entries = Object.entries(analyses);
    if (entries.length > STORAGE_CONFIG.MAX_CACHE_ENTRIES) {
        entries.sort((a, b) =>
            new Date(a[1].analyzedAt).getTime() - new Date(b[1].analyzedAt).getTime()
        );
        analyses = Object.fromEntries(entries.slice(-STORAGE_CONFIG.MAX_CACHE_ENTRIES));
    }

    await chrome.storage.local.set({
        [STORAGE_CONFIG.KEYS.ANALYSES]: analyses
    });
}

/**
 * Update badge — now 4 levels
 */
function updateBadge(tabId, riskLevel) {
    const config = {
        EXCELLENT: { text: '✓', color: '#22c55e' },
        GOOD: { text: '✓', color: '#37ba83' },
        CONCERNING: { text: '!', color: '#f59e0b' },
        POOR: { text: '⚠', color: '#ef4444' }
    };

    const badge = config[riskLevel] || config.CONCERNING;

    chrome.action.setBadgeText({ text: badge.text, tabId });
    chrome.action.setBadgeBackgroundColor({ color: badge.color, tabId });
}

/**
 * Get settings
 */
async function getSettings() {
    const storage = await chrome.storage.local.get(STORAGE_CONFIG.KEYS.SETTINGS);
    return storage[STORAGE_CONFIG.KEYS.SETTINGS] || {
        autoAnalyze: true,
        showBadge: true,
        language: 'en',
        enableCookieDetection: true,
        enableLLM: false
    };
}

/**
 * Check if a date is outdated
 */
function checkIfOutdated(dateStr) {
    if (!dateStr) return false;
    try {
        const date = new Date(dateStr);
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        return date < twoYearsAgo;
    } catch {
        return false;
    }
}

/**
 * Open detailed view
 */
function openDetailedView(analysis) {
    console.log('[Service Worker] Opening detailed view:', analysis);
}

console.log('[Privacy Guard] Service Worker v2 initialized');
