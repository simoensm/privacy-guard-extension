/**
 * Privacy Guard - Content Script
 * Script injecté dans chaque page pour la détection et l'extraction
 */

import { pageDetector } from './page-detector.js';
import { MESSAGE_TYPES } from '../utils/constants.js';

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

    const riskColor = detection.confidence > 0.7 ? '#22c55e' :
        detection.confidence > 0.4 ? '#f59e0b' : '#ef4444';

    badge.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
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
