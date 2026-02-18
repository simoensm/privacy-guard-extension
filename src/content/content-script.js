/**
 * Privacy Guard - Content Script
 * Script injecté dans chaque page pour la détection et l'extraction
 */

// Use globals from constants.js and page-detector.js (loaded before this script)
const { pageDetector, MESSAGE_TYPES } = window;

// État du content script
let pageAnalyzed = false;
let detectionResult = null;

/**
 * Initialisation au chargement de la page
 */
function initialize() {
    // Attendre que le DOM soit complètement chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runDetection);
    } else {
        runDetection();
    }

    // Écouter les messages du background
    chrome.runtime.onMessage.addListener(handleMessage);
}

/**
 * Exécute la détection automatique
 */
function runDetection() {
    try {
        // Détection de page légale
        detectionResult = pageDetector.detectLegalPage();

        console.log('[Privacy Guard] Page detection:', detectionResult);

        // Si c'est une page légale, notifier le background
        if (detectionResult.isLegalPage && detectionResult.confidence > 0.3) {
            notifyBackgroundOfLegalPage(detectionResult);
        }

    } catch (error) {
        console.error('[Privacy Guard] Detection error:', error);
    }
}

/**
 * Notifie le service worker qu'une page légale a été détectée
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
 * Gère les messages reçus du background/popup
 */
function handleMessage(message, sender, sendResponse) {
    switch (message.type) {
        case MESSAGE_TYPES.ANALYZE_PAGE:
            handleAnalyzeRequest(sendResponse);
            return true; // Indique une réponse asynchrone

        case 'GET_PAGE_CONTENT':
            handleContentRequest(sendResponse);
            return true;

        case 'GET_DETECTION_RESULT':
            sendResponse({ detection: detectionResult });
            return false;

        case 'ANALYZE_COOKIES':
            handleCookieAnalysisRequest(sendResponse);
            return true;

        default:
            return false;
    }
}

/**
 * Gère une demande d'analyse complète
 */
async function handleAnalyzeRequest(sendResponse) {
    try {
        // Re-détection si nécessaire
        if (!detectionResult) {
            detectionResult = pageDetector.detectLegalPage();
        }

        // Extraction du contenu
        const content = pageDetector.extractContent();

        // Envoi au background pour analyse NLP
        const response = {
            success: true,
            detection: detectionResult,
            content,
            metadata: detectionResult.metadata
        };

        sendResponse(response);
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
 * Gère une demande de contenu
 */
function handleContentRequest(sendResponse) {
    try {
        const content = pageDetector.extractContent();
        const metadata = detectionResult?.metadata || pageDetector.extractMetadata();

        sendResponse({
            success: true,
            content,
            metadata
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
 * Récupère l'ID de l'onglet actuel (si disponible)
 */
function getCurrentTabId() {
    // Dans un content script, on ne peut pas obtenir directement le tabId
    // Il sera fourni par le background script
    return null;
}

/**
 * Injecte un badge visuel sur la page (optionnel)
 */
function injectVisualBadge(detection) {
    // Vérifier si le badge n'existe pas déjà
    if (document.getElementById('privacy-guard-badge')) return;

    const badge = document.createElement('div');
    badge.id = 'privacy-guard-badge';
    badge.className = 'privacy-guard-floating-badge';

    const riskColor = detection.confidence > 0.7 ? '#37ba83' :
        detection.confidence > 0.4 ? '#f59e0b' : '#ef4444';

    badge.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      background: linear-gradient(135deg, #2a3648 0%, #202a3a 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid rgba(148, 163, 184, 0.2);
    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 40px rgba(0,0,0,0.5)';"
       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px rgba(0,0,0,0.37)';">
      
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 6V11C4 16.55 7.84 21.74 13 23C18.16 21.74 22 16.55 22 11V6L12 2Z" 
              stroke="${riskColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      
      <div>
        <div style="font-weight: 600;">Privacy Guard</div>
        <div style="font-size: 11px; color: #cbd5e1;">
          ${detection.pageType} détecté
        </div>
      </div>
    </div>
  `;

    // Clic sur le badge ouvre le popup
    badge.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
    });

    document.body.appendChild(badge);

    // Auto-masquage après 5 secondes
    setTimeout(() => {
        badge.style.transition = 'opacity 0.5s ease';
        badge.style.opacity = '0';
        setTimeout(() => badge.remove(), 500);
    }, 5000);
}

/**
 * Observe les changements DOM (pour les SPAs)
 */
function observeDOMChanges() {
    let timeoutId;

    const observer = new MutationObserver(() => {
        // Debounce: attendre 500ms après le dernier changement
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            // Re-détection si la page a changé significativement
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

/**
 * Détecte les bannières de cookies/consentement
 */
function detectConsentBanners() {
    const commonSelectors = [
        '#cookie-banner',
        '.cookie-banner',
        '[class*="cookie"]',
        '[class*="consent"]',
        '[id*="cookie"]',
        '[id*="consent"]',
        '[class*="gdpr"]',
        '[id*="gdpr"]'
    ];

    for (const selector of commonSelectors) {
        const banner = document.querySelector(selector);
        if (banner && banner.offsetParent !== null) { // Vérifie la visibilité
            return {
                detected: true,
                element: banner,
                text: banner.textContent.substring(0, 500)
            };
        }
    }

    return { detected: false };
}

/**
 * Gère une demande d'analyse des cookies
 */
async function handleCookieAnalysisRequest(sendResponse) {
    try {
        // Analyse des cookies directement dans le content script
        // (can't import cookieDetector module in content script, so we run it inline)

        const cookieData = {
            cookies: analyzeCookiesInline(),
            localStorage: analyzeLocalStorageInline(),
            sessionStorage: analyzeSessionStorageInline(),
            trackers: detectTrackersInline()
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
 * Analyse inline des cookies
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

/**
 * Analyse inline du localStorage
 */
function analyzeLocalStorageInline() {
    const items = [];

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            items.push({
                key,
                size: new Blob([value]).size
            });
        }
    } catch {
        // Access denied
    }

    return {
        count: items.length,
        totalSize: items.reduce((acc, item) => acc + item.size, 0)
    };
}

/**
 * Analyse inline du sessionStorage
 */
function analyzeSessionStorageInline() {
    const items = [];

    try {
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            const value = sessionStorage.getItem(key);
            items.push({
                key,
                size: new Blob([value]).size
            });
        }
    } catch {
        // Access denied
    }

    return {
        count: items.length,
        totalSize: items.reduce((acc, item) => acc + item.size, 0)
    };
}

/**
 * Détection inline des trackers
 */
function detectTrackersInline() {
    const trackers = [];
    const knownTrackerDomains = [
        'google-analytics.com', 'googletagmanager.com', 'facebook.com/tr',
        'doubleclick.net', 'hotjar.com', 'mixpanel.com'
    ];

    // Analyser les scripts
    document.querySelectorAll('script[src]').forEach(script => {
        knownTrackerDomains.forEach(domain => {
            if (script.src.includes(domain)) {
                trackers.push({
                    type: 'script',
                    url: script.src,
                    domain
                });
            }
        });
    });

    return trackers;
}

/**
 * Catégorisation inline des cookies
 */
function categorizeCookieInline(name) {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('session') || nameLower.includes('csrf') ||
        nameLower.includes('auth')) {
        return 'essential';
    }

    if (nameLower.includes('_ga') || nameLower.includes('analytics')) {
        return 'analytics';
    }

    if (nameLower.includes('_fb') || nameLower.includes('ads') ||
        nameLower.includes('marketing')) {
        return 'marketing';
    }

    return 'unknown';
}

/**
 * Détection inline des cookies tiers
 */
function isThirdPartyCookieInline(name) {
    const thirdPartyIndicators = ['_ga', '_gid', '_fb', '__utm', 'doubleclick'];
    return thirdPartyIndicators.some(indicator => name.toLowerCase().includes(indicator));
}


// Initialisation
initialize();

// Observer les changements (utile pour les SPAs)
if (document.body) {
    observeDOMChanges();
}

// Détecter les bannières de cookies
window.addEventListener('load', () => {
    setTimeout(() => {
        const consentBanner = detectConsentBanners();
        if (consentBanner.detected) {
            chrome.runtime.sendMessage({
                type: 'CONSENT_BANNER_DETECTED',
                banner: {
                    text: consentBanner.text
                }
            }).catch(() => { });
        }
    }, 1000);
});

console.log('[Privacy Guard] Content script loaded');
