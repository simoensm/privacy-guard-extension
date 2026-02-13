# 🚀 Guide de Démarrage Rapide - Privacy Guard

Bienvenue dans Privacy Guard ! Ce guide vous aidera à démarrer en quelques minutes.

---

## 📥 Installation

### Chrome / Edge

1. Visitez le [Chrome Web Store](https://chrome.google.com/webstore)
2. Recherchez "Privacy Guard"
3. Cliquez sur **"Ajouter à Chrome"** / **"Ajouter à Edge"**
4. Confirmez en cliquant **"Ajouter l'extension"**

✅ C'est tout ! L'extension est maintenant installée.

### Firefox

1. Visitez [Firefox Add-ons](https://addons.mozilla.org)
2. Recherchez "Privacy Guard"
3. Cliquez sur **"Ajouter à Firefox"**
4. Confirmez l'installation

---

## 🎯 Première Utilisation

### Étape 1 : Trouvez une Politique de Confidentialité

Visitez n'importe quel site web avec une politique de confidentialité. Par exemple :
- `https://github.com/site/privacy`
- `https://stripe.com/privacy`
- Ou tout autre site

### Étape 2 : Détection Automatique

Privacy Guard détecte automatiquement les pages légales. Vous verrez :

- 🔵 Un **badge bleu** sur l'icône de l'extension
- (Optionnel) Un **badge flottant** en bas à droite de la page

### Étape 3 : Lancer l'Analyse

**Option A** : Cliquez sur l'icône de l'extension dans la barre d'outils

**Option B** : Utilisez le raccourci clavier
- Windows/Linux : `Ctrl + Shift + P`
- Mac : `Cmd + Shift + P`

### Étape 4 : Attendez l'Analyse

L'analyse prend généralement **2-5 secondes**.

Vous verrez :
```
⏳ Analyse en cours...
```

### Étape 5 : Consultez les Résultats

Une fois terminé, le popup affiche :

```
┌─────────────────────────────┐
│     Score: 78 / 100         │
│       ┌────────┐            │
│       │   🟢   │            │
│       │   78   │            │
│       └────────┘            │
│                             │
│  ✓ Risque Faible            │
│  Politique transparente     │
└─────────────────────────────┘
```

---

## 🎨 Comprendre l'Interface

### Score de Transparence

Le **score (0-100)** indique la transparence de la politique :

| Score | Couleur | Signification |
|-------|---------|---------------|
| 70-100 | 🟢 Vert | **Faible risque** - Politique claire et respectueuse |
| 40-69 | 🟠 Orange | **Risque moyen** - Quelques clauses préoccupantes |
| 0-39 | 🔴 Rouge | **Risque élevé** - Nombreuses clauses problématiques |

### Points Clés

Les **5-7 points principaux** extraits de la politique :

```
• Données collectées : Email, nom, usage du service
• Conservation : 2 ans après fermeture du compte
• Partage : Aucun partage avec des tiers
• Droits : Accès, rectification, suppression disponibles
```

### Clauses Détectées

Les **clauses sensibles** identifiées :

```
🔴 Revente de données        Poids: 10
   Vos données peuvent être vendues

⚠️  Partage avec tiers        Poids: 8
   Données partagées avec partenaires

✓  Droits utilisateur        Poids: -5
   Vos droits RGPD sont mentionnés
```

**Légende des couleurs** :
- 🔴 Rouge : Critique (weight ≥ 8)
- 🟠 Orange : Important (weight 5-7)
- 🔵 Bleu : Modéré (weight 1-4)
- 🟢 Vert : Positif (weight < 0)

### Recommandations

Conseils personnalisés basés sur l'analyse :

```
⚠️ Lisez attentivement avant d'accepter
🌍 Transfert de données hors UE - vérifiez les garanties
✓ Vos droits sont mentionnés - n'hésitez pas à les exercer
```

---

## ⚙️ Fonctionnalités Avancées

### Analyse Détaillée

Cliquez sur **"Analyse Détaillée"** pour voir :
- Liste complète des clauses
- Statistiques du document (mots, phrases, lisibilité)
- Mots-clés principaux
- Entités détectées (dates, organisations)

### Comparer avec le Marché

Cliquez sur **"Comparer"** pour voir :
```
Votre score : 78
Moyenne du marché : 55
Différence : +23 points

→ Mieux que 70% des sites analysés
```

### Historique des Analyses

Les analyses sont **automatiquement sauvegardées** pendant 7 jours.

Revisitez une page déjà analysée :
- Le résultat s'affiche **instantanément** (pas de nouvelle analyse)
- Cache automatique pour économiser du temps

### Analyser Manuellement

Sur une page non détectée automatiquement :
1. Ouvrez le popup
2. Cliquez sur **"Analyser cette page"**

---

## 🔧 Paramètres

### Accéder aux Paramètres

1. Clic droit sur l'icône de l'extension
2. **"Options"**

### Options Disponibles

**Analyse automatique** :
- ✅ Activé : Analyse automatique des pages détectées
- ❌ Désactivé : Analyse seulement sur demande

**Badge** :
- ✅ Afficher le badge sur l'icône
- ❌ Masquer le badge

**Langue** :
- 🇬🇧 English
- 🇫🇷 Français
- (Plus à venir)

**Notifications** :
- ✅ Alertes pour risques élevés
- ❌ Mode silencieux

---

## 🛡️ Vie Privée & Sécurité

### Vos Données Sont Protégées

Privacy Guard respecte votre vie privée :

- ✅ **Aucune collecte de données** personnelles
- ✅ **Traitement 100% local** (sur votre appareil)
- ✅ **Pas de serveur externe**
- ✅ **Open source** (code vérifiable)
- ✅ **Conforme RGPD**

### Permissions Expliquées

L'extension demande :

**📂 Storage** : Pour sauvegarder les analyses en cache (sur votre appareil uniquement)

**📄 ActiveTab** : Pour lire le contenu de la page à analyser

**⚙️ Scripting** : Pour injecter le détecteur de pages légales

**Aucune donnée n'est envoyée à l'extérieur.**

---

## ❓ FAQ (Questions Fréquentes)

### L'extension fonctionne sur quels sites ?

Privacy Guard fonctionne sur **tous les sites web** qui ont :
- Une politique de confidentialité
- Des conditions d'utilisation
- Une politique de cookies
- Des documents RGPD

### Quelles langues sont supportées ?

Actuellement :
- 🇬🇧 **Anglais** (détection + interface)
- 🇫🇷 **Français** (détection + interface)

À venir :
- 🇩🇪 Allemand
- 🇪🇸 Espagnol
- 🇮🇹 Italien

### L'analyse ralentit-elle la navigation ?

**Non.** Privacy Guard :
- Fonctionne en arrière-plan
- N'analyse que sur demande ou détection
- Ne ralentit pas le chargement des pages

### Comment supprimer le cache ?

**Option 1** : Paramètres de l'extension → "Effacer le cache"

**Option 2** : Paramètres du navigateur
- Chrome : `chrome://extensions/` → Privacy Guard → "Effacer les données"

### L'extension est-elle gratuite ?

**Oui, 100% gratuit** et le restera toujours.

- Pas de version premium
- Pas de publicités
- Pas d'abonnement

### Est-ce que Privacy Guard vend mes données ?

**Absolument pas.** Nous ne collectons **aucune donnée**.

C'est ironique : nous créons un outil pour dénoncer les mauvaises pratiques de confidentialité. Nous n'allons pas faire la même chose !

---

## 🐛 Problèmes Connus

### Firefox : Badge ne se met pas à jour

**Solution** : Cliquez sur l'icône pour forcer la mise à jour.

### Document très long (> 100KB)

**Symptôme** : L'analyse peut prendre 10-15 secondes.

**Solution** : Patience, c'est normal pour les très longues politiques.

### Page non détectée automatiquement

**Solution** : Utilisez le bouton "Analyser cette page" manuellement.

---

## 🆘 Support

### Besoin d'aide ?

**GitHub Issues** :  
[https://github.com/privacy-guard/extension/issues](https://github.com/privacy-guard/extension/issues)

**Email** :  
support@privacyguard.app

**Documentation** :  
Voir README.md pour plus de détails techniques.

### Signaler un Bug

1. Allez sur GitHub Issues
2. Cliquez "New Issue"
3. Décrivez le problème avec :
   - Navigateur et version
   - URL de la page (si possible)
   - Captures d'écran

---

## 🌟 Contribuer

Privacy Guard est **open source** !

**Contribuez** :
- 🐛 Signaler des bugs
- 💡 Proposer des fonctionnalités
- 🌐 Traduire dans votre langue
- 💻 Contribuer du code

Voir **CONTRIBUTING.md** pour plus d'infos.

---

## 📢 Restez Informé

**Mises à jour** :
- Les mises à jour sont automatiques
- Consultez CHANGELOG.md pour les nouveautés

**Communauté** :
- GitHub : Discussions et Issues
- Twitter : @PrivacyGuardExt (à venir)

---

## 🎉 C'est Parti !

Vous êtes maintenant prêt à utiliser Privacy Guard !

**Prochaines étapes** :
1. Visitez un site avec une politique de confidentialité
2. Laissez l'extension détecter la page
3. Consultez votre premier score de transparence

**Bonne navigation transparente ! 🛡️**

---

**Privacy Guard** - Comprendre ce que vous acceptez, en toute simplicité.

*Version 1.0.0 - Février 2026*
