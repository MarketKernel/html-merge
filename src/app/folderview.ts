/**
 * The folder comparison: a tree (or a flat list) of every item of both
 * folders, each with its result, sizes and dates; chips that show or hide
 * each kind of result; a name filter; sorting by column.
 *
 * A folder may hold a hundred thousand files, so the list is virtual like
 * the text panes: only the rows in sight are in the DOM.
 */

import { countFiles, folderPaths, listRows, type Counts, type Item, type Shown, type SortKey } from '../core/folder';
import { formatDate, formatNumber, formatSize } from '../core/format';
import { t, tn } from '../core/i18n';
import type { Settings } from './settings';
import { $, escapeHtml, iconHtml, isTouch } from './ui';

export interface FolderEvents {
  open(item: Item): void;
  refresh(): void;
  /** The chips, the flat switch: settings that are kept. */
  changed(): void;
}

const OVERSCAN = 10;

export class FolderView {
  private root: Item | null = null;
  private rows: Item[] = [];
  private selected: string | null = null;
  private expanded = new Set<string>();
  private filter = '';
  private sort: SortKey = 'name';
  private descending = false;
  private rowHeight = 28;
  private frame = 0;
  private painted = '';
  private busy: string | null = null;
  private compared = { done: 0, total: 0 };
  private counts: Counts | null = null;
  private readonly list = $('#folder-list');
  private readonly rowsEl = $('#folder-list .list-rows');
  private readonly sizer = $('#folder-list .list-sizer');
  private readonly empty = $('#folder-empty');
  private readonly status = $('#folder-status');
  private readonly progress = $('#folder-progress');

  constructor(
    private settings: Settings,
    private readonly events: FolderEvents,
  ) {
    this.list.addEventListener('scroll', () => this.schedule(), { passive: true });
    new ResizeObserver(() => {
      this.measure();
      this.invalidate();
    }).observe(this.list);
    this.list.addEventListener('click', (event) => this.onClick(event));
    this.list.addEventListener('dblclick', (event) => {
      const item = this.itemAt(event.target);
      if (item) this.activate(item);
    });
    for (const chip of document.querySelectorAll<HTMLButtonElement>('[data-show]')) {
      chip.addEventListener('click', () => {
        const key = chip.dataset['show'] as keyof Shown;
        this.settings.show[key] = !this.settings.show[key];
        this.events.changed();
        this.refreshRows();
      });
    }
    const filter = $<HTMLInputElement>('#folder-filter');
    filter.addEventListener('input', () => {
      this.filter = filter.value;
      this.refreshRows();
    });
    filter.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'Enter') {
        event.preventDefault();
        this.list.focus();
        if (!this.selected && this.rows[0]) this.select(0);
      } else if (event.key === 'Escape' && filter.value) {
        event.stopPropagation();
        filter.value = '';
        this.filter = '';
        this.refreshRows();
      }
    });
    $('#folder-flat').addEventListener('click', () => {
      this.settings.flat = !this.settings.flat;
      this.events.changed();
      this.refreshRows();
    });
    $('#folder-expand').addEventListener('click', () => {
      if (!this.root) return;
      this.expanded = new Set(folderPaths(this.root));
      this.refreshRows();
    });
    $('#folder-collapse').addEventListener('click', () => {
      this.expanded.clear();
      this.refreshRows();
    });
    $('#folder-refresh').addEventListener('click', () => this.events.refresh());
    for (const column of document.querySelectorAll<HTMLButtonElement>('#folder-head [data-sort]')) {
      column.addEventListener('click', () => {
        const key = column.dataset['sort'] as SortKey;
        if (this.sort === key) this.descending = !this.descending;
        else {
          this.sort = key;
          this.descending = false;
        }
        this.refreshRows();
      });
    }
    this.measure();
  }

  /** A new comparison: everything about the old one goes. */
  reset(): void {
    this.root = null;
    this.rows = [];
    this.selected = null;
    this.expanded.clear();
    this.refreshRows();
  }

  setRoot(root: Item, keepState = false): void {
    this.root = root;
    if (!keepState) {
      this.selected = null;
      this.expanded.clear();
      // A single folder at the top is opened: there is nothing else to look at.
      if (root.children.length === 1 && root.children[0]?.kind === 'dir') this.expanded.add(root.children[0].path);
    }
    this.refreshRows();
  }

  /** Reading the folders: no rows yet, a line saying how far it got. */
  setBusy(text: string | null): void {
    this.busy = text;
    this.renderStatus();
  }

  setProgress(done: number, total: number): void {
    this.progress.hidden = done >= total;
    ($('.progress-bar', this.progress) as HTMLElement).style.width = `${total ? (done / total) * 100 : 0}%`;
    this.compared = { done, total };
    this.renderStatus();
  }

  /** Statuses changed: the rows, the counts and the status line follow. */
  refreshRows(): void {
    const root = this.root;
    this.rows = root
      ? listRows(root, { show: this.settings.show, filter: this.filter, expanded: this.expanded, flat: this.settings.flat, sort: this.sort, descending: this.descending })
      : [];
    this.renderChrome(root ? countFiles(root) : null);
    this.measure();
    this.invalidate();
  }

  private renderChrome(counts: Counts | null): void {
    for (const chip of document.querySelectorAll<HTMLButtonElement>('[data-show]')) {
      const key = chip.dataset['show'] as keyof Shown;
      chip.setAttribute('aria-pressed', String(this.settings.show[key]));
      const count = chip.querySelector('[data-count]');
      if (count) count.textContent = formatNumber(counts?.[key] ?? 0);
    }
    const flat = $('#folder-flat');
    flat.setAttribute('aria-pressed', String(this.settings.flat));
    flat.innerHTML = iconHtml(this.settings.flat ? 'list' : 'tree');
    $<HTMLButtonElement>('#folder-expand').disabled = this.settings.flat;
    $<HTMLButtonElement>('#folder-collapse').disabled = this.settings.flat;
    for (const column of document.querySelectorAll<HTMLElement>('#folder-head [data-sort]')) {
      if (column.dataset['sort'] === this.sort && this.sort !== 'name') column.setAttribute('aria-sort', this.descending ? 'descending' : 'ascending');
      else if (column.dataset['sort'] === 'name' && this.sort === 'name' && this.descending) column.setAttribute('aria-sort', 'descending');
      else column.removeAttribute('aria-sort');
    }
    this.counts = counts;
    this.renderStatus();
    let message = '';
    if (this.root && !this.rows.length && !this.busy) {
      if (!counts || counts.same + counts.different + counts.left + counts.right + counts.error + counts.pending === 0) message = t('folder', 'Both folders are empty.');
      else if (!counts.different && !counts.left && !counts.right && !counts.pending && !counts.error) message = t('folder', 'No differences: the folders are identical.');
      else message = t('folder', 'No files match the filters.');
    }
    this.empty.textContent = message;
    this.empty.hidden = !message;
  }

  private renderStatus(): void {
    if (this.busy) {
      this.status.textContent = this.busy;
      return;
    }
    const counts = this.counts;
    if (!counts) {
      this.status.textContent = '';
      return;
    }
    const files = counts.same + counts.different + counts.left + counts.right + counts.error + counts.pending;
    const parts = [tn('folder', '{count} file', '{count} files', files, { count: formatNumber(files) })];
    if (counts.pending) parts.push(t('folder', 'comparing… {done} of {total}', { done: formatNumber(this.compared.done), total: formatNumber(this.compared.total) }));
    if (counts.error) parts.push(tn('folder', '{count} could not be read', '{count} could not be read', counts.error, { count: formatNumber(counts.error) }));
    this.status.textContent = parts.join(' · ');
  }

  private measure(): void {
    const probe = document.createElement('div');
    probe.className = 'item';
    probe.style.visibility = 'hidden';
    this.rowsEl.append(probe);
    this.rowHeight = probe.getBoundingClientRect().height || 28;
    probe.remove();
    this.sizer.style.height = `${this.rows.length * this.rowHeight}px`;
    // The header's columns line up with the rows' above a vertical scroll bar.
    const bar = this.list.offsetWidth - this.list.clientWidth;
    document.documentElement.style.setProperty('--scrollbar', `${bar}px`);
  }

  private invalidate(): void {
    this.painted = '';
    this.schedule();
  }

  private schedule(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.paint();
    });
  }

  private paint(): void {
    const first = Math.max(0, Math.floor(this.list.scrollTop / this.rowHeight) - OVERSCAN);
    const last = Math.min(this.rows.length, Math.ceil((this.list.scrollTop + this.list.clientHeight) / this.rowHeight) + OVERSCAN);
    const key = `${first}:${last}`;
    if (key === this.painted) return;
    this.painted = key;
    let html = '';
    for (let i = first; i < last; i += 1) html += this.rowHtml(i);
    this.rowsEl.innerHTML = html;
    this.rowsEl.style.transform = `translateY(${first * this.rowHeight}px)`;
  }

  private statusText(item: Item): string {
    switch (item.status) {
      case 'same':
        return item.note === 'text' ? t('status', 'Equal text') : t('status', 'Identical');
      case 'different':
        return t('status', 'Different');
      case 'left':
        return t('status', 'Left only');
      case 'right':
        return t('status', 'Right only');
      case 'error':
        return t('status', 'Error');
      default:
        return t('status', 'Comparing…');
    }
  }

  private rowHtml(index: number): string {
    const item = this.rows[index] as Item;
    const flat = this.settings.flat;
    const depth = flat ? 0 : item.depth;
    const open = this.expanded.has(item.path) || (!!this.filter.trim() && item.kind === 'dir');
    const twisty =
      item.kind === 'dir' && !flat
        ? `<button class="twisty${open ? ' twisty--open' : ''}" type="button" tabindex="-1" data-toggle="1" aria-label="${escapeHtml(open ? t('folder', 'Collapse') : t('folder', 'Expand'))}">${iconHtml('chevron')}</button>`
        : '<span class="twisty"></span>';
    const slash = item.path.lastIndexOf('/');
    const label =
      flat && slash > 0
        ? `<span class="folder-part">${escapeHtml(item.path.slice(0, slash + 1))}</span>${escapeHtml(item.name)}`
        : escapeHtml(item.name);
    const size = (side: 'left' | 'right'): string => {
      const entry = item[side];
      return entry && item.kind === 'file' ? escapeHtml(formatSize(entry.size)) : '';
    };
    const date = (side: 'left' | 'right'): string => {
      const entry = item[side];
      return entry && item.kind === 'file' ? escapeHtml(formatDate(entry.modified)) : '';
    };
    const selected = item.path === this.selected ? ' item--sel' : '';
    const title = item.status === 'error' && item.note ? ` title="${escapeHtml(item.note)}"` : '';
    return (
      `<div class="item st-${item.status} f-${item.kind}${selected}" data-path="${escapeHtml(item.path)}" data-kind="${item.kind}" role="row" aria-level="${depth + 1}"${item.kind === 'dir' ? ` aria-expanded="${open}"` : ''}${title}>` +
      `<span class="item-name" style="padding-inline-start:${6 + depth * 18}px">${twisty}<span class="kind">${iconHtml(item.kind === 'dir' ? 'folder' : 'file')}</span><span class="label">${label}</span></span>` +
      `<span class="item-status"><span class="dot dot--${item.status}"></span>${escapeHtml(this.statusText(item))}</span>` +
      `<span class="num">${size('left')}</span><span class="num">${size('right')}</span>` +
      `<span class="date">${date('left')}</span><span class="date">${date('right')}</span>` +
      `</div>`
    );
  }

  /** By path, not position: while files are compared the rows reorder under the pointer. */
  private itemAt(target: EventTarget | null): Item | null {
    const path = (target as HTMLElement | null)?.closest<HTMLElement>('.item')?.dataset['path'];
    return path === undefined ? null : (this.rows.find((item) => item.path === path) ?? null);
  }

  private onClick(event: MouseEvent): void {
    const item = this.itemAt(event.target);
    if (!item) return;
    this.select(this.rows.indexOf(item), false);
    if ((event.target as HTMLElement).closest('[data-toggle]')) {
      this.toggle(item);
      // The clicked button is gone with the old rows; the keys stay with the list.
      this.list.focus({ preventScroll: true });
      return;
    }
    // A tap on a phone opens at once: there is no double tap to wait for.
    if (isTouch()) this.activate(item);
  }

  private toggle(item: Item, open?: boolean): void {
    if (item.kind !== 'dir' || this.settings.flat) return;
    const now = this.expanded.has(item.path);
    const next = open ?? !now;
    if (next === now) return;
    if (next) this.expanded.add(item.path);
    else this.expanded.delete(item.path);
    this.refreshRows();
  }

  private activate(item: Item): void {
    if (item.kind === 'dir') this.toggle(item);
    else this.events.open(item);
  }

  private select(index: number, scroll = true): void {
    const item = this.rows[index];
    if (!item) return;
    this.selected = item.path;
    if (scroll) {
      const top = index * this.rowHeight;
      if (top < this.list.scrollTop) this.list.scrollTop = top;
      else if (top + this.rowHeight > this.list.scrollTop + this.list.clientHeight) this.list.scrollTop = top + this.rowHeight - this.list.clientHeight;
    }
    this.invalidate();
  }

  /** The selected file, if any: where "next different file" counts from. */
  selectedPath(): string | null {
    return this.selected;
  }

  selectPath(path: string): void {
    // Its folders open, so it can be seen in the tree.
    for (let at = path.indexOf('/'); at > 0; at = path.indexOf('/', at + 1)) this.expanded.add(path.slice(0, at));
    this.refreshRows();
    const index = this.rows.findIndex((item) => item.path === path);
    if (index >= 0) this.select(index);
  }

  focus(): void {
    this.list.focus({ preventScroll: true });
  }

  /** Keys for the list; true when one was used. */
  key(event: KeyboardEvent): boolean {
    if (document.activeElement !== this.list) return false;
    const index = this.rows.findIndex((item) => item.path === this.selected);
    const item = this.rows[index];
    const page = Math.max(1, Math.floor(this.list.clientHeight / this.rowHeight) - 1);
    const rtl = document.documentElement.dir === 'rtl';
    const key = rtl && event.key === 'ArrowLeft' ? 'ArrowRight' : rtl && event.key === 'ArrowRight' ? 'ArrowLeft' : event.key;
    switch (key) {
      case 'ArrowDown':
        this.select(Math.min(this.rows.length - 1, index + 1));
        return true;
      case 'ArrowUp':
        this.select(Math.max(0, index < 0 ? 0 : index - 1));
        return true;
      case 'PageDown':
        this.select(Math.min(this.rows.length - 1, index + page));
        return true;
      case 'PageUp':
        this.select(Math.max(0, index - page));
        return true;
      case 'Home':
        this.select(0);
        return true;
      case 'End':
        this.select(this.rows.length - 1);
        return true;
      case 'ArrowRight':
        if (item?.kind === 'dir') {
          if (!this.expanded.has(item.path)) this.toggle(item, true);
          else this.select(index + 1);
        }
        return true;
      case 'ArrowLeft':
        if (item?.kind === 'dir' && this.expanded.has(item.path)) this.toggle(item, false);
        else if (item?.parent?.path) this.select(this.rows.indexOf(item.parent));
        return true;
      case 'Enter':
      case ' ':
        if (item) this.activate(item);
        return true;
      default:
        return false;
    }
  }
}
