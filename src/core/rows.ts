/**
 * Two texts as rows on a screen: the diff's hunks become rows that hold a line
 * of each side, or of one side and a gap in the other; the rows of one hunk
 * are a block, the unit the next/previous-difference keys move by. What the
 * screen shows — side by side or one under the other, with long identical
 * stretches folded — is a list of view lines over the rows.
 */

import { diffKeys, isBlank, lineKey, type CompareOptions, type Hunk } from './diff';
import { pairLines } from './inline';

/** same: equal lines; change: a line on each side; del: on the left only; ins: on the right only. */
export type RowKind = 'same' | 'change' | 'del' | 'ins';

export interface Row {
  kind: RowKind;
  /** Line index on the left, -1 for none. */
  a: number;
  /** Line index on the right, -1 for none. */
  b: number;
  /** The block of a changed row, -1 for a same one. */
  block: number;
  /** The two lines of a change row are alike enough to show what changed inside them. */
  similar: boolean;
}

export interface Block {
  /** Rows [start, end). */
  start: number;
  end: number;
  /** Made of blank lines only, with blank lines ignored: shown, not counted, not stopped at. */
  ignored: boolean;
}

export interface Comparison {
  rows: Row[];
  blocks: Block[];
  /** Blocks that count, as the toolbar numbers them. */
  differences: number;
}

export interface LineSource {
  lines: string[];
  eols: string[];
}

export function compareTexts(left: LineSource, right: LineSource, options: CompareOptions): Comparison {
  const keys = (side: LineSource): string[] => side.lines.map((line, i) => lineKey(line, side.eols[i] ?? '', options));
  const hunks = diffKeys(keys(left), keys(right));
  return rowsOf(left.lines, right.lines, hunks, options);
}

export function rowsOf(a: string[], b: string[], hunks: Hunk[], options: CompareOptions): Comparison {
  const rows: Row[] = [];
  const blocks: Block[] = [];
  let i = 0;
  let j = 0;
  const same = (until: number): void => {
    while (i < until) rows.push({ kind: 'same', a: i++, b: j++, block: -1, similar: true });
  };
  for (const hunk of hunks) {
    same(hunk.a);
    const block = blocks.length;
    const start = rows.length;
    for (const pair of pairLines(a.slice(hunk.a, hunk.aEnd), b.slice(hunk.b, hunk.bEnd))) {
      const kind: RowKind = pair.a >= 0 && pair.b >= 0 ? 'change' : pair.a >= 0 ? 'del' : 'ins';
      rows.push({ kind, a: pair.a >= 0 ? hunk.a + pair.a : -1, b: pair.b >= 0 ? hunk.b + pair.b : -1, block, similar: pair.similar });
    }
    const ignored =
      options.ignoreBlankLines && a.slice(hunk.a, hunk.aEnd).every(isBlank) && b.slice(hunk.b, hunk.bEnd).every(isBlank);
    blocks.push({ start, end: rows.length, ignored });
    i = hunk.aEnd;
    j = hunk.bEnd;
  }
  same(a.length);
  return { rows, blocks, differences: blocks.filter((block) => !block.ignored).length };
}

/** Lines added, removed and changed, as the status bar says them. */
export function tally(comparison: Comparison): { changed: number; added: number; removed: number } {
  let changed = 0;
  let added = 0;
  let removed = 0;
  for (const row of comparison.rows) {
    if (row.block < 0 || comparison.blocks[row.block]?.ignored) continue;
    if (row.kind === 'change') changed += 1;
    else if (row.kind === 'ins') added += 1;
    else if (row.kind === 'del') removed += 1;
  }
  return { changed, added, removed };
}

/* ------------------------------------------------------------------ *
 * View lines
 * ------------------------------------------------------------------ */

/** A row on the screen: both sides of it, or in the unified view one side. */
export interface RowLine {
  kind: 'row';
  row: number;
  part: 'both' | 'a' | 'b';
}

/** Rows [start, end) folded away. */
export interface FoldLine {
  kind: 'fold';
  start: number;
  end: number;
}

export type ViewLine = RowLine | FoldLine;

export interface ViewOptions {
  unified: boolean;
  /** Fold identical stretches longer than twice the context. */
  collapse: boolean;
  context: number;
  /** Folds opened by the user, by their first row. */
  expanded: ReadonlySet<number>;
}

export interface View {
  lines: ViewLine[];
  /** For each block, the view lines [start, end) it covers. */
  blocks: [number, number][];
}

/** A fold hides at least this many lines; fewer are simply shown. */
const MIN_FOLD = 3;

export function buildView(comparison: Comparison, options: ViewOptions): View {
  const { rows } = comparison;
  const lines: ViewLine[] = [];
  const blocks: [number, number][] = comparison.blocks.map(() => [0, 0]);
  const fold = options.collapse && comparison.blocks.length > 0;
  let r = 0;
  while (r < rows.length) {
    const row = rows[r] as Row;
    if (row.block < 0) {
      let end = r;
      while (end < rows.length && (rows[end] as Row).block < 0) end += 1;
      const head = r === 0 ? 0 : options.context;
      const tail = end === rows.length ? 0 : options.context;
      if (fold && end - r - head - tail >= MIN_FOLD && !options.expanded.has(r + head)) {
        for (let k = r; k < r + head; k += 1) lines.push({ kind: 'row', row: k, part: 'both' });
        lines.push({ kind: 'fold', start: r + head, end: end - tail });
        for (let k = end - tail; k < end; k += 1) lines.push({ kind: 'row', row: k, part: 'both' });
      } else {
        for (let k = r; k < end; k += 1) lines.push({ kind: 'row', row: k, part: 'both' });
      }
      r = end;
      continue;
    }
    const block = comparison.blocks[row.block] as Block;
    const span = blocks[row.block] as [number, number];
    span[0] = lines.length;
    if (options.unified) {
      for (let k = block.start; k < block.end; k += 1) if ((rows[k] as Row).a >= 0) lines.push({ kind: 'row', row: k, part: 'a' });
      for (let k = block.start; k < block.end; k += 1) if ((rows[k] as Row).b >= 0) lines.push({ kind: 'row', row: k, part: 'b' });
    } else {
      for (let k = block.start; k < block.end; k += 1) lines.push({ kind: 'row', row: k, part: 'both' });
    }
    span[1] = lines.length;
    r = block.end;
  }
  return { lines, blocks };
}

/** The view line that shows line `line` of a side (0 left, 1 right), or -1 when it is folded away. */
export function viewLineOf(view: View, rows: readonly Row[], side: 0 | 1, line: number): number {
  for (let k = 0; k < view.lines.length; k += 1) {
    const item = view.lines[k] as ViewLine;
    if (item.kind !== 'row') continue;
    const row = rows[item.row] as Row;
    const index = side === 0 ? row.a : row.b;
    if (index === line && (item.part === 'both' || item.part === (side === 0 ? 'a' : 'b'))) return k;
  }
  return -1;
}
