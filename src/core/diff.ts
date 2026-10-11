/**
 * The line diff, and the comparison options that shape it.
 *
 * Lines are turned into keys — the text as the options see it: whitespace
 * collapsed or dropped, lower case, with or without the line ending — and the
 * keys into numbers, so the diff itself compares integers.
 *
 * The diff is patience diff over Myers: lines that occur exactly once on each
 * side and in the same order anchor the result, and the stretches between
 * anchors go to Myers' O(ND) bisection, as diff-match-patch implements it.
 * Anchoring on unique lines keeps a moved brace or a blank line from pairing
 * up unrelated code, which is what makes a diff readable. Now and then a
 * unique line anchors badly — moved from the top to the bottom, it would take
 * everything around it along — so plain Myers runs too, and patience is kept
 * only while it matches nearly as many lines as the minimal diff does.
 *
 * A work budget keeps two large, wholly different files from taking minutes:
 * past it, what is left of a stretch is reported as changed as a whole.
 */

export type WhitespaceMode = 'none' | 'change' | 'all';

export interface CompareOptions {
  /** 'change' takes runs of whitespace as one space and ignores it at the end of a line; 'all' ignores it entirely. */
  whitespace: WhitespaceMode;
  ignoreCase: boolean;
  /** A difference made of blank lines only is shown, but not counted. */
  ignoreBlankLines: boolean;
  /** CRLF, LF and CR are the same line ending. */
  ignoreEol: boolean;
}

export const DEFAULT_OPTIONS: CompareOptions = { whitespace: 'none', ignoreCase: false, ignoreBlankLines: false, ignoreEol: true };

/** Options under which two files of different bytes may still be the same. */
export function normalizes(options: CompareOptions): boolean {
  return options.whitespace !== 'none' || options.ignoreCase || options.ignoreBlankLines || options.ignoreEol;
}

/** A line as the options see it. */
export function lineKey(line: string, eol: string, options: CompareOptions): string {
  let key = line;
  if (options.whitespace === 'all') key = key.replace(/\s+/g, '');
  else if (options.whitespace === 'change') key = key.replace(/\s+/g, ' ').replace(/ $/, '');
  if (options.ignoreCase) key = key.toLowerCase();
  if (!options.ignoreEol) key += `\0${eol}`;
  return key;
}

export const isBlank = (line: string): boolean => /^\s*$/.test(line);

/** A run of equal elements: a[a … a+length) is b[b … b+length). */
export interface Match {
  a: number;
  b: number;
  length: number;
}

/** A changed stretch: a[a … aEnd) became b[b … bEnd); one side may be empty. */
export interface Hunk {
  a: number;
  aEnd: number;
  b: number;
  bEnd: number;
}

interface Work {
  a: ArrayLike<number>;
  b: ArrayLike<number>;
  out: Match[];
  spent: number;
  budget: number;
}

function emit(work: Work, a: number, b: number, length: number): void {
  const last = work.out[work.out.length - 1];
  if (last && last.a + last.length === a && last.b + last.length === b) last.length += length;
  else work.out.push({ a, b, length });
}

/**
 * The common runs of two integer sequences, in order. `budget` bounds the
 * work, roughly in compared elements; past it the rest is left unmatched.
 */
export function diffSequences(a: ArrayLike<number>, b: ArrayLike<number>, budget = 40_000_000): Match[] {
  const run = (patience: boolean): Match[] => {
    const work: Work = { a, b, out: [], spent: 0, budget };
    solve(work, 0, a.length, 0, b.length, patience);
    return work.out;
  };
  const anchored = run(true);
  const minimal = run(false);
  const total = (matches: Match[]): number => matches.reduce((sum, match) => sum + match.length, 0);
  const best = total(anchored) >= total(minimal) * 0.97 - 1 ? anchored : minimal;
  return slide(best, a, b);
}

/**
 * An inserted or deleted run can often sit a few lines higher or lower with
 * the same lines around it: `}` + new function, or new function + `}`. As GNU
 * diff does, each such run is moved as far down as it goes, which keeps whole
 * blocks together.
 */
function slide(matches: Match[], a: ArrayLike<number>, b: ArrayLike<number>): Match[] {
  const out = matches.map((match) => ({ ...match }));
  for (let i = 0; i + 1 < out.length; i += 1) {
    const before = out[i] as Match;
    const after = out[i + 1] as Match;
    const gapA = after.a - (before.a + before.length);
    const gapB = after.b - (before.b + before.length);
    // Only a pure insertion (gapA 0) or deletion (gapB 0) can slide.
    if ((gapA === 0) === (gapB === 0)) continue;
    const seq = gapA === 0 ? b : a;
    let start = gapA === 0 ? before.b + before.length : before.a + before.length;
    let end = gapA === 0 ? after.b : after.a;
    while (after.length > 0 && seq[start] === seq[end]) {
      start += 1;
      end += 1;
      before.length += 1;
      after.a += 1;
      after.b += 1;
      after.length -= 1;
    }
  }
  return out.filter((match) => match.length > 0).reduce<Match[]>((list, match) => {
    const last = list[list.length - 1];
    if (last && last.a + last.length === match.a && last.b + last.length === match.b) last.length += match.length;
    else list.push(match);
    return list;
  }, []);
}

function solve(work: Work, aLo: number, aHi: number, bLo: number, bHi: number, patience: boolean): void {
  const { a, b } = work;
  let prefix = 0;
  while (aLo + prefix < aHi && bLo + prefix < bHi && a[aLo + prefix] === b[bLo + prefix]) prefix += 1;
  if (prefix) emit(work, aLo, bLo, prefix);
  aLo += prefix;
  bLo += prefix;
  let suffix = 0;
  while (aHi - suffix > aLo && bHi - suffix > bLo && a[aHi - 1 - suffix] === b[bHi - 1 - suffix]) suffix += 1;
  aHi -= suffix;
  bHi -= suffix;
  work.spent += prefix + suffix;
  if (aLo < aHi && bLo < bHi) {
    if (!(patience && anchor(work, aLo, aHi, bLo, bHi))) bisect(work, aLo, aHi, bLo, bHi);
  }
  if (suffix) emit(work, aHi, bHi, suffix);
}

/**
 * Patience: the elements unique on both sides, the longest run of them in the
 * same order on both, and the stretches between them solved the same way.
 * False when there is nothing unique to anchor on.
 */
function anchor(work: Work, aLo: number, aHi: number, bLo: number, bHi: number): boolean {
  const { a, b } = work;
  // Index of the only occurrence, or -1 for an element seen twice.
  const inA = new Map<number, number>();
  for (let i = aLo; i < aHi; i += 1) {
    const value = a[i] as number;
    inA.set(value, inA.has(value) ? -1 : i);
  }
  const inB = new Map<number, number>();
  for (let j = bLo; j < bHi; j += 1) {
    const value = b[j] as number;
    if (inA.has(value)) inB.set(value, inB.has(value) ? -1 : j);
  }
  work.spent += aHi - aLo + (bHi - bLo);
  const pairs: [number, number][] = [];
  for (let i = aLo; i < aHi; i += 1) {
    const value = a[i] as number;
    if (inA.get(value) !== i) continue;
    const j = inB.get(value);
    if (j !== undefined && j >= 0) pairs.push([i, j]);
  }
  if (!pairs.length) return false;

  // Longest increasing subsequence of the B positions, by patience sorting.
  const tails: number[] = [];
  const previous = new Int32Array(pairs.length);
  for (let p = 0; p < pairs.length; p += 1) {
    const j = (pairs[p] as [number, number])[1];
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if ((pairs[tails[mid] as number] as [number, number])[1] < j) lo = mid + 1;
      else hi = mid;
    }
    previous[p] = lo > 0 ? (tails[lo - 1] as number) : -1;
    tails[lo] = p;
  }
  const chain: [number, number][] = [];
  for (let p = tails[tails.length - 1] as number; p >= 0; p = previous[p] as number) chain.push(pairs[p] as [number, number]);
  chain.reverse();

  let i = aLo;
  let j = bLo;
  for (const [ai, bj] of chain) {
    solve(work, i, ai, j, bj, true);
    emit(work, ai, bj, 1);
    i = ai + 1;
    j = bj + 1;
  }
  solve(work, i, aHi, j, bHi, true);
  return true;
}

/**
 * Myers' middle snake, both ends at once, then each half on its own. Leaves
 * the stretch unmatched when the budget runs out or there is nothing common.
 */
function bisect(work: Work, aLo: number, aHi: number, bLo: number, bHi: number): void {
  const { a, b } = work;
  const n = aHi - aLo;
  const m = bHi - bLo;
  const maxD = Math.ceil((n + m) / 2);
  const offset = maxD;
  const size = 2 * maxD + 2;
  const v1 = new Int32Array(size).fill(-1);
  const v2 = new Int32Array(size).fill(-1);
  v1[offset + 1] = 0;
  v2[offset + 1] = 0;
  const delta = n - m;
  // With an odd delta the paths meet while extending forward, with an even one backward.
  const front = (delta & 1) !== 0;
  let k1start = 0;
  let k1end = 0;
  let k2start = 0;
  let k2end = 0;
  for (let d = 0; d < maxD; d += 1) {
    if (work.spent > work.budget) return;
    for (let k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
      const k1o = offset + k1;
      let x1 = k1 === -d || (k1 !== d && (v1[k1o - 1] as number) < (v1[k1o + 1] as number)) ? (v1[k1o + 1] as number) : (v1[k1o - 1] as number) + 1;
      let y1 = x1 - k1;
      const x0 = x1;
      while (x1 < n && y1 < m && a[aLo + x1] === b[bLo + y1]) {
        x1 += 1;
        y1 += 1;
      }
      work.spent += 1 + x1 - x0;
      v1[k1o] = x1;
      if (x1 > n) k1end += 2;
      else if (y1 > m) k1start += 2;
      else if (front) {
        const k2o = offset + delta - k1;
        if (k2o >= 0 && k2o < size && v2[k2o] !== -1) {
          const x2 = n - (v2[k2o] as number);
          if (x1 >= x2) {
            split(work, aLo, aHi, bLo, bHi, x1, y1);
            return;
          }
        }
      }
    }
    for (let k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      const k2o = offset + k2;
      let x2 = k2 === -d || (k2 !== d && (v2[k2o - 1] as number) < (v2[k2o + 1] as number)) ? (v2[k2o + 1] as number) : (v2[k2o - 1] as number) + 1;
      let y2 = x2 - k2;
      const x0 = x2;
      while (x2 < n && y2 < m && a[aHi - 1 - x2] === b[bHi - 1 - y2]) {
        x2 += 1;
        y2 += 1;
      }
      work.spent += 1 + x2 - x0;
      v2[k2o] = x2;
      if (x2 > n) k2end += 2;
      else if (y2 > m) k2start += 2;
      else if (!front) {
        const k1o = offset + delta - k2;
        if (k1o >= 0 && k1o < size && v1[k1o] !== -1) {
          const x1 = v1[k1o] as number;
          const y1 = offset + x1 - k1o;
          if (x1 >= n - x2) {
            split(work, aLo, aHi, bLo, bHi, x1, y1);
            return;
          }
        }
      }
    }
  }
}

function split(work: Work, aLo: number, aHi: number, bLo: number, bHi: number, x: number, y: number): void {
  solve(work, aLo, aLo + x, bLo, bLo + y, false);
  solve(work, aLo + x, aHi, bLo + y, bHi, false);
}

/** Numbers for strings: equal strings, equal numbers, on both sides. */
export function intern(...lists: readonly string[][]): Int32Array[] {
  const ids = new Map<string, number>();
  return lists.map((list) => {
    const out = new Int32Array(list.length);
    for (let i = 0; i < list.length; i += 1) {
      const key = list[i] as string;
      let id = ids.get(key);
      if (id === undefined) {
        id = ids.size;
        ids.set(key, id);
      }
      out[i] = id;
    }
    return out;
  });
}

/** The stretches between the matches. */
export function hunksOf(matches: readonly Match[], aLength: number, bLength: number): Hunk[] {
  const hunks: Hunk[] = [];
  let a = 0;
  let b = 0;
  for (const match of [...matches, { a: aLength, b: bLength, length: 0 }]) {
    if (match.a > a || match.b > b) hunks.push({ a, aEnd: match.a, b, bEnd: match.b });
    a = match.a + match.length;
    b = match.b + match.length;
  }
  return hunks;
}

/** The changed stretches between two lists of line keys. */
export function diffKeys(aKeys: string[], bKeys: string[], budget?: number): Hunk[] {
  const [a, b] = intern(aKeys, bKeys) as [Int32Array, Int32Array];
  return hunksOf(diffSequences(a, b, budget), a.length, b.length);
}
