# html-merge

<!-- languages -->
<h3 align="center">
<a href="../../README.md">🇬🇧 English</a> ·
<a href="README.zh.md">🇨🇳 中文</a> ·
<b>🇮🇳 हिन्दी</b> ·
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
<a href="README.mr.md">🇮🇳 मराठी</a> ·
<a href="README.te.md">🇮🇳 తెలుగు</a> ·
<a href="README.tr.md">🇹🇷 Türkçe</a> ·
<a href="README.uk.md">🇺🇦 Українська</a>
</h3>
<!-- /languages -->

**HTML Merge** दो फ़ोल्डरों या दो फ़ाइलों की तुलना साथ-साथ दिखाता है — WinMerge जैसा, लेकिन एक ही
HTML फ़ाइल के रूप में, जो Windows, macOS, Linux, ChromeOS, Android और iOS के किसी भी आधुनिक ब्राउज़र में चलती है।
दो फ़ोल्डर चुनें और यह दोनों की हर फ़ाइल को सूचीबद्ध करता है कि उसके साथ क्या हुआ: समान,
भिन्न, केवल बाईं ओर, केवल दाईं ओर। कोई फ़ाइल खोलें तो दोनों संस्करण साथ-साथ
दिखते हैं, चालीस से अधिक भाषाओं के लिए सिंटैक्स हाइलाइटिंग के साथ, बदली गई पंक्तियों के भीतर बदले गए शब्द चिह्नित किए जाते हैं,
और स्क्रॉल बार के पास सभी अंतरों का एक मानचित्र होता है।

यह केवल पढ़ता है। कुछ भी इंस्टॉल नहीं होता, कुछ भी अपलोड नहीं होता और कोई फ़ाइल कभी नहीं बदली जाती: फ़ाइलें
पेज द्वारा स्वयं, ब्राउज़र में ही पढ़ी जाती हैं, और पेज नेटवर्क तक बिल्कुल भी नहीं पहुँच सकता।

यही पेज एक PWA (Progressive Web App) के रूप में भी काम करता है: GitHub Pages से परोसे जाने पर इसे
सिस्टम में इंस्टॉल किया जा सकता है, और फिर यह अपनी खुद की विंडो और आइकन के साथ एक अलग ऐप के रूप में चलता है, और
ऑफ़लाइन काम करता है — देखें "[GitHub Pages](#github-pages)"।

![HTML Merge: एक JavaScript फ़ाइल के दो संस्करण साथ-साथ](../html-merge.png)

## उपयोग कैसे करें

1. `build/html-merge.html` बनाएँ (देखें "[बिल्ड](#बिल्ड)") या किसी रिलीज़ से लें, और इसे
   ब्राउज़र में खोलें — सीधे डिस्क से खोलना भी ठीक है।
2. बाईं और दाईं ओर चुनें: हर एक के लिए **Folder…** या **File…**, या किसी फ़ोल्डर या
   फ़ाइल को उसके बॉक्स पर खींच कर छोड़ें। विंडो पर एक साथ छोड़े गए दो फ़ोल्डर या दो फ़ाइलों की
   तुलना तुरंत हो जाती है।
3. **Compare**.

दो फ़ोल्डरों के साथ, फ़ोल्डर सूची दिखाई देती है और फ़ाइलों की तुलना होते ही भरती जाती है। ऊपर के चिप्स हर
तरह के परिणाम को दिखाते या छिपाते हैं और उन्हें गिनते हैं; सूची ट्री या नामों की फ़्लैट सूची
हो सकती है, नाम से फ़िल्टर की जा सकती है (`util`, या `*.ts` जैसा पैटर्न), और किसी भी कॉलम से क्रमबद्ध की जा सकती है।
किसी फ़ाइल पर डबल-क्लिक करें (या उसे चुनकर Enter दबाएँ) तो उसकी तुलना होती है; `]` और `[` अगली
और पिछली भिन्न फ़ाइल पर ले जाते हैं, और Esc या ब्राउज़र का Back बटन सूची पर वापस ले जाता है।

फ़ाइल स्क्रीन पर:

- तीर अंतरों के बीच चलते हैं (Alt+↓ और Alt+↑, या F7 और Shift+F7); वर्तमान अंतर
  गटर में चिह्नित होता है, और दाईं ओर का मानचित्र दिखाता है कि सभी अंतर कहाँ हैं — वहाँ क्लिक करके
  सीधे पहुँचा जा सकता है;
- **Side by side or one under the other** दो पैन और एक संयुक्त पैन के बीच बदलता है;
- **Fold identical lines** लंबे समान हिस्सों को छिपा देता है, हर अंतर के आसपास कुछ पंक्तियाँ छोड़ कर;
  किसी छिपे हिस्से पर क्लिक करके उसे खोला जा सकता है;
- **Find** (Ctrl+F, Mac पर ⌘F) दोनों ओर हर मेल को चिह्नित करता है; Enter और Shift+Enter उनके
  बीच ले जाते हैं;
- **⋯** मेनू में दृश्य और तुलना के विकल्प होते हैं: लेआउट, फ़ाइलों को रंगने के लिए भाषा, सिंटैक्स
  रंग, दिखाई देने वाले रिक्त स्थान और लाइन एंडिंग, बदली गई पंक्तियों के भीतर शब्द या वर्ण, और क्या अनदेखा करना है।

चित्र (PNG, JPEG, GIF, WebP, BMP, ICO, AVIF) पिक्सेल में उनके आकार के साथ साथ-साथ दिखाए जाते हैं।
अन्य बाइनरी फ़ाइलों की तुलना बाइट दर बाइट होती है: पेज बताता है कि वे समान हैं या नहीं, पहला अंतर
कहाँ है, और उसके आसपास के बाइट दिखाता है।

Chrome और Edge हाल की तुलनाएँ याद रखते हैं: वे स्टार्ट स्क्रीन पर सूचीबद्ध होती हैं और एक क्लिक से फिर से
खुलती हैं (ब्राउज़र फ़ोल्डर पढ़ने की अनुमति फिर से माँगता है)। अन्य ब्राउज़र हर बार नए सिरे से फ़ोल्डर चुनते हैं।

### फ़ोन पर

पेज फ़ोन की स्क्रीन पर भी काम करता है: स्टार्ट स्क्रीन दोनों ओर को एक के ऊपर एक दिखाती है, फ़ोल्डर
सूची नाम और परिणाम रखती है, और फ़ाइलों का जोड़ा एक के नीचे एक दिखाया जाता है। किसी फ़ाइल को खोलने के लिए उसे
टैप करें। Android पर, Chrome फ़ाइलों के साथ-साथ फ़ोल्डर भी चुन सकता है; iOS फ़ाइलों की तुलना कर सकता है
(वहाँ फ़ोल्डर नहीं चुने जा सकते)।

## विशेषताएँ

- **फ़ोल्डर**: सामग्री के आधार पर पुनरावर्ती तुलना (या, तेज़ी से, आकार और तारीख के आधार पर); ट्री या
  फ़्लैट सूची; परिणाम और नाम के आधार पर फ़िल्टर; नाम, परिणाम, आकार या तारीख से क्रमबद्ध करना; पैटर्न से
  छोड़े गए नाम (`.git; node_modules; *.log; build/`); फ़ाइल नामों की तुलना बड़े-छोटे अक्षरों के साथ या
  उनके बिना; फ़ाइलें पढ़ी जाने के साथ-साथ परिणाम थोड़ा-थोड़ा करके भरते हैं, ताकि बड़े फ़ोल्डर भी तुरंत
  कुछ दिखाएँ।
- **टेक्स्ट**: Myers के एल्गोरिद्म पर patience diff, ताकि इधर-उधर हुए ब्रेस और खाली पंक्तियाँ असंबंधित
  कोड से न जुड़ें; किसी बदले हुए हिस्से की पंक्तियाँ उनकी समानता के अनुसार जोड़ी जाती हैं; पंक्ति के भीतर
  बदले गए शब्द या वर्ण चिह्नित होते हैं; खाली पंक्तियों के हिस्से जिन्हें अनदेखा किया जा सकता है; संयुक्त
  दृश्य; समान पंक्तियों को संक्षिप्त करना; दोनों ओर खोज।
- **तुलना विकल्प**: रिक्त स्थान के बदलाव या पूरे रिक्त स्थान को अनदेखा करना, बड़े-छोटे अक्षर अनदेखा करना,
  खाली पंक्तियाँ अनदेखा करना, लाइन एंडिंग (CRLF, LF, CR) अनदेखा करना — फ़ोल्डर सूची और फ़ाइल स्क्रीन दोनों पर।
- **एन्कोडिंग**: UTF-8, BOM सहित UTF-8, UTF-16 LE और BE, और उन फ़ाइलों के लिए Windows-1252 जो मान्य
  UTF-8 नहीं हैं; हर ओर के लिए एन्कोडिंग, लाइन एंडिंग और पंक्तियों की संख्या दिखाई जाती है, और केवल लाइन
  एंडिंग का अंतर उसी रूप में बताया जाता है।
- चालीस से अधिक भाषाओं के लिए **सिंटैक्स हाइलाइटिंग**, जो फ़ाइल के नाम या उसकी पहली पंक्ति
  (`#!/usr/bin/env python3`) से चुनी जाती है: JavaScript, TypeScript, JSON, HTML (अंदर की स्क्रिप्ट और
  स्टाइल सहित), XML, CSS, SCSS, Less, Markdown, Python, Java, Kotlin, C, C++, C#, Go, Rust,
  Swift, Objective-C, PHP, Ruby, shell, PowerShell, batch फ़ाइलें, SQL, YAML, TOML, INI, Dockerfile,
  Makefile, CMake, diff, Lua, Perl, R, Dart, Scala, Groovy, Haskell, Elixir, GraphQL, Protocol
  Buffers, Pascal, Visual Basic। कोई भी अन्य भाषा हाथ से चुनी जा सकती है।
- **बड़ी फ़ाइलें**: केवल दिखने वाली पंक्तियाँ ही बनाई जाती हैं, इसलिए लाखों पंक्तियों वाली फ़ाइलें भी
  आसानी से स्क्रॉल होती हैं; बहुत लंबी पंक्तियाँ स्क्रीन पर काट दी जाती हैं (तुलना फिर भी उनकी पूरी लंबाई देखती है)।
- ऊपर बताए गए अनुसार **चित्र और बाइनरी फ़ाइलें**।
- इंटरफ़ेस की **सत्रह भाषाएँ**, अरबी और उर्दू के लिए दाईं से बाईं ओर; एक हल्की और एक गहरी
  थीम जो सिस्टम का अनुसरण करती है या चुनी जा सकती है।
- इंस्टॉल किया गया ऐप खुद को तभी अपडेट करता है जब कहा जाए: देखें "[GitHub Pages](#github-pages)"।

## कीबोर्ड शॉर्टकट

| कुंजियाँ | क्रिया |
| --- | --- |
| Alt+↓, F7 | अगला अंतर |
| Alt+↑, Shift+F7 | पिछला अंतर |
| `]` / `[` | अगली / पिछली भिन्न फ़ाइल |
| Ctrl+F (⌘F) | फ़ाइलों में खोजें, या फ़ोल्डर सूची फ़िल्टर करें |
| Enter / Shift+Enter | अगला / पिछला मेल |
| ↑ ↓ ← → | फ़ोल्डर सूची में घूमें, फ़ोल्डर खोलें और बंद करें |
| Enter | चयनित फ़ाइल खोलें |
| Esc | फ़ोल्डर सूची पर वापस जाएँ |
| F5 | फिर से तुलना करें |
| ? | शॉर्टकट की सूची |

## सुरक्षा

- **केवल पढ़ने के लिए।** पेज फ़ाइलें पढ़ता है और कभी कुछ भी नहीं लिखता, नाम नहीं बदलता या हटाता नहीं है। Chrome
  और Edge में फ़ोल्डर File System Access API के ज़रिए केवल पढ़ने की अनुमति के साथ खोले जाते हैं।
- **बनावट से ही ऑफ़लाइन।** पेज की Content-Security-Policy `connect-src 'none'` कहती है, और इसे जो कुछ
  चाहिए — स्टाइल, कोड, आइकन — वह सब एक ही HTML फ़ाइल के भीतर है। यह कुछ भी लोड नहीं कर सकता या भेज नहीं सकता,
  चाहे तुलना की जा रही फ़ाइल में कुछ भी हो।
- **पिन किया गया स्क्रिप्ट।** बिल्ड `script-src 'unsafe-inline'` की जगह पेज की एकमात्र स्क्रिप्ट के हैश
  का उपयोग करता है: यदि किसी फ़ाइल का नाम या कोई पंक्ति कभी बिना एस्केप हुए निकल भी जाए, तो उसमें मौजूद
  कोई inline हैंडलर फिर भी नहीं चलेगा। फ़ाइलों से आया टेक्स्ट पेज तक एस्केप होकर पहुँचता है।
- हाल की तुलनाएँ (Chrome और Edge) ब्राउज़र के IndexedDB में केवल फ़ोल्डर हैंडल रखती हैं — उसमें न कोई
  फ़ाइल नाम होता है, न सामग्री। सेटिंग्स `localStorage` में रखी जाती हैं।

## अनुवाद

इंटरफ़ेस अंग्रेज़ी, चीनी, हिन्दी, स्पेनिश, फ़्रेंच, अरबी, बंगाली, पुर्तगाली, रूसी, उर्दू, इंडोनेशियाई,
जर्मन, जापानी, मराठी, तेलुगु, तुर्की और यूक्रेनी भाषाओं में उपलब्ध है। यह ब्राउज़र की भाषाओं में से जानी
गई पहली भाषा में शुरू होता है; Settings → Language से दूसरी भाषा चुनी जा सकती है।

- अंग्रेज़ी कोड में ही रहती है: `t('context', 'English text')`, या संख्या वाले टेक्स्ट के लिए
  `tn('context', '{count} file', '{count} files', n)`। `src/app/template.html` में इसी का रूप
  `data-i18n="context"` (एलिमेंट का टेक्स्ट) और `data-i18n-attr="context"` (उसका title, placeholder
  और aria-label) है।
- हर अन्य भाषा एक डिक्शनरी है, `src/locales/<code>.json`:
  `{ "context": { "English text": "translation" } }`। संख्या वाले टेक्स्ट में भाषा की हर plural
  category (`Intl.PluralRules`) के लिए एक रूप होता है, जो अंग्रेज़ी plural से कुंजीबद्ध होता है।
- डिक्शनरी में जो न हो, वह अंग्रेज़ी में दिखता है।
- `npm run i18n` हर भाषा के लिए वे टेक्स्ट दिखाता है जो उसकी डिक्शनरी में नहीं हैं, और वे जो उसमें हैं
  पर अब इंटरफ़ेस में उपयोग नहीं होते; `npm test` placeholder और plural रूपों की जाँच करता है।

## बिल्ड

Node.js 20 या नया चाहिए।

```sh
npm install
npm run build        # build/html-merge.html and build/pages/
npm run watch        # rebuilds on every change
npm run check        # typecheck, unit tests, build, browser tests
```

`./build.sh` वही करता है जो `npm run build` करता है, पहली बार चलाने पर निर्भरताएँ इंस्टॉल करके।
एकमात्र निर्भरताएँ esbuild और TypeScript हैं, दोनों केवल बिल्ड के लिए; पेज खुद किसी लाइब्रेरी का उपयोग नहीं करता।

- `npm test` Node में यूनिट टेस्ट चलाता है: diff, पंक्तियाँ और folding, एन्कोडिंग, हाइलाइटर और उसके
  grammar, फ़ोल्डर तुलना, डिक्शनरी।
- `npm run test:browser` बनाए गए पेज और PWA को headless Chrome में, DevTools प्रोटोकॉल के ज़रिए, बिना
  किसी और निर्भरता के चलाता है। इसे स्थानीय Chrome या Chromium चाहिए (चुनने के लिए `CHROME=/path/to/chrome`)
  और न होने पर यह छोड़ दिया जाता है।
- `npm run shots -- <dir>` हर मुख्य स्क्रीन के स्क्रीनशॉट सहेजता है।
- `npm run icons` `assets/icon.svg` से PWA के PNG आइकन बनाता है।

## संस्करण और रिलीज़

संस्करण केवल `package.json` में रहता है। टैग किए गए `v<version>` कमिट का बिल्ड उसे वैसे ही दिखाता है
जैसा वह है; किसी अन्य बिल्ड में उसका कमिट भी जुड़ जाता है (`0.1.0+1a2b3c4`), ताकि `main` से बनाया गया पेज
रिलीज़ न समझा जाए। संस्करण स्टार्ट स्क्रीन के नीचे और Settings में दिखाया जाता है।

रिलीज़ करने के लिए: `npm version minor` (या `patch`), फिर `git push --follow-tags`। टैग
`.github/workflows/release.yml` को शुरू करता है, जो जाँचता है कि टैग `package.json` से मेल खाता है,
टेस्ट चलाता है, और GitHub रिलीज़ के साथ `html-merge-v<version>.html` और `SHA256SUMS.txt` जोड़ता है।

## GitHub Pages

`build/pages/` वही पेज है, एक इंस्टॉल किए जा सकने वाले PWA के रूप में: एक manifest, आइकन, और एक service
worker जो इसे ऑफ़लाइन चलने लायक रखता है। `.github/workflows/pages.yml` `main` पर हर पुश पर इसे बनाता और
टेस्ट करता है और GitHub Pages पर डिप्लॉय करता है (Settings → Pages → Source: GitHub Actions)। इसके सभी
पथ सापेक्ष (relative) हैं, इसलिए यह किसी प्रोजेक्ट साइट के `/<repo>/` पते पर भी काम करता है।

- PWA की CSP केवल अपने ही origin को manifest, worker और आइकन के लिए जोड़ती है; `connect-src`
  `'none'` ही रहती है।
- नया डिप्लॉय खुद चल रहे संस्करण की जगह नहीं लेता: नया service worker रुका रहता है, और Settings (और
  स्टार्ट स्क्रीन) कहती हैं "Version X is ready. Update"। पेज हर छह घंटे में और कनेक्शन वापस आने पर
  चुपचाप जाँच करता है।
- अपडेट के बाद, "Updated to version X" एक बार कहा जाता है।

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

## सीमाएँ

- **डिज़ाइन से ही केवल पढ़ने के लिए**: न कोई मर्ज है, न कोई संपादन; अपने एडिटर में बदलाव कॉपी करें।
- Firefox और Safari ब्राउज़र के फ़ोल्डर अपलोड डायलॉग से फ़ोल्डर चुनते हैं: यह पूरा फ़ोल्डर एक साथ पढ़ लेता है
  (छोड़े गए नाम बाद में हटाए जाते हैं, पढ़े बिना नहीं छोड़े जाते), खाली फ़ोल्डर नहीं दिखाता, और रीफ़्रेश करने
  पर बाद में जोड़ी गई फ़ाइलें नहीं दिखतीं — इसके लिए फ़ोल्डर फिर से चुनें। iOS फ़ोल्डर बिल्कुल नहीं चुन सकता।
- 64 MB से बड़ी फ़ाइलों की तुलना केवल बाइट दर बाइट होती है, अनदेखा करने के विकल्पों के बिना।
- सिंटैक्स हाइलाइटिंग lexical है — कीवर्ड, स्ट्रिंग, कमेंट, संख्याएँ — कोई parser नहीं; कुछ रचनाएँ
  (JSX टैग, heredoc) सादे टेक्स्ट के रूप में रंगी जाती हैं।
- कोई three-way तुलना नहीं, archive की सामग्री की कोई तुलना नहीं, moved-block पहचान नहीं।

## लाइसेंस

MIT — देखें [LICENSE](../../LICENSE)।
