/**
 * Privacy Guard - Popup Script v2
 * Updated for GDPR compliance scoring and privacy page discovery
 */

import { MESSAGE_TYPES, UI_CONFIG } from '../utils/constants.js';

// State
let currentAnalysis = null;
let currentTab = null;

// DOM Elements
const elements = {
    // States
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

    // Content
    keyPoints: document.getElementById('keyPoints'),
    detectedClauses: document.getElementById('detectedClauses'),
    clauseCount: document.getElementById('clauseCount'),
    recommendations: document.getElementById('recommendations'),

    // GDPR Checklist
    gdprChecklist: document.getElementById('gdprChecklist'),

    // Footer
    lastAnalyzed: document.getElementById('lastAnalyzed'),

    // Buttons
    analyzeCurrentBtn: document.getElementById('analyzeCurrentBtn'),
    viewDetailedBtn: document.getElementById('viewDetailedBtn'),
    compareMarketBtn: document.getElementById('compareMarketBtn'),
    retryBtn: document.getElementById('retryBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    aboutBtn: document.getElementById('aboutBtn'),

    // Error
    errorMessage: document.getElementById('errorMessage')
};

/**
 * Initialize on load
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTab = tabs[0];
        await loadAnalysis();
        setupEventListeners();
    } catch (error) {
        console.error('[Popup] Initialization error:', error);
        showError('Initialization error');
    }
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
    elements.analyzeCurrentBtn?.addEventListener('click', analyzePage);
    elements.retryBtn?.addEventListener('click', analyzePage);
    elements.viewDetailedBtn?.addEventListener('click', openDetailedView);
    elements.compareMarketBtn?.addEventListener('click', compareWithMarket);
    elements.settingsBtn?.addEventListener('click', openSettings);
    elements.aboutBtn?.addEventListener('click', openAbout);
    chrome.runtime.onMessage.addListener(handleMessage);
}

/**
 * Load existing analysis
 */
async function loadAnalysis() {
    try {
        showState('loading');

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
 * Trigger a new analysis
 */
async function analyzePage() {
    try {
        showState('loading');

        const response = await chrome.runtime.sendMessage({
            type: MESSAGE_TYPES.ANALYZE_PAGE,
            tabId: currentTab.id,
            url: currentTab.url
        });

        if (response && response.success) {
            if (response.analysis) {
                currentAnalysis = response.analysis;
                displayAnalysis(currentAnalysis);
                showState('results');
            }
            // Otherwise wait for ANALYSIS_COMPLETE message
        } else {
            throw new Error(response?.error || 'Analysis failed');
        }

    } catch (error) {
        console.error('[Popup] Analysis error:', error);
        showError(error.message);
    }
}

/**
 * Display analysis results
 */
function displayAnalysis(analysis) {
    if (!analysis) return;

    displayScore(analysis.score);
    displayKeyPoints(analysis.summary);
    displayClauses(analysis.clauseDetection);
    displayRecommendations(analysis.score.recommendations);
    displayGDPRChecklist(analysis.score.breakdown);
    displayFetchedPages(analysis.fetchedPages);
    updateLastAnalyzed(analysis.analyzedAt);
}

/**
 * Display score and risk level
 */
function displayScore(scoreData) {
    const { score, riskLevel } = scoreData;

    animateScore(score);

    // Risk badge — use level as class
    elements.riskBadge.className = `pg-risk-badge ${riskLevel.level.toLowerCase()}`;
    elements.riskIcon.textContent = riskLevel.icon;
    elements.riskLabel.textContent = riskLevel.label;
    elements.riskDescription.textContent = riskLevel.description;

    // Circle color
    elements.scoreProgress.style.stroke = riskLevel.color;
}

/**
 * Animate score counter
 */
function animateScore(targetScore) {
    const duration = 1500;
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

        elements.scoreValue.textContent = Math.round(currentScore);

        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (currentScore / 100) * circumference;
        elements.scoreProgress.style.strokeDashoffset = offset;
    }, stepDuration);
}

/**
 * Display key points / summary
 */
function displayKeyPoints(summary) {
    if (!summary || !Array.isArray(summary)) {
        elements.keyPoints.innerHTML = '<li class="pg-key-point">No summary available</li>';
        return;
    }

    elements.keyPoints.innerHTML = summary
        .slice(0, 7)
        .map(point => `
      <li class="pg-key-point">
        <span class="pg-key-point-icon">•</span>
        <span>${escapeHtml(point)}</span>
      </li>
    `).join('');
}

/**
 * Display detected clauses
 */
function displayClauses(clauseDetection) {
    if (!clauseDetection || !clauseDetection.detectedClauses) {
        elements.detectedClauses.innerHTML =
            '<p style="color: var(--color-text-muted); font-size: 13px;">No clauses detected</p>';
        elements.clauseCount.textContent = '0';
        return;
    }

    const clauses = Object.values(clauseDetection.detectedClauses);
    elements.clauseCount.textContent = clauses.length;

    clauses.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

    elements.detectedClauses.innerHTML = clauses
        .slice(0, 6)
        .map(clause => {
            const severity = getSeverityClass(clause.weight);
            return `
        <div class="pg-clause ${severity}">
          <div class="pg-clause-header">
            <span class="pg-clause-title">${formatClauseType(clause.type)}</span>
            <span class="pg-clause-weight">Weight: ${Math.abs(clause.weight)}</span>
          </div>
          <p class="pg-clause-summary">${escapeHtml(clause.summary)}</p>
        </div>
      `;
        }).join('');
}

/**
 * Display GDPR compliance checklist
 */
function displayGDPRChecklist(breakdown) {
    if (!elements.gdprChecklist || !breakdown?.checklist) return;

    const items = Object.entries(breakdown.checklist);

    elements.gdprChecklist.innerHTML = items
        .map(([key, item]) => {
            const icon = item.passed ? '✅' : '❌';
            const cssClass = item.passed ? 'pg-check-pass' : 'pg-check-fail';
            const deduction = item.passed ? '' :
                `<span class="pg-check-deduction">${item.deduction}</span>`;

            return `
        <div class="pg-check-item ${cssClass}">
          <span class="pg-check-icon">${icon}</span>
          <span class="pg-check-label">${escapeHtml(item.label)}</span>
          ${deduction}
        </div>
      `;
        }).join('');

    // Violations section
    if (breakdown.violations && Object.keys(breakdown.violations).length > 0) {
        const violationHtml = Object.entries(breakdown.violations)
            .filter(([, v]) => v.applied)
            .map(([key, v]) => `
        <div class="pg-check-item pg-check-violation">
          <span class="pg-check-icon">⚠️</span>
          <span class="pg-check-label">${escapeHtml(v.label)}</span>
          <span class="pg-check-deduction">${v.penalty}</span>
        </div>
      `).join('');

        if (violationHtml) {
            elements.gdprChecklist.innerHTML +=
                '<div class="pg-violations-header">Violations</div>' + violationHtml;
        }
    }
}

/**
 * Display fetched privacy pages info
 */
function displayFetchedPages(fetchedPages) {
    if (!fetchedPages || fetchedPages.length === 0) return;

    // Find or create the section
    let section = document.getElementById('fetchedPagesSection');
    if (!section) {
        section = document.createElement('div');
        section.id = 'fetchedPagesSection';
        section.className = 'pg-section pg-fetched-pages';

        // Insert after the score section
        const resultsState = elements.resultsState;
        if (resultsState) {
            const firstSection = resultsState.querySelector('.pg-section');
            if (firstSection && firstSection.nextSibling) {
                resultsState.insertBefore(section, firstSection.nextSibling);
            } else {
                resultsState.appendChild(section);
            }
        }
    }

    section.innerHTML = `
    <h3 class="pg-section-title">📄 Pages analyzed</h3>
    <div class="pg-fetched-list">
      ${fetchedPages.map(p => `
        <div class="pg-fetched-item">
          <span class="pg-fetched-category">${formatCategory(p.category)}</span>
          <a href="${escapeHtml(p.url)}" target="_blank" class="pg-fetched-link" title="${escapeHtml(p.url)}">
            ${escapeHtml(p.title || p.url)}
          </a>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Display recommendations
 */
function displayRecommendations(recommendations) {
    if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
        elements.recommendations.innerHTML = '<li class="pg-recommendation">No specific recommendations</li>';
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
 * Update last analyzed time
 */
function updateLastAnalyzed(timestamp) {
    if (!timestamp) {
        elements.lastAnalyzed.textContent = 'Never';
        return;
    }

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    let timeAgo;
    if (diffMins < 1) {
        timeAgo = 'Just now';
    } else if (diffMins < 60) {
        timeAgo = `${diffMins}m ago`;
    } else if (diffMins < 1440) {
        timeAgo = `${Math.floor(diffMins / 60)}h ago`;
    } else {
        timeAgo = `${Math.floor(diffMins / 1440)}d ago`;
    }

    elements.lastAnalyzed.textContent = timeAgo;
}

/**
 * Handle incoming messages
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

function openDetailedView() {
    chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.OPEN_DETAILED_VIEW,
        analysis: currentAnalysis
    });
}

function compareWithMarket() {
    if (!currentAnalysis) return;
    const score = currentAnalysis.score.score;
    const marketAvg = 62;
    alert(`Your score: ${score}/100\nMarket average: ${marketAvg}\n\n${score > marketAvg ? '✓ Above average' : score < marketAvg ? '⚠ Below average' : '≈ Average'}`);
}

function openSettings() {
    chrome.runtime.openOptionsPage();
}

function openAbout() {
    chrome.tabs.create({ url: 'https://github.com/simoensm/privacy-guard-extension' });
}

/**
 * Show state
 */
function showState(state) {
    elements.loadingState.style.display = 'none';
    elements.noAnalysisState.style.display = 'none';
    elements.resultsState.style.display = 'none';
    elements.errorState.style.display = 'none';

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

function showError(message) {
    elements.errorMessage.textContent = message || 'An error occurred';
    showState('error');
}

function getSeverityClass(weight) {
    const absWeight = Math.abs(weight);
    if (weight < 0) return 'positive';
    if (absWeight >= 8) return 'critical';
    if (absWeight >= 5) return 'important';
    return 'moderate';
}

function formatClauseType(type) {
    const labels = {
        THIRD_PARTY_SHARING: 'Third-party sharing',
        DATA_SELLING: 'Data selling',
        TARGETED_ADVERTISING: 'Targeted advertising',
        DATA_RETENTION: 'Data retention',
        INTERNATIONAL_TRANSFER: 'International transfer',
        MANDATORY_ARBITRATION: 'Mandatory arbitration',
        LIABILITY_LIMITATION: 'Liability limitation',
        SENSITIVE_DATA_COLLECTION: 'Sensitive data',
        GEOLOCATION: 'Geolocation',
        USER_RIGHTS: 'User rights ✓'
    };
    return labels[type] || type;
}

function formatCategory(category) {
    const labels = {
        PRIVACY_POLICY: '🔒 Privacy Policy',
        COOKIE_POLICY: '🍪 Cookie Policy',
        TERMS_OF_SERVICE: '📋 Terms of Service',
        LEGAL_NOTICE: '⚖️ Legal Notice',
        GDPR: '🇪🇺 GDPR',
        UNKNOWN: '📄 Legal'
    };
    return labels[category] || '📄 ' + category;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
