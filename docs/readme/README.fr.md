# html-merge

<!-- languages -->
<h3 align="center">
<a href="../../README.md">🇬🇧 English</a> ·
<a href="README.zh.md">🇨🇳 中文</a> ·
<a href="README.hi.md">🇮🇳 हिन्दी</a> ·
<a href="README.es.md">🇪🇸 Español</a> ·
<b>🇫🇷 Français</b> ·
<a href="README.ar.md">🇸🇦 العربية</a> ·
<a href="README.bn.md">🇧🇩 বাংলা</a> ·
<a href="README.pt.md">🇧🇷 Português</a> ·
<a href="README.ru.md">🇷🇺 Русский</a> ·
<a href="README.ur.md">🇵🇰 اردو</a> ·
<a href="README.id.md">🇮🇩 Bahasa Indonesia</a> ·
<a href="README.de.md">🇩🇪 Deutsch</a> ·
<a href="README.ja.md">🇯🇵 日本語</a> ·
<a href="README.mr.md">🇮🇳 मराठी</a> ·
<a href="README.te.md">🇮🇳 తెలుగు</a> ·
<a href="README.tr.md">🇹🇷 Türkçe</a> ·
<a href="README.uk.md">🇺🇦 Українська</a>
</h3>
<!-- /languages -->

**HTML Merge** compare deux dossiers, ou deux fichiers, côte à côte — comme WinMerge, mais sous
la forme d’un seul fichier HTML qui fonctionne dans tout navigateur moderne, sur Windows, macOS,
Linux, ChromeOS, Android et iOS. Choisissez deux dossiers et l’outil liste tous les fichiers des
deux avec ce qui leur est arrivé : identiques, différents, seulement à gauche, seulement à
droite. Ouvrez un fichier et les deux versions s’affichent côte à côte, avec la coloration
syntaxique de plus de quarante langages, les mots modifiés mis en évidence à l’intérieur des
lignes changées, et une carte de toutes les différences à côté de la barre de défilement.

Il ne fait que lire. Rien n’est installé, rien n’est envoyé et aucun fichier n’est jamais
modifié : les fichiers sont lus par la page elle-même, dans le navigateur, et la page ne peut
absolument pas accéder au réseau.

La même page fonctionne aussi comme PWA (Progressive Web App) : servie depuis GitHub Pages, elle
peut être installée dans le système puis s’exécuter comme une application à part, avec sa propre
fenêtre et son icône, et fonctionne hors ligne — voir « [GitHub Pages](#github-pages) ».

![HTML Merge : deux versions d’un fichier JavaScript côte à côte](../html-merge.png)

## Utilisation

1. Compilez `build/html-merge.html` (voir « [Compilation](#compilation) ») ou récupérez-le
   depuis une publication, puis ouvrez-le dans un navigateur — directement depuis le disque
   convient très bien.
2. Choisissez le côté gauche et le côté droit : **Dossier…** ou **Fichier…** pour chacun, ou
   faites glisser un dossier ou un fichier sur sa zone. Deux dossiers ou deux fichiers déposés en
   même temps sur la fenêtre sont comparés aussitôt.
3. **Comparer**.

Avec deux dossiers, la liste des dossiers apparaît et se remplit au fur et à mesure que les
fichiers sont comparés. Les puces en haut affichent ou masquent chaque type de résultat et les
comptent ; la liste peut être une arborescence ou une liste à plat des chemins, filtrée par nom
(`util`, ou un motif comme `*.ts`), et triée selon n’importe quelle colonne. Double-cliquez sur
un fichier (ou sélectionnez-le et appuyez sur Enter) pour le comparer ; `]` et `[` passent au
fichier différent suivant et précédent, et Esc ou le bouton Précédent du navigateur reviennent à
la liste.

Sur l’écran du fichier :

- les flèches déplacent entre les différences (Alt+↓ et Alt+↑, ou F7 et Shift+F7) ; la
  différence actuelle est marquée dans la marge, et la carte à droite montre où elles se trouvent
  toutes — cliquez dessus pour y aller directement ;
- **Côte à côte ou l’un sous l’autre** bascule entre deux volets et un volet unifié ;
- **Replier les lignes identiques** masque les longues portions identiques, en laissant quelques
  lignes autour de chaque différence ; cliquez sur un pli pour l’ouvrir ;
- **Rechercher** (Ctrl+F, ⌘F sur un Mac) marque chaque résultat des deux côtés ; Enter et
  Shift+Enter passent de l’un à l’autre ;
- le menu **⋯** regroupe les options d’affichage et de comparaison : la disposition, le langage
  utilisé pour colorer les fichiers, les couleurs de syntaxe, les espaces et fins de ligne
  visibles, les mots ou les caractères à l’intérieur des lignes modifiées, et ce qu’il faut
  ignorer.

Les images (PNG, JPEG, GIF, WebP, BMP, ICO, AVIF) sont affichées côte à côte avec leur taille en
pixels. Les autres fichiers binaires sont comparés octet par octet : la page indique s’ils sont
identiques, où se trouve la première différence, et montre les octets autour de celle-ci.

Chrome et Edge se souviennent des comparaisons récentes : elles sont listées sur l’écran de
démarrage et se rouvrent d’un clic (le navigateur redemande une fois l’autorisation de lire les
dossiers). Les autres navigateurs font choisir les dossiers à nouveau à chaque fois.

### Sur un téléphone

La page fonctionne sur l’écran d’un téléphone : l’écran de démarrage empile les deux côtés, la
liste des dossiers garde le nom et le résultat, et une paire de fichiers s’affiche l’un sous
l’autre. Touchez un fichier pour l’ouvrir. Sur Android, Chrome permet de choisir des dossiers
comme des fichiers ; iOS permet de comparer des fichiers (les dossiers n’y sont pas
sélectionnables).

## Fonctionnalités

- **Dossiers** : comparaison récursive par contenu (ou, plus rapide, par taille et date) ;
  arborescence ou liste à plat ; filtres par résultat et par nom ; tri par nom, résultat, taille
  ou date ; noms exclus par motif (`.git; node_modules; *.log; build/`) ; noms de fichiers
  comparés avec ou sans tenir compte de la casse ; statuts remplis au fur et à mesure que les
  fichiers sont lus, quelques-uns à la fois, pour que même les grands dossiers affichent quelque
  chose immédiatement.
- **Texte** : un diff « patience » au-dessus de l’algorithme de Myers, pour que des accolades ou
  des lignes vides déplacées n’associent pas du code sans rapport ; les lignes d’un bloc modifié
  sont associées selon leur ressemblance ; les mots ou caractères modifiés sont mis en évidence à
  l’intérieur d’une ligne ; les blocs de lignes vides peuvent être ignorés ; la vue unifiée ; le
  repli des lignes identiques ; la recherche des deux côtés.
- **Options de comparaison** : ignorer les changements d’espaces ou tous les espaces, ignorer la
  casse, ignorer les lignes vides, ignorer les fins de ligne (CRLF, LF, CR) — aussi bien pour la
  liste des dossiers que pour l’écran du fichier.
- **Encodages** : UTF-8, UTF-8 avec BOM, UTF-16 LE et BE, et Windows-1252 pour les fichiers qui ne
  sont pas de l’UTF-8 valide ; l’encodage, les fins de ligne et le nombre de lignes sont indiqués
  pour chaque côté, et une différence portant uniquement sur les fins de ligne est signalée comme
  telle.
- **Coloration syntaxique** pour plus de quarante langages, choisie d’après le nom du fichier ou
  sa première ligne (`#!/usr/bin/env python3`) : JavaScript, TypeScript, JSON, HTML (avec les
  scripts et styles qu’il contient), XML, CSS, SCSS, Less, Markdown, Python, Java, Kotlin, C,
  C++, C#, Go, Rust, Swift, Objective-C, PHP, Ruby, shell, PowerShell, fichiers batch, SQL, YAML,
  TOML, INI, Dockerfile, Makefile, CMake, diff, Lua, Perl, R, Dart, Scala, Groovy, Haskell,
  Elixir, GraphQL, Protocol Buffers, Pascal, Visual Basic. Tout autre langage peut être choisi
  manuellement.
- **Fichiers volumineux** : seules les lignes visibles sont dessinées, si bien que des fichiers de
  centaines de milliers de lignes défilent sans à-coups ; les lignes très longues sont tronquées
  à l’écran (la comparaison, elle, les voit en entier).
- **Images et fichiers binaires** comme décrit ci-dessus.
- **Dix-sept langues** pour l’interface, de droite à gauche pour l’arabe et l’ourdou ; un thème
  clair et un thème sombre, qui suivent le système ou se choisissent.
- L’application installée ne se met à jour que sur demande : voir
  « [GitHub Pages](#github-pages) ».

## Raccourcis clavier

| Touches | Action |
| --- | --- |
| Alt+↓, F7 | Différence suivante |
| Alt+↑, Shift+F7 | Différence précédente |
| `]` / `[` | Fichier différent suivant / précédent |
| Ctrl+F (⌘F) | Rechercher dans les fichiers, ou filtrer la liste des dossiers |
| Enter / Shift+Enter | Résultat suivant / précédent |
| ↑ ↓ ← → | Parcourir la liste des dossiers, ouvrir et fermer les dossiers |
| Enter | Ouvrir le fichier sélectionné |
| Esc | Retour à la liste des dossiers |
| F5 | Comparer à nouveau |
| ? | Liste des raccourcis |

## Sécurité

- **Lecture seule.** La page lit les fichiers et n’écrit, ne renomme ni ne supprime jamais rien.
  Dans Chrome et Edge, les dossiers sont ouverts via la File System Access API, en lecture seule.
- **Hors ligne par construction.** La Content-Security-Policy de la page indique
  `connect-src 'none'`, et tout ce dont elle a besoin — styles, code, icônes — se trouve dans
  l’unique fichier HTML. Elle ne peut rien charger ni rien envoyer, quel que soit le contenu d’un
  fichier comparé.
- **Script épinglé.** La compilation remplace `script-src 'unsafe-inline'` par le hachage de
  l’unique script de la page : si un nom de fichier ou une ligne de texte venait à passer sans
  être échappé, un gestionnaire intégré qu’il contiendrait ne s’exécuterait quand même pas. Le
  texte des fichiers arrive échappé sur la page.
- Les comparaisons récentes (Chrome et Edge) ne conservent que les descripteurs de dossiers dans
  l’IndexedDB du navigateur — aucun nom de fichier à l’intérieur, aucun contenu. Les réglages sont
  conservés dans `localStorage`.

## Traductions

L’interface parle anglais, chinois, hindi, espagnol, français, arabe, bengali, portugais, russe,
ourdou, indonésien, allemand, japonais, marathi, télougou, turc et ukrainien. Elle démarre dans
la première langue du navigateur qu’elle connaît ; Réglages → Langue permet d’en choisir une
autre.

- L’anglais vit dans le code : `t('context', 'English text')`, ou
  `tn('context', '{count} file', '{count} files', n)` pour un texte contenant un nombre. Dans
  `src/app/template.html`, cela devient `data-i18n="context"` (le texte de l’élément) et
  `data-i18n-attr="context"` (son title, son placeholder et son aria-label).
- Chaque autre langue est un dictionnaire, `src/locales/<code>.json` :
  `{ "context": { "English text": "translation" } }`. Un texte contenant un nombre a une forme
  par catégorie plurielle de la langue (`Intl.PluralRules`), indexée par le pluriel anglais.
- Ce qui manque à un dictionnaire s’affiche en anglais.
- `npm run i18n` affiche, pour chaque langue, les textes qui manquent à son dictionnaire et ceux
  qu’il contient mais que l’interface n’utilise plus ; `npm test` vérifie les paramètres et les
  formes plurielles.

## Compilation

Nécessite Node.js 20 ou plus récent.

```sh
npm install
npm run build        # build/html-merge.html and build/pages/
npm run watch        # rebuilds on every change
npm run check        # typecheck, unit tests, build, browser tests
```

`./build.sh` fait la même chose que `npm run build`, en installant les dépendances au premier
lancement. Les seules dépendances sont esbuild et TypeScript, toutes deux pour la compilation ;
la page elle-même n’utilise aucune bibliothèque.

- `npm test` exécute les tests unitaires dans Node : le diff, les lignes et le repli, les
  encodages, le surligneur et ses grammaires, la comparaison de dossiers, les dictionnaires.
- `npm run test:browser` pilote la page compilée et la PWA dans un Chrome headless, via le
  protocole DevTools, sans autre dépendance. Il faut un Chrome ou un Chromium local
  (`CHROME=/path/to/chrome` pour en choisir un), et le test est sauté s’il n’y en a aucun.
- `npm run shots -- <dir>` enregistre des captures d’écran de chaque écran principal.
- `npm run icons` génère les icônes PNG de la PWA à partir de `assets/icon.svg`.

## Versions et publications

La version ne vit que dans `package.json`. Une compilation du commit marqué `v<version>`
l’affiche telle quelle ; toute autre compilation y ajoute son commit (`0.1.0+1a2b3c4`), afin
qu’une page compilée depuis `main` ne soit pas prise pour une publication. La version est
affichée en bas de l’écran de démarrage et dans les Réglages.

Pour publier : `npm version minor` (ou `patch`), puis `git push --follow-tags`. Le tag déclenche
`.github/workflows/release.yml`, qui vérifie que le tag correspond à `package.json`, exécute les
tests et joint `html-merge-v<version>.html` et `SHA256SUMS.txt` à la publication GitHub.

## GitHub Pages

`build/pages/` est la même page sous forme de PWA installable : un manifeste, des icônes et un
service worker qui la fait fonctionner hors ligne. `.github/workflows/pages.yml` la compile, la
teste et la déploie sur GitHub Pages à chaque push sur `main` (Settings → Pages → Source: GitHub
Actions). Tous ses chemins sont relatifs, si bien qu’elle fonctionne aussi à l’adresse `/<repo>/`
d’un site de projet.

- La CSP de la PWA n’ajoute que sa propre origine pour le manifeste, le worker et les icônes ;
  `connect-src` reste `'none'`.
- Un nouveau déploiement ne remplace pas la version en cours tout seul : le nouveau service
  worker attend, et les Réglages (ainsi que l’écran de démarrage) disent « Version X est
  disponible. Mettre à jour ». La page vérifie discrètement toutes les six heures et quand la
  connexion revient.
- Après une mise à jour, « Mis à jour vers la version X » s’affiche une fois.

## Structure

```text
build.mjs              la compilation : le fichier unique et build/pages/
src/core/diff.ts       options de comparaison, clés de ligne, diff patience par-dessus Myers, blocs
src/core/inline.ts     mots ou caractères modifiés à l’intérieur d’une ligne, appariement des lignes d’un bloc
src/core/rows.ts       lignes et blocs ; la vue : côte à côte ou unifiée, replis
src/core/text.ts       binaire ou texte, encodages, lignes et fins de ligne, colonnes
src/core/highlight.ts  le tokenizer : états d’expressions régulières sticky
src/core/languages.ts  les grammaires, et dans quel langage est un fichier
src/core/folder.ts     deux arborescences fusionnées, statuts, filtres et ordre de la liste, motifs d’exclusion
src/core/format.ts     tailles, dates et nombres dans la langue de l’interface
src/core/i18n.ts       t(), tn(), les dictionnaires, la traduction du balisage de la page
src/app/template.html  la page, avec sa Content-Security-Policy
src/app/styles.css     les styles, les thèmes clair et sombre, les couleurs de syntaxe
src/app/main.ts        l’écran de démarrage, la comparaison de dossiers, les écrans, l’historique, les touches, le glisser-déposer
src/app/folderview.ts  la liste des dossiers : lignes virtuelles, puces, filtre, tri, touches
src/app/filescreen.ts  l’écran du fichier : barre d’outils, en-têtes, ligne d’état, options
src/app/diffview.ts    les volets de texte : lignes virtuelles, mots, couleurs, carte, recherche, replis
src/app/mediaview.ts   images côte à côte, fichiers binaires en octets
src/app/sources.ts     sélecteurs de dossiers et de fichiers, éléments déposés, lecture des fichiers
src/app/recent.ts      comparaisons récentes : descripteurs dans IndexedDB
src/app/settings.ts    réglages dans localStorage, thème, taille du texte
src/app/settingsview.ts la boîte de dialogue des réglages, les raccourcis, les options de comparaison partagées
src/app/ui.ts          éléments, icônes, boîtes de dialogue, popovers, toasts, échappement
src/app/update.ts      mises à jour de l’application installée
src/pwa/sw.js          le service worker de la PWA
src/locales/*.json     les 16 dictionnaires
tools/                 load.mjs (src/ pour Node), chrome.mjs (Chrome headless), i18n.mjs, shots.mjs, icons.mjs
tests/                 tests unitaires dans Node ; app.mjs et pwa.mjs dans Chrome
```

## Limites

- **Lecture seule par conception** : il n’y a ni fusion ni édition ; copiez les changements dans
  votre éditeur.
- Firefox et Safari choisissent les dossiers avec la boîte de dialogue d’envoi de dossier du
  navigateur : elle lit tout le dossier d’un coup (les noms exclus sont retirés après coup, pas
  ignorés d’emblée), ne montre aucun dossier vide, et une actualisation ne voit pas les fichiers
  ajoutés depuis — il faut choisir les dossiers à nouveau pour cela. iOS ne peut pas du tout
  choisir de dossiers.
- Les fichiers de plus de 64 Mo sont comparés uniquement octet par octet, sans les options
  « ignorer ».
- La coloration syntaxique est lexicale — mots-clés, chaînes, commentaires, nombres — pas un
  analyseur syntaxique ; certaines constructions (balises JSX, heredocs) sont colorées comme du
  texte brut.
- Pas de comparaison à trois voies, pas de comparaison du contenu des archives, pas de détection
  des blocs déplacés.

## Licence

MIT — voir [LICENSE](../../LICENSE).
