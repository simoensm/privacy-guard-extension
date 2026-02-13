# Service Worker Registration Fix

## Problem
Service worker registration was failing with **Status code: 15**, which indicates a module loading error in Chrome extensions with Manifest V3.

## Root Cause
The `src/utils/constants.js` file was wrapped in an **IIFE** (Immediately Invoked Function Expression) that only exposed variables to the **global scope**:

```javascript
(function (global) {
  const MESSAGE_TYPES = { ... };
  const STORAGE_CONFIG = { ... };
  // ... more constants
  
  // Exposed only to global scope
  global.MESSAGE_TYPES = MESSAGE_TYPES;
  global.STORAGE_CONFIG = STORAGE_CONFIG;
})(typeof window !== 'undefined' ? window : this);
```

However, the service worker (`src/background/service-worker.js`) was configured as an **ES6 module** in `manifest.json`:

```json
{
  "background": {
    "service_worker": "src/background/service-worker.js",
    "type": "module"  // <-- ES6 module type
  }
}
```

And was trying to import from `constants.js` using ES6 import syntax:

```javascript
import { MESSAGE_TYPES, STORAGE_CONFIG, LIMITS } from '../utils/constants.js';
```

This mismatch caused the service worker to fail loading because:
- ES6 modules require **proper `export` statements**
- The IIFE wrapper didn't export anything - it only added to global scope
- Service workers with `type: "module"` **cannot** access the global scope the same way

## Solution

### Changed `src/utils/constants.js` to support dual compatibility:

1. **Converted all constants to ES6 exports:**
   ```javascript
   export const MESSAGE_TYPES = { ... };
   export const STORAGE_CONFIG = { ... };
   export const LIMITS = { ... };
   // ... etc.
   ```

2. **Added global scope exposure for content scripts:**
   ```javascript
   // Content scripts need global access (they're not modules)
   if (typeof window !== 'undefined') {
     window.MESSAGE_TYPES = MESSAGE_TYPES;
     window.STORAGE_CONFIG = STORAGE_CONFIG;
     window.LIMITS = LIMITS;
     // ... etc.
   }
   ```

This dual approach works because:
- **Service worker** (module context): Uses ES6 `import` statements ✅
- **Content scripts** (non-module context): Access via `window.MESSAGE_TYPES` ✅
- **Popup/Options** (non-module context): Can also access via `window` if needed ✅

## Files Modified
- `src/utils/constants.js` - Converted from IIFE to ES6 exports with global compatibility

## Why Content Scripts Can't Be Modules
Chrome Manifest V3 **only supports** `type: "module"` for:
- Service workers (background scripts)

Content scripts **must** remain as traditional scripts because:
- They inject into arbitrary web pages
- They need access to the page's DOM and window object
- Module scripts have different scoping rules that conflict with content script injection

## Testing
After these changes:
1. Load the extension in Chrome (`chrome://extensions/`)
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the project directory
5. The service worker should now register successfully ✅

## Related Files
- Service worker imports: `src/background/service-worker.js`
- Analysis modules: `src/analysis/nlp-engine.js`, `src/analysis/clause-detector.js`, `src/analysis/risk-scorer.js`
- Content scripts: `src/content/content-script.js`, `src/content/page-detector.js`
