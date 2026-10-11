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
<a href="README.mr.md">🇮🇳 मराठी</a> ·
<a href="README.te.md">🇮🇳 తెలుగు</a> ·
<b>🇹🇷 Türkçe</b> ·
<a href="README.uk.md">🇺🇦 Українська</a>
</h3>
<!-- /languages -->

**HTML Merge**, iki klasörü veya iki dosyayı yan yana karşılaştırır — WinMerge gibi, ama
Windows, macOS, Linux, ChromeOS, Android ve iOS'taki herhangi bir modern tarayıcıda çalışan tek
bir HTML dosyası olarak. İki klasör seçin, her iki klasördeki tüm dosyaları başlarına gelenle
birlikte listeler: aynı, farklı, yalnızca solda, yalnızca sağda. Bir dosyayı açın, iki sürüm yan
yana durur; kırktan fazla dil için sözdizimi renklendirmesiyle, değişen satırların içinde
işaretlenmiş değişen kelimelerle ve kaydırma çubuğunun yanında tüm farkların bir haritasıyla.

Yalnızca okur. Hiçbir şey kurulmaz, hiçbir şey yüklenmez ve hiçbir dosya asla değiştirilmez:
dosyalar tarayıcıda, sayfanın kendisi tarafından okunur ve sayfa ağa hiç erişemez.

Aynı sayfa bir PWA (Progressive Web App) olarak da çalışır: GitHub Pages'ten sunulduğunda
sisteme kurulabilir ve ardından kendi penceresi ve simgesiyle ayrı bir uygulama olarak çalışır,
çevrimdışı da çalışır — bkz. "[GitHub Pages](#github-pages)".

![HTML Merge: bir JavaScript dosyasının iki sürümü yan yana](../html-merge.png)

## Nasıl kullanılır

1. `build/html-merge.html` dosyasını derleyin (bkz. "[Build](#build)") veya bir sürümden alın,
   ve bir tarayıcıda açın — doğrudan diskten açmak da sorun değil.
2. Sol ve sağ tarafı seçin: her biri için **Folder…** veya **File…**, ya da bir klasörü veya
   dosyayı kutusuna sürükleyin. Pencereye aynı anda bırakılan iki klasör veya iki dosya hemen
   karşılaştırılır.
3. **Karşılaştır**.

İki klasörle, klasör listesi görünür ve dosyalar karşılaştırıldıkça dolar. Üstteki etiketler her
sonuç türünü gösterir veya gizler ve sayar; liste bir ağaç ya da düz bir yol listesi olabilir,
ada göre (`util`, veya `*.ts` gibi bir kalıpla) filtrelenir ve herhangi bir sütuna göre
sıralanır. Bir dosyaya çift tıklayın (veya seçip Enter'a basın) karşılaştırmak için; `]` ve `[`
bir sonraki ve bir önceki farklı dosyaya gider, Esc veya tarayıcının Geri düğmesi listeye döner.

Dosya ekranında:

- oklar farklar arasında gezinir (Alt+↓ ve Alt+↑, veya F7 ve Shift+F7); geçerli olan gutter'da
  işaretlenir ve sağdaki harita hepsinin nerede olduğunu gösterir — atlamak için tıklayın;
- **Yan yana veya alt alta**, iki panel ile tek bir birleşik panel arasında geçiş yapar;
- **Aynı satırları katla**, uzun aynı satır aralıklarını gizler, her farkın çevresinde birkaç
  satır bırakır; bir katlamaya tıklayarak açın;
- **Bul** (Ctrl+F, Mac'te ⌘F) her iki taraftaki tüm eşleşmeleri işaretler; Enter ve Shift+Enter
  aralarında gezinir;
- **⋯** menüsü görünüm ve karşılaştırma seçeneklerini barındırır: düzen, dosyaları renklendirmek
  için kullanılacak dil, sözdizimi renkleri, görünür boşluk ve satır sonları, değişen satırların
  içindeki kelimeler veya karakterler ve neyin yok sayılacağı.

Resimler (PNG, JPEG, GIF, WebP, BMP, ICO, AVIF) piksel cinsinden boyutlarıyla yan yana
gösterilir. Diğer ikili dosyalar bayt bayt karşılaştırılır: sayfa aynı olup olmadıklarını, ilk
farkın nerede olduğunu söyler ve çevresindeki baytları gösterir.

Chrome ve Edge son karşılaştırmaları hatırlar: başlangıç ekranında listelenirler ve bir tıkla
yeniden açılırlar (tarayıcı klasörleri okuma izni için bir kez daha sorar). Diğer tarayıcılar her
seferinde klasörleri yeniden seçer.

### Telefonda

Sayfa bir telefonun ekranında çalışır: başlangıç ekranı iki tarafı üst üste yığar, klasör listesi
adı ve sonucu korur ve bir dosya çifti alt alta gösterilir. Açmak için bir dosyaya dokunun.
Android'de Chrome hem klasörleri hem de dosyaları seçer; iOS dosyaları karşılaştırabilir
(klasörler orada seçilemez).

## Özellikler

- **Klasörler**: içeriğe göre (veya, daha hızlı, boyut ve tarihe göre) özyinelemeli
  karşılaştırma; ağaç veya düz liste; sonuca ve ada göre filtreler; ada, sonuca, boyuta veya
  tarihe göre sıralama; kalıba göre hariç tutulan adlar (`.git; node_modules; *.log; build/`);
  dosya adları büyük/küçük harf duyarlı ya da duyarsız karşılaştırılır; durumlar dosyalar
  okundukça küçük gruplar hâlinde doldurulur, böylece büyük klasörlerde bile hemen bir şeyler
  görünür.
- **Metin**: Myers algoritması üzerine kurulu bir patience diff, böylece yer değiştiren süslü
  parantezler ve boş satırlar ilgisiz kodla eşleşmez; değişen bir bloğun satırları ne kadar
  benzediklerine göre eşleştirilir; bir satırın içindeki değişen kelimeler veya karakterler
  işaretlenir; yok sayılabilen boş satır blokları; birleşik görünüm; aynı satırların katlanması;
  her iki tarafta arama.
- **Karşılaştırma seçenekleri**: boşluk değişikliklerini veya tüm boşlukları yok say, büyük/küçük
  harfi yok say, boş satırları yok say, satır sonlarını (CRLF, LF, CR) yok say — hem klasör
  listesi hem de dosya ekranı için.
- **Kodlamalar**: UTF-8, BOM'lu UTF-8, UTF-16 LE ve BE, ve geçerli UTF-8 olmayan dosyalar için
  Windows-1252; her taraf için kodlama, satır sonları ve satır sayısı gösterilir, yalnızca satır
  sonu farkı ayrıca belirtilir.
- Dosyanın adına veya ilk satırına (`#!/usr/bin/env python3`) göre seçilen, kırktan fazla dil
  için **sözdizimi renklendirmesi**: JavaScript, TypeScript, JSON, HTML (içindeki betik ve
  stillerle birlikte), XML, CSS, SCSS, Less, Markdown, Python, Java, Kotlin, C, C++, C#, Go,
  Rust, Swift, Objective-C, PHP, Ruby, kabuk, PowerShell, toplu iş dosyaları, SQL, YAML, TOML,
  INI, Dockerfile, Makefile, CMake, diff, Lua, Perl, R, Dart, Scala, Groovy, Haskell, Elixir,
  GraphQL, Protocol Buffers, Pascal, Visual Basic. Başka herhangi bir dil elle seçilebilir.
- **Büyük dosyalar**: yalnızca görünen satırlar çizilir, böylece yüz binlerce satırlık dosyalar
  akıcı kayar; çok uzun satırlar ekranda kesilir (karşılaştırma yine de hepsini görür).
- Yukarıda açıklandığı gibi **resimler ve ikili dosyalar**.
- Arapça ve Urduca için sağdan sola, sistemi izleyen veya elle seçilen açık ve koyu temalı
  arayüzde **on yedi dil**.
- Kurulu uygulama kendini yalnızca istendiğinde günceller: bkz.
  "[GitHub Pages](#github-pages)".

## Klavye kısayolları

| Tuşlar | İşlem |
| --- | --- |
| Alt+↓, F7 | Sonraki fark |
| Alt+↑, Shift+F7 | Önceki fark |
| `]` / `[` | Sonraki / önceki farklı dosya |
| Ctrl+F (⌘F) | Dosyalarda ara veya klasör listesini filtrele |
| Enter / Shift+Enter | Sonraki / önceki eşleşme |
| ↑ ↓ ← → | Klasör listesinde gezin, klasörleri aç ve kapat |
| Enter | Seçili dosyayı aç |
| Esc | Klasör listesine dön |
| F5 | Yeniden karşılaştır |
| ? | Kısayol listesi |

## Güvenlik

- **Salt okunur.** Sayfa dosyaları okur, hiçbir şeyi asla yazmaz, yeniden adlandırmaz veya
  silmez. Chrome ve Edge'de klasörler yalnızca okuma erişimiyle File System Access API
  üzerinden açılır.
- **Yapısı gereği çevrimdışı.** Sayfanın Content-Security-Policy'si `connect-src 'none'` der ve
  ihtiyaç duyduğu her şey — stiller, kod, simgeler — tek HTML dosyasının içindedir. Karşılaştırılan
  bir dosya ne içerirse içersin, hiçbir şey yükleyemez veya gönderemez.
- **Sabitlenmiş betik.** Derleme, `script-src 'unsafe-inline'`i sayfadaki tek betiğin hash'iyle
  değiştirir: bir dosya adı veya bir metin satırı hiç escape edilmeden sızsa bile, içindeki bir
  inline işleyici yine çalışmaz. Dosyalardan gelen metin sayfaya escape edilmiş olarak ulaşır.
- Son karşılaştırmalar (Chrome ve Edge) tarayıcının IndexedDB'sinde yalnızca klasör handle'larını
  tutar — içinde dosya adı yoktur, içerik yoktur. Ayarlar `localStorage`'da tutulur.

## Çeviriler

Arayüz İngilizce, Çince, Hintçe, İspanyolca, Fransızca, Arapça, Bengalce, Portekizce, Rusça,
Urduca, Endonezce, Almanca, Japonca, Marathi, Telugu, Türkçe ve Ukraynaca konuşur. Tarayıcının
bildiği dillerin ilkiyle başlar; Settings → Language başka birini seçer.

- İngilizce kodun içinde yaşar: `t('context', 'English text')`, ya da sayı içeren bir metin
  için `tn('context', '{count} file', '{count} files', n)`. `src/app/template.html` içinde
  aynısı `data-i18n="context"` (elemanın metni) ve `data-i18n-attr="context"` (title,
  placeholder ve aria-label'ı) olarak yazılır.
- Diğer her dil bir sözlüktür, `src/locales/<code>.json`:
  `{ "context": { "English text": "translation" } }`. Sayı içeren bir metnin, dilin plural
  kategorisi (`Intl.PluralRules`) başına bir biçimi vardır, anahtar olarak İngilizce plural
  biçimi kullanılır.
- Bir sözlükte bulunmayan her şey İngilizce gösterilir.
- `npm run i18n`, her dil için sözlüğünde eksik olan ve artık arayüz tarafından kullanılmayan
  dizgileri yazdırır; `npm test` placeholder'ları ve plural biçimlerini kontrol eder.

## Build

Node.js 20 veya daha yenisini gerektirir.

```sh
npm install
npm run build        # build/html-merge.html and build/pages/
npm run watch        # rebuilds on every change
npm run check        # typecheck, unit tests, build, browser tests
```

`./build.sh`, ilk çalıştırmada bağımlılıkları kurarak `npm run build` ile aynısını yapar. Tek
bağımlılıklar esbuild ve TypeScript'tir, ikisi de yalnızca derleme için; sayfanın kendisi hiçbir
kütüphane kullanmaz.

- `npm test`, Node'da birim testlerini çalıştırır: diff, satırlar ve katlama, kodlamalar,
  vurgulayıcı ve gramerleri, klasör karşılaştırması, sözlükler.
- `npm run test:browser`, başsız (headless) bir Chrome'da, DevTools protokolü üzerinden, başka
  hiçbir bağımlılık olmadan derlenmiş sayfayı ve PWA'yı çalıştırır. Yerel bir Chrome veya
  Chromium gerektirir (birini seçmek için `CHROME=/path/to/chrome`) ve hiçbiri yoksa atlanır.
- `npm run shots -- <dir>`, her ana ekranın ekran görüntülerini kaydeder.
- `npm run icons`, PWA'nın PNG simgelerini `assets/icon.svg`'den oluşturur.

## Sürümler ve yayınlar

Sürüm yalnızca `package.json`'da yaşar. `v<version>` etiketli commit'in bir derlemesi onu olduğu
gibi gösterir; başka herhangi bir derleme kendi commit'ini ekler (`0.1.0+1a2b3c4`), böylece
`main`den derlenen bir sayfa bir yayın sanılmaz. Sürüm, başlangıç ekranının altında ve
Settings'te gösterilir.

Yayınlamak için: `npm version minor` (veya `patch`), ardından `git push --follow-tags`. Etiket,
`.github/workflows/release.yml`'yi başlatır; bu da etiketin `package.json` ile eşleştiğini
kontrol eder, testleri çalıştırır ve `html-merge-v<version>.html` ile `SHA256SUMS.txt`'yi GitHub
yayınına ekler.

## GitHub Pages

`build/pages/`, kurulabilir bir PWA olarak aynı sayfadır: bir manifest, simgeler ve onu
çevrimdışı çalışır tutan bir service worker. `.github/workflows/pages.yml`, `main`e her push'ta
onu derler, test eder ve GitHub Pages'e dağıtır (Settings → Pages → Source: GitHub Actions). Tüm
yolları görelidir, böylece bir proje sitesinin `/<repo>/` adresi altında çalışır.

- PWA'nın CSP'si yalnızca manifest, worker ve simgeler için kendi origin'ini ekler; `connect-src`
  `'none'` olarak kalır.
- Yeni bir dağıtım, çalışan sürümü kendiliğinden değiştirmez: yeni service worker bekler ve
  Settings (ve başlangıç ekranı) "Version X is ready. Update" der. Sayfa, sessizce her altı
  saatte bir ve bağlantı geri geldiğinde kontrol eder.
- Bir güncellemeden sonra, "Updated to version X" bir kez söylenir.

## Düzen

```text
build.mjs              derleme: tek dosya ve build/pages/
src/core/diff.ts       karşılaştırma seçenekleri, satır anahtarları, Myers üzerine patience diff, hunk'lar
src/core/inline.ts     bir satırın içindeki değişen kelimeler veya karakterler, bir bloğun satırlarını eşleştirme
src/core/rows.ts       satırlar ve bloklar; görünüm: yan yana veya birleşik, katlamalar
src/core/text.ts       ikili mi metin mi, kodlamalar, satırlar ve satır sonları, sütunlar
src/core/highlight.ts  tokenizer: yapışkan düzenli ifadelerin durumları
src/core/languages.ts  gramerler ve bir dosyanın hangi dilde olduğu
src/core/folder.ts     birleştirilmiş iki ağaç, durumlar, listenin filtreleri ve sırası, hariç tutma kalıpları
src/core/format.ts     arayüz dilinde boyutlar, tarihler ve sayılar
src/core/i18n.ts       t(), tn(), sözlükler, sayfanın markup'ını çevirme
src/app/template.html  sayfa, Content-Security-Policy'siyle birlikte
src/app/styles.css     stiller, açık ve koyu tema, sözdizimi renkleri
src/app/main.ts        başlangıç ekranı, klasör karşılaştırması, ekranlar, geçmiş, tuşlar, sürükle bırak
src/app/folderview.ts  klasör listesi: sanal satırlar, etiketler, filtre, sıralama, tuşlar
src/app/filescreen.ts  dosya ekranı: araç çubuğu, başlıklar, durum satırı, seçenekler
src/app/diffview.ts    metin panelleri: sanal satırlar, kelimeler, renkler, harita, arama, katlamalar
src/app/mediaview.ts   yan yana resimler, bayt olarak ikili dosyalar
src/app/sources.ts     klasör ve dosya seçiciler, bırakılan öğeler, dosya okuma
src/app/recent.ts      son karşılaştırmalar: IndexedDB'deki handle'lar
src/app/settings.ts    localStorage'daki ayarlar, tema, metin boyutu
src/app/settingsview.ts ayarlar diyaloğu, kısayollar, paylaşılan karşılaştırma seçenekleri
src/app/ui.ts          elemanlar, simgeler, diyaloglar, popover'lar, toast'lar, escaping
src/app/update.ts      kurulu uygulamanın güncellemeleri
src/pwa/sw.js          PWA'nın service worker'ı
src/locales/*.json     16 sözlük
tools/                 load.mjs (Node için src/), chrome.mjs (headless Chrome), i18n.mjs, shots.mjs, icons.mjs
tests/                 Node'da birim testleri; Chrome'da app.mjs ve pwa.mjs
```

## Sınırlamalar

- **Tasarım gereği salt okunur**: birleştirme yoktur ve düzenleme yoktur; değişiklikleri kendi
  editörünüzde kopyalayın.
- Firefox ve Safari, klasörleri tarayıcının klasör yükleme iletişim kutusuyla seçer: tüm klasörü
  bir kerede okur (hariç tutulan adlar yalnızca sonradan çıkarılır, atlanmaz), boş klasörleri
  göstermez ve bir yenileme o zamandan beri eklenen dosyaları görmez — bunun için klasörleri
  yeniden seçin. iOS klasörleri hiç seçemez.
- 64 MB'tan büyük dosyalar yalnızca bayt bayt, yok sayma seçenekleri olmadan karşılaştırılır.
- Sözdizimi renklendirmesi sözcüksel çalışır — anahtar sözcükler, dizgiler, yorumlar, sayılar —
  bir ayrıştırıcı değildir; bazı yapılar (JSX etiketleri, heredoc'lar) düz metin olarak
  renklendirilir.
- Üç yönlü karşılaştırma yok, arşiv içeriklerinin karşılaştırılması yok, taşınan blok tespiti
  yok.

## Lisans

MIT — bkz. [LICENSE](../../LICENSE).
