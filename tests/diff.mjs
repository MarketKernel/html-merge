/**
 * The line diff of src/core/diff.ts and the word diff of src/core/inline.ts:
 * fixed cases whose answer a reader can check by eye, and random ones checked
 * for what any answer must be — the matches really match, in order, and the
 * hunks turn the left side into the right one.
 */
import { checker, load } from '../tools/load.mjs';

const { check, done } = checker();
const D = await load('core/diff', 'core/inline');
const O = D.DEFAULT_OPTIONS;

const lines = (text) => (text ? text.split('\n') : []);
const hunks = (a, b, options = O) => {
  const keys = (list) => list.map((line) => D.lineKey(line, '\n', options));
  return D.diffKeys(keys(lines(a)), keys(lines(b))).map((h) => [h.a, h.aEnd, h.b, h.bEnd]);
};

// Fixed cases
check('equal', hunks('a\nb\nc', 'a\nb\nc'), []);
check('both empty', hunks('', ''), []);
check('all inserted', hunks('', 'a\nb'), [[0, 0, 0, 2]]);
check('all deleted', hunks('a\nb', ''), [[0, 2, 0, 0]]);
check('one changed line', hunks('a\nb\nc', 'a\nX\nc'), [[1, 2, 1, 2]]);
check('insert in the middle', hunks('a\nc', 'a\nb\nc'), [[1, 1, 1, 2]]);
check('delete at the end', hunks('a\nb\nc', 'a\nb'), [[2, 3, 2, 2]]);
check('two hunks', hunks('a\nb\nc\nd\ne', 'a\nB\nc\nd\nE'), [
  [1, 2, 1, 2],
  [4, 5, 4, 5],
]);
// Patience: the unique function lines anchor, the braces do not pair across functions.
check(
  'unique lines anchor',
  hunks('function a() {\n  one\n}\nfunction b() {\n  two\n}', 'function b() {\n  two\n}\nfunction c() {\n  three\n}'),
  [
    [0, 3, 0, 0],
    [6, 6, 3, 6],
  ],
);

// Options
check('whitespace counts by default', hunks('a  b', 'a b'), [[0, 1, 0, 1]]);
check('whitespace change ignored', hunks('a  b \t', 'a\tb', { ...O, whitespace: 'change' }), []);
check('whitespace change keeps its presence', hunks('ab', 'a b', { ...O, whitespace: 'change' }), [[0, 1, 0, 1]]);
check('all whitespace ignored', hunks('ab', ' a b ', { ...O, whitespace: 'all' }), []);
check('case ignored', hunks('Hello', 'hELLO', { ...O, ignoreCase: true }), []);
check('line endings ignored by default', D.lineKey('a', '\r\n', O) === D.lineKey('a', '\n', O), true);
check('line endings compared', D.lineKey('a', '\r\n', { ...O, ignoreEol: false }) === D.lineKey('a', '\n', { ...O, ignoreEol: false }), false);
check('normalizes: defaults (endings)', D.normalizes(O), true);
check('normalizes: nothing ignored', D.normalizes({ ...O, ignoreEol: false }), false);

// Random: valid matches, and hunks that rebuild the right side.
let seed = 7;
const random = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const sequence = (n, alphabet) => Array.from({ length: n }, () => Math.floor(random() * alphabet));
let valid = true;
let rebuilt = true;
let optimal = true;
const lcs = (a, b) => {
  const row = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = 0;
    for (let j = 1; j <= b.length; j += 1) {
      const up = row[j];
      row[j] = a[i - 1] === b[j - 1] ? diagonal + 1 : Math.max(row[j], row[j - 1]);
      diagonal = up;
    }
  }
  return row[b.length];
};
for (let round = 0; round < 300; round += 1) {
  const a = sequence(Math.floor(random() * 40), 1 + Math.floor(random() * 6));
  const b = round % 3 ? a.map((x) => (random() < 0.2 ? Math.floor(random() * 6) : x)).filter(() => random() > 0.1) : sequence(Math.floor(random() * 40), 5);
  const matches = D.diffSequences(a, b);
  let ai = 0;
  let bi = 0;
  let total = 0;
  for (const m of matches) {
    if (m.a < ai || m.b < bi) valid = false;
    for (let k = 0; k < m.length; k += 1) if (a[m.a + k] !== b[m.b + k]) valid = false;
    ai = m.a + m.length;
    bi = m.b + m.length;
    total += m.length;
  }
  const out = [];
  let at = 0;
  for (const h of D.hunksOf(matches, a.length, b.length)) {
    out.push(...a.slice(at, h.a), ...b.slice(h.b, h.bEnd));
    at = h.aEnd;
  }
  out.push(...a.slice(at));
  if (JSON.stringify(out) !== JSON.stringify(b)) rebuilt = false;
  // Patience may give up a little length for readability; never much.
  if (total < lcs(a, b) * 0.97 - 1) optimal = false;
}
check('random: matches are equal and in order', valid, true);
check('random: hunks rebuild the right side', rebuilt, true);
check('random: close to the longest common subsequence', optimal, true);

// Large and wholly different: the budget ends it quickly.
const big = (n, offset) => Array.from({ length: n }, (_, i) => `line ${i * 7 + offset}`);
const started = Date.now();
const wide = D.diffKeys(big(20000, 1), big(20000, 2));
check('large different files finish', Date.now() - started < 5000, true);
check('large different files: one hunk', wide.length >= 1, true);
const shifted = D.diffKeys(big(50000, 0), ['new', ...big(50000, 0)]);
check('large file, one line added', shifted.map((h) => [h.a, h.aEnd, h.b, h.bEnd]), [[0, 0, 0, 1]]);

// Words inside a line
const inline = (a, b, mode = 'word', options = O) => D.inlineDiff(a, b, mode, options);
check('word changed', inline('const a = 1;', 'const b = 1;'), { a: [[6, 7]], b: [[6, 7]] });
check('words next to each other join', inline('one two three', 'one TWO THREE'), { a: [[4, 13]], b: [[4, 13]] });
check('word added', inline('a b', 'a x b'), { a: [], b: [[2, 4]] });
check('characters', inline('color', 'colour', 'char'), { a: [], b: [[4, 5]] });
check('none', inline('a', 'b', 'none'), { a: [], b: [] });
check('whitespace ignored inside a line', inline('a  b', 'a b', 'word', { ...O, whitespace: 'change' }), { a: [], b: [] });
check('case ignored inside a line', inline('Foo bar', 'foo BAR', 'word', { ...O, ignoreCase: true }), { a: [], b: [] });
check('unicode words', inline('привет мир', 'привет світ'), { a: [[7, 10]], b: [[7, 11]] });
const long = 'x'.repeat(30000);
check('very long lines: by their ends', inline(`${long}a${long}`, `${long}b${long}`), { a: [[30000, 30001]], b: [[30000, 30001]] });

// Pairing the lines of a changed stretch
const pairs = (a, b) => D.pairLines(a, b).map((p) => [p.a, p.b, p.similar]);
check('pairs: alike lines side by side', pairs(['let total = 0;', 'return total;'], ['let total = 1;', 'return total + 1;']), [
  [0, 0, true],
  [1, 1, true],
]);
check('pairs: an inserted line stands alone', pairs(['alpha beta gamma', 'delta epsilon'], ['alpha beta gamma!', 'brand new line here', 'delta epsilon!']), [
  [0, 0, true],
  [-1, 1, false],
  [1, 2, true],
]);
check('pairs: unlike lines still side by side', pairs(['aaaa'], ['zzzz']), [[0, 0, false]]);
check('pairs: one side empty', pairs(['a', 'b'], []), [
  [0, -1, false],
  [1, -1, false],
]);
check('similarity', [D.similarity('abcdef', 'abcdef'), D.similarity('abc', 'xyz')], [1, 0]);

done('diff');
