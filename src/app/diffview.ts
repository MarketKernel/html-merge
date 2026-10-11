/**
 * Two texts compared on screen: side by side or one under the other, with
 * syntax colours, the changed words inside changed lines, identical stretches
 * folded on request, a map of the differences beside the scroll bar, and
 * search.
 *
 * Files may have hundreds of thousands of lines, so only the rows in sight
 * (and a few around them) are in the DOM: a sizer gives each pane its full
 * height, and the visible rows are rebuilt as one HTML string on scroll. Two
 * panes scroll together. Text from the files only ever reaches the page
 * escaped.
 */

import { lineKey } from '../core/diff';
import { TOKEN_TYPES, tokenize, type Grammar, type LineTokens } from '../core/highlight';
import { t, tn } from '../core/i18n';
import { inlineDiff, type Range } from '../core/inline';
import { detectGrammar, grammarById } from '../core/languages';
import { buildView, compareTexts, tally, type Comparison, type Row, type View } from '../core/rows';
import { columns, type TextFile } from '../core/text';
import { isUnified, type Settings } from './settings';
import { escapeHtml, h, iconHtml } from './ui';

export interface TextSide {
  /** The path shown above the pane. */
  name: string;
  /** Null when the file is on the other side only. */
  file: TextFile | null;
}

export interface DiffState {
  differences: number;
  /** 1-based position of the current difference among the counted ones; 0 for none. */
  current: number;
  hits: number;
  hit: number;
  grammar: Grammar;
}

/** Past this many characters a line is cut short on screen; the diff still sees all of it. */
const MAX_RENDER = 10_000;
const OVERSCAN = 12;
const MAX_HITS = 20_000;

interface Hit {
  side: 0 | 1;
  line: number;
  row: number;
  start: number;
  end: number;
}

const EMPTY: TextFile = { text: '', lines: [], eols: [], encoding: '', eol: '' };

const EOL_LABEL: Record<string, string> = { '\n': 'LF', '\r\n': 'CRLF', '\r': 'CR' };

export class DiffView {
  readonly root: HTMLElement;
  private readonly files: [TextFile, TextFile];
  private settings: Settings;
  /** The settings as they were when last applied: the live object is changed in place. */
  private applied: Settings;
  private grammar: Grammar;
  private readonly autoGrammar: Grammar;
  private grammarChoice = 'auto';
  private tokens: [LineTokens[] | null, LineTokens[] | null] = [null, null];
  private cmp!: Comparison;
  private view!: View;
  /** The view line of each row, for each side: in the unified view one row may show as two lines. */
  private rowLine: [Int32Array, Int32Array] = [new Int32Array(0), new Int32Array(0)];
  private inline = new Map<Row, { a: Range[]; b: Range[] }>();
  private expanded = new Set<number>();
  private current = -1;
  private hits: Hit[] = [];
  private hitIndex = -1;
  private hitMap: [Map<number, Range[]>, Map<number, Range[]>] = [new Map(), new Map()];
  private query = '';
  private unified = false;
  private panes: HTMLElement[] = [];
  private rowsEls: HTMLElement[] = [];
  private sizers: HTMLElement[] = [];
  private overview!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private viewport!: HTMLElement;
  private lh = 20;
  private charWidth = 8;
  private gutter = 40;
  private maxCols: [number, number] = [0, 0];
  private frame = 0;
  private painted = '';
  private synced = new WeakMap<HTMLElement, { top: number; left: number }>();
  private readonly resize: ResizeObserver;

  constructor(
    host: HTMLElement,
    left: TextSide,
    right: TextSide,
    settings: Settings,
    private readonly onState: (state: DiffState) => void,
  ) {
    this.files = [left.file ?? EMPTY, right.file ?? EMPTY];
    this.settings = settings;
    this.applied = structuredClone(settings);
    const named = left.file ? left.name : right.name;
    const first = (left.file ?? right.file)?.lines[0] ?? '';
    this.grammar = this.autoGrammar = detectGrammar(named.split('/').pop() ?? named, first);
    this.root = h('div', { class: 'diff' });
    host.replaceChildren(this.root);
    this.resize = new ResizeObserver(() => {
      this.painted = '';
      this.drawOverview();
      this.schedule();
    });
    this.resize.observe(this.root);
    this.recompare();
    this.retokenize();
    this.measureColumns();
    this.build();
  }

  /* ---------------------------------------------------------------- *
   * Model
   * ---------------------------------------------------------------- */

  private recompare(): void {
    this.cmp = compareTexts(this.files[0], this.files[1], this.settings.compare);
    this.inline.clear();
    this.current = -1;
    this.expanded.clear();
    this.rebuildView();
  }

  private rebuildView(): void {
    this.unified = isUnified(this.settings);
    this.view = buildView(this.cmp, {
      unified: this.unified,
      collapse: this.settings.fold,
      context: this.settings.context,
      expanded: this.expanded,
    });
    const rows = this.cmp.rows.length;
    const a = new Int32Array(rows).fill(-1);
    const b = new Int32Array(rows).fill(-1);
    this.view.lines.forEach((line, k) => {
      if (line.kind === 'fold') {
        // A folded row points at its fold, as a negative number.
        for (let r = line.start; r < line.end; r += 1) a[r] = b[r] = -2 - k;
        return;
      }
      if (line.part !== 'b' && a[line.row] === -1) a[line.row] = k;
      if (line.part !== 'a' && b[line.row] === -1) b[line.row] = k;
    });
    this.rowLine = [a, b];
    this.mapHits();
  }

  private retokenize(): void {
    const plain = !this.settings.syntax || this.grammar.id === 'plain';
    this.tokens = plain ? [null, null] : [tokenize(this.files[0].lines, this.grammar), tokenize(this.files[1].lines, this.grammar)];
  }

  private measureColumns(): void {
    const widest = (file: TextFile): number => {
      let max = 0;
      for (const line of file.lines) {
        if (line.length <= max) continue;
        max = Math.max(max, Math.min(MAX_RENDER + 20, columns(line, this.settings.tabSize)));
      }
      return max;
    };
    this.maxCols = [widest(this.files[0]), widest(this.files[1])];
  }

  /** Settings changed: redo only what they reach. */
  update(next: Settings): void {
    const before = this.applied;
    this.settings = next;
    this.applied = structuredClone(next);
    const compare = JSON.stringify(before.compare) !== JSON.stringify(next.compare);
    if (compare) this.recompare();
    else if (before.inline !== next.inline) this.inline.clear();
    if (before.syntax !== next.syntax) this.retokenize();
    if (before.tabSize !== next.tabSize) this.measureColumns();
    const layout = isUnified(before) !== isUnified(next);
    const top = this.topRow();
    if (!compare && (layout || before.fold !== next.fold || before.context !== next.context)) this.rebuildView();
    if (layout || compare) {
      this.build();
      if (!compare) this.scrollToRow(top);
    } else {
      this.measure();
      this.drawOverview();
      this.invalidate();
    }
    if (this.query) this.find(this.query, false);
    this.emit();
  }

  /** Narrowing the window may switch an automatic layout. */
  relayout(): void {
    if (isUnified(this.settings) !== this.unified) {
      const row = this.topRow();
      this.rebuildView();
      this.build();
      this.scrollToRow(row);
      if (this.query) this.find(this.query, false);
      this.emit();
    }
  }

  /** The row at the top of the panes, to keep in sight when they are built anew. */
  private topRow(): number {
    for (let k = this.topLine(); k < this.view.lines.length; k += 1) {
      const line = this.view.lines[k];
      if (line?.kind === 'row') return line.row;
      if (line?.kind === 'fold') return line.start;
    }
    return 0;
  }

  private scrollToRow(row: number): void {
    const k = this.rowLine[0][row] ?? -1;
    const line = k <= -2 ? -2 - k : k;
    const pane = this.panes[0];
    if (pane && line >= 0) pane.scrollTop = line * this.lh;
  }

  /** Colours the texts as another language; 'auto' goes back to the one the file name says. */
  setGrammar(id: string): void {
    this.grammarChoice = id;
    this.grammar = id === 'auto' ? this.autoGrammar : (grammarById(id) ?? this.autoGrammar);
    this.retokenize();
    this.invalidate();
    this.emit();
  }

  get grammarId(): string {
    return this.grammarChoice;
  }

  state(): DiffState {
    const counted = this.countedBlocks();
    return {
      differences: this.cmp.differences,
      current: this.current >= 0 ? counted.indexOf(this.current) + 1 : 0,
      hits: this.hits.length,
      hit: this.hitIndex + 1,
      grammar: this.grammar,
    };
  }

  summary(): string {
    if (!this.cmp.differences) return '';
    const { changed, added, removed } = tally(this.cmp);
    const parts: string[] = [];
    if (changed) parts.push(tn('file', '{count} line changed', '{count} lines changed', changed));
    if (added) parts.push(tn('file', '{count} line added', '{count} lines added', added));
    if (removed) parts.push(tn('file', '{count} line removed', '{count} lines removed', removed));
    return parts.join(' · ');
  }

  private emit(): void {
    this.onState(this.state());
  }

  /* ---------------------------------------------------------------- *
   * DOM
   * ---------------------------------------------------------------- */

  private build(): void {
    this.root.className = `diff${this.unified ? ' diff--unified' : ''}`;
    const panes = h('div', { class: 'panes' });
    this.panes = [];
    this.rowsEls = [];
    this.sizers = [];
    for (let side = 0; side < (this.unified ? 1 : 2); side += 1) {
      const rows = h('div', { class: 'rows' });
      const sizer = h('div', { class: 'sizer' }, rows);
      const pane = h('div', { class: 'pane', dir: 'ltr', tabindex: '0', 'aria-label': side ? t('file', 'Right') : t('file', 'Left') }, sizer);
      pane.addEventListener('scroll', () => this.onScroll(pane), { passive: true });
      pane.addEventListener('click', (event) => this.onClick(event));
      panes.append(pane);
      this.panes.push(pane);
      this.rowsEls.push(rows);
      this.sizers.push(sizer);
    }
    this.canvas = h('canvas');
    this.viewport = h('div', { class: 'overview-view' });
    this.overview = h('div', { class: 'overview', title: t('file', 'Map of the differences') }, this.canvas, this.viewport);
    this.bindOverview();
    this.root.replaceChildren(panes, this.overview);
    this.measure();
    this.drawOverview();
    this.invalidate();
  }

  private measure(): void {
    const pane = this.panes[0];
    if (!pane) return;
    const style = getComputedStyle(pane);
    this.lh = parseFloat(style.lineHeight) || 20;
    const probe = h('span', { style: 'position:absolute;visibility:hidden;white-space:pre', text: 'x'.repeat(64) });
    pane.append(probe);
    this.charWidth = probe.getBoundingClientRect().width / 64 || 8;
    probe.remove();
    const digits = Math.max(2, String(Math.max(this.files[0].lines.length, this.files[1].lines.length)).length);
    this.gutter = Math.ceil(digits * this.charWidth * 0.92 + 14);
    const height = `${this.view.lines.length * this.lh}px`;
    const gutters = this.unified ? 2 : 1;
    this.panes.forEach((p, side) => {
      p.style.setProperty('--gutter', `${this.gutter}px`);
      const cols = this.unified ? Math.max(...this.maxCols) : (this.maxCols[side] as number);
      const width = this.gutter * gutters + 24 + cols * this.charWidth + 48;
      const sizer = this.sizers[side] as HTMLElement;
      sizer.style.height = height;
      sizer.style.width = `${Math.ceil(width)}px`;
      (this.rowsEls[side] as HTMLElement).style.width = `${Math.ceil(width)}px`;
    });
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

  private onScroll(source: HTMLElement): void {
    // The other pane's scroll event, when this page moved it, arrives later and must not bounce back:
    // it is recognised by being where it was put.
    const echo = this.synced.get(source);
    if (!echo || echo.top !== source.scrollTop || echo.left !== source.scrollLeft) {
      for (const pane of this.panes) {
        if (pane === source) continue;
        if (pane.scrollTop !== source.scrollTop) pane.scrollTop = source.scrollTop;
        if (pane.scrollLeft !== source.scrollLeft) pane.scrollLeft = source.scrollLeft;
        this.synced.set(pane, { top: pane.scrollTop, left: pane.scrollLeft });
      }
    }
    this.synced.delete(source);
    this.schedule();
  }

  private paint(): void {
    const pane = this.panes[0];
    if (!pane) return;
    const total = this.view.lines.length;
    const first = Math.max(0, Math.floor(pane.scrollTop / this.lh) - OVERSCAN);
    const last = Math.min(total, Math.ceil((pane.scrollTop + pane.clientHeight) / this.lh) + OVERSCAN);
    const key = `${first}:${last}`;
    if (key !== this.painted) {
      this.painted = key;
      this.rowsEls.forEach((rows, side) => {
        let html = '';
        for (let k = first; k < last; k += 1) html += this.rowHtml(k, side as 0 | 1);
        rows.innerHTML = html;
        rows.style.transform = `translateY(${first * this.lh}px)`;
      });
    }
    this.placeViewport();
  }

  private rowHtml(k: number, side: 0 | 1): string {
    const line = this.view.lines[k];
    if (!line) return '';
    if (line.kind === 'fold') {
      const label = escapeHtml(tn('file', '{count} identical line', '{count} identical lines', line.end - line.start));
      const gutters = this.unified ? '<span class="ln"></span><span class="ln"></span>' : '<span class="ln"></span>';
      return `<div class="r fold" data-fold="${line.start}">${gutters}<span class="tx">${iconHtml('unfold')}${label}</span></div>`;
    }
    const row = this.cmp.rows[line.row] as Row;
    const block = row.block >= 0 ? this.cmp.blocks[row.block] : undefined;
    const marks = (block?.ignored ? ' ign' : '') + (row.block >= 0 && row.block === this.current ? ' cur' : '');
    if (this.unified) {
      const a = line.part !== 'b' && row.a >= 0 ? row.a : -1;
      const b = line.part !== 'a' && row.b >= 0 ? row.b : -1;
      const kind = line.part === 'a' ? ' del' : line.part === 'b' ? ' ins' : '';
      const textSide: 0 | 1 = line.part === 'b' ? 1 : 0;
      const index = textSide === 0 ? row.a : row.b;
      return `<div class="r${kind}${marks}" data-row="${line.row}"><span class="ln">${a >= 0 ? a + 1 : ''}</span><span class="ln">${b >= 0 ? b + 1 : ''}</span><span class="tx">${this.lineHtml(textSide, index, row, line.part !== 'both')}</span></div>`;
    }
    const index = side === 0 ? row.a : row.b;
    if (index < 0) return `<div class="r filler${marks}" data-row="${line.row}"><span class="ln"></span><span class="tx"></span></div>`;
    const kind = row.kind === 'same' ? '' : side === 0 ? ' del' : ' ins';
    return `<div class="r${kind}${marks}" data-row="${line.row}"><span class="ln">${index + 1}</span><span class="tx">${this.lineHtml(side, index, row, row.kind !== 'same')}</span></div>`;
  }

  private lineHtml(side: 0 | 1, index: number, row: Row, changed: boolean): string {
    const file = this.files[side];
    const full = file.lines[index] ?? '';
    const text = full.length > MAX_RENDER ? full.slice(0, MAX_RENDER) : full;
    let diff: Range[] | undefined;
    if (changed && row.kind === 'change' && row.similar && this.settings.inline !== 'none' && !this.cmp.blocks[row.block]?.ignored) {
      let ranges = this.inline.get(row);
      if (!ranges) {
        ranges = inlineDiff(this.files[0].lines[row.a] ?? '', this.files[1].lines[row.b] ?? '', this.settings.inline, this.settings.compare);
        this.inline.set(row, ranges);
      }
      diff = side === 0 ? ranges.a : ranges.b;
    }
    const current = this.hits[this.hitIndex];
    const hit = current && current.side === side && current.line === index ? ([current.start, current.end] as Range) : undefined;
    let html = paintLine(text, this.tokens[side]?.[index], diff, this.hitMap[side].get(index), hit, this.settings.whitespace);
    if (full.length > MAX_RENDER) html += `<span class="cut"> … ${escapeHtml(tn('file', '{count} more character', '{count} more characters', full.length - MAX_RENDER))}</span>`;
    const eol = file.eols[index] ?? '';
    // A line ending is shown when asked for, or when it is all that differs.
    const other = side === 0 ? row.b : row.a;
    const eolDiffers =
      changed && row.kind === 'change' && !this.settings.compare.ignoreEol && other >= 0 && (this.files[side === 0 ? 1 : 0].eols[other] ?? '') !== eol;
    if (eol && (this.settings.whitespace || eolDiffers)) html += `<span class="eol${eolDiffers ? ' hl' : ''}">${EOL_LABEL[eol]}</span>`;
    return html;
  }

  private onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const fold = target.closest<HTMLElement>('.fold');
    if (fold) {
      this.openFold(Number(fold.dataset['fold']));
      return;
    }
    const row = target.closest<HTMLElement>('[data-row]');
    if (!row) return;
    const block = this.cmp.rows[Number(row.dataset['row'])]?.block ?? -1;
    if (block >= 0 && !this.cmp.blocks[block]?.ignored && block !== this.current) {
      this.current = block;
      this.invalidate();
      this.emit();
    }
  }

  private openFold(start: number): void {
    const pane = this.panes[0];
    const top = pane?.scrollTop ?? 0;
    this.expanded.add(start);
    this.rebuildView();
    this.measure();
    if (pane) pane.scrollTop = top;
    this.drawOverview();
    this.invalidate();
  }

  /* ---------------------------------------------------------------- *
   * The map of the differences
   * ---------------------------------------------------------------- */

  private bindOverview(): void {
    const jump = (event: PointerEvent): void => {
      const box = this.overview.getBoundingClientRect();
      const pane = this.panes[0];
      if (!pane) return;
      const ratio = Math.min(1, Math.max(0, (event.clientY - box.top) / box.height));
      pane.scrollTop = ratio * pane.scrollHeight - pane.clientHeight / 2;
    };
    this.overview.addEventListener('pointerdown', (event) => {
      this.overview.setPointerCapture(event.pointerId);
      jump(event);
    });
    this.overview.addEventListener('pointermove', (event) => {
      if (this.overview.hasPointerCapture(event.pointerId)) jump(event);
    });
    this.overview.addEventListener(
      'wheel',
      (event) => {
        const pane = this.panes[0];
        if (pane) pane.scrollTop += event.deltaY;
      },
      { passive: true },
    );
  }

  private drawOverview(): void {
    const box = this.overview?.getBoundingClientRect();
    if (!box || !box.height) return;
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(box.width * ratio);
    this.canvas.height = Math.round(box.height * ratio);
    const context = this.canvas.getContext('2d');
    if (!context) return;
    const style = getComputedStyle(this.root);
    const del = style.getPropertyValue('--del-ink').trim() || '#c00';
    const ins = style.getPropertyValue('--ins-ink').trim() || '#090';
    const ignored = style.getPropertyValue('--faint').trim() || '#999';
    const total = Math.max(1, this.view.lines.length);
    const width = this.canvas.width;
    const height = this.canvas.height;
    const half = Math.floor(width / 2);
    this.cmp.blocks.forEach((block, i) => {
      const span = this.view.blocks[i];
      if (!span) return;
      const top = Math.floor((span[0] / total) * height);
      const size = Math.max(Math.round(2 * ratio), Math.ceil(((span[1] - span[0]) / total) * height));
      let hasA = false;
      let hasB = false;
      for (let r = block.start; r < block.end; r += 1) {
        const row = this.cmp.rows[r] as Row;
        if (row.a >= 0) hasA = true;
        if (row.b >= 0) hasB = true;
      }
      context.globalAlpha = block.ignored ? 0.35 : 0.85;
      if (hasA) {
        context.fillStyle = block.ignored ? ignored : del;
        context.fillRect(1, top, half - 1, size);
      }
      if (hasB) {
        context.fillStyle = block.ignored ? ignored : ins;
        context.fillRect(half, top, width - half - 1, size);
      }
    });
    this.placeViewport();
  }

  private placeViewport(): void {
    const pane = this.panes[0];
    if (!pane || !this.viewport) return;
    const height = this.overview.clientHeight;
    const scroll = Math.max(1, pane.scrollHeight);
    this.viewport.style.top = `${(pane.scrollTop / scroll) * height}px`;
    this.viewport.style.height = `${Math.min(height, (pane.clientHeight / scroll) * height)}px`;
  }

  /* ---------------------------------------------------------------- *
   * Moving between differences
   * ---------------------------------------------------------------- */

  private countedBlocks(): number[] {
    const out: number[] = [];
    this.cmp.blocks.forEach((block, i) => {
      if (!block.ignored) out.push(i);
    });
    return out;
  }

  private topLine(): number {
    const pane = this.panes[0];
    return pane ? Math.floor(pane.scrollTop / this.lh) : 0;
  }

  next(): void {
    const counted = this.countedBlocks();
    const target = this.current >= 0 ? counted.find((i) => i > this.current) : counted.find((i) => (this.view.blocks[i]?.[0] ?? 0) >= this.topLine());
    if (target !== undefined) this.goTo(target);
  }

  previous(): void {
    const counted = this.countedBlocks();
    const top = this.topLine();
    const target = this.current >= 0 ? [...counted].reverse().find((i) => i < this.current) : [...counted].reverse().find((i) => (this.view.blocks[i]?.[0] ?? 0) < top);
    if (target !== undefined) this.goTo(target);
  }

  first(): void {
    const target = this.countedBlocks()[0];
    if (target !== undefined) this.goTo(target);
  }

  last(): void {
    const counted = this.countedBlocks();
    const target = counted[counted.length - 1];
    if (target !== undefined) this.goTo(target);
  }

  private goTo(block: number): void {
    this.current = block;
    const span = this.view.blocks[block];
    if (span) this.scrollToLine(span[0], span[1]);
    this.invalidate();
    this.emit();
  }

  /** Brings view lines [start, end) into sight, a third of the way down, unless they are in sight already. */
  private scrollToLine(start: number, end = start + 1, column = -1): void {
    const pane = this.panes[0];
    if (!pane) return;
    const top = start * this.lh;
    const bottom = end * this.lh;
    if (top < pane.scrollTop || bottom > pane.scrollTop + pane.clientHeight) pane.scrollTop = Math.max(0, top - pane.clientHeight / 3);
    if (column >= 0) {
      const x = this.gutter * (this.unified ? 2 : 1) + 8 + column * this.charWidth;
      if (x < pane.scrollLeft + this.gutter * 2 || x > pane.scrollLeft + pane.clientWidth - 40) pane.scrollLeft = Math.max(0, x - pane.clientWidth / 3);
    }
  }

  /** Scrolls to the start of the comparison, or of the first difference when asked. */
  start(toFirst: boolean): void {
    if (toFirst && this.cmp.differences) this.first();
    else this.emit();
  }

  /* ---------------------------------------------------------------- *
   * Search
   * ---------------------------------------------------------------- */

  find(query: string, jump = true): void {
    this.query = query;
    this.hits = [];
    this.hitIndex = -1;
    if (query) {
      // Over the text itself: lower-casing first could change its length ('İ') and shift every mark after it.
      const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'giu');
      const rows = this.cmp.rows;
      outer: for (let r = 0; r < rows.length; r += 1) {
        const row = rows[r] as Row;
        for (const side of [0, 1] as const) {
          const index = side === 0 ? row.a : row.b;
          // A same row of the unified view shows the left text only.
          if (index < 0 || (this.unified && side === 1 && row.kind === 'same')) continue;
          // Past the cut a match could not be seen.
          const text = (this.files[side].lines[index] ?? '').slice(0, MAX_RENDER);
          pattern.lastIndex = 0;
          for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
            if (!match[0].length) break;
            this.hits.push({ side, line: index, row: r, start: match.index, end: match.index + match[0].length });
            if (this.hits.length >= MAX_HITS) break outer;
          }
        }
      }
    }
    this.mapHits();
    if (this.hits.length && jump) {
      const top = this.topLine();
      const after = this.hits.findIndex((hit) => this.lineOfHit(hit) >= top);
      this.showHit(after >= 0 ? after : 0);
    } else {
      this.invalidate();
      this.emit();
    }
  }

  findNext(step: 1 | -1): void {
    if (!this.hits.length) return;
    this.showHit((this.hitIndex + step + this.hits.length) % this.hits.length);
  }

  private mapHits(): void {
    this.hitMap = [new Map(), new Map()];
    for (const hit of this.hits) {
      const map = this.hitMap[hit.side];
      const list = map.get(hit.line);
      if (list) list.push([hit.start, hit.end]);
      else map.set(hit.line, [[hit.start, hit.end]]);
    }
  }

  private lineOfHit(hit: Hit): number {
    const k = (this.rowLine[hit.side] as Int32Array)[hit.row] ?? -1;
    return k <= -2 ? -2 - k : k;
  }

  private showHit(index: number): void {
    this.hitIndex = index;
    const hit = this.hits[index] as Hit;
    const k = (this.rowLine[hit.side] as Int32Array)[hit.row] ?? -1;
    if (k <= -2) {
      const fold = this.view.lines[-2 - k];
      if (fold?.kind === 'fold') this.openFold(fold.start);
    }
    this.scrollToLine(this.lineOfHit(hit), this.lineOfHit(hit) + 1, columns((this.files[hit.side].lines[hit.line] ?? '').slice(0, hit.start), this.settings.tabSize));
    this.invalidate();
    this.emit();
  }

  /** True when the two texts are equal but for what the options ignore. */
  equalUnderOptions(): boolean {
    return this.cmp.differences === 0;
  }

  /** The two files differ only in their line endings. */
  onlyEndingsDiffer(): boolean {
    const [a, b] = this.files;
    if (a.lines.length !== b.lines.length) return false;
    const strict = { ...this.settings.compare, ignoreEol: true };
    return a.lines.every((line, i) => lineKey(line, '', strict) === lineKey(b.lines[i] ?? '', '', strict)) && a.eol !== b.eol;
  }

  destroy(): void {
    this.resize.disconnect();
    cancelAnimationFrame(this.frame);
    this.root.remove();
  }
}

/* ------------------------------------------------------------------ *
 * A line as HTML
 * ------------------------------------------------------------------ */

function whitespaceHtml(text: string): string {
  return escapeHtml(text).replace(/ /g, '<span class="sp"> </span>').replace(/\t/g, '<span class="tab">\t</span>');
}

/**
 * The line, escaped, cut wherever a token, a changed range or a search hit
 * begins or ends, each piece with the classes of everything over it.
 */
export function paintLine(
  text: string,
  tokens: LineTokens | undefined,
  diff: Range[] | undefined,
  hits: Range[] | undefined,
  current: Range | undefined,
  whitespace: boolean,
): string {
  const length = text.length;
  if (!length) return '';
  const cuts = new Set<number>([0, length]);
  if (tokens) for (let k = 0; k < tokens.length; k += 3) cuts.add(Math.min(length, tokens[k] as number)).add(Math.min(length, tokens[k + 1] as number));
  for (const list of [diff, hits]) if (list) for (const [s, e] of list) cuts.add(Math.min(length, s)).add(Math.min(length, e));
  const points = [...cuts].sort((a, b) => a - b);
  const escape = whitespace ? whitespaceHtml : escapeHtml;
  let out = '';
  let ti = 0;
  let di = 0;
  let hi = 0;
  for (let p = 0; p + 1 < points.length; p += 1) {
    const start = points[p] as number;
    const end = points[p + 1] as number;
    if (end <= start) continue;
    const classes: string[] = [];
    if (tokens) {
      while (ti < tokens.length && (tokens[ti + 1] as number) <= start) ti += 3;
      if (ti < tokens.length && (tokens[ti] as number) <= start) classes.push(`tk-${TOKEN_TYPES[tokens[ti + 2] as number]}`);
    }
    if (diff) {
      while (di < diff.length && (diff[di] as Range)[1] <= start) di += 1;
      if (di < diff.length && (diff[di] as Range)[0] <= start) classes.push('hl');
    }
    if (hits) {
      while (hi < hits.length && (hits[hi] as Range)[1] <= start) hi += 1;
      if (hi < hits.length && (hits[hi] as Range)[0] <= start) classes.push(current && current[0] <= start && current[1] > start ? 'hit hit-cur' : 'hit');
    }
    const piece = escape(text.slice(start, end));
    out += classes.length ? `<span class="${classes.join(' ')}">${piece}</span>` : piece;
  }
  return out;
}
