/**
 * Privacy Guard - LLM Service
 * Service d'intégration avec des Large Language Models pour l'analyse avancée
 */

import { LIMITS } from '../utils/constants.js';

/**
 * Configuration des APIs LLM
 */
const LLM_CONFIG = {
    // Gemini API (Google) - Free tier disponible
    GEMINI: {
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        model: 'gemini-pro',
        maxTokens: 2048
    },

    // Hugging Face Inference API - Gratuit pour modèles publics
    HUGGINGFACE: {
        endpoint: 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
        model: 'facebook/bart-large-cnn',
        maxTokens: 1024
    }
};

/**
 * Classe de service LLM
 */
class LLMService {
    constructor() {
        this.apiKey = null;
        this.provider = 'gemini'; // 'gemini' ou 'huggingface'
        this.cacheDuration = 24 * 60 * 60 * 1000; // 24 heures
        this.summaryCache = new Map();
    }

    /**
     * Configure l'API key
     * @param {string} apiKey - Clé API
     * @param {string} provider - Fournisseur ('gemini' ou 'huggingface')
     */
    configure(apiKey, provider = 'gemini') {
        this.apiKey = apiKey;
        this.provider = provider;
        console.log(`[LLM Service] Configured with ${provider}`);
    }

    /**
     * Vérifie si le service est configuré
     * @returns {boolean}
     */
    isConfigured() {
        return this.apiKey !== null;
    }

    /**
     * Résume un document avec LLM
     * @param {string} text - Texte à résumer
     * @param {Object} options - Options de résumé
     * @returns {Promise<Object>} Résumé généré
     */
    async summarizeDocument(text, options = {}) {
        const {
            maxLength = 500,
            focusAreas = ['privacy', 'data collection', 'third parties', 'user rights'],
            language = 'fr'
        } = options;

        // Vérifier le cache
        const cacheKey = this.getCacheKey(text, options);
        if (this.summaryCache.has(cacheKey)) {
            const cached = this.summaryCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheDuration) {
                console.log('[LLM Service] Returning cached summary');
                return cached.data;
            }
        }

        // Tronquer le texte si trop long
        const truncatedText = this.truncateText(text, 15000);

        try {
            let summary;

            if (this.isConfigured()) {
                // Utiliser l'API LLM
                summary = await this.callLLMAPI(truncatedText, options);
            } else {
                // Fallback : résumé extractif basique
                console.warn('[LLM Service] No API key configured, using fallback summarization');
                summary = this.fallbackSummarization(truncatedText, options);
            }

            // Mettre en cache
            this.summaryCache.set(cacheKey, {
                data: summary,
                timestamp: Date.now()
            });

            return summary;

        } catch (error) {
            console.error('[LLM Service] Error during summarization:', error);
            // Fallback en cas d'erreur
            return this.fallbackSummarization(truncatedText, options);
        }
    }

    /**
     * Appelle l'API LLM
     * @param {string} text - Texte à analyser
     * @param {Object} options - Options
     * @returns {Promise<Object>}
     */
    async callLLMAPI(text, options) {
        if (this.provider === 'gemini') {
            return await this.callGeminiAPI(text, options);
        } else {
            return await this.callHuggingFaceAPI(text, options);
        }
    }

    /**
     * Appelle l'API Gemini
     * @param {string} text - Texte à analyser
     * @param {Object} options - Options
     * @returns {Promise<Object>}
     */
    async callGeminiAPI(text, options) {
        const { language, focusAreas } = options;

        const prompt = this.buildPrompt(text, {
            task: 'summarize',
            language,
            focusAreas,
            format: 'structured'
        });

        const response = await fetch(`${LLM_CONFIG.GEMINI.endpoint}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: LLM_CONFIG.GEMINI.maxTokens,
                    topP: 0.8,
                    topK: 40
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return this.parseGeminiResponse(data);
    }

    /**
     * Appelle l'API Hugging Face
     * @param {string} text - Texte à analyser
     * @param {Object} options - Options
     * @returns {Promise<Object>}
     */
    async callHuggingFaceAPI(text, options) {
        const response = await fetch(LLM_CONFIG.HUGGINGFACE.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: text,
                parameters: {
                    max_length: 500,
                    min_length: 100,
                    do_sample: false
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Hugging Face API error: ${response.status}`);
        }

        const data = await response.json();
        return this.parseHuggingFaceResponse(data, options);
    }

    /**
     * Construit le prompt pour le LLM
     * @param {string} text - Texte source
     * @param {Object} config - Configuration du prompt
     * @returns {string}
     */
    buildPrompt(text, config) {
        const { task, language, focusAreas, format } = config;

        const languageInstructions = language === 'fr'
            ? 'Réponds en français.'
            : 'Respond in English.';

        const focusAreasText = focusAreas.join(', ');

        return `Analyze this privacy policy or terms of service document. ${languageInstructions}

Focus on these key areas: ${focusAreasText}

Provide a structured analysis with:
1. **Key Points** (3-5 most important points)
2. **Privacy Concerns** (data collection, sharing, retention)
3. **User Rights** (what users can do with their data)
4. **Third-Party Involvement** (who else gets the data)
5. **Risk Assessment** (overall privacy risk level: LOW, MEDIUM, or HIGH)

Document:
${text}

Format your response as JSON with this structure:
{
  "keyPoints": ["point 1", "point 2", ...],
  "concerns": ["concern 1", "concern 2", ...],
  "userRights": ["right 1", "right 2", ...],
  "thirdParties": ["party 1", "party 2", ...],
  "riskAssessment": {
    "level": "LOW|MEDIUM|HIGH",
    "reasoning": "brief explanation"
  },
  "summary": "2-3 sentence overall summary"
}`;
    }

    /**
     * Parse la réponse de Gemini
     * @param {Object} data - Réponse API
     * @returns {Object}
     */
    parseGeminiResponse(data) {
        try {
            const text = data.candidates[0].content.parts[0].text;

            // Essayer de parser comme JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    keyPoints: parsed.keyPoints || [],
                    concerns: parsed.concerns || [],
                    userRights: parsed.userRights || [],
                    thirdParties: parsed.thirdParties || [],
                    riskAssessment: parsed.riskAssessment || { level: 'MEDIUM', reasoning: '' },
                    summary: parsed.summary || text.substring(0, 300),
                    rawText: text,
                    source: 'gemini'
                };
            }

            // Fallback : parser le texte structuré
            return this.parseStructuredText(text);

        } catch (error) {
            console.error('[LLM Service] Error parsing Gemini response:', error);
            return this.createEmptyResponse();
        }
    }

    /**
     * Parse la réponse de Hugging Face
     * @param {Object} data - Réponse API
     * @param {Object} options - Options originales
     * @returns {Object}
     */
    parseHuggingFaceResponse(data, options) {
        try {
            const summaryText = Array.isArray(data) ? data[0].summary_text : data.summary_text;

            return {
                keyPoints: this.extractKeyPointsFromText(summaryText),
                concerns: [],
                userRights: [],
                thirdParties: [],
                riskAssessment: { level: 'MEDIUM', reasoning: 'Analysis based on summarization' },
                summary: summaryText,
                rawText: summaryText,
                source: 'huggingface'
            };

        } catch (error) {
            console.error('[LLM Service] Error parsing Hugging Face response:', error);
            return this.createEmptyResponse();
        }
    }

    /**
     * Parse un texte structuré
     * @param {string} text - Texte à parser
     * @returns {Object}
     */
    parseStructuredText(text) {
        const sections = {
            keyPoints: this.extractSection(text, ['key points', 'points clés']),
            concerns: this.extractSection(text, ['privacy concerns', 'préoccupations', 'concerns']),
            userRights: this.extractSection(text, ['user rights', 'droits']),
            thirdParties: this.extractSection(text, ['third-party', 'third party', 'tiers'])
        };

        return {
            ...sections,
            riskAssessment: this.extractRiskLevel(text),
            summary: this.extractSummary(text),
            rawText: text,
            source: 'parsed'
        };
    }

    /**
     * Extrait une section du texte
     * @param {string} text - Texte source
     * @param {Array} keywords - Mots-clés de section
     * @returns {Array}
     */
    extractSection(text, keywords) {
        const lines = text.split('\n');
        const items = [];
        let inSection = false;

        for (const line of lines) {
            const lineLower = line.toLowerCase();

            // Détecte le début d'une section
            if (keywords.some(kw => lineLower.includes(kw))) {
                inSection = true;
                continue;
            }

            // Détecte la fin d'une section (nouvelle section ou ligne vide)
            if (inSection && (line.trim() === '' || line.match(/^\*\*|^#/))) {
                inSection = false;
            }

            // Extrait les items
            if (inSection && line.trim()) {
                const cleaned = line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
                if (cleaned) items.push(cleaned);
            }
        }

        return items.slice(0, 5); // Limite à 5 items
    }

    /**
     * Extrait le niveau de risque
     * @param {string} text - Texte source
     * @returns {Object}
     */
    extractRiskLevel(text) {
        const textLower = text.toLowerCase();

        if (textLower.includes('risk') && textLower.includes('high')) {
            return { level: 'HIGH', reasoning: 'High privacy risk identified' };
        } else if (textLower.includes('risk') && textLower.includes('low')) {
            return { level: 'LOW', reasoning: 'Low privacy risk identified' };
        }

        return { level: 'MEDIUM', reasoning: 'Moderate privacy risk' };
    }

    /**
     * Extrait le résumé
     * @param {string} text - Texte source
     * @returns {string}
     */
    extractSummary(text) {
        const summaryMatch = text.match(/summary[:\s]+(.*?)(?:\n\n|\*\*|$)/i);
        if (summaryMatch) {
            return summaryMatch[1].trim();
        }

        // Prendre les 2 premières phrases
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        return sentences.slice(0, 2).join('. ') + '.';
    }

    /**
     * Extrait les points clés d'un texte
     * @param {string} text - Texte source
     * @returns {Array}
     */
    extractKeyPointsFromText(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        return sentences.slice(0, 5);
    }

    /**
     * Résumé de fallback sans LLM
     * @param {string} text - Texte à résumer
     * @param {Object} options - Options
     * @returns {Object}
     */
    fallbackSummarization(text, options) {
        // Résumé extractif simple
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        const keywords = ['data', 'information', 'privacy', 'collect', 'share', 'third party',
            'données', 'informations', 'confidentialité', 'partager', 'tiers'];

        // Scorer les phrases par pertinence
        const scoredSentences = sentences.map(sentence => {
            const score = keywords.reduce((acc, kw) => {
                return acc + (sentence.toLowerCase().includes(kw) ? 1 : 0);
            }, 0);
            return { sentence: sentence.trim(), score };
        });

        // Prendre les phrases les plus pertinentes
        const topSentences = scoredSentences
            .sort((a, b) => b.score - a.score)
            .slice(0, 7)
            .map(s => s.sentence);

        return {
            keyPoints: topSentences.slice(0, 5),
            concerns: topSentences.filter(s =>
                s.toLowerCase().includes('collect') ||
                s.toLowerCase().includes('share') ||
                s.toLowerCase().includes('partager')
            ).slice(0, 3),
            userRights: topSentences.filter(s =>
                s.toLowerCase().includes('right') ||
                s.toLowerCase().includes('droit') ||
                s.toLowerCase().includes('access')
            ).slice(0, 3),
            thirdParties: topSentences.filter(s =>
                s.toLowerCase().includes('third party') ||
                s.toLowerCase().includes('tiers') ||
                s.toLowerCase().includes('partner')
            ).slice(0, 3),
            riskAssessment: {
                level: 'MEDIUM',
                reasoning: 'Basic extractive analysis (no LLM configured)'
            },
            summary: topSentences.slice(0, 2).join(' '),
            rawText: topSentences.join(' '),
            source: 'fallback'
        };
    }

    /**
     * Tronque un texte
     * @param {string} text - Texte source
     * @param {number} maxChars - Nombre max de caractères
     * @returns {string}
     */
    truncateText(text, maxChars) {
        if (text.length <= maxChars) return text;
        return text.substring(0, maxChars) + '...';
    }

    /**
     * Génère une clé de cache
     * @param {string} text - Texte
     * @param {Object} options - Options
     * @returns {string}
     */
    getCacheKey(text, options) {
        const textHash = this.simpleHash(text.substring(0, 1000));
        const optionsHash = JSON.stringify(options);
        return `${textHash}_${this.simpleHash(optionsHash)}`;
    }

    /**
     * Hash simple pour le cache
     * @param {string} str - String à hasher
     * @returns {string}
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    /**
     * Crée une réponse vide
     * @returns {Object}
     */
    createEmptyResponse() {
        return {
            keyPoints: [],
            concerns: [],
            userRights: [],
            thirdParties: [],
            riskAssessment: { level: 'MEDIUM', reasoning: 'Unable to analyze' },
            summary: 'Unable to generate summary',
            rawText: '',
            source: 'error'
        };
    }

    /**
     * Vide le cache
     */
    clearCache() {
        this.summaryCache.clear();
        console.log('[LLM Service] Cache cleared');
    }
}

// Export instance singleton
export const llmService = new LLMService();
