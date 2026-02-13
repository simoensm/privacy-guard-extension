/**
 * Privacy Guard - Risk Scorer
 * Système de calcul du score de transparence et du niveau de risque
 */

import { SCORING_CONFIG } from '../utils/constants.js';

export class RiskScorer {
    constructor() {
        this.config = SCORING_CONFIG;
    }

    /**
     * Calcule le score de transparence global
     * @param {Object} analysisData - Données d'analyse complètes
     * @returns {Object} Score et métadonnées
     */
    calculateTransparencyScore(analysisData) {
        const {
            nlpResults,
            clauseDetection,
            documentMeta,
            pageInfo
        } = analysisData;

        // Score de base
        let score = this.config.BASE_SCORE;

        // Application des multiplicateurs positifs
        score = this.applyPositiveMultipliers(score, documentMeta, pageInfo);

        // Application des pénalités basées sur les clauses
        score = this.applyClausePenalties(score, clauseDetection);

        // Application des pénalités basées sur le document
        score = this.applyDocumentPenalties(score, nlpResults, documentMeta);

        // Bonus pour la lisibilité
        score = this.applyReadabilityBonus(score, nlpResults.readability);

        // Normalisation entre 0 et 100
        score = Math.max(0, Math.min(100, Math.round(score)));

        // Détermination du niveau de risque
        const riskLevel = this.determineRiskLevel(score);

        // Calcul de la confiance du score
        const confidence = this.calculateScoreConfidence(analysisData);

        return {
            score,
            riskLevel,
            confidence,
            breakdown: this.getScoreBreakdown(analysisData),
            recommendations: this.generateRecommendations(score, clauseDetection)
        };
    }

    /**
     * Applique les multiplicateurs positifs
     * @param {number} baseScore - Score de base
     * @param {Object} documentMeta - Métadonnées du document
     * @param {Object} pageInfo - Informations de la page
     * @returns {number} Score ajusté
     */
    applyPositiveMultipliers(baseScore, documentMeta, pageInfo) {
        let score = baseScore;
        const multipliers = this.config.MULTIPLIERS;

        // Présence d'une politique de confidentialité
        if (documentMeta.hasPrivacyPolicy) {
            score *= multipliers.HAS_PRIVACY_POLICY;
        }

        // Présence d'une politique de cookies
        if (documentMeta.hasCookiePolicy) {
            score *= multipliers.HAS_COOKIE_POLICY;
        }

        // Document court et concis (< 5000 mots)
        if (documentMeta.wordCount < 5000) {
            score *= multipliers.SHORT_DOCUMENT;
        }

        // Facile à trouver (lien visible dans le footer/header)
        if (pageInfo.easyToFind) {
            score *= multipliers.EASY_TO_FIND;
        }

        return score;
    }

    /**
     * Applique les pénalités basées sur les clauses détectées
     * @param {number} currentScore - Score actuel
     * @param {Object} clauseDetection - Résultats de détection
     * @returns {number} Score ajusté
     */
    applyClausePenalties(currentScore, clauseDetection) {
        let score = currentScore;

        if (!clauseDetection || !clauseDetection.detectedClauses) {
            return score;
        }

        const { totalWeight, detectedClauses } = clauseDetection;

        // Pénalité basée sur le poids total des clauses négatives
        // Plus le poids est élevé, plus la pénalité est importante
        if (totalWeight.negative > 0) {
            const penaltyFactor = totalWeight.negative / 10; // Range: 0-10
            score -= (penaltyFactor * 5); // Max -50 points
        }

        // Bonus pour les clauses positives (droits utilisateur)
        if (totalWeight.positive > 0) {
            score += (totalWeight.positive * 2); // Max +10 points
        }

        // Pénalités spécifiques pour clauses critiques
        for (const [type, data] of Object.entries(detectedClauses)) {
            if (type === 'DATA_SELLING' && data.detected) {
                score -= 15; // Pénalité lourde
            }
            if (type === 'MANDATORY_ARBITRATION' && data.detected) {
                score -= 10;
            }
            if (type === 'SENSITIVE_DATA_COLLECTION' && data.detected) {
                score -= 12;
            }
            if (type === 'INTERNATIONAL_TRANSFER' && data.detected) {
                score -= 8;
            }
        }

        return score;
    }

    /**
     * Applique les pénalités liées au document
     * @param {number} currentScore - Score actuel
     * @param {Object} nlpResults - Résultats NLP
     * @param {Object} documentMeta - Métadonnées
     * @returns {number} Score ajusté
     */
    applyDocumentPenalties(currentScore, nlpResults, documentMeta) {
        let score = currentScore;
        const penalties = this.config.PENALTIES;

        // Document très long (> 10000 mots)
        if (nlpResults.stats.wordCount > 10000) {
            score += penalties.VERY_LONG;
        }

        // Langage vague (détection de termes vagues)
        if (this.hasVagueLanguage(nlpResults)) {
            score += penalties.VAGUE_LANGUAGE;
        }

        // Politique difficile à trouver
        if (documentMeta.hardToFind) {
            score += penalties.HARD_TO_FIND;
        }

        // Pas d'informations de contact
        if (!documentMeta.hasContactInfo) {
            score += penalties.NO_CONTACT_INFO;
        }

        // Politique obsolète (> 2 ans)
        if (documentMeta.lastUpdated && this.isOutdated(documentMeta.lastUpdated)) {
            score += penalties.OUTDATED;
        }

        return score;
    }

    /**
     * Applique un bonus basé sur la lisibilité
     * @param {number} currentScore - Score actuel
     * @param {Object} readability - Scores de lisibilité
     * @returns {number} Score ajusté
     */
    applyReadabilityBonus(currentScore, readability) {
        let score = currentScore;

        if (!readability) return score;

        // Bonus pour langage clair (Flesch score > 60)
        if (readability.score >= 60) {
            score *= this.config.MULTIPLIERS.CLEAR_LANGUAGE;
        }

        // Pénalité pour langage très difficile (Flesch score < 30)
        if (readability.score < 30) {
            score -= 10;
        }

        return score;
    }

    /**
     * Détermine le niveau de risque basé sur le score
     * @param {number} score - Score de transparence
     * @returns {Object} Niveau de risque
     */
    determineRiskLevel(score) {
        const levels = this.config.RISK_LEVELS;

        if (score >= levels.LOW.min) {
            return {
                level: 'LOW',
                label: levels.LOW.label,
                color: levels.LOW.color,
                icon: '✓',
                description: 'Politique transparente et respectueuse'
            };
        } else if (score >= levels.MEDIUM.min) {
            return {
                level: 'MEDIUM',
                label: levels.MEDIUM.label,
                color: levels.MEDIUM.color,
                icon: '!',
                description: 'Quelques clauses à surveiller'
            };
        } else {
            return {
                level: 'HIGH',
                label: levels.HIGH.label,
                color: levels.HIGH.color,
                icon: '⚠',
                description: 'Nombreuses clauses préoccupantes'
            };
        }
    }

    /**
     * Calcule la confiance du score
     * @param {Object} analysisData - Données complètes
     * @returns {number} Score de confiance (0-1)
     */
    calculateScoreConfidence(analysisData) {
        let confidence = 0;

        // Facteurs de confiance
        const factors = {
            documentComplete: analysisData.documentMeta.isComplete ? 0.3 : 0.1,
            clauseDetection: analysisData.clauseDetection.clauseCount > 0 ? 0.3 : 0.1,
            nlpQuality: analysisData.nlpResults.stats.wordCount > 500 ? 0.2 : 0.1,
            metadataPresent: analysisData.documentMeta.hasContactInfo ? 0.2 : 0.1
        };

        confidence = Object.values(factors).reduce((sum, val) => sum + val, 0);

        return Math.min(1, confidence);
    }

    /**
     * Génère une ventilation détaillée du score
     * @param {Object} analysisData - Données complètes
     * @returns {Object} Détails du scoring
     */
    getScoreBreakdown(analysisData) {
        return {
            baseScore: this.config.BASE_SCORE,
            adjustments: {
                clauses: this.getClauseAdjustments(analysisData.clauseDetection),
                readability: this.getReadabilityAdjustment(analysisData.nlpResults),
                metadata: this.getMetadataAdjustments(analysisData.documentMeta)
            }
        };
    }

    /**
     * Obtient les ajustements liés aux clauses
     * @param {Object} clauseDetection - Détection de clauses
     * @returns {Array} Liste d'ajustements
     */
    getClauseAdjustments(clauseDetection) {
        const adjustments = [];

        if (!clauseDetection.detectedClauses) return adjustments;

        for (const [type, data] of Object.entries(clauseDetection.detectedClauses)) {
            if (data.detected) {
                adjustments.push({
                    type,
                    impact: data.weight > 0 ? 'negative' : 'positive',
                    weight: Math.abs(data.weight),
                    summary: data.summary
                });
            }
        }

        return adjustments;
    }

    /**
     * Obtient l'ajustement de lisibilité
     * @param {Object} nlpResults - Résultats NLP
     * @returns {Object} Ajustement
     */
    getReadabilityAdjustment(nlpResults) {
        const { readability } = nlpResults;

        if (!readability) return { impact: 0, reason: 'N/A' };

        if (readability.score >= 60) {
            return { impact: 15, reason: 'Langage clair et accessible' };
        } else if (readability.score < 30) {
            return { impact: -10, reason: 'Langage complexe et difficile' };
        }

        return { impact: 0, reason: 'Lisibilité moyenne' };
    }

    /**
     * Obtient les ajustements de métadonnées
     * @param {Object} documentMeta - Métadonnées
     * @returns {Array} Liste d'ajustements
     */
    getMetadataAdjustments(documentMeta) {
        const adjustments = [];

        if (documentMeta.hasPrivacyPolicy) {
            adjustments.push({ reason: 'Politique de confidentialité présente', impact: 5 });
        }

        if (documentMeta.hasContactInfo) {
            adjustments.push({ reason: 'Informations de contact disponibles', impact: 5 });
        }

        if (documentMeta.isOutdated) {
            adjustments.push({ reason: 'Politique obsolète', impact: -10 });
        }

        return adjustments;
    }

    /**
     * Génère des recommandations basées sur le score
     * @param {number} score - Score de transparence
     * @param {Object} clauseDetection - Détection de clauses
     * @returns {Array<string>} Liste de recommandations
     */
    generateRecommendations(score, clauseDetection) {
        const recommendations = [];

        if (score < 70) {
            recommendations.push("⚠️ Lisez attentivement avant d'accepter");
        }

        if (score < 40) {
            recommendations.push("🔴 Envisagez d'utiliser ce service avec précaution");
        }

        // Recommandations spécifiques aux clauses
        const clauses = clauseDetection.detectedClauses || {};

        if (clauses.DATA_SELLING?.detected) {
            recommendations.push("⚠️ Vos données peuvent être vendues - vérifiez les options de désactivation");
        }

        if (clauses.INTERNATIONAL_TRANSFER?.detected) {
            recommendations.push("🌍 Transfert de données hors UE - assurez-vous des garanties RGPD");
        }

        if (clauses.SENSITIVE_DATA_COLLECTION?.detected) {
            recommendations.push("⚕️ Collecte de données sensibles - vérifiez la nécessité");
        }

        if (clauses.USER_RIGHTS?.detected) {
            recommendations.push("✓ Vos droits sont mentionnés - n'hésitez pas à les exercer");
        }

        if (recommendations.length === 0) {
            recommendations.push("✓ Politique globalement transparente");
        }

        return recommendations;
    }

    /**
     * Détecte si le langage est vague
     * @param {Object} nlpResults - Résultats NLP
     * @returns {boolean} True si vague
     */
    hasVagueLanguage(nlpResults) {
        const vagueTerms = ['may', 'might', 'could', 'possible', 'sometimes', 'generally'];
        const keywords = nlpResults.keywords || [];

        const vagueCount = keywords.filter(k =>
            vagueTerms.includes(k.word.toLowerCase())
        ).length;

        return vagueCount > 5;
    }

    /**
     * Vérifie si une date est obsolète (> 2 ans)
     * @param {string|Date} lastUpdated - Date de dernière mise à jour
     * @returns {boolean} True si obsolète
     */
    isOutdated(lastUpdated) {
        const date = new Date(lastUpdated);
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

        return date < twoYearsAgo;
    }

    /**
     * Compare avec la moyenne du marché
     * @param {number} score - Score à comparer
     * @returns {Object} Résultat de comparaison
     */
    compareWithMarket(score) {
        const marketAverage = 55; // Score moyen observé

        const difference = score - marketAverage;
        const percentile = this.calculatePercentile(score);

        return {
            score,
            marketAverage,
            difference,
            percentile,
            comparison: difference > 10 ? 'Mieux que la moyenne' :
                difference < -10 ? 'Moins bien que la moyenne' :
                    'Dans la moyenne'
        };
    }

    /**
     * Calcule le percentile du score
     * @param {number} score - Score à évaluer
     * @returns {number} Percentile (0-100)
     */
    calculatePercentile(score) {
        // Distribution approximative (courbe normale)
        // Score moyen = 55, écart-type = 20

        if (score >= 90) return 95;
        if (score >= 80) return 85;
        if (score >= 70) return 70;
        if (score >= 60) return 55;
        if (score >= 50) return 40;
        if (score >= 40) return 25;
        if (score >= 30) return 15;
        return 5;
    }
}

// Export instance singleton
export const riskScorer = new RiskScorer();
