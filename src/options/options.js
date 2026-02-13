/**
 * Privacy Guard - Options Page Script
 * Handles settings management
 */

import { STORAGE_CONFIG } from '../utils/constants.js';

// Elements
const elements = {
    autoAnalyze: document.getElementById('autoAnalyze'),
    showBadge: document.getElementById('showBadge'),
    notifications: document.getElementById('notifications'),
    language: document.getElementById('language'),
    clearCache: document.getElementById('clearCache'),
    exportData: document.getElementById('exportData'),
    statusMessage: document.getElementById('statusMessage')
};

/**
 * Initialize options page
 */
async function init() {
    // Load current settings
    await loadSettings();

    // Setup event listeners
    setupEventListeners();
}

/**
 * Load settings from storage
 */
async function loadSettings() {
    try {
        const settings = await chrome.storage.local.get([
            STORAGE_CONFIG.KEYS.SETTINGS
        ]);

        const userSettings = settings[STORAGE_CONFIG.KEYS.SETTINGS] || {};

        // Apply settings to UI
        elements.autoAnalyze.checked = userSettings.autoAnalyze !== false;
        elements.showBadge.checked = userSettings.showBadge !== false;
        elements.notifications.checked = userSettings.notificationsEnabled !== false;
        elements.language.value = userSettings.language || 'en';

    } catch (error) {
        console.error('[Options] Error loading settings:', error);
        showStatus('Error loading settings', 'error');
    }
}

/**
 * Save settings to storage
 */
async function saveSettings() {
    try {
        const newSettings = {
            autoAnalyze: elements.autoAnalyze.checked,
            showBadge: elements.showBadge.checked,
            notificationsEnabled: elements.notifications.checked,
            language: elements.language.value
        };

        await chrome.storage.local.set({
            [STORAGE_CONFIG.KEYS.SETTINGS]: newSettings
        });

        showStatus('Settings saved successfully', 'success');

        // Notify background script of settings change
        chrome.runtime.sendMessage({
            type: 'SETTINGS_UPDATED',
            settings: newSettings
        });

    } catch (error) {
        console.error('[Options] Error saving settings:', error);
        showStatus('Error saving settings', 'error');
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Auto-save on change
    elements.autoAnalyze.addEventListener('change', saveSettings);
    elements.showBadge.addEventListener('change', saveSettings);
    elements.notifications.addEventListener('change', saveSettings);
    elements.language.addEventListener('change', saveSettings);

    // Clear cache button
    elements.clearCache.addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear all cached analyses?')) {
            await clearCache();
        }
    });

    // Export data button
    elements.exportData.addEventListener('click', exportData);
}

/**
 * Clear all cached analyses
 */
async function clearCache() {
    try {
        await chrome.storage.local.remove(STORAGE_CONFIG.KEYS.ANALYSES);
        showStatus('Cache cleared successfully', 'success');
    } catch (error) {
        console.error('[Options] Error clearing cache:', error);
        showStatus('Error clearing cache', 'error');
    }
}

/**
 * Export all data as JSON
 */
async function exportData() {
    try {
        const data = await chrome.storage.local.get(null);

        const exportObject = {
            exportedAt: new Date().toISOString(),
            version: '1.0.0',
            data: data
        };

        // Create download link
        const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `privacy-guard-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);

        showStatus('Data exported successfully', 'success');

    } catch (error) {
        console.error('[Options] Error exporting data:', error);
        showStatus('Error exporting data', 'error');
    }
}

/**
 * Show status message
 */
function showStatus(message, type = 'success') {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message ${type}`;

    // Auto-hide after 3 seconds
    setTimeout(() => {
        elements.statusMessage.className = 'status-message';
    }, 3000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
