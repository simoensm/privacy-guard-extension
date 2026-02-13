/**
 * Privacy Guard - Storage Utility
 * Helpers pour la gestion du stockage Chrome
 */

import { STORAGE_CONFIG } from './constants.js';

/**
 * Classe utilitaire pour le stockage
 */
export class StorageManager {
    /**
     * Récupère une valeur du storage
     * @param {string} key - Clé de stockage
     * @returns {Promise<any>} Valeur stockée
     */
    static async get(key) {
        try {
            const result = await chrome.storage.local.get(key);
            return result[key] || null;
        } catch (error) {
            console.error('[Storage] Error getting value:', error);
            return null;
        }
    }

    /**
     * Stocke une valeur
     * @param {string} key - Clé de stockage
     * @param {any} value - Valeur à stocker
     * @returns {Promise<boolean>} Succès
     */
    static async set(key, value) {
        try {
            await chrome.storage.local.set({ [key]: value });
            return true;
        } catch (error) {
            console.error('[Storage] Error setting value:', error);
            return false;
        }
    }

    /**
     * Supprime une valeur
     * @param {string} key - Clé à supprimer
     * @returns {Promise<boolean>} Succès
     */
    static async remove(key) {
        try {
            await chrome.storage.local.remove(key);
            return true;
        } catch (error) {
            console.error('[Storage] Error removing value:', error);
            return false;
        }
    }

    /**
     * Vide tout le storage
     * @returns {Promise<boolean>} Succès
     */
    static async clear() {
        try {
            await chrome.storage.local.clear();
            return true;
        } catch (error) {
            console.error('[Storage] Error clearing storage:', error);
            return false;
        }
    }

    /**
     * Récupère toutes les analyses en cache
     * @returns {Promise<Object>} Analyses
     */
    static async getAllAnalyses() {
        return await this.get(STORAGE_CONFIG.KEYS.ANALYSES) || {};
    }

    /**
     * Sauvegarde une analyse
     * @param {string} url - URL du site
     * @param {Object} analysis - Données d'analyse
     * @returns {Promise<boolean>} Succès
     */
    static async saveAnalysis(url, analysis) {
        const analyses = await this.getAllAnalyses();
        analyses[url] = {
            ...analysis,
            savedAt: new Date().toISOString()
        };

        // Nettoyage si trop d'entrées
        const entries = Object.entries(analyses);
        if (entries.length > STORAGE_CONFIG.MAX_CACHE_ENTRIES) {
            // Garder seulement les plus récentes
            const sorted = entries.sort((a, b) =>
                new Date(b[1].analyzedAt) - new Date(a[1].analyzedAt)
            );
            const toKeep = sorted.slice(0, STORAGE_CONFIG.MAX_CACHE_ENTRIES);
            analyses = Object.fromEntries(toKeep);
        }

        return await this.set(STORAGE_CONFIG.KEYS.ANALYSES, analyses);
    }

    /**
     * Récupère une analyse pour une URL
     * @param {string} url - URL du site
     * @returns {Promise<Object|null>} Analyse ou null
     */
    static async getAnalysis(url) {
        const analyses = await this.getAllAnalyses();
        const analysis = analyses[url];

        if (!analysis) return null;

        // Vérifier si le cache est encore valide
        const age = Date.now() - new Date(analysis.analyzedAt).getTime();
        if (age > STORAGE_CONFIG.CACHE_DURATION) {
            // Cache expiré, supprimer
            delete analyses[url];
            await this.set(STORAGE_CONFIG.KEYS.ANALYSES, analyses);
            return null;
        }

        return analysis;
    }

    /**
     * Récupère les paramètres utilisateur
     * @returns {Promise<Object>} Paramètres
     */
    static async getSettings() {
        const settings = await this.get(STORAGE_CONFIG.KEYS.SETTINGS);

        // Paramètres par défaut
        return {
            autoAnalyze: true,
            showBadge: true,
            language: 'en',
            notificationsEnabled: true,
            ...settings
        };
    }

    /**
     * Met à jour les paramètres
     * @param {Object} updates - Paramètres à mettre à jour
     * @returns {Promise<boolean>} Succès
     */
    static async updateSettings(updates) {
        const currentSettings = await this.getSettings();
        const newSettings = { ...currentSettings, ...updates };
        return await this.set(STORAGE_CONFIG.KEYS.SETTINGS, newSettings);
    }

    /**
     * Ajoute un site à l'historique des visites
     * @param {string} url - URL du site
     * @returns {Promise<boolean>} Succès
     */
    static async addVisitedSite(url) {
        const visited = await this.get(STORAGE_CONFIG.KEYS.VISITED_SITES) || [];

        // Ajouter si pas déjà présent
        if (!visited.includes(url)) {
            visited.push(url);

            // Limiter à 1000 entrées
            if (visited.length > 1000) {
                visited.shift(); // Supprimer la plus ancienne
            }

            return await this.set(STORAGE_CONFIG.KEYS.VISITED_SITES, visited);
        }

        return true;
    }

    /**
     * Récupère les statistiques d'utilisation
     * @returns {Promise<Object>} Statistiques
     */
    static async getStats() {
        const analyses = await this.getAllAnalyses();
        const visited = await this.get(STORAGE_CONFIG.KEYS.VISITED_SITES) || [];

        const analysisResults = Object.values(analyses);

        // Calculs statistiques
        const totalAnalyses = analysisResults.length;
        const avgScore = totalAnalyses > 0
            ? analysisResults.reduce((sum, a) => sum + a.score.score, 0) / totalAnalyses
            : 0;

        const riskDistribution = {
            low: analysisResults.filter(a => a.score.riskLevel.level === 'LOW').length,
            medium: analysisResults.filter(a => a.score.riskLevel.level === 'MEDIUM').length,
            high: analysisResults.filter(a => a.score.riskLevel.level === 'HIGH').length
        };

        return {
            totalAnalyses,
            totalVisitedSites: visited.length,
            avgScore: Math.round(avgScore),
            riskDistribution,
            mostRecentAnalysis: analysisResults.length > 0
                ? analysisResults.sort((a, b) =>
                    new Date(b.analyzedAt) - new Date(a.analyzedAt)
                )[0]
                : null
        };
    }

    /**
     * Exporte toutes les données (pour sauvegarde)
     * @returns {Promise<Object>} Toutes les données
     */
    static async exportAll() {
        const data = await chrome.storage.local.get(null);
        return {
            exportedAt: new Date().toISOString(),
            version: '1.0.0',
            data
        };
    }

    /**
     * Importe des données (restauration)
     * @param {Object} exportedData - Données exportées
     * @returns {Promise<boolean>} Succès
     */
    static async importAll(exportedData) {
        try {
            if (!exportedData.data) {
                throw new Error('Invalid export format');
            }

            await chrome.storage.local.clear();
            await chrome.storage.local.set(exportedData.data);

            return true;
        } catch (error) {
            console.error('[Storage] Error importing data:', error);
            return false;
        }
    }

    /**
     * Calcule la taille utilisée du storage
     * @returns {Promise<number>} Taille en bytes
     */
    static async getStorageSize() {
        const data = await chrome.storage.local.get(null);
        const jsonString = JSON.stringify(data);
        return new Blob([jsonString]).size;
    }

    /**
     * Nettoie les analyses expirées
     * @returns {Promise<number>} Nombre d'entrées supprimées
     */
    static async cleanExpiredAnalyses() {
        const analyses = await this.getAllAnalyses();
        let removed = 0;

        const validAnalyses = {};
        const now = Date.now();

        for (const [url, analysis] of Object.entries(analyses)) {
            const age = now - new Date(analysis.analyzedAt).getTime();

            if (age <= STORAGE_CONFIG.CACHE_DURATION) {
                validAnalyses[url] = analysis;
            } else {
                removed++;
            }
        }

        if (removed > 0) {
            await this.set(STORAGE_CONFIG.KEYS.ANALYSES, validAnalyses);
        }

        return removed;
    }
}

// Export par défaut
export default StorageManager;
