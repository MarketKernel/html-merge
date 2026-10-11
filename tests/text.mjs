/**
 * src/core/text.ts: binary or text, the encoding, lines and their endings.
 */
import { checker, load } from '../tools/load.mjs';

const { check, done } = checker();
const T = await load('core/text');
const bytes = (...values) => new Uint8Array(values);
const utf8 = (text) => new TextEncoder().encode(text);

check('text is not binary', T.isBinary(utf8('hello\nworld')), false);
check('a NUL makes it binary', T.isBinary(bytes(0x50, 0x4b, 0x00, 0x03)), true);
check('UTF-16 with a mark is text', T.isBinary(bytes(0xff, 0xfe, 0x61, 0x00)), false);

check('ASCII', T.decode(utf8('plain')), { text: 'plain', encoding: 'ASCII' });
check('UTF-8', T.decode(utf8('héllo')), { text: 'héllo', encoding: 'UTF-8' });
check('UTF-8 with a mark', T.decode(bytes(0xef, 0xbb, 0xbf, 0x68, 0x69)), { text: 'hi', encoding: 'UTF-8 BOM' });
check('UTF-16 LE', T.decode(bytes(0xff, 0xfe, 0x68, 0x00, 0x69, 0x00)), { text: 'hi', encoding: 'UTF-16 LE' });
check('UTF-16 BE', T.decode(bytes(0xfe, 0xff, 0x00, 0x68, 0x00, 0x69)), { text: 'hi', encoding: 'UTF-16 BE' });
check('not UTF-8: Windows-1252', T.decode(bytes(0x63, 0x61, 0x66, 0xe9)), { text: 'café', encoding: 'Windows-1252' });

check('lines and endings', T.splitLines('a\r\nb\nc\rd'), { lines: ['a', 'b', 'c', 'd'], eols: ['\r\n', '\n', '\r', ''] });
check('a final ending adds no line', T.splitLines('a\nb\n'), { lines: ['a', 'b'], eols: ['\n', '\n'] });
check('empty text, no lines', T.splitLines(''), { lines: [], eols: [] });
check('blank line kept', T.splitLines('\n'), { lines: [''], eols: ['\n'] });
check('style: LF', T.eolStyle(['\n', '\n', '']), 'LF');
check('style: CRLF', T.eolStyle(['\r\n']), 'CRLF');
check('style: mixed', T.eolStyle(['\r\n', '\n']), 'Mixed');
check('style: none', T.eolStyle(['']), '');
const file = T.readText(utf8('x\r\ny\r\n'));
check('read text', [file.lines, file.eol, file.encoding], [['x', 'y'], 'CRLF', 'ASCII']);

check('equal bytes', T.bytesEqual(utf8('same text here'), utf8('same text here')), true);
check('unequal bytes', T.bytesEqual(utf8('same text here'), utf8('same text hEre')), false);
check('unequal lengths', T.bytesEqual(utf8('abc'), utf8('abcd')), false);
check('unaligned views', T.bytesEqual(utf8('xabcdefgh').subarray(1), utf8('abcdefgh')), true);
check('first difference', T.firstDifference(utf8('abcdef'), utf8('abcXef')), 3);
check('first difference: one is longer', T.firstDifference(utf8('abc'), utf8('abcd')), 3);
check('no difference', T.firstDifference(utf8('abc'), utf8('abc')), -1);

check('images by name', ['a.PNG', 'b.jpeg', 'c.svg', 'd.txt'].map(T.isImageName), [true, true, false, false]);
check('extension', [T.extension('a.tar.GZ'), T.extension('.gitignore'), T.extension('Makefile')], ['gz', '', '']);
check('columns: plain', T.columns('abc', 4), 3);
check('columns: tabs', T.columns('\ta\tb', 4), 9);
check('columns: wide characters', T.columns('日本', 4), 4);

done('text');
