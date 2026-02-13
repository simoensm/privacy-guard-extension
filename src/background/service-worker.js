/**
 * Privacy Guard - Service Worker (Background Script)
 * Orchestration des analyses et communication entre composants
 */

import { MESSAGE_TYPES, STORAGE_CONFIG, LIMITS } from '../utils/constants.js';
import { nlpEngine } from '../analysis/nlp-engine.js';
import { clauseDetector } from '../analysis/clause-detector.js';
import { riskScorer } from '../analysis/risk-scorer.js';

// Cache des analyses en mémoire
const analysisCache = new Map();

// File d'attente des analyses
const analysisQueue = new Map();

/**
 * Installation de l'extension
 */
chrome.runtime.onInstalled.addListener((details) => {
    console.log('[Privacy Guard] Extension installed:', details.reason);

    if (details.reason === 'install') {
        // Première installation
        initializeExtension();
    } else if (details.reason === 'update') {
        // Mise à jour
        console.log('[Privacy Guard] Extension updated');
    }
});

/**
 * Initialisation de l'extension
 */
async function initializeExtension() {
    // Configuration par défaut
    const defaultSettings = {
        autoAnalyze: true,
        showBadge: true,
        language: 'en',
        notificationsEnabled: true
    };

    await chrome.storage.local.set({
        [STORAGE_CONFIG.KEYS.SETTINGS]: defaultSettings,
        [STORAGE_CONFIG.KEYS.ANALYSES]: {},
        [STORAGE_CONFIG.KEYS.VISITED_SITES]: []
    });

    // Ouvrir la page de bienvenue
    chrome.tabs.create({
        url: 'https://github.com/simoensm/privacy-guard-extension#readme'
    });
}

/**
 * Écoute des messages
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Service Worker] Received message:', message.type);

    switch (message.type) {
        case MESSAGE_TYPES.ANALYZE_PAGE:
            handleAnalyzePageRequest(message, sender, sendResponse);
            return true; // Async response

        case MESSAGE_TYPES.GET_CURRENT_ANALYSIS:
            handleGetAnalysisRequest(message, sendResponse);
            return true;

        case 'LEGAL_PAGE_DETECTED':
            handleLegalPageDetected(message, sender);
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
 * Gère une demande d'analyse de page
 */
async function handleAnalyzePageRequest(message, sender, sendResponse) {
    try {
        const tabId = message.tabId || sender.tab?.id;
        const url = message.url || sender.tab?.url;

        if (!tabId || !url) {
            throw new Error('Tab ID or URL missing');
        }

        // Vérifier si une analyse est déjà en cache
        const cached = await getCachedAnalysis(url);
        if (cached) {
            sendResponse({ success: true, analysis: cached, cached: true });
            updateBadge(tabId, cached.score.riskLevel.level);
            return;
        }

        // Vérifier si une analyse est déjà en cours
        if (analysisQueue.has(url)) {
            sendResponse({ success: true, queued: true });
            return;
        }

        // Ajouter à la file d'attente
        analysisQueue.set(url, { tabId, timestamp: Date.now() });

        // Démarrer l'analyse
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
 * Gère une demande de récupération d'analyse
 */
async function handleGetAnalysisRequest(message, sendResponse) {
    try {
        const url = message.url;
        const analysis = await getCachedAnalysis(url);

        if (analysis) {
            sendResponse({ analysis });
        } else {
            sendResponse({ analysis: null });
        }

    } catch (error) {
        console.error('[Service Worker] Get analysis error:', error);
        sendResponse({ analysis: null, error: error.message });
    }
}

/**
 * Gère la détection d'une page légale
 */
async function handleLegalPageDetected(message, sender) {
    const tabId = sender.tab?.id;
    const url = sender.tab?.url;

    if (!tabId || !url) return;

    console.log('[Service Worker] Legal page detected:', message.detection);

    // Récupérer les paramètres
    const settings = await getSettings();

    // Mise à jour du badge
    chrome.action.setBadgeText({ text: '!', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#3b82f6', tabId });

    // Auto-analyse si activée
    if (settings.autoAnalyze) {
        setTimeout(() => {
            performAnalysis(tabId, url).catch(err => {
                console.error('[Service Worker] Auto-analysis failed:', err);
            });
        }, 1000);
    }
}

/**
 * Gère la détection d'une bannière de consentement
 */
function handleConsentBannerDetected(message, sender) {
    console.log('[Service Worker] Consent banner detected');
    // Futur: analyser le texte de la bannière
}

/**
 * Effectue l'analyse complète d'une page
 */
async function performAnalysis(tabId, url) {
    console.log('[Service Worker] Starting analysis for:', url);

    try {
        // 1. Demander le contenu au content script
        const contentResponse = await chrome.tabs.sendMessage(tabId, {
            type: 'GET_PAGE_CONTENT'
        });

        if (!contentResponse.success) {
            throw new Error('Failed to extract page content');
        }

        const { content, metadata } = contentResponse;

        // Vérifier la taille du contenu
        if (content.length > LIMITS.MAX_DOCUMENT_SIZE) {
            console.warn('[Service Worker] Content too large, truncating');
        }

        // 2. Analyse NLP
        console.log('[Service Worker] Running NLP analysis...');
        const language = metadata.language || 'en';
        const nlpResults = await nlpEngine.analyzeDocument(content, language);

        // 3. Détection de clauses
        console.log('[Service Worker] Detecting clauses...');
        const clauseDetection = clauseDetector.detectAll(content, nlpResults.sentences);

        // 4. Calcul du score
        console.log('[Service Worker] Calculating risk score...');
        const analysisData = {
            nlpResults,
            clauseDetection,
            documentMeta: {
                ...metadata,
                hasPrivacyPolicy: metadata.title?.toLowerCase().includes('privacy') || false,
                hasCookiePolicy: metadata.title?.toLowerCase().includes('cookie') || false,
                hasContactInfo: metadata.hasContactInfo || false,
                wordCount: nlpResults.stats.wordCount,
                isComplete: nlpResults.stats.wordCount > 500,
                hardToFind: false,
                isOutdated: checkIfOutdated(metadata.lastUpdated)
            },
            pageInfo: {
                easyToFind: metadata.easyToFind || false,
                url: url
            }
        };

        const scoreResults = riskScorer.calculateTransparencyScore(analysisData);

        // 5. Génération du résumé
        const summary = nlpResults.keywords
            ? nlpEngine.generateSummary(nlpResults.sentences, 7)
            : [];

        // 6. Construction du résultat final
        const analysis = {
            url,
            score: scoreResults,
            summary,
            clauseDetection,
            nlpResults: {
                stats: nlpResults.stats,
                readability: nlpResults.readability,
                keywords: nlpResults.keywords.slice(0, 10)
            },
            metadata,
            analyzedAt: new Date().toISOString()
        };

        // 7. Sauvegarde en cache
        await saveAnalysis(url, analysis);

        // 8. Mise à jour du badge
        updateBadge(tabId, analysis.score.riskLevel.level);

        // 9. Notification au popup (si ouvert)
        chrome.runtime.sendMessage({
            type: MESSAGE_TYPES.ANALYSIS_COMPLETE,
            analysis
        }).catch(() => {
            // Popup non ouvert, pas grave
        });

        console.log('[Service Worker] Analysis complete:', analysis.score.score);

        return analysis;

    } catch (error) {
        console.error('[Service Worker] Analysis error:', error);

        // Notification d'erreur
        chrome.runtime.sendMessage({
            type: 'ANALYSIS_ERROR',
            error: error.message
        }).catch(() => { });

        throw error;
    }
}

/**
 * Récupère une analyse en cache
 */
async function getCachedAnalysis(url) {
    // Vérifier le cache en mémoire
    if (analysisCache.has(url)) {
        const cached = analysisCache.get(url);
        if (Date.now() - cached.timestamp < STORAGE_CONFIG.CACHE_DURATION) {
            return cached.analysis;
        } else {
            analysisCache.delete(url);
        }
    }

    // Vérifier le stockage persistant
    const storage = await chrome.storage.local.get(STORAGE_CONFIG.KEYS.ANALYSES);
    const analyses = storage[STORAGE_CONFIG.KEYS.ANALYSES] || {};

    if (analyses[url]) {
        const cached = analyses[url];
        if (Date.now() - new Date(cached.analyzedAt).getTime() < STORAGE_CONFIG.CACHE_DURATION) {
            // Ajouter au cache en mémoire
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
 * Sauvegarde une analyse
 */
async function saveAnalysis(url, analysis) {
    // Cache en mémoire
    analysisCache.set(url, {
        analysis,
        timestamp: Date.now()
    });

    // Stockage persistant
    const storage = await chrome.storage.local.get(STORAGE_CONFIG.KEYS.ANALYSES);
    const analyses = storage[STORAGE_CONFIG.KEYS.ANALYSES] || {};

    analyses[url] = analysis;

    // Limiter la taille du cache
    const entries = Object.entries(analyses);
    if (entries.length > STORAGE_CONFIG.MAX_CACHE_ENTRIES) {
        // Supprimer les plus anciennes
        entries.sort((a, b) =>
            new Date(a[1].analyzedAt).getTime() - new Date(b[1].analyzedAt).getTime()
        );

        const toKeep = entries.slice(-STORAGE_CONFIG.MAX_CACHE_ENTRIES);
        analyses = Object.fromEntries(toKeep);
    }

    await chrome.storage.local.set({
        [STORAGE_CONFIG.KEYS.ANALYSES]: analyses
    });
}

/**
 * Met à jour le badge de l'extension
 */
function updateBadge(tabId, riskLevel) {
    const config = {
        LOW: { text: '✓', color: '#22c55e' },
        MEDIUM: { text: '!', color: '#f59e0b' },
        HIGH: { text: '⚠', color: '#ef4444' }
    };

    const badge = config[riskLevel] || config.MEDIUM;

    chrome.action.setBadgeText({ text: badge.text, tabId });
    chrome.action.setBadgeBackgroundColor({ color: badge.color, tabId });
}

/**
 * Récupère les paramètres
 */
async function getSettings() {
    const storage = await chrome.storage.local.get(STORAGE_CONFIG.KEYS.SETTINGS);
    return storage[STORAGE_CONFIG.KEYS.SETTINGS] || {
        autoAnalyze: true,
        showBadge: true,
        language: 'en'
    };
}

/**
 * Vérifie si une date est obsolète
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
 * Ouvre la vue détaillée
 */
function openDetailedView(analysis) {
    // Futur: ouvrir une page HTML avec l'analyse complète
    console.log('[Service Worker] Opening detailed view:', analysis);
}

console.log('[Privacy Guard] Service Worker initialized');
