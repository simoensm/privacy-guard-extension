/**
 * Privacy Guard - Content Script Constants
 * Non-module version of constants for content scripts
 * 
 * This file provides global access to constants that content scripts need
 * since content scripts cannot use ES module imports.
 */

(function () {
    'use strict';

    // Legal page detection patterns
    const LEGAL_PAGE_PATTERNS = {
        URL_PATTERNS: [
            /privacy[-_]?(policy|notice|statement)/i,
            /terms[-_]?(of[-_]?service|and[-_]?conditions|of[-_]?use)/i,
            /cookie[-_]?(policy|notice|statement|preferences)/i,
            /legal([-_]?notice)?/i,
            /gdpr/i,
            /rgpd/i,
            /data[-_]?protection/i,
            /politique[-_]?de[-_]?confidentialite/i,
            /conditions[-_]?generales/i,
            /mentions[-_]?legales/i,
            /datenschutz/i,
            /impressum/i
        ],

        TITLE_KEYWORDS: [
            'privacy policy', 'privacy notice', 'politique de confidentialité',
            'terms of service', 'terms and conditions', 'conditions générales',
            'cookie policy', 'politique de cookies', 'politique des cookies',
            'gdpr', 'rgpd', 'data protection', 'protection des données',
            'legal notice', 'mentions légales', 'terms of use', 'datenschutz'
        ],

        LINK_TEXT_PATTERNS: [
            /privacy/i,
            /terms/i,
            /cookies?/i,
            /legal/i,
            /gdpr/i,
            /confidentialit[ée]/i,
            /conditions/i,
            /datenschutz/i
        ],

        LINK_URL_PATTERNS: [
            /privacy/i,
            /cookie/i,
            /terms/i,
            /legal/i,
            /gdpr/i,
            /rgpd/i,
            /politique/i,
            /conditions/i,
            /datenschutz/i,
            /impressum/i
        ]
    };

    // Message types for communication between scripts
    const MESSAGE_TYPES = {
        ANALYZE_PAGE: 'ANALYZE_PAGE',
        ANALYSIS_COMPLETE: 'ANALYSIS_COMPLETE',
        GET_CURRENT_ANALYSIS: 'GET_CURRENT_ANALYSIS',
        OPEN_DETAILED_VIEW: 'OPEN_DETAILED_VIEW',
        UPDATE_BADGE: 'UPDATE_BADGE'
    };

    // Limits
    const LIMITS = {
        MAX_DOCUMENT_SIZE: 500000,
        ANALYSIS_TIMEOUT: 30000,
        NETWORK_TIMEOUT: 15000,
        MAX_PRIVACY_PAGES_TO_FETCH: 3
    };

    // Link categories for privacy page discovery
    const LINK_CATEGORIES = {
        PRIVACY_POLICY: 'PRIVACY_POLICY',
        COOKIE_POLICY: 'COOKIE_POLICY',
        TERMS_OF_SERVICE: 'TERMS_OF_SERVICE',
        LEGAL_NOTICE: 'LEGAL_NOTICE',
        GDPR: 'GDPR',
        DATA_PROTECTION: 'DATA_PROTECTION',
        UNKNOWN: 'UNKNOWN'
    };

    // Expose to global scope for content scripts
    window.LEGAL_PAGE_PATTERNS = LEGAL_PAGE_PATTERNS;
    window.MESSAGE_TYPES = MESSAGE_TYPES;
    window.LIMITS = LIMITS;
    window.LINK_CATEGORIES = LINK_CATEGORIES;
})();
