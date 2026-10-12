# html-merge

<!-- languages -->
<h3 align="center">
<b>🇬🇧 English</b> ·
<a href="docs/readme/README.zh.md">🇨🇳 中文</a> ·
<a href="docs/readme/README.hi.md">🇮🇳 हिन्दी</a> ·
<a href="docs/readme/README.es.md">🇪🇸 Español</a> ·
<a href="docs/readme/README.fr.md">🇫🇷 Français</a> ·
<a href="docs/readme/README.ar.md">🇸🇦 العربية</a> ·
<a href="docs/readme/README.bn.md">🇧🇩 বাংলা</a> ·
<a href="docs/readme/README.pt.md">🇧🇷 Português</a> ·
<a href="docs/readme/README.ru.md">🇷🇺 Русский</a> ·
<a href="docs/readme/README.ur.md">🇵🇰 اردو</a> ·
<a href="docs/readme/README.id.md">🇮🇩 Bahasa Indonesia</a> ·
<a href="docs/readme/README.de.md">🇩🇪 Deutsch</a> ·
<a href="docs/readme/README.ja.md">🇯🇵 日本語</a> ·
<a href="docs/readme/README.mr.md">🇮🇳 मराठी</a> ·
<a href="docs/readme/README.te.md">🇮🇳 తెలుగు</a> ·
<a href="docs/readme/README.tr.md">🇹🇷 Türkçe</a> ·
<a href="docs/readme/README.uk.md">🇺🇦 Українська</a>
</h3>
<!-- /languages -->

**HTML Merge** compares two folders, or two files, side by side — like WinMerge, but as one
HTML file that runs in any modern browser on Windows, macOS, Linux, ChromeOS, Android and iOS.
Pick two folders and it lists every file of both with what happened to it: identical,
different, only on the left, only on the right. Open a file and the two versions stand side by
side, with syntax highlighting for more than forty languages, the changed words marked inside
changed lines, and a map of all the differences beside the scroll bar.

It only reads. Nothing is installed, nothing is uploaded and no file is ever changed: the files
are read by the page itself, in the browser, and the page cannot reach the network at all.

The same page also works as a PWA (Progressive Web App): served from GitHub Pages it can be
installed into the system and then runs as a separate app, with its own window and icon, and
works offline — see "[GitHub Pages](#github-pages)".

**Online demo: [merge.marketkernel.com](https://merge.marketkernel.com/)**

![HTML Merge: two versions of a JavaScript file side by side](docs/html-merge.png)

## How to use

1. Build `build/html-merge.html` (see "[Build](#build)") or take it from a release, and open it
   in a browser — straight from disk is fine.
2. Pick the left and the right side: **Folder…** or **File…** for each, or drag a folder or a
   file onto its box. Two folders or two files dropped on the window at once are compared
   straight away.
3. **Compare**.

With two folders, the folder list appears and fills in as the files are compared. The chips at
the top show or hide each kind of result and count them; the list can be a tree or a flat list
of paths, filtered by name (`util`, or a pattern like `*.ts`), and sorted by any column.
Double-click a file (or select it and press Enter) to compare it; `]` and `[` move to the next
and previous different file, and Esc or the browser's Back button returns to the list.

On the file screen:

- the arrows move between differences (Alt+↓ and Alt+↑, or F7 and Shift+F7); the current one
  is marked in the gutter, and the map on the right shows where all of them are — click it to
  jump;
- **Side by side or one under the other** switches between two panes and one unified pane;
- **Fold identical lines** hides long identical stretches, leaving a few lines around each
  difference; click a fold to open it;
- **Find** (Ctrl+F, ⌘F on a Mac) marks every match on both sides; Enter and Shift+Enter move
  between them;
- the **⋯** menu holds the view and compare options: the layout, the language to colour the
  files as, syntax colours, visible whitespace and line endings, words or characters inside
  changed lines, and what to ignore.

Pictures (PNG, JPEG, GIF, WebP, BMP, ICO, AVIF) are shown side by side with their size in pixels.
Other binary files are compared byte by byte: the page says whether they are identical, where
the first difference is, and shows the bytes around it.

Chrome and Edge remember recent comparisons: they are listed on the start screen and open again
with a click (the browser asks once more for leave to read the folders). Other browsers pick
folders anew each time.

### On a phone

The page works on a phone's screen: the start screen stacks the two sides, the folder list
keeps the name and the result, and a file pair is shown one under the other. Tap a file to open
it. On Android, Chrome picks folders as well as files; iOS can compare files (folders cannot be
picked there).

## Features

- **Folders**: recursive comparison by contents (or, quicker, by size and date); a tree or a
  flat list; filters by result and by name; sorting by name, result, size or date; names left
  out by pattern (`.git; node_modules; *.log; build/`); file names compared with or without
  case; statuses filled in as files are read, a few at a time, so even large folders show
  something at once.
- **Text**: a patience diff over Myers' algorithm, so moved braces and blank lines do not pair
  up unrelated code; lines of a changed block paired by how alike they are; changed words or
  characters marked inside a line; blocks of blank lines that can be ignored; the unified
  view; folding of identical lines; search across both sides.
- **Compare options**: ignore whitespace changes or all whitespace, ignore case, ignore blank
  lines, ignore line endings (CRLF, LF, CR) — for the folder list and the file screen alike.
- **Encodings**: UTF-8, UTF-8 with a BOM, UTF-16 LE and BE, and Windows-1252 for files that are
  not valid UTF-8; the encoding, the line endings and the number of lines are shown for each
  side, and a difference of line endings alone is named as such.
- **Syntax highlighting** for more than forty languages, chosen by the file's name or its first
  line (`#!/usr/bin/env python3`): JavaScript, TypeScript, JSON, HTML (with the scripts and
  styles inside), XML, CSS, SCSS, Less, Markdown, Python, Java, Kotlin, C, C++, C#, Go, Rust,
  Swift, Objective-C, PHP, Ruby, shell, PowerShell, batch files, SQL, YAML, TOML, INI, Dockerfile,
  Makefile, CMake, diff, Lua, Perl, R, Dart, Scala, Groovy, Haskell, Elixir, GraphQL, Protocol
  Buffers, Pascal, Visual Basic. Any other language can be picked by hand.
- **Large files**: only the lines in sight are drawn, so files of hundreds of thousands of lines
  scroll smoothly; very long lines are cut on screen (the comparison still sees all of them).
- **Pictures and binary files** as described above.
- **Seventeen languages** of the interface, right to left for Arabic and Urdu; a light and a dark
  theme that follow the system or are chosen.
- The installed app updates itself only when asked: see "[GitHub Pages](#github-pages)".

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| Alt+↓, F7 | Next difference |
| Alt+↑, Shift+F7 | Previous difference |
| `]` / `[` | Next / previous different file |
| Ctrl+F (⌘F) | Find in the files, or filter the folder list |
| Enter / Shift+Enter | Next / previous match |
| ↑ ↓ ← → | Move through the folder list, open and close folders |
| Enter | Open the selected file |
| Esc | Back to the folder list |
| F5 | Compare again |
| ? | The list of shortcuts |

## Security

- **Read-only.** The page reads the files and never writes, renames or deletes anything. In
  Chrome and Edge folders are opened through the File System Access API with read access only.
- **Offline by construction.** The page's Content-Security-Policy says `connect-src 'none'`,
  and everything it needs — styles, code, icons — is inside the one HTML file. It cannot load
  anything or send anything, whatever a compared file contains.
- **Pinned script.** The build replaces `script-src 'unsafe-inline'` with the hash of the one
  script in the page: should a file name or a line of text ever slip through unescaped, an
  inline handler in it would still not run. Text from the files reaches the page escaped.
- Recent comparisons (Chrome and Edge) keep only the folder handles in the browser's
  IndexedDB — no file names inside, no contents. Settings are kept in `localStorage`.

## Translations

The interface speaks English, Chinese, Hindi, Spanish, French, Arabic, Bengali, Portuguese,
Russian, Urdu, Indonesian, German, Japanese, Marathi, Telugu, Turkish and Ukrainian. It starts
in the first of the browser's languages it knows; Settings → Language picks another.

- English lives in the code: `t('context', 'English text')`, or
  `tn('context', '{count} file', '{count} files', n)` for a text with a number. In
  `src/app/template.html` the same is `data-i18n="context"` (the element's text) and
  `data-i18n-attr="context"` (its title, placeholder and aria-label).
- Every other language is a dictionary, `src/locales/<code>.json`:
  `{ "context": { "English text": "translation" } }`. A text with a number has one form per
  plural category of the language (`Intl.PluralRules`), keyed by the English plural.
- Anything a dictionary lacks is shown in English.
- `npm run i18n` prints, per language, the strings its dictionary lacks and the ones it holds
  that the interface no longer uses; `npm test` checks the placeholders and the plural forms.

## Build

Needs Node.js 20 or newer.

```sh
npm install
npm run build        # build/html-merge.html and build/pages/
npm run watch        # rebuilds on every change
npm run check        # typecheck, unit tests, build, browser tests
```

`./build.sh` does the same as `npm run build`, installing the dependencies on the first run.
The only dependencies are esbuild and TypeScript, both for building; the page itself uses no
library.

- `npm test` runs the unit tests in Node: the diff, rows and folding, encodings, the
  highlighter and its grammars, folder comparison, the dictionaries.
- `npm run test:browser` drives the built page and the PWA in a headless Chrome, over the
  DevTools protocol, with no other dependency. It needs a local Chrome or Chromium
  (`CHROME=/path/to/chrome` to pick one) and skips when there is none.
- `npm run shots -- <dir>` saves screenshots of every main screen.
- `npm run icons` renders the PWA's PNG icons from `assets/icon.svg`.

## Versions and releases

The version lives in `package.json` only. A build of the commit tagged `v<version>` shows it as
it is; any other build adds its commit (`0.1.0+1a2b3c4`), so a page built from `main` is not
taken for a release. The version is shown at the bottom of the start screen and in Settings.

To release: `npm version minor` (or `patch`), then `git push --follow-tags`. The tag starts
`.github/workflows/release.yml`, which checks that the tag matches `package.json`, runs the
tests and attaches `html-merge-v<version>.html` and `SHA256SUMS.txt` to the GitHub release.

## GitHub Pages

This repository is published at <https://merge.marketkernel.com/>.

`build/pages/` is the same page as an installable PWA: a manifest, icons and a service worker
that keeps it working offline. `.github/workflows/pages.yml` builds and tests it and deploys it
to GitHub Pages on every push to `main` (Settings → Pages → Source: GitHub Actions). All its
paths are relative, so it works under a project site's `/<repo>/` address.

- The CSP of the PWA adds only its own origin for the manifest, the worker and the icons;
  `connect-src` stays `'none'`.
- A new deploy does not replace the running version by itself: the new service worker waits,
  and Settings (and the start screen) say "Version X is ready. Update". The page checks quietly
  every six hours and when the connection comes back.
- After an update, "Updated to version X" is said once.

## Layout

```text
build.mjs              the build: the single file and build/pages/
src/core/diff.ts       comparison options, line keys, patience diff over Myers, hunks
src/core/inline.ts     changed words or characters inside a line, pairing the lines of a block
src/core/rows.ts       rows and blocks; the view: side by side or unified, folds
src/core/text.ts       binary or text, encodings, lines and line endings, columns
src/core/highlight.ts  the tokenizer: states of sticky regular expressions
src/core/languages.ts  the grammars, and which language a file is in
src/core/folder.ts     two trees merged, statuses, the list's filters and order, exclude patterns
src/core/format.ts     sizes, dates and numbers in the interface language
src/core/i18n.ts       t(), tn(), the dictionaries, translating the page's markup
src/app/template.html  the page, with its Content-Security-Policy
src/app/styles.css     the styles, the light and the dark theme, the syntax colours
src/app/main.ts        the start screen, folder comparison, screens, history, keys, drag and drop
src/app/folderview.ts  the folder list: virtual rows, chips, filter, sorting, keys
src/app/filescreen.ts  the file screen: toolbar, headings, status line, options
src/app/diffview.ts    the text panes: virtual rows, words, colours, map, search, folds
src/app/mediaview.ts   pictures side by side, binary files as bytes
src/app/sources.ts     folder and file pickers, dropped items, reading files
src/app/recent.ts      recent comparisons: handles in IndexedDB
src/app/settings.ts    settings in localStorage, theme, text size
src/app/settingsview.ts the settings dialog, the shortcuts, the shared compare options
src/app/ui.ts          elements, icons, dialogs, popovers, toasts, escaping
src/app/update.ts      updates of the installed app
src/pwa/sw.js          the PWA's service worker
src/locales/*.json     the 16 dictionaries
tools/                 load.mjs (src/ for Node), chrome.mjs (headless Chrome), i18n.mjs, shots.mjs, icons.mjs
tests/                 unit tests in Node; app.mjs and pwa.mjs in Chrome
```

## Limitations

- **Read-only by design**: there is no merging and no editing; copy changes in your editor.
- Firefox and Safari pick folders with the browser's folder upload dialog: it reads the whole
  folder at once (excluded names are left out afterwards, not skipped), shows no empty folders,
  and a refresh does not see files added since — pick the folders again for that. iOS cannot
  pick folders at all.
- Files larger than 64 MB are compared byte by byte only, without the ignore options.
- Syntax highlighting is lexical — keywords, strings, comments, numbers — not a parser; some
  constructs (JSX tags, heredocs) are coloured as plain text.
- No three-way comparison, no comparison of archives' contents, no moved-block detection.

## License

MIT — see [LICENSE](LICENSE).
