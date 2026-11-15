# Exécuteur d'algorithmes — version de bureau

L'application est la page `../Exécuteur d'algorithme.html`, emballée avec Electron.

## Commandes

| Commande | Effet |
|---|---|
| `npm install` | installe Electron et electron-builder (une seule fois) |
| `npm start` | lance l'application sans l'installer (pour tester) |
| `npm run dist` | crée l'installateur `dist/Executeur-algorithmes-Setup-<version>.exe` |

`prepare.js` recopie la page HTML dans `app/index.html` et y intègre les polices (l'application marche hors ligne). Il est lancé automatiquement par `npm start` et `npm run dist` : après avoir modifié la page HTML, il suffit de relancer `npm run dist`.

## Publier une nouvelle version

1. Changer `"version"` dans `package.json` (par exemple `1.0.1`).
2. `npm run dist`
3. Copier le nouveau `.exe` dans `../site/telechargement/` et mettre à jour le numéro de version et le nom du fichier dans `../site/index.html`.
4. Recopier la page HTML dans `../site/app/index.html` pour la version en ligne.

## Fichiers

- `main.js` : fenêtre, menus en français, boîtes de dialogue Ouvrir/Enregistrer, ouverture des fichiers `.algo` par double-clic.
- `preload.js` : pont sécurisé entre la page et Windows.
- `build/icon.ico`, `build/file.ico` : icônes de l'application et des fichiers `.algo` (générées depuis `build/icon.png`).
