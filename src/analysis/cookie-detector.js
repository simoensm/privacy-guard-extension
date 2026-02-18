/**
 * Privacy Guard - Cookie & Tracking Detector
 * Détecte et analyse tous les cookies et mécanismes de tracking
 */

import { UI_CONFIG } from '../utils/constants.js';

/**
 * Classe de détection des cookies et trackers
 */
class CookieDetector {
    constructor() {
        this.trackers = [];
        this.cookieCategories = {
            essential: [],
            analytics: [],
            marketing: [],
            functional: [],
            unknown: []
        };
    }

    /**
     * Analyse complète des cookies et du tracking
     * @returns {Object} Résultats de l'analyse
     */
    async analyzeAll() {
        const results = {
            cookies: await this.detectCookies(),
            localStorage: this.detectLocalStorage(),
            sessionStorage: this.detectSessionStorage(),
            trackers: await this.detectTrackers(),
            fingerprinting: this.detectFingerprinting(),
            summary: null
        };

        results.summary = this.generateSummary(results);
        return results;
    }

    /**
     * Détecte et analyse tous les cookies
     * @returns {Array} Liste des cookies avec métadonnées
     */
    async detectCookies() {
        const cookies = [];
        const cookieString = document.cookie;

        if (!cookieString) {
            return cookies;
        }

        // Parse les cookies
        const cookiePairs = cookieString.split(';');

        for (const pair of cookiePairs) {
            const [name, value] = pair.trim().split('=');

            if (name) {
                const cookieInfo = {
                    name: name.trim(),
                    value: value || '',
                    category: this.categorizeCookie(name),
                    purpose: this.identifyCookiePurpose(name),
                    isThirdParty: this.isThirdPartyCookie(name),
                    dataCollected: this.analyzeDataCollected(name, value),
                    expires: 'Session', // Browser extensions can't access full cookie details
                    secure: false,
                    httpOnly: false,
                    sameSite: 'None'
                };

                cookies.push(cookieInfo);

                // Ajouter à la catégorie appropriée
                this.cookieCategories[cookieInfo.category].push(cookieInfo);
            }
        }

        return cookies;
    }

    /**
     * Détecte le stockage local
     * @returns {Object} Informations sur localStorage
     */
    detectLocalStorage() {
        const items = [];

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);

                items.push({
                    key,
                    size: new Blob([value]).size,
                    type: this.identifyStorageType(key, value),
                    potentialPII: this.detectPII(value)
                });
            }
        } catch (error) {
            console.warn('[Cookie Detector] localStorage access denied:', error);
        }

        return {
            count: items.length,
            totalSize: items.reduce((acc, item) => acc + item.size, 0),
            items: items.slice(0, 50), // Limit to 50 items
            hasPII: items.some(item => item.potentialPII)
        };
    }

    /**
     * Détecte le stockage de session
     * @returns {Object} Informations sur sessionStorage
     */
    detectSessionStorage() {
        const items = [];

        try {
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                const value = sessionStorage.getItem(key);

                items.push({
                    key,
                    size: new Blob([value]).size,
                    type: this.identifyStorageType(key, value),
                    potentialPII: this.detectPII(value)
                });
            }
        } catch (error) {
            console.warn('[Cookie Detector] sessionStorage access denied:', error);
        }

        return {
            count: items.length,
            totalSize: items.reduce((acc, item) => acc + item.size, 0),
            items: items.slice(0, 50),
            hasPII: items.some(item => item.potentialPII)
        };
    }

    /**
     * Détecte les trackers tiers
     * @returns {Array} Liste des trackers détectés
     */
    async detectTrackers() {
        const trackers = [];
        const knownTrackers = this.getKnownTrackers();

        // Analyser les scripts chargés
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            const src = script.src;
            const tracker = this.identifyTracker(src, knownTrackers);

            if (tracker) {
                trackers.push({
                    type: 'script',
                    url: src,
                    name: tracker.name,
                    category: tracker.category,
                    description: tracker.description
                });
            }
        });

        // Analyser les iframes
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            const src = iframe.src;
            const tracker = this.identifyTracker(src, knownTrackers);

            if (tracker) {
                trackers.push({
                    type: 'iframe',
                    url: src,
                    name: tracker.name,
                    category: tracker.category,
                    description: tracker.description
                });
            }
        });

        // Analyser les images de tracking (pixels)
        const images = document.querySelectorAll('img[src*="track"], img[src*="pixel"], img[height="1"][width="1"]');
        images.forEach(img => {
            trackers.push({
                type: 'pixel',
                url: img.src,
                name: 'Tracking Pixel',
                category: 'marketing',
                description: 'Image de tracking 1x1 pixel'
            });
        });

        return trackers;
    }

    /**
     * Détecte les techniques de fingerprinting
     * @returns {Object} Techniques de fingerprinting détectées
     */
    detectFingerprinting() {
        const techniques = {
            canvas: this.detectCanvasFingerprinting(),
            webgl: this.detectWebGLFingerprinting(),
            audio: this.detectAudioFingerprinting(),
            fonts: this.detectFontFingerprinting(),
            battery: this.detectBatteryAPI(),
            summary: []
        };

        // Générer un résumé
        Object.keys(techniques).forEach(key => {
            if (key !== 'summary' && techniques[key].detected) {
                techniques.summary.push(techniques[key].description);
            }
        });

        return techniques;
    }

    /**
     * Catégorise un cookie
     * @param {string} name - Nom du cookie
     * @returns {string} Catégorie
     */
    categorizeCookie(name) {
        const nameLower = name.toLowerCase();

        // Cookies essentiels
        if (nameLower.includes('session') || nameLower.includes('csrf') ||
            nameLower.includes('auth') || nameLower.includes('security')) {
            return 'essential';
        }

        // Cookies analytics
        if (nameLower.includes('_ga') || nameLower.includes('_gid') ||
            nameLower.includes('analytics') || nameLower.includes('utm')) {
            return 'analytics';
        }

        // Cookies marketing
        if (nameLower.includes('_fb') || nameLower.includes('ads') ||
            nameLower.includes('marketing') || nameLower.includes('pixel') ||
            nameLower.includes('doubleclick') || nameLower.includes('bid')) {
            return 'marketing';
        }

        // Cookies fonctionnels
        if (nameLower.includes('pref') || nameLower.includes('lang') ||
            nameLower.includes('theme') || nameLower.includes('ui')) {
            return 'functional';
        }

        return 'unknown';
    }

    /**
     * Identifie le but d'un cookie
     * @param {string} name - Nom du cookie
     * @returns {string} Description du but
     */
    identifyCookiePurpose(name) {
        const nameLower = name.toLowerCase();
        const purposes = {
            '_ga': 'Google Analytics - Tracking utilisateur',
            '_gid': 'Google Analytics - Identification session',
            '_fbp': 'Facebook Pixel - Publicité ciblée',
            'session': 'Gestion de session utilisateur',
            'csrf': 'Protection contre les attaques CSRF',
            'auth': 'Authentification utilisateur',
            'consent': 'Préférences de consentement cookies',
            'language': 'Préférence de langue',
            'theme': 'Préférence de thème/apparence'
        };

        for (const [key, purpose] of Object.entries(purposes)) {
            if (nameLower.includes(key)) {
                return purpose;
            }
        }

        return 'Usage non identifié';
    }

    /**
     * Détermine si un cookie est tiers
     * @param {string} name - Nom du cookie
     * @returns {boolean}
     */
    isThirdPartyCookie(name) {
        const thirdPartyIndicators = ['_ga', '_gid', '_fb', '__utm', 'doubleclick', 'ads'];
        return thirdPartyIndicators.some(indicator => name.toLowerCase().includes(indicator));
    }

    /**
     * Analyse les données collectées par un cookie
     * @param {string} name - Nom du cookie
     * @param {string} value - Valeur du cookie
     * @returns {Array} Types de données collectées
     */
    analyzeDataCollected(name, value) {
        const dataTypes = [];
        const nameLower = name.toLowerCase();

        if (nameLower.includes('id') || nameLower.includes('user')) {
            dataTypes.push('Identifiant utilisateur');
        }

        if (nameLower.includes('session')) {
            dataTypes.push('Session de navigation');
        }

        if (nameLower.includes('analytics') || nameLower.includes('_ga')) {
            dataTypes.push('Comportement de navigation', 'Pages visitées', 'Durée de visite');
        }

        if (nameLower.includes('ads') || nameLower.includes('marketing')) {
            dataTypes.push('Intérêts publicitaires', 'Profil démographique');
        }

        // Analyser la valeur pour détecter des patterns
        if (value) {
            if (value.match(/\d{10,}/)) dataTypes.push('Timestamp');
            if (value.match(/[a-f0-9]{32,}/i)) dataTypes.push('Hash/Token');
        }

        return dataTypes.length > 0 ? dataTypes : ['Données non identifiées'];
    }

    /**
     * Détecte les informations personnelles
     * @param {string} value - Valeur à analyser
     * @returns {boolean}
     */
    detectPII(value) {
        if (!value) return false;

        const piiPatterns = [
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
            /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
            /\b\d{3}-\d{2}-\d{4}\b/, // SSN
            /\b(?:\d{4}[-\s]?){3}\d{4}\b/ // Credit card
        ];

        return piiPatterns.some(pattern => pattern.test(value));
    }

    /**
     * Identifie le type de stockage
     * @param {string} key - Clé de stockage
     * @param {string} value - Valeur stockée
     * @returns {string}
     */
    identifyStorageType(key, value) {
        try {
            JSON.parse(value);
            return 'JSON Object';
        } catch {
            if (value.match(/^[a-f0-9]{32,}$/i)) return 'Token/Hash';
            if (value.match(/^\d+$/)) return 'Number';
            if (value.match(/^(true|false)$/i)) return 'Boolean';
            return 'String';
        }
    }

    /**
     * Obtient la liste des trackers connus
     * @returns {Array}
     */
    getKnownTrackers() {
        return [
            { pattern: 'google-analytics.com', name: 'Google Analytics', category: 'analytics', description: 'Analyse de trafic web' },
            { pattern: 'googletagmanager.com', name: 'Google Tag Manager', category: 'analytics', description: 'Gestionnaire de tags' },
            { pattern: 'facebook.com/tr', name: 'Facebook Pixel', category: 'marketing', description: 'Publicité ciblée Facebook' },
            { pattern: 'doubleclick.net', name: 'DoubleClick', category: 'marketing', description: 'Publicité Google' },
            { pattern: 'hotjar.com', name: 'Hotjar', category: 'analytics', description: 'Analyse comportementale' },
            { pattern: 'mixpanel.com', name: 'Mixpanel', category: 'analytics', description: 'Analytics produit' },
            { pattern: 'segment.com', name: 'Segment', category: 'analytics', description: 'Plateforme de données' },
            { pattern: 'amplitude.com', name: 'Amplitude', category: 'analytics', description: 'Analytics produit' },
            { pattern: 'clarity.ms', name: 'Microsoft Clarity', category: 'analytics', description: 'Analyse comportementale' }
        ];
    }

    /**
     * Identifie un tracker dans une URL
     * @param {string} url - URL à analyser
     * @param {Array} knownTrackers - Liste des trackers connus
     * @returns {Object|null}
     */
    identifyTracker(url, knownTrackers) {
        for (const tracker of knownTrackers) {
            if (url.includes(tracker.pattern)) {
                return tracker;
            }
        }
        return null;
    }

    /**
     * Détecte le fingerprinting Canvas
     * @returns {Object}
     */
    detectCanvasFingerprinting() {
        // Détection basée sur l'override du toDataURL
        const canvas = document.createElement('canvas');
        const original = canvas.toDataURL.toString();

        return {
            detected: original.includes('[native code]') === false,
            description: 'Canvas Fingerprinting - Identification via rendering graphique'
        };
    }

    /**
     * Détecte le fingerprinting WebGL
     * @returns {Object}
     */
    detectWebGLFingerprinting() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

            return {
                detected: gl !== null,
                description: 'WebGL Fingerprinting - Identification via GPU'
            };
        } catch {
            return { detected: false };
        }
    }

    /**
     * Détecte le fingerprinting Audio
     * @returns {Object}
     */
    detectAudioFingerprinting() {
        return {
            detected: typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined',
            description: 'Audio Fingerprinting - Identification via contexte audio'
        };
    }

    /**
     * Détecte le fingerprinting par fonts
     * @returns {Object}
     */
    detectFontFingerprinting() {
        // Simplifié - détection basique
        return {
            detected: document.fonts && document.fonts.size > 0,
            description: 'Font Fingerprinting - Identification via fonts disponibles'
        };
    }

    /**
     * Détecte l'utilisation de l'API Battery
     * @returns {Object}
     */
    detectBatteryAPI() {
        return {
            detected: 'getBattery' in navigator,
            description: 'Battery API - Information niveau batterie'
        };
    }

    /**
     * Génère un résumé de l'analyse
     * @param {Object} results - Résultats complets
     * @returns {Object}
     */
    generateSummary(results) {
        const totalCookies = results.cookies.length;
        const thirdPartyCookies = results.cookies.filter(c => c.isThirdParty).length;
        const marketingCookies = results.cookies.filter(c => c.category === 'marketing').length;
        const totalTrackers = results.trackers.length;
        const fingerprintingTechniques = results.fingerprinting.summary.length;

        const riskLevel = this.calculatePrivacyRisk({
            totalCookies,
            thirdPartyCookies,
            marketingCookies,
            totalTrackers,
            fingerprintingTechniques,
            hasPII: results.localStorage.hasPII || results.sessionStorage.hasPII
        });

        return {
            totalCookies,
            thirdPartyCookies,
            marketingCookies,
            totalTrackers,
            fingerprintingTechniques,
            localStorageItems: results.localStorage.count,
            sessionStorageItems: results.sessionStorage.count,
            riskLevel,
            riskScore: riskLevel.score,
            recommendations: this.generateRecommendations(results)
        };
    }

    /**
     * Calcule le risque de confidentialité
     * @param {Object} metrics - Métriques collectées
     * @returns {Object}
     */
    calculatePrivacyRisk(metrics) {
        let score = 100;

        // Pénalités
        score -= metrics.thirdPartyCookies * 3;
        score -= metrics.marketingCookies * 5;
        score -= metrics.totalTrackers * 4;
        score -= metrics.fingerprintingTechniques * 8;
        if (metrics.hasPII) score -= 15;

        score = Math.max(0, Math.min(100, score));

        let level, color, label;
        if (score >= 70) {
            level = 'low';
            color = UI_CONFIG.COLORS.success;
            label = 'Faible';
        } else if (score >= 40) {
            level = 'medium';
            color = UI_CONFIG.COLORS.warning;
            label = 'Moyen';
        } else {
            level = 'high';
            color = UI_CONFIG.COLORS.danger;
            label = 'Élevé';
        }

        return { score, level, color, label };
    }

    /**
     * Génère des recommandations
     * @param {Object} results - Résultats d'analyse
     * @returns {Array}
     */
    generateRecommendations(results) {
        const recommendations = [];

        if (results.cookies.filter(c => c.isThirdParty).length > 5) {
            recommendations.push({
                level: 'high',
                message: 'Nombreux cookies tiers détectés',
                action: 'Bloquer les cookies tiers dans les paramètres du navigateur'
            });
        }

        if (results.cookies.filter(c => c.category === 'marketing').length > 3) {
            recommendations.push({
                level: 'medium',
                message: 'Cookies marketing/publicitaires actifs',
                action: 'Utiliser un bloqueur de publicités ou refuser les cookies marketing'
            });
        }

        if (results.trackers.length > 5) {
            recommendations.push({
                level: 'high',
                message: `${results.trackers.length} trackers détectés sur cette page`,
                action: 'Installer une extension de blocage de trackers (uBlock Origin, Privacy Badger)'
            });
        }

        if (results.fingerprinting.summary.length > 2) {
            recommendations.push({
                level: 'high',
                message: 'Techniques de fingerprinting détectées',
                action: 'Activer la protection contre le fingerprinting dans votre navigateur'
            });
        }

        if (results.localStorage.hasPII || results.sessionStorage.hasPII) {
            recommendations.push({
                level: 'critical',
                message: 'Données personnelles potentiellement stockées localement',
                action: 'Vider régulièrement le cache et les données de navigation'
            });
        }

        return recommendations;
    }
}

// Export instance singleton
export const cookieDetector = new CookieDetector();
