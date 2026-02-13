# 🛡️ Privacy Guard

> **Analysez les politiques de confidentialité automatiquement. Obtenez un score de transparence en quelques secondes.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/privacy-guard/extension)
[![Chrome](https://img.shields.io/badge/Chrome-Compatible-green.svg)](https://www.google.com/chrome/)
[![Firefox](https://img.shields.io/badge/Firefox-Compatible-orange.svg)](https://www.mozilla.org/firefox/)
[![Edge](https://img.shields.io/badge/Edge-Compatible-blue.svg)](https://www.microsoft.com/edge)

---

## 🎯 Qu'est-ce que Privacy Guard ?

Privacy Guard est une **extension de navigateur** qui analyse automatiquement les politiques de confidentialité, conditions d'utilisation et documents RGPD pour vous aider à :

✅ **Comprendre** ce que vous signez en quelques secondes  
✅ **Identifier** les clauses problématiques (revente de données, arbitrage, etc.)  
✅ **Comparer** la transparence des sites avec un score 0-100  
✅ **Décider** en toute connaissance de cause

**100% Privacy-First** : Tout le traitement se fait localement dans votre navigateur. Aucune donnée n'est collectée ou envoyée à des serveurs.

---

## ✨ Fonctionnalités

### 🔍 Détection Automatique
- Détecte automatiquement les pages de privacy policies, terms of service, cookies
- Ne nécessite aucune action manuelle (mais vous pouvez analyser manuellement aussi)

### 🧠 Analyse NLP Avancée
- Extraction des points clés (résumé en 5-7 phrases)
- Score de lisibilité (Flesch)
- Statistiques du document (mots, complexité)
- Mots-clés principaux (TF-IDF)

### 🎯 Détection de Clauses Sensibles
Identifie **10 types de clauses** :
- 🔴 Revente de données
- 🔴 Collecte de données sensibles
- 🔴 Arbitrage obligatoire
- ⚠️ Partage avec des tiers
- ⚠️ Transfert hors UE
- ⚠️ Géolocalisation
- � Publicité ciblée
- 📊 Conservation des données
- ✅ Droits utilisateur (positif)

### 📊 Score de Transparence
- Score de **0 à 100** calculé automatiquement
- Classification du risque : **Faible / Moyen / Élevé**
- Recommandations personnalisées

### 🎨 Interface Moderne
- Design glassmorphism premium
- Dark mode
- Animations fluides
- Score circulaire animé
- Color-coded risk badges

### 💾 Cache Intelligent
- Sauvegarde les analyses pendant 7 jours
- Pas de re-analyse inutile
- Maximum 100 entrées

### 🌐 Multilingue
- 🇬🇧 Anglais
- 🇫🇷 Français
- 🇩🇪 Allemand (à venir)
- 🇪🇸 Espagnol (à venir)

---

## 🚀 Installation

### Chrome Web Store
```
À venir - En attente de publication
```

### Firefox Add-ons
```
À venir - En attente de publication
```

### Installation Manuelle (Développeurs)

**Chrome / Edge** :
1. Télécharger ou cloner ce repository
2. Ouvrir `chrome://extensions/`
3. Activer "Mode développeur"
4. Cliquer "Charger l'extension non empaquetée"
5. Sélectionner le dossier du projet

**Firefox** :
1. Télécharger ou cloner ce repository
2. Ouvrir `about:debugging#/runtime/this-firefox`
3. Cliquer "Charger un module complémentaire temporaire"
4. Sélectionner `manifest.json`

---

## 📖 Documentation

### Pour Utilisateurs
- **[Guide de Démarrage Rapide](QUICK_START.md)** - Installation et utilisation
- **[FAQ](QUICK_START.md#faq)** - Questions fréquentes

### Pour Développeurs
- **[Guide de Contribution](CONTRIBUTING.md)** - Comment contribuer
- **[Architecture Technique](ARCHITECTURE.md)** - Documentation complète
- **[Système de Scoring](SCORING_SYSTEM.md)** - Logique de calcul

### Déploiement
- **[Guide de Déploiement](DEPLOYMENT.md)** - Publication sur les stores
- **[Guide Assets](ASSETS_GUIDE.md)** - Création des visuels

Voir **[INDEX.md](INDEX.md)** pour une navigation complète de la documentation.

---

## 🛠️ Technologies

- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Extension API** : Manifest V3 (Chrome/Firefox/Edge)
- **NLP** : Tokenization, TF-IDF, Flesch Readability
- **Storage** : Chrome Storage API (local)
- **i18n** : Chrome i18n API

**Aucune dépendance externe** - Extension 100% self-contained.

---

## 🔐 Vie Privée & Sécurité

Privacy Guard prend votre vie privée au sérieux :

✅ **Aucune collecte de données** personnelles  
✅ **Traitement 100% local** (dans votre navigateur)  
✅ **Pas de serveur externe**  
✅ **Pas d'analytics ou tracking**  
✅ **Open source** et auditable  
✅ **Conforme RGPD** by design

Voir **[PRIVACY.md](PRIVACY.md)** pour notre politique de confidentialité complète.

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Voici comment participer :

1. **Fork** le repository
2. **Créer** une branche (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

Voir **[CONTRIBUTING.md](CONTRIBUTING.md)** pour plus de détails.

### Types de Contributions
- 🐛 Corriger des bugs
- ✨ Ajouter des fonctionnalités
- 📝 Améliorer la documentation
- 🌐 Ajouter des traductions
- 🧪 Écrire des tests

---

## � Roadmap

### v1.0.0 - ✅ ACTUEL
- Détection automatique
- Analyse NLP complète
- 10 types de clauses
- Score 0-100
- UI moderne
- EN + FR

### v1.1.0 - 4 semaines
- [ ] Support Allemand et Espagnol
- [ ] Détection avancée bannières consent
- [ ] Vue détaillée complète
- [ ] Export PDF

### v1.5.0 - 8 semaines
- [ ] Historique des analyses
- [ ] Comparaison avec dataset réel
- [ ] Clauses personnalisables

### v2.0.0 - 12 semaines
- [ ] Machine Learning pour détection
- [ ] API publique
- [ ] Dashboard web

Voir **[CHANGELOG.md](CHANGELOG.md)** pour l'historique complet.

---

## 📸 Screenshots

```
À venir après création des assets
```

---

## 📄 Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🌟 Star History

Si vous trouvez ce projet utile, donnez-lui une ⭐ !

---

## 📞 Contact & Support

**Questions ?** Ouvrez une [Issue](https://github.com/privacy-guard/extension/issues)  
**Email** : support@privacyguard.app  
**Website** : https://privacyguard.app (à venir)

---

## 🙏 Remerciements

- Tous les contributeurs
- Les équipes Chrome/Firefox/Edge pour leurs APIs
- La communauté open source

---

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/privacy-guard/extension?style=social)
![GitHub forks](https://img.shields.io/github/forks/privacy-guard/extension?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/privacy-guard/extension?style=social)

---

**Privacy Guard** - Pour un web plus transparent 🛡️

*Making privacy policies accessible to everyone, one analysis at a time.*

---

**Made with ❤️ by the Privacy Guard Team**

*Développé avec passion pour un web plus équitable et transparent.*
