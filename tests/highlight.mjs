/**
 * The highlighter (src/core/highlight.ts) and its grammars (src/core/languages.ts):
 * a line or two of each common language, coloured as a reader would expect,
 * comments and strings that span lines, HTML with script and style inside,
 * which language a file is in — and every grammar run over sample text
 * without getting stuck.
 */
import { checker, load } from '../tools/load.mjs';

const { check, done } = checker();
const H = await load('core/highlight', 'core/languages');

/** The coloured pieces of each line, as "type:text". */
const paint = (id, text) => {
  const lines = text.split('\n');
  const grammar = H.grammarById(id);
  if (!grammar) throw new Error(`no grammar ${id}`);
  return H.tokenize(lines, grammar).map((tokens, i) => {
    const out = [];
    for (let k = 0; k < tokens.length; k += 3) out.push(`${H.TOKEN_TYPES[tokens[k + 2]]}:${lines[i].slice(tokens[k], tokens[k + 1])}`);
    return out;
  });
};
const flat = (id, text) => paint(id, text).flat();

check('js: keywords, numbers, strings', flat('javascript', `const answer = 42; // the answer`), ['keyword:const', 'number:42', 'comment:// the answer']);
check('js: strings and escapes', flat('javascript', `'it\\'s'`), ["string:'it", "escape:\\'", "string:s'"]);
check('js: template with an expression', flat('javascript', 'const s = `a ${b + 1} c`;'), [
  'keyword:const',
  'string:`a ',
  'variable:${',
  'number:1',
  'variable:}',
  'string: c`',
]);
check('js: nested braces inside a template', flat('javascript', '`${ {a: 1}.a }`'), ['string:`', 'variable:${', 'number:1', 'variable:}', 'string:`']);
check('js: a regular expression', flat('javascript', 'const re = /a+b/g;'), ['keyword:const', 'regex:/a+b/g']);
check('js: a division is no regex', flat('javascript', 'x = a / b / c;'), []);
check('js: calls and types', flat('javascript', 'x instanceof Map; run(x);'), ['keyword:instanceof', 'type:Map', 'function:run']);
check('js: block comment over lines', paint('javascript', 'a /* one\ntwo */ b'), [['comment:/* one'], ['comment:two */']]);
check('ts: types', flat('typescript', 'let n: number = 1 as const;'), ['keyword:let', 'type:number', 'number:1', 'keyword:as', 'keyword:const']);
check('python: def, string, comment', flat('python', 'def f(x): return "hi"  # done'), ['keyword:def', 'function:f', 'keyword:return', 'string:"hi"', 'comment:# done']);
check('python: triple quotes over lines', paint('python', 'x = """one\ntwo"""\ny = 1'), [['string:"""one'], ['string:two"""'], ['number:1']]);
check('python: decorator', flat('python', '@property'), ['meta:@property']);
check('c: preprocessor', flat('c', '#include <stdio.h>'), ['meta:#include']);
check('c: types', flat('c', 'unsigned int x = 0x1F;'), ['type:unsigned', 'type:int', 'number:0x1F']);
check('rust: lifetimes, chars, macros', flat('rust', "fn f<'a>(c: char) { println!(\"{}\", 'x'); }"), [
  'keyword:fn',
  "meta:'a",
  'type:char',
  'function:println!',
  'string:"{}"',
  "string:'x'",
]);
check('go: raw strings over lines', paint('go', 'x := `a\nb`'), [['string:`a'], ['string:b`']]);
check('csharp: verbatim string', flat('csharp', 'var p = @"C:\\dir";'), ['keyword:var', 'string:@"C:\\dir"']);
check('java: annotation', flat('java', '@Override public void run() {}'), ['meta:@Override', 'keyword:public', 'type:void', 'function:run']);
check('sql: any case', flat('sql', "SELECT name FROM users WHERE id = 'x';"), ['keyword:SELECT', 'keyword:FROM', 'keyword:WHERE', "string:'x'"]);
check('shell: variables and comments', flat('shell', 'echo "$HOME" # home'), ['function:echo', 'string:"', 'variable:$HOME', 'string:"', 'comment:# home']);
check('shell: no comment inside a word', flat('shell', 'a#b'), []);
check('json: keys and values', flat('json', '{"a": true, "b": "x", "c": 1.5}'), ['property:"a"', 'literal:true', 'property:"b"', 'string:"x"', 'property:"c"', 'number:1.5']);
check('yaml: keys and comments', flat('yaml', 'name: app # the name'), ['property:name', 'comment:# the name']);
check('yaml: url is no key', flat('yaml', 'url: http://example.com'), ['property:url']);
check('css: selectors and properties', flat('css', '.btn:hover { color: #fff; margin: 0 4px; }'), [
  'selector:.btn',
  'meta::hover',
  'property:color',
  'number:#fff',
  'property:margin',
  'number:0',
  'number:4px',
]);
check('markdown: heading, emphasis, code', flat('markdown', '# Title').concat(flat('markdown', 'Some **bold** and `code`')), ['heading:# Title', 'strong:**bold**', 'code:`code`']);
check('markdown: fenced code over lines', paint('markdown', '```js\nconst a = 1;\n```\ntext'), [['code:```js'], ['code:const a = 1;'], ['code:```'], []]);
check('diff: added and removed lines', paint('diff', '@@ -1 +1 @@\n-old\n+new'), [['meta:@@ -1 +1 @@'], ['deleted:-old'], ['inserted:+new']]);
check('ini: sections and keys', paint('ini', '[core]\nname = value ; not a comment here'), [['section:[core]'], ['property:name']]);

// Markup, and languages inside it
check('html: tags and attributes', flat('html', '<a href="x">link</a>'), ['tag:<a', 'attr:href', 'string:"x"', 'tag:>', 'tag:</a>']);
check('html: a comment over lines', paint('html', '<!-- a\nb -->'), [['comment:<!-- a'], ['comment:b -->']]);
check('html: script inside', paint('html', '<script>\nconst a = "</b>";\n</script>\n<p>'), [
  ['tag:<script>'],
  ['keyword:const', 'string:"</b>"'],
  ['tag:</script>'],
  ['tag:<p>'],
]);
check('html: style inside', flat('html', '<style> p { color: red }</style>'), ['tag:<style>', 'tag:p', 'property:color', 'literal:red', 'tag:</style>']);
check('html: a script tag inside a script string ends it', paint('html', '<script>var s = "</script> <b>"')[0], ['tag:<script>', 'keyword:var', 'string:"', 'tag:</script>', 'tag:<b>']);
check('xml: declaration and entities', flat('xml', '<?xml version="1.0"?><a>&amp;</a>'), ['meta:<?xml version="1.0"?>', 'tag:<a>', 'escape:&amp;', 'tag:</a>']);

// Which language
const detect = (name, first) => H.detectGrammar(name, first).id;
check('by extension', ['a.ts', 'b.PY', 'c.rs', 'd.vue', 'e.yml', 'f.txt'].map((n) => detect(n)), ['typescript', 'python', 'rust', 'html', 'yaml', 'plain']);
check('by name', ['Dockerfile', 'Makefile', 'CMakeLists.txt', '.gitignore', '.env.local', 'Gemfile'].map((n) => detect(n)), ['dockerfile', 'makefile', 'cmake', 'ignore', 'ini', 'ruby']);
check('by the first line', [detect('run', '#!/usr/bin/env python3'), detect('x', '#!/bin/bash'), detect('y', '<?xml version="1.0"?>')], ['python', 'shell', 'xml']);

// Every grammar over a mixed sample: no endless loop, tokens inside their lines, in order.
const sample = [
  'function f(a, b) { return a / b; } // comment',
  '/* block',
  'comment */ "string \\" with escape" \'c\' `tpl ${x}`',
  '# hash comment <tag attr="v"> &amp; $var @deco 0x1F 3.14e10',
  '<!-- markup --> <script>if (x) {}</script> <style>a{b:c}</style>',
  '""" triple """ \'\'\' triple \'\'\' [section] key = value',
  '--sql comment ; ini comment {- haskell -} (* pascal *) %VAR% REM',
  '',
  '\t  unterminated "string',
];
let sane = true;
for (const grammar of H.GRAMMARS) {
  const tokens = H.tokenize(sample, grammar);
  tokens.forEach((list, i) => {
    let last = 0;
    for (let k = 0; k < list.length; k += 3) {
      if (list[k] < last || list[k + 1] <= list[k] || list[k + 1] > sample[i].length) sane = false;
      last = list[k + 1];
    }
  });
}
check('every grammar: tokens in order, inside their lines', sane, true);
check('grammars have unique ids', new Set(H.GRAMMARS.map((g) => g.id)).size, H.GRAMMARS.length);

// Speed: a large file is coloured in reasonable time, and past the budget left plain.
const big = Array.from({ length: 20000 }, (_, i) => `  const value${i} = compute("text", ${i}) /* note */ + other[${i}]; // tail`);
const started = Date.now();
H.tokenize(big, H.grammarById('typescript'));
check('20 000 lines in under 3 s', Date.now() - started < 3000, true);
// A long line costs its length, not its length squared: no rule may scan to the end of the line from every token.
const longLines = ['word '.repeat(20000), 'QUJD'.repeat(25000), '[a '.repeat(15000), '*a '.repeat(15000), '`a '.repeat(15000), '"a '.repeat(15000), 'a:b '.repeat(15000)];
let slowest = '';
let slowestMs = 0;
for (const grammar of H.GRAMMARS) {
  for (const line of longLines) {
    const at = Date.now();
    H.tokenize([line], grammar);
    const ms = Date.now() - at;
    if (ms > slowestMs) [slowest, slowestMs] = [`${grammar.id} ${line.slice(0, 4)}`, ms];
  }
}
check(`long lines: every grammar quick (slowest ${slowest})`, slowestMs < 400, true);
check('past the budget, plain', H.tokenize(['abc const', 'const x'], H.grammarById('javascript'), 5), [[], []]);

done('highlight');
