# 🏗️ Architecture Technique - Privacy Guard

## Vue d'Ensemble

Privacy Guard est une extension de navigateur (Chrome, Firefox, Edge) qui analyse automatiquement les documents légaux (politiques de confidentialité, CGU, RGPD) pour fournir aux utilisateurs un résumé clair et un score de transparence.

---

## 📊 Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Popup     │  │   Options    │  │   Detailed   │          │
│  │    (Main)    │  │    Page      │  │     View     │          │
│  └──────┬───────┘  └──────────────┘  └──────────────┘          │
│         │                                                        │
└─────────┼────────────────────────────────────────────────────────┘
          │
          │  Chrome Extension API (Messaging)
          │
┌─────────▼────────────────────────────────────────────────────────┐
│               SERVICE WORKER (Background)                        │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  • Orchestration des analyses                          │     │
│  │  • Gestion du cache (Memory + Storage)                 │     │
│  │  • Communication inter-composants                      │     │
│  │  • File d'attente des analyses                         │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────┬────────────────────────────────────────────────────────┘
          │
          │  Message Passing
          │
┌─────────▼────────────────────────────────────────────────────────┐
│                   CONTENT SCRIPT                                 │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Page Detector                                         │     │
│  │  • Détection automatique (URL, Title, Links, Content) │     │
│  │  • Extraction du contenu textuel                      │     │
│  │  • Extraction de métadonnées                          │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
          │
          │  Extracted Content
          │
┌─────────▼────────────────────────────────────────────────────────┐
│                   ANALYSIS ENGINE                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ NLP Engine   │  │   Clause     │  │     Risk     │          │
│  │              │  │   Detector   │  │    Scorer    │          │
│  │ • Tokenize   │  │ • Pattern    │  │ • Score      │          │
│  │ • TF-IDF     │  │   Matching   │  │   Calc       │          │
│  │ • Readability│  │ • Keyword    │  │ • Risk Level │          │
│  │ • Summary    │  │   Detection  │  │ • Breakdown  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────────────────────────────────────────────────┘
          │
          │  Analysis Results
          │
┌─────────▼────────────────────────────────────────────────────────┐
│                    STORAGE LAYER                                 │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Chrome Storage API (local)                            │     │
│  │  • Analyses cache (7 jours)                            │     │
│  │  • User settings                                       │     │
│  │  • Visited sites history                              │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Composants Détaillés

### 1. User Interface (UI)

#### Popup Principal (`src/popup/`)
- **Fichiers** : `popup.html`, `popup.css`, `popup.js`
- **Dimensions** : 380x500-600px
- **Fonctionnalités** :
  - Affichage du score de transparence (animation circulaire)
  - Badge de risque (Vert/Orange/Rouge)
  - Liste des points clés (max 7)
  - Clauses détectées (max 5 affichées)
  - Recommandations personnalisées
  - Actions (Vue détaillée, Comparaison)

#### Design System
- **Thème** : Dark mode avec glassmorphism
- **Couleurs** :
  - Primary: `#3b82f6` (Bleu)
  - Success: `#22c55e` (Vert)
  - Warning: `#f59e0b` (Orange)
  - Danger: `#ef4444` (Rouge)
- **Typographie** : System fonts (Inter, Roboto, SF Pro)
- **Animations** : Transitions fluides (150-350ms)

### 2. Service Worker (`src/background/service-worker.js`)

**Rôle** : Coordinateur central de l'extension

**Responsabilités** :
1. **Orchestration** : Gère le workflow complet d'analyse
2. **Caching** : 
   - Cache en mémoire (Map) pour accès rapide
   - Cache persistant (Chrome Storage) pour 7 jours
   - Limite : 100 analyses maximum
3. **Messaging** : Hub de communication entre popup, content scripts, et modules d'analyse
4. **Queue Management** : File d'attente pour éviter analyses simultanées

**Messages gérés** :
- `ANALYZE_PAGE` : Démarre une nouvelle analyse
- `GET_CURRENT_ANALYSIS` : Récupère l'analyse en cache
- `LEGAL_PAGE_DETECTED` : Notifié par content script
- `ANALYSIS_COMPLETE` : Notifie le popup

### 3. Content Script (`src/content/`)

#### Page Detector (`page-detector.js`)
**Méthodes de détection** :
1. **URL Analysis** : Regex patterns sur l'URL
   - `/privacy[-_]?policy/i`
   - `/terms[-_]?of[-_]?service/i`
   - `/cookie[-_]?policy/i`
   - etc.

2. **Title Check** : Mots-clés dans le titre
   - "Privacy Policy", "Terms of Service", etc.

3. **Link Detection** : Recherche dans footer/header
   - Liens vers pages légales courantes

4. **Content Analysis** : Analyse du texte de la page
   - Fréquence de mots-clés juridiques

**Score de confiance** : 0-1 (somme pondérée des méthodes)

#### Content Script (`content-script.js`)
**Fonctionnalités** :
- Détection automatique au chargement
- Extraction du contenu textuel (DOM parsing)
- Mutation Observer pour SPAs
- Détection de bannières de consentement
- Communication bidirectionnelle avec service worker

### 4. Analysis Engine

#### NLP Engine (`src/analysis/nlp-engine.js`)

**Pipeline d'analyse** :
1. **Text Cleaning** : Suppression HTML, normalisation
2. **Tokenization** : Découpage en mots, filtrage stopwords
3. **Sentence Extraction** : Découpage en phrases
4. **Statistics** : Compte mots, phrases, vocabulaire
5. **Keyword Extraction** : TF-IDF simplifié
6. **Readability Scoring** : Formule Flesch adaptée
7. **Entity Extraction** : Dates, organisations, emails, etc.
8. **Summary Generation** : Résumé extractif

**Formule de Readability (Flesch)** :
```
Score = 206.835 - (1.015 × mots/phrase) - (84.6 × syllabes/mot)
```

**Classification** :
- 70-100: Facile
- 50-69: Moyen
- 30-49: Difficile
- 0-29: Très difficile

#### Clause Detector (`src/analysis/clause-detector.js`)

**Clauses détectées** (10 catégories) :
1. **Partage avec tiers** (weight: 8)
2. **Revente de données** (weight: 10) ⚠️
3. **Publicité ciblée** (weight: 6)
4. **Conservation données** (weight: 5)
5. **Transfert hors UE** (weight: 7)
6. **Arbitrage obligatoire** (weight: 9) ⚠️
7. **Limitation responsabilité** (weight: 6)
8. **Données sensibles** (weight: 9) ⚠️
9. **Géolocalisation** (weight: 7)
10. **Droits utilisateur** (weight: -5) ✅ (positif)

**Méthode de détection** :
- **Keywords** : Mots-clés exacts
- **Regex Patterns** : Expressions régulières
- **Sentence Matching** : Extraction des phrases contenant les matches

**Confidence Score** :
```
confidence = (patterns × 0.5) + (keywords × 0.3) + (sentences × 0.2)
```

#### Risk Scorer (`src/analysis/risk-scorer.js`)

**Algorithme de scoring** :

```javascript
score = BASE_SCORE (50)
      × multiplicateurs positifs
      - pénalités clauses
      - pénalités document
      + bonus lisibilité
```

**Multiplicateurs** :
- Politique de confidentialité présente: ×1.1
- Politique de cookies: ×1.05
- Langage clair (Flesch > 60): ×1.15
- Document court (< 5000 mots): ×1.1
- Facile à trouver: ×1.05

**Pénalités** :
- Langage vague: -10
- Très long (> 10k mots): -15
- Difficile à trouver: -10
- Pas de contact: -5
- Obsolète (> 2 ans): -10
- Par clause selon weight

**Classification finale** :
- 70-100: Risque FAIBLE (Vert)
- 40-69: Risque MOYEN (Orange)
- 0-39: Risque ÉLEVÉ (Rouge)

---

## 💾 Stockage

### Chrome Storage API

**Clés utilisées** :
```javascript
{
  "privacy_guard_analyses": {
    "https://example.com/privacy": { /* analysis object */ },
    // ... max 100 entrées
  },
  "privacy_guard_settings": {
    "autoAnalyze": true,
    "showBadge": true,
    "language": "en"
  },
  "privacy_guard_visited": [
    "https://site1.com",
    "https://site2.com"
  ]
}
```

**Limites** :
- Cache duration: 7 jours
- Max entries: 100 analyses
- Suppression automatique des plus anciennes

---

## 🔄 Flux de Données

### Workflow Complet d'une Analyse

```
1. User loads page
        ↓
2. Content Script détecte page légale
        ↓
3. Notification → Service Worker
        ↓
4. Service Worker vérifie cache
        ↓
   ┌─── Cache HIT → Retourne résultat
   │
   └─── Cache MISS → Continue
        ↓
5. Service Worker demande contenu
        ↓
6. Content Script extrait texte + metadata
        ↓
7. Service Worker lance analyse:
   ├─ NLP Engine (tokenize, stats, keywords)
   ├─ Clause Detector (pattern matching)
   └─ Risk Scorer (calcul score)
        ↓
8. Sauvegarde résultat (cache + storage)
        ↓
9. Mise à jour badge
        ↓
10. Notification → Popup (si ouvert)
        ↓
11. Popup affiche résultats
```

---

## 🔐 Sécurité & Permissions

### Permissions Requises

**Manifest V3 Permissions** :
```json
{
  "permissions": [
    "storage",      // Cache local
    "activeTab",    // Accès onglet actif uniquement
    "scripting"     // Injection content scripts
  ],
  "host_permissions": [
    "<all_urls>"    // Détection sur tous les sites
  ]
}
```

### Principes de Sécurité

1. **Pas de serveur externe** : Tout le traitement est local
2. **Pas de collecte de données** : Aucune donnée utilisateur n'est envoyée
3. **Permissions minimales** : Seulement ce qui est nécessaire
4. **Content Security Policy** : CSP stricte
5. **Isolation** : Extension isolée du contexte de la page

---

## 🌐 Internationalisation (i18n)

**Langues supportées** :
- Anglais (en) - Défaut
- Français (fr)
- Allemand (de) - À venir
- Espagnol (es) - À venir
- Italien (it) - À venir

**Système** : Chrome i18n API
```javascript
chrome.i18n.getMessage("extensionName")
```

**Détection de langue** :
- Document: `document.documentElement.lang`
- User settings: `chrome.storage.local`
- Browser default: `navigator.language`

---

## ⚡ Performance

### Optimisations

1. **Lazy Loading** : Modules chargés à la demande
2. **Debouncing** : Détection DOM changes (500ms)
3. **Caching** : Évite re-analyse inutile
4. **Truncation** : Documents > 500KB tronqués
5. **Timeout** : Analyse max 30s

### Métriques Cibles

- **Time to First Analysis** : < 3s
- **Popup Load Time** : < 100ms
- **Memory Usage** : < 50MB
- **Storage Size** : < 5MB

---

## 🧪 Testing Strategy

### Niveaux de Tests

1. **Unit Tests** : Chaque module isolément
   - NLP functions
   - Clause detection
   - Scoring logic

2. **Integration Tests** : Communication inter-modules
   - Service Worker ↔ Content Script
   - Analysis pipeline complète

3. **E2E Tests** : Scénarios utilisateur
   - Installation
   - Première analyse
   - Cache retrieval
   - Multi-onglets

### Sites de Test

**Catégories** :
- ✅ Privacy policies claires (GitHub, Stripe)
- ⚠️ Privacy policies moyennes (Facebook, Amazon)
- 🔴 Privacy policies opaques (trackers, data brokers)

---

## 📈 Évolution Future

### v1.5 (8 semaines)
- Support Firefox & Edge natif
- Comparaison avec moyenne marché (dataset)
- Historique des analyses
- Export PDF du rapport

### v2.0 (12 semaines)
- Machine Learning pour amélioration
- Détection multilingue avancée
- API publique pour développeurs
- Dashboard web analytics

### v3.0 (Long terme)
- Analyse temps réel des bannières
- Recommandations personnalisées basées historique
- Intégration avec navigateurs (partenariat)
- Open dataset communautaire

---

## 🤝 Contribution

### Architecture Extensible

**Ajouter un nouveau détecteur de clause** :
```javascript
// src/utils/constants.js
export const SENSITIVE_CLAUSES = {
  // ...
  NEW_CLAUSE: {
    weight: 7,
    keywords: [...],
    patterns: [/regex/i]
  }
};
```

**Ajouter une nouvelle langue** :
```
_locales/
  ├── en/
  ├── fr/
  └── de/  ← Nouvelle langue
      └── messages.json
```

---

**Documentation maintenue par l'équipe Privacy Guard**  
*Dernière mise à jour : Version 1.0.0*
