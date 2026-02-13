/**
 * Privacy Guard - Page Detector
 * Détecte automatiquement les pages légales (privacy policy, T&C, etc.)
 */

import { LEGAL_PAGE_PATTERNS } from '../utils/constants.js';

export class PageDetector {
    constructor() {
        this.patterns = LEGAL_PAGE_PATTERNS;
    }

    /**
     * Détecte si la page actuelle est une page légale
     * @returns {Object} Résultat de détection
     */
    detectLegalPage() {
        const detection = {
            isLegalPage: false,
            pageType: null,
            confidence: 0,
            detectionMethod: [],
            metadata: {}
        };

        // Vérification de l'URL
        const urlDetection = this.checkURL(window.location.href);
        if (urlDetection.detected) {
            detection.isLegalPage = true;
            detection.pageType = urlDetection.type;
            detection.confidence += 0.4;
            detection.detectionMethod.push('URL');
        }

        // Vérification du titre de la page
        const titleDetection = this.checkTitle(document.title);
        if (titleDetection.detected) {
            detection.isLegalPage = true;
            detection.pageType = detection.pageType || titleDetection.type;
            detection.confidence += 0.3;
            detection.detectionMethod.push('Title');
        }

        // Vérification des liens dans le footer/header
        const linkDetection = this.checkLinks();
        if (linkDetection.detected) {
            detection.isLegalPage = true;
            detection.pageType = detection.pageType || linkDetection.type;
            detection.confidence += 0.2;
            detection.detectionMethod.push('Links');
            detection.metadata.easyToFind = true;
        }

        // Vérification du contenu de la page
        const contentDetection = this.checkContent();
        if (contentDetection.detected) {
            detection.isLegalPage = true;
            detection.pageType = detection.pageType || contentDetection.type;
            detection.confidence += 0.1;
            detection.detectionMethod.push('Content');
        }

        // Métadonnées supplémentaires
        detection.metadata = {
            ...detection.metadata,
            ...this.extractMetadata()
        };

        return detection;
    }

    /**
     * Vérifie l'URL de la page
     * @param {string} url - URL à vérifier
     * @returns {Object} Résultat
     */
    checkURL(url) {
        const lowerUrl = url.toLowerCase();

        for (const pattern of this.patterns.URL_PATTERNS) {
            if (pattern.test(lowerUrl)) {
                return {
                    detected: true,
                    type: this.determineTypeFromPattern(pattern)
                };
            }
        }

        return { detected: false };
    }

    /**
     * Vérifie le titre de la page
     * @param {string} title - Titre de la page
     * @returns {Object} Résultat
     */
    checkTitle(title) {
        const lowerTitle = title.toLowerCase();

        for (const keyword of this.patterns.TITLE_KEYWORDS) {
            if (lowerTitle.includes(keyword.toLowerCase())) {
                return {
                    detected: true,
                    type: this.determineTypeFromKeyword(keyword)
                };
            }
        }

        return { detected: false };
    }

    /**
     * Vérifie les liens dans le footer/header
     * @returns {Object} Résultat
     */
    checkLinks() {
        // Recherche dans le footer
        const footer = document.querySelector('footer, .footer, [role="contentinfo"]');

        // Recherche dans le header
        const header = document.querySelector('header, .header, [role="banner"]');

        const searchAreas = [footer, header].filter(Boolean);

        for (const area of searchAreas) {
            const links = area.querySelectorAll('a');

            for (const link of links) {
                const linkText = link.textContent.toLowerCase();
                const linkHref = (link.getAttribute('href') || '').toLowerCase();

                for (const pattern of this.patterns.LINK_TEXT_PATTERNS) {
                    if (pattern.test(linkText) || pattern.test(linkHref)) {
                        return {
                            detected: true,
                            type: this.determineTypeFromPattern(pattern)
                        };
                    }
                }
            }
        }

        return { detected: false };
    }

    /**
     * Vérifie le contenu de la page
     * @returns {Object} Résultat
     */
    checkContent() {
        const bodyText = document.body.textContent.toLowerCase().substring(0, 3000);

        // Recherche de mots-clés spécifiques
        const privacyKeywords = ['personal data', 'privacy policy', 'données personnelles', 'we collect'];
        const termsKeywords = ['terms of service', 'terms and conditions', 'conditions générales'];
        const cookieKeywords = ['cookies', 'cookie policy', 'tracking'];

        let matchCount = 0;
        let type = null;

        for (const keyword of privacyKeywords) {
            if (bodyText.includes(keyword)) {
                matchCount++;
                type = 'privacy';
            }
        }

        for (const keyword of termsKeywords) {
            if (bodyText.includes(keyword)) {
                matchCount++;
                type = type || 'terms';
            }
        }

        for (const keyword of cookieKeywords) {
            if (bodyText.includes(keyword)) {
                matchCount++;
                type = type || 'cookies';
            }
        }

        return {
            detected: matchCount >= 3,
            type
        };
    }

    /**
     * Extrait les métadonnées de la page
     * @returns {Object} Métadonnées
     */
    extractMetadata() {
        const metadata = {
            url: window.location.href,
            title: document.title,
            lastUpdated: this.findLastUpdated(),
            hasContactInfo: this.hasContactInfo(),
            wordCount: this.estimateWordCount(),
            language: document.documentElement.lang || 'en'
        };

        return metadata;
    }

    /**
     * Recherche la date de dernière mise à jour
     * @returns {string|null} Date trouvée
     */
    findLastUpdated() {
        // Recherche de patterns courants
        const patterns = [
            /last updated:?\s*([a-z0-9\s,.-]+)/i,
            /updated on:?\s*([a-z0-9\s,.-]+)/i,
            /effective date:?\s*([a-z0-9\s,.-]+)/i,
            /dernière mise à jour:?\s*([a-z0-9\s,.-]+)/i,
            /modifié le:?\s*([a-z0-9\s,.-]+)/i
        ];

        const bodyText = document.body.textContent;

        for (const pattern of patterns) {
            const match = bodyText.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        // Recherche dans les métadonnées
        const metaDate = document.querySelector('meta[property="article:modified_time"], meta[name="last-modified"]');
        if (metaDate) {
            return metaDate.getAttribute('content');
        }

        return null;
    }

    /**
     * Vérifie la présence d'informations de contact
     * @returns {boolean} True si trouvé
     */
    hasContactInfo() {
        const bodyText = document.body.textContent.toLowerCase();

        // Patterns d'email et téléphone
        const hasEmail = /@[a-z0-9.-]+\.[a-z]{2,}/i.test(bodyText);
        const hasPhone = /\+?\d{1,3}[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(bodyText);
        const hasContactKeyword = /contact us|contact@|support@|privacy@|dpo@/i.test(bodyText);

        return hasEmail || hasPhone || hasContactKeyword;
    }

    /**
     * Estime le nombre de mots dans la page
     * @returns {number} Nombre de mots
     */
    estimateWordCount() {
        // Récupère le contenu principal (exclut header, footer, navigation)
        const mainContent = document.querySelector('main, article, .content, [role="main"]') || document.body;

        const text = mainContent.textContent.trim();
        const words = text.split(/\s+/).filter(word => word.length > 0);

        return words.length;
    }

    /**
     * Détermine le type de page à partir d'un pattern
     * @param {RegExp} pattern - Pattern regex
     * @returns {string} Type de page
     */
    determineTypeFromPattern(pattern) {
        const patternStr = pattern.toString().toLowerCase();

        if (patternStr.includes('privacy')) return 'privacy';
        if (patternStr.includes('terms')) return 'terms';
        if (patternStr.includes('cookie')) return 'cookies';
        if (patternStr.includes('gdpr') || patternStr.includes('rgpd')) return 'gdpr';

        return 'legal';
    }

    /**
     * Détermine le type de page à partir d'un mot-clé
     * @param {string} keyword - Mot-clé
     * @returns {string} Type de page
     */
    determineTypeFromKeyword(keyword) {
        const lowerKeyword = keyword.toLowerCase();

        if (lowerKeyword.includes('privacy') || lowerKeyword.includes('confidentialité')) return 'privacy';
        if (lowerKeyword.includes('terms') || lowerKeyword.includes('conditions')) return 'terms';
        if (lowerKeyword.includes('cookie')) return 'cookies';
        if (lowerKeyword.includes('gdpr') || lowerKeyword.includes('rgpd')) return 'gdpr';

        return 'legal';
    }

    /**
     * Extrait le contenu textuel de la page pour l'analyse
     * @returns {string} Contenu textuel
     */
    extractContent() {
        // Priorité au contenu principal
        const mainContent = document.querySelector('main, article, .content, [role="main"]');

        if (mainContent) {
            return this.cleanExtractedText(mainContent.textContent);
        }

        // Sinon, utilise le body en excluant header/footer/nav
        const body = document.body.cloneNode(true);

        // Suppression des éléments non pertinents
        const removeSelectors = ['header', 'footer', 'nav', 'aside', '.navigation', '.menu', 'script', 'style'];
        removeSelectors.forEach(selector => {
            body.querySelectorAll(selector).forEach(el => el.remove());
        });

        return this.cleanExtractedText(body.textContent);
    }

    /**
     * Nettoie le texte extrait
     * @param {string} text - Texte à nettoyer
     * @returns {string} Texte nettoyé
     */
    cleanExtractedText(text) {
        return text
            .replace(/\s+/g, ' ')
            .trim();
    }
}

// Export instance singleton
export const pageDetector = new PageDetector();
