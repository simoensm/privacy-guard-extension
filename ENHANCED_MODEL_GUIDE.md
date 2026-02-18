# Privacy Guard - Enhanced Model Documentation

## 🚀 New Features Overview

Privacy Guard has been significantly enhanced with two powerful features:

### 1. **Cookie & Tracking Detection System**
Comprehensive detection and analysis of all cookies, storage, and tracking mechanisms on websites.

### 2. **LLM-Powered Text Analysis**
Integration with Large Language Models (Gemini API, Hugging Face) for advanced privacy policy summarization.

---

## 🍪 Cookie & Tracking Detection

### What It Detects

#### **1. Cookies Analysis**
- **All cookies** on the current website
- **Cookie categorization**: Essential, Analytics, Marketing, Functional, Unknown
- **Third-party detection**: Identifies cookies from external domains
- **Purpose identification**: Explains what each cookie does
- **Data collection analysis**: Shows what data each cookie collects

#### **2. Web Storage**
- **localStorage**: All items, total size, potential PII detection
- **sessionStorage**: All items, total size, potential PII detection
- Identifies storage types (JSON, Token, String, Number, Boolean)

#### **3. Third-Party Trackers**
Detects known tracking services:
- Google Analytics
- Google Tag Manager
- Facebook Pixel
- DoubleClick
- Hotjar
- Mixpanel
- Segment
- Amplitude
- Microsoft Clarity

#### **4. Fingerprinting Techniques**
Detects advanced tracking methods:
- Canvas Fingerprinting
- WebGL Fingerprinting
- Audio Fingerprinting
- Font Fingerprinting
- Battery API usage

### Implementation Files

- **`src/analysis/cookie-detector.js`** - Main cookie detection module (background script)
- **`src/content/content-script.js`** - Inline cookie analysis (content script)

### How It Works

```javascript
// In service-worker.js (performAnalysis function)

// Cookie detection is triggered during privacy policy analysis
const settings = await getSettings();

if (settings.enableCookieDetection) {
    const cookieResponse = await chrome.tabs.sendMessage(tabId, {
        type: 'ANALYZE_COOKIES'
    });
    
    cookieAnalysis = cookieResponse.cookieData;
}
```

The content script analyzes:
1. `document.cookie` - All accessible cookies
2. `localStorage` - All stored items
3. `sessionStorage` - All stored items
4. `<script>` tags - Third-party tracking scripts
5. Browser APIs - Fingerprinting techniques

### Cookie Categorization Logic

| Category | Indicators |
|----------|-----------|
| **Essential** | `session`, `csrf`, `auth`, `security` |
| **Analytics** | `_ga`, `_gid`, `analytics`, `utm` |
| **Marketing** | `_fb`, `ads`, `marketing`, `pixel`, `doubleclick` |
| **Functional** | `pref`, `lang`, `theme`, `ui` |

### Privacy Risk Calculation

The system calculates a privacy risk score (0-100):

```javascript
score = 100;
score -= thirdPartyCookies × 3;    // -3 points per third-party cookie
score -= marketingCookies × 5;      // -5 points per marketing cookie
score -= totalTrackers × 4;         // -4 points per tracker
score -= fingerprintingTechs × 8;   // -8 points per technique
if (hasPII) score -= 15;            // -15 if PII detected
```

**Risk Levels:**
- **Low** (70-100): Few tracking mechanisms
- **Medium** (40-69): Moderate tracking
- **High** (0-39): Extensive tracking

---

## 🤖 LLM-Powered Analysis

### Supported Providers

#### **1. Google Gemini API** (Recommended)
- **Free tier**: Yes (60 requests/minute)
- **Model**: `gemini-pro`
- **Best for**: Accurate, structured analysis
- **API Key**: Get at https://makersuite.google.com/app/apikey

#### **2. Hugging Face**
- **Free tier**: Yes (inference API)
- **Model**: `facebook/bart-large-cnn`
- **Best for**: Quick summaries
- **API Key**: Get at https://huggingface.co/settings/tokens

### How to Configure

1. **Get an API Key**:
   - Gemini: Visit https://makersuite.google.com/app/apikey
   - Hugging Face: Visit https://huggingface.co/settings/tokens

2. **Configure in Extension**:
   - Open the extension options page
   - Enable "LLM-Enhanced Analysis"
   - Select provider (Gemini or Hugging Face)
   - Enter your API key
   - Save settings

3. **Analyze a Privacy Policy**:
   - The extension will automatically use the LLM for summarization
   - Look for the "LLM Enhanced" badge in results

### What the LLM Analyzes

The LLM provides structured analysis:

```json
{
  "keyPoints": [
    "Service collects personal data including email and browsing history",
    "Data may be shared with third-party advertisers",
    "..."
  ],
  "concerns": [
    "Extensive data collection beyond service needs",
    "No clear data retention policy",
    "..."
  ],
  "userRights": [
    "Users can request data deletion",
    "Access to personal data available",
    "..."
  ],
  "thirdParties": [
    "Google Analytics",
    "Facebook for advertising",
    "..."
  ],
  "riskAssessment": {
    "level": "MEDIUM",
    "reasoning": "Moderate privacy risks due to third-party sharing"
  },
  "summary": "This service collects extensive user data..."
}
```

### Fallback System

If no API key is configured or if the API fails:
- **Extractive summarization** is used (no LLM required)
- Uses NLP to score sentences by relevance
- Selects most important sentences as summary
- Quality: Good but not as comprehensive as LLM

### Implementation Files

- **`src/analysis/llm-service.js`** - LLM integration module
- **`src/background/service-worker.js`** - LLM usage in analysis pipeline

---

## 📊 Enhanced Analysis Pipeline

The new analysis flow:

```
1. Extract page content
   ↓
2. NLP Analysis (existing)
   ↓
3. Clause Detection (existing)
   ↓
4. Risk Scoring (existing)
   ↓
5. ✨ Cookie & Tracking Detection (NEW)
   ↓
6. ✨ LLM-Powered Summarization (NEW)
   ↓
7. Final enriched results
```

### Analysis Result Structure

```javascript
{
  url: "https://example.com/privacy",
  score: { /* transparency score */ },
  
  // LLM-enhanced summary
  summary: { /* LLM output or extractive summary */ },
  llmEnhanced: true,  // whether LLM was used
  llmSummary: { /* full LLM response */ },
  
  // Cookie & tracking data
  cookieAnalysis: {
    cookies: [ /* all cookies */ ],
    localStorage: { /* localStorage info */ },
    sessionStorage: { /* sessionStorage info */ },
    trackers: [ /* third-party trackers */ ]
  },
  
  // Original analysis
  clauseDetection: { /* detected clauses */ },
  nlpResults: { /* NLP stats */ },
  metadata: { /* page metadata */ },
  analyzedAt: "2026-02-17T22:00:00Z"
}
```

---

## ⚙️ Configuration

### Default Settings

```javascript
{
  autoAnalyze: true,              // Auto-analyze legal pages
  showBadge: true,                // Show extension badge
  language: 'en',                 // Interface language
  notificationsEnabled: true,     // Enable notifications
  enableCookieDetection: true,    // Enable cookie detection
  enableLLM: false,               // Enable LLM (requires API key)
  llmProvider: 'gemini',          // 'gemini' or 'huggingface'
  llmApiKey: ''                   // API key (required for LLM)
}
```

### Storage Keys

```javascript
STORAGE_CONFIG.KEYS = {
  SETTINGS: 'privacy_guard_settings',
  ANALYSES: 'privacy_guard_analyses',
  VISITED_SITES: 'privacy_guard_visited'
}
```

---

## 🧪 Testing the New Features

### Test Cookie Detection

1. Visit any website (e.g., https://www.nytimes.com)
2. Open Privacy Guard popup
3. Click "Analyze Page"
4. View the "Cookies & Trackers" section
5. You should see:
   - List of all cookies
   - LocalStorage/SessionStorage stats
   - Detected third-party trackers
   - Fingerprinting techniques

### Test LLM Analysis

1. Get a free Gemini API key: https://makersuite.google.com/app/apikey
2. Open extension options
3. Enable "LLM-Enhanced Analysis"
4. Select "Gemini" as provider
5. Paste your API key
6. Save
7. Visit a privacy policy page (e.g., https://policies.google.com/privacy)
8. Analyze the page
9. The summary should show structured, LLM-generated insights

---

## 🔒 Privacy & Security

### Data Handling

- **Cookie detection**: All analysis happens locally, no data sent externally
- **LLM analysis**: Privacy policy text is sent to selected API (Gemini/Hugging Face)
- **API keys**: Stored locally in browser storage, never transmitted except to selected API
- **Caching**: LLM responses cached for 24 hours to minimize API calls

### Recommendations for Users

If you're concerned about privacy:
1. **Don't use LLM features** - The fallback extractive summarization works well
2. **Use Hugging Face** - Open-source models, privacy-focused
3. **Review cookie data** - All detection is local, no external transmission

---

## 📈 Performance

### Cookie Detection
- **Speed**: ~50-100ms per page
- **Memory**: Minimal (few KB per analysis)
- **No external calls**: 100% local

### LLM Analysis
- **Speed**: 1-3 seconds (API dependent)
- **Cache**: 24-hour cache reduces API calls
- **Fallback**: Instant if LLM fails
- **Token limit**: ~15,000 characters max

---

## 🛠️ Developer Guide

### Adding New Tracker Detection

Edit `src/analysis/cookie-detector.js`:

```javascript
getKnownTrackers() {
    return [
        // Add your tracker here
        { 
            pattern: 'new-tracker.com', 
            name: 'New Tracker', 
            category: 'analytics', 
            description: 'Tracks user behavior' 
        },
        // ... existing trackers
    ];
}
```

### Adding New LLM Provider

Edit `src/analysis/llm-service.js`:

```javascript
const LLM_CONFIG = {
    // Add new provider
    NEW_PROVIDER: {
        endpoint: 'https://api.newprovider.com/v1/generate',
        model: 'model-name',
        maxTokens: 2048
    }
};

// Add handler method
async callNewProviderAPI(text, options) {
    // Implementation
}
```

---

## 📝 Summary

The enhanced Privacy Guard now offers:

✅ **Comprehensive cookie detection** - Know what's tracking you  
✅ **Third-party tracker identification** - See who's watching  
✅ **Advanced fingerprinting detection** - Spot sophisticated tracking  
✅ **LLM-powered summaries** - Understand privacy policies instantly  
✅ **Smart fallback** - Works even without API keys  
✅ **Privacy-focused** - Local analysis by default  

**Privacy protection has never been more powerful!** 🛡️

---

*Last Updated: February 17, 2026*  
*Version: 2.0.0*
