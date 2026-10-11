/**
 * src/core/rows.ts: hunks into rows and blocks, and rows into what the screen
 * shows — side by side, unified, with identical stretches folded.
 */
import { checker, load } from '../tools/load.mjs';

const { check, done } = checker();
const R = await load('core/rows', 'core/diff');
const O = R.DEFAULT_OPTIONS;

const source = (text) => {
  const lines = text ? text.split('\n') : [];
  return { lines, eols: lines.map(() => '\n') };
};
const compare = (a, b, options = O) => R.compareTexts(source(a), source(b), options);
const rows = (cmp) => cmp.rows.map((r) => `${r.kind}:${r.a}:${r.b}`);

const changed = compare('a\nb\nc', 'a\nB\nc');
check('a changed line', rows(changed), ['same:0:0', 'change:1:1', 'same:2:2']);
check('one block', changed.blocks, [{ start: 1, end: 2, ignored: false }]);
check('one difference', changed.differences, 1);

const added = compare('a\nc', 'a\nb\nc');
check('an added line', rows(added), ['same:0:0', 'ins:-1:1', 'same:1:2']);
check('tally', R.tally(compare('a\nb\nc\nd', 'a\nB\nc\nx\nd')), { changed: 1, added: 1, removed: 0 });

const blank = compare('a\n\nb', 'a\nb', { ...O, ignoreBlankLines: true });
check('blank lines: shown', rows(blank), ['same:0:0', 'del:1:-1', 'same:2:1']);
check('blank lines: not counted', [blank.blocks[0].ignored, blank.differences], [true, 0]);
check('blank lines counted by default', compare('a\n\nb', 'a\nb').differences, 1);

// Views
const long = Array.from({ length: 30 }, (_, i) => `line ${i}`);
const edited = [...long];
edited[15] = 'changed';
const cmp = compare(long.join('\n'), edited.join('\n'));
const view = (options) => R.buildView(cmp, { unified: false, collapse: false, context: 3, expanded: new Set(), ...options });
check('full view: every row', view({}).lines.length, 30);
const folded = view({ collapse: true });
const kinds = folded.lines.map((l) => (l.kind === 'fold' ? `fold:${l.start}-${l.end}` : l.row));
check('folded: context around the change', kinds, ['fold:0-12', 12, 13, 14, 15, 16, 17, 18, 'fold:19-30']);
check('folded: block position', folded.blocks, [[4, 5]]);
check('a fold opened', view({ collapse: true, expanded: new Set([19]) }).lines.length, 9 + 10);
check('nothing to fold without differences', R.buildView(compare('a\nb', 'a\nb'), { unified: false, collapse: true, context: 1, expanded: new Set() }).lines.length, 2);

const twoSided = compare('x\na\nb\ny', 'x\nA\nB\nC\ny');
const unified = R.buildView(twoSided, { unified: true, collapse: false, context: 3, expanded: new Set() });
check(
  'unified: the left lines, then the right ones',
  unified.lines.map((l) => `${l.part}:${l.row}`),
  ['both:0', 'a:1', 'a:2', 'b:1', 'b:2', 'b:3', 'both:4'],
);
check('unified: the block', unified.blocks, [[1, 6]]);
check('view line of a line', R.viewLineOf(unified, twoSided.rows, 1, 2), 4);
check('view line of a folded line', R.viewLineOf(folded, cmp.rows, 0, 3), -1);

done('rows');
