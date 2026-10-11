/**
 * The file screen: the toolbar, the two headings and the status line around
 * whatever shows the pair — the text comparison, two pictures, or the bytes of
 * two binary files.
 */

import type { Entry, Item } from '../core/folder';
import { formatNumber, formatSize } from '../core/format';
import { GRAMMARS } from '../core/languages';
import { t, tn } from '../core/i18n';
import { bytesEqual, isBinary, isImageName, readText, type TextFile } from '../core/text';
import { DiffView, type DiffState } from './diffview';
import { showBinary, showImages } from './mediaview';
import { isUnified, saveSettings, type Settings } from './settings';
import { compareControls, inlineControl, layoutControl, type Change } from './settingsview';
import { readEntry } from './sources';
import { $, checkbox, closePopover, h, popover, row, select } from './ui';

export interface FileTarget {
  /** The path shown for each side. */
  leftName: string;
  rightName: string;
  left: Entry | null;
  right: Entry | null;
  /** The folder comparison's item, when the pair came from one. */
  item?: Item;
}

/** Larger files are compared in the folder list but not opened: a page cannot hold their text. */
const SHOW_LIMIT = 48 * 1024 * 1024;

export interface FileEvents {
  /** Settings changed here; `compare` when the options that decide "same" did. */
  changed(what: Change): void;
  /** Moves to the next or previous different file of the folder comparison. */
  step(direction: 1 | -1): void;
  canStep(): boolean;
  back(): void;
}

export class FileScreen {
  private target: FileTarget | null = null;
  private diff: DiffView | null = null;
  private cleanup: (() => void) | null = null;
  private bytes: [Uint8Array | null, Uint8Array | null] = [null, null];
  private texts: [TextFile | null, TextFile | null] = [null, null];
  private opening = 0;
  private findTimer = 0;
  private readonly body = $('#file-body');
  private readonly heads = $('#file-heads');
  private readonly status = $('#file-status');
  private readonly position = $('#diff-position');
  private readonly find = $<HTMLInputElement>('#find');
  private readonly findCount = $('#find-count');

  constructor(
    private settings: Settings,
    private readonly events: FileEvents,
  ) {
    $('#next-diff').addEventListener('click', () => this.diff?.next());
    $('#prev-diff').addEventListener('click', () => this.diff?.previous());
    $('#first-diff').addEventListener('click', () => this.diff?.first());
    $('#last-diff').addEventListener('click', () => this.diff?.last());
    $('#next-file').addEventListener('click', () => this.events.step(1));
    $('#prev-file').addEventListener('click', () => this.events.step(-1));
    $('#view-split').addEventListener('click', () => {
      this.settings.layout = isUnified(this.settings) ? 'split' : 'unified';
      this.apply('view');
    });
    $('#view-fold').addEventListener('click', () => {
      this.settings.fold = !this.settings.fold;
      this.apply('view');
    });
    $('#view-options').addEventListener('click', (event) => this.options(event.currentTarget as HTMLElement));
    this.find.addEventListener('input', () => {
      window.clearTimeout(this.findTimer);
      this.findTimer = window.setTimeout(() => this.diff?.find(this.find.value), 150);
    });
    this.find.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        window.clearTimeout(this.findTimer);
        if (this.diff && this.find.value && this.diff.state().hits === 0) this.diff.find(this.find.value);
        else this.diff?.findNext(event.shiftKey ? -1 : 1);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.find.value = '';
        this.diff?.find('');
        this.focusPane();
      }
    });
  }

  get isOpen(): boolean {
    return this.target !== null;
  }

  get item(): Item | undefined {
    return this.target?.item;
  }

  /** The same file in a newer tree of the folder comparison. */
  retarget(item: Item): void {
    if (this.target?.item?.path === item.path) this.target.item = item;
  }

  /** Reads the pair and shows it; a newer call wins over one still reading. */
  async open(target: FileTarget): Promise<void> {
    const ticket = ++this.opening;
    this.target = target;
    this.teardown();
    this.bytes = [null, null];
    this.texts = [null, null];
    this.renderHeads(null);
    this.body.replaceChildren(h('p', { class: 'file-message', text: t('file', 'Reading…') }));
    this.status.textContent = '';
    this.position.textContent = '';
    this.setTools(false);
    if (Math.max(target.left?.size ?? 0, target.right?.size ?? 0) > SHOW_LIMIT) {
      const status = target.item?.status;
      const verdict = status === 'same' ? t('file', 'The files are identical') : status === 'different' ? t('file', 'The files are different') : '';
      this.body.replaceChildren(
        h('p', { class: 'file-message' }, h('strong', { text: t('file', 'Too large to show') }), t('file', 'Files over {size} are compared, but not shown.', { size: formatSize(SHOW_LIMIT) }), verdict ? ` ${verdict}` : ''),
      );
      return;
    }
    let bytes: [Uint8Array | null, Uint8Array | null];
    try {
      bytes = await Promise.all([target.left ? readEntry(target.left) : null, target.right ? readEntry(target.right) : null]);
    } catch (error) {
      if (ticket !== this.opening) return;
      this.body.replaceChildren(h('p', { class: 'file-message' }, h('strong', { text: t('file', 'The file could not be read') }), (error as Error).message));
      return;
    }
    if (ticket !== this.opening) return;
    this.bytes = bytes;
    try {
      this.show();
    } catch (error) {
      this.teardown();
      this.body.replaceChildren(h('p', { class: 'file-message' }, h('strong', { text: t('file', 'The file could not be read') }), (error as Error).message));
    }
  }

  private show(): void {
    const target = this.target;
    if (!target) return;
    this.teardown();
    const [a, b] = this.bytes;
    const name = (target.left ? target.leftName : target.rightName).split('/').pop() ?? '';
    const media = { left: { name: target.leftName, bytes: a }, right: { name: target.rightName, bytes: b } };
    if (isImageName(name)) {
      this.texts = [null, null];
      this.cleanup = showImages(this.body, media.left, media.right);
      this.renderHeads(null);
      this.status.textContent = '';
      this.setTools(false);
      return;
    }
    if ((a && isBinary(a)) || (b && isBinary(b))) {
      this.texts = [null, null];
      showBinary(this.body, media.left, media.right);
      this.renderHeads(null);
      this.status.textContent = '';
      this.setTools(false);
      return;
    }
    this.texts = [a ? readText(a) : null, b ? readText(b) : null];
    this.diff = new DiffView(this.body, { name: target.leftName, file: this.texts[0] }, { name: target.rightName, file: this.texts[1] }, this.settings, (state) =>
      this.onState(state),
    );
    this.renderHeads(this.texts);
    this.setTools(true);
    if (this.find.value) this.diff.find(this.find.value, false);
    this.diff.start(true);
  }

  private teardown(): void {
    closePopover();
    this.diff?.destroy();
    this.diff = null;
    this.cleanup?.();
    this.cleanup = null;
  }

  close(): void {
    this.opening += 1;
    this.teardown();
    this.target = null;
    this.bytes = [null, null];
    this.texts = [null, null];
    this.body.replaceChildren();
  }

  private setTools(text: boolean): void {
    for (const id of ['#next-diff', '#prev-diff', '#first-diff', '#last-diff', '#view-split', '#view-fold']) $<HTMLButtonElement>(id).disabled = !text;
    this.find.disabled = !text;
    const stepping = this.events.canStep();
    $('#file-nav-files').hidden = !stepping;
    $('#view-split').setAttribute('aria-pressed', String(!isUnified(this.settings)));
    $('#view-fold').setAttribute('aria-pressed', String(this.settings.fold));
    if (!text) this.findCount.textContent = '';
  }

  private renderHeads(texts: [TextFile | null, TextFile | null] | null): void {
    const target = this.target;
    if (!target) return;
    const head = (side: 'left' | 'right', name: string, present: boolean, file: TextFile | null): HTMLElement => {
      const info = h('span', { class: 'info' });
      if (file) {
        const parts = [file.encoding, file.eol, tn('file', '{count} line', '{count} lines', file.lines.length, { count: formatNumber(file.lines.length) })].filter(Boolean);
        info.textContent = parts.join(' · ');
      }
      return h(
        'div',
        { class: `file-head file-head--${side}` },
        h('span', { class: 'side', text: side === 'left' ? t('file', 'Left') : t('file', 'Right') }),
        present ? h('span', { class: 'path', text: name, title: name }) : h('span', { class: 'missing', text: t('file', 'No file on this side') }),
        info,
      );
    };
    this.heads.replaceChildren(head('left', target.leftName, !!target.left, texts?.[0] ?? null), head('right', target.rightName, !!target.right, texts?.[1] ?? null));
  }

  private onState(state: DiffState): void {
    const disabled = state.differences === 0;
    for (const id of ['#next-diff', '#prev-diff', '#first-diff', '#last-diff']) $<HTMLButtonElement>(id).disabled = disabled;
    if (state.differences === 0) this.position.textContent = t('file', 'No differences');
    else if (state.current) this.position.textContent = t('file', '{current} of {count}', { current: formatNumber(state.current), count: formatNumber(state.differences) });
    else this.position.textContent = tn('file', '{count} difference', '{count} differences', state.differences, { count: formatNumber(state.differences) });
    this.findCount.textContent = this.find.value ? (state.hits ? `${formatNumber(state.hit)}/${formatNumber(state.hits)}` : t('file', 'no matches')) : '';
    $('#view-split').setAttribute('aria-pressed', String(!isUnified(this.settings)));
    $('#view-fold').setAttribute('aria-pressed', String(this.settings.fold));
    this.renderStatus(state);
  }

  private renderStatus(state: DiffState): void {
    const parts = [state.grammar.id === 'plain' ? t('file', 'Plain text') : state.grammar.name];
    const [a, b] = this.bytes;
    if (!a || !b) parts.push(a ? t('file', 'Only on the left') : t('file', 'Only on the right'));
    else if (bytesEqual(a, b)) parts.push(t('file', 'The files are identical'));
    else if (state.differences === 0) {
      parts.push(this.diff?.onlyEndingsDiffer() ? t('file', 'Only the line endings differ') : t('file', 'No differences under the compare options'));
    } else parts.push(this.diff?.summary() ?? '');
    this.status.textContent = parts.filter(Boolean).join(' · ');
  }

  private apply(what: Change): void {
    saveSettings(this.settings);
    this.diff?.update(this.settings);
    this.events.changed(what);
  }

  /** The settings dialog changed something. */
  update(settings: Settings): void {
    this.settings = settings;
    this.diff?.update(settings);
    if (this.diff) this.setTools(true);
  }

  relayout(): void {
    this.diff?.relayout();
  }

  private options(anchor: HTMLElement): void {
    popover(anchor, (node) => {
      const changed = (what: Change): void => this.apply(what);
      node.append(h('h3', { text: t('settings', 'View') }), layoutControl(this.settings, changed));
      if (this.diff) {
        const diff = this.diff;
        const auto = t('file', 'Automatic ({language})', { language: diff.state().grammar.name });
        const choices: [string, string][] = [['auto', auto], ...GRAMMARS.map((grammar): [string, string] => [grammar.id, grammar.id === 'plain' ? t('file', 'Plain text') : grammar.name])];
        node.append(row(t('file', 'Syntax'), select(choices, diff.grammarId, (id) => diff.setGrammar(id))));
      }
      node.append(
        checkbox(t('settings', 'Syntax colours'), this.settings.syntax, (value) => {
          this.settings.syntax = value;
          changed('view');
        }),
        checkbox(t('settings', 'Show whitespace and line endings'), this.settings.whitespace, (value) => {
          this.settings.whitespace = value;
          changed('view');
        }),
        inlineControl(this.settings, changed),
        h('h3', { text: t('settings', 'Comparing') }),
        ...compareControls(this.settings, changed),
      );
    });
  }

  focusPane(): void {
    this.body.querySelector<HTMLElement>('.pane')?.focus({ preventScroll: true });
  }

  /** Keys of the file screen; true when one was used. */
  key(event: KeyboardEvent, typing: boolean): boolean {
    const mod = event.metaKey || event.ctrlKey;
    if (mod && !event.altKey && event.key.toLowerCase() === 'f') {
      if (this.find.disabled) return false;
      this.find.focus();
      this.find.select();
      return true;
    }
    if ((event.altKey && event.key === 'ArrowDown') || (event.key === 'F7' && !event.shiftKey)) {
      this.diff?.next();
      return true;
    }
    if ((event.altKey && event.key === 'ArrowUp') || (event.key === 'F7' && event.shiftKey)) {
      this.diff?.previous();
      return true;
    }
    if (typing || mod || event.altKey) return false;
    if (event.key === ']' || event.key === '[') {
      if (!this.events.canStep()) return false;
      this.events.step(event.key === ']' ? 1 : -1);
      return true;
    }
    if (event.key === 'Escape') {
      this.events.back();
      return true;
    }
    return false;
  }

  /** The heads and the status line in a new language. */
  retranslate(): void {
    if (!this.target) return;
    this.renderHeads(this.texts[0] || this.texts[1] ? this.texts : null);
    if (this.diff) this.onState(this.diff.state());
    else if (this.bytes[0] || this.bytes[1]) {
      try {
        this.show();
      } catch {
        /* shown as it was */
      }
    }
  }
}
