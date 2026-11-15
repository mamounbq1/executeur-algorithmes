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
3. Dans `../site/index.html`, remplacer `1.0.0` par la nouvelle version (liens de téléchargement et texte).
4. Recopier la page HTML dans `../site/app/index.html` pour la version en ligne.
5. Publier (depuis le dossier du projet) :

```
git add -A && git commit -m "Version 1.0.1" && git push
gh release create v1.0.1 "desktop/dist/Executeur-algorithmes-Setup-1.0.1.exe" --title "Exécuteur d'algorithmes 1.0.1" --notes "Nouveautés…"
git subtree split --prefix site -b gh-pages-tmp && git push -f origin gh-pages-tmp:gh-pages && git branch -D gh-pages-tmp
cd site && npx vercel deploy --prod
```

Le site GitHub Pages est servi depuis la branche `gh-pages` (copie du dossier `site/`).

## Fichiers

- `main.js` : fenêtre, menus en français, boîtes de dialogue Ouvrir/Enregistrer, ouverture des fichiers `.algo` par double-clic.
- `preload.js` : pont sécurisé entre la page et Windows.
- `build/icon.ico`, `build/file.ico` : icônes de l'application et des fichiers `.algo` (générées depuis `build/icon.png`).
