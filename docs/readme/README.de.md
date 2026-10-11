# html-merge

<!-- languages -->
<h3 align="center">
<a href="../../README.md">🇬🇧 English</a> ·
<a href="README.zh.md">🇨🇳 中文</a> ·
<a href="README.hi.md">🇮🇳 हिन्दी</a> ·
<a href="README.es.md">🇪🇸 Español</a> ·
<a href="README.fr.md">🇫🇷 Français</a> ·
<a href="README.ar.md">🇸🇦 العربية</a> ·
<a href="README.bn.md">🇧🇩 বাংলা</a> ·
<a href="README.pt.md">🇧🇷 Português</a> ·
<a href="README.ru.md">🇷🇺 Русский</a> ·
<a href="README.ur.md">🇵🇰 اردو</a> ·
<a href="README.id.md">🇮🇩 Bahasa Indonesia</a> ·
<b>🇩🇪 Deutsch</b> ·
<a href="README.ja.md">🇯🇵 日本語</a> ·
<a href="README.mr.md">🇮🇳 मराठी</a> ·
<a href="README.te.md">🇮🇳 తెలుగు</a> ·
<a href="README.tr.md">🇹🇷 Türkçe</a> ·
<a href="README.uk.md">🇺🇦 Українська</a>
</h3>
<!-- /languages -->

**HTML Merge** vergleicht zwei Ordner oder zwei Dateien nebeneinander — wie WinMerge, aber als
eine einzige HTML-Datei, die in jedem modernen Browser läuft, unter Windows, macOS, Linux,
ChromeOS, Android und iOS. Wählen Sie zwei Ordner, und die Anwendung listet jede Datei beider
Ordner mit ihrem Status auf: identisch, unterschiedlich, nur links, nur rechts. Öffnen Sie eine
Datei, und die beiden Versionen stehen nebeneinander, mit Syntaxhervorhebung für mehr als
vierzig Sprachen, den geänderten Wörtern innerhalb geänderter Zeilen markiert, und einer
Übersicht aller Unterschiede neben der Bildlaufleiste.

Die Anwendung liest nur. Es wird nichts installiert, nichts hochgeladen und keine Datei jemals
verändert: Die Dateien werden von der Seite selbst im Browser gelesen, und die Seite kann
überhaupt nicht auf das Netzwerk zugreifen.

Dieselbe Seite funktioniert auch als PWA (Progressive Web App): Von GitHub Pages bereitgestellt,
kann sie im System installiert werden und läuft dann als eigenständige App mit eigenem Fenster
und Symbol, und funktioniert offline — siehe „[GitHub Pages](#github-pages)“.

![HTML Merge: zwei Versionen einer JavaScript-Datei nebeneinander](../html-merge.png)

## Verwendung

1. Erstellen Sie `build/html-merge.html` (siehe „[Build](#build)“) oder nehmen Sie es aus einem
   Release, und öffnen Sie es in einem Browser — direkt von der Festplatte geht auch.
2. Wählen Sie die linke und die rechte Seite: **Ordner…** oder **Datei…** für jede Seite, oder
   ziehen Sie einen Ordner oder eine Datei auf das jeweilige Feld. Zwei Ordner oder zwei Dateien,
   die gleichzeitig auf das Fenster gezogen werden, werden sofort verglichen.
3. **Vergleichen**.

Bei zwei Ordnern erscheint die Ordnerliste und füllt sich, während die Dateien verglichen werden.
Die Chips oben zeigen oder verbergen jede Art von Ergebnis und zählen sie; die Liste kann eine
Baum- oder eine flache Liste von Pfaden sein, nach Namen gefiltert (`util`, oder ein Muster wie
`*.ts`), und nach jeder Spalte sortierbar. Doppelklicken Sie auf eine Datei (oder wählen Sie sie
aus und drücken Sie Enter), um sie zu vergleichen; `]` und `[` springen zur nächsten und
vorherigen unterschiedlichen Datei, und Esc oder die Zurück-Taste des Browsers führen zurück zur
Liste.

Auf dem Dateibildschirm:

- die Pfeile bewegen sich zwischen den Unterschieden (Alt+↓ und Alt+↑, oder F7 und Shift+F7); der
  aktuelle ist am Rand markiert, und die Übersicht rechts zeigt, wo sich alle befinden — ein
  Klick darauf springt dorthin;
- **Nebeneinander oder untereinander** wechselt zwischen zwei Bereichen und einem vereinten
  Bereich;
- **Identische Zeilen einklappen** blendet lange identische Abschnitte aus und lässt nur wenige
  Zeilen um jeden Unterschied stehen; ein Klick auf eine Einklappung öffnet sie wieder;
- **Suchen** (Ctrl+F, ⌘F auf dem Mac) markiert jeden Treffer auf beiden Seiten; Enter und
  Shift+Enter springen zwischen ihnen;
- das Menü **⋯** enthält die Anzeige- und Vergleichsoptionen: das Layout, die Sprache, in der die
  Dateien eingefärbt werden, Syntaxfarben, sichtbare Leerzeichen und Zeilenenden, Wörter oder
  Zeichen innerhalb geänderter Zeilen, und was ignoriert werden soll.

Bilder (PNG, JPEG, GIF, WebP, BMP, ICO, AVIF) werden nebeneinander mit ihrer Größe in Pixeln
angezeigt. Andere Binärdateien werden Byte für Byte verglichen: Die Seite sagt, ob sie identisch
sind, wo der erste Unterschied liegt, und zeigt die Bytes drumherum.

Chrome und Edge merken sich zuletzt verwendete Vergleiche: Sie werden auf dem Startbildschirm
aufgelistet und öffnen sich mit einem Klick erneut (der Browser fragt noch einmal nach der
Berechtigung, die Ordner zu lesen). Andere Browser lassen die Ordner jedes Mal neu auswählen.

### Auf dem Smartphone

Die Seite funktioniert auch auf dem Bildschirm eines Smartphones: Der Startbildschirm stapelt die
beiden Seiten übereinander, die Ordnerliste behält Name und Ergebnis, und ein Dateipaar wird
untereinander angezeigt. Tippen Sie auf eine Datei, um sie zu öffnen. Unter Android wählt Chrome
sowohl Ordner als auch Dateien aus; iOS kann Dateien vergleichen (Ordner lassen sich dort nicht
auswählen).

## Funktionen

- **Ordner**: rekursiver Vergleich nach Inhalt (oder, schneller, nach Größe und Datum); Baum-
  oder flache Liste; Filter nach Ergebnis und nach Namen; Sortierung nach Name, Ergebnis, Größe
  oder Datum; Namen durch Muster ausgeschlossen (`.git; node_modules; *.log; build/`);
  Dateinamen mit oder ohne Beachtung der Groß-/Kleinschreibung verglichen; Status werden gefüllt,
  während die Dateien gelesen werden, jeweils ein paar auf einmal, sodass auch große Ordner
  sofort etwas zeigen.
- **Text**: ein Patience-Diff über dem Myers-Algorithmus, sodass verschobene Klammern und
  Leerzeilen keine zusammenhanglosen Codestellen verbinden; Zeilen eines geänderten Blocks nach
  ihrer Ähnlichkeit zugeordnet; geänderte Wörter oder Zeichen innerhalb einer Zeile markiert;
  Blöcke von Leerzeilen, die ignoriert werden können; die vereinte Ansicht; das Einklappen
  identischer Zeilen; Suche auf beiden Seiten.
- **Vergleichsoptionen**: Änderungen bei Leerzeichen oder alle Leerzeichen ignorieren,
  Groß-/Kleinschreibung ignorieren, Leerzeilen ignorieren, Zeilenenden ignorieren (CRLF, LF, CR)
  — sowohl für die Ordnerliste als auch für den Dateibildschirm.
- **Kodierungen**: UTF-8, UTF-8 mit BOM, UTF-16 LE und BE, und Windows-1252 für Dateien, die kein
  gültiges UTF-8 sind; die Kodierung, die Zeilenenden und die Anzahl der Zeilen werden für jede
  Seite angezeigt, und ein Unterschied, der nur die Zeilenenden betrifft, wird als solcher
  benannt.
- **Syntaxhervorhebung** für mehr als vierzig Sprachen, gewählt nach dem Dateinamen oder seiner
  ersten Zeile (`#!/usr/bin/env python3`): JavaScript, TypeScript, JSON, HTML (mit den
  enthaltenen Skripten und Stilen), XML, CSS, SCSS, Less, Markdown, Python, Java, Kotlin, C, C++,
  C#, Go, Rust, Swift, Objective-C, PHP, Ruby, Shell, PowerShell, Batch-Dateien, SQL, YAML, TOML,
  INI, Dockerfile, Makefile, CMake, diff, Lua, Perl, R, Dart, Scala, Groovy, Haskell, Elixir,
  GraphQL, Protocol Buffers, Pascal, Visual Basic. Jede andere Sprache lässt sich von Hand
  auswählen.
- **Große Dateien**: Es werden nur die sichtbaren Zeilen gezeichnet, sodass Dateien mit
  Hunderttausenden von Zeilen flüssig scrollen; sehr lange Zeilen werden auf dem Bildschirm
  gekürzt (der Vergleich selbst sieht sie vollständig).
- **Bilder und Binärdateien** wie oben beschrieben.
- **Siebzehn Sprachen** für die Oberfläche, von rechts nach links für Arabisch und Urdu; ein
  helles und ein dunkles Design, das dem System folgt oder ausgewählt wird.
- Die installierte App aktualisiert sich nur auf Wunsch: siehe
  „[GitHub Pages](#github-pages)“.

## Tastenkürzel

| Tasten | Aktion |
| --- | --- |
| Alt+↓, F7 | Nächster Unterschied |
| Alt+↑, Shift+F7 | Vorheriger Unterschied |
| `]` / `[` | Nächste / vorherige unterschiedliche Datei |
| Ctrl+F (⌘F) | In den Dateien suchen oder die Ordnerliste filtern |
| Enter / Shift+Enter | Nächster / vorheriger Treffer |
| ↑ ↓ ← → | Durch die Ordnerliste bewegen, Ordner öffnen und schließen |
| Enter | Ausgewählte Datei öffnen |
| Esc | Zurück zur Ordnerliste |
| F5 | Erneut vergleichen |
| ? | Liste der Tastenkürzel |

## Sicherheit

- **Nur lesend.** Die Seite liest die Dateien und schreibt, benennt um oder löscht nie etwas. In
  Chrome und Edge werden Ordner über die File System Access API mit reinem Lesezugriff geöffnet.
- **Offline von Natur aus.** Die Content-Security-Policy der Seite enthält
  `connect-src 'none'`, und alles, was sie braucht — Stile, Code, Symbole — steckt in der einen
  HTML-Datei. Sie kann nichts laden und nichts senden, egal was eine verglichene Datei enthält.
- **Festgelegtes Skript.** Der Build ersetzt `script-src 'unsafe-inline'` durch den Hash des
  einen Skripts in der Seite: Sollte ein Dateiname oder eine Textzeile jemals unentschärft
  durchrutschen, würde ein darin enthaltener Inline-Handler trotzdem nicht ausgeführt. Text aus
  den Dateien erreicht die Seite escaped.
- Zuletzt verwendete Vergleiche (Chrome und Edge) speichern nur die Ordner-Handles in der
  IndexedDB des Browsers — keine Dateinamen darin, keine Inhalte. Einstellungen werden in
  `localStorage` gespeichert.

## Übersetzungen

Die Oberfläche spricht Englisch, Chinesisch, Hindi, Spanisch, Französisch, Arabisch, Bengalisch,
Portugiesisch, Russisch, Urdu, Indonesisch, Deutsch, Japanisch, Marathi, Telugu, Türkisch und
Ukrainisch. Sie startet in der ersten Sprache des Browsers, die sie kennt; Einstellungen →
Sprache wählt eine andere.

- Englisch steckt im Code: `t('context', 'English text')`, oder
  `tn('context', '{count} file', '{count} files', n)` für einen Text mit einer Zahl. In
  `src/app/template.html` ist dasselbe `data-i18n="context"` (der Text des Elements) und
  `data-i18n-attr="context"` (sein title, placeholder und aria-label).
- Jede andere Sprache ist ein Wörterbuch, `src/locales/<code>.json`:
  `{ "context": { "English text": "translation" } }`. Ein Text mit einer Zahl hat eine Form pro
  Pluralkategorie der Sprache (`Intl.PluralRules`), indiziert nach dem englischen Plural.
- Was einem Wörterbuch fehlt, wird auf Englisch angezeigt.
- `npm run i18n` gibt für jede Sprache die Texte aus, die ihrem Wörterbuch fehlen, sowie die, die
  es enthält, die die Oberfläche aber nicht mehr verwendet; `npm test` prüft die Platzhalter und
  die Pluralformen.

## Build

Benötigt Node.js 20 oder neuer.

```sh
npm install
npm run build        # build/html-merge.html and build/pages/
npm run watch        # rebuilds on every change
npm run check        # typecheck, unit tests, build, browser tests
```

`./build.sh` macht dasselbe wie `npm run build` und installiert beim ersten Lauf die
Abhängigkeiten. Die einzigen Abhängigkeiten sind esbuild und TypeScript, beide nur für den Build;
die Seite selbst verwendet keine Bibliothek.

- `npm test` führt die Unit-Tests in Node aus: den Diff, Zeilen und das Einklappen, Kodierungen,
  den Highlighter und seine Grammatiken, den Ordnervergleich, die Wörterbücher.
- `npm run test:browser` steuert die gebaute Seite und die PWA in einem Headless-Chrome über das
  DevTools-Protokoll, ohne weitere Abhängigkeit. Es braucht ein lokales Chrome oder Chromium
  (`CHROME=/path/to/chrome`, um eines auszuwählen) und wird übersprungen, wenn keines vorhanden
  ist.
- `npm run shots -- <dir>` speichert Screenshots jedes Hauptbildschirms.
- `npm run icons` erzeugt die PNG-Symbole der PWA aus `assets/icon.svg`.

## Versionen und Releases

Die Version steckt nur in `package.json`. Ein Build des mit `v<version>` markierten Commits
zeigt sie unverändert an; jeder andere Build fügt seinen Commit hinzu (`0.1.0+1a2b3c4`), damit
eine von `main` gebaute Seite nicht für ein Release gehalten wird. Die Version wird am unteren
Rand des Startbildschirms und in den Einstellungen angezeigt.

Zum Veröffentlichen: `npm version minor` (oder `patch`), dann `git push --follow-tags`. Der Tag
startet `.github/workflows/release.yml`, das prüft, ob der Tag zu `package.json` passt, die
Tests ausführt und `html-merge-v<version>.html` sowie `SHA256SUMS.txt` an das GitHub-Release
anhängt.

## GitHub Pages

`build/pages/` ist dieselbe Seite als installierbare PWA: ein Manifest, Symbole und ein Service
Worker, der sie offline funktionsfähig hält. `.github/workflows/pages.yml` baut und testet sie
und stellt sie bei jedem Push auf `main` auf GitHub Pages bereit (Settings → Pages → Source:
GitHub Actions). Alle ihre Pfade sind relativ, sodass sie auch unter der Adresse `/<repo>/`
einer Projekt-Site funktioniert.

- Die CSP der PWA fügt nur ihre eigene Origin für das Manifest, den Worker und die Symbole hinzu;
  `connect-src` bleibt `'none'`.
- Ein neues Deployment ersetzt die laufende Version nicht von selbst: Der neue Service Worker
  wartet, und die Einstellungen (sowie der Startbildschirm) sagen „Version X ist verfügbar.
  Aktualisieren“. Die Seite prüft im Hintergrund alle sechs Stunden und wenn die Verbindung
  zurückkommt.
- Nach einem Update wird einmal „Auf Version X aktualisiert“ angezeigt.

## Aufbau

```text
build.mjs              der Build: die einzelne Datei und build/pages/
src/core/diff.ts       Vergleichsoptionen, Zeilenschlüssel, Patience-Diff über Myers, Hunks
src/core/inline.ts     geänderte Wörter oder Zeichen innerhalb einer Zeile, Zuordnung der Zeilen eines Blocks
src/core/rows.ts       Zeilen und Blöcke; die Ansicht: nebeneinander oder vereint, Einklappungen
src/core/text.ts       Binär oder Text, Kodierungen, Zeilen und Zeilenenden, Spalten
src/core/highlight.ts  der Tokenizer: Zustände klebriger regulärer Ausdrücke
src/core/languages.ts  die Grammatiken, und in welcher Sprache eine Datei ist
src/core/folder.ts     zwei zusammengeführte Baumstrukturen, Status, Filter und Reihenfolge der Liste, Ausschlussmuster
src/core/format.ts     Größen, Daten und Zahlen in der Sprache der Oberfläche
src/core/i18n.ts       t(), tn(), die Wörterbücher, die Übersetzung des Markups der Seite
src/app/template.html  die Seite, mit ihrer Content-Security-Policy
src/app/styles.css     die Stile, das helle und das dunkle Design, die Syntaxfarben
src/app/main.ts        der Startbildschirm, der Ordnervergleich, die Bildschirme, der Verlauf, die Tasten, Drag-and-Drop
src/app/folderview.ts  die Ordnerliste: virtuelle Zeilen, Chips, Filter, Sortierung, Tasten
src/app/filescreen.ts  der Dateibildschirm: Werkzeugleiste, Überschriften, Statuszeile, Optionen
src/app/diffview.ts    die Textbereiche: virtuelle Zeilen, Wörter, Farben, Übersicht, Suche, Einklappungen
src/app/mediaview.ts   Bilder nebeneinander, Binärdateien als Bytes
src/app/sources.ts     Ordner- und Dateiauswahl, abgelegte Elemente, Lesen von Dateien
src/app/recent.ts      zuletzt verwendete Vergleiche: Handles in IndexedDB
src/app/settings.ts    Einstellungen in localStorage, Design, Textgröße
src/app/settingsview.ts der Einstellungsdialog, die Tastenkürzel, die gemeinsamen Vergleichsoptionen
src/app/ui.ts          Elemente, Symbole, Dialoge, Popovers, Toasts, Escaping
src/app/update.ts      Updates der installierten App
src/pwa/sw.js          der Service Worker der PWA
src/locales/*.json     die 16 Wörterbücher
tools/                 load.mjs (src/ für Node), chrome.mjs (Headless-Chrome), i18n.mjs, shots.mjs, icons.mjs
tests/                 Unit-Tests in Node; app.mjs und pwa.mjs in Chrome
```

## Einschränkungen

- **Nur lesend, von Natur aus**: Es gibt kein Zusammenführen und kein Bearbeiten; Änderungen in
  Ihren Editor kopieren.
- Firefox und Safari wählen Ordner mit dem Dialog zum Hochladen von Ordnern des Browsers: Er
  liest den ganzen Ordner auf einmal (ausgeschlossene Namen werden erst danach entfernt, nicht
  übersprungen), zeigt keine leeren Ordner, und ein Neuladen zeigt seitdem hinzugefügte Dateien
  nicht an — dafür müssen die Ordner erneut gewählt werden. iOS kann überhaupt keine Ordner
  auswählen.
- Dateien über 64 MB werden nur Byte für Byte verglichen, ohne die Ignorieren-Optionen.
- Die Syntaxhervorhebung ist lexikalisch — Schlüsselwörter, Zeichenketten, Kommentare, Zahlen —
  kein Parser; manche Konstrukte (JSX-Tags, Heredocs) werden wie reiner Text eingefärbt.
- Kein Dreiwege-Vergleich, kein Vergleich von Archivinhalten, keine Erkennung verschobener
  Blöcke.

## Lizenz

MIT — siehe [LICENSE](../../LICENSE).
