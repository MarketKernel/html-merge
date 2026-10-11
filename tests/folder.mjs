/**
 * src/core/folder.ts: two trees merged into one, statuses from sizes, dates
 * and bytes, folder statuses from their contents, the rows the list shows
 * under its filters, and the exclude patterns.
 */
import { checker, load } from '../tools/load.mjs';

const { check, done } = checker();
const F = await load('core/folder', 'core/diff');
const O = F.DEFAULT_OPTIONS;

const file = (name, size = 1, modified = 1000) => ({ name, kind: 'file', size, modified });
const dir = (name, ...children) => ({ name, kind: 'dir', size: 0, modified: 0, children });

const left = dir('L', file('same.txt'), file('changed.js', 10), file('only-left.md'), dir('sub', file('deep.py', 5), file('x2.txt')), dir('gone', file('a')), file('Case.TXT'));
const right = dir('R', file('same.txt'), file('changed.js', 12), file('only-right.css'), dir('sub', file('deep.py', 5), file('x10.txt')), dir('new', file('b')), file('case.txt'));
const root = F.mergeTrees(left, right);
const summary = (item) => item.children.map((c) => `${c.kind === 'dir' ? `${c.name}/` : c.name}:${c.status}`);

check('merged, folders first, natural order', summary(root), [
  'gone/:left',
  'new/:right',
  'sub/:different',
  'Case.TXT:left',
  'case.txt:right',
  'changed.js:pending',
  'only-left.md:left',
  'only-right.css:right',
  'same.txt:pending',
]);
check('natural order inside', summary(root.children[2]), ['deep.py:pending', 'x2.txt:left', 'x10.txt:right']);
check('paths', root.children[2].children.map((c) => c.path), ['sub/deep.py', 'sub/x2.txt', 'sub/x10.txt']);
check('names without case', summary(F.mergeTrees(left, right, true)).filter((s) => /case/i.test(s)), ['Case.TXT:pending']);

// Quick statuses
check('quick: same size and date', F.quickStatus(file('a', 5, 1000), file('a', 5, 2500), 'quick', O), 'same');
check('quick: dates apart', F.quickStatus(file('a', 5, 1000), file('a', 5, 9000), 'quick', O), 'different');
check('content: both empty', F.quickStatus(file('a', 0), file('a', 0), 'content', O), 'same');
check('content: sizes differ, nothing ignored', F.quickStatus(file('a', 1), file('a', 2), 'content', { ...O, ignoreEol: false }), 'different');
check('content: sizes differ, endings ignored: read them', F.quickStatus(file('a', 1), file('a', 2), 'content', O), null);
check('content: same size: read them', F.quickStatus(file('a', 3), file('a', 3), 'content', { ...O, ignoreEol: false }), null);

const bytes = (text) => new TextEncoder().encode(text);
check('bytes equal', F.contentStatus(bytes('a\nb'), bytes('a\nb'), O), { status: 'same' });
check('only line endings differ', F.contentStatus(bytes('a\r\nb\r\n'), bytes('a\nb\n'), O), { status: 'same', note: 'text' });
check('line endings compared', F.contentStatus(bytes('a\r\nb'), bytes('a\nb'), { ...O, ignoreEol: false }), { status: 'different' });
check('whitespace ignored', F.contentStatus(bytes('a  b'), bytes('a b'), { ...O, whitespace: 'change' }), { status: 'same', note: 'text' });
check('blank lines ignored', F.contentStatus(bytes('a\n\n\nb'), bytes('a\nb'), { ...O, ignoreBlankLines: true }), { status: 'same', note: 'text' });
check('binary never normalized', F.contentStatus(new Uint8Array([0, 1, 13, 10]), new Uint8Array([0, 1, 10]), O), { status: 'different' });

// Folder statuses follow their files
const set = (path, status) => {
  const find = (item) => (item.path === path ? item : item.children.map(find).find(Boolean));
  find(root).status = status;
};
set('changed.js', 'different');
set('same.txt', 'same');
set('sub/deep.py', 'same');
F.aggregate(root);
check('a folder with a one-sided file differs', root.children[2].status, 'different');
check('the root differs', root.status, 'different');
const same = F.mergeTrees(dir('a', file('x')), dir('b', file('x')));
same.children[0].status = 'same';
F.aggregate(same);
check('a folder of same files is the same', same.status, 'same');
check('counts', F.countFiles(root), { same: 2, different: 1, left: 4, right: 4, error: 0, pending: 0 });

// What the list shows
const all = { same: true, different: true, left: true, right: true };
const list = (options) =>
  F.listRows(root, { show: all, filter: '', expanded: new Set(), flat: false, sort: 'name', descending: false, ...options }).map((item) => item.path);
check('closed folders', list({}), ['gone', 'new', 'sub', 'Case.TXT', 'case.txt', 'changed.js', 'only-left.md', 'only-right.css', 'same.txt']);
check('an open folder', list({ expanded: new Set(['sub']) }).slice(2, 6), ['sub', 'sub/deep.py', 'sub/x2.txt', 'sub/x10.txt']);
check('differences only', list({ show: { ...all, same: false }, expanded: new Set(['sub']) }), [
  'gone',
  'new',
  'sub',
  'sub/x2.txt',
  'sub/x10.txt',
  'Case.TXT',
  'case.txt',
  'changed.js',
  'only-left.md',
  'only-right.css',
]);
check('changed only', list({ show: { same: false, different: true, left: false, right: false } }), ['changed.js']);
check('a name filter opens folders', list({ filter: 'deep' }), ['sub', 'sub/deep.py']);
check('a pattern filter', list({ filter: '*.md' }), ['only-left.md']);
check('flat: files with paths', list({ flat: true, show: { ...all, same: false } }), [
  'gone/a',
  'new/b',
  'sub/x2.txt',
  'sub/x10.txt',
  'Case.TXT',
  'case.txt',
  'changed.js',
  'only-left.md',
  'only-right.css',
]);
check('sorted by status', list({ sort: 'status' }).slice(3, 6), ['changed.js', 'Case.TXT', 'only-left.md']);
check('folder paths', F.folderPaths(root), ['gone', 'new', 'sub']);

// Exclude patterns
const ex = F.excluder('.git; node_modules, *.log\nbuild/; docs/*.pdf');
check('a name anywhere', [ex('a/b/.git', '.git', true), ex('node_modules', 'node_modules', true)], [true, true]);
check('a pattern', [ex('x/y.log', 'y.log', false), ex('x/y.logs', 'y.logs', false)], [true, false]);
check('folders only', [ex('build', 'build', true), ex('build', 'build', false)], [true, false]);
check('a path from the top', [ex('docs/a.pdf', 'a.pdf', false), ex('other/docs/a.pdf', 'a.pdf', false)], [true, false]);
check('nothing excluded', F.excluder('')('a', 'a', false), false);
check('glob: ** crosses folders', F.globToRegExp('src/**/*.ts').test('src/a/b/c.ts'), true);
check('glob: **/ may be no folder at all', F.globToRegExp('src/**/*.ts').test('src/c.ts'), true);
check('glob: **/name is a whole name', [F.globToRegExp('**/build').test('a/build'), F.globToRegExp('**/build').test('prebuild'), F.globToRegExp('**/build').test('src/rebuild')], [true, false, false]);
check('glob: a trailing /**', [F.globToRegExp('docs/**').test('docs/a/b'), F.globToRegExp('docs/**').test('docsx')], [true, false]);

// Names without case: one-to-one, nothing lost
const caseTree = F.mergeTrees(dir('L', file('a.txt')), dir('R', file('A.txt'), file('a.txt')), true);
check('without case: one pair, one right only', caseTree.children.map((c) => `${c.left?.name ?? '-'}|${c.right?.name ?? '-'}`), ['a.txt|A.txt', '-|a.txt']);
check('unreadable: an error, not the same', F.quickStatus({ ...file('a', 0, 0), unreadable: true }, file('a', 0, 0), 'quick', O), 'error');

done('folder');
