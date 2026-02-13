/**
 * Privacy Guard - Popup Script
 * Logique de l'interface utilisateur du popup
 */

import { MESSAGE_TYPES, UI_CONFIG } from '../utils/constants.js';

// État de l'application
let currentAnalysis = null;
let currentTab = null;

// Éléments DOM
const elements = {
    // États
    loadingState: document.getElementById('loadingState'),
    noAnalysisState: document.getElementById('noAnalysisState'),
    resultsState: document.getElementById('resultsState'),
    errorState: document.getElementById('errorState'),

    // Score
    scoreValue: document.getElementById('scoreValue'),
    scoreProgress: document.getElementById('scoreProgress'),
    scoreCircle: document.getElementById('scoreCircle'),
    riskBadge: document.getElementById('riskBadge'),
    riskIcon: document.getElementById('riskIcon'),
    riskLabel: document.getElementById('riskLabel'),
    riskDescription: document.getElementById('riskDescription'),

    // Contenu
    keyPoints: document.getElementById('keyPoints'),
    detectedClauses: document.getElementById('detectedClauses'),
    clauseCount: document.getElementById('clauseCount'),
    recommendations: document.getElementById('recommendations'),

    // Footer
    lastAnalyzed: document.getElementById('lastAnalyzed'),

    // Boutons
    analyzeCurrentBtn: document.getElementById('analyzeCurrentBtn'),
    viewDetailedBtn: document.getElementById('viewDetailedBtn'),
    compareMarketBtn: document.getElementById('compareMarketBtn'),
    retryBtn: document.getElementById('retryBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    aboutBtn: document.getElementById('aboutBtn'),

    // Erreur
    errorMessage: document.getElementById('errorMessage')
};

/**
 * Initialisation au chargement
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Récupération de l'onglet actif
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTab = tabs[0];

        // Chargement de l'analyse existante
        await loadAnalysis();

        // Configuration des écouteurs d'événements
        setupEventListeners();

    } catch (error) {
        console.error('[Popup] Initialization error:', error);
        showError('Erreur d\'initialisation');
    }
});

/**
 * Configuration des écouteurs d'événements
 */
function setupEventListeners() {
    // Analyser la page actuelle
    elements.analyzeCurrentBtn?.addEventListener('click', analyzePage);
    elements.retryBtn?.addEventListener('click', analyzePage);

    // Vue détaillée
    elements.viewDetailedBtn?.addEventListener('click', openDetailedView);

    // Comparaison marché
    elements.compareMarketBtn?.addEventListener('click', compareWithMarket);

    // Paramètres
    elements.settingsBtn?.addEventListener('click', openSettings);

    // À propos
    elements.aboutBtn?.addEventListener('click', openAbout);

    // Écouter les messages du background
    chrome.runtime.onMessage.addListener(handleMessage);
}

/**
 * Charge l'analyse pour l'onglet actuel
 */
async function loadAnalysis() {
    try {
        showState('loading');

        // Demande l'analyse au service worker
        const response = await chrome.runtime.sendMessage({
            type: MESSAGE_TYPES.GET_CURRENT_ANALYSIS,
            tabId: currentTab.id,
            url: currentTab.url
        });

        if (response && response.analysis) {
            currentAnalysis = response.analysis;
            displayAnalysis(currentAnalysis);
            showState('results');
        } else {
            showState('noAnalysis');
        }

    } catch (error) {
        console.error('[Popup] Error loading analysis:', error);
        showState('noAnalysis');
    }
}

/**
 * Lance l'analyse de la page actuelle
 */
async function analyzePage() {
    try {
        showState('loading');

        // Envoi du message d'analyse
        const response = await chrome.runtime.sendMessage({
            type: MESSAGE_TYPES.ANALYZE_PAGE,
            tabId: currentTab.id,
            url: currentTab.url
        });

        if (response && response.success) {
            // L'analyse est en cours, attendre le résultat
            // Le résultat sera reçu via handleMessage
        } else {
            throw new Error(response?.error || 'Échec de l\'analyse');
        }

    } catch (error) {
        console.error('[Popup] Analysis error:', error);
        showError(error.message);
    }
}

/**
 * Affiche l'analyse dans l'interface
 */
function displayAnalysis(analysis) {
    if (!analysis) return;

    // Affichage du score
    displayScore(analysis.score);

    // Affichage des points clés
    displayKeyPoints(analysis.summary);

    // Affichage des clauses détectées
    displayClauses(analysis.clauseDetection);

    // Affichage des recommandations
    displayRecommendations(analysis.score.recommendations);

    // Mise à jour de la date
    updateLastAnalyzed(analysis.analyzedAt);
}

/**
 * Affiche le score et le niveau de risque
 */
function displayScore(scoreData) {
    const { score, riskLevel } = scoreData;

    // Animation du score
    animateScore(score);

    // Badge de risque
    elements.riskBadge.className = `pg-risk-badge ${riskLevel.level.toLowerCase()}`;
    elements.riskIcon.textContent = riskLevel.icon;
    elements.riskLabel.textContent = riskLevel.label;
    elements.riskDescription.textContent = riskLevel.description;

    // Couleur du cercle de progression
    elements.scoreProgress.style.stroke = riskLevel.color;
}

/**
 * Animation du score avec effet de compteur
 */
function animateScore(targetScore) {
    const duration = 1500; // ms
    const steps = 60;
    const increment = targetScore / steps;
    const stepDuration = duration / steps;

    let currentScore = 0;

    const timer = setInterval(() => {
        currentScore += increment;

        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(timer);
        }

        // Mise à jour de l'affichage
        elements.scoreValue.textContent = Math.round(currentScore);

        // Mise à jour du cercle de progression
        const circumference = 2 * Math.PI * 54; // rayon = 54
        const offset = circumference - (currentScore / 100) * circumference;
        elements.scoreProgress.style.strokeDashoffset = offset;

    }, stepDuration);
}

/**
 * Affiche les points clés
 */
function displayKeyPoints(summary) {
    if (!summary || !Array.isArray(summary)) {
        elements.keyPoints.innerHTML = '<li class="pg-key-point">Aucun résumé disponible</li>';
        return;
    }

    elements.keyPoints.innerHTML = summary
        .slice(0, 7) // Max 7 points
        .map(point => `
      <li class="pg-key-point">
        <span class="pg-key-point-icon">•</span>
        <span>${escapeHtml(point)}</span>
      </li>
    `).join('');
}

/**
 * Affiche les clauses détectées
 */
function displayClauses(clauseDetection) {
    if (!clauseDetection || !clauseDetection.detectedClauses) {
        elements.detectedClauses.innerHTML = '<p style="color: var(--color-text-muted); font-size: 13px;">Aucune clause détectée</p>';
        elements.clauseCount.textContent = '0';
        return;
    }

    const clauses = Object.values(clauseDetection.detectedClauses);
    elements.clauseCount.textContent = clauses.length;

    // Tri par poids (critiques en premier)
    clauses.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

    elements.detectedClauses.innerHTML = clauses
        .slice(0, 5) // Max 5 clauses
        .map(clause => {
            const severity = getSeverityClass(clause.weight);
            return `
        <div class="pg-clause ${severity}">
          <div class="pg-clause-header">
            <span class="pg-clause-title">${formatClauseType(clause.type)}</span>
            <span class="pg-clause-weight">Poids: ${Math.abs(clause.weight)}</span>
          </div>
          <p class="pg-clause-summary">${escapeHtml(clause.summary)}</p>
        </div>
      `;
        }).join('');
}

/**
 * Affiche les recommandations
 */
function displayRecommendations(recommendations) {
    if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
        elements.recommendations.innerHTML = '<li class="pg-recommendation">Aucune recommandation spécifique</li>';
        return;
    }

    elements.recommendations.innerHTML = recommendations
        .map(rec => `
      <li class="pg-recommendation">
        ${escapeHtml(rec)}
      </li>
    `).join('');
}

/**
 * Met à jour la date de dernière analyse
 */
function updateLastAnalyzed(timestamp) {
    if (!timestamp) {
        elements.lastAnalyzed.textContent = 'Jamais';
        return;
    }

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    let timeAgo;
    if (diffMins < 1) {
        timeAgo = 'À l\'instant';
    } else if (diffMins < 60) {
        timeAgo = `Il y a ${diffMins} min`;
    } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        timeAgo = `Il y a ${hours}h`;
    } else {
        const days = Math.floor(diffMins / 1440);
        timeAgo = `Il y a ${days}j`;
    }

    elements.lastAnalyzed.textContent = timeAgo;
}

/**
 * Gestion des messages entrants
 */
function handleMessage(message, sender, sendResponse) {
    switch (message.type) {
        case MESSAGE_TYPES.ANALYSIS_COMPLETE:
            currentAnalysis = message.analysis;
            displayAnalysis(currentAnalysis);
            showState('results');
            break;

        case 'ANALYSIS_ERROR':
            showError(message.error);
            break;
    }
}

/**
 * Ouvre la vue détaillée
 */
function openDetailedView() {
    chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.OPEN_DETAILED_VIEW,
        analysis: currentAnalysis
    });
}

/**
 * Compare avec la moyenne du marché
 */
function compareWithMarket() {
    if (!currentAnalysis) return;

    // Implémentation future : afficher un modal ou une nouvelle page
    alert(`Votre score: ${currentAnalysis.score.score}\nMoyenne du marché: 55\n\n${currentAnalysis.score.score > 55 ? 'Mieux que la moyenne ✓' : 'Moins bien que la moyenne'}`);
}

/**
 * Ouvre les paramètres
 */
function openSettings() {
    chrome.runtime.openOptionsPage();
}

/**
 * Ouvre la page "À propos"
 */
function openAbout() {
    chrome.tabs.create({ url: 'https://github.com/simoensm/privacy-guard-extension' });
}

/**
 * Affiche un état spécifique
 */
function showState(state) {
    // Cache tous les états
    elements.loadingState.style.display = 'none';
    elements.noAnalysisState.style.display = 'none';
    elements.resultsState.style.display = 'none';
    elements.errorState.style.display = 'none';

    // Affiche l'état demandé
    switch (state) {
        case 'loading':
            elements.loadingState.style.display = 'flex';
            break;
        case 'noAnalysis':
            elements.noAnalysisState.style.display = 'block';
            break;
        case 'results':
            elements.resultsState.style.display = 'block';
            break;
        case 'error':
            elements.errorState.style.display = 'block';
            break;
    }
}

/**
 * Affiche une erreur
 */
function showError(message) {
    elements.errorMessage.textContent = message || 'Une erreur s\'est produite';
    showState('error');
}

/**
 * Obtient la classe de sévérité basée sur le poids
 */
function getSeverityClass(weight) {
    const absWeight = Math.abs(weight);

    if (weight < 0) return 'positive';
    if (absWeight >= 8) return 'critical';
    if (absWeight >= 5) return 'important';
    return 'moderate';
}

/**
 * Formate le type de clause pour l'affichage
 */
function formatClauseType(type) {
    const labels = {
        THIRD_PARTY_SHARING: 'Partage avec tiers',
        DATA_SELLING: 'Revente de données',
        TARGETED_ADVERTISING: 'Publicité ciblée',
        DATA_RETENTION: 'Conservation des données',
        INTERNATIONAL_TRANSFER: 'Transfert international',
        MANDATORY_ARBITRATION: 'Arbitrage obligatoire',
        LIABILITY_LIMITATION: 'Limitation de responsabilité',
        SENSITIVE_DATA_COLLECTION: 'Données sensibles',
        GEOLOCATION: 'Géolocalisation',
        USER_RIGHTS: 'Droits de l\'utilisateur'
    };

    return labels[type] || type;
}

/**
 * Échappe les caractères HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
