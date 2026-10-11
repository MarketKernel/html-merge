/**
 * What changed inside a line, and which lines of a changed stretch belong
 * together.
 *
 * Inside a line the diff runs over words (or characters) with the same
 * diff.ts, and the changed words become ranges of the line's text. Lines of a
 * changed stretch are paired by similarity — character bigrams, the Dice
 * coefficient — so an inserted line does not push every line after it out of
 * line with its counterpart.
 */

import { diffSequences, intern, type CompareOptions } from './diff';

/** [start, end) in UTF-16 units of the line. */
export type Range = [number, number];

export type InlineMode = 'word' | 'char' | 'none';

const WORD = /[\p{L}\p{N}_]+|\s+|[^\p{L}\p{N}_\s]/gu;

/** Past this many characters a line is compared by its common start and end only. */
const LONG_LINE = 20_000;

interface Token {
  start: number;
  end: number;
  key: string;
}

function tokens(line: string, mode: 'word' | 'char', options: CompareOptions): Token[] {
  const out: Token[] = [];
  const add = (text: string, start: number): void => {
    let key = text;
    if (/^\s+$/.test(text)) {
      if (options.whitespace === 'all') return;
      if (options.whitespace === 'change') key = ' ';
    }
    if (options.ignoreCase) key = key.toLowerCase();
    out.push({ start, end: start + text.length, key });
  };
  if (mode === 'word') {
    for (const match of line.matchAll(WORD)) add(match[0], match.index);
  } else {
    let at = 0;
    for (const char of line) {
      add(char, at);
      at += char.length;
    }
  }
  return out;
}

/** The changed ranges of each of two lines. */
export function inlineDiff(a: string, b: string, mode: InlineMode, options: CompareOptions): { a: Range[]; b: Range[] } {
  if (mode === 'none') return { a: [], b: [] };
  if (a.length > LONG_LINE || b.length > LONG_LINE) return ends(a, b);
  const ta = tokens(a, mode, options);
  const tb = tokens(b, mode, options);
  const [ia, ib] = intern(
    ta.map((t) => t.key),
    tb.map((t) => t.key),
  ) as [Int32Array, Int32Array];
  const matches = diffSequences(ia, ib, 2_000_000);
  const keepA = new Uint8Array(ta.length);
  const keepB = new Uint8Array(tb.length);
  for (const match of matches) {
    keepA.fill(1, match.a, match.a + match.length);
    keepB.fill(1, match.b, match.b + match.length);
  }
  return { a: ranges(a, ta, keepA, mode), b: ranges(b, tb, keepB, mode) };
}

/** Changed tokens joined into ranges; in word mode, two ranges with only whitespace between them become one. */
function ranges(line: string, list: Token[], keep: Uint8Array, mode: 'word' | 'char'): Range[] {
  const out: Range[] = [];
  for (let i = 0; i < list.length; i += 1) {
    if (keep[i]) continue;
    const token = list[i] as Token;
    const last = out[out.length - 1];
    if (last && (last[1] === token.start || (mode === 'word' && /^\s*$/.test(line.slice(last[1], token.start))))) last[1] = token.end;
    else out.push([token.start, token.end]);
  }
  return out;
}

/** The middle between the common start and the common end. */
function ends(a: string, b: string): { a: Range[]; b: Range[] } {
  let start = 0;
  const limit = Math.min(a.length, b.length);
  while (start < limit && a.charCodeAt(start) === b.charCodeAt(start)) start += 1;
  let end = 0;
  while (end < limit - start && a.charCodeAt(a.length - 1 - end) === b.charCodeAt(b.length - 1 - end)) end += 1;
  return {
    a: a.length - end > start ? [[start, a.length - end]] : [],
    b: b.length - end > start ? [[start, b.length - end]] : [],
  };
}

/* ------------------------------------------------------------------ *
 * Pairing the lines of a changed stretch
 * ------------------------------------------------------------------ */

const SIMILAR = 0.45;
/** Larger stretches are paired line by line, in order: the table would cost too much. */
const MAX_TABLE = 40_000;
const SAMPLE = 400;

function bigrams(line: string): Map<string, number> {
  const text = line.trim().toLowerCase().slice(0, SAMPLE);
  const out = new Map<string, number>();
  for (let i = 0; i + 1 < text.length; i += 1) {
    const pair = text.slice(i, i + 2);
    out.set(pair, (out.get(pair) ?? 0) + 1);
  }
  return out;
}

function dice(x: Map<string, number>, y: Map<string, number>, xLine: string, yLine: string): number {
  let total = 0;
  for (const count of x.values()) total += count;
  for (const count of y.values()) total += count;
  if (!total) return xLine.trim() === yLine.trim() ? 1 : 0;
  const [small, large] = x.size <= y.size ? [x, y] : [y, x];
  let common = 0;
  for (const [pair, count] of small) common += Math.min(count, large.get(pair) ?? 0);
  return (2 * common) / total;
}

/** How alike two lines are, 0 to 1. */
export function similarity(a: string, b: string): number {
  return dice(bigrams(a), bigrams(b), a, b);
}

/**
 * A line of the left with one of the right, or with nothing (-1). `similar`
 * says whether the two are alike enough for their words to be compared.
 */
export interface Pair {
  a: number;
  b: number;
  similar: boolean;
}

/**
 * The rows of a changed stretch: alike lines side by side, in order; between
 * two such pairs the rest goes side by side as it comes, and what one side has
 * more of stands alone.
 */
export function pairLines(a: readonly string[], b: readonly string[]): Pair[] {
  const n = a.length;
  const m = b.length;
  if (!n || !m) return [...a.map((_, i) => ({ a: i, b: -1, similar: false })), ...b.map((_, j) => ({ a: -1, b: j, similar: false }))];
  let anchors: [number, number][] = [];
  const ga = a.map(bigrams);
  const gb = b.map(bigrams);
  const sim = (i: number, j: number): number => dice(ga[i] as Map<string, number>, gb[j] as Map<string, number>, a[i] as string, b[j] as string);
  if (n * m <= MAX_TABLE) {
    // best[i][j]: the most similarity pairs can add up to within a[0…i) and b[0…j).
    const width = m + 1;
    const best = new Float64Array((n + 1) * width);
    const scores = new Float64Array(n * m);
    for (let i = 1; i <= n; i += 1) {
      for (let j = 1; j <= m; j += 1) {
        const score = sim(i - 1, j - 1);
        scores[(i - 1) * m + (j - 1)] = score;
        const up = best[(i - 1) * width + j] as number;
        const left = best[i * width + j - 1] as number;
        const diagonal = score >= SIMILAR ? (best[(i - 1) * width + j - 1] as number) + score : -1;
        best[i * width + j] = Math.max(up, left, diagonal);
      }
    }
    for (let i = n, j = m; i > 0 && j > 0; ) {
      const here = best[i * width + j] as number;
      const score = scores[(i - 1) * m + (j - 1)] as number;
      if (score >= SIMILAR && Math.abs(here - ((best[(i - 1) * width + j - 1] as number) + score)) < 1e-9) {
        anchors.push([i - 1, j - 1]);
        i -= 1;
        j -= 1;
      } else if (here === best[(i - 1) * width + j]) i -= 1;
      else j -= 1;
    }
    anchors.reverse();
  } else {
    anchors = [];
  }

  const out: Pair[] = [];
  const gap = (i0: number, i1: number, j0: number, j1: number): void => {
    const both = Math.min(i1 - i0, j1 - j0);
    for (let k = 0; k < both; k += 1) out.push({ a: i0 + k, b: j0 + k, similar: sim(i0 + k, j0 + k) >= SIMILAR });
    for (let i = i0 + both; i < i1; i += 1) out.push({ a: i, b: -1, similar: false });
    for (let j = j0 + both; j < j1; j += 1) out.push({ a: -1, b: j, similar: false });
  };
  let i = 0;
  let j = 0;
  for (const [ai, bj] of anchors) {
    gap(i, ai, j, bj);
    out.push({ a: ai, b: bj, similar: true });
    i = ai + 1;
    j = bj + 1;
  }
  gap(i, n, j, m);
  return out;
}
