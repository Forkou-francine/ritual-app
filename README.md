# Rituel

Application de suivi quotidien : séances, hydratation, pas, habitudes, niveaux et code de la route.
PWA installable sur iOS et Android, fonctionne hors ligne, données stockées uniquement sur l'appareil.

## Démarrer

```bash
npm install
npm run dev -- --host
```

`--host` expose le serveur sur le réseau local : ouvrez l'URL affichée depuis votre téléphone
(même Wi-Fi) pour tester sur mobile pendant le développement.

## Mettre en ligne et installer sur le téléphone

Le service worker ne s'active qu'en HTTPS, donc l'installation se teste sur une vraie mise en ligne :

```bash
npm run build
npx vercel deploy --prod   # ou : glisser le dossier dist/ sur netlify.com/drop
```

Puis, sur le téléphone :

- **Android / Chrome** : menu ⋮ → « Installer l'application »
- **iOS / Safari** : bouton Partager → « Sur l'écran d'accueil »

L'icône apparaît sur l'écran d'accueil et l'application s'ouvre en plein écran, sans barre de navigateur.

## Structure

```
src/
├── data/        contenu éditable : exercices, repas, méthodes, questions
├── db/          schéma Dexie (IndexedDB), types, amorçage
├── lib/         dates et algorithme de révision espacée
├── components/  Icon, TabBar, Screen
└── features/    un dossier par écran
```

## Ajouter du contenu

Tout le contenu vit dans `src/data/`. Ajoutez une entrée, puis videz la base pour
que l'amorçage reparte de zéro : dans la console du navigateur,
`indexedDB.deleteDatabase('lifestyle')` puis rechargez.

Pour éviter cette manipulation en production, incrémentez plutôt la version Dexie
dans `src/db/db.ts` et écrivez une migration.

## Révision espacée

`src/lib/srs.ts` implémente une variante simplifiée de SM-2 : une bonne réponse allonge
l'intervalle (1 jour → 3 jours → intervalle × facteur de facilité), une mauvaise réponse
remet la question à réviser le jour même. Le facteur de facilité reste borné entre 1,3 et 2,8.

## Questions du code de la route

Les questions de `src/data/questions.ts` sont rédigées à partir du Code de la route
(articles cités pour chacune) et non reprises d'une banque de questions commerciale,
qui serait protégée par le droit d'auteur. Vérifiez les articles sur Légifrance avant
l'examen : la réglementation évolue.

## Limites connues

- Les pas sont saisis à la main. Un comptage automatique impose une coque native
  (React Native / Expo) pour accéder à Apple Santé ou Google Fit.
- Les données restent sur l'appareil : pas de synchronisation entre téléphone et
  ordinateur, et une désinstallation efface tout. Un export JSON est le prochain ajout utile.
