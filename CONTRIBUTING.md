# 🤝 Guide de Contribution - Privacy Guard

Merci de votre intérêt pour contribuer à Privacy Guard ! Ce document explique comment participer au projet.

---

## 📋 Table des Matières

1. [Code of Conduct](#code-of-conduct)
2. [Comment Contribuer](#comment-contribuer)
3. [Setup Développement](#setup-développement)
4. [Architecture du Code](#architecture-du-code)
5. [Standards de Code](#standards-de-code)
6. [Process de Pull Request](#process-de-pull-request)
7. [Rapporter des Bugs](#rapporter-des-bugs)
8. [Proposer des Features](#proposer-des-features)

---

## 🤝 Code of Conduct

Nous nous engageons à maintenir une communauté accueillante et respectueuse pour tous.

**Nos valeurs** :
- ✅ Bienveillance et respect
- ✅ Feedback constructif
- ✅ Focus sur le projet et ses objectifs
- ✅ Diversité et inclusion

**Non toléré** :
- ❌ Harcèlement
- ❌ Langage offensant
- ❌ Attaques personnelles
- ❌ Spamming

---

## 🛠️ Comment Contribuer

### Types de Contributions

Nous acceptons différents types de contributions :

1. **🐛 Bug Fixes** : Corriger des bugs existants
2. **✨ Features** : Ajouter de nouvelles fonctionnalités
3. **📝 Documentation** : Améliorer la documentation
4. **🌐 Traductions** : Ajouter de nouvelles langues
5. **🧪 Tests** : Écrire des tests unitaires/intégration
6. **🎨 UI/UX** : Améliorer l'interface utilisateur
7. **⚡ Performance** : Optimiser le code

### Workflow Général

```
1. Fork le repository
        ↓
2. Créer une branche de feature
        ↓
3. Faire vos modifications
        ↓
4. Commit avec message descriptif
        ↓
5. Push vers votre fork
        ↓
6. Créer une Pull Request
        ↓
7. Code Review
        ↓
8. Merge (si approuvé)
```

---

## 💻 Setup Développement

### Prérequis

- **Git** : Version 2.30+
- **Node.js** : Version 18+ (pour outils de build optionnels)
- **Browser** : Chrome, Firefox, ou Edge
- **Code Editor** : VS Code recommandé

### Installation

```bash
# 1. Fork et clone
git clone https://github.com/VOTRE-USERNAME/privacy-guard-extension.git
cd privacy-guard-extension

# 2. (Optionnel) Installer les dépendances dev
npm install

# 3. Charger l'extension en mode développement
# Chrome/Edge :
# - Ouvrir chrome://extensions/
# - Activer "Mode développeur"
# - "Charger l'extension non empaquetée"
# - Sélectionner le dossier du projet

# Firefox :
# - Ouvrir about:debugging#/runtime/this-firefox
# - "Charger un module complémentaire temporaire"
# - Sélectionner manifest.json
```

### Structure du Projet

```
privacy-guard-extension/
├── manifest.json          # Configuration extension
├── src/
│   ├── background/        # Service worker
│   ├── content/          # Content scripts
│   ├── popup/            # Interface popup
│   ├── analysis/         # Moteurs NLP/Scoring
│   └── utils/            # Utilitaires
├── assets/               # Images, icônes
├── _locales/             # Traductions i18n
├── ARCHITECTURE.md       # Doc architecture
├── DEPLOYMENT.md         # Guide déploiement
└── CONTRIBUTING.md       # Ce fichier
```

---

## 🏗️ Architecture du Code

### Principes de Design

1. **Modularité** : Chaque fichier a une responsabilité unique
2. **Séparation** : UI, logique métier, et data séparés
3. **Asynchrone** : Utilisation de `async/await` partout
4. **Error Handling** : `try/catch` obligatoire pour opérations async
5. **Comments** : JSDoc pour toutes les fonctions publiques

### Modules Principaux

#### 1. Service Worker (`src/background/`)

**Responsabilités** :
- Orchestration des analyses
- Gestion du cache
- Communication inter-composants

**Fichier** : `service-worker.js`

**Ajouter une nouvelle fonctionnalité** :
```javascript
// Dans service-worker.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'VOTRE_NOUVEAU_TYPE') {
    handleVotreNouvelleFonction(message, sendResponse);
    return true; // Async response
  }
});

async function handleVotreNouvelleFonction(message, sendResponse) {
  // Votre logique ici
  sendResponse({ success: true, data: ... });
}
```

#### 2. Content Scripts (`src/content/`)

**Fichiers** :
- `page-detector.js` : Détection de pages légales
- `content-script.js` : Script principal injecté

**Ajouter un nouveau pattern de détection** :
```javascript
// Dans src/utils/constants.js
export const LEGAL_PAGE_PATTERNS = {
  URL_PATTERNS: [
    /votre-nouveau-pattern/i,
    // ...
  ]
};
```

#### 3. Analysis Engine (`src/analysis/`)

**Modules** :
- `nlp-engine.js` : Traitement NLP
- `clause-detector.js` : Détection de clauses
- `risk-scorer.js` : Calcul de scores

**Ajouter une nouvelle clause** :
```javascript
// Dans src/utils/constants.js
export const SENSITIVE_CLAUSES = {
  // ...
  VOTRE_NOUVELLE_CLAUSE: {
    weight: 7,
    keywords: ['keyword1', 'keyword2'],
    patterns: [
      /votre.*pattern/i
    ]
  }
};

// Puis dans clause-detector.js, ajoutez le résumé
generateClauseSummary(clauseType) {
  const summaries = {
    // ...
    VOTRE_NOUVELLE_CLAUSE: "Description de votre clause"
  };
}
```

---

## 📝 Standards de Code

### JavaScript

**Style Guide** : [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

**Règles principales** :
```javascript
// ✅ Bon
const myVariable = 'value';
async function myFunction() {
  try {
    const result = await someAsyncOperation();
    return result;
  } catch (error) {
    console.error('[Module] Error:', error);
    throw error;
  }
}

// ❌ Mauvais
var my_variable = "value"
function myFunction() {
  someAsyncOperation().then(result => {
    return result
  })
}
```

**JSDoc obligatoire** :
```javascript
/**
 * Description de la fonction
 * @param {string} param1 - Description du paramètre
 * @param {Object} param2 - Objet de configuration
 * @param {number} param2.value - Valeur numérique
 * @returns {Promise<boolean>} Résultat de l'opération
 */
async function maFonction(param1, param2) {
  // ...
}
```

### CSS

**Conventions** :
- Utiliser les variables CSS (`:root`)
- Classes préfixées : `.pg-*` (Privacy Guard)
- BEM pour composants complexes : `.pg-card__title--primary`

```css
/* ✅ Bon */
.pg-score-card {
  background: var(--color-bg-elevated);
  padding: var(--spacing-md);
}

.pg-score-card__title {
  font-size: 16px;
  font-weight: 600;
}

/* ❌ Mauvais */
.scoreCard {
  background: #1e293b;
  padding: 16px;
}
```

### HTML

- Sémantique : `<header>`, `<main>`, `<section>`, etc.
- Accessibilité : `alt`, `aria-*`, `role`
- IDs uniques et descriptifs

---

## 🔄 Process de Pull Request

### Checklist PR

Avant de soumettre une PR, vérifiez :

- [ ] **Code fonctionne** : Testé sur Chrome, Firefox, Edge
- [ ] **Code review** : Relu et commenté
- [ ] **Commits** : Messages clairs et descriptifs
- [ ] **Tests** : Pas de régression
- [ ] **Documentation** : Mise à jour si nécessaire
- [ ] **Changelog** : Ajouté dans CHANGELOG.md

### Format de Commit

```
type(scope): Description courte (max 72 caractères)

Description détaillée (optionnelle)

Closes #123
```

**Types** :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation uniquement
- `style`: Formatage, points-virgules, etc.
- `refactor`: Refactoring sans changement de fonctionnalité
- `perf`: Amélioration de performance
- `test`: Ajout/modification de tests
- `chore`: Maintenance, build, etc.

**Exemples** :
```
feat(detector): Add support for German privacy policies

Adds detection patterns for German legal documents:
- New keywords: "Datenschutzerklärung", "AGB"
- Regex patterns for German URLs

Closes #42

---

fix(popup): Score circle animation lag on Firefox

The SVG circle animation was causing lag on Firefox due to
hardware acceleration issues. Fixed by using CSS custom properties
instead of direct SVG attribute manipulation.

Closes #87
```

### Template de PR

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Edge
- [ ] Added unit tests

## Screenshots (if UI changes)
[Add screenshots here]

## Related Issues
Closes #123
```

---

## 🐛 Rapporter des Bugs

### Template d'Issue Bug

```markdown
**Description**
A clear description of the bug.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Browser: [Chrome 120, Firefox 121, Edge 120]
- Extension Version: [1.0.0]
- OS: [Windows 11, macOS 14, Linux Ubuntu 22.04]

**Additional Context**
Any other context about the problem.
```

---

## ✨ Proposer des Features

### Template d'Issue Feature

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features.

**Additional context**
Mockups, references, etc.
```

---

## 🌐 Ajouter une Nouvelle Langue

### Étapes

1. **Créer le dossier** :
   ```
   _locales/
     └── de/          ← Nouveau (exemple: allemand)
         └── messages.json
   ```

2. **Copier** `_locales/en/messages.json` → `_locales/de/messages.json`

3. **Traduire** toutes les valeurs `"message"`

4. **Ajouter** dans `constants.js` :
   ```javascript
   export const SUPPORTED_LANGUAGES = ['en', 'fr', 'de'];
   ```

5. **Ajouter patterns** dans `LEGAL_PAGE_PATTERNS` si patterns spécifiques à la langue

6. **Tester** en changeant langue du navigateur

---

## 🧪 Tests

### Tests Manuels

**Checklist de test** :
- [ ] Installation fraîche
- [ ] Détection automatique fonctionne
- [ ] Analyse complète sans erreur
- [ ] Popup s'affiche correctement
- [ ] Cache fonctionne
- [ ] Badge mis à jour
- [ ] Multi-onglets

### Tests sur Sites Réels

**Sites de test recommandés** :
- ✅ **Positifs** : GitHub, Stripe, DuckDuckGo
- ⚠️ **Moyens** : Reddit, Twitter
- 🔴 **Négatifs** : Sites avec trackers excessifs

### Tests Unitaires (Futur)

```javascript
// Exemple de test (Jest)
import { clauseDetector } from '../src/analysis/clause-detector.js';

describe('ClauseDetector', () => {
  test('should detect data selling clause', () => {
    const text = 'We may sell your personal information to third parties.';
    const result = clauseDetector.detectClause(text, [], 'DATA_SELLING', ...);
    
    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.7);
  });
});
```

---

## 📞 Questions ?

- **GitHub Issues** : Pour bugs et features
- **GitHub Discussions** : Pour questions générales
- **Email** : dev@privacyguard.app

---

**Merci de contribuer à un web plus transparent ! 🙏**
