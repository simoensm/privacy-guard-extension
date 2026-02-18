/**
 * Privacy Guard - GDPR Risk Scorer v2
 * 
 * PHILOSOPHY: Score = 100 - (missing GDPR requirements) - (active violations)
 * A GDPR-compliant site that:
 *   - Has a privacy policy ✓
 *   - Has a cookie policy ✓
 *   - Mentions user rights ✓
 *   - Has clear language ✓
 *   - Has contact info ✓
 *   - Has consent mechanism ✓
 *   - Specifies retention periods ✓
 *   - Specifies legal basis ✓
 * Should score 90-100.
 */

import { SCORING_CONFIG, NLP_CONFIG } from '../utils/constants.js';

export class RiskScorer {
    constructor() {
        this.config = SCORING_CONFIG;
    }

    /**
     * Calculate the GDPR compliance score
     * @param {Object} analysisData - Complete analysis data
     * @returns {Object} Score, risk level, breakdown, recommendations
     */
    calculateTransparencyScore(analysisData) {
        const {
            nlpResults,
            clauseDetection,
            documentMeta,
            pageInfo,
            cookieAnalysis,
            consentBanner,
            fetchedPages
        } = analysisData;

        // Start with 100
        let score = this.config.BASE_SCORE;

        // Track all deductions and passes for breakdown
        const checklistResults = {};
        const violationResults = {};

        // ===============================
        // STEP 1: GDPR COMPLIANCE CHECKLIST
        // ===============================
        score = this.evaluateGDPRChecklist(
            score, analysisData, checklistResults
        );

        // ===============================
        // STEP 2: VIOLATION PENALTIES
        // ===============================
        score = this.evaluateViolations(
            score, analysisData, violationResults
        );

        // Clamp between 0 and 100
        score = Math.max(0, Math.min(100, Math.round(score)));

        // Determine risk level
        const riskLevel = this.determineRiskLevel(score);

        // Calculate confidence
        const confidence = this.calculateScoreConfidence(analysisData);

        return {
            score,
            riskLevel,
            confidence,
            breakdown: {
                baseScore: this.config.BASE_SCORE,
                checklist: checklistResults,
                violations: violationResults,
                finalScore: score
            },
            recommendations: this.generateRecommendations(
                score, checklistResults, violationResults, clauseDetection
            )
        };
    }

    /**
     * Evaluate GDPR compliance checklist
     * Each missing requirement results in a deduction
     */
    evaluateGDPRChecklist(score, data, results) {
        const { nlpResults, clauseDetection, documentMeta, pageInfo,
            cookieAnalysis, consentBanner, fetchedPages } = data;
        const checklist = this.config.GDPR_CHECKLIST;
        const text = data.rawContent || '';
        const lowerText = text.toLowerCase();

        // --- HAS_PRIVACY_POLICY ---
        const hasPrivacyPolicy = documentMeta.hasPrivacyPolicy ||
            (fetchedPages && fetchedPages.some(p => p.category === 'PRIVACY_POLICY'));
        this._checkItem(results, 'HAS_PRIVACY_POLICY', checklist.HAS_PRIVACY_POLICY, (score_ref) => {
            return hasPrivacyPolicy;
        });
        if (!hasPrivacyPolicy) score += checklist.HAS_PRIVACY_POLICY.deductionIfMissing;

        // --- HAS_COOKIE_POLICY ---
        const hasCookiePolicy = documentMeta.hasCookiePolicy ||
            (fetchedPages && fetchedPages.some(p => p.category === 'COOKIE_POLICY'));
        this._checkItem(results, 'HAS_COOKIE_POLICY', checklist.HAS_COOKIE_POLICY, () => {
            return hasCookiePolicy;
        });
        if (!hasCookiePolicy) score += checklist.HAS_COOKIE_POLICY.deductionIfMissing;

        // --- MENTIONS_USER_RIGHTS ---
        const mentionsUserRights = clauseDetection?.detectedClauses?.USER_RIGHTS?.detected ||
            /right.*(access|deletion|erasure|rectification|portability)/i.test(lowerText) ||
            /droit.*(accès|effacement|rectification|portabilité)/i.test(lowerText);
        this._checkItem(results, 'MENTIONS_USER_RIGHTS', checklist.MENTIONS_USER_RIGHTS, () => {
            return mentionsUserRights;
        });
        if (!mentionsUserRights) score += checklist.MENTIONS_USER_RIGHTS.deductionIfMissing;

        // --- RIGHT_TO_OPT_OUT ---
        const hasOptOut = NLP_CONFIG.OPT_OUT_KEYWORDS.some(k => lowerText.includes(k));
        this._checkItem(results, 'RIGHT_TO_OPT_OUT', checklist.RIGHT_TO_OPT_OUT, () => {
            return hasOptOut;
        });
        if (!hasOptOut) score += checklist.RIGHT_TO_OPT_OUT.deductionIfMissing;

        // --- HAS_CONTACT_INFO ---
        const hasContact = documentMeta.hasContactInfo || false;
        this._checkItem(results, 'HAS_CONTACT_INFO', checklist.HAS_CONTACT_INFO, () => {
            return hasContact;
        });
        if (!hasContact) score += checklist.HAS_CONTACT_INFO.deductionIfMissing;

        // --- CLEAR_LANGUAGE ---
        const readabilityScore = nlpResults?.readability?.score || 50;
        const hasClearLanguage = readabilityScore >= 45; // Reasonable threshold
        this._checkItem(results, 'CLEAR_LANGUAGE', checklist.CLEAR_LANGUAGE, () => {
            return hasClearLanguage;
        });
        if (!hasClearLanguage) score += checklist.CLEAR_LANGUAGE.deductionIfMissing;

        // --- HAS_CONSENT_MECHANISM ---
        const hasConsent = consentBanner?.detected ||
            /cookie.*(consent|banner|notice)/i.test(lowerText) ||
            /consent.*mechanism/i.test(lowerText);
        this._checkItem(results, 'HAS_CONSENT_MECHANISM', checklist.HAS_CONSENT_MECHANISM, () => {
            return hasConsent;
        });
        if (!hasConsent) score += checklist.HAS_CONSENT_MECHANISM.deductionIfMissing;

        // --- CONSENT_HAS_REJECT ---
        const hasReject = consentBanner?.hasRejectAll || consentBanner?.hasCustomize ||
            /reject.*cookie/i.test(lowerText) || /refuse.*cookie/i.test(lowerText);
        this._checkItem(results, 'CONSENT_HAS_REJECT', checklist.CONSENT_HAS_REJECT, () => {
            return hasReject;
        });
        if (!hasReject) score += checklist.CONSENT_HAS_REJECT.deductionIfMissing;

        // --- SPECIFIES_RETENTION ---
        const specifiesRetention = clauseDetection?.detectedClauses?.DATA_RETENTION?.detected ||
            /retention.*period/i.test(lowerText) ||
            /durée.*conservation/i.test(lowerText) ||
            /\d+\s*(days?|months?|years?|jours?|mois|ans?)/i.test(lowerText);
        this._checkItem(results, 'SPECIFIES_RETENTION', checklist.SPECIFIES_RETENTION, () => {
            return specifiesRetention;
        });
        if (!specifiesRetention) score += checklist.SPECIFIES_RETENTION.deductionIfMissing;

        // --- SPECIFIES_LEGAL_BASIS ---
        const specifiesLegalBasis = NLP_CONFIG.LEGAL_BASIS_KEYWORDS.some(k =>
            lowerText.includes(k.toLowerCase())
        );
        this._checkItem(results, 'SPECIFIES_LEGAL_BASIS', checklist.SPECIFIES_LEGAL_BASIS, () => {
            return specifiesLegalBasis;
        });
        if (!specifiesLegalBasis) score += checklist.SPECIFIES_LEGAL_BASIS.deductionIfMissing;

        // --- EASY_TO_FIND ---
        const easyToFind = pageInfo?.easyToFind || false;
        this._checkItem(results, 'EASY_TO_FIND', checklist.EASY_TO_FIND, () => {
            return easyToFind;
        });
        if (!easyToFind) score += checklist.EASY_TO_FIND.deductionIfMissing;

        // --- RECENTLY_UPDATED ---
        const recentlyUpdated = documentMeta.lastUpdated &&
            !this.isOutdated(documentMeta.lastUpdated);
        this._checkItem(results, 'RECENTLY_UPDATED', checklist.RECENTLY_UPDATED, () => {
            return recentlyUpdated;
        });
        if (!recentlyUpdated) score += checklist.RECENTLY_UPDATED.deductionIfMissing;

        return score;
    }

    /**
     * Evaluate active violations
     */
    evaluateViolations(score, data, results) {
        const { clauseDetection, cookieAnalysis, nlpResults } = data;
        const violations = this.config.VIOLATION_PENALTIES;
        const text = data.rawContent || '';
        const lowerText = text.toLowerCase();
        const detectedClauses = clauseDetection?.detectedClauses || {};

        // --- DATA_SELLING ---
        if (detectedClauses.DATA_SELLING?.detected) {
            score += violations.DATA_SELLING.penalty;
            results.DATA_SELLING = {
                applied: true,
                penalty: violations.DATA_SELLING.penalty,
                label: violations.DATA_SELLING.label
            };
        }

        // --- EXCESSIVE_TRACKING ---
        const trackerCount = cookieAnalysis?.trackers?.length || 0;
        if (trackerCount > violations.EXCESSIVE_TRACKING.threshold) {
            score += violations.EXCESSIVE_TRACKING.penalty;
            results.EXCESSIVE_TRACKING = {
                applied: true,
                penalty: violations.EXCESSIVE_TRACKING.penalty,
                label: violations.EXCESSIVE_TRACKING.label,
                details: `${trackerCount} trackers detected`
            };
        }

        // --- SENSITIVE_DATA_NO_CONSENT ---
        if (detectedClauses.SENSITIVE_DATA_COLLECTION?.detected) {
            score += violations.SENSITIVE_DATA_NO_CONSENT.penalty;
            results.SENSITIVE_DATA_NO_CONSENT = {
                applied: true,
                penalty: violations.SENSITIVE_DATA_NO_CONSENT.penalty,
                label: violations.SENSITIVE_DATA_NO_CONSENT.label
            };
        }

        // --- INTERNATIONAL_TRANSFER_NO_SAFEGUARDS ---
        if (detectedClauses.INTERNATIONAL_TRANSFER?.detected) {
            // Check if safeguards are mentioned
            const hasSafeguards = /standard contractual|adequacy decision|binding corporate|privacy shield/i.test(lowerText);
            if (!hasSafeguards) {
                score += violations.INTERNATIONAL_TRANSFER_NO_SAFEGUARDS.penalty;
                results.INTERNATIONAL_TRANSFER_NO_SAFEGUARDS = {
                    applied: true,
                    penalty: violations.INTERNATIONAL_TRANSFER_NO_SAFEGUARDS.penalty,
                    label: violations.INTERNATIONAL_TRANSFER_NO_SAFEGUARDS.label
                };
            }
        }

        // --- MANDATORY_ARBITRATION ---
        if (detectedClauses.MANDATORY_ARBITRATION?.detected) {
            score += violations.MANDATORY_ARBITRATION.penalty;
            results.MANDATORY_ARBITRATION = {
                applied: true,
                penalty: violations.MANDATORY_ARBITRATION.penalty,
                label: violations.MANDATORY_ARBITRATION.label
            };
        }

        // --- VAGUE_LANGUAGE ---
        if (this.hasVagueLanguage(nlpResults)) {
            score += violations.VAGUE_LANGUAGE.penalty;
            results.VAGUE_LANGUAGE = {
                applied: true,
                penalty: violations.VAGUE_LANGUAGE.penalty,
                label: violations.VAGUE_LANGUAGE.label
            };
        }

        // --- VERY_LONG_DOCUMENT ---
        const wordCount = nlpResults?.stats?.wordCount || 0;
        if (wordCount > violations.VERY_LONG_DOCUMENT.threshold) {
            score += violations.VERY_LONG_DOCUMENT.penalty;
            results.VERY_LONG_DOCUMENT = {
                applied: true,
                penalty: violations.VERY_LONG_DOCUMENT.penalty,
                label: violations.VERY_LONG_DOCUMENT.label,
                details: `${wordCount} words`
            };
        }

        // --- THIRD_PARTY_SHARING ---
        if (detectedClauses.THIRD_PARTY_SHARING?.detected) {
            score += violations.THIRD_PARTY_SHARING.penalty;
            results.THIRD_PARTY_SHARING = {
                applied: true,
                penalty: violations.THIRD_PARTY_SHARING.penalty,
                label: violations.THIRD_PARTY_SHARING.label
            };
        }

        return score;
    }

    /**
     * Helper to record checklist item results
     */
    _checkItem(results, key, config, evaluator) {
        const passed = evaluator();
        results[key] = {
            passed,
            deduction: passed ? 0 : config.deductionIfMissing,
            label: config.label,
            labelFr: config.labelFr
        };
    }

    /**
     * Determine risk level based on score (4-tier system)
     */
    determineRiskLevel(score) {
        const levels = this.config.RISK_LEVELS;

        if (score >= levels.EXCELLENT.min) {
            return {
                level: 'EXCELLENT',
                label: levels.EXCELLENT.label,
                labelFr: levels.EXCELLENT.labelFr,
                color: levels.EXCELLENT.color,
                icon: '✓',
                description: 'Fully GDPR compliant — transparent and respectful',
                descriptionFr: 'Pleinement conforme RGPD — transparent et respectueux'
            };
        } else if (score >= levels.GOOD.min) {
            return {
                level: 'GOOD',
                label: levels.GOOD.label,
                labelFr: levels.GOOD.labelFr,
                color: levels.GOOD.color,
                icon: '✓',
                description: 'Mostly compliant — minor improvements possible',
                descriptionFr: 'Globalement conforme — améliorations mineures possibles'
            };
        } else if (score >= levels.CONCERNING.min) {
            return {
                level: 'CONCERNING',
                label: levels.CONCERNING.label,
                labelFr: levels.CONCERNING.labelFr,
                color: levels.CONCERNING.color,
                icon: '!',
                description: 'Notable GDPR gaps — review before accepting',
                descriptionFr: 'Lacunes RGPD notables — à examiner avant acceptation'
            };
        } else {
            return {
                level: 'POOR',
                label: levels.POOR.label,
                labelFr: levels.POOR.labelFr,
                color: levels.POOR.color,
                icon: '⚠',
                description: 'Major GDPR violations — use with extreme caution',
                descriptionFr: 'Violations majeures du RGPD — à utiliser avec grande précaution'
            };
        }
    }

    /**
     * Calculate confidence in the score
     */
    calculateScoreConfidence(analysisData) {
        let confidence = 0;

        // More data analyzed = higher confidence
        const hasContent = (analysisData.rawContent?.length || 0) > 200;
        const hasClauses = (analysisData.clauseDetection?.clauseCount || 0) > 0;
        const hasNlp = (analysisData.nlpResults?.stats?.wordCount || 0) > 100;
        const hasMetadata = analysisData.documentMeta?.hasContactInfo;
        const hasCookieData = !!analysisData.cookieAnalysis;
        const hasFetchedPages = (analysisData.fetchedPages?.length || 0) > 0;

        if (hasContent) confidence += 0.2;
        if (hasClauses) confidence += 0.2;
        if (hasNlp) confidence += 0.15;
        if (hasMetadata) confidence += 0.15;
        if (hasCookieData) confidence += 0.15;
        if (hasFetchedPages) confidence += 0.15;

        return Math.min(1, confidence);
    }

    /**
     * Generate recommendations
     */
    generateRecommendations(score, checklist, violations, clauseDetection) {
        const recommendations = [];

        // Recommendations from missing checklist items
        for (const [key, item] of Object.entries(checklist)) {
            if (!item.passed) {
                const rec = this._getChecklistRecommendation(key);
                if (rec) recommendations.push(rec);
            }
        }

        // Recommendations from violations
        for (const [key, item] of Object.entries(violations)) {
            if (item.applied) {
                const rec = this._getViolationRecommendation(key);
                if (rec) recommendations.push(rec);
            }
        }

        // Positive feedback
        const passedCount = Object.values(checklist).filter(i => i.passed).length;
        const totalCount = Object.keys(checklist).length;

        if (passedCount === totalCount && Object.keys(violations).length === 0) {
            recommendations.unshift('✅ Excellent! This site appears fully GDPR compliant.');
        } else if (passedCount >= totalCount * 0.8) {
            recommendations.unshift('✓ Good overall compliance with minor improvements needed.');
        }

        if (recommendations.length === 0) {
            recommendations.push('ℹ️ Analysis complete. Review the breakdown for details.');
        }

        return recommendations.slice(0, 8); // Max 8 recommendations
    }

    /**
     * Get recommendation text for missing checklist item
     */
    _getChecklistRecommendation(key) {
        const recs = {
            HAS_PRIVACY_POLICY: '🔴 No privacy policy found — this is a GDPR requirement',
            HAS_COOKIE_POLICY: '⚠️ No cookie policy found — required if cookies are used',
            MENTIONS_USER_RIGHTS: '⚠️ User rights (access, deletion, portability) not mentioned',
            RIGHT_TO_OPT_OUT: '⚠️ No opt-out mechanism mentioned',
            HAS_CONTACT_INFO: '⚠️ No DPO or privacy contact information found',
            CLEAR_LANGUAGE: '⚠️ Policy uses complex language — should be easily understandable',
            HAS_CONSENT_MECHANISM: '⚠️ No cookie consent mechanism detected',
            CONSENT_HAS_REJECT: '⚠️ Cookie consent doesn\'t offer a reject/decline option',
            SPECIFIES_RETENTION: 'ℹ️ Data retention periods not specified',
            SPECIFIES_LEGAL_BASIS: 'ℹ️ Legal basis for data processing not stated',
            EASY_TO_FIND: 'ℹ️ Privacy policy not easily accessible from main navigation',
            RECENTLY_UPDATED: 'ℹ️ Privacy policy may be outdated (> 2 years old)'
        };
        return recs[key] || null;
    }

    /**
     * Get recommendation text for violations
     */
    _getViolationRecommendation(key) {
        const recs = {
            DATA_SELLING: '🔴 This site may sell your personal data — consider alternatives',
            EXCESSIVE_TRACKING: '⚠️ Excessive tracking detected — consider using a tracker blocker',
            NO_OPT_OUT_TRACKERS: '⚠️ Tracking without clear opt-out mechanism',
            SENSITIVE_DATA_NO_CONSENT: '⚠️ Sensitive data collection detected — verify necessity',
            INTERNATIONAL_TRANSFER_NO_SAFEGUARDS: '⚠️ Data transferred outside EU without stated GDPR safeguards',
            MANDATORY_ARBITRATION: '⚠️ Mandatory arbitration clause — limits your legal recourse',
            VAGUE_LANGUAGE: 'ℹ️ Policy uses vague language (may, might, sometimes)',
            VERY_LONG_DOCUMENT: 'ℹ️ Excessively long privacy document — may obscure important details',
            THIRD_PARTY_SHARING: 'ℹ️ Your data may be shared with third parties'
        };
        return recs[key] || null;
    }

    /**
     * Detect vague language usage
     */
    hasVagueLanguage(nlpResults) {
        const vagueTerms = ['may', 'might', 'could', 'possible', 'possibly',
            'sometimes', 'generally', 'usually', 'approximately',
            'from time to time', 'as needed', 'if applicable'];
        const keywords = nlpResults?.keywords || [];
        const vagueCount = keywords.filter(k =>
            vagueTerms.includes(k.word.toLowerCase())
        ).length;
        return vagueCount > 3;
    }

    /**
     * Check if a date is outdated (> 2 years)
     */
    isOutdated(lastUpdated) {
        try {
            const date = new Date(lastUpdated);
            if (isNaN(date.getTime())) return true; // Can't parse = assume outdated
            const twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
            return date < twoYearsAgo;
        } catch {
            return true;
        }
    }

    /**
     * Compare with market average
     */
    compareWithMarket(score) {
        const marketAverage = 62; // Updated average for GDPR era

        return {
            score,
            marketAverage,
            difference: score - marketAverage,
            percentile: this.calculatePercentile(score),
            comparison: score > marketAverage + 10 ? 'Above average' :
                score < marketAverage - 10 ? 'Below average' : 'Average'
        };
    }

    /**
     * Calculate percentile
     */
    calculatePercentile(score) {
        if (score >= 95) return 99;
        if (score >= 90) return 95;
        if (score >= 80) return 85;
        if (score >= 70) return 70;
        if (score >= 60) return 50;
        if (score >= 50) return 35;
        if (score >= 40) return 20;
        if (score >= 30) return 10;
        return 5;
    }
}

// Export singleton
export const riskScorer = new RiskScorer();
