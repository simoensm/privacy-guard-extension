# Final Solution: Service Worker Module Loading

## The Problem

Chrome Manifest V3 extensions have **different requirements** for different script contexts:

1. **Service Workers** - MUST use ES6 modules when `"type": "module"` is set
2. **Content Scripts** - CANNOT use ES6 modules (always loaded as regular scripts)

This created a conflict when trying to share constants between both contexts.

## The Solution

### Split Constants into Two Files

#### 1. `src/utils/constants.js` (ES6 Module - for Service Worker & Analysis)
- Used by: Service worker, NLP engine, clause detector, risk scorer
- Format: ES6 exports (`export const ...`)
- Contains: All constants (LEGAL_PAGE_PATTERNS, SENSITIVE_CLAUSES, SCORING_CONFIG, NLP_CONFIG, UI_CONFIG, STORAGE_CONFIG, SUPPORTED_LANGUAGES, MESSAGE_TYPES, LIMITS)

#### 2. `src/content/constants-content.js` (IIFE - for Content Scripts)  
- Used by: page-detector.js, content-script.js
- Format: IIFE with global scope (`(function(global) { ... })(window)`)
- Contains: Only constants needed by content scripts (LEGAL_PAGE_PATTERNS, MESSAGE_TYPES, LIMITS)
- Exposes to: `window.LEGAL_PAGE_PATTERNS`, `window.MESSAGE_TYPES`, `window.LIMITS`

## Files Modified

### 1. Created `src/content/constants-content.js`
```javascript
// New file - Non-module version for content scripts
(function (global) {
  const LEGAL_PAGE_PATTERNS = { ... };
  const MESSAGE_TYPES = { ... };
  const LIMITS = { ... };
  
  global.LEGAL_PAGE_PATTERNS = LEGAL_PAGE_PATTERNS;
  global.MESSAGE_TYPES = MESSAGE_TYPES;
  global.LIMITS = LIMITS;
})(window);
```

### 2. Updated `src/utils/constants.js`
```javascript
// Pure ES6 module - for service worker and analysis modules
export const LEGAL_PAGE_PATTERNS = { ... };
export const SENSITIVE_CLAUSES = { ... };
export const SCORING_CONFIG = { ... };
export const NLP_CONFIG = { ... };
export const UI_CONFIG = { ... };
export const STORAGE_CONFIG = { ... };
export const SUPPORTED_LANGUAGES = [ ... ];
export const MESSAGE_TYPES = { ... };
export const LIMITS = { ... };
```

### 3. Updated `manifest.json`
```json
{
  "background": {
    "service_worker": "src/background/service-worker.js",
    "type": "module"  // Uses src/utils/constants.js via import
  },
  "content_scripts": [{
    "js": [
      "src/content/constants-content.js",  // ← Non-module version
      "src/content/page-detector.js",
      "src/content/content-script.js"
    ]
  }]
}
```

### 4. Updated GitHub URLs
- `manifest.json`: Changed homepage_url to `https://github.com/simoensm/privacy-guard-extension`
- `service-worker.js`: Changed welcome URL to `https://github.com/simoensm/privacy-guard-extension#readme`

## How It Works

### Service Worker
```javascript
// src/background/service-worker.js
import { MESSAGE_TYPES, STORAGE_CONFIG, LIMITS } from '../utils/constants.js';
```
✅ Works because constants.js has `export const` statements

### Content Scripts
```javascript
// src/content/content-script.js
const { pageDetector, MESSAGE_TYPES } = window;
```
✅ Works because constants-content.js exposes to `window`

### Analysis Modules
```javascript
// src/analysis/nlp-engine.js
import { NLP_CONFIG, LIMITS } from '../utils/constants.js';
```
✅ Works because they're also ES6 modules

## Why This Approach?

1. **Service Worker Requirements**: Chrome's V8 engine requires proper ES6 module syntax when `"type": "module"`
2. **Content Script Limitations**: Content scripts are injected into web pages and cannot use ES6 module syntax
3. **Code Duplication**: Minimal - only the constants needed by content scripts are duplicated
4. **Maintainability**: Clear separation of concerns - each file serves its specific context

## Installation

After these changes, you MUST reload the extension:

1. Go to `chrome://extensions/`
2. **Remove** Privacy Guard extension
3. **Close Chrome completely**
4. **Reopen Chrome**  
5. Go to `chrome://extensions/`
6. Enable Developer mode
7. Click "Load unpacked"
8. Select: `C:\Users\PC\Documents\GitHub\privacy-guard-extension`

## Verification

✅ Service worker shows as "Service worker (Active)"
✅ No errors in service worker console
✅ Content scripts can access `window.MESSAGE_TYPES`
✅ Service worker can `import { LIMITS } from '../utils/constants.js'`

## File Structure
```
src/
├── utils/
│   └── constants.js              (ES6 module for service worker)
├── content/
│   ├── constants-content.js      (IIFE for content scripts)
│   ├── page-detector.js
│   └── content-script.js
├── background/
│   └── service-worker.js         (imports from utils/constants.js)
└── analysis/
    ├── nlp-engine.js             (imports from utils/constants.js)
    ├── clause-detector.js        (imports from utils/constants.js)
    └── risk-scorer.js            (imports from utils/constants.js)
```
