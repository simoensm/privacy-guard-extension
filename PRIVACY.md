# Privacy Policy - Privacy Guard Extension

**Effective Date**: February 13, 2026  
**Last Updated**: February 13, 2026  
**Version**: 1.0.0

---

## Our Commitment to Your Privacy

Privacy Guard is built on a simple principle: **Your privacy is sacred.**

This extension was created to help you understand privacy policies of websites you visit. It would be hypocritical of us to violate your privacy in the process.

**We pledge**:
- ✅ We do NOT collect any personal data
- ✅ We do NOT track your browsing activity
- ✅ We do NOT send any data to external servers
- ✅ We do NOT use analytics or tracking tools
- ✅ We are fully GDPR compliant

---

## Data Collection: NONE

### What We Do NOT Collect

Privacy Guard does **NOT** collect, store, transmit, or share:

- ❌ Browsing history
- ❌ Visited URLs
- ❌ Page content
- ❌ Personal information
- ❌ Location data
- ❌ IP addresses
- ❌ Analytics data
- ❌ Usage statistics
- ❌ Crash reports
- ❌ ANY identifiable information

### What Happens to the Data You See?

When Privacy Guard analyzes a privacy policy:

1. **Page content is read** - Only the text of the current page
2. **Analysis happens locally** - 100% on your device, in your browser
3. **Results are cached locally** - Stored only on your device using Chrome's local storage
4. **Nothing leaves your device** - No network requests to external servers

**Cache Details**:
- Stored using Chrome Storage API (local)
- Maximum 100 analyses stored
- Automatically deleted after 7 days
- You can clear cache anytime via browser settings

---

## Permissions Explained

Privacy Guard requests the following browser permissions:

### `storage`
**Why**: To cache analysis results locally on your device.  
**What it does**: Saves analyzed privacy policies so we don't re-analyze the same page.  
**What it does NOT do**: Send data anywhere. Everything stays on your device.

### `activeTab`
**Why**: To read the content of the current page when you request an analysis.  
**What it does**: Extracts text from privacy policies and terms of service pages.  
**What it does NOT do**: Access tabs you're not actively viewing or track your browsing.

### `scripting`
**Why**: To inject content scripts that detect legal documents automatically.  
**What it does**: Runs detection code on pages you visit to find privacy policies.  
**What it does NOT do**: Inject ads, tracking, or malicious code.

### `host_permissions: <all_urls>`
**Why**: To detect privacy policies on any website you visit.  
**What it does**: Allows the extension to check if a page is a legal document.  
**What it does NOT do**: Access personal data or transmit anything.

---

## How Privacy Guard Works (Technical)

### 1. Detection Phase
When you visit a website, Privacy Guard:
- Checks the URL for patterns like `/privacy` or `/terms`
- Looks at the page title
- Searches for links in the footer
- **All locally, no network requests**

### 2. Analysis Phase
When a legal document is detected and you request analysis:
- Text is extracted from the page
- NLP processing happens **in your browser**
- Clauses are detected using pattern matching
- A transparency score is calculated
- **Everything happens on your device**

### 3. Storage Phase
Analysis results are:
- Saved to Chrome's local storage (on your device only)
- Never sent to any server
- Automatically cleaned up after 7 days
- Accessible only by the extension, not by websites

---

## Third-Party Services: NONE

Privacy Guard does **NOT** use:
- ❌ Google Analytics
- ❌ Facebook Pixel
- ❌ Mixpanel, Amplitude, or any analytics
- ❌ Sentry, Bugsnag, or error tracking
- ❌ Any third-party APIs or services

**100% self-contained. Zero external dependencies.**

---

## Open Source Transparency

Privacy Guard is **fully open source**.

- **Source code**: Available on GitHub
- **Auditable**: Anyone can review the code
- **Transparent**: See exactly what the extension does
- **Community**: Contributions welcome

You can verify our privacy claims by reviewing the source code yourself.

**GitHub**: [https://github.com/privacy-guard/extension](https://github.com/privacy-guard/extension)

---

## GDPR Compliance

Under the General Data Protection Regulation (GDPR), you have rights regarding your personal data.

**Our status**: Privacy Guard processes **ZERO personal data**, so GDPR data subject rights don't apply.

However, if you have concerns:
- **Right to access**: You can view all cached data in Chrome's storage (chrome://extensions → Privacy Guard → Storage)
- **Right to deletion**: Clear cache via browser settings or extension options
- **Right to portability**: Export feature available in settings

---

## Children's Privacy

Privacy Guard does not collect data from anyone, including children under 13. The extension is safe for all ages.

---

## Changes to This Policy

We may update this privacy policy occasionally.

- **Version number** will be incremented
- **"Last Updated"** date will be changed
- **Notification** will be provided via extension update notes

**Significant changes** (e.g., introducing analytics) would:
- Require explicit user consent
- Be clearly announced
- Provide opt-out option

---

## Contact Us

Questions about this Privacy Policy?

- **Email**: privacy@privacyguard.app
- **GitHub Issues**: [File an issue](https://github.com/privacy-guard/extension/issues)
- **Website**: [https://privacyguard.app](https://privacyguard.app)

We respond within 48 hours.

---

## Legal

**Controller**: Privacy Guard Team  
**Data Protection Officer**: Not applicable (no data collected)  
**Jurisdiction**: Subject to laws of your local jurisdiction  
**License**: MIT License (see LICENSE file)

---

## Summary (TL;DR)

✅ **Zero data collection**  
✅ **100% local processing**  
✅ **No tracking, no analytics**  
✅ **Open source and auditable**  
✅ **GDPR compliant by design**  
✅ **Your privacy is safe with us**

---

**Privacy Guard** - Protecting your privacy while analyzing privacy policies.

*That's not ironic, that's intentional.* 🛡️

---

**Document Version**: 1.0.0  
**Effective Date**: February 13, 2026  
**Next Review Date**: August 13, 2026
