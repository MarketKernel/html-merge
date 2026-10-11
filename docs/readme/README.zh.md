# html-merge

<!-- languages -->
<h3 align="center">
<a href="../../README.md">🇬🇧 English</a> ·
<b>🇨🇳 中文</b> ·
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
<a href="README.tr.md">🇹🇷 Türkçe</a> ·
<a href="README.uk.md">🇺🇦 Українська</a>
</h3>
<!-- /languages -->

**HTML Merge** 并排比较两个文件夹或两个文件——就像 WinMerge，但只是一个 HTML
文件，可以在 Windows、macOS、Linux、ChromeOS、Android 和 iOS 上的任何现代浏览器中运行。
选择两个文件夹后，它会列出两边的每个文件及其结果：相同、不同、仅左侧有、仅右侧有。打开一个
文件后，两个版本会并排显示，支持四十多种语言的语法高亮，更改的单词会在更改的行内标出，
滚动条旁还有一张显示所有差异位置的地图。

它只读取文件。不会安装任何东西，不会上传任何东西，也不会更改任何文件：文件由页面本身在浏览
器中读取，而且该页面完全无法访问网络。

同一个页面也可以作为 PWA（渐进式 Web 应用）使用：通过 GitHub Pages 提供服务后，它可以被安装
到系统中，作为一个独立的应用运行，拥有自己的窗口和图标，并可离线使用——参见
"[GitHub Pages](#github-pages)"。

![HTML Merge：并排显示一个 JavaScript 文件的两个版本](../html-merge.png)

## 使用方法

1. 构建 `build/html-merge.html`（参见"[构建](#构建)"）或从发布版本中获取，然后在浏览器中
   打开——直接从磁盘打开即可。
2. 为左侧和右侧分别选择：**文件夹…** 或 **文件…**，也可以将文件夹或文件拖到对应的框中。同
   时将两个文件夹或两个文件拖放到窗口上会立即进行比较。
3. **比较**。

选择两个文件夹后，文件夹列表会出现，并在文件比较过程中逐步填充。顶部的标签可以显示或隐藏
每种结果并统计数量；列表可以是树形的，也可以是扁平的路径列表，可按名称筛选（如 `util`，或
`*.ts` 这样的模式），并可按任意列排序。双击一个文件（或选中后按 Enter）即可比较它；`]` 和
`[` 跳转到下一个和上一个不同的文件，Esc 或浏览器的后退按钮会返回列表。

在文件界面中：

- 箭头按钮在差异之间移动（Alt+↓ 和 Alt+↑，或 F7 和 Shift+F7）；当前差异会在行号栏中标出，
  右侧的地图会显示所有差异的位置——点击即可跳转；
- **并排或上下排列** 在两个面板和一个统一面板之间切换；
- **折叠相同的行** 隐藏长段相同的内容，每处差异周围保留几行；点击折叠处即可展开；
- **查找**（Ctrl+F，Mac 上为 ⌘F）会标出两侧所有匹配项；Enter 和 Shift+Enter 在匹配项之间
  移动；
- **⋯** 菜单包含查看和比较选项：布局、用于高亮文件的语言、语法配色、是否显示空白字符和换行
  符、更改的行内按单词还是按字符标注，以及要忽略的内容。

图片（PNG、JPEG、GIF、WebP、BMP、ICO、AVIF）会并排显示，并标明其像素尺寸。其他二进制文件
按字节比较：页面会说明它们是否相同、第一个差异的位置，并显示该处周围的字节。

Chrome 和 Edge 会记住最近的比较：它们会列在起始界面上，点击即可再次打开（浏览器会再次请求
读取文件夹的权限）。其他浏览器每次都需要重新选择文件夹。

### 在手机上

该页面也适用于手机屏幕：起始界面会将两侧堆叠显示，文件夹列表保留名称和结果列，文件对则以
上下排列的方式显示。点按一个文件即可打开它。在 Android 上，Chrome 既可以选择文件夹也可以
选择文件；iOS 只能比较文件（无法选择文件夹）。

## 功能

- **文件夹**：按内容递归比较（也可按大小和日期快速比较）；树形或扁平列表；按结果和名称筛
  选；按名称、结果、大小或日期排序；按模式排除名称（`.git; node_modules; *.log; build/`）；
  文件名比较时可区分或不区分大小写；结果会在读取文件时逐批填入，即使是大型文件夹也能很快看
  到内容。
- **文本**：在 Myers 算法基础上使用 patience diff，使移动的括号和空行不会与无关代码错误配
  对；变更块中的各行按相似程度配对；行内更改的单词或字符会被标出；可忽略成块的空行；支持统
  一视图；可折叠相同的行；可在两侧搜索。
- **比较选项**：忽略空白变化或全部空白、忽略大小写、忽略空白行、忽略换行符（CRLF、LF、
  CR）——文件夹列表和文件界面均适用。
- **编码**：UTF-8、带 BOM 的 UTF-8、UTF-16 LE 和 BE，以及用于非有效 UTF-8 文件的
  Windows-1252；每一侧都会显示编码、换行符和行数，仅换行符不同的情况会被单独标明。
- **语法高亮**：支持四十多种语言，根据文件名或首行（`#!/usr/bin/env python3`）自动选择：
  JavaScript、TypeScript、JSON、HTML（含内嵌脚本和样式）、XML、CSS、SCSS、Less、Markdown、
  Python、Java、Kotlin、C、C++、C#、Go、Rust、Swift、Objective-C、PHP、Ruby、Shell、
  PowerShell、批处理文件、SQL、YAML、TOML、INI、Dockerfile、Makefile、CMake、diff、Lua、
  Perl、R、Dart、Scala、Groovy、Haskell、Elixir、GraphQL、Protocol Buffers、Pascal、
  Visual Basic。其他语言也可以手动选择。
- **大文件**：只绘制可见的行，因此数十万行的文件也能流畅滚动；屏幕上过长的行会被截断（但比
  较时仍会考虑完整内容）。
- **图片和二进制文件**：如上所述。
- 界面支持 **十七种语言**，阿拉伯语和乌尔都语从右到左显示；提供浅色和深色主题，可跟随系统
  或手动选择。
- 已安装的应用只在用户确认后才会更新：参见"[GitHub Pages](#github-pages)"。

## 键盘快捷键

| 按键 | 操作 |
| --- | --- |
| Alt+↓、F7 | 下一个差异 |
| Alt+↑、Shift+F7 | 上一个差异 |
| `]` / `[` | 下一个/上一个不同的文件 |
| Ctrl+F（⌘F） | 在文件中查找，或筛选文件夹列表 |
| Enter / Shift+Enter | 下一个/上一个匹配项 |
| ↑ ↓ ← → | 在文件夹列表中移动，展开和折叠文件夹 |
| Enter | 打开所选文件 |
| Esc | 返回文件夹列表 |
| F5 | 重新比较 |
| ? | 快捷键列表 |

## 安全性

- **只读。** 页面只读取文件，绝不会写入、重命名或删除任何内容。在 Chrome 和 Edge 中，文件
  夹通过 File System Access API 以只读方式打开。
- **天生离线。** 页面的 Content-Security-Policy 设置为 `connect-src 'none'`，它所需的一
  切——样式、代码、图标——都包含在这一个 HTML 文件中。无论被比较的文件包含什么内容，它都无
  法加载或发送任何东西。
- **固定脚本。** 构建过程会用页面中唯一脚本的哈希值替换 `script-src 'unsafe-inline'`：即
  使某个文件名或某行文本未被正确转义而混入页面，其中的内联处理程序也不会运行。来自文件的文
  本在送达页面前都会被转义。
- 最近的比较记录（Chrome 和 Edge）只在浏览器的 IndexedDB 中保存文件夹句柄——不含文件名，
  也不含内容。设置保存在 `localStorage` 中。

## 翻译

界面支持英语、中文、印地语、西班牙语、法语、阿拉伯语、孟加拉语、葡萄牙语、俄语、乌尔都语、
印尼语、德语、日语、马拉地语、泰卢固语、土耳其语和乌克兰语。它会使用浏览器语言列表中第一个
受支持的语言启动；可在"设置 → 语言"中选择其他语言。

- 英语文本存放在代码中：`t('context', 'English text')`，若文本中带有数字则使用
  `tn('context', '{count} file', '{count} files', n)`。在 `src/app/template.html` 中，
  对应的写法是 `data-i18n="context"`（元素的文本）和 `data-i18n-attr="context"`（其
  title、placeholder 和 aria-label）。
- 其他每种语言都是一个字典文件 `src/locales/<code>.json`：
  `{ "context": { "English text": "translation" } }`。带数字的文本会为该语言的每个复数类
  别（`Intl.PluralRules`）提供一种形式，并以英语的复数形式作为键。
- 字典中缺失的内容会以英语显示。
- `npm run i18n` 会按语言输出该字典缺失的字符串，以及界面已不再使用但字典中仍保留的字符
  串；`npm test` 会检查占位符和复数形式。

## 构建

需要 Node.js 20 或更高版本。

```sh
npm install
npm run build        # build/html-merge.html and build/pages/
npm run watch        # rebuilds on every change
npm run check        # typecheck, unit tests, build, browser tests
```

`./build.sh` 与 `npm run build` 效果相同，并会在首次运行时安装依赖。唯一的依赖是 esbuild
和 TypeScript，两者都只用于构建；页面本身不使用任何库。

- `npm test` 在 Node 中运行单元测试：差异算法、行与折叠、编码、高亮器及其语法、文件夹比
  较、字典。
- `npm run test:browser` 通过 DevTools 协议在无头 Chrome 中驱动构建好的页面和 PWA，不需
  要其他依赖。它需要本地的 Chrome 或 Chromium（可用 `CHROME=/path/to/chrome` 指定），如
  果没有则会跳过。
- `npm run shots -- <dir>` 保存每个主要界面的截图。
- `npm run icons` 根据 `assets/icon.svg` 生成 PWA 的 PNG 图标。

## 版本与发布

版本号只存放在 `package.json` 中。标记为 `v<version>` 的提交构建出的版本会原样显示；其他
构建都会附加提交号（如 `0.1.0+1a2b3c4`），这样从 `main` 分支构建的页面就不会被误认为是正
式发布版。版本号显示在起始界面底部和设置中。

发布方法：先执行 `npm version minor`（或 `patch`），再执行 `git push --follow-tags`。该标
签会触发 `.github/workflows/release.yml`，它会检查标签是否与 `package.json` 一致，运行测
试，并将 `html-merge-v<version>.html` 和 `SHA256SUMS.txt` 附加到 GitHub 发布版本中。

## GitHub Pages

`build/pages/` 是同一个页面的可安装 PWA 版本：包含一个 manifest、图标和一个用于离线运行的
service worker。`.github/workflows/pages.yml` 会在每次推送到 `main` 时构建并测试它，然后
部署到 GitHub Pages（设置 → Pages → 来源：GitHub Actions）。它的所有路径都是相对路径，因
此可以在项目站点的 `/<repo>/` 地址下正常运行。

- PWA 的 CSP 仅为 manifest、worker 和图标添加了自身源；`connect-src` 仍保持为 `'none'`。
- 新的部署不会自动替换正在运行的版本：新的 service worker 会等待，设置界面（以及起始界
  面）会显示"版本 X 已就绪。更新"。页面会每六小时以及网络恢复时静默检查一次。
- 更新后，页面会提示一次"已更新到版本 X"。

## 布局

```text
build.mjs              构建脚本：生成单个文件和 build/pages/
src/core/diff.ts       比较选项、行的键、基于 Myers 算法的 patience diff、差异块
src/core/inline.ts     行内更改的单词或字符、差异块内行的配对
src/core/rows.ts       行与差异块；视图：并排或统一显示、折叠
src/core/text.ts       二进制或文本判断、编码、行与换行符、列
src/core/highlight.ts  分词器：基于粘性正则表达式的状态机
src/core/languages.ts  语法规则，以及判断文件所属语言
src/core/folder.ts     合并后的两棵目录树、状态、列表的筛选与排序、排除模式
src/core/format.ts     界面语言下的大小、日期和数字格式
src/core/i18n.ts       t()、tn()、字典、翻译页面标记
src/app/template.html  页面本体，含其 Content-Security-Policy
src/app/styles.css     样式、浅色与深色主题、语法配色
src/app/main.ts        起始界面、文件夹比较、各个界面、历史记录、按键、拖放
src/app/folderview.ts  文件夹列表：虚拟行、标签、筛选、排序、按键
src/app/filescreen.ts  文件界面：工具栏、标题、状态栏、选项
src/app/diffview.ts    文本面板：虚拟行、单词、颜色、地图、搜索、折叠
src/app/mediaview.ts   图片并排显示，二进制文件按字节显示
src/app/sources.ts     文件夹和文件选择器、拖放的项目、读取文件
src/app/recent.ts      最近的比较：IndexedDB 中的句柄
src/app/settings.ts    localStorage 中的设置、主题、文字大小
src/app/settingsview.ts 设置对话框、快捷键、共享的比较选项
src/app/ui.ts          元素、图标、对话框、弹出层、提示、转义
src/app/update.ts      已安装应用的更新
src/pwa/sw.js          PWA 的 service worker
src/locales/*.json     16 个字典文件
tools/                 load.mjs（为 Node 提供 src/）、chrome.mjs（无头 Chrome）、i18n.mjs、shots.mjs、icons.mjs
tests/                 Node 中的单元测试；Chrome 中的 app.mjs 和 pwa.mjs
```

## 局限性

- **设计上即为只读**：不支持合并，也不支持编辑；更改请在编辑器中进行并自行复制。
- Firefox 和 Safari 使用浏览器自带的文件夹上传对话框选择文件夹：它会一次性读取整个文件夹
  （被排除的名称是之后才过滤掉的，而不是跳过不读），不显示空文件夹，刷新后也看不到之后新增
  的文件——需要重新选择文件夹才能看到。iOS 完全无法选择文件夹。
- 超过 64 MB 的文件只会按字节比较，不支持忽略选项。
- 语法高亮基于词法分析——关键字、字符串、注释、数字——而非真正的解析器；某些结构（如 JSX
  标签、heredoc）会按纯文本着色。
- 不支持三方比较，不支持压缩包内容比较，也不支持移动代码块的检测。

## 许可证

MIT —— 参见 [LICENSE](../../LICENSE)。
