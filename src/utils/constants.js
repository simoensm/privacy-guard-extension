/**
 * Privacy Guard - GDPR Compliance Scoring Constants
 * 
 * NEW PHILOSOPHY:
 * - A healthy GDPR-compliant website starts at 100 and loses points for violations
 * - A site that does everything right should score 90-100
 * - Score reflects GDPR compliance level, NOT how "scary" the policy is
 * 
 * GDPR Compliance Criteria (positive signals):
 * ✓ Has a privacy policy → expected
 * ✓ Has a cookie policy → expected  
 * ✓ Mentions user rights (access, deletion, portability) → good
 * ✓ Has DPO/contact info → good
 * ✓ Recently updated → good
 * ✓ Clear language → good
 * ✓ Easy to find → good
 * ✓ Consent mechanism present → good
 * ✓ Data retention periods specified → good
 * ✓ Legal basis stated → good
 * 
 * GDPR Violations (deductions):
 * ✗ No privacy policy → heavy deduction
 * ✗ No cookie policy despite using cookies → deduction
 * ✗ Data selling → heavy deduction
 * ✗ No opt-out mechanism → deduction
 * ✗ No user rights mentioned → deduction
 * ✗ Vague language → deduction
 * ✗ Third-party sharing without transparency → deduction
 * ✗ International transfer without safeguards → deduction
 * ✗ Tracking without consent → deduction
 */

// ============================================
// 🔍 DÉTECTION DES PAGES LÉGALES
// ============================================

export const LEGAL_PAGE_PATTERNS = {
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
  ]
};

// ============================================
// 🚨 CLAUSES SENSIBLES À DÉTECTER
// ============================================

export const SENSITIVE_CLAUSES = {
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

  DATA_SELLING: {
    weight: 10,
    keywords: [
      'sell your data', 'sell personal information', 'monetize',
      'vendre vos données', 'commercialiser', 'monétiser',
      'sell your personal'
    ],
    patterns: [
      /sell.*(?:your|personal).*(?:data|information)/i,
      /vend.*(?:vos|les).*donn[ée]es/i,
      /commercialis.*donn[ée]es/i,
      /we\s+(?:may\s+)?sell/i
    ]
  },

  TARGETED_ADVERTISING: {
    weight: 6,
    keywords: [
      'targeted advertising', 'personalized ads', 'behavioral advertising',
      'publicité ciblée', 'publicité personnalisée', 'publicité comportementale',
      'ad targeting', 'profiling', 'interest-based advertising'
    ],
    patterns: [
      /(?:targeted|personalized|behavioral|interest-based).*ad/i,
      /ad.*(?:targeting|personalization)/i,
      /publicit[ée].*(?:cibl[ée]e|personnalis[ée]e|comportementale)/i,
      /profiling.*(?:for|to).*advertis/i
    ]
  },

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

  INTERNATIONAL_TRANSFER: {
    weight: 7,
    keywords: [
      'international transfer', 'outside the EU', 'outside European Union',
      'third countries', 'transfert international', 'hors UE',
      'pays tiers', 'États-Unis', 'United States',
      'standard contractual clauses', 'adequacy decision'
    ],
    patterns: [
      /transfer.*(?:outside|to).*(?:EU|European Union|EEA)/i,
      /(?:international|cross-border).*transfer/i,
      /transfert.*(?:hors|en dehors).*(?:UE|Union)/i,
      /pays.*tiers/i
    ]
  },

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

  USER_RIGHTS: {
    weight: -5,
    keywords: [
      'right to access', 'right to deletion', 'right to rectification',
      'droit d\'accès', 'droit à l\'effacement', 'droit de rectification',
      'data portability', 'portabilité des données',
      'right to erasure', 'right to object', 'right to restrict',
      'withdraw consent', 'droit d\'opposition'
    ],
    patterns: [
      /right.*(?:access|deletion|erasure|rectification|portability|object|restrict)/i,
      /droit.*(?:acc[èe]s|effacement|rectification|portabilit[ée]|opposition)/i,
      /you (?:can|may).*(?:delete|access|download|request).*data/i,
      /withdraw.*consent/i
    ]
  }
};

// ============================================
// 🎯 GDPR COMPLIANCE SCORING SYSTEM (v2)
// ============================================

export const SCORING_CONFIG = {
  // Start with perfect score — deductions for violations
  BASE_SCORE: 100,

  // ================================
  // GDPR COMPLIANCE CHECKLIST
  // Each item, if present, prevents a deduction
  // If missing, the deduction is applied
  // ================================
  GDPR_CHECKLIST: {
    // --- Document Availability (max -25) ---
    HAS_PRIVACY_POLICY: {
      deductionIfMissing: -25,
      label: 'Privacy Policy available',
      labelFr: 'Politique de confidentialité disponible'
    },
    HAS_COOKIE_POLICY: {
      deductionIfMissing: -10,
      label: 'Cookie Policy available',
      labelFr: 'Politique de cookies disponible'
    },

    // --- User Rights (max -20) ---
    MENTIONS_USER_RIGHTS: {
      deductionIfMissing: -15,
      label: 'User rights mentioned (access, deletion, portability)',
      labelFr: 'Droits des utilisateurs mentionnés'
    },
    RIGHT_TO_OPT_OUT: {
      deductionIfMissing: -5,
      label: 'Right to opt-out/withdraw consent',
      labelFr: 'Droit de retrait du consentement'
    },

    // --- Transparency (max -15) ---
    HAS_CONTACT_INFO: {
      deductionIfMissing: -8,
      label: 'DPO/Contact information provided',
      labelFr: 'Coordonnées DPO/Contact fournies'
    },
    CLEAR_LANGUAGE: {
      deductionIfMissing: -7,
      label: 'Clear, readable language',
      labelFr: 'Langage clair et lisible'
    },

    // --- Consent Mechanism (max -15) ---
    HAS_CONSENT_MECHANISM: {
      deductionIfMissing: -10,
      label: 'Cookie consent mechanism present',
      labelFr: 'Mécanisme de consentement cookies'
    },
    CONSENT_HAS_REJECT: {
      deductionIfMissing: -5,
      label: 'Consent banner allows reject/decline',
      labelFr: 'Bannière permet le refus des cookies'
    },

    // --- Data Practices (max -15) ---
    SPECIFIES_RETENTION: {
      deductionIfMissing: -5,
      label: 'Data retention periods specified',
      labelFr: 'Durées de conservation spécifiées'
    },
    SPECIFIES_LEGAL_BASIS: {
      deductionIfMissing: -5,
      label: 'Legal basis for processing stated',
      labelFr: 'Base légale du traitement indiquée'
    },
    EASY_TO_FIND: {
      deductionIfMissing: -3,
      label: 'Policy easy to find (footer/header link)',
      labelFr: 'Politique facile à trouver'
    },
    RECENTLY_UPDATED: {
      deductionIfMissing: -2,
      label: 'Policy recently updated (< 2 years)',
      labelFr: 'Politique récemment mise à jour'
    }
  },

  // ================================
  // VIOLATION PENALTIES
  // Applied when concerning practices are detected
  // ================================
  VIOLATION_PENALTIES: {
    DATA_SELLING: {
      penalty: -20,
      label: '⚠️ Data selling detected',
      labelFr: '⚠️ Vente de données détectée'
    },
    EXCESSIVE_TRACKING: {
      penalty: -10,
      threshold: 3, // more than 3 trackers
      label: '⚠️ Excessive tracking',
      labelFr: '⚠️ Traçage excessif'
    },
    NO_OPT_OUT_TRACKERS: {
      penalty: -8,
      label: '⚠️ Trackers without opt-out',
      labelFr: '⚠️ Traceurs sans option de refus'
    },
    SENSITIVE_DATA_NO_CONSENT: {
      penalty: -15,
      label: '⚠️ Sensitive data collection detected',
      labelFr: '⚠️ Collecte de données sensibles'
    },
    INTERNATIONAL_TRANSFER_NO_SAFEGUARDS: {
      penalty: -8,
      label: '⚠️ International transfer without stated safeguards',
      labelFr: '⚠️ Transfert international sans garanties'
    },
    MANDATORY_ARBITRATION: {
      penalty: -10,
      label: '⚠️ Mandatory arbitration clause',
      labelFr: '⚠️ Clause d\'arbitrage obligatoire'
    },
    VAGUE_LANGUAGE: {
      penalty: -5,
      label: 'Vague/unclear language used',
      labelFr: 'Langage vague/imprécis'
    },
    VERY_LONG_DOCUMENT: {
      penalty: -3,
      threshold: 10000, // words
      label: 'Excessively long document',
      labelFr: 'Document excessivement long'
    },
    THIRD_PARTY_SHARING: {
      penalty: -5,
      label: 'Third-party data sharing',
      labelFr: 'Partage de données avec tiers'
    }
  },

  // ================================
  // RISK LEVELS — Aligned with GDPR compliance
  // 90-100: Excellent (fully GDPR compliant)
  // 70-89:  Good (minor issues)
  // 50-69:  Concerning (notable gaps)
  // 0-49:   Poor (major GDPR violations)
  // ================================
  RISK_LEVELS: {
    EXCELLENT: { min: 90, max: 100, color: '#22c55e', label: 'Excellent', labelFr: 'Excellent' },
    GOOD: { min: 70, max: 89, color: '#37ba83', label: 'Good', labelFr: 'Bon' },
    CONCERNING: { min: 50, max: 69, color: '#f59e0b', label: 'Concerning', labelFr: 'Préoccupant' },
    POOR: { min: 0, max: 49, color: '#ef4444', label: 'Poor', labelFr: 'Insuffisant' }
  }
};

// ============================================
// 📊 CONFIGURATION NLP
// ============================================

export const NLP_CONFIG = {
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

  SUMMARY: {
    MAX_SENTENCES: 7,
    MIN_SENTENCE_LENGTH: 30,
    MAX_SENTENCE_LENGTH: 150
  },

  CONFIDENCE_THRESHOLDS: {
    HIGH: 0.8,
    MEDIUM: 0.5,
    LOW: 0.3
  },

  // Legal basis keywords for GDPR scoring
  LEGAL_BASIS_KEYWORDS: [
    'legitimate interest', 'consent', 'contractual necessity',
    'legal obligation', 'vital interests', 'public interest',
    'intérêt légitime', 'consentement', 'nécessité contractuelle',
    'obligation légale', 'article 6', 'article 9', 'lawful basis'
  ],

  // Opt-out keywords
  OPT_OUT_KEYWORDS: [
    'opt out', 'opt-out', 'unsubscribe', 'withdraw consent',
    'do not sell', 'do not share', 'manage preferences',
    'se désinscrire', 'retirer le consentement',
    'gérer les préférences', 'refuser'
  ]
};

// ============================================
// 🎨 CONFIGURATION UI
// ============================================

export const UI_CONFIG = {
  COLORS: {
    excellent: '#22c55e',
    good: '#37ba83',
    warning: '#f59e0b',
    danger: '#ef4444',
    dark: '#202a3a',
    light: '#ffffff',
    gray: '#a0a0a0'
  },

  ANIMATION_DURATION: 300,

  BADGE_ICONS: {
    EXCELLENT: '✓',
    GOOD: '✓',
    CONCERNING: '!',
    POOR: '⚠'
  }
};

// ============================================
// 💾 CONFIGURATION STOCKAGE
// ============================================

export const STORAGE_CONFIG = {
  CACHE_DURATION: 7 * 24 * 60 * 60 * 1000,
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

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'es', 'it'];

// ============================================
// 🔄 MESSAGES INTER-SCRIPTS
// ============================================

export const MESSAGE_TYPES = {
  ANALYZE_PAGE: 'ANALYZE_PAGE',
  ANALYSIS_COMPLETE: 'ANALYSIS_COMPLETE',
  GET_CURRENT_ANALYSIS: 'GET_CURRENT_ANALYSIS',
  OPEN_DETAILED_VIEW: 'OPEN_DETAILED_VIEW',
  UPDATE_BADGE: 'UPDATE_BADGE'
};

// ============================================
// 📏 LIMITES & TIMEOUTS
// ============================================

export const LIMITS = {
  MAX_DOCUMENT_SIZE: 500000,       // 500KB max
  ANALYSIS_TIMEOUT: 30000,         // 30 seconds
  NETWORK_TIMEOUT: 15000,          // 15 seconds (for fetching remote pages)
  MAX_PRIVACY_PAGES_TO_FETCH: 3    // Max number of remote privacy pages to fetch
};
