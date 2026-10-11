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
<a href="README.de.md">🇩🇪 Deutsch</a> ·
<a href="README.ja.md">🇯🇵 日本語</a> ·
<b>🇮🇳 मराठी</b> ·
<a href="README.te.md">🇮🇳 తెలుగు</a> ·
<a href="README.tr.md">🇹🇷 Türkçe</a> ·
<a href="README.uk.md">🇺🇦 Українська</a>
</h3>
<!-- /languages -->

**HTML Merge** दोन फोल्डर, किंवा दोन फायली, शेजारी शेजारी ठेवून त्यांची तुलना करते — WinMerge सारखे,
पण एका HTML फाइलीच्या रूपात, जी Windows, macOS, Linux, ChromeOS, Android आणि iOS वरील कोणत्याही आधुनिक
ब्राउझरमध्ये चालते. दोन फोल्डर निवडा आणि ते दोन्हीमधील प्रत्येक फाइलीसोबत काय झाले ते यादी करून दाखवते: समान,
वेगळी, फक्त डावीकडे, फक्त उजवीकडे. एखादी फाइल उघडा की दोन्ही आवृत्त्या शेजारी शेजारी
दिसतात, चाळीसहून अधिक भाषांसाठी सिंटॅक्स हायलाइटिंगसह, बदललेल्या ओळींमधील बदललेले शब्द चिन्हांकित केलेले असतात,
आणि स्क्रोल बारजवळ सर्व फरकांचा एक नकाशा असतो.

ती फक्त वाचते. काहीही इन्स्टॉल होत नाही, काहीही अपलोड होत नाही आणि कोणतीही फाइल कधीही बदलली जात नाही: फायली
पानानेच, ब्राउझरमध्येच वाचल्या जातात, आणि पान नेटवर्कपर्यंत मुळीच पोहोचू शकत नाही.

हेच पान एक PWA (Progressive Web App) म्हणूनही काम करते: GitHub Pages वरून दिल्यावर ते
सिस्टममध्ये इन्स्टॉल करता येते आणि मग ते स्वतःच्या विंडो आणि आयकॉनसह एक वेगळे अ‍ॅप म्हणून चालते, आणि
ऑफलाइन काम करते — पहा "[GitHub Pages](#github-pages)".

![HTML Merge: एका JavaScript फाइलीच्या दोन आवृत्त्या शेजारी शेजारी](../html-merge.png)

## कसे वापरावे

1. `build/html-merge.html` तयार करा (पहा "[बिल्ड](#बिल्ड)") किंवा एखाद्या रिलीजमधून घ्या, आणि ते
   ब्राउझरमध्ये उघडा — थेट डिस्कवरून उघडणेही चालते.
2. डावी आणि उजवी बाजू निवडा: प्रत्येकीसाठी **Folder…** किंवा **File…**, किंवा एखादा फोल्डर किंवा
   फाइल तिच्या बॉक्सवर ओढून टाका. विंडोवर एकाच वेळी टाकलेल्या दोन फोल्डर किंवा दोन फायलींची तुलना
   लगेच केली जाते.
3. **Compare**.

दोन फोल्डरसह, फोल्डर यादी दिसते आणि फायलींची तुलना होताच भरत जाते. वरचे चिप्स प्रत्येक प्रकारचा
निकाल दाखवतात किंवा लपवतात आणि त्यांची संख्या मोजतात; यादी ट्री किंवा सपाट यादी असू शकते, नावाने
फिल्टर करता येते (`util`, किंवा `*.ts` सारखा नमुना), आणि कोणत्याही स्तंभानुसार क्रमवारी लावता येते.
एखाद्या फाइलीवर डबल-क्लिक करा (किंवा ती निवडून Enter दाबा) म्हणजे तिची तुलना होते; `]` आणि `[`
पुढील आणि मागील वेगळ्या फाइलीकडे नेतात, आणि Esc किंवा ब्राउझरचे Back बटण यादीकडे परत नेते.

फाइल स्क्रीनवर:

- बाण फरकांमध्ये फिरतात (Alt+↓ आणि Alt+↑, किंवा F7 आणि Shift+F7); सध्याचा फरक गटरमध्ये
  चिन्हांकित असतो, आणि उजवीकडचा नकाशा सर्व फरक कुठे आहेत ते दाखवतो — तिथे क्लिक करून
  थेट तिथे जाता येते;
- **Side by side or one under the other** दोन पॅनेल आणि एका एकत्रित पॅनेलमध्ये बदलते;
- **Fold identical lines** लांब समान भाग लपवते, प्रत्येक फरकाभोवती काही ओळी ठेवून;
  लपवलेल्या भागावर क्लिक करून तो उघडता येतो;
- **Find** (Ctrl+F, Mac वर ⌘F) दोन्ही बाजूंवरील प्रत्येक जुळणी चिन्हांकित करते; Enter आणि
  Shift+Enter त्यांच्यामध्ये फिरवतात;
- **⋯** मेनूमध्ये पाहण्याचे आणि तुलनेचे पर्याय असतात: लेआउट, फायली रंगवण्यासाठीची भाषा, सिंटॅक्स
  रंग, दिसणारी रिकामी जागा आणि ओळींचा शेवट, बदललेल्या ओळींमधील शब्द किंवा अक्षरे, आणि काय दुर्लक्षित करायचे.

चित्रे (PNG, JPEG, GIF, WebP, BMP, ICO, AVIF) त्यांच्या पिक्सेलमधील आकारासह शेजारी शेजारी दाखवली जातात.
इतर बायनरी फायलींची तुलना बाइट-बाइट केली जाते: पान सांगते की त्या समान आहेत की नाही, पहिला फरक
कुठे आहे, आणि त्याभोवतीचे बाइट दाखवते.

Chrome आणि Edge अलीकडील तुलना लक्षात ठेवतात: त्या सुरुवातीच्या स्क्रीनवर यादीबद्ध असतात आणि एका
क्लिकने पुन्हा उघडतात (ब्राउझर फोल्डर वाचण्याची परवानगी पुन्हा विचारतो). इतर ब्राउझर दर वेळी
फोल्डर नव्याने निवडतात.

### फोनवर

पान फोनच्या स्क्रीनवरही काम करते: सुरुवातीची स्क्रीन दोन्ही बाजू एकाखाली एक रचते, फोल्डर
यादी नाव आणि निकाल ठेवते, आणि फाइलींची जोडी एकाखाली एक दाखवली जाते. फाइल उघडण्यासाठी तिला
टॅप करा. Android वर, Chrome फायलींसोबत फोल्डरही निवडू शकते; iOS फायलींची तुलना करू शकते
(तिथे फोल्डर निवडता येत नाहीत).

## वैशिष्ट्ये

- **फोल्डर**: मजकुरानुसार पुनरावर्ती तुलना (किंवा, जलद, आकार आणि तारखेनुसार); ट्री किंवा
  सपाट यादी; निकाल आणि नावानुसार फिल्टर; नाव, निकाल, आकार किंवा तारखेनुसार क्रमवारी; नमुन्यानुसार
  वगळलेली नावे (`.git; node_modules; *.log; build/`); फाइलींच्या नावांची तुलना मोठी-छोटी अक्षरे
  लक्षात घेऊन किंवा त्याशिवाय; फायली वाचल्या जात असताना निकाल थोडे थोडे भरत जातात, त्यामुळे मोठे
  फोल्डरही लगेच काहीतरी दाखवतात.
- **मजकूर**: Myers च्या अल्गोरिदमवर आधारित patience diff, त्यामुळे इकडे-तिकडे झालेले ब्रेसेस आणि
  रिकाम्या ओळी असंबंधित कोडशी जुळवल्या जात नाहीत; बदललेल्या भागाच्या ओळी त्यांच्या साम्यानुसार जोडल्या
  जातात; ओळीमधील बदललेले शब्द किंवा अक्षरे चिन्हांकित होतात; दुर्लक्षित करता येणारे रिकाम्या ओळींचे भाग;
  एकत्रित दृश्य; समान ओळी संक्षिप्त करणे; दोन्ही बाजूंवर शोध.
- **तुलना पर्याय**: रिकाम्या जागेतील बदल किंवा संपूर्ण रिकामी जागा दुर्लक्षित करणे, मोठी-छोटी अक्षरे
  दुर्लक्षित करणे, रिकाम्या ओळी दुर्लक्षित करणे, ओळींचा शेवट (CRLF, LF, CR) दुर्लक्षित करणे — फोल्डर
  यादी आणि फाइल स्क्रीन दोन्हीसाठी.
- **एन्कोडिंग**: UTF-8, BOM सह UTF-8, UTF-16 LE आणि BE, आणि वैध UTF-8 नसलेल्या फायलींसाठी
  Windows-1252; प्रत्येक बाजूसाठी एन्कोडिंग, ओळींचा शेवट आणि ओळींची संख्या दाखवली जाते, आणि फक्त
  ओळींच्या शेवटातील फरक तसा नमूद केला जातो.
- चाळीसहून अधिक भाषांसाठी **सिंटॅक्स हायलाइटिंग**, जी फाइलीच्या नावावरून किंवा तिच्या पहिल्या ओळीवरून
  (`#!/usr/bin/env python3`) निवडली जाते: JavaScript, TypeScript, JSON, HTML (आतील स्क्रिप्ट आणि
  स्टाइलसह), XML, CSS, SCSS, Less, Markdown, Python, Java, Kotlin, C, C++, C#, Go, Rust,
  Swift, Objective-C, PHP, Ruby, shell, PowerShell, batch फायली, SQL, YAML, TOML, INI, Dockerfile,
  Makefile, CMake, diff, Lua, Perl, R, Dart, Scala, Groovy, Haskell, Elixir, GraphQL, Protocol
  Buffers, Pascal, Visual Basic. इतर कोणतीही भाषा हाताने निवडता येते.
- **मोठ्या फायली**: फक्त दिसणाऱ्या ओळीच काढल्या जातात, त्यामुळे लाखो ओळी असलेल्या फायलीही सहज
  स्क्रोल होतात; खूप लांब ओळी स्क्रीनवर कापल्या जातात (तुलना मात्र त्यांची संपूर्ण लांबी पाहते).
- वर सांगितल्याप्रमाणे **चित्रे आणि बायनरी फायली**.
- इंटरफेसच्या **सतरा भाषा**, अरबी आणि उर्दूसाठी उजवीकडून डावीकडे; एक फिकट आणि एक गडद
  थीम जी सिस्टमचे अनुसरण करते किंवा निवडता येते.
- इन्स्टॉल केलेले अ‍ॅप स्वतःला फक्त सांगितल्यावरच अपडेट करते: पहा "[GitHub Pages](#github-pages)".

## कीबोर्ड शॉर्टकट

| कळा | क्रिया |
| --- | --- |
| Alt+↓, F7 | पुढील फरक |
| Alt+↑, Shift+F7 | मागील फरक |
| `]` / `[` | पुढील / मागील वेगळी फाइल |
| Ctrl+F (⌘F) | फायलींमध्ये शोधा, किंवा फोल्डर यादी फिल्टर करा |
| Enter / Shift+Enter | पुढील / मागील जुळणी |
| ↑ ↓ ← → | फोल्डर यादीत फिरा, फोल्डर उघडा आणि बंद करा |
| Enter | निवडलेली फाइल उघडा |
| Esc | फोल्डर यादीकडे परत जा |
| F5 | पुन्हा तुलना करा |
| ? | शॉर्टकटची यादी |

## सुरक्षा

- **फक्त वाचण्यासाठी.** पान फायली वाचते आणि कधीही काहीही लिहित नाही, नाव बदलत नाही किंवा
  काढून टाकत नाही. Chrome आणि Edge मध्ये फोल्डर File System Access API द्वारे फक्त वाचण्याच्या
  परवानगीसह उघडले जातात.
- **रचनेनेच ऑफलाइन.** पानाचे Content-Security-Policy `connect-src 'none'` असे सांगते, आणि त्याला
  लागणारे सर्व काही — स्टाइल, कोड, आयकॉन — एकाच HTML फाइलीत आहे. तुलना होत असलेल्या फाइलीत काहीही
  असले तरी ते काहीही लोड करू शकत नाही किंवा पाठवू शकत नाही.
- **पिन केलेली स्क्रिप्ट.** बिल्ड `script-src 'unsafe-inline'` च्या जागी पानातील एकमेव स्क्रिप्टचा
  हॅश वापरते: एखाद्या फाइलीचे नाव किंवा एखादी ओळ कधी एस्केप न होता निसटलीच, तरी त्यातील कोणताही
  inline हँडलर चालणार नाही. फायलींमधून आलेला मजकूर पानापर्यंत एस्केप होऊनच पोहोचतो.
- अलीकडील तुलना (Chrome आणि Edge) ब्राउझरच्या IndexedDB मध्ये फक्त फोल्डर हँडल ठेवतात — त्यात
  फाइलींची नावे नसतात, मजकूरही नसतो. सेटिंग्ज `localStorage` मध्ये ठेवल्या जातात.

## भाषांतर

इंटरफेस इंग्रजी, चिनी, हिंदी, स्पॅनिश, फ्रेंच, अरबी, बंगाली, पोर्तुगीज, रशियन, उर्दू, इंडोनेशियन,
जर्मन, जपानी, मराठी, तेलुगु, तुर्की आणि युक्रेनियन भाषांमध्ये उपलब्ध आहे. ते ब्राउझरच्या भाषांपैकी
माहीत असलेल्या पहिल्या भाषेत सुरू होते; Settings → Language मधून दुसरी भाषा निवडता येते.

- इंग्रजी कोडमध्येच राहते: `t('context', 'English text')`, किंवा संख्या असलेल्या मजकुरासाठी
  `tn('context', '{count} file', '{count} files', n)`. `src/app/template.html` मध्ये हेच
  `data-i18n="context"` (एलिमेंटचा मजकूर) आणि `data-i18n-attr="context"` (त्याचे title, placeholder
  आणि aria-label) असे असते.
- इतर प्रत्येक भाषा एक डिक्शनरी आहे, `src/locales/<code>.json`:
  `{ "context": { "English text": "translation" } }`. संख्या असलेल्या मजकुराला भाषेच्या प्रत्येक
  plural category (`Intl.PluralRules`) साठी एक रूप असते, जे इंग्रजी pluralनुसार की (key) केलेले असते.
- डिक्शनरीत नसलेले काहीही इंग्रजीत दाखवले जाते.
- `npm run i18n` प्रत्येक भाषेसाठी तिच्या डिक्शनरीत नसलेले मजकूर, आणि तिच्यात असलेले पण इंटरफेस आता
  वापरत नसलेले मजकूर दाखवते; `npm test` placeholders आणि plural रूपे तपासते.

## बिल्ड

Node.js 20 किंवा नवीन आवश्यक आहे.

```sh
npm install
npm run build        # build/html-merge.html and build/pages/
npm run watch        # rebuilds on every change
npm run check        # typecheck, unit tests, build, browser tests
```

`./build.sh` तेच करते जे `npm run build` करते, पहिल्यांदा चालवताना अवलंबित्वे (dependencies)
इन्स्टॉल करून. फक्त esbuild आणि TypeScript ही अवलंबित्वे आहेत, दोन्ही फक्त बिल्डसाठी; पान स्वतः
कोणतीही लायब्ररी वापरत नाही.

- `npm test` Node मध्ये युनिट टेस्ट चालवते: diff, ओळी आणि folding, एन्कोडिंग, हायलाइटर आणि त्याचे
  grammar, फोल्डर तुलना, डिक्शनरी.
- `npm run test:browser` तयार केलेले पान आणि PWA headless Chrome मध्ये, DevTools प्रोटोकॉलद्वारे,
  इतर कोणत्याही अवलंबित्वाशिवाय चालवते. त्यासाठी स्थानिक Chrome किंवा Chromium लागते (निवडण्यासाठी
  `CHROME=/path/to/chrome`) आणि ते नसल्यास ही चाचणी वगळली जाते.
- `npm run shots -- <dir>` प्रत्येक मुख्य स्क्रीनचे स्क्रीनशॉट साठवते.
- `npm run icons` `assets/icon.svg` वरून PWA चे PNG आयकॉन तयार करते.

## आवृत्त्या आणि रिलीज

आवृत्ती फक्त `package.json` मध्ये असते. `v<version>` असा टॅग केलेल्या कमिटचे बिल्ड ती जशीच्या
तशी दाखवते; इतर कोणत्याही बिल्डमध्ये तिचा कमिटही जोडला जातो (`0.1.0+1a2b3c4`), त्यामुळे `main`
वरून तयार केलेले पान रिलीज समजले जात नाही. आवृत्ती सुरुवातीच्या स्क्रीनच्या तळाशी आणि Settings
मध्ये दाखवली जाते.

रिलीज करण्यासाठी: `npm version minor` (किंवा `patch`), मग `git push --follow-tags`. टॅगमुळे
`.github/workflows/release.yml` सुरू होते, जे टॅग `package.json` शी जुळतो का ते तपासते, चाचण्या
चालवते, आणि GitHub रिलीजला `html-merge-v<version>.html` आणि `SHA256SUMS.txt` जोडते.

## GitHub Pages

`build/pages/` हेच पान आहे, इन्स्टॉल करता येण्याजोग्या PWA च्या रूपात: एक manifest, आयकॉन, आणि एक
service worker जो ते ऑफलाइन चालण्यायोग्य ठेवतो. `.github/workflows/pages.yml` `main` वर प्रत्येक
पुशवर ते तयार करते, तपासते आणि GitHub Pages वर डिप्लॉय करते (Settings → Pages → Source: GitHub
Actions). त्याचे सर्व मार्ग सापेक्ष (relative) आहेत, त्यामुळे ते एखाद्या प्रोजेक्ट साइटच्या
`/<repo>/` पत्त्यावरही चालते.

- PWA ची CSP फक्त तिच्याच origin ला manifest, worker आणि आयकॉनसाठी जोडते; `connect-src`
  `'none'` च राहते.
- नवीन डिप्लॉय आपोआप चालू असलेल्या आवृत्तीची जागा घेत नाही: नवीन service worker थांबून राहतो, आणि
  Settings (आणि सुरुवातीची स्क्रीन) सांगतात "Version X is ready. Update". पान दर सहा तासांनी आणि
  कनेक्शन परत आल्यावर गुपचूप तपासते.
- अपडेटनंतर, "Updated to version X" एकदा सांगितले जाते.

## लेआउट

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

## मर्यादा

- **रचनेनेच फक्त वाचण्यासाठी**: ना मर्जिंग आहे, ना संपादन; बदल तुमच्या एडिटरमध्ये कॉपी करा.
- Firefox आणि Safari ब्राउझरच्या फोल्डर अपलोड डायलॉगने फोल्डर निवडतात: तो संपूर्ण फोल्डर एकाच
  वेळी वाचतो (वगळलेली नावे नंतर काढली जातात, ती वाचल्याशिवाय वगळली जात नाहीत), रिकामे फोल्डर
  दाखवत नाही, आणि रिफ्रेश केल्यावर त्यानंतर जोडलेल्या फायली दिसत नाहीत — त्यासाठी फोल्डर पुन्हा
  निवडा. iOS फोल्डर अजिबात निवडू शकत नाही.
- 64 MB पेक्षा मोठ्या फायलींची तुलना फक्त बाइट-बाइट केली जाते, दुर्लक्ष करण्याच्या पर्यायांशिवाय.
- सिंटॅक्स हायलाइटिंग lexical आहे — कीवर्ड, स्ट्रिंग, कमेंट, संख्या — कोणताही parser नाही; काही
  रचना (JSX टॅग, heredoc) साध्या मजकुरासारख्या रंगवल्या जातात.
- कोणतीही three-way तुलना नाही, आर्काइव्हच्या मजकुराची तुलना नाही, moved-block ओळख नाही.

## परवाना

MIT — पहा [LICENSE](../../LICENSE).
