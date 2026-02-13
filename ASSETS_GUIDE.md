# 🎨 Guide de Création des Assets - Privacy Guard

Ce guide explique comment créer tous les assets visuels nécessaires pour Privacy Guard.

---

## 📦 Assets Requis

### 1. Icônes de l'Extension

Privacy Guard nécessite des icônes aux dimensions suivantes :

```
assets/icons/
├── icon-16.png    (16×16px)
├── icon-48.png    (48×48px)
├── icon-128.png   (128×128px)
├── icon-256.png   (256×256px) - Optionnel
└── icon-512.png   (512×512px) - Optionnel
```

---

## 🎨 Design de l'Icône

### Concept Visuel

**Élément principal** : Bouclier de protection

**Symboles additionnels** :
- Petit cadenas (sécurité)
- Ou checkmark (validation)
- Ou œil (transparence)

**Palette de couleurs** :
- Bleu principal : `#3b82f6`
- Bleu foncé : `#2563eb`
- Blanc/Gris clair : `#f8fafc`
- Fond : Transparent ou `#0f172a` (dark)

**Style** :
- Flat design moderne
- Formes simples et reconnaissables
- Bon contraste pour petites tailles
- Pas de texte

---

## 🛠️ Méthode 1 : Design avec Figma (Recommandé)

### Étape 1 : Créer le Canevas

1. Ouvrir [Figma](https://figma.com) (gratuit)
2. Créer un nouveau fichier
3. Créer un Frame 512×512px

### Étape 2 : Dessiner le Bouclier

```
Frame (512×512)
  └─ Bouclier
      • Rectangle avec coins arrondis (haut)
      • Pointe en bas (triangle)
      • Couleur: Dégradé bleu (#3b82f6 → #2563eb)
      • Stroke: 8px, blanc (#f8fafc)
```

**Code SVG de base** :
```svg
<svg width="512" height="512" viewBox="0 0 512 512" fill="none">
  <!-- Bouclier -->
  <path d="M256 32L96 96V240C96 370 192 474 256 496C320 474 416 370 416 240V96L256 32Z" 
        fill="url(#gradient)"/>
  
  <!-- Checkmark -->
  <path d="M192 256L224 288L320 192" 
        stroke="#ffffff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Gradient -->
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6"/>
      <stop offset="100%" style="stop-color:#2563eb"/>
    </linearGradient>
  </defs>
</svg>
```

### Étape 3 : Exporter les Icônes

1. Sélectionner le Frame
2. Dans le panel droit : **Export**
3. Ajouter les exports :
   - PNG @ 0.03125x → icon-16.png
   - PNG @ 0.09375x → icon-48.png
   - PNG @ 0.25x → icon-128.png
   - PNG @ 1x → icon-512.png

4. Cliquer **Export all**

---

## 🛠️ Méthode 2 : Design avec Inkscape (Gratuit, Desktop)

### Installation

Télécharger [Inkscape](https://inkscape.org/) (gratuit, open source)

### Étapes

1. **Nouveau document** : 512×512px
2. **Créer le bouclier** :
   - Outil Bézier (B)
   - Dessiner forme de bouclier
   - Remplir avec dégradé bleu
3. **Ajouter le symbole** : Checkmark ou cadenas
4. **Exporter** :
   - Fichier → Exporter image PNG
   - Définir dimensions (16, 48, 128, 512)
   - Exporter pour chaque taille

---

## 🛠️ Méthode 3 : Convertir SVG → PNG avec Code

Si vous avez déjà un SVG :

### Avec Node.js

```bash
# Installer sharp
npm install sharp

# Script convert.js
const sharp = require('sharp');
const fs = require('fs');

const svgBuffer = fs.readFileSync('icon.svg');

const sizes = [16, 48, 128, 256, 512];

sizes.forEach(size => {
  sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`assets/icons/icon-${size}.png`)
    .then(() => console.log(`✓ icon-${size}.png created`));
});
```

```bash
# Exécuter
node convert.js
```

### Avec ImageMagick (CLI)

```bash
# Installer ImageMagick
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: apt-get install imagemagick

# Convertir
convert icon.svg -resize 16x16 icon-16.png
convert icon.svg -resize 48x48 icon-48.png
convert icon.svg -resize 128x128 icon-128.png
convert icon.svg -resize 512x512 icon-512.png
```

---

## 📸 Captures d'Écran

### Dimensions Requises

**Chrome Web Store** :
- 1280×800px (ou 640×400px)
- Maximum 5 captures
- Format : PNG ou JPEG

**Firefox AMO** :
- Minimum 320px de largeur
- Format : PNG ou JPEG
- Pas de limite stricte

### Contenu des Captures

**Screenshot 1** : Popup avec score
```
Montrer:
- Score de transparence visible (ex: 78/100)
- Badge de risque coloré
- 3-4 points clés
```

**Screenshot 2** : Liste des clauses
```
Montrer:
- 3-5 clauses détectées
- Différentes couleurs (rouge, orange, vert)
- Poids et descriptions
```

**Screenshot 3** : Analyse en contexte
```
Montrer:
- Page de privacy policy d'un site réel
- Extension ouverte à côté
- Badge sur l'icône
```

**Screenshot 4** : Comparaison marché (futur)
```
Montrer:
- Score vs moyenne
- Graphique ou visualisation
```

**Screenshot 5** : Paramètres
```
Montrer:
- Options de configuration
- Interface claire
```

### Comment Créer

**Méthode A** : Capture d'écran native
1. Charger l'extension en dev mode
2. Ouvrir sur une vraie privacy policy
3. Windows : `Win + Shift + S`
4. Mac : `Cmd + Shift + 4`
5. Sélectionner zone

**Méthode B** : Chrome DevTools
1. F12 → Device Toolbar
2. Sélectionner résolution (1280×800)
3. Capture screenshot
4. DevTools → ⋮ → Capture screenshot

**Méthode C** : Photoshop/Figma
1. Créer mockup haute qualité
2. Importer vraies données de l'extension
3. Exporter en PNG

---

## 🎬 Vidéo Promotionnelle (Optionnel)

### Spécifications

- **Durée** : 30-60 secondes
- **Résolution** : 1920×1080 (Full HD)
- **Format** : MP4, WebM
- **Framerate** : 30 ou 60 fps

### Scénario Suggéré

```
00:00 - 00:05  Logo Privacy Guard + tagline
00:05 - 00:10  Navigateur visitant une privacy policy
00:10 - 00:15  Extension détecte automatiquement
00:15 - 00:25  Popup s'ouvre, score s'anime
00:25 - 00:35  Défilement des clauses détectées
00:35 - 00:45  Recommandations affichées
00:45 - 00:55  "100% Privacy-First" animation
00:55 - 01:00  Call-to-action: "Download Now"
```

### Outils

**Gratuit** :
- [Loom](https://loom.com) - Screen recording
- [OBS Studio](https://obsproject.com) - Recording + editing
- [Shotcut](https://shotcut.org) - Video editing

**Payant** :
- Adobe After Effects
- Camtasia
- ScreenFlow (Mac)

---

## 🖼️ Template SVG Fourni

Utilisez ce SVG comme base :

```xml
<!-- Enregistrer comme icon.svg -->
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fond (optionnel, pour version avec fond) -->
  <!-- <rect width="512" height="512" rx="128" fill="#0f172a"/> -->
  
  <!-- Bouclier principal -->
  <path d="M256 64 L128 128 L128 272 C128 384 208 464 256 492 C304 464 384 384 384 272 L384 128 Z" 
        fill="url(#shieldGradient)" 
        stroke="#f8fafc" 
        stroke-width="12"/>
  
  <!-- Checkmark -->
  <path d="M192 268 L232 308 L320 220" 
        stroke="#ffffff" 
        stroke-width="32" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        fill="none"/>
</svg>
```

Puis convertir en PNG avec les méthodes ci-dessus.

---

## ✅ Checklist Finale

Avant de publier, vérifiez :

- [ ] **icon-16.png** : 16×16px, visible et reconnaissable
- [ ] **icon-48.png** : 48×48px, net et clair
- [ ] **icon-128.png** : 128×128px, haute qualité
- [ ] **Screenshots** : 3-5 images de 1280×800px
- [ ] **Couleurs cohérentes** : Utilise la palette de Privacy Guard
- [ ] **Pas de texte** dans les icônes
- [ ] **Fond transparent** ou cohérent
- [ ] **Exporté en PNG** (pas de JPEG pour les icônes)

---

## 📦 Organisation Finale des Assets

```
privacy-guard-extension/
├── assets/
│   ├── icons/
│   │   ├── icon-16.png
│   │   ├── icon-48.png
│   │   ├── icon-128.png
│   │   └── icon-512.png (optionnel, source)
│   ├── screenshots/
│   │   ├── screenshot-1-popup.png
│   │   ├── screenshot-2-clauses.png
│   │   ├── screenshot-3-context.png
│   │   ├── screenshot-4-compare.png
│   │   └── screenshot-5-settings.png
│   └── video/
│       └── promo.mp4 (optionnel)
└── icon.svg (source SVG)
```

---

**Assets créés ? Vous êtes prêt pour le déploiement ! 🚀**

Voir **DEPLOYMENT.md** pour la publication sur les stores.
