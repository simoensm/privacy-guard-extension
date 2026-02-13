/**
 * Privacy Guard - Clause Detector
 * Détection des clauses sensibles dans les documents légaux
 */

import { SENSITIVE_CLAUSES } from '../utils/constants.js';

export class ClauseDetector {
    constructor() {
        this.clauses = SENSITIVE_CLAUSES;
    }

    /**
     * Analyse un document pour détecter toutes les clauses sensibles
     * @param {string} text - Texte du document
     * @param {Array<string>} sentences - Phrases du document
     * @returns {Object} Résultats de détection
     */
    detectAll(text, sentences) {
        const detectedClauses = {};
        const totalWeight = { positive: 0, negative: 0 };
        const highlightedSentences = [];

        // Parcours de toutes les catégories de clauses
        for (const [clauseType, config] of Object.entries(this.clauses)) {
            const detection = this.detectClause(text, sentences, clauseType, config);

            if (detection.detected) {
                detectedClauses[clauseType] = detection;

                // Ajout au poids total
                if (config.weight > 0) {
                    totalWeight.negative += config.weight;
                } else {
                    totalWeight.positive += Math.abs(config.weight);
                }

                // Ajout des phrases pertinentes
                highlightedSentences.push(...detection.sentences);
            }
        }

        return {
            detectedClauses,
            totalWeight,
            highlightedSentences: this.removeDuplicates(highlightedSentences),
            clauseCount: Object.keys(detectedClauses).length
        };
    }

    /**
     * Détecte une clause spécifique
     * @param {string} text - Texte complet
     * @param {Array<string>} sentences - Phrases
     * @param {string} clauseType - Type de clause
     * @param {Object} config - Configuration de la clause
     * @returns {Object} Résultat de détection
     */
    detectClause(text, sentences, clauseType, config) {
        const matches = [];
        const matchedSentences = [];
        let confidence = 0;

        // Recherche par mots-clés
        const keywordMatches = this.findKeywordMatches(text, config.keywords);

        // Recherche par patterns regex
        const patternMatches = this.findPatternMatches(text, config.patterns);

        // Regroupement des résultats
        const allMatches = [...keywordMatches, ...patternMatches];

        if (allMatches.length > 0) {
            // Extraction des phrases contenant les matches
            allMatches.forEach(match => {
                const sentence = this.findContainingSentence(match, sentences);
                if (sentence && !matchedSentences.includes(sentence)) {
                    matchedSentences.push(sentence);
                }
            });

            // Calcul de la confiance
            confidence = this.calculateConfidence(
                keywordMatches.length,
                patternMatches.length,
                matchedSentences.length
            );

            return {
                detected: true,
                type: clauseType,
                weight: config.weight,
                confidence,
                matchCount: allMatches.length,
                sentences: matchedSentences.slice(0, 3), // Max 3 exemples
                summary: this.generateClauseSummary(clauseType, matchedSentences)
            };
        }

        return {
            detected: false,
            type: clauseType,
            weight: config.weight,
            confidence: 0
        };
    }

    /**
     * Trouve les correspondances de mots-clés
     * @param {string} text - Texte à analyser
     * @param {Array<string>} keywords - Mots-clés à rechercher
     * @returns {Array<string>} Correspondances
     */
    findKeywordMatches(text, keywords) {
        const matches = [];
        const lowerText = text.toLowerCase();

        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            const found = text.match(regex);
            if (found) {
                matches.push(...found);
            }
        });

        return matches;
    }

    /**
     * Trouve les correspondances de patterns
     * @param {string} text - Texte à analyser
     * @param {Array<RegExp>} patterns - Patterns regex
     * @returns {Array<string>} Correspondances
     */
    findPatternMatches(text, patterns) {
        const matches = [];

        patterns.forEach(pattern => {
            const found = text.match(pattern);
            if (found) {
                matches.push(...found);
            }
        });

        return matches;
    }

    /**
     * Trouve la phrase contenant une correspondance
     * @param {string} match - Texte correspondant
     * @param {Array<string>} sentences - Liste de phrases
     * @returns {string|null} Phrase trouvée
     */
    findContainingSentence(match, sentences) {
        return sentences.find(sentence =>
            sentence.toLowerCase().includes(match.toLowerCase())
        ) || null;
    }

    /**
     * Calcule le niveau de confiance de la détection
     * @param {number} keywordCount - Nombre de mots-clés trouvés
     * @param {number} patternCount - Nombre de patterns trouvés
     * @param {number} sentenceCount - Nombre de phrases trouvées
     * @returns {number} Score de confiance (0-1)
     */
    calculateConfidence(keywordCount, patternCount, sentenceCount) {
        // Pondération : patterns > keywords > sentences
        const score = (
            (patternCount * 0.5) +
            (keywordCount * 0.3) +
            (sentenceCount * 0.2)
        );

        // Normalisation entre 0 et 1
        return Math.min(1, score / 5);
    }

    /**
     * Génère un résumé pour une clause détectée
     * @param {string} clauseType - Type de clause
     * @param {Array<string>} sentences - Phrases pertinentes
     * @returns {string} Résumé
     */
    generateClauseSummary(clauseType, sentences) {
        const summaries = {
            THIRD_PARTY_SHARING: "Vos données peuvent être partagées avec des partenaires tiers.",
            DATA_SELLING: "⚠️ Vos données personnelles peuvent être vendues.",
            TARGETED_ADVERTISING: "Vos données sont utilisées pour de la publicité ciblée.",
            DATA_RETENTION: "Vos données sont conservées pendant une durée spécifique.",
            INTERNATIONAL_TRANSFER: "⚠️ Vos données peuvent être transférées hors de l'UE.",
            MANDATORY_ARBITRATION: "⚠️ Clause d'arbitrage obligatoire présente.",
            LIABILITY_LIMITATION: "Responsabilité limitée du fournisseur de service.",
            SENSITIVE_DATA_COLLECTION: "⚠️ Collecte de données sensibles (santé, biométrie, etc.).",
            GEOLOCATION: "Collecte de données de géolocalisation.",
            USER_RIGHTS: "✓ Vos droits d'accès et de suppression sont mentionnés."
        };

        return summaries[clauseType] || "Clause détectée.";
    }

    /**
     * Supprime les doublons d'un tableau
     * @param {Array} arr - Tableau avec doublons
     * @returns {Array} Tableau sans doublons
     */
    removeDuplicates(arr) {
        return [...new Set(arr)];
    }

    /**
     * Génère un rapport détaillé des clauses
     * @param {Object} detectedClauses - Clauses détectées
     * @returns {Object} Rapport formaté
     */
    generateReport(detectedClauses) {
        const report = {
            critical: [],   // weight >= 8
            important: [],  // weight 5-7
            moderate: [],   // weight 1-4
            positive: []    // weight < 0
        };

        for (const [type, data] of Object.entries(detectedClauses)) {
            const item = {
                type,
                summary: data.summary,
                confidence: data.confidence,
                weight: data.weight,
                examples: data.sentences.slice(0, 2) // Max 2 exemples
            };

            if (data.weight >= 8) {
                report.critical.push(item);
            } else if (data.weight >= 5) {
                report.important.push(item);
            } else if (data.weight > 0) {
                report.moderate.push(item);
            } else {
                report.positive.push(item);
            }
        }

        return report;
    }

    /**
     * Analyse les permissions demandées
     * @param {string} text - Texte du document
     * @returns {Array<string>} Permissions détectées
     */
    analyzePermissions(text) {
        const permissions = [];

        const permissionPatterns = {
            camera: /camera|webcam|photo|image capture/i,
            microphone: /microphone|audio|voice|recording/i,
            location: /location|gps|geolocation|position/i,
            contacts: /contacts|address book|phonebook/i,
            storage: /files|storage|documents|photos/i,
            notifications: /notification|push|alert/i,
            cookies: /cookies|tracking|pixels/i,
            clipboard: /clipboard|copy|paste/i
        };

        for (const [permission, pattern] of Object.entries(permissionPatterns)) {
            if (pattern.test(text)) {
                permissions.push(permission);
            }
        }

        return permissions;
    }

    /**
     * Détecte les entités tierces mentionnées
     * @param {string} text - Texte du document
     * @returns {Array<string>} Liste d'entités tierces
     */
    detectThirdParties(text) {
        const thirdParties = [];

        // Services connus
        const knownServices = [
            'Google Analytics', 'Facebook', 'Meta', 'Twitter', 'Instagram',
            'Amazon', 'AWS', 'Microsoft', 'Azure', 'Cloudflare',
            'Stripe', 'PayPal', 'Mailchimp', 'SendGrid', 'Intercom',
            'Hotjar', 'Mixpanel', 'Segment', 'Amplitude'
        ];

        knownServices.forEach(service => {
            const regex = new RegExp(`\\b${service}\\b`, 'i');
            if (regex.test(text)) {
                thirdParties.push(service);
            }
        });

        return thirdParties;
    }

    /**
     * Analyse la durée de conservation des données
     * @param {string} text - Texte du document
     * @returns {Object} Informations sur la rétention
     */
    analyzeRetentionPeriod(text) {
        const periods = {
            found: false,
            duration: null,
            sentences: []
        };

        // Patterns pour détecter les durées
        const durationPatterns = [
            /(\d+)\s*(?:day|days|jour|jours)/i,
            /(\d+)\s*(?:month|months|mois)/i,
            /(\d+)\s*(?:year|years|an|ans|année|années)/i,
            /(?:for|pendant|durant)\s*(\d+)/i
        ];

        durationPatterns.forEach(pattern => {
            const match = text.match(pattern);
            if (match) {
                periods.found = true;
                periods.duration = match[0];
            }
        });

        return periods;
    }
}

// Export instance singleton
export const clauseDetector = new ClauseDetector();
