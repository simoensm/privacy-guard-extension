# Changelog

All notable changes to Privacy Guard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-02-13

### 🎉 Initial Release

#### Added
- **Automatic Detection** of legal documents
  - Privacy policies
  - Terms of service
  - Cookie policies
  - GDPR documents
  
- **NLP Analysis Engine**
  - Text cleaning and tokenization
  - Keyword extraction (TF-IDF)
  - Readability scoring (Flesch)
  - Entity extraction (dates, organizations, emails)
  - Extractive summarization
  
- **Clause Detection**
  - 10 clause types (Third-party sharing, Data selling, etc.)
  - Pattern matching with regex
  - Keyword-based detection
  - Confidence scoring
  
- **Risk Scoring System**
  - Transparency score (0-100)
  - Risk level classification (Low/Medium/High)
  - Weighted clause penalties
  - Readability bonuses
  - Document quality assessment
  
- **User Interface**
  - Modern dark-mode popup with glassmorphism
  - Animated score circle
  - Color-coded risk badges
  - Key points summary (max 7)
  - Detected clauses list (max 5 displayed)
  - Personalized recommendations
  
- **Caching System**
  - 7-day cache duration
  - 100 entries maximum
  - Automatic cleanup of expired entries
  
- **Internationalization**
  - English (en)
  - French (fr)
  - Chrome i18n API integration
  
- **Cross-Browser Support**
  - Google Chrome (Manifest V3)
  - Mozilla Firefox (compatible)
  - Microsoft Edge (compatible)
  
- **Privacy-First Design**
  - 100% local processing
  - No data collection
  - No external servers
  - GDPR compliant
  
- **Documentation**
  - Comprehensive README
  - Technical architecture guide
  - Deployment guide
  - Scoring system specification
  - Contribution guidelines

#### Technical Details
- Manifest V3 implementation
- Service Worker background script
- Content Scripts for page detection
- Chrome Storage API for caching
- JSDoc documentation throughout
- Modular ES6 architecture

---

## [Unreleased]

### Planned for v1.1.0 (4 weeks)
- [ ] German language support
- [ ] Spanish language support
- [ ] Advanced consent banner detection
- [ ] Detailed analysis view (full page)
- [ ] Export analysis as PDF
- [ ] Comparison with market average (with real dataset)
- [ ] Browser notification on high-risk detection

### Planned for v1.5.0 (8 weeks)
- [ ] Analysis history dashboard
- [ ] Custom clause detection (user-defined)
- [ ] Privacy score trends over time
- [ ] Dark/Light theme toggle
- [ ] Keyboard shortcuts
- [ ] Import/Export settings

### Planned for v2.0.0 (12 weeks)
- [ ] Machine learning clause detection
- [ ] Multilingual analysis (auto-detect)
- [ ] Public API for developers
- [ ] Web dashboard with analytics
- [ ] Community-driven clause database
- [ ] Real-time banner analysis

---

## Version History

### Versioning Scheme

We use [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backward-compatible manner
- **PATCH** version for backward-compatible bug fixes

### Release Cycle

- **Patch releases**: As needed for critical bugs
- **Minor releases**: Monthly (with new features)
- **Major releases**: Yearly (with breaking changes)

---

## Migration Guides

### From Beta to 1.0.0

Privacy Guard 1.0.0 is the first stable release. There are no beta versions to migrate from.

### Future Migrations

Migration guides will be provided here for major version updates.

---

## Deprecation Notices

No deprecations in current version.

---

## Known Issues

### v1.0.0

- **Firefox**: Badge icon may not update immediately (refresh required)
- **Large documents**: Documents > 100KB may take 5-10 seconds to analyze
- **SPAs**: Some Single Page Applications may require manual re-analysis

**Workarounds** :
- Firefox: Click extension icon to force refresh
- Large docs: Wait for analysis to complete (progress visible in popup)
- SPAs: Use "Analyze this page" button manually

---

## Support

For bugs, feature requests, or questions:
- **GitHub Issues**: https://github.com/privacy-guard/extension/issues
- **Email**: support@privacyguard.app
- **Documentation**: See README.md and ARCHITECTURE.md

---

## Contributors

Thanks to all contributors who helped make Privacy Guard possible!

### Core Team
- Lead Developer
- UX Designer
- Legal Consultant (GDPR)

### Community Contributors
_List will be updated as contributions are received_

---

**Privacy Guard** - Making the web more transparent, one policy at a time. 🛡️
