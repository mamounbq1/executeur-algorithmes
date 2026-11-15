# Exécuteur d'algorithmes — version de bureau

L'application est la page `../Exécuteur d'algorithme.html`, emballée avec Electron.
Quatre versions sont fabriquées : Windows 64 bits, Windows 32 bits, Mac Apple Silicon, Mac Intel.

## Commandes

| Commande | Effet |
|---|---|
| `npm install` | installe Electron et electron-builder (une seule fois) |
| `npm start` | lance l'application sans l'installer (pour tester) |
| `npm run dist` | crée les installateurs Windows `dist/Executeur-algorithmes-Windows-x64.exe` et `-ia32.exe` |
| `npm run dist:mac` | crée les `.dmg` Mac (uniquement sur un Mac) |

`prepare.js` recopie la page HTML dans `app/index.html` et y intègre les polices (l'application marche hors ligne). Il est lancé automatiquement par les commandes ci-dessus.

## Publier une nouvelle version

Les 4 versions sont fabriquées automatiquement par GitHub (workflow `.github/workflows/version-bureau.yml`) dès qu'une Release est publiée.

1. Changer `"version"` dans `package.json` (par exemple `1.0.2`).
2. Dans `../site/index.html`, mettre à jour le numéro de version (texte « Version 1.0.1 » et pied de page). Les liens de téléchargement n'ont pas à changer : ils pointent toujours vers la dernière Release.
3. Recopier la page HTML dans `../site/app/index.html` pour la version en ligne, en gardant juste avant `</head>` les 3 lignes « Statistiques de visite (Vercel Web Analytics) ». Les statistiques anonymes PostHog (clé `phc_…`) sont déjà dans la page (voir `../site/confidentialite.html`) ; les envois de l'application de bureau passent par `main.js`.
4. Publier (depuis le dossier du projet) :

```
git add -A && git commit -m "Version 1.0.2" && git push
gh release create v1.0.2 --title "Exécuteur d'algorithmes 1.0.2" --notes "Nouveautés…"
git subtree split --prefix site -b gh-pages-tmp && git push -f origin gh-pages-tmp:gh-pages && git branch -D gh-pages-tmp
cd site && npx vercel deploy --prod
```

Environ 10 minutes après `gh release create`, les 4 fichiers apparaissent dans la Release (suivi : onglet *Actions* du dépôt).
Pour relancer la fabrication d'une Release existante : `gh workflow run version-bureau.yml -f tag=v1.0.2`.

Le site GitHub Pages est servi depuis la branche `gh-pages` (copie du dossier `site/`).

## Fichiers

- `main.js` : fenêtre, menus en français, boîtes de dialogue Ouvrir/Enregistrer, ouverture des fichiers `.algo` par double-clic (Windows et Mac).
- `preload.js` : pont sécurisé entre la page et le système.
- `build/icon.ico`, `build/file.ico` (Windows), `build/icon.icns`, `build/file.icns` (Mac) : icônes de l'application et des fichiers `.algo`.
- `build/adhoc-sign.js` : signature « ad hoc » de l'application Mac, nécessaire pour qu'elle s'ouvre sur les Mac à puce Apple.
