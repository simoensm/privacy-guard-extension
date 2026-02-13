/**
 * Privacy Guard - NLP Analysis Engine
 * Moteur d'analyse linguistique pour documents légaux
 */

import { NLP_CONFIG, LIMITS } from '../utils/constants.js';

/**
 * Classe principale du moteur NLP
 */
export class NLPEngine {
    constructor() {
        this.stopwords = new Set([
            ...NLP_CONFIG.STOPWORDS_EN,
            ...NLP_CONFIG.STOPWORDS_FR
        ]);
    }

    /**
     * Analyse un document complet
     * @param {string} text - Texte du document à analyser
     * @param {string} language - Langue du document (en, fr, etc.)
     * @returns {Object} Résultats de l'analyse
     */
    async analyzeDocument(text, language = 'en') {
        try {
            // Vérification de la taille
            if (text.length > LIMITS.MAX_DOCUMENT_SIZE) {
                text = text.substring(0, LIMITS.MAX_DOCUMENT_SIZE);
            }

            // Nettoyage du texte
            const cleanedText = this.cleanText(text);

            // Tokenization
            const tokens = this.tokenize(cleanedText);

            // Extraction de phrases
            const sentences = this.extractSentences(cleanedText);

            // Statistiques de base
            const stats = this.calculateStats(tokens, sentences);

            // Extraction de mots-clés (TF-IDF simplifié)
            const keywords = this.extractKeywords(tokens, 15);

            // Analyse de lisibilité
            const readability = this.calculateReadability(sentences, tokens);

            // Extraction d'entités (dates, organisations, etc.)
            const entities = this.extractEntities(cleanedText);

            return {
                stats,
                keywords,
                readability,
                entities,
                sentences,
                language,
                processedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('[NLP Engine] Error analyzing document:', error);
            throw error;
        }
    }

    /**
     * Nettoie le texte (supprime HTML, caractères spéciaux, etc.)
     * @param {string} text - Texte brut
     * @returns {string} Texte nettoyé
     */
    cleanText(text) {
        return text
            // Suppression des balises HTML
            .replace(/<[^>]*>/g, ' ')
            // Suppression des entités HTML
            .replace(/&[a-z]+;/gi, ' ')
            // Suppression des URLs
            .replace(/https?:\/\/[^\s]+/g, ' ')
            // Suppression des emails
            .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, ' ')
            // Normalisation des espaces
            .replace(/\s+/g, ' ')
            // Suppression des espaces en début/fin
            .trim();
    }

    /**
     * Tokenization : découpe le texte en mots
     * @param {string} text - Texte à tokenizer
     * @returns {Array<string>} Liste de tokens
     */
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s'-]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 2 && !this.stopwords.has(token));
    }

    /**
     * Extrait les phrases du texte
     * @param {string} text - Texte à analyser
     * @returns {Array<string>} Liste de phrases
     */
    extractSentences(text) {
        // Découpage par ponctuation forte
        return text
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length >= NLP_CONFIG.SUMMARY.MIN_SENTENCE_LENGTH);
    }

    /**
     * Calcule les statistiques du document
     * @param {Array<string>} tokens - Tokens du document
     * @param {Array<string>} sentences - Phrases du document
     * @returns {Object} Statistiques
     */
    calculateStats(tokens, sentences) {
        const wordCount = tokens.length;
        const sentenceCount = sentences.length;
        const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);

        // Calcul du vocabulaire unique
        const uniqueWords = new Set(tokens);
        const vocabularyRichness = uniqueWords.size / Math.max(tokens.length, 1);

        return {
            wordCount,
            sentenceCount,
            uniqueWordCount: uniqueWords.size,
            avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
            vocabularyRichness: Math.round(vocabularyRichness * 100) / 100
        };
    }

    /**
     * Extraction de mots-clés par TF-IDF simplifié
     * @param {Array<string>} tokens - Tokens du document
     * @param {number} topN - Nombre de mots-clés à retourner
     * @returns {Array<Object>} Mots-clés avec scores
     */
    extractKeywords(tokens, topN = 10) {
        // Calcul des fréquences (TF)
        const frequency = {};
        tokens.forEach(token => {
            frequency[token] = (frequency[token] || 0) + 1;
        });

        // Tri par fréquence décroissante
        const sorted = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, topN);

        return sorted.map(([word, count]) => ({
            word,
            count,
            relevance: count / tokens.length
        }));
    }

    /**
     * Calcule le score de lisibilité (Flesch Reading Ease adapté)
     * @param {Array<string>} sentences - Phrases du document
     * @param {Array<string>} tokens - Mots du document
     * @returns {Object} Score et classification
     */
    calculateReadability(sentences, tokens) {
        const totalWords = tokens.length;
        const totalSentences = sentences.length;

        // Estimation du nombre de syllabes (approximation)
        const totalSyllables = tokens.reduce((sum, word) => {
            return sum + this.estimateSyllables(word);
        }, 0);

        // Formule de Flesch adaptée
        // Score = 206.835 - 1.015 * (mots/phrases) - 84.6 * (syllabes/mots)
        const avgWordsPerSentence = totalWords / Math.max(totalSentences, 1);
        const avgSyllablesPerWord = totalSyllables / Math.max(totalWords, 1);

        let score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

        // Normalisation entre 0 et 100
        score = Math.max(0, Math.min(100, score));

        // Classification
        let difficulty;
        if (score >= 70) difficulty = 'easy';
        else if (score >= 50) difficulty = 'medium';
        else if (score >= 30) difficulty = 'difficult';
        else difficulty = 'very_difficult';

        return {
            score: Math.round(score),
            difficulty,
            avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
            avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10
        };
    }

    /**
     * Estimation du nombre de syllabes dans un mot
     * @param {string} word - Mot à analyser
     * @returns {number} Nombre estimé de syllabes
     */
    estimateSyllables(word) {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;

        // Compte les voyelles
        const vowels = word.match(/[aeiouy]+/g);
        let count = vowels ? vowels.length : 1;

        // Ajustements
        if (word.endsWith('e')) count--;
        if (word.endsWith('le') && word.length > 2) count++;

        return Math.max(1, count);
    }

    /**
     * Extrait les entités nommées (organisations, dates, montants)
     * @param {string} text - Texte à analyser
     * @returns {Object} Entités extraites
     */
    extractEntities(text) {
        const entities = {
            organizations: [],
            dates: [],
            amounts: [],
            emails: [],
            phone_numbers: []
        };

        // Organisations (patterns simplifiés)
        const orgPatterns = [
            /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Inc|Corp|Ltd|LLC|GmbH|SA|SAS)\.?)/g,
            /([A-Z][A-Z]+(?:\s+[A-Z]+)*)/g  // Acronymes
        ];

        orgPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                entities.organizations.push(...matches.filter(m => m.length > 2));
            }
        });

        // Dates
        const datePatterns = [
            /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g,
            /\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/g,
            /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi
        ];

        datePatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) entities.dates.push(...matches);
        });

        // Montants
        const amountPattern = /[$€£]\s*\d+(?:[,\.]\d+)*(?:\.\d{2})?/g;
        const amounts = text.match(amountPattern);
        if (amounts) entities.amounts.push(...amounts);

        // Emails
        const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
        const emails = text.match(emailPattern);
        if (emails) entities.emails.push(...emails);

        // Numéros de téléphone
        const phonePattern = /(?:\+\d{1,3})?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
        const phones = text.match(phonePattern);
        if (phones) entities.phone_numbers.push(...phones);

        // Déduplicate et limite
        Object.keys(entities).forEach(key => {
            entities[key] = [...new Set(entities[key])].slice(0, 10);
        });

        return entities;
    }

    /**
     * Génère un résumé extractif du document
     * @param {Array<string>} sentences - Phrases du document
     * @param {number} maxSentences - Nombre max de phrases à retourner
     * @returns {Array<string>} Phrases les plus importantes
     */
    generateSummary(sentences, maxSentences = NLP_CONFIG.SUMMARY.MAX_SENTENCES) {
        // Filtre les phrases trop courtes ou trop longues
        const validSentences = sentences.filter(s =>
            s.length >= NLP_CONFIG.SUMMARY.MIN_SENTENCE_LENGTH &&
            s.length <= NLP_CONFIG.SUMMARY.MAX_SENTENCE_LENGTH
        );

        if (validSentences.length <= maxSentences) {
            return validSentences;
        }

        // Score chaque phrase
        const scoredSentences = validSentences.map(sentence => {
            // Calcul d'un score basé sur :
            // - Position dans le document (>0.0 = début)
            // - Longueur (phrases moyennes favorisées)
            // - Présence de mots-clés importants

            const position = sentences.indexOf(sentence) / sentences.length;
            const positionScore = 1 - position; // Favorise le début

            const length = sentence.split(/\s+/).length;
            const lengthScore = length > 10 && length < 30 ? 1 : 0.5;

            // Mots-clés importants
            const importantWords = ['must', 'will', 'may', 'collect', 'share', 'use', 'rights', 'data', 'information'];
            const keywordScore = importantWords.reduce((score, word) => {
                return score + (sentence.toLowerCase().includes(word) ? 0.2 : 0);
            }, 0);

            const totalScore = (positionScore * 0.4) + (lengthScore * 0.3) + (keywordScore * 0.3);

            return { sentence, score: totalScore };
        });

        // Tri par score et sélection
        return scoredSentences
            .sort((a, b) => b.score - a.score)
            .slice(0, maxSentences)
            .map(item => item.sentence);
    }

    /**
     * Détecte la langue du document
     * @param {string} text - Texte à analyser
     * @returns {string} Code de langue (en, fr, de, etc.)
     */
    detectLanguage(text) {
        // Méthode simple basée sur les mots communs
        const sample = text.toLowerCase().substring(0, 1000);

        const languageMarkers = {
            en: ['the', 'and', 'you', 'that', 'this', 'with', 'for', 'are'],
            fr: ['le', 'la', 'de', 'et', 'vous', 'que', 'pour', 'dans'],
            de: ['der', 'die', 'das', 'und', 'sie', 'ist', 'für', 'mit'],
            es: ['el', 'la', 'de', 'que', 'los', 'para', 'con', 'por'],
            it: ['il', 'di', 'che', 'per', 'con', 'una', 'sono', 'della']
        };

        const scores = {};

        for (const [lang, markers] of Object.entries(languageMarkers)) {
            scores[lang] = markers.reduce((score, marker) => {
                const regex = new RegExp(`\\b${marker}\\b`, 'g');
                const matches = sample.match(regex);
                return score + (matches ? matches.length : 0);
            }, 0);
        }

        // Retourne la langue avec le score le plus élevé
        return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    }
}

// Export instance singleton
export const nlpEngine = new NLPEngine();
