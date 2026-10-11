/**
 * HTML Merge: the start screen, the comparison of two folders, and moving
 * between the screens — start, the folder list, a file pair.
 *
 * Everything is read-only. Folders are read into trees (sources.ts), merged
 * (core/folder.ts) and their files compared a few at a time in the
 * background, the list filling in as results come. The browser's Back button
 * moves between the screens, as do Escape and the crumbs in the top bar.
 */

import { aggregate, contentStatus, excluder, files, mergeTrees, quickStatus, type Entry, type Item, type Status } from '../core/folder';
import { formatDate, formatNumber } from '../core/format';
import { setLanguage, t, translatePage } from '../core/i18n';
import { bytesEqual } from '../core/text';
import { FileScreen, type FileTarget } from './filescreen';
import { FolderView } from './folderview';
import { forget, listRecent, remember, sourceOf, type Recent } from './recent';
import { applyText, applyTheme, loadSettings, resolveLanguage, saveSettings, type Settings } from './settings';
import { openHelp, openSettings, showUpdateState, type Change } from './settingsview';
import { canRescan, ensureAccess, hasDirectoryPicker, openEntry, pickDirectory, pickFile, readEntry, scan, sourcesFromDrop, type SideName, type Source } from './sources';
import { $, dialogOpen, escapeHtml, h, icon, iconHtml, toast } from './ui';
import { applyUpdate, justUpdated, startUpdates, type UpdateState } from './update';

type Screen = 'start' | 'folders' | 'file';

interface Session {
  left: Source;
  right: Source;
  kind: 'dir' | 'file';
  root: Item | null;
}

const settings: Settings = loadSettings();
const picked: Record<SideName, Source | null> = { left: null, right: null };
let session: Session | null = null;
let screen: Screen = 'start';
/** Bumped by every new read or comparison: work of an older one stops when it sees the change. */
let generation = 0;
/** The compare options changed on the file screen: the folder list is compared again on the way back. */
let staleStatuses = false;
/** The folders are being read: a comparison asked for now would be thrown away; the scan compares when it is done. */
let scanning = false;

setLanguage(resolveLanguage(settings.language));
applyTheme(settings.theme);
applyText(settings);
translatePage();
$('#version').textContent = __APP_VERSION__;

const folderView = new FolderView(settings, {
  open: (item) => void openItem(item, 'push'),
  refresh: () => void refresh(),
  changed: () => saveSettings(settings),
});

const fileScreen: FileScreen = new FileScreen(settings, {
  changed: (what) => {
    if (what === 'compare') staleStatuses = true;
  },
  step: (direction) => step(direction),
  canStep: (): boolean => !!session?.root && !!fileScreen.item,
  back: () => {
    if (session?.root) history.back();
  },
});

/* ------------------------------------------------------------------ *
 * Screens and the top bar
 * ------------------------------------------------------------------ */

function show(next: Screen, mode: 'push' | 'replace' | 'none' = 'push'): void {
  screen = next;
  $('#start').hidden = next !== 'start';
  $('#folders').hidden = next !== 'folders';
  $('#file').hidden = next !== 'file';
  if (mode === 'push') history.pushState({ screen: next }, '');
  else if (mode === 'replace') history.replaceState({ screen: next }, '');
  renderCrumbs();
  if (next === 'folders') {
    if (staleStatuses) {
      staleStatuses = false;
      compareAgain();
    }
    folderView.focus();
  }
}

addEventListener('popstate', (event) => {
  let target = ((event.state as { screen?: Screen } | null)?.screen ?? 'start') as Screen;
  if (target === 'file' && !fileScreen.isOpen) target = session?.root ? 'folders' : 'start';
  if (target === 'folders' && !session?.root) target = 'start';
  show(target, 'none');
});

function renderCrumbs(): void {
  const crumbs = $('#crumbs');
  crumbs.replaceChildren();
  document.title = 'HTML Merge';
  if (!session || screen === 'start') return;
  const pair = (): Element[] => [h('span', { text: session?.left.name ?? '' }), icon('pair'), h('span', { text: session?.right.name ?? '' })];
  document.title = `${session.left.name} ↔ ${session.right.name} — HTML Merge`;
  if (screen === 'file' && session.root && fileScreen.item) {
    const back = h('button', { class: 'crumb crumb-pair', type: 'button', title: t('topbar', 'Back to the folder list') }, ...pair());
    back.addEventListener('click', () => history.back());
    crumbs.append(back, h('span', { class: 'crumb-sep', text: '›' }), h('span', { class: 'crumb crumb--current', text: fileScreen.item.path, title: fileScreen.item.path }));
    return;
  }
  crumbs.append(h('span', { class: 'crumb crumb--current crumb-pair' }, ...pair()));
}

$('#home').addEventListener('click', () => {
  if (screen !== 'start') show('start');
});

/* ------------------------------------------------------------------ *
 * The start screen
 * ------------------------------------------------------------------ */

const dirInput = $<HTMLInputElement>('#dir-input');
const fileInput = $<HTMLInputElement>('#file-input');

function renderSlots(): void {
  for (const side of ['left', 'right'] as const) {
    const slot = $(`.slot[data-side="${side}"]`);
    const source = picked[side];
    slot.classList.toggle('slot--filled', !!source);
    $('.slot-name', slot).textContent = source ? source.name : t('start', 'Nothing chosen');
    $('.slot-name', slot).title = source?.name ?? '';
    $('.slot-icon', slot).replaceChildren(...(source ? [icon(source.kind === 'dir' ? 'folder' : 'file')] : []));
  }
  const { left, right } = picked;
  const mixed = !!left && !!right && left.kind !== right.kind;
  $<HTMLButtonElement>('#compare').disabled = !left || !right || mixed;
  const note = $('#start-note');
  if (mixed) note.textContent = t('start', 'A folder cannot be compared with a file: pick two folders or two files.');
  else if (!hasDirectoryPicker() && !('webkitdirectory' in dirInput)) note.textContent = t('start', 'This browser cannot open folders; files can still be compared.');
  else note.textContent = '';
  note.hidden = !note.textContent;
}

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-pick]')) {
  button.addEventListener('click', async () => {
    const side = button.dataset['side'] as SideName;
    try {
      const source = button.dataset['pick'] === 'dir' ? await pickDirectory(side, dirInput) : await pickFile(side, fileInput);
      if (!source) return;
      picked[side] = source;
      renderSlots();
    } catch (error) {
      toast((error as Error).message, 'error');
    }
  });
}

$('#swap').addEventListener('click', () => {
  [picked.left, picked.right] = [picked.right, picked.left];
  renderSlots();
});

$('#compare').addEventListener('click', () => {
  if (picked.left && picked.right) void startCompare(picked.left, picked.right);
});

async function renderRecent(): Promise<void> {
  const list = await listRecent();
  const box = $('#recent');
  const ul = $('#recent-list');
  ul.replaceChildren();
  box.hidden = !list.length;
  for (const item of list) ul.append(recentRow(item));
}

function recentRow(item: Recent): HTMLElement {
  const open = h('button', { class: 'recent-open', type: 'button' });
  open.innerHTML =
    `<span class="kind">${iconHtml(item.left.kind === 'dir' ? 'folder' : 'file')}</span>` +
    `<span class="recent-names"><b>${escapeHtml(item.left.name)}</b><span class="recent-arrow">↔</span><b>${escapeHtml(item.right.name)}</b></span>` +
    `<span class="recent-when">${escapeHtml(formatDate(item.at))}</span>`;
  open.addEventListener('click', () => {
    picked.left = sourceOf(item.left);
    picked.right = sourceOf(item.right);
    renderSlots();
    void startCompare(picked.left, picked.right);
  });
  const remove = h('button', { class: 'icon-button', type: 'button', title: t('start', 'Forget'), 'aria-label': t('start', 'Forget') }, icon('close'));
  remove.addEventListener('click', async () => {
    await forget(item.id);
    await renderRecent();
  });
  return h('li', { class: 'recent-item' }, open, remove);
}

/* ------------------------------------------------------------------ *
 * Comparing
 * ------------------------------------------------------------------ */

async function startCompare(left: Source, right: Source): Promise<void> {
  if (left.kind !== right.kind) {
    toast(t('toast', 'Pick two folders or two files.'), 'error');
    return;
  }
  // Asked one after the other, in the same click; a remembered pair may need both.
  for (const source of [left, right]) {
    if (!(await ensureAccess(source))) {
      toast(t('toast', 'No permission to read “{name}”. Press Compare to ask again.', { name: source.name }), 'error');
      return;
    }
  }
  void remember(left, right).then(renderRecent);
  session = { left, right, kind: left.kind, root: null };
  staleStatuses = false;
  fileScreen.close();
  if (left.kind === 'file') {
    show('file');
    await openPair();
  } else {
    folderView.reset();
    show('folders');
    await scanAndCompare(false);
  }
}

/** Two files picked on their own: compared at once. */
async function openPair(): Promise<void> {
  if (!session) return;
  const ticket = ++generation;
  try {
    const cancelled = (): boolean => ticket !== generation;
    const [left, right] = await Promise.all([scan(session.left, () => false, () => undefined, cancelled), scan(session.right, () => false, () => undefined, cancelled)]);
    if (ticket !== generation) return;
    await fileScreen.open({ leftName: session.left.name, rightName: session.right.name, left, right });
    renderCrumbs();
  } catch (error) {
    toast(t('toast', 'Could not read the files: {error}', { error: (error as Error).message }), 'error');
  }
}

/** The files compared again under new options, without reading the folders again. */
function compareAgain(): void {
  if (session?.root && !scanning) void compareContents(session.root, ++generation);
}

/**
 * Reads both folders, merges them and compares their files. `merged` runs
 * as soon as the new tree is there, before the files are compared.
 */
async function scanAndCompare(keep: boolean, merged?: (root: Item) => void): Promise<void> {
  if (!session) return;
  const current = session;
  const ticket = ++generation;
  const cancelled = (): boolean => ticket !== generation;
  scanning = true;
  const counts = [0, 0];
  const report = (): void => folderView.setBusy(t('folder', 'Reading the folders… {count} files', { count: formatNumber(counts[0]! + counts[1]!) }));
  report();
  try {
    const exclude = excluder(settings.exclude);
    const [left, right] = await Promise.all([
      scan(current.left, exclude, (n) => ((counts[0] = n), report()), cancelled),
      scan(current.right, exclude, (n) => ((counts[1] = n), report()), cancelled),
    ]);
    if (cancelled()) return;
    scanning = false;
    const root = mergeTrees(left, right, settings.ignoreNameCase);
    current.root = root;
    folderView.setBusy(null);
    folderView.setRoot(root, keep);
    // The open file belongs to the new tree now: stepping to the next one counts from it.
    const open = fileScreen.item && files(root).find((item) => item.path === fileScreen.item?.path);
    if (open) fileScreen.retarget(open);
    merged?.(root);
    await compareContents(root, ticket);
  } catch (error) {
    if (cancelled() || (error as Error).name === 'AbortError') return;
    scanning = false;
    folderView.setBusy(null);
    toast(t('toast', 'Could not read the folders: {error}', { error: (error as Error).message }), 'error');
  }
}

/** Past this size two files are compared byte by byte, a piece at a time, never as text. */
const LARGE = 64 * 1024 * 1024;
const PIECE = 4 * 1024 * 1024;
/** Files this big are read one pair at a time, so six workers do not hold six pairs of them at once. */
const BIG = 8 * 1024 * 1024;
let bigTurn: Promise<unknown> = Promise.resolve();

function compareFiles(left: Entry, right: Entry): Promise<{ status: Status; note?: string }> {
  if (Math.max(left.size, right.size) < BIG) return compareNow(left, right);
  const turn = bigTurn.then(() => compareNow(left, right));
  bigTurn = turn.catch(() => undefined);
  return turn;
}

async function compareNow(left: Entry, right: Entry): Promise<{ status: Status; note?: string }> {
  if (left.size > LARGE || right.size > LARGE) {
    if (left.size !== right.size) return { status: 'different' };
    const [a, b] = await Promise.all([openEntry(left), openEntry(right)]);
    for (let at = 0; at < a.size; at += PIECE) {
      const [x, y] = await Promise.all([a.slice(at, at + PIECE).arrayBuffer(), b.slice(at, at + PIECE).arrayBuffer()]);
      if (!bytesEqual(new Uint8Array(x), new Uint8Array(y))) return { status: 'different' };
    }
    return { status: 'same' };
  }
  const [a, b] = await Promise.all([readEntry(left), readEntry(right)]);
  return contentStatus(a, b, settings.compare);
}

/** Decides every file on both sides, from sizes where they are enough and from contents where not. */
async function compareContents(root: Item, ticket: number): Promise<void> {
  const pairs = files(root).filter((item) => item.left && item.right);
  const queue: Item[] = [];
  for (const item of pairs) {
    item.note = undefined;
    const quick = quickStatus(item.left as Entry, item.right as Entry, settings.method, settings.compare);
    item.status = quick ?? 'pending';
    if (!quick) queue.push(item);
  }
  let done = pairs.length - queue.length;
  const flush = (): void => {
    aggregate(root);
    folderView.setProgress(done, pairs.length);
    folderView.refreshRows();
  };
  flush();
  let timer = 0;
  const worker = async (): Promise<void> => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      if (ticket !== generation) return;
      try {
        const result = await compareFiles(item.left as Entry, item.right as Entry);
        // A newer comparison has set this item already.
        if (ticket !== generation) return;
        item.status = result.status;
        item.note = result.note;
      } catch (error) {
        if (ticket !== generation) return;
        item.status = 'error';
        item.note = (error as Error).message;
      }
      done += 1;
      if (!timer) {
        timer = window.setTimeout(() => {
          timer = 0;
          if (ticket === generation) flush();
        }, 150);
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  window.clearTimeout(timer);
  if (ticket === generation) flush();
}

async function refresh(): Promise<void> {
  if (!session) return;
  if (session.kind === 'file') {
    await openPair();
    return;
  }
  if (!canRescan(session.left) || !canRescan(session.right)) toast(t('toast', 'Files added or removed since are seen only when the folders are picked again.'));
  const path = screen === 'file' ? fileScreen.item?.path : undefined;
  await scanAndCompare(true, (root) => {
    // Read again at once, as long as the user is still looking at it.
    if (!path || screen !== 'file' || fileScreen.item?.path !== path) return;
    const item = files(root).find((candidate) => candidate.path === path);
    if (item) void openItem(item, 'none');
  });
}

/* ------------------------------------------------------------------ *
 * A file of the folder comparison
 * ------------------------------------------------------------------ */

async function openItem(item: Item, mode: 'push' | 'replace' | 'none'): Promise<void> {
  if (item.kind !== 'file' || !session) return;
  const target: FileTarget = { leftName: item.path, rightName: item.path, left: item.left ?? null, right: item.right ?? null, item };
  folderView.selectPath(item.path);
  const opening = fileScreen.open(target);
  if (screen !== 'file' || mode !== 'none') show('file', screen === 'file' ? 'replace' : mode);
  else renderCrumbs();
  await opening;
}

const DIFFERENT: ReadonlySet<Status> = new Set<Status>(['different', 'left', 'right', 'error']);

/** The next or previous file that is not the same on both sides, in the tree's order. */
function step(direction: 1 | -1): void {
  if (!session?.root) return;
  const all = files(session.root);
  const path = fileScreen.item?.path;
  const from = path ? all.findIndex((item) => item.path === path) : -1;
  for (let i = from + direction; i >= 0 && i < all.length; i += direction) {
    const item = all[i] as Item;
    if (DIFFERENT.has(item.status)) {
      void openItem(item, 'replace');
      return;
    }
  }
  toast(direction > 0 ? t('toast', 'No more different files after this one.') : t('toast', 'No different files before this one.'));
}

/* ------------------------------------------------------------------ *
 * Dropping folders and files
 * ------------------------------------------------------------------ */

const veil = $('#drop-veil');
let dragDepth = 0;
const carriesFiles = (event: DragEvent): boolean => !!event.dataTransfer && Array.from(event.dataTransfer.types).includes('Files');
const slotUnder = (event: DragEvent): HTMLElement | null => (event.target as Element | null)?.closest?.<HTMLElement>('.slot') ?? null;

addEventListener('dragenter', (event) => {
  if (!carriesFiles(event)) return;
  dragDepth += 1;
  veil.hidden = screen === 'start';
});
addEventListener('dragover', (event) => {
  if (!carriesFiles(event)) return;
  event.preventDefault();
  const over = slotUnder(event);
  for (const slot of document.querySelectorAll('.slot')) slot.classList.toggle('slot--over', slot === over);
});
addEventListener('dragleave', (event) => {
  if (!carriesFiles(event)) return;
  dragDepth = Math.max(0, dragDepth - 1);
  if (!dragDepth) {
    veil.hidden = true;
    for (const slot of document.querySelectorAll('.slot')) slot.classList.remove('slot--over');
  }
});
addEventListener('drop', async (event) => {
  if (!carriesFiles(event) || !event.dataTransfer) return;
  event.preventDefault();
  dragDepth = 0;
  veil.hidden = true;
  for (const slot of document.querySelectorAll('.slot')) slot.classList.remove('slot--over');
  const side = (slotUnder(event)?.dataset['side'] as SideName | undefined) ?? null;
  const sources = await sourcesFromDrop(event.dataTransfer);
  if (!sources.length) return;
  if (sources.length >= 2) {
    const [first, second] = side === 'right' ? [sources[1], sources[0]] : [sources[0], sources[1]];
    picked.left = first ?? null;
    picked.right = second ?? null;
    renderSlots();
    if (picked.left && picked.right && picked.left.kind === picked.right.kind) void startCompare(picked.left, picked.right);
    return;
  }
  if (screen !== 'start') {
    toast(t('toast', 'Drop two folders or two files at once to compare them.'));
    return;
  }
  const target = side ?? (picked.left ? 'right' : 'left');
  picked[target] = sources[0] ?? null;
  renderSlots();
});

/* ------------------------------------------------------------------ *
 * Settings, help, keys
 * ------------------------------------------------------------------ */

let pendingCompare = false;
let pendingRescan = false;

function settingsChanged(what: Change): void {
  saveSettings(settings);
  if (what === 'language') {
    setLanguage(resolveLanguage(settings.language));
    translatePage();
    renderSlots();
    renderCrumbs();
    void renderRecent();
    folderView.refreshRows();
    fileScreen.retranslate();
    showUpdate(lastUpdate);
    // The dialog itself, in the new language.
    openSettings(settings, settingsChanged, settingsClosed);
  } else if (what === 'theme') applyTheme(settings.theme);
  else if (what === 'compare') pendingCompare = true;
  else if (what === 'folders') pendingRescan = true;
  else if (what === 'text') applyText(settings);
  if (what === 'text' || what === 'view' || what === 'compare') fileScreen.update(settings);
}

function settingsClosed(): void {
  // A rescan is wanted even while the first one runs: it may be slow because of a folder now left out.
  if (pendingRescan && session?.kind === 'dir') void scanAndCompare(!!session.root);
  else if (pendingCompare && session?.root) {
    if (screen === 'folders') compareAgain();
    else staleStatuses = true;
  }
  pendingCompare = pendingRescan = false;
}

$('#settings').addEventListener('click', () => openSettings(settings, settingsChanged, settingsClosed));
$('#help').addEventListener('click', openHelp);

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(settings.theme));
addEventListener('resize', () => fileScreen.relayout());

document.addEventListener('keydown', (event) => {
  if (dialogOpen()) return;
  const target = event.target as HTMLElement;
  const typing = target.matches('input, textarea, select');
  const mod = event.metaKey || event.ctrlKey;
  if (event.key === 'F5' && !mod && session && screen !== 'start') {
    event.preventDefault();
    void refresh();
    return;
  }
  if (screen === 'folders') {
    if (mod && !event.altKey && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      $<HTMLInputElement>('#folder-filter').focus();
      return;
    }
    if (!typing && folderView.key(event)) {
      event.preventDefault();
      return;
    }
  } else if (screen === 'file') {
    if (fileScreen.key(event, typing)) {
      event.preventDefault();
      return;
    }
  }
  if (!typing && !mod && event.key === '?') {
    event.preventDefault();
    openHelp();
  }
});

/* ------------------------------------------------------------------ *
 * Updates of the installed app
 * ------------------------------------------------------------------ */

let lastUpdate: UpdateState = { kind: 'idle' };

function showUpdate(state: UpdateState): void {
  lastUpdate = state;
  $('#settings').classList.toggle('icon-button--badge', state.kind === 'ready');
  const line = $('#start-update');
  line.hidden = state.kind !== 'ready';
  if (state.kind === 'ready') {
    const button = h('button', { class: 'link-button', type: 'button', text: t('settings', 'Update') });
    button.addEventListener('click', applyUpdate);
    line.replaceChildren(state.version ? t('settings', 'Version {version} is ready.', { version: state.version }) : t('settings', 'A new version is ready.'), ' ', button);
  }
  showUpdateState(state);
}

startUpdates(showUpdate);
if (justUpdated()) toast(t('toast', 'Updated to version {version}.', { version: __APP_VERSION__ }));

history.replaceState({ screen: 'start' }, '');
renderSlots();
void renderRecent();
