# Testing Checklist for Privacy Guard Extension

## ✅ All Fixes Applied

### Module Loading Issues
- ✅ Service worker ES6 module loading - **FIXED**
- ✅ Content script IIFE compatibility - **FIXED**
- ✅ Constants exports/imports - **FIXED**

### Code Issues
- ✅ Function name typo in popup.js - **FIXED** (`displayRecommandations` → `displayRecommendations`)
- ✅ GitHub URLs updated - **FIXED**
- ✅ Error handling improved - **FIXED**

## 🧪 Complete Testing Guide

### Step 1: Reload the Extension
1. Go to `chrome://extensions/`
2. Find **Privacy Guard**
3. Click the **circular reload button** 🔄
4. Verify: "Service worker (Active)" appears in green

### Step 2: Navigate to a Test Page
**Recommended test page:**
```
https://policies.google.com/privacy
```

**Alternative test pages:**
- https://www.facebook.com/privacy/policy/
- https://www.apple.com/legal/privacy/
- https://twitter.com/en/privacy
- https://www.microsoft.com/privacy

### Step 3: Verify Detection
Look for these indicators:

#### A. Badge on Extension Icon
- Should show: `!` (blue) or `✓` (green) or `⚠` (orange/red)
- Location: Extension icon in Chrome toolbar

#### B. Console Messages (F12 → Console)
Open DevTools on the page and look for:
```
[Privacy Guard] Content script loaded
[Privacy Guard] Page detection: { isLegalPage: true, ... }
[Privacy Guard] Legal page detected
```

### Step 4: Open the Popup
1. Click the Privacy Guard extension icon
2. The popup should show one of these states:

#### Expected States:

**Loading:**
- Shows spinner
- "Analyse en cours..."

**Analysis Results:**
- **Score Circle**: Animated number 0-100
- **Risk Badge**: Color-coded (green/yellow/red)
- **Key Points**: Bulleted list of important clauses
- **Detected Clauses**: List with severity indicators
- **Recommendations**: ✅ Should appear without errors!

**No Analysis:**
- "Aucune analyse disponible"
- Button: "Analyser cette page"

**Error:**
- Error icon ⚠️
- Error message
- "Réessayer" button

### Step 5: Test Features

#### Analyze Button
1. Click "Analyser cette page"
2. Should show loading state
3. Should complete with results or error

#### Compare Market Button
1. Click "Comparer" in the results view
2. Should show alert with score comparison

#### Settings Button
- Click ⚙️ icon in header
- Should open options page

#### About Button
- Click "À propos" in footer
- Should open: `https://github.com/simoensm/privacy-guard-extension`

## 🔍 Common Issues

### Issue: "Content script not available"
**Cause:** You're on a page where content scripts can't run
**Pages that won't work:**
- `chrome://` pages
- `chrome-extension://` pages
- New tab page
**Solution:** Navigate to a real website

### Issue: Popup shows "No analysis available"
**Cause:** Page hasn't been detected as a legal page
**Solution:** 
1. Click "Analyser cette page" button
2. Or reload the page to trigger auto-detection

### Issue: Service worker inactive
**Cause:** Extension needs reload
**Solution:**
1. Go to `chrome://extensions/`
2. Click reload on Privacy Guard
3. Look for green "Service worker (Active)"

## ✨ Success Indicators

You know the extension is working when:

✅ No errors in extension card on `chrome://extensions/`
✅ Service worker shows as "Active" (green)
✅ Badge appears on icon when visiting privacy policies
✅ Popup opens and shows analysis results
✅ All sections display:
   - Score with animated circle
   - Risk level badge
   - Key points list
   - Detected clauses
   - Recommendations (no errors!)
✅ Buttons work (Settings, About, Compare)

## 🐛 Debugging Tips

### Check Service Worker Console
1. `chrome://extensions/`
2. Click "Service worker" under Privacy Guard
3. Look for errors or warnings

### Check Page Console
1. F12 on the webpage
2. Look for `[Privacy Guard]` messages
3. Check for any red errors

### Check Popup Console
1. Right-click popup → Inspect
2. Check Console tab for errors
3. Verify all DOM elements exist

## 📊 Expected Analysis Output

On a real privacy policy page, you should see:

**Score Range:** 0-100
- 0-39: High Risk (red)
- 40-69: Medium Risk (yellow)
- 70-100: Low Risk (green)

**Key Points:** 5-7 important sentences extracted from the document

**Detected Clauses:** Examples:
- Third Party Sharing
- Targeted Advertising
- Data Retention
- User Rights (positive!)

**Recommendations:** Examples:
- "✓ Politique globalement transparente"
- "⚠️ Lisez attentivement avant d'accepter"
- "🌍 Transfert de données hors UE"

## 🎯 Full Workflow Test

1. ✅ Open Chrome
2. ✅ Go to `chrome://extensions/`
3. ✅ Verify Privacy Guard is loaded and active
4. ✅ Navigate to `https://policies.google.com/privacy`
5. ✅ Wait for badge to appear (~1-2 seconds)
6. ✅ Click extension icon
7. ✅ See loading state
8. ✅ See analysis results with score, clauses, recommendations
9. ✅ Click "Comparer" → See market comparison alert
10. ✅ Click Settings icon → Options page opens
11. ✅ Click "À propos" → GitHub page opens

**If all steps work: Extension is fully functional! 🎉**
