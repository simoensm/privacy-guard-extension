/**
 * Privacy Guard - Content Script v2
 * Handles page detection, privacy link discovery, and content extraction
 * Now supports fetching remote privacy pages for analysis
 */

// Use globals from constants.js and page-detector.js (loaded before this script)
const { pageDetector, MESSAGE_TYPES } = window;

// State
let pageAnalyzed = false;
let detectionResult = null;

/**
 * Initialization
 */
function initialize() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runDetection);
    } else {
        runDetection();
    }
    chrome.runtime.onMessage.addListener(handleMessage);
}

/**
 * Run detection on page load
 */
function runDetection() {
    try {
        detectionResult = pageDetector.detectLegalPage();

        console.log('[Privacy Guard] Page detection:', {
            isLegalPage: detectionResult.isLegalPage,
            pageType: detectionResult.pageType,
            confidence: detectionResult.confidence,
            discoveredLinks: detectionResult.discoveredLinks.length
        });

        // If it's a legal page, notify background
        if (detectionResult.isLegalPage && detectionResult.confidence > 0.3) {
            notifyBackgroundOfLegalPage(detectionResult);
        }
        // If it's NOT a legal page but we found privacy links, notify background
        else if (detectionResult.discoveredLinks.length > 0) {
            notifyBackgroundOfDiscoveredLinks(detectionResult.discoveredLinks);
        }

    } catch (error) {
        console.error('[Privacy Guard] Detection error:', error);
    }
}

/**
 * Notify background that a legal page was detected
 */
function notifyBackgroundOfLegalPage(detection) {
    chrome.runtime.sendMessage({
        type: 'LEGAL_PAGE_DETECTED',
        detection,
        url: window.location.href,
        tabId: getCurrentTabId()
    }).catch(err => {
        console.error('[Privacy Guard] Failed to notify background:', err);
    });
}

/**
 * Notify background about discovered privacy links (when current page isn't a legal page)
 */
function notifyBackgroundOfDiscoveredLinks(links) {
    chrome.runtime.sendMessage({
        type: 'PRIVACY_LINKS_DISCOVERED',
        links,
        sourceUrl: window.location.href,
        tabId: getCurrentTabId()
    }).catch(err => {
        console.error('[Privacy Guard] Failed to notify about discovered links:', err);
    });
}

/**
 * Handle incoming messages
 */
function handleMessage(message, sender, sendResponse) {
    switch (message.type) {
        case MESSAGE_TYPES.ANALYZE_PAGE:
            handleAnalyzeRequest(sendResponse);
            return true;

        case 'GET_PAGE_CONTENT':
            handleContentRequest(sendResponse);
            return true;

        case 'GET_DETECTION_RESULT':
            sendResponse({ detection: detectionResult });
            return false;

        case 'ANALYZE_COOKIES':
            handleCookieAnalysisRequest(sendResponse);
            return true;

        case 'DISCOVER_PRIVACY_LINKS':
            handleDiscoverLinksRequest(sendResponse);
            return true;

        case 'FETCH_LINK_CONTENT':
            handleFetchLinkContent(message, sendResponse);
            return true;

        default:
            return false;
    }
}

/**
 * Handle a full analysis request
 */
async function handleAnalyzeRequest(sendResponse) {
    try {
        if (!detectionResult) {
            detectionResult = pageDetector.detectLegalPage();
        }

        const content = pageDetector.extractContent();

        sendResponse({
            success: true,
            detection: detectionResult,
            content,
            metadata: detectionResult.metadata,
            discoveredLinks: detectionResult.discoveredLinks
        });

        pageAnalyzed = true;

    } catch (error) {
        console.error('[Privacy Guard] Analysis request error:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

/**
 * Handle content extraction request
 */
function handleContentRequest(sendResponse) {
    try {
        const content = pageDetector.extractContent();
        const metadata = detectionResult?.metadata || pageDetector.extractMetadata();

        // Always include discovered links
        const discoveredLinks = detectionResult?.discoveredLinks ||
            pageDetector.discoverPrivacyLinks();

        sendResponse({
            success: true,
            content,
            metadata,
            discoveredLinks
        });

    } catch (error) {
        console.error('[Privacy Guard] Content request error:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

/**
 * Handle discover links request
 */
function handleDiscoverLinksRequest(sendResponse) {
    try {
        const links = pageDetector.discoverPrivacyLinks();
        sendResponse({
            success: true,
            links
        });
    } catch (error) {
        console.error('[Privacy Guard] Discover links error:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

/**
 * Fetch the text content of a remote privacy page via fetch API
 * This runs in the content script context, so it has same-origin access
 */
async function handleFetchLinkContent(message, sendResponse) {
    try {
        const { url } = message;
        if (!url) {
            sendResponse({ success: false, error: 'No URL provided' });
            return;
        }

        console.log('[Privacy Guard] Fetching privacy page:', url);

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'text/html,application/xhtml+xml'
            },
            signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();

        // Parse the HTML and extract text content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Remove scripts, styles, nav, etc.
        const removeSelectors = [
            'script', 'style', 'nav', 'header', 'footer', 'aside',
            '.navigation', '.menu', '.sidebar', '.cookie-banner',
            '[role="navigation"]', '[role="banner"]', '[role="complementary"]'
        ];
        removeSelectors.forEach(selector => {
            doc.querySelectorAll(selector).forEach(el => el.remove());
        });

        // Try to get main content first
        const main = doc.querySelector('main, article, .content, [role="main"], .entry-content, .post-content');
        const textContent = (main || doc.body).textContent
            .replace(/\s+/g, ' ')
            .trim();

        // Extract page title
        const pageTitle = doc.querySelector('title')?.textContent || '';

        // Check if this page actually looks like a privacy/legal page
        const looksLegal = isTextLegalContent(textContent);

        sendResponse({
            success: true,
            content: textContent.substring(0, 500000), // 500KB limit
            title: pageTitle,
            url: url,
            isLegalContent: looksLegal,
            wordCount: textContent.split(/\s+/).length
        });

    } catch (error) {
        console.error('[Privacy Guard] Fetch link content error:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

/**
 * Check if text content looks like a legal/privacy document
 */
function isTextLegalContent(text) {
    const lowerText = text.toLowerCase().substring(0, 5000);
    const legalIndicators = [
        'privacy policy', 'privacy notice', 'personal data',
        'cookie policy', 'we use cookies', 'we collect',
        'terms of service', 'terms and conditions', 'terms of use',
        'data protection', 'data controller', 'data processor',
        'politique de confidentialité', 'données personnelles',
        'conditions générales', 'cookie', 'gdpr', 'rgpd',
        'right to access', 'right to deletion', 'opt out',
        'third parties', 'third-party', 'data retention',
        'your rights', 'your choices'
    ];

    let matchCount = 0;
    for (const indicator of legalIndicators) {
        if (lowerText.includes(indicator)) matchCount++;
    }

    // Need at least 3 matches to consider it legal content
    return matchCount >= 3;
}

function getCurrentTabId() {
    return null;
}

/**
 * Cookie banner detection
 */
function detectConsentBanners() {
    const commonSelectors = [
        '#cookie-banner', '.cookie-banner',
        '[class*="cookie"]', '[class*="consent"]',
        '[id*="cookie"]', '[id*="consent"]',
        '[class*="gdpr"]', '[id*="gdpr"]',
        '#CybotCookiebotDialog', '.cc-window',
        '#onetrust-banner-sdk', '.evidon-barrier'
    ];

    for (const selector of commonSelectors) {
        try {
            const banner = document.querySelector(selector);
            if (banner && banner.offsetParent !== null) {
                return {
                    detected: true,
                    element: banner,
                    text: banner.textContent.substring(0, 500),
                    hasRejectAll: !!banner.querySelector(
                        '[class*="reject"], [class*="decline"], [class*="refuse"], ' +
                        'button[id*="reject"], button[id*="decline"]'
                    ),
                    hasAcceptAll: !!banner.querySelector(
                        '[class*="accept"], [class*="agree"], ' +
                        'button[id*="accept"], button[id*="agree"]'
                    ),
                    hasCustomize: !!banner.querySelector(
                        '[class*="settings"], [class*="preferences"], [class*="customize"], ' +
                        '[class*="manage"], button[id*="settings"], button[id*="preferences"]'
                    )
                };
            }
        } catch { /* selector error, skip */ }
    }

    return { detected: false };
}

/**
 * Cookie analysis (inline — can't use ES module imports in content scripts)
 */
function analyzeCookiesInline() {
    const cookies = [];
    const cookieString = document.cookie;
    if (!cookieString) return cookies;

    const cookiePairs = cookieString.split(';');
    for (const pair of cookiePairs) {
        const [name, value] = pair.trim().split('=');
        if (name) {
            cookies.push({
                name: name.trim(),
                value: value || '',
                category: categorizeCookieInline(name),
                isThirdParty: isThirdPartyCookieInline(name)
            });
        }
    }
    return cookies;
}

function analyzeLocalStorageInline() {
    const items = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            items.push({ key, size: new Blob([value]).size });
        }
    } catch { /* Access denied */ }

    return {
        count: items.length,
        totalSize: items.reduce((acc, item) => acc + item.size, 0)
    };
}

function analyzeSessionStorageInline() {
    const items = [];
    try {
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            const value = sessionStorage.getItem(key);
            items.push({ key, size: new Blob([value]).size });
        }
    } catch { /* Access denied */ }

    return {
        count: items.length,
        totalSize: items.reduce((acc, item) => acc + item.size, 0)
    };
}

function detectTrackersInline() {
    const trackers = [];
    const knownTrackerDomains = [
        'google-analytics.com', 'googletagmanager.com', 'facebook.com/tr',
        'doubleclick.net', 'hotjar.com', 'mixpanel.com', 'segment.io',
        'amplitude.com', 'clarity.ms', 'newrelic.com', 'sentry.io',
        'hubspot.com', 'intercom.io', 'crisp.chat', 'tawk.to',
        'linkedin.com/px', 'pinterest.com/ct', 'snapchat.com/scevent',
        'tiktok.com/i18n'
    ];

    document.querySelectorAll('script[src]').forEach(script => {
        knownTrackerDomains.forEach(domain => {
            if (script.src.includes(domain)) {
                trackers.push({ type: 'script', url: script.src, domain });
            }
        });
    });

    // Also check tracking pixels
    document.querySelectorAll('img[src]').forEach(img => {
        if (img.width <= 2 && img.height <= 2) {
            knownTrackerDomains.forEach(domain => {
                if (img.src.includes(domain)) {
                    trackers.push({ type: 'pixel', url: img.src, domain });
                }
            });
        }
    });

    return trackers;
}

function categorizeCookieInline(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('session') || nameLower.includes('csrf') ||
        nameLower.includes('auth') || nameLower.includes('token') ||
        nameLower.includes('xsrf') || nameLower.includes('login')) {
        return 'essential';
    }
    if (nameLower.includes('_ga') || nameLower.includes('analytics') ||
        nameLower.includes('_gid') || nameLower.includes('_gat') ||
        nameLower.includes('hotjar') || nameLower.includes('_hjid')) {
        return 'analytics';
    }
    if (nameLower.includes('_fb') || nameLower.includes('ads') ||
        nameLower.includes('marketing') || nameLower.includes('_gcl') ||
        nameLower.includes('doubleclick') || nameLower.includes('_pin') ||
        nameLower.includes('_ttp') || nameLower.includes('linkedin')) {
        return 'marketing';
    }
    if (nameLower.includes('pref') || nameLower.includes('lang') ||
        nameLower.includes('theme') || nameLower.includes('locale') ||
        nameLower.includes('timezone')) {
        return 'functional';
    }
    return 'unknown';
}

function isThirdPartyCookieInline(name) {
    const thirdPartyIndicators = [
        '_ga', '_gid', '_fb', '__utm', 'doubleclick', '_gcl',
        '_pin', '_ttp', '_li_', 'hubspot', 'intercom', '_hjid'
    ];
    return thirdPartyIndicators.some(indicator => name.toLowerCase().includes(indicator));
}

async function handleCookieAnalysisRequest(sendResponse) {
    try {
        const consentBanner = detectConsentBanners();

        const cookieData = {
            cookies: analyzeCookiesInline(),
            localStorage: analyzeLocalStorageInline(),
            sessionStorage: analyzeSessionStorageInline(),
            trackers: detectTrackersInline(),
            consentBanner
        };

        sendResponse({
            success: true,
            cookieData
        });

    } catch (error) {
        console.error('[Privacy Guard] Cookie analysis error:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

/**
 * Observe DOM changes (for SPAs)
 */
function observeDOMChanges() {
    let timeoutId;
    const observer = new MutationObserver(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            if (!pageAnalyzed) {
                runDetection();
            }
        }, 500);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// ===== Initialize =====
initialize();

if (document.body) {
    observeDOMChanges();
}

window.addEventListener('load', () => {
    setTimeout(() => {
        const consentBanner = detectConsentBanners();
        if (consentBanner.detected) {
            chrome.runtime.sendMessage({
                type: 'CONSENT_BANNER_DETECTED',
                banner: {
                    text: consentBanner.text,
                    hasRejectAll: consentBanner.hasRejectAll,
                    hasAcceptAll: consentBanner.hasAcceptAll,
                    hasCustomize: consentBanner.hasCustomize
                }
            }).catch(() => { });
        }
    }, 1000);
});

console.log('[Privacy Guard] Content script v2 loaded');
