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
<b>🇮🇩 Bahasa Indonesia</b> ·
<a href="README.de.md">🇩🇪 Deutsch</a> ·
<a href="README.ja.md">🇯🇵 日本語</a> ·
<a href="README.mr.md">🇮🇳 मराठी</a> ·
<a href="README.te.md">🇮🇳 తెలుగు</a> ·
<a href="README.tr.md">🇹🇷 Türkçe</a> ·
<a href="README.uk.md">🇺🇦 Українська</a>
</h3>
<!-- /languages -->

**HTML Merge** membandingkan dua folder, atau dua berkas, berdampingan — seperti WinMerge, tetapi
sebagai satu berkas HTML yang berjalan di peramban modern apa pun di Windows, macOS, Linux,
ChromeOS, Android, dan iOS. Pilih dua folder dan ia mendaftar setiap berkas dari keduanya beserta
apa yang terjadi padanya: identik, berbeda, hanya di kiri, hanya di kanan. Buka sebuah berkas dan
kedua versinya tampil berdampingan, dengan penyorotan sintaksis untuk lebih dari empat puluh
bahasa, kata yang berubah ditandai di dalam baris yang berubah, dan peta semua perbedaan di
samping bilah gulir.

Aplikasi ini hanya membaca. Tidak ada yang diinstal, tidak ada yang diunggah, dan tidak ada
berkas yang pernah diubah: berkas dibaca oleh halaman itu sendiri, di peramban, dan halaman ini
sama sekali tidak dapat menjangkau jaringan.

Halaman yang sama juga berfungsi sebagai PWA (Progressive Web App): disajikan dari GitHub Pages,
ia dapat dipasang ke sistem dan kemudian berjalan sebagai aplikasi terpisah, dengan jendela dan
ikonnya sendiri, serta berfungsi secara luring — lihat "[GitHub Pages](#github-pages)".

![HTML Merge: dua versi berkas JavaScript berdampingan](../html-merge.png)

## Cara menggunakan

1. Build `build/html-merge.html` (lihat "[Build](#build)") atau ambil dari sebuah rilis, lalu
   buka di peramban — langsung dari disk pun tidak masalah.
2. Pilih sisi kiri dan kanan: **Folder…** atau **File…** untuk masing-masing, atau seret sebuah
   folder atau berkas ke kotaknya. Dua folder atau dua berkas yang diseret ke jendela sekaligus
   langsung dibandingkan.
3. **Bandingkan**.

Dengan dua folder, daftar folder muncul dan terisi seiring berkas-berkas dibandingkan. Chip di
bagian atas menampilkan atau menyembunyikan setiap jenis hasil dan menghitungnya; daftar bisa
berupa pohon atau daftar datar dari jalur, disaring berdasarkan nama (`util`, atau pola seperti
`*.ts`), dan diurutkan berdasarkan kolom apa pun. Klik dua kali sebuah berkas (atau pilih dan
tekan Enter) untuk membandingkannya; `]` dan `[` berpindah ke berkas berbeda berikutnya dan
sebelumnya, dan Esc atau tombol Back peramban kembali ke daftar.

Di layar berkas:

- panah berpindah di antara perbedaan (Alt+↓ dan Alt+↑, atau F7 dan Shift+F7); perbedaan yang
  aktif ditandai di gutter, dan peta di sebelah kanan menunjukkan letak semuanya — klik untuk
  melompat ke sana;
- **Berdampingan atau bertumpuk** beralih antara dua panel dan satu panel gabungan;
- **Lipat baris identik** menyembunyikan rentang panjang baris identik, menyisakan beberapa
  baris di sekitar setiap perbedaan; klik lipatan untuk membukanya;
- **Cari** (Ctrl+F, ⌘F di Mac) menandai setiap kecocokan di kedua sisi; Enter dan Shift+Enter
  berpindah di antaranya;
- menu **⋯** menyimpan opsi tampilan dan perbandingan: tata letak, bahasa untuk mewarnai berkas,
  warna sintaksis, spasi dan akhir baris yang terlihat, kata atau karakter di dalam baris yang
  berubah, dan apa yang diabaikan.

Gambar (PNG, JPEG, GIF, WebP, BMP, ICO, AVIF) ditampilkan berdampingan dengan ukurannya dalam
piksel. Berkas biner lainnya dibandingkan byte demi byte: halaman menyatakan apakah keduanya
identik, di mana letak perbedaan pertama, dan menampilkan byte di sekitarnya.

Chrome dan Edge mengingat perbandingan terbaru: perbandingan itu terdaftar di layar awal dan
terbuka lagi dengan sekali klik (peramban meminta izin sekali lagi untuk membaca folder).
Peramban lain memilih folder dari awal setiap kali.

### Di ponsel

Halaman ini berfungsi di layar ponsel: layar awal menumpuk kedua sisi, daftar folder tetap
menampilkan nama dan hasil, dan pasangan berkas ditampilkan bertumpuk. Ketuk sebuah berkas
untuk membukanya. Di Android, Chrome memilih folder maupun berkas; iOS dapat membandingkan
berkas (folder tidak dapat dipilih di sana).

## Fitur

- **Folder**: perbandingan rekursif berdasarkan isi (atau, lebih cepat, berdasarkan ukuran dan
  tanggal); pohon atau daftar datar; filter berdasarkan hasil dan nama; pengurutan berdasarkan
  nama, hasil, ukuran, atau tanggal; nama yang dikecualikan berdasarkan pola (`.git; node_modules;
  *.log; build/`); nama berkas dibandingkan dengan atau tanpa memperhatikan besar/kecil huruf;
  status terisi seiring berkas dibaca, beberapa sekaligus, sehingga bahkan folder besar langsung
  menampilkan sesuatu.
- **Teks**: patience diff di atas algoritma Myers, sehingga kurung kurawal dan baris kosong yang
  berpindah tidak dipasangkan dengan kode yang tidak berhubungan; baris dari blok yang berubah
  dipasangkan berdasarkan tingkat kemiripannya; kata atau karakter yang berubah ditandai di
  dalam baris; blok baris kosong yang dapat diabaikan; tampilan gabungan; pelipatan baris
  identik; pencarian di kedua sisi.
- **Opsi perbandingan**: abaikan perubahan spasi atau semua spasi, abaikan besar/kecil huruf,
  abaikan baris kosong, abaikan akhir baris (CRLF, LF, CR) — untuk daftar folder maupun layar
  berkas.
- **Pengodean**: UTF-8, UTF-8 dengan BOM, UTF-16 LE dan BE, serta Windows-1252 untuk berkas yang
  bukan UTF-8 yang valid; pengodean, akhir baris, dan jumlah baris ditampilkan untuk setiap sisi,
  dan perbedaan akhir baris saja disebutkan sebagai demikian.
- **Penyorotan sintaksis** untuk lebih dari empat puluh bahasa, dipilih berdasarkan nama berkas
  atau baris pertamanya (`#!/usr/bin/env python3`): JavaScript, TypeScript, JSON, HTML (dengan
  skrip dan gaya di dalamnya), XML, CSS, SCSS, Less, Markdown, Python, Java, Kotlin, C, C++, C#,
  Go, Rust, Swift, Objective-C, PHP, Ruby, shell, PowerShell, berkas batch, SQL, YAML, TOML, INI,
  Dockerfile, Makefile, CMake, diff, Lua, Perl, R, Dart, Scala, Groovy, Haskell, Elixir, GraphQL,
  Protocol Buffers, Pascal, Visual Basic. Bahasa lain apa pun dapat dipilih secara manual.
- **Berkas besar**: hanya baris yang terlihat yang digambar, sehingga berkas dengan ratusan ribu
  baris tetap bergulir mulus; baris yang sangat panjang dipotong di layar (perbandingan tetap
  melihat semuanya).
- **Gambar dan berkas biner** seperti dijelaskan di atas.
- **Tujuh belas bahasa** antarmuka, kanan ke kiri untuk bahasa Arab dan Urdu; tema terang dan
  gelap yang mengikuti sistem atau dipilih sendiri.
- Aplikasi yang terpasang memperbarui dirinya hanya saat diminta: lihat
  "[GitHub Pages](#github-pages)".

## Pintasan keyboard

| Tombol | Aksi |
| --- | --- |
| Alt+↓, F7 | Perbedaan berikutnya |
| Alt+↑, Shift+F7 | Perbedaan sebelumnya |
| `]` / `[` | Berkas berbeda berikutnya / sebelumnya |
| Ctrl+F (⌘F) | Cari di berkas, atau filter daftar folder |
| Enter / Shift+Enter | Hasil berikutnya / sebelumnya |
| ↑ ↓ ← → | Bergerak di daftar folder, buka dan tutup folder |
| Enter | Buka berkas yang dipilih |
| Esc | Kembali ke daftar folder |
| F5 | Bandingkan lagi |
| ? | Daftar pintasan |

## Keamanan

- **Hanya membaca.** Halaman ini membaca berkas dan tidak pernah menulis, mengganti nama, atau
  menghapus apa pun. Di Chrome dan Edge, folder dibuka melalui File System Access API dengan
  akses baca saja.
- **Luring secara konstruksi.** Content-Security-Policy halaman ini menyatakan
  `connect-src 'none'`, dan semua yang dibutuhkannya — gaya, kode, ikon — ada di dalam satu
  berkas HTML itu. Ia tidak dapat memuat apa pun atau mengirim apa pun, apa pun isi berkas yang
  dibandingkan.
- **Skrip yang dipatok.** Build mengganti `script-src 'unsafe-inline'` dengan hash dari satu-
  satunya skrip di halaman: andai nama berkas atau sebaris teks pernah lolos tanpa di-escape,
  penangan inline di dalamnya tetap tidak akan berjalan. Teks dari berkas sampai ke halaman
  dalam bentuk yang sudah di-escape.
- Perbandingan terbaru (Chrome dan Edge) hanya menyimpan handle folder di IndexedDB peramban —
  tanpa nama berkas di dalamnya, tanpa isi. Pengaturan disimpan di `localStorage`.

## Terjemahan

Antarmuka ini berbicara bahasa Inggris, Mandarin, Hindi, Spanyol, Prancis, Arab, Bengali,
Portugis, Rusia, Urdu, Indonesia, Jerman, Jepang, Marathi, Telugu, Turki, dan Ukraina. Ia
dimulai dalam bahasa pertama peramban yang dikenalinya; Settings → Language memilih bahasa lain.

- Bahasa Inggris berada di dalam kode: `t('context', 'English text')`, atau
  `tn('context', '{count} file', '{count} files', n)` untuk teks dengan angka. Di
  `src/app/template.html`, hal yang sama ditulis sebagai `data-i18n="context"` (teks elemen)
  dan `data-i18n-attr="context"` (title, placeholder, dan aria-label-nya).
- Setiap bahasa lain adalah sebuah kamus, `src/locales/<code>.json`:
  `{ "context": { "English text": "translation" } }`. Teks dengan angka memiliki satu bentuk
  per kategori plural bahasa tersebut (`Intl.PluralRules`), dengan kunci berupa bentuk plural
  bahasa Inggrisnya.
- Apa pun yang tidak dimiliki sebuah kamus ditampilkan dalam bahasa Inggris.
- `npm run i18n` menampilkan, per bahasa, string yang tidak dimiliki kamusnya dan yang
  dimilikinya tetapi sudah tidak dipakai lagi oleh antarmuka; `npm test` memeriksa placeholder
  dan bentuk pluralnya.

## Build

Membutuhkan Node.js 20 atau yang lebih baru.

```sh
npm install
npm run build        # build/html-merge.html and build/pages/
npm run watch        # rebuilds on every change
npm run check        # typecheck, unit tests, build, browser tests
```

`./build.sh` melakukan hal yang sama dengan `npm run build`, memasang dependensi pada
jalankan pertama. Satu-satunya dependensi adalah esbuild dan TypeScript, keduanya hanya untuk
build; halaman itu sendiri tidak menggunakan pustaka apa pun.

- `npm test` menjalankan unit test di Node: diff, baris dan pelipatan, pengodean, penyorot
  sintaksis dan tata bahasanya, perbandingan folder, kamus-kamus bahasa.
- `npm run test:browser` menjalankan halaman dan PWA yang sudah di-build di Chrome headless,
  lewat protokol DevTools, tanpa dependensi lain. Ia membutuhkan Chrome atau Chromium lokal
  (`CHROME=/path/to/chrome` untuk memilihnya) dan dilewati jika tidak ada.
- `npm run shots -- <dir>` menyimpan tangkapan layar dari setiap layar utama.
- `npm run icons` merender ikon PNG PWA dari `assets/icon.svg`.

## Versi dan rilis

Versi hanya berada di `package.json`. Build dari commit yang diberi tag `v<version>`
menampilkannya apa adanya; build lainnya menambahkan commit-nya (`0.1.0+1a2b3c4`), sehingga
halaman yang di-build dari `main` tidak dikira sebagai rilis. Versi ditampilkan di bagian bawah
layar awal dan di Settings.

Untuk merilis: `npm version minor` (atau `patch`), lalu `git push --follow-tags`. Tag ini
menjalankan `.github/workflows/release.yml`, yang memeriksa bahwa tag cocok dengan
`package.json`, menjalankan test, dan melampirkan `html-merge-v<version>.html` serta
`SHA256SUMS.txt` ke rilis GitHub.

## GitHub Pages

`build/pages/` adalah halaman yang sama sebagai PWA yang dapat dipasang: sebuah manifest, ikon,
dan service worker yang menjaganya tetap berfungsi secara luring. `.github/workflows/pages.yml`
mem-build dan menguji halaman ini lalu men-deploy-nya ke GitHub Pages pada setiap push ke `main`
(Settings → Pages → Source: GitHub Actions). Semua jalurnya relatif, sehingga ia berfungsi di
bawah alamat `/<repo>/` sebuah project site.

- CSP PWA ini hanya menambahkan origin-nya sendiri untuk manifest, worker, dan ikon;
  `connect-src` tetap `'none'`.
- Deploy baru tidak langsung menggantikan versi yang sedang berjalan: service worker baru
  menunggu, dan Settings (serta layar awal) menyatakan "Version X is ready. Update". Halaman
  ini memeriksa secara diam-diam setiap enam jam dan saat koneksi kembali.
- Setelah pembaruan, "Updated to version X" dinyatakan satu kali.

## Layout

```text
build.mjs              build: satu berkas tunggal dan build/pages/
src/core/diff.ts       opsi perbandingan, kunci baris, patience diff di atas Myers, hunk
src/core/inline.ts     kata atau karakter yang berubah di dalam baris, pemasangan baris sebuah blok
src/core/rows.ts       baris dan blok; tampilan: berdampingan atau gabungan, lipatan
src/core/text.ts       biner atau teks, pengodean, baris dan akhir baris, kolom
src/core/highlight.ts  tokenizer: state dari ekspresi reguler sticky
src/core/languages.ts  tata bahasa, dan bahasa apa yang dipakai sebuah berkas
src/core/folder.ts     dua pohon digabung, status, filter dan urutan daftar, pola pengecualian
src/core/format.ts     ukuran, tanggal, dan angka dalam bahasa antarmuka
src/core/i18n.ts       t(), tn(), kamus-kamus, menerjemahkan markup halaman
src/app/template.html  halaman, dengan Content-Security-Policy-nya
src/app/styles.css     gaya, tema terang dan gelap, warna sintaksis
src/app/main.ts        layar awal, perbandingan folder, layar, riwayat, tombol, drag and drop
src/app/folderview.ts  daftar folder: baris virtual, chip, filter, pengurutan, tombol
src/app/filescreen.ts  layar berkas: toolbar, judul, status line, opsi
src/app/diffview.ts    panel teks: baris virtual, kata, warna, peta, pencarian, lipatan
src/app/mediaview.ts   gambar berdampingan, berkas biner sebagai byte
src/app/sources.ts     pemilih folder dan berkas, item yang diseret, pembacaan berkas
src/app/recent.ts      perbandingan terbaru: handle di IndexedDB
src/app/settings.ts    pengaturan di localStorage, tema, ukuran teks
src/app/settingsview.ts dialog pengaturan, pintasan, opsi perbandingan bersama
src/app/ui.ts          elemen, ikon, dialog, popover, toast, escaping
src/app/update.ts      pembaruan aplikasi yang terpasang
src/pwa/sw.js          service worker PWA
src/locales/*.json     16 kamus bahasa
tools/                 load.mjs (src/ untuk Node), chrome.mjs (Chrome headless), i18n.mjs, shots.mjs, icons.mjs
tests/                 unit test di Node; app.mjs dan pwa.mjs di Chrome
```

## Keterbatasan

- **Hanya membaca sesuai rancangan**: tidak ada penggabungan dan tidak ada penyuntingan; salin
  perubahan di editor Anda.
- Firefox dan Safari memilih folder dengan dialog unggah folder bawaan peramban: ia membaca
  seluruh folder sekaligus (nama yang dikecualikan baru dikeluarkan setelahnya, bukan dilewati),
  tidak menampilkan folder kosong, dan refresh tidak melihat berkas yang ditambahkan sejak itu —
  pilih folder itu lagi untuk itu. iOS sama sekali tidak dapat memilih folder.
- Berkas yang lebih besar dari 64 MB hanya dibandingkan byte demi byte, tanpa opsi pengabaian.
- Penyorotan sintaksis bersifat leksikal — kata kunci, string, komentar, angka — bukan sebuah
  parser; beberapa konstruksi (tag JSX, heredoc) diwarnai sebagai teks biasa.
- Tidak ada perbandingan tiga arah, tidak ada perbandingan isi arsip, tidak ada deteksi blok
  yang dipindahkan.

## Lisensi

MIT — lihat [LICENSE](../../LICENSE).
