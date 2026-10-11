/**
 * Files that are not text: pictures side by side, and binary files as the
 * bytes around the first place they differ.
 */

import { formatNumber, formatSize } from '../core/format';
import { t } from '../core/i18n';
import { bytesEqual, firstDifference } from '../core/text';
import { h } from './ui';

export interface MediaSide {
  name: string;
  bytes: Uint8Array | null;
}

const MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  avif: 'image/avif',
};

function verdict(left: MediaSide, right: MediaSide): string {
  if (!left.bytes) return t('file', 'Only on the right');
  if (!right.bytes) return t('file', 'Only on the left');
  return bytesEqual(left.bytes, right.bytes) ? t('file', 'The files are identical') : t('file', 'The files are different');
}

/** Two pictures; returns what frees their object URLs. */
export function showImages(host: HTMLElement, left: MediaSide, right: MediaSide): () => void {
  const urls: string[] = [];
  const side = (item: MediaSide, which: 'left' | 'right'): HTMLElement => {
    const box = h('div', { class: `media-side media-side--${which}` });
    if (!item.bytes) {
      box.append(h('p', { class: 'file-message', text: t('file', 'No file on this side') }));
      return box;
    }
    const ext = item.name.split('.').pop()?.toLowerCase() ?? '';
    const url = URL.createObjectURL(new Blob([item.bytes as BlobPart], { type: MIME[ext] ?? 'application/octet-stream' }));
    urls.push(url);
    const caption = h('p', { class: 'media-caption', text: formatSize(item.bytes.length) });
    const image = h('img', { src: url, alt: item.name });
    image.addEventListener('load', () => {
      caption.textContent = `${image.naturalWidth} × ${image.naturalHeight} · ${formatSize(item.bytes?.length ?? 0)}`;
    });
    image.addEventListener('error', () => {
      caption.textContent = t('file', 'The browser cannot show this picture');
    });
    box.append(image, caption);
    return box;
  };
  host.replaceChildren(h('div', { class: 'media' }, h('p', { class: 'media-note', text: verdict(left, right) }), side(left, 'left'), side(right, 'right')));
  return () => urls.forEach((url) => URL.revokeObjectURL(url));
}

const ROW = 16;
const ROWS = 12;

/** A hex dump of `rows` rows from `offset`, the bytes that differ from `other` marked. */
function dump(bytes: Uint8Array, other: Uint8Array | null, offset: number): HTMLElement {
  const pre = h('div', { class: 'hex' });
  for (let row = 0; row < ROWS; row += 1) {
    const at = offset + row * ROW;
    if (at >= bytes.length) break;
    const line = h('div', {}, h('span', { class: 'off', text: `${at.toString(16).padStart(8, '0')}  ` }));
    let ascii = '';
    for (let i = 0; i < ROW; i += 1) {
      const index = at + i;
      if (index >= bytes.length) {
        line.append('   ');
        continue;
      }
      const value = bytes[index] as number;
      const text = value.toString(16).padStart(2, '0');
      if (other && other[index] !== value) line.append(h('span', { class: 'bd', text }), ' ');
      else line.append(`${text} `);
      ascii += value >= 0x20 && value < 0x7f ? String.fromCharCode(value) : '.';
    }
    line.append(` ${ascii}`);
    pre.append(line);
  }
  return pre;
}

export function showBinary(host: HTMLElement, left: MediaSide, right: MediaSide): void {
  const first = left.bytes && right.bytes ? firstDifference(left.bytes, right.bytes) : 0;
  const offset = Math.max(0, Math.floor(Math.max(0, first) / ROW) * ROW - ROW * 2);
  let note = verdict(left, right);
  if (left.bytes && right.bytes && first >= 0) note += ` · ${t('file', 'First difference at byte {offset}', { offset: formatNumber(first) })}`;
  const side = (item: MediaSide, other: MediaSide, which: 'left' | 'right'): HTMLElement => {
    const box = h('div', { class: `media-side media-side--${which}` });
    if (!item.bytes) {
      box.append(h('p', { class: 'file-message', text: t('file', 'No file on this side') }));
      return box;
    }
    box.append(h('p', { class: 'media-caption', text: `${t('file', 'Binary file')} · ${formatSize(item.bytes.length)}` }), dump(item.bytes, other.bytes, offset));
    return box;
  };
  host.replaceChildren(h('div', { class: 'media' }, h('p', { class: 'media-note', text: note }), side(left, right, 'left'), side(right, left, 'right')));
}
