/**
 * Privacy Guard - Global Constants (Content Script Version)
 * Non-module version for content scripts
 * This file exposes constants to the global window object
 */

(function (global) {
    'use strict';

    // ============================================
    // 🔍 DÉTECTION DES PAGES LÉGALES
    // ============================================

    const LEGAL_PAGE_PATTERNS = {
        // URLs patterns
        URL_PATTERNS: [
            /privacy[-_]?(policy|notice|statement)/i,
            /terms[-_]?(of[-_]?service|and[-_]?conditions|of[-_]?use)/i,
            /cookie[-_]?(policy|notice|statement)/i,
            /legal/i,
            /gdpr/i,
            /rgpd/i,
            /data[-_]?protection/i,
            /politique[-_]?de[-_]?confidentialite/i,
            /conditions[-_]?generales/i,
            /mentions[-_]?legales/i
        ],

        // Titre de page
        TITLE_KEYWORDS: [
            'privacy policy', 'privacy notice', 'politique de confidentialité',
            'terms of service', 'terms and conditions', 'conditions générales',
            'cookie policy', 'politique de cookies', 'politique des cookies',
            'gdpr', 'rgpd', 'data protection', 'protection des données',
            'legal notice', 'mentions légales'
        ],

        // Liens communs
        LINK_TEXT_PATTERNS: [
            /privacy/i,
            /terms/i,
            /cookies?/i,
            /legal/i,
            /gdpr/i,
            /confidentialit[ée]/i,
            /conditions/i
        ]
    };

    // ============================================
    // 🔄 MESSAGES INTER-SCRIPTS
    // ============================================

    const MESSAGE_TYPES = {
        ANALYZE_PAGE: 'ANALYZE_PAGE',
        ANALYSIS_COMPLETE: 'ANALYSIS_COMPLETE',
        GET_CURRENT_ANALYSIS: 'GET_CURRENT_ANALYSIS',
        OPEN_DETAILED_VIEW: 'OPEN_DETAILED_VIEW',
        UPDATE_BADGE: 'UPDATE_BADGE'
    };

    // ============================================
    // 📏 LIMITES & TIMEOUTS
    // ============================================

    const LIMITS = {
        MAX_DOCUMENT_SIZE: 500000,       // 500KB max
        ANALYSIS_TIMEOUT: 30000,         // 30 secondes
        NETWORK_TIMEOUT: 10000           // 10 secondes
    };

    // Expose to global scope for content scripts
    global.LEGAL_PAGE_PATTERNS = LEGAL_PAGE_PATTERNS;
    global.MESSAGE_TYPES = MESSAGE_TYPES;
    global.LIMITS = LIMITS;

})(typeof window !== 'undefined' ? window : this);
