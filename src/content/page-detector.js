/**
 * Privacy Guard - Page Detector v2
 * Détecte les pages légales ET découvre les liens vers les pages privacy/cookies/ToS
 * Si la page actuelle n'est pas une page légale, on cherche le lien dans le HTML
 */

(function (global) {
    'use strict';

    /**
     * Patterns for discovering privacy-related links anywhere in the page
     */
    const PRIVACY_LINK_PATTERNS = {
        // URL path patterns that indicate a privacy-related page
        URL_PATH_PATTERNS: [
            /\/privacy[-_]?(policy|notice|statement)?/i,
            /\/terms[-_]?(of[-_]?service|and[-_]?conditions|of[-_]?use)?/i,
            /\/cookie[-_]?(policy|notice|statement|preferences)?/i,
            /\/legal([-_]?notice)?/i,
            /\/gdpr/i,
            /\/rgpd/i,
            /\/data[-_]?protection/i,
            /\/politique[-_]?de[-_]?confidentialite/i,
            /\/conditions[-_]?generales/i,
            /\/mentions[-_]?legales/i,
            /\/datenschutz/i,
            /\/impressum/i,
            /\/privacidad/i,
            /\/informativa[-_]?privacy/i
        ],

        // Link text patterns (what the link says)
        LINK_TEXT_PATTERNS: [
            /privacy\s*policy/i,
            /privacy\s*notice/i,
            /privacy\s*statement/i,
            /cookie\s*policy/i,
            /cookie\s*notice/i,
            /cookie\s*preferences/i,
            /terms\s*(of\s*service|and\s*conditions|of\s*use)/i,
            /terms\s*&\s*conditions/i,
            /legal\s*notice/i,
            /data\s*protection/i,
            /gdpr/i,
            /rgpd/i,
            /politique\s*de\s*confidentialit[ée]/i,
            /conditions\s*g[ée]n[ée]rales/i,
            /mentions\s*l[ée]gales/i,
            /politique\s*(des?\s*)?cookies?/i,
            /datenschutz/i,
            /nutzungsbedingungen/i,
            /informativa\s*sulla\s*privacy/i,
            /pol[ií]tica\s*de\s*privacidad/i
        ],

        // Categories to classify discovered links
        CATEGORIES: {
            PRIVACY_POLICY: {
                urlPatterns: [/privacy/i, /confidentialit/i, /datenschutz/i, /privacidad/i],
                textPatterns: [/privacy/i, /confidentialit/i, /datenschutz/i, /privacidad/i]
            },
            COOKIE_POLICY: {
                urlPatterns: [/cookie/i],
                textPatterns: [/cookie/i]
            },
            TERMS_OF_SERVICE: {
                urlPatterns: [/terms/i, /conditions/i, /nutzung/i],
                textPatterns: [/terms/i, /conditions/i, /nutzung/i]
            },
            LEGAL_NOTICE: {
                urlPatterns: [/legal/i, /mentions/i, /impressum/i],
                textPatterns: [/legal/i, /mentions/i, /impressum/i]
            },
            GDPR: {
                urlPatterns: [/gdpr/i, /rgpd/i, /data[-_]?protection/i],
                textPatterns: [/gdpr/i, /rgpd/i, /data\s*protection/i]
            }
        }
    };

    class PageDetector {
        constructor() {
            this.patterns = global.LEGAL_PAGE_PATTERNS;
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
                metadata: {},
                discoveredLinks: []
            };

            // 1. Check if THIS page is a privacy/legal page
            const urlDetection = this.checkURL(window.location.href);
            if (urlDetection.detected) {
                detection.isLegalPage = true;
                detection.pageType = urlDetection.type;
                detection.confidence += 0.4;
                detection.detectionMethod.push('URL');
            }

            const titleDetection = this.checkTitle(document.title);
            if (titleDetection.detected) {
                detection.isLegalPage = true;
                detection.pageType = detection.pageType || titleDetection.type;
                detection.confidence += 0.3;
                detection.detectionMethod.push('Title');
            }

            const contentDetection = this.checkContent();
            if (contentDetection.detected) {
                detection.isLegalPage = true;
                detection.pageType = detection.pageType || contentDetection.type;
                detection.confidence += 0.2;
                detection.detectionMethod.push('Content');
            }

            // 2. ALWAYS discover privacy-related links on the page
            // This is crucial: even if we're on a privacy page, we want to find
            // links to cookie policy, ToS, etc.
            detection.discoveredLinks = this.discoverPrivacyLinks();

            // 3. Check if links are easy to find (footer/header)
            const linkDetection = this.checkLinks();
            if (linkDetection.detected) {
                detection.metadata.easyToFind = true;
                if (!detection.isLegalPage) {
                    detection.pageType = linkDetection.type;
                }
                detection.detectionMethod.push('Links');
            }

            // 4. Extract metadata
            detection.metadata = {
                ...detection.metadata,
                ...this.extractMetadata(),
                discoveredLinksCount: detection.discoveredLinks.length
            };

            return detection;
        }

        /**
         * Discovers all privacy-related links on the page
         * Scans ALL <a> tags, not just footer/header
         * @returns {Array<Object>} Array of discovered privacy link objects
         */
        discoverPrivacyLinks() {
            const links = document.querySelectorAll('a[href]');
            const discoveredMap = new Map(); // Use map to deduplicate by URL
            const currentOrigin = window.location.origin;

            for (const link of links) {
                const href = link.getAttribute('href');
                if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:')) {
                    continue;
                }

                // Resolve relative URLs
                let fullUrl;
                try {
                    fullUrl = new URL(href, window.location.href).href;
                } catch {
                    continue;
                }

                const linkText = (link.textContent || '').trim();
                const linkTitle = link.getAttribute('title') || '';
                const linkAriaLabel = link.getAttribute('aria-label') || '';
                const combinedText = `${linkText} ${linkTitle} ${linkAriaLabel}`;

                // Check if URL path matches privacy patterns
                let matchedByUrl = false;
                let matchedByText = false;

                for (const pattern of PRIVACY_LINK_PATTERNS.URL_PATH_PATTERNS) {
                    if (pattern.test(fullUrl)) {
                        matchedByUrl = true;
                        break;
                    }
                }

                for (const pattern of PRIVACY_LINK_PATTERNS.LINK_TEXT_PATTERNS) {
                    if (pattern.test(combinedText)) {
                        matchedByText = true;
                        break;
                    }
                }

                if (matchedByUrl || matchedByText) {
                    // Classify the link
                    const category = this.classifyPrivacyLink(fullUrl, combinedText);
                    const isSameOrigin = fullUrl.startsWith(currentOrigin);

                    // Don't add if it's the current page
                    if (fullUrl === window.location.href) continue;

                    // Deduplicate: keep the one with highest confidence
                    const existing = discoveredMap.get(fullUrl);
                    const confidence = (matchedByUrl && matchedByText) ? 1.0 :
                        matchedByUrl ? 0.7 : 0.5;

                    if (!existing || existing.confidence < confidence) {
                        discoveredMap.set(fullUrl, {
                            url: fullUrl,
                            text: linkText.substring(0, 100),
                            category,
                            confidence,
                            matchedByUrl,
                            matchedByText,
                            isSameOrigin
                        });
                    }
                }
            }

            // Sort by confidence (highest first), then by category importance
            const categoryPriority = {
                'PRIVACY_POLICY': 1,
                'COOKIE_POLICY': 2,
                'TERMS_OF_SERVICE': 3,
                'GDPR': 4,
                'LEGAL_NOTICE': 5,
                'UNKNOWN': 6
            };

            return Array.from(discoveredMap.values())
                .sort((a, b) => {
                    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
                    return (categoryPriority[a.category] || 99) - (categoryPriority[b.category] || 99);
                });
        }

        /**
         * Classify a privacy link into a category
         * @param {string} url - Full URL
         * @param {string} text - Link text
         * @returns {string} Category name
         */
        classifyPrivacyLink(url, text) {
            for (const [category, config] of Object.entries(PRIVACY_LINK_PATTERNS.CATEGORIES)) {
                for (const pattern of config.urlPatterns) {
                    if (pattern.test(url)) return category;
                }
                for (const pattern of config.textPatterns) {
                    if (pattern.test(text)) return category;
                }
            }
            return 'UNKNOWN';
        }

        /**
         * Vérifie l'URL de la page
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
         */
        checkLinks() {
            const footer = document.querySelector('footer, .footer, [role="contentinfo"]');
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
         * Vérifie le contenu de la page (stricter: needs many keywords to qualify)
         */
        checkContent() {
            const bodyText = document.body.textContent.toLowerCase().substring(0, 5000);

            const privacyKeywords = [
                'personal data', 'privacy policy', 'données personnelles',
                'we collect', 'data controller', 'data processor',
                'processing of personal', 'traitement des données'
            ];
            const termsKeywords = [
                'terms of service', 'terms and conditions', 'conditions générales',
                'terms of use', 'binding agreement', 'user agreement'
            ];
            const cookieKeywords = [
                'cookie policy', 'we use cookies', 'tracking technologies',
                'politique de cookies', 'types of cookies', 'essential cookies'
            ];

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

            // Require at least 3 keyword matches to consider it a legal page
            return {
                detected: matchCount >= 3,
                type
            };
        }

        /**
         * Extrait les métadonnées de la page
         */
        extractMetadata() {
            return {
                url: window.location.href,
                title: document.title,
                lastUpdated: this.findLastUpdated(),
                hasContactInfo: this.hasContactInfo(),
                wordCount: this.estimateWordCount(),
                language: document.documentElement.lang || 'en'
            };
        }

        /**
         * Recherche la date de dernière mise à jour
         */
        findLastUpdated() {
            const patterns = [
                /last updated:?\s*([a-z0-9\s,.-]+)/i,
                /updated on:?\s*([a-z0-9\s,.-]+)/i,
                /effective date:?\s*([a-z0-9\s,.-]+)/i,
                /effective:?\s*([a-z0-9\s,.-]+)/i,
                /dernière mise à jour:?\s*([a-z0-9\s,.-]+)/i,
                /modifié le:?\s*([a-z0-9\s,.-]+)/i,
                /date:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
            ];

            const bodyText = document.body.textContent;

            for (const pattern of patterns) {
                const match = bodyText.match(pattern);
                if (match) {
                    return match[1].trim();
                }
            }

            const metaDate = document.querySelector(
                'meta[property="article:modified_time"], meta[name="last-modified"]'
            );
            if (metaDate) {
                return metaDate.getAttribute('content');
            }

            return null;
        }

        /**
         * Vérifie la présence d'informations de contact
         */
        hasContactInfo() {
            const bodyText = document.body.textContent.toLowerCase();
            const hasEmail = /@[a-z0-9.-]+\.[a-z]{2,}/i.test(bodyText);
            const hasPhone = /\+?\d{1,3}[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(bodyText);
            const hasContactKeyword = /contact us|contact@|support@|privacy@|dpo@|data protection officer/i.test(bodyText);

            return hasEmail || hasPhone || hasContactKeyword;
        }

        /**
         * Estime le nombre de mots dans la page
         */
        estimateWordCount() {
            const mainContent = document.querySelector('main, article, .content, [role="main"]') || document.body;
            const text = mainContent.textContent.trim();
            const words = text.split(/\s+/).filter(word => word.length > 0);
            return words.length;
        }

        /**
         * Détermine le type de page à partir d'un pattern
         */
        determineTypeFromPattern(pattern) {
            const patternStr = pattern.toString().toLowerCase();
            if (patternStr.includes('privacy') || patternStr.includes('confidentialit')) return 'privacy';
            if (patternStr.includes('terms') || patternStr.includes('conditions')) return 'terms';
            if (patternStr.includes('cookie')) return 'cookies';
            if (patternStr.includes('gdpr') || patternStr.includes('rgpd')) return 'gdpr';
            return 'legal';
        }

        /**
         * Détermine le type de page à partir d'un mot-clé
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
         */
        extractContent() {
            const mainContent = document.querySelector('main, article, .content, [role="main"]');

            if (mainContent) {
                return this.cleanExtractedText(mainContent.textContent);
            }

            const body = document.body.cloneNode(true);
            const removeSelectors = ['header', 'footer', 'nav', 'aside', '.navigation', '.menu', 'script', 'style'];
            removeSelectors.forEach(selector => {
                body.querySelectorAll(selector).forEach(el => el.remove());
            });

            return this.cleanExtractedText(body.textContent);
        }

        /**
         * Nettoie le texte extrait
         */
        cleanExtractedText(text) {
            return text
                .replace(/\s+/g, ' ')
                .trim();
        }
    }

    // Export class and instance singleton to global scope
    global.PageDetector = PageDetector;
    global.pageDetector = new PageDetector();

})(typeof window !== 'undefined' ? window : this);
