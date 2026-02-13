# Content Script Communication Error

## Error Message
```
Could not establish connection. Receiving end does not exist.
```

## What This Means
The **service worker is working correctly**! ✅

This error occurs when the service worker tries to communicate with a content script that isn't available on the current tab.

## Common Causes

### 1. **Chrome System Pages** ⚠️
Content scripts **cannot** be injected into Chrome's internal pages:
- `chrome://extensions/`
- `chrome://settings/`
- `chrome://newtab/`
- `chrome://flags/`
- Chrome Web Store pages

**Solution:** Navigate to a regular website (e.g., `https://www.google.com/policies/privacy/`)

### 2. **Page Loaded Before Extension**
If the page was already open before you loaded/reloaded the extension, the content script isn't injected.

**Solution:** Reload the page (F5 or Ctrl+R)

### 3. **File:// URLs**
By default, extensions don't have access to `file://` URLs.

**Solution:** 
1. Go to `chrome://extensions/`
2. Find Privacy Guard
3. Enable "Allow access to file URLs"

### 4. **New Tab/Empty Tab**
Empty tabs or new tabs don't have content to analyze.

**Solution:** Navigate to an actual website

## How to Test the Extension

### ✅ Good Test Pages:
- Privacy policies: `https://policies.google.com/privacy`
- Terms of service: `https://www.facebook.com/privacy/policy/`
- Any regular website with a privacy policy

### ❌ Won't Work:
- `chrome://` pages (Chrome internal)
- `chrome-extension://` pages
- `about:blank`
- Chrome Web Store

## Improved Error Handling

The extension now shows a more helpful error:
```
Content script not available on this page. Try reloading the page.
```

## Expected Behavior

1. **Navigate to a regular website** (e.g., `https://google.com`)
2. **Click the extension icon**
3. The popup should show analysis or "Not a legal page"

## Debug Steps

If you're still having issues:

1. **Open DevTools for the page:**
   - Right-click → Inspect → Console tab
   - You should see: `[Privacy Guard] Content script loaded`

2. **Open DevTools for the service worker:**
   - Go to `chrome://extensions/`
   - Click "Service worker" under Privacy Guard
   - Check for errors in the console

3. **Test on a known privacy policy page:**
   - Go to: `https://policies.google.com/privacy`
   - The extension should detect it automatically
   - Badge should show on the extension icon

## Success Indicators

✅ Extension loads without errors in `chrome://extensions/`
✅ Service worker shows as "Active" (green text)
✅ On a regular webpage, console shows content script loaded
✅ Extension icon badge appears on privacy policy pages
✅ Clicking the icon shows the popup (even if it says "Not a legal page")

## Current Status

After all the fixes, your extension should be:
- ✅ Service worker loading (ES6 modules working)
- ✅ Content scripts loading (IIFE version working)
- ✅ Module imports successful
- ✅ Error handling improved

The "connection" error you're seeing is **expected behavior** when trying to analyze pages where content scripts can't run!
