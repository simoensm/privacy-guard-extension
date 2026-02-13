# 🚀 Guide de Déploiement - Privacy Guard

Ce guide détaille toutes les étapes nécessaires pour déployer Privacy Guard sur les différentes plateformes d'extensions de navigateurs.

---

## 📋 Table des Matières

1. [Préparation](#préparation)
2. [Chrome Web Store](#chrome-web-store)
3. [Firefox Add-ons (AMO)](#firefox-add-ons)
4. [Microsoft Edge Add-ons](#microsoft-edge-add-ons)
5. [Distribution Privée](#distribution-privée)
6. [Mises à Jour](#mises-à-jour)
7. [Métriques & Monitoring](#métriques--monitoring)

---

## 🎯 Préparation

### Checklist Pré-Déploiement

- [ ] **Tests complets** sur tous les navigateurs cibles
- [ ] **Assets créés** (icônes, captures d'écran, vidéos)
- [ ] **Documentation** à jour (README, ARCHITECTURE)
- [ ] **Changelog** rédigé pour cette version
- [ ] **Privacy Policy** publique accessible en ligne
- [ ] **Code minifié** et optimisé (si applicable)
- [ ] **Version number** mise à jour dans `manifest.json`
- [ ] **License** clairement définie (MIT recommandé)

### Assets Requis

#### Icônes de l'Extension

Créer des icônes PNG aux dimensions suivantes :

```
assets/icons/
├── icon-16.png    (16x16px)   - Badge, menus
├── icon-48.png    (48x48px)   - Extension management
├── icon-128.png   (128x128px) - Store listing
├── icon-256.png   (256x256px) - Promotionnel (optionnel)
└── icon-512.png   (512x512px) - Haute résolution (optionnel)
```

**Spécifications** :
- Format : PNG avec transparence
- Fond : Transparent ou uniforme
- Style : Icône simple, reconnaissable à petite taille
- Couleurs : Cohérentes avec l'identité de marque

**Outils recommandés** :
- Figma / Sketch / Adobe Illustrator
- Export automatisé : `@2x`, `@3x` pour rétina

#### Captures d'Écran

**Chrome & Edge** :
- Dimensions : 1280×800px ou 640×400px
- Maximum : 5 captures
- Format : PNG ou JPEG

**Firefox** :
- Dimensions : Minimum 320px de largeur
- Pas de limite stricte
- Format : PNG ou JPEG

**Exemples de captures à inclure** :
1. Popup avec analyse complète (score visible)
2. Liste des clauses détectées
3. Comparaison avec le marché
4. Vue détaillée (si applicable)
5. Settings / Options page

#### Vidéo Promotionnelle (Optionnel)

- Durée : 30-60 secondes
- Format : MP4, WebM
- Contenu : Démo rapide de l'extension
- Hébergement : YouTube puis lien dans description

---

## 🟦 Chrome Web Store

### Étape 1 : Compte Développeur

1. **Créer un compte** sur [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. **Frais d'enregistrement** : $5 (une fois)
3. **Vérification email** requise

### Étape 2 : Préparer le Package

```bash
# Dans le dossier de l'extension
cd privacy-guard-extension

# Créer une archive ZIP
# Windows PowerShell :
Compress-Archive -Path * -DestinationPath privacy-guard-v1.0.0.zip

# Ou manuellement :
# Sélectionner tous les fichiers/dossiers → Clic droit → Envoyer vers → Dossier compressé
```

**⚠️ Important** :
- Le ZIP doit contenir les fichiers directement (pas de dossier parent)
- Structure correcte :
  ```
  privacy-guard-v1.0.0.zip
  ├── manifest.json
  ├── src/
  ├── assets/
  └── _locales/
  ```

### Étape 3 : Soumettre l'Extension

1. **Dashboard** → "New Item"
2. **Upload** le fichier ZIP
3. **Remplir le formulaire** :

   **Store Listing** :
   ```
   Nom : Privacy Guard
   
   Description courte (132 caractères max) :
   Analyze privacy policies automatically. Get transparency scores and clear summaries in seconds.
   
   Description détaillée :
   Privacy Guard helps you understand what you're agreeing to when you accept terms & conditions 
   or privacy policies. Our extension automatically:
   
   ✓ Detects legal documents on any website
   ✓ Analyzes content using NLP
   ✓ Identifies sensitive clauses (data selling, third-party sharing, etc.)
   ✓ Provides a transparency score (0-100)
   ✓ Generates easy-to-read summaries
   
   Key Features:
   - Automatic detection of Privacy Policies, Terms of Service, Cookie Policies
   - Risk classification (Low / Medium / High)
   - 10+ clause types detected
   - 100% local processing (no data sent to servers)
   - GDPR compliant
   - Open source
   
   Privacy First:
   We don't collect ANY of your personal data. All analysis happens locally on your device.
   
   Perfect for:
   - Privacy-conscious users
   - GDPR compliance checking
   - Students & researchers
   - Anyone who cares about their digital rights
   ```

   **Catégorie** : "Productivity" ou "Social & Communication"
   
   **Langue** : English (+ French si disponible)

4. **Confidentialité** :
   - Créer et héberger une Privacy Policy
   - Exemple de lien : `https://github.com/USERNAME/privacy-guard-extension/blob/main/PRIVACY.md`
   - Déclarer **Aucune collecte de données**

5. **Justification des permissions** :
   ```
   storage: Pour sauvegarder les analyses localement et éviter les re-analyses
   activeTab: Pour lire le contenu de la page et effectuer l'analyse
   scripting: Pour injecter le script de détection sur les pages visitées
   ```

6. **Captures d'écran** : Upload 3-5 images

7. **Single Purpose Description** :
   ```
   Privacy Guard analyzes legal documents (privacy policies, terms of service) to provide 
   users with transparency scores and summaries, helping them make informed decisions.
   ```

### Étape 4 : Review Process

- **Délai** : 1-7 jours (généralement 2-3 jours)
- **Review automatisé** : Détection de malware, violations de politiques
- **Review humain** : Vérification manuelle

**Rejets courants** :
- Permissions excessive
- Description trompeuse
- Fonctionnalité non claire
- Violation de marques déposées

### Étape 5 : Publication

Une fois approuvé :
- **Public immédiatement** ou planifié
- URL publique : `https://chrome.google.com/webstore/detail/[ID]`

---

## 🦊 Firefox Add-ons (AMO)

### Étape 1 : Compte Développeur

1. **Créer un compte** sur [Firefox Add-ons](https://addons.mozilla.org/developers/)
2. **Gratuit** (pas de frais)
3. **Vérification email**

### Étape 2 : Adapter le Manifest (si nécessaire)

Firefox utilise également Manifest V3, mais peut nécessiter des ajustements :

```json
// manifest.json - Ajout pour Firefox si nécessaire
{
  "browser_specific_settings": {
    "gecko": {
      "id": "privacy-guard@example.com",
      "strict_min_version": "109.0"
    }
  }
}
```

### Étape 3 : Soumettre

1. **Developer Hub** → "Submit a New Add-on"
2. **Upload** le ZIP
3. **Source Code** : Si utilisation de build tools, uploader aussi le code source

**Formulaire** :
```
Nom : Privacy Guard

Résumé (250 caractères) :
Automatically analyze privacy policies and terms of service. 
Get transparency scores and detect sensitive clauses in seconds.

Description complète : (Similaire à Chrome)

Catégories : Privacy & Security

License : MIT License

Support Email : support@example.com
Support URL : https://github.com/USERNAME/privacy-guard-extension/issues
```

### Étape 4 : Review

- **Délai** : 1-10 jours
- **Plus strict** que Chrome
- **Code review** approfondi

**Différences avec Chrome** :
- Demande de justification plus détaillée
- Peut demander des modifications de code
- Source code upload obligatoire si minification

---

## 🟩 Microsoft Edge Add-ons

### Étape 1 : Compte Développeur

1. **Partner Center** : [Edge Add-ons Dashboard](https://partner.microsoft.com/dashboard/microsoftedge)
2. **Gratuit**
3. **Compte Microsoft** requis

### Étape 2 : Soumettre

**Bonne nouvelle** : Edge accepte les extensions Chrome directement !

1. Même ZIP que Chrome
2. Processus très similaire
3. **Délai** : 1-3 jours (plus rapide que Chrome)

**Formulaire** :
- Identique à Chrome
- Même description, captures, etc.

---

## 📦 Distribution Privée

### Cas d'Usage

- Tests bêta privés
- Distribution entreprise
- Version non publique

### Chrome - Unpacked Extension

```bash
1. Ouvrir chrome://extensions/
2. Activer "Mode développeur"
3. "Charger l'extension non empaquetée"
4. Sélectionner le dossier de l'extension
```

### Firefox - Temporary Add-on

```bash
1. Ouvrir about:debugging#/runtime/this-firefox
2. "Charger un module complémentaire temporaire"
3. Sélectionner manifest.json
```

### Distribution par CRX (Chrome)

```bash
# Créer un package .crx
chrome --pack-extension=privacy-guard-extension --pack-extension-key=key.pem

# Partager le fichier .crx
# Note: Nécessite installation manuelle (mode développeur)
```

---

## 🔄 Mises à Jour

### Versioning (SemVer)

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1  (Bug fix)
1.0.1 → 1.1.0  (New feature)
1.1.0 → 2.0.0  (Breaking change)
```

### Process de mise à jour

1. **Modifier** `manifest.json` :
   ```json
   {
     "version": "1.1.0"
   }
   ```

2. **Changelog** dans description :
   ```
   What's New in 1.1.0:
   - Added Firefox support
   - Improved clause detection accuracy
   - Fixed crash on long documents
   - Performance improvements
   ```

3. **Re-packager** et **uploader**

4. **Auto-update** : Les navigateurs mettent à jour automatiquement
   - Chrome : Toutes les 5 heures
   - Firefox : Toutes les 24 heures
   - Edge : Toutes les heures

---

## 📊 Métriques & Monitoring

### Métriques à Suivre

**Chrome Web Store** fournit :
- Installations totales
- Utilisateurs actifs (quotidien/hebdomadaire)
- Notes & avis
- Impressions dans le store
- Désinstallations

**Firefox AMO** :
- Downloads
- Utilisateurs actifs quotidiens
- Notes & critiques

### Analytics (Optionnel)

**⚠️ Attention** : Respecter la vie privée

Si vous souhaitez des analytics :
1. **Google Analytics 4** avec anonymisation IP
2. **Plausible Analytics** (privacy-friendly)
3. **Déclarer** dans Privacy Policy
4. **User consent** obligatoire (RGPD)

**Recommandation** : Éviter les analytics pour Privacy Guard (cohérence avec mission)

### Error Tracking

```javascript
// Option: Sentry.io (privacy mode)
try {
  // Code
} catch (error) {
  console.error(error);
  // Optionnel: Sentry.captureException(error);
}
```

---

## 🎉 Checklist Finale

Avant publication :

- [ ] Version testée sur Chrome, Firefox, Edge
- [ ] Manifest.json avec bonne version
- [ ] Icônes haute qualité incluses
- [ ] Captures d'écran professionnelles
- [ ] Description complète et attractive
- [ ] Privacy Policy publiée en ligne
- [ ] Justification des permissions claire
- [ ] README et ARCHITECTURE à jour
- [ ] LICENSE file présent
- [ ] Code commenté et propre
- [ ] Pas de console.log excessifs
- [ ] Tests E2E passent

---

## 🆘 Support Post-Lancement

### Gestion des Avis

**Répondez aux avis** (surtout négatifs) :
- Rapidement (< 48h)
- Professionnellement
- Proposez des solutions

Exemple :
```
Merci pour votre retour ! Nous sommes désolés que l'extension ne fonctionne pas 
sur ce site. Pourriez-vous nous partager l'URL à support@example.com ? 
Nous allons investiguer immédiatement.
```

### Reporting Bugs

**Créer un système** :
- GitHub Issues (recommandé)
- Email support
- Formulaire dans l'extension

---

## 📚 Ressources Utiles

**Documentation Officielle** :
- [Chrome Web Store Developer Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Firefox Add-on Policies](https://extensionworkshop.com/documentation/publish/add-on-policies/)
- [Edge Add-ons Policies](https://docs.microsoft.com/microsoft-edge/extensions-chromium/publish/publish-extension)

**Communautés** :
- [Chrome Extensions Google Group](https://groups.google.com/a/chromium.org/g/chromium-extensions)
- [Firefox Add-ons Discourse](https://discourse.mozilla.org/c/add-ons/35)

---

**Bonne chance avec votre déploiement ! 🚀**

*Documentation maintenue par l'équipe Privacy Guard*
