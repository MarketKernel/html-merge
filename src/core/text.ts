/**
 * Bytes into text: binary or not, the encoding, the lines and their endings.
 *
 * A byte order mark names the encoding; without one the bytes are tried as
 * UTF-8, and what is not valid UTF-8 is read as Windows-1252, the most common
 * single-byte encoding, so no file fails to open. A NUL byte near the start
 * makes a file binary, as it does for git and GNU diff.
 */

export interface TextFile {
  text: string;
  /** Without their line endings. */
  lines: string[];
  /** '\n', '\r\n', '\r', or '' for a last line with none. */
  eols: string[];
  encoding: string;
  /** LF, CRLF, CR, Mixed, or '' for a file of one line without an ending. */
  eol: string;
}

const SNIFF = 8000;

export function isBinary(bytes: Uint8Array): boolean {
  if (bom(bytes)?.startsWith('UTF-16')) return false;
  const end = Math.min(bytes.length, SNIFF);
  for (let i = 0; i < end; i += 1) if (bytes[i] === 0) return true;
  return false;
}

function bom(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return 'UTF-8 BOM';
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return 'UTF-16 LE';
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return 'UTF-16 BE';
  return null;
}

export function decode(bytes: Uint8Array): { text: string; encoding: string } {
  const marked = bom(bytes);
  if (marked === 'UTF-8 BOM') return { text: new TextDecoder('utf-8').decode(bytes.subarray(3)), encoding: marked };
  if (marked === 'UTF-16 LE') return { text: new TextDecoder('utf-16le').decode(bytes.subarray(2)), encoding: marked };
  if (marked === 'UTF-16 BE') return { text: new TextDecoder('utf-16be').decode(bytes.subarray(2)), encoding: marked };
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes), encoding: ascii(bytes) ? 'ASCII' : 'UTF-8' };
  } catch {
    return { text: new TextDecoder('windows-1252').decode(bytes), encoding: 'Windows-1252' };
  }
}

function ascii(bytes: Uint8Array): boolean {
  for (let i = 0; i < bytes.length; i += 1) if ((bytes[i] as number) > 0x7f) return false;
  return true;
}

export function splitLines(text: string): { lines: string[]; eols: string[] } {
  const lines: string[] = [];
  const eols: string[] = [];
  const pattern = /\r\n|\n|\r/g;
  let start = 0;
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    lines.push(text.slice(start, match.index));
    eols.push(match[0]);
    start = match.index + match[0].length;
  }
  if (start < text.length) {
    lines.push(text.slice(start));
    eols.push('');
  }
  return { lines, eols };
}

export function eolStyle(eols: readonly string[]): string {
  const seen = new Set(eols.filter(Boolean));
  if (seen.size > 1) return 'Mixed';
  const [only] = seen;
  return only === '\r\n' ? 'CRLF' : only === '\r' ? 'CR' : only === '\n' ? 'LF' : '';
}

export function readText(bytes: Uint8Array): TextFile {
  const { text, encoding } = decode(bytes);
  const { lines, eols } = splitLines(text);
  return { text, lines, eols, encoding, eol: eolStyle(eols) };
}

export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let i = 0;
  // Four bytes at a time where both are aligned for it.
  if (a.byteOffset % 4 === 0 && b.byteOffset % 4 === 0) {
    const words = a.length >> 2;
    const wa = new Uint32Array(a.buffer, a.byteOffset, words);
    const wb = new Uint32Array(b.buffer, b.byteOffset, words);
    for (let w = 0; w < words; w += 1) if (wa[w] !== wb[w]) return false;
    i = words << 2;
  }
  for (; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  return true;
}

/** The first offset at which the two differ, or -1 when they are equal. */
export function firstDifference(a: Uint8Array, b: Uint8Array): number {
  const end = Math.min(a.length, b.length);
  for (let i = 0; i < end; i += 1) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : end;
}

const IMAGES = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'avif']);

/** A picture the browser shows itself. SVG is text, and compared as such. */
export function isImageName(name: string): boolean {
  return IMAGES.has(extension(name));
}

export function extension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

/** Columns a line takes on screen: tabs to the next stop, wide characters as two. */
export function columns(line: string, tabSize: number): number {
  if (!/[\tᄀ-￿]/.test(line)) return line.length;
  let width = 0;
  for (const char of line) {
    if (char === '\t') width += tabSize - (width % tabSize);
    else width += wide(char.codePointAt(0) as number) ? 2 : 1;
  }
  return width;
}

function wide(code: number): boolean {
  return (
    (code >= 0x1100 && code <= 0x115f) ||
    (code >= 0x2e80 && code <= 0xa4cf) ||
    (code >= 0xac00 && code <= 0xd7a3) ||
    (code >= 0xf900 && code <= 0xfaff) ||
    (code >= 0xfe30 && code <= 0xfe4f) ||
    (code >= 0xff00 && code <= 0xff60) ||
    (code >= 0xffe0 && code <= 0xffe6) ||
    code >= 0x1f300
  );
}
