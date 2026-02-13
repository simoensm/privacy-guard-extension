# How to Properly Reload the Extension

## The Problem
Chrome extensions **cache module files** aggressively. Even after editing files, Chrome may continue to use the old cached versions, leading to module import errors.

## Complete Reload Process

### Method 1: Full Reload (Recommended)
1. Go to `chrome://extensions/`
2. Find "Privacy Guard" extension
3. Click the **REMOVE** button (don't worry, you'll re-add it)
4. Close and **reopen Chrome** (important!)
5. Reopen `chrome://extensions/`
6. Enable **Developer mode** (toggle in top right)
7. Click **"Load unpacked"**
8. Select the directory: `c:\Users\PC\Documents\GitHub\privacy-guard-extension`
9. Check that the service worker shows as **"Service worker (Active)"**

### Method 2: Hard Reload (Faster, Less Reliable)
1. Go to `chrome://extensions/`
2. Find "Privacy Guard" extension
3. Click the **reload icon** (circular arrow)
4. Immediately click **"Service worker"** link to open DevTools
5. In the DevTools console, right-click **Reload** button
6. Select **"Empty Cache and Hard Reload"**
7. Close and reopen DevTools
8. Check for any errors

### Method 3: Nuclear Option (If nothing else works)
1. Close Chrome completely
2. Delete Chrome's cache folder:
   - Windows: `%LocalAppData%\Google\Chrome\User Data\Default\Code Cache`
3. Reopen Chrome
4. Load the extension fresh

## Verification Steps

After reloading, verify the exports are working:

1. Click **"Service worker"** link in your extension card
2. In the DevTools console that opens, type:
   ```javascript
   import('../utils/constants.js').then(m => console.log(m))
   ```
3. You should see all exports including:
   - LIMITS
   - MESSAGE_TYPES
   - STORAGE_CONFIG
   - NLP_CONFIG
   - SENSITIVE_CLAUSES
   - SCORING_CONFIG
   - UI_CONFIG
   - LEGAL_PAGE_PATTERNS
   - SUPPORTED_LANGUAGES

## Common Issues

### Issue: "Module does not provide export"
**Cause:** Chrome cached the old IIFE version
**Solution:** Use Method 1 (Full Reload with Chrome restart)

### Issue: "Failed to load service worker"
**Cause:** Syntax error or file system caching
**Solution:** 
1. Check DevTools console for specific error
2. Verify file saved correctly (check modified timestamp)
3. Use Method 1

### Issue: Content scripts not working
**Cause:** Global scope variables not available
**Solution:** Verify the dual compatibility code at the end of constants.js:
```javascript
if (typeof window !== 'undefined') {
  window.LIMITS = LIMITS;
  // ... etc
}
```

## Current File Status
✅ `constants.js` has been converted to ES6 exports
✅ Dual compatibility added for content scripts
✅ All 9 constants are exported

## Expected Behavior
- Service worker should show as **(Active)**
- No errors in service worker console
- Content scripts can access via `window.LIMITS`
- Service worker imports via `import { LIMITS } from '../utils/constants.js'`
