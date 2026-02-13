/**
 * Privacy Guard - Global Constants
 * Définition des constantes utilisées dans toute l'extension
 */

// Wrap in IIFE to expose to global scope for non-module scripts
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
  // 🚨 CLAUSES SENSIBLES À DÉTECTER
  // ============================================

  const SENSITIVE_CLAUSES = {
    // Partage avec des tiers
    THIRD_PARTY_SHARING: {
      weight: 8,
      keywords: [
        'share with third parties', 'third party partners', 'affiliate',
        'partenaires tiers', 'partage avec des tiers', 'partenaires commerciaux',
        'may share your information', 'disclosure to third parties'
      ],
      patterns: [
        /share.*(?:with|to).*third[\s-]?part/i,
        /disclose.*(?:to|with).*(?:third[\s-]?party|partner|affiliate)/i,
        /partag.*(?:avec|aux).*(?:tiers|partenaires)/i
      ]
    },

    // Revente de données
    DATA_SELLING: {
      weight: 10,
      keywords: [
        'sell your data', 'sell personal information', 'monetize',
        'vendre vos données', 'commercialiser', 'monétiser'
      ],
      patterns: [
        /sell.*(?:your|personal).*(?:data|information)/i,
        /vend.*(?:vos|les).*donn[ée]es/i,
        /commercialis.*donn[ée]es/i
      ]
    },

    // Publicité ciblée
    TARGETED_ADVERTISING: {
      weight: 6,
      keywords: [
        'targeted advertising', 'personalized ads', 'behavioral advertising',
        'publicité ciblée', 'publicité personnalisée', 'publicité comportementale',
        'ad targeting', 'profiling'
      ],
      patterns: [
        /(?:targeted|personalized|behavioral).*ad/i,
        /ad.*(?:targeting|personalization)/i,
        /publicit[ée].*(?:cibl[ée]e|personnalis[ée]e|comportementale)/i,
        /profiling.*(?:for|to).*advertis/i
      ]
    },

    // Conservation des données
    DATA_RETENTION: {
      weight: 5,
      keywords: [
        'retain', 'retention period', 'keep your data', 'store for',
        'conservation', 'durée de conservation', 'conserver vos données'
      ],
      patterns: [
        /(?:retain|keep|store).*(?:for|up to|until)/i,
        /retention.*period/i,
        /conserv.*(?:pendant|durant|pour|jusqu)/i,
        /dur[ée]e.*conservation/i
      ]
    },

    // Transfert hors UE
    INTERNATIONAL_TRANSFER: {
      weight: 7,
      keywords: [
        'international transfer', 'outside the EU', 'outside European Union',
        'third countries', 'transfert international', 'hors UE',
        'pays tiers', 'États-Unis', 'United States'
      ],
      patterns: [
        /transfer.*(?:outside|to).*(?:EU|European Union|EEA)/i,
        /(?:international|cross-border).*transfer/i,
        /transfert.*(?:hors|en dehors).*(?:UE|Union)/i,
        /pays.*tiers/i
      ]
    },

    // Arbitrage obligatoire
    MANDATORY_ARBITRATION: {
      weight: 9,
      keywords: [
        'mandatory arbitration', 'binding arbitration', 'arbitration clause',
        'arbitrage obligatoire', 'clause d\'arbitrage', 'arbitrage contraignant'
      ],
      patterns: [
        /(?:mandatory|binding).*arbitration/i,
        /arbitration.*(?:clause|agreement)/i,
        /arbitrage.*(?:obligatoire|contraignant)/i,
        /clause.*arbitrage/i
      ]
    },

    // Limitation de responsabilité
    LIABILITY_LIMITATION: {
      weight: 6,
      keywords: [
        'limitation of liability', 'not liable', 'no warranty',
        'limitation de responsabilité', 'non responsable', 'aucune garantie',
        'disclaimer'
      ],
      patterns: [
        /limitation.*(?:of|on).*liability/i,
        /not.*liable.*for/i,
        /no.*warranty/i,
        /limitation.*responsabilit[ée]/i,
        /non.*responsable/i
      ]
    },

    // Données sensibles
    SENSITIVE_DATA_COLLECTION: {
      weight: 9,
      keywords: [
        'biometric', 'health data', 'medical', 'genetic',
        'biométrique', 'données de santé', 'médical', 'génétique',
        'racial', 'religious', 'political', 'sexual orientation'
      ],
      patterns: [
        /(?:biometric|health|medical|genetic).*(?:data|information)/i,
        /donn[ée]es.*(?:biom[ée]triques?|sant[ée]|m[ée]dicales?|g[ée]n[ée]tiques?)/i,
        /(?:racial|religious|political).*(?:data|beliefs)/i
      ]
    },

    // Géolocalisation
    GEOLOCATION: {
      weight: 7,
      keywords: [
        'geolocation', 'location data', 'GPS', 'precise location',
        'géolocalisation', 'données de localisation', 'position géographique'
      ],
      patterns: [
        /(?:geo)?location.*(?:data|tracking|services)/i,
        /GPS/i,
        /(?:track|collect).*(?:your )?location/i,
        /g[ée]olocalisation/i,
        /donn[ée]es.*localisation/i
      ]
    },

    // Droits utilisateur
    USER_RIGHTS: {
      weight: -5, // Poids négatif = positif pour le score
      keywords: [
        'right to access', 'right to deletion', 'right to rectification',
        'droit d\'accès', 'droit à l\'effacement', 'droit de rectification',
        'data portability', 'portabilité des données'
      ],
      patterns: [
        /right.*(?:access|deletion|erasure|rectification|portability)/i,
        /droit.*(?:acc[èe]s|effacement|rectification|portabilit[ée])/i,
        /you (?:can|may).*(?:delete|access|download).*data/i
      ]
    }
  };

  // ============================================
  // 🎯 SYSTÈME DE SCORING
  // ============================================

  const SCORING_CONFIG = {
    // Score de base
    BASE_SCORE: 50,

    // Multiplicateurs
    MULTIPLIERS: {
      HAS_PRIVACY_POLICY: 1.1,      // +10% si politique de confidentialité présente
      HAS_COOKIE_POLICY: 1.05,      // +5% si politique de cookies
      CLEAR_LANGUAGE: 1.15,         // +15% si langage clair (score Flesch > 60)
      SHORT_DOCUMENT: 1.1,          // +10% si document court (< 5000 mots)
      EASY_TO_FIND: 1.05            // +5% si facile à trouver
    },

    // Pénalités
    PENALTIES: {
      VAGUE_LANGUAGE: -10,           // Langage vague
      VERY_LONG: -15,                // Très long document (> 10000 mots)
      HARD_TO_FIND: -10,             // Difficile à trouver
      NO_CONTACT_INFO: -5,           // Pas d'info de contact
      OUTDATED: -10                  // Dernière mise à jour > 2 ans
    },

    // Classifications de risque
    RISK_LEVELS: {
      LOW: { min: 70, max: 100, color: '#22c55e', label: 'Faible' },
      MEDIUM: { min: 40, max: 69, color: '#f59e0b', label: 'Moyen' },
      HIGH: { min: 0, max: 39, color: '#ef4444', label: 'Élevé' }
    }
  };

  // ============================================
  // 📊 CONFIGURATION NLP
  // ============================================

  const NLP_CONFIG = {
    // Stopwords (mots à ignorer)
    STOPWORDS_EN: [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
      'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
      'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how'
    ],

    STOPWORDS_FR: [
      'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'mais',
      'dans', 'sur', 'à', 'pour', 'par', 'avec', 'sans', 'sous', 'vers',
      'est', 'sont', 'était', 'étaient', 'être', 'avoir', 'a', 'avons', 'ont',
      'ce', 'cette', 'ces', 'cet', 'je', 'tu', 'il', 'elle', 'nous', 'vous',
      'ils', 'elles', 'qui', 'que', 'quoi', 'dont', 'où', 'quand', 'comment'
    ],

    // Paramètres de résumé
    SUMMARY: {
      MAX_SENTENCES: 7,              // Max 7 points clés
      MIN_SENTENCE_LENGTH: 30,       // Longueur min d'une phrase
      MAX_SENTENCE_LENGTH: 150       // Longueur max d'une phrase
    },

    // Seuils de confiance
    CONFIDENCE_THRESHOLDS: {
      HIGH: 0.8,
      MEDIUM: 0.5,
      LOW: 0.3
    }
  };

  // ============================================
  // 🎨 CONFIGURATION UI
  // ============================================

  const UI_CONFIG = {
    COLORS: {
      primary: '#3b82f6',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
      dark: '#1e293b',
      light: '#f8fafc',
      gray: '#64748b'
    },

    ANIMATION_DURATION: 300,         // ms

    BADGE_ICONS: {
      LOW_RISK: '✓',
      MEDIUM_RISK: '!',
      HIGH_RISK: '⚠'
    }
  };

  // ============================================
  // 💾 CONFIGURATION STOCKAGE
  // ============================================

  const STORAGE_CONFIG = {
    CACHE_DURATION: 7 * 24 * 60 * 60 * 1000,  // 7 jours en ms
    MAX_CACHE_ENTRIES: 100,

    KEYS: {
      ANALYSES: 'privacy_guard_analyses',
      SETTINGS: 'privacy_guard_settings',
      VISITED_SITES: 'privacy_guard_visited'
    }
  };

  // ============================================
  // 🌐 LANGUES SUPPORTÉES
  // ============================================

  const SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'es', 'it'];

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

  // Expose to global scope
  global.LEGAL_PAGE_PATTERNS = LEGAL_PAGE_PATTERNS;
  global.SENSITIVE_CLAUSES = SENSITIVE_CLAUSES;
  global.SCORING_CONFIG = SCORING_CONFIG;
  global.NLP_CONFIG = NLP_CONFIG;
  global.UI_CONFIG = UI_CONFIG;
  global.STORAGE_CONFIG = STORAGE_CONFIG;
  global.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
  global.MESSAGE_TYPES = MESSAGE_TYPES;
  global.LIMITS = LIMITS;

})(typeof window !== 'undefined' ? window : this);
