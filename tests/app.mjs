/**
 * Drives the built page in headless Chrome: two folders compared, the list's
 * filters, a text pair with its differences, words, colours, search, folding
 * and the unified view, pictures, binary files, two files picked on their own,
 * a large file, the languages and right to left, a phone's screen.
 *
 * The folders live in the page's private file system (OPFS): the test writes
 * them there, and a stand-in showDirectoryPicker hands out their handles —
 * real FileSystemDirectoryHandles, so the page takes its Chrome route.
 *
 * Needs `npm run build` first and a local Chrome (or `CHROME=/path/to/chrome`).
 * `--shots DIR` also saves screenshots of the main screens into DIR.
 */
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { CHROME, sleep, startChrome } from '../tools/chrome.mjs';
import { checker, root } from '../tools/load.mjs';

const APP = join(root, 'build', 'html-merge.html');
const shotsAt = process.argv.indexOf('--shots');
const SHOTS = shotsAt > 0 ? process.argv[shotsAt + 1] : null;

if (!CHROME) {
  console.log('No Chrome found — set CHROME=/path/to/chrome. Skipping the browser tests.');
  process.exit(0);
}
if (!existsSync(APP)) {
  console.error('No build/html-merge.html — run `npm run build` first.');
  process.exit(1);
}

const { check, done } = checker();
const html = await readFile(APP);
const server = createServer((req, res) => {
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.end(html);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/`;

const APP_JS_LEFT = `import { readFile } from 'node:fs';

// Reads the settings and returns them.
export function load(path) {
  const text = readFile(path, 'utf8');
  return JSON.parse(text);
}

export function total(items) {
  let sum = 0;
  for (const item of items) sum += item.price;
  return sum;
}

export const VERSION = '1.0.0';
`;
const APP_JS_RIGHT = `import { readFile } from 'node:fs';

// Reads the settings and returns them, or the defaults.
export function load(path, defaults = {}) {
  const text = readFile(path, 'utf8');
  return { ...defaults, ...JSON.parse(text) };
}

export function total(items) {
  let sum = 0;
  for (const item of items) sum += item.price * item.count;
  return sum;
}

export function average(items) {
  return total(items) / items.length;
}

export const VERSION = '1.1.0';
`;

/** A tiny PNG of one colour: enough for the picture view. */
const png = (r, g, b) => {
  const hex = ['89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000c4944415408d763', '0000000301010000183dd8550000000049454e44ae426082'];
  // Not a valid image of that colour (the checksum would be wrong); the page shows what the browser can.
  return Buffer.from(hex[0] + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('') + hex[1], 'hex').toString('base64');
};

const LEFT = {
  'README.md': '# Project\n\nSame on both sides.\n',
  'src/app.js': APP_JS_LEFT,
  'src/util.py': 'def helper():\n    return 42\n',
  'src/old.css': '.a { color: red; }\n',
  'docs/guide.txt': 'line one\nline two\n',
  'logo.png': { base64: png(255, 0, 0) },
  'data.bin': { base64: Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).toString('base64') },
  'crlf.txt': 'one\r\ntwo\r\n',
  'node_modules/pkg/index.js': 'left out\n',
};
const RIGHT = {
  'README.md': '# Project\n\nSame on both sides.\n',
  'src/app.js': APP_JS_RIGHT,
  'src/util.py': 'def helper():\n    return 43\n',
  'src/new.ts': 'export const answer: number = 42;\n',
  'docs/guide.txt': 'line one\nline two\n',
  'logo.png': { base64: png(0, 128, 255) },
  'data.bin': { base64: Buffer.from([0, 1, 2, 3, 99, 5, 6, 7, 8, 9]).toString('base64') },
  'crlf.txt': 'one\ntwo\n',
  'extra/notes.md': '*new*\n',
};

const chrome = await startChrome();
try {
  const [tab] = (await chrome.targets()).filter((t) => t.type === 'page');
  const s = await chrome.attach(tab.targetId, 'page');
  await chrome.send('Page.enable', {}, s);
  const evaluate = (expression) => chrome.evaluate(s, expression);
  const until = (expression, timeout) => chrome.until(s, expression, timeout);
  const click = (selector) => chrome.click(s, selector);
  const text = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)})?.textContent ?? null`);
  const texts = (selector) => evaluate(`[...document.querySelectorAll(${JSON.stringify(selector)})].map((n) => n.textContent)`);
  const visible = (selector) => evaluate(`(() => { const n = document.querySelector(${JSON.stringify(selector)}); return !!n && n.getClientRects().length > 0; })()`);
  const KEYS = {
    Enter: { code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' },
    Escape: { code: 'Escape', windowsVirtualKeyCode: 27 },
    ArrowDown: { code: 'ArrowDown', windowsVirtualKeyCode: 40 },
    ArrowUp: { code: 'ArrowUp', windowsVirtualKeyCode: 38 },
    ArrowRight: { code: 'ArrowRight', windowsVirtualKeyCode: 39 },
    BracketRight: { code: 'BracketRight', windowsVirtualKeyCode: 221, key: ']', text: ']' },
    F7: { code: 'F7', windowsVirtualKeyCode: 118 },
  };
  /** modifiers: 1 Alt, 2 Ctrl, 4 Meta, 8 Shift. */
  const press = async (name, modifiers = 0) => {
    const k = KEYS[name];
    const key = k.key ?? name;
    const withText = !modifiers && k.text;
    await chrome.send('Input.dispatchKeyEvent', { type: withText ? 'keyDown' : 'rawKeyDown', key, modifiers, ...k, text: withText ? k.text : undefined }, s);
    await chrome.send('Input.dispatchKeyEvent', { type: 'keyUp', key, modifiers, ...k }, s);
    await sleep(60);
  };
  const type = async (value) => {
    await chrome.send('Input.insertText', { text: value }, s);
    await sleep(40);
  };
  const shot = async (name) => {
    if (!SHOTS) return;
    await sleep(150);
    const { data } = await chrome.send('Page.captureScreenshot', { format: 'png' }, s);
    await writeFile(join(SHOTS, `${name}.png`), Buffer.from(data, 'base64'));
  };
  const viewport = (width, height, mobile = false) =>
    chrome.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile }, s);
  const load = async () => {
    await evaluate(`window.__before = true`).catch(() => undefined);
    await chrome.send('Page.navigate', { url }, s);
    await until(`!window.__before && document.readyState === 'complete' && !!document.getElementById('version').textContent`);
  };
  /** Writes a tree into the private file system, under `name`. */
  const writeTree = (name, files) =>
    evaluate(`(async () => {
      const top = await (await navigator.storage.getDirectory()).getDirectoryHandle(${JSON.stringify(name)}, { create: true });
      for (const [path, content] of Object.entries(${JSON.stringify(files)})) {
        const parts = path.split('/');
        let dir = top;
        for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part, { create: true });
        const handle = await dir.getFileHandle(parts[parts.length - 1], { create: true });
        const stream = await handle.createWritable();
        await stream.write(typeof content === 'string' ? content : Uint8Array.from(atob(content.base64), (c) => c.charCodeAt(0)));
        await stream.close();
      }
      return true;
    })()`);
  /** The page's pickers return what the test queued: folders or files of the private file system, by path. */
  await chrome.send(
    'Page.addScriptToEvaluateOnNewDocument',
    {
      source: `
        window.__pick = [];
        const opfsPath = async (path, file) => {
          let dir = await navigator.storage.getDirectory();
          const parts = path.split('/');
          for (const part of parts.slice(0, file ? -1 : undefined)) dir = await dir.getDirectoryHandle(part);
          return file ? dir.getFileHandle(parts[parts.length - 1]) : dir;
        };
        window.showDirectoryPicker = async () => opfsPath(window.__pick.shift(), false);
        window.showOpenFilePicker = async () => [await opfsPath(window.__pick.shift(), true)];
        if (!localStorage.getItem('html-merge')) localStorage.setItem('html-merge', JSON.stringify({ language: 'en', theme: 'light' }));
      `,
    },
    s,
  );
  await load();

  // The start screen
  check('start shown', await visible('#start'), true);
  const { version } = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  check('version as in package.json', (await text('#version')).split('+')[0], version);
  check('compare waits for two sides', await evaluate(`document.getElementById('compare').disabled`), true);
  check('nothing chosen yet', await texts('.slot-name'), ['Nothing chosen', 'Nothing chosen']);
  await shot('1-start');

  await writeTree('left', LEFT);
  await writeTree('right', RIGHT);
  await evaluate(`window.__pick.push('left', 'right'), true`);
  await click('[data-pick="dir"][data-side="left"]');
  await until(`document.querySelector('.slot[data-side="left"] .slot-name').textContent === 'left'`);
  await click('[data-pick="dir"][data-side="right"]');
  await until(`document.querySelector('.slot[data-side="right"] .slot-name').textContent === 'right'`);
  check('both picked', await texts('.slot-name'), ['left', 'right']);
  check('compare ready', await evaluate(`document.getElementById('compare').disabled`), false);
  await shot('1b-picked');
  await click('#compare');

  // The folder list
  check('folder list shown', await until(`!document.getElementById('folders').hidden && document.querySelectorAll('.item').length > 0`), true);
  check('all compared', await until(`!document.querySelector('.item.st-pending') && !document.getElementById('folder-status').textContent.includes('comparing')`), true);
  const rows = async () => evaluate(`[...document.querySelectorAll('.item')].map((n) => n.querySelector('.label').textContent + ':' + [...n.classList].find((c) => c.startsWith('st-')).slice(3))`);
  check('top level, folders first, node_modules left out', await rows(), [
    'docs:same',
    'extra:right',
    'src:different',
    'crlf.txt:same',
    'data.bin:different',
    'logo.png:different',
    'README.md:same',
  ]);
  check('counts', await evaluate(`Object.fromEntries([...document.querySelectorAll('[data-count]')].map((n) => [n.dataset.count, n.textContent]))`), {
    different: '4',
    left: '1',
    right: '2',
    same: '3',
  });
  check('line endings only: equal text', await evaluate(`[...document.querySelectorAll('.item')].find((n) => n.textContent.includes('crlf.txt')).querySelector('.item-status').textContent`), 'Equal text');
  check('status line', await text('#folder-status'), '10 files');
  await click('#folder-expand');
  await until(`document.querySelectorAll('.item').length > 7`);
  check('expanded', (await rows()).slice(0, 9), ['docs:same', 'guide.txt:same', 'extra:right', 'notes.md:right', 'src:different', 'app.js:different', 'new.ts:right', 'old.css:left', 'util.py:different']);
  await shot('2-folders');
  await click('[data-show="same"]');
  await until(`!document.querySelector('.item.st-same')`);
  check('identical hidden', (await rows()).some((r) => r.endsWith(':same')), false);
  await click('#folder-flat');
  await until(`document.querySelector('.item .label')?.textContent.includes('/')`);
  check('flat: files with their paths', await texts('.item .label'), ['extra/notes.md', 'src/app.js', 'src/new.ts', 'src/old.css', 'src/util.py', 'data.bin', 'logo.png']);
  await click('#folder-flat');
  await click('[data-show="same"]');
  await evaluate(`(() => { const f = document.getElementById('folder-filter'); f.value = 'util'; f.dispatchEvent(new Event('input')); return true; })()`);
  await until(`document.querySelectorAll('.item').length === 2`);
  check('name filter', await texts('.item .label'), ['src', 'util.py']);
  await evaluate(`(() => { const f = document.getElementById('folder-filter'); f.value = ''; f.dispatchEvent(new Event('input')); return true; })()`);
  await until(`[...document.querySelectorAll('.item .label')].some((n) => n.textContent === 'app.js')`);

  // A text pair
  await evaluate(`[...document.querySelectorAll('.item')].find((n) => n.querySelector('.label').textContent === 'app.js').click(), true`);
  await evaluate(`document.getElementById('folder-list').focus(), true`);
  await press('Enter');
  check('file screen', await until(`!document.getElementById('file').hidden && document.querySelectorAll('.pane .r').length > 0`), true);
  check('crumbs: back to the list, the path', await texts('#crumbs .crumb'), ['leftright', 'src/app.js']);
  check('heads', await texts('.file-head .path'), ['src/app.js', 'src/app.js']);
  check('first difference current', await text('#diff-position'), '1 of 4');
  check('words inside a changed line', await evaluate(`[...document.querySelectorAll('.pane:last-child .r.ins .hl')].map((n) => n.textContent).slice(0, 2)`), [', or the defaults', ', defaults = {}']);
  check('syntax colours', await evaluate(`[...document.querySelectorAll('.pane .tk-keyword')].slice(0, 3).map((n) => n.textContent)`), ['import', 'from', 'export']);
  check('a left-only gap on the left', await evaluate(`document.querySelectorAll('.pane:first-child .r.filler').length > 0`), true);
  check('status: language and tally', await text('#file-status'), 'JavaScript · 5 lines changed · 4 lines added');
  check('map of the differences', await evaluate(`(() => { const c = document.querySelector('.overview canvas'); return c.width > 0 && c.height > 0; })()`), true);
  await shot('3-text');
  await press('ArrowDown', 1);
  check('Alt+↓: next difference', await text('#diff-position'), '2 of 4');
  await press('F7');
  check('F7: next difference', await text('#diff-position'), '3 of 4');
  check('the current block marked', await evaluate(`document.querySelectorAll('.r.cur').length > 0`), true);
  await click('#first-diff');
  check('first difference', await text('#diff-position'), '1 of 4');

  // Search
  await evaluate(`document.getElementById('find').focus(), true`);
  await type('items');
  check('found', await until(`document.getElementById('find-count').textContent === '1/7'`), true);
  check('hits marked', await evaluate(`document.querySelectorAll('.hit').length === 7 && document.querySelectorAll('.hit-cur').length === 1`), true);
  await press('Enter');
  check('next match', await text('#find-count'), '2/7');
  check('focus stays in the search', await evaluate(`document.activeElement.id`), 'find');
  await press('Escape');
  check('search cleared', await evaluate(`document.querySelectorAll('.hit').length`), 0);

  // Views
  await click('#view-fold');
  check('folded', await until(`document.querySelectorAll('.r.fold').length > 0 || document.querySelectorAll('.pane:first-child .r').length < 22`), true);
  await click('#view-fold');
  await click('#view-split');
  check('unified: one pane, two gutters', await until(`document.querySelectorAll('.pane').length === 1 && document.querySelectorAll('.pane .r:first-child .ln').length === 2`), true);
  check('unified: removed then added', await evaluate(`[...document.querySelectorAll('.pane .r')].slice(2, 6).map((n) => n.classList.contains('del') ? 'del' : n.classList.contains('ins') ? 'ins' : 'same')`), ['del', 'del', 'ins', 'ins']);
  await shot('3b-unified');
  await click('#view-split');
  check('side by side again', await until(`document.querySelectorAll('.pane').length === 2`), true);

  // The options popover: whitespace and syntax
  await click('#view-options');
  check('options open', await visible('.popover'), true);
  await shot('3c-options');
  await press('Escape');
  check('options closed', await evaluate(`!document.querySelector('.popover')`), true);

  // The next different file, pictures, binary
  await evaluate(`document.querySelector('.pane').focus(), true`);
  await press('BracketRight');
  check('] opens the next different file', await until(`document.querySelector('#crumbs .crumb--current')?.textContent === 'src/new.ts'`), true);
  check('right only: all added', await evaluate(`document.querySelectorAll('.pane:last-child .r.ins').length`), 1);
  check('missing side said', await text('.file-head--left .missing'), 'No file on this side');
  await press('BracketRight');
  await until(`document.querySelector('#crumbs .crumb--current')?.textContent === 'src/old.css'`);
  await press('BracketRight');
  await until(`document.querySelector('#crumbs .crumb--current')?.textContent === 'src/util.py'`);
  check('python', await evaluate(`document.querySelector('.tk-keyword')?.textContent`), 'def');
  await press('BracketRight');
  check('binary file', await until(`document.querySelectorAll('.hex').length === 2`), true);
  check('binary: first difference', await text('.media-note'), 'The files are different · First difference at byte 4');
  check('binary: the byte marked', await evaluate(`document.querySelector('.hex .bd')?.textContent`), '04');
  await shot('4-binary');
  await press('BracketRight');
  check('pictures', await until(`document.querySelectorAll('.media img').length === 2`), true);
  await press('Escape');
  check('Escape: back to the list', await until(`!document.getElementById('folders').hidden`), true);
  check('the opened file selected', await until(`document.querySelector('.item--sel .label')?.textContent === 'logo.png'`), true);

  // Browser back and forward
  await evaluate(`history.back(), true`);
  check('back: the start screen', await until(`!document.getElementById('start').hidden`), true);
  await evaluate(`history.forward(), true`);
  check('forward: the list again', await until(`!document.getElementById('folders').hidden`), true);

  // Settings: compare options and languages
  await click('#settings');
  check('settings open', await visible('.dialog'), true);
  await shot('5-settings');
  const pickLanguage = (code) =>
    evaluate(`(() => { const s = [...document.querySelectorAll('.dialog select')][0]; s.value = ${JSON.stringify(code)}; s.dispatchEvent(new Event('change')); return true; })()`);
  await pickLanguage('ru');
  check('russian', await evaluate(`document.documentElement.lang`), 'ru');
  await pickLanguage('ar');
  check('arabic: right to left', await evaluate(`document.documentElement.dir`), 'rtl');
  await press('Escape');
  await shot('6-arabic');
  await click('#settings');
  await pickLanguage('en');
  check('english, left to right', await evaluate(`document.documentElement.dir`), 'ltr');
  // Endings compared: crlf.txt becomes different once the dialog closes.
  await evaluate(`(() => { const box = [...document.querySelectorAll('.dialog .setting--check')].find((n) => n.textContent.startsWith('Ignore line endings')).querySelector('input'); box.click(); return true; })()`);
  await press('Escape');
  check('endings compared: different', await until(`[...document.querySelectorAll('.item')].find((n) => n.textContent.includes('crlf.txt'))?.classList.contains('st-different')`), true);
  await click('#settings');
  await evaluate(`(() => { const box = [...document.querySelectorAll('.dialog .setting--check')].find((n) => n.textContent.startsWith('Ignore line endings')).querySelector('input'); box.click(); return true; })()`);
  await press('Escape');
  await until(`[...document.querySelectorAll('.item')].find((n) => n.textContent.includes('crlf.txt'))?.classList.contains('st-same')`);

  // F5: files changed on disk since are compared again
  await writeTree('right', { 'README.md': '# Project\n\nChanged on the right.\n' });
  await evaluate(`document.getElementById('folder-list').focus(), true`);
  await chrome.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'F5', code: 'F5', windowsVirtualKeyCode: 116 }, s);
  await chrome.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'F5', code: 'F5', windowsVirtualKeyCode: 116 }, s);
  check('F5: compared again', await until(`[...document.querySelectorAll('.item')].find((n) => n.textContent.includes('README.md'))?.classList.contains('st-different')`), true);
  check('F5: still the same page', await evaluate(`!document.getElementById('folders').hidden`), true);

  // The dark theme
  await evaluate(`document.documentElement.dataset.theme = 'dark', true`);
  await evaluate(`[...document.querySelectorAll('.item')].find((n) => n.querySelector('.label').textContent === 'src').querySelector('.twisty')?.click(), true`);
  await shot('7-dark-folders');
  await evaluate(`document.querySelector('.item.st-different[data-kind="file"]')?.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })), true`);
  await until(`!document.getElementById('file').hidden && document.querySelectorAll('.pane .r').length > 0`);
  await shot('7b-dark-text');
  await evaluate(`document.documentElement.dataset.theme = 'light', true`);

  // Two files on their own
  await click('#home');
  await until(`!document.getElementById('start').hidden`);
  await evaluate(`window.__pick.push('left/src/util.py', 'right/src/util.py'), true`);
  await click('[data-pick="file"][data-side="left"]');
  await until(`document.querySelector('.slot[data-side="left"] .slot-name').textContent === 'util.py'`);
  await click('[data-pick="file"][data-side="right"]');
  await until(`document.querySelector('.slot[data-side="right"] .slot-name').textContent === 'util.py'`);
  await click('#compare');
  check('two files: compared at once', await until(`!document.getElementById('file').hidden && document.getElementById('diff-position').textContent === '1 of 1'`), true);
  check('two files: no stepping between files', await evaluate(`document.getElementById('file-nav-files').hidden`), true);
  check('two files: words', await evaluate(`[...document.querySelectorAll('.r.del .hl, .r.ins .hl')].map((n) => n.textContent)`), ['42', '43']);

  // A long line: the panes scroll sideways together, the line numbers stay
  const long = `const data = [${Array.from({ length: 400 }, (_, i) => i).join(', ')}];`;
  await writeTree('wide', { 'a.js': `${long}\nend\n`, 'b.js': `${long.replace('399', 'x')}\nend\n` });
  await click('#home');
  await until(`!document.getElementById('start').hidden`);
  await evaluate(`window.__pick.push('wide/a.js', 'wide/b.js'), true`);
  await click('[data-pick="file"][data-side="left"]');
  await until(`document.querySelector('.slot[data-side="left"] .slot-name').textContent === 'a.js'`);
  await click('[data-pick="file"][data-side="right"]');
  await until(`document.querySelector('.slot[data-side="right"] .slot-name').textContent === 'b.js'`);
  await click('#compare');
  await until(`document.getElementById('diff-position').textContent === '1 of 1'`);
  await evaluate(`document.querySelector('.pane').scrollLeft = 600, true`);
  check('sideways: both panes', await until(`document.querySelectorAll('.pane')[1].scrollLeft === 600`), true);
  check(
    'sideways: line numbers stay at the edge',
    await evaluate(`(() => { const pane = document.querySelector('.pane'); const ln = pane.querySelector('.ln'); return Math.abs(ln.getBoundingClientRect().left - pane.getBoundingClientRect().left) < 2; })()`),
    true,
  );

  // Two files dropped on the window at once
  await click('#home');
  await until(`!document.getElementById('start').hidden`);
  await evaluate(`(() => {
    const data = new DataTransfer();
    data.items.add(new File(['one\\ntwo\\n'], 'first.txt', { type: 'text/plain' }));
    data.items.add(new File(['one\\nTWO\\n'], 'second.txt', { type: 'text/plain' }));
    document.querySelector('.slot[data-side="left"]').dispatchEvent(new DragEvent('drop', { dataTransfer: data, bubbles: true, cancelable: true }));
    return true;
  })()`);
  check('dropped: compared at once', await until(`!document.getElementById('file').hidden && document.getElementById('diff-position').textContent === '1 of 1'`), true);
  check('dropped: both names', await texts('.file-head .path'), ['first.txt', 'second.txt']);

  // A large file: only the rows in sight are in the page
  const big = (change) => Array.from({ length: 60000 }, (_, i) => (i === 30000 && change ? `const changed${i} = ${i};` : `const value${i} = compute(${i}); // line ${i}`)).join('\n');
  await writeTree('big', { 'a.js': big(false), 'b.js': big(true) });
  await click('#home');
  await until(`!document.getElementById('start').hidden`);
  await evaluate(`window.__pick.push('big/a.js', 'big/b.js'), true`);
  await click('[data-pick="file"][data-side="left"]');
  await until(`document.querySelector('.slot[data-side="left"] .slot-name').textContent === 'a.js'`);
  await click('[data-pick="file"][data-side="right"]');
  await until(`document.querySelector('.slot[data-side="right"] .slot-name').textContent === 'b.js'`);
  const started = Date.now();
  await click('#compare');
  check('large file: opened', await until(`document.getElementById('diff-position').textContent === '1 of 1'`, 20000), true);
  check('large file: in reasonable time', Date.now() - started < 8000, true);
  check('large file: few rows in the page', await evaluate(`document.querySelectorAll('.pane:first-child .r').length < 150`), true);
  check('large file: the change in sight', await evaluate(`[...document.querySelectorAll('.pane:last-child .r.ins .ln')].map((n) => n.textContent)`), ['30001']);

  // A phone, with the layout left to the page
  await click('#view-options');
  await evaluate(`(() => { const s = document.querySelector('.popover select'); s.value = 'auto'; s.dispatchEvent(new Event('change')); return true; })()`);
  await press('Escape');
  await viewport(390, 844, true);
  await click('#home');
  await until(`!document.getElementById('start').hidden`);
  await shot('8-phone-start');
  await evaluate(`history.back(), true`);
  await until(`!document.getElementById('file').hidden`);
  check('phone: one under the other', await until(`document.querySelectorAll('.pane').length === 1`), true);
  await shot('8b-phone-text');
  await chrome.send('Emulation.clearDeviceMetricsOverride', {}, s);

  await sleep(100);
  check('no errors in the page', chrome.errors, []);
} finally {
  await chrome.close();
  server.close();
}

done('app');
