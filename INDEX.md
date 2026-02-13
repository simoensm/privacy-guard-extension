# 📚 Documentation Index - Privacy Guard

Bienvenue dans la documentation complète de Privacy Guard. Ce document centralise tous les guides et ressources disponibles.

---

## 🚀 Pour Commencer

### Utilisateurs Finaux

- **[Guide de Démarrage Rapide](QUICK_START.md)** 📘  
  *Installation, première utilisation, FAQ*  
  👉 Commencez ici si vous êtes un utilisateur de l'extension

- **[Politique de Confidentialité](PRIVACY.md)** 🔒  
  *Notre engagement envers votre vie privée*  
  ✅ Aucune collecte de données, 100% local

### Développeurs

- **[Guide de Contribution](CONTRIBUTING.md)** 🤝  
  *Comment contribuer au projet*  
  🛠️ Code, traductions, documentation, tests

- **[README Principal](README.md)** 📖  
  *Vue d'ensemble du projet*  
  🎯 Fonctionnalités, architecture, roadmap

---

## 📐 Documentation Technique

### Architecture & Design

- **[Architecture Technique](ARCHITECTURE.md)** 🏗️  
  *Documentation système complète*
  - Diagrammes d'architecture
  - Composants détaillés
  - Flux de données
  - Performance et optimisation
  - Stack technologique

- **[Système de Scoring](SCORING_SYSTEM.md)** 🎯  
  *Logique de calcul du score de transparence*
  - Formules mathématiques
  - Poids des clauses
  - Exemples de calcul
  - Classification des risques
  - Comparaison avec le marché

### Développement

- **[Setup Environnement](CONTRIBUTING.md#setup-développement)** 💻  
  *Installation et configuration*
  - Prérequis
  - Installation locale
  - Mode développement
  - Structure du projet

- **[Standards de Code](CONTRIBUTING.md#standards-de-code)** 📝  
  *Conventions et bonnes pratiques*
  - Style guide JavaScript
  - Conventions CSS
  - JSDoc obligatoire
  - Format des commits

---

## 🚢 Déploiement & Publication

- **[Guide de Déploiement](DEPLOYMENT.md)** 🚀  
  *Publication sur les stores*
  - Chrome Web Store
  - Firefox Add-ons (AMO)
  - Microsoft Edge Add-ons
  - Distribution privée
  - Process de mise à jour

- **[Guide de Création d'Assets](ASSETS_GUIDE.md)** 🎨  
  *Création des icônes et captures d'écran*
  - Design des icônes
  - Spécifications techniques
  - Outils recommandés
  - Templates fournis

---

## 📜 Informations Légales

- **[Licence](LICENSE)** ⚖️  
  *MIT License*  
  Open source, libre d'utilisation

- **[Politique de Confidentialité](PRIVACY.md)** 🛡️  
  *Notre engagement*  
  Zéro collecte de données

- **[Changelog](CHANGELOG.md)** 📋  
  *Historique des versions*  
  - v1.0.0 : Version initiale
  - Roadmap future

---

## 🔍 Documentation par Composant

### Frontend / UI

**Popup Interface**
- Fichiers : `src/popup/popup.html`, `popup.css`, `popup.js`
- Documentation : [ARCHITECTURE.md - Section UI](ARCHITECTURE.md#1-user-interface-ui)

**Design System**
- Variables CSS : `src/ui/styles/variables.css`
- Glassmorphism, dark mode, animations
- Documentation : [ARCHITECTURE.md - Design System](ARCHITECTURE.md#design-system)

### Backend / Logic

**Service Worker**
- Fichier : `src/background/service-worker.js`
- Documentation : [ARCHITECTURE.md - Service Worker](ARCHITECTURE.md#2-service-worker)
- Rôle : Orchestration, caching, messaging

**Content Scripts**
- Fichiers : `src/content/content-script.js`, `page-detector.js`
- Documentation : [ARCHITECTURE.md - Content Script](ARCHITECTURE.md#3-content-script)
- Rôle : Détection, extraction de contenu

### Analysis Engine

**NLP Engine**
- Fichier : `src/analysis/nlp-engine.js`
- Documentation : [ARCHITECTURE.md - NLP Engine](ARCHITECTURE.md#nlp-engine)
- Fonctions : Tokenization, TF-IDF, Flesch, résumé

**Clause Detector**
- Fichier : `src/analysis/clause-detector.js`
- Documentation : [ARCHITECTURE.md - Clause Detector](ARCHITECTURE.md#clause-detector)
- 10 types de clauses détectées

**Risk Scorer**
- Fichier : `src/analysis/risk-scorer.js`
- Documentation : [SCORING_SYSTEM.md](SCORING_SYSTEM.md)
- Calcul du score 0-100

### Utilities

**Storage Manager**
- Fichier : `src/utils/storage.js`
- Gestion du cache, settings, stats

**Constants**
- Fichier : `src/utils/constants.js`
- Patterns de détection, configuration globale

---

## 🌐 Internationalisation

**Langues Supportées**
- 🇬🇧 **Anglais** : `_locales/en/messages.json`
- 🇫🇷 **Français** : `_locales/fr/messages.json`

**Ajouter une langue**
- Guide : [CONTRIBUTING.md - Ajouter une Nouvelle Langue](CONTRIBUTING.md#ajouter-une-nouvelle-langue)

---

## 🧪 Tests & Quality

### Tests Manuels

**Checklist de test** : [CONTRIBUTING.md - Tests](CONTRIBUTING.md#tests)

**Sites de test recommandés** :
- ✅ GitHub Privacy Policy
- ✅ Stripe Privacy Policy
- ⚠️ Facebook Privacy Policy
- 🔴 Sites avec nombreux trackers

### Tests Automatisés (Futur)

- Tests unitaires (Jest)
- Tests d'intégration
- Tests E2E (Playwright)

---

## 📊 Métriques & Analytics

**Performance Targets**
- Time to First Analysis : < 3s
- Popup Load Time : < 100ms
- Memory Usage : < 50MB

Documentation : [ARCHITECTURE.md - Performance](ARCHITECTURE.md#performance)

---

## 🗺️ Roadmap

### v1.1.0 (4 semaines)
- [ ] Support Allemand et Espagnol
- [ ] Détection avancée de bannières consent
- [ ] Vue détaillée complète
- [ ] Export PDF

### v1.5.0 (8 semaines)
- [ ] Historique des analyses
- [ ] Comparaison avec dataset réel
- [ ] Clauses personnalisées

### v2.0.0 (12 semaines)
- [ ] Machine Learning
- [ ] API publique
- [ ] Dashboard web

Documentation complète : [CHANGELOG.md](CHANGELOG.md)

---

## 🆘 Support & Communauté

### Obtenir de l'Aide

**Documentation** :
- [Guide de Démarrage Rapide](QUICK_START.md) pour utilisateurs
- [CONTRIBUTING.md](CONTRIBUTING.md) pour développeurs
- [ARCHITECTURE.md](ARCHITECTURE.md) pour technique

**Issues & Bugs** :
- GitHub Issues : [Report a bug](https://github.com/privacy-guard/extension/issues)
- Template : [CONTRIBUTING.md - Rapporter des Bugs](CONTRIBUTING.md#rapporter-des-bugs)

**Questions** :
- GitHub Discussions (à venir)
- Email : support@privacyguard.app

### Contribuer

**Types de contributions** :
- 🐛 Bug fixes
- ✨ Nouvelles fonctionnalités
- 📝 Documentation
- 🌐 Traductions
- 🧪 Tests

Guide complet : [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📁 Structure du Projet

```
privacy-guard-extension/
├── 📄 manifest.json              # Configuration extension
│
├── 📂 src/                       # Code source
│   ├── background/               # Service worker
│   ├── content/                  # Content scripts
│   ├── popup/                    # Interface popup
│   ├── analysis/                 # Moteurs NLP/Scoring
│   ├── utils/                    # Utilitaires
│   └── ui/                       # Composants UI
│
├── 📂 assets/                    # Assets visuels
│   ├── icons/                    # Icônes extension
│   └── screenshots/              # Captures d'écran
│
├── 📂 _locales/                  # Traductions i18n
│   ├── en/                       # Anglais
│   └── fr/                       # Français
│
├── 📚 Documentation
│   ├── README.md                 # Vue d'ensemble
│   ├── ARCHITECTURE.md           # Doc technique
│   ├── DEPLOYMENT.md             # Guide déploiement
│   ├── SCORING_SYSTEM.md         # Logique scoring
│   ├── CONTRIBUTING.md           # Guide contribution
│   ├── QUICK_START.md            # Guide utilisateur
│   ├── ASSETS_GUIDE.md           # Création assets
│   ├── PRIVACY.md                # Politique confidentialité
│   ├── LICENSE                   # Licence MIT
│   ├── CHANGELOG.md              # Historique versions
│   └── INDEX.md                  # Ce fichier
│
└── 📄 Configuration
    ├── package.json              # Métadonnées npm
    └── .gitignore                # Git ignore
```

---

## 🔗 Liens Rapides

### Ressources Externes

**Chrome Web Store** :
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/)

**Firefox Add-ons** :
- [Extension Workshop](https://extensionworkshop.com/)
- [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

**Edge Add-ons** :
- [Microsoft Edge Extensions](https://docs.microsoft.com/microsoft-edge/extensions-chromium/)

### Outils Recommandés

**Développement** :
- [VS Code](https://code.visualstudio.com/) - Éditeur recommandé
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

**Design** :
- [Figma](https://figma.com/) - Design d'interface
- [Inkscape](https://inkscape.org/) - Création d'icônes

**Version Control** :
- [Git](https://git-scm.com/)
- [GitHub Desktop](https://desktop.github.com/)

---

## ✨ Philosophie du Projet

Privacy Guard est construit sur trois piliers :

### 🛡️ Privacy-First
- Aucune collecte de données
- Traitement 100% local
- Open source et auditable

### 🌍 Impact Social
- Réduction des inégalités informationnelles (ODD 10)
- Promotion de la transparence (ODD 16)
- Innovation responsable (ODD 9)

### 🤝 Community-Driven
- Open source (MIT License)
- Contributions bienvenues
- Transparence totale

---

## 📞 Contact

**Email** : contact@privacyguard.app  
**GitHub** : https://github.com/privacy-guard/extension  
**Website** : https://privacyguard.app (à venir)

---

**Privacy Guard** - Pour un web plus transparent 🛡️

*Documentation maintenue par l'équipe Privacy Guard*  
*Dernière mise à jour : v1.0.0 - Février 2026*
