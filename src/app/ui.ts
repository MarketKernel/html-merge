/** Elements, icons, dialogs, popovers and toasts — enough to avoid native prompts. */

import { t } from '../core/i18n';

type Child = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<Record<string, string>> = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) if (child !== null && child !== undefined && child !== false) node.append(child);
  return node;
}

export const $ = <T extends HTMLElement = HTMLElement>(selector: string, root: ParentNode = document): T => {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`Missing ${selector}`);
  return found;
};

/** Stroke icons, 24×24, as path data. */
const ICONS = {
  folder: 'M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5z',
  file: 'M14 3H7.5A2.5 2.5 0 0 0 5 5.5v13A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V8zM14 3v5h5',
  chevron: 'M9 6l6 6-6 6',
  close: 'M6 6l12 12M18 6L6 18',
  arrows: 'M7 7h13M16 3l4 4-4 4M17 17H4M8 13l-4 4 4 4',
  pair: 'M8 7l-4 5 4 5M16 7l4 5-4 5',
  unfold: 'M12 3v6M9 6l3 3 3-3M12 21v-6M9 18l3-3 3 3M4 12h16',
  tree: 'M5 4v15h5M5 10h5M14 6h6M14 12h6M14 18h6',
  list: 'M4 6h16M4 12h16M4 18h16',
} as const;

export type IconName = keyof typeof ICONS;

export function icon(name: IconName): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', ICONS[name]);
  svg.append(path);
  return svg;
}

/** The same icon as markup, for rows built as HTML strings. */
export function iconHtml(name: IconName): string {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char] as string);
}

export const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** A touch screen without a mouse: no keyboard hints there. */
export const isTouch = (): boolean => matchMedia('(hover: none)').matches;

/* ------------------------------------------------------------------ *
 * Toasts
 * ------------------------------------------------------------------ */

let toastNode: HTMLDivElement | null = null;
let toastTimer = 0;

export function toast(message: string, kind: 'info' | 'error' = 'info', ms = 3200): void {
  if (!toastNode) {
    toastNode = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
    document.body.append(toastNode);
  }
  const node = toastNode;
  node.textContent = message;
  node.classList.toggle('toast--error', kind === 'error');
  // Restart the transition for a message that replaces one still showing.
  node.classList.remove('toast--shown');
  void node.offsetWidth;
  node.classList.add('toast--shown');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => node.classList.remove('toast--shown'), ms);
}

/* ------------------------------------------------------------------ *
 * Dialogs
 * ------------------------------------------------------------------ */

export interface DialogHandle {
  close(): void;
  body: HTMLElement;
  foot: HTMLElement;
}

let openDialog: DialogHandle | null = null;

export const dialogOpen = (): boolean => openDialog !== null || openPopover !== null;

/** A modal dialog; Escape, the close button and a click beside it close it. */
export function dialog(title: string, build: (body: HTMLElement, foot: HTMLElement) => void, onClose?: () => void): DialogHandle {
  openDialog?.close();
  closePopover();
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const close = h('button', { class: 'icon-button', type: 'button', 'aria-label': t('dialog', 'Close'), title: t('dialog', 'Close') }, icon('close'));
  const body = h('div', { class: 'dialog-body' });
  const foot = h('div', { class: 'dialog-foot' });
  const box = h('div', { class: 'dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': title }, h('div', { class: 'dialog-head' }, h('h2', { text: title }), close), body, foot);
  const overlay = h('div', { class: 'overlay' }, box);
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      handle.close();
    }
  };
  const handle: DialogHandle = {
    body,
    foot,
    close() {
      if (openDialog !== handle) return;
      openDialog = null;
      overlay.remove();
      document.removeEventListener('keydown', onKey, true);
      onClose?.();
      previous?.focus();
    },
  };
  build(body, foot);
  if (!foot.childElementCount) foot.remove();
  close.addEventListener('click', () => handle.close());
  overlay.addEventListener('mousedown', (event) => {
    if (event.target === overlay) handle.close();
  });
  document.addEventListener('keydown', onKey, true);
  document.body.append(overlay);
  openDialog = handle;
  (box.querySelector<HTMLElement>('input, select, textarea, .dialog-body button') ?? close).focus();
  return handle;
}

/* ------------------------------------------------------------------ *
 * Popovers
 * ------------------------------------------------------------------ */

let openPopover: { node: HTMLElement; anchor: HTMLElement; cleanup: () => void } | null = null;

export function closePopover(): void {
  if (!openPopover) return;
  const { node, cleanup, anchor } = openPopover;
  openPopover = null;
  node.remove();
  cleanup();
  anchor.setAttribute('aria-expanded', 'false');
}

/** A panel under `anchor`; a second click on the anchor, Escape or a click elsewhere closes it. */
export function popover(anchor: HTMLElement, build: (node: HTMLElement) => void): void {
  if (openPopover?.anchor === anchor) {
    closePopover();
    return;
  }
  closePopover();
  const node = h('div', { class: 'popover', role: 'dialog' });
  build(node);
  document.body.append(node);
  const place = (): void => {
    const box = anchor.getBoundingClientRect();
    const width = node.offsetWidth;
    const left = Math.max(8, Math.min(window.innerWidth - width - 8, box.right - width));
    node.style.left = `${left}px`;
    node.style.top = `${box.bottom + 6}px`;
  };
  place();
  const onDown = (event: Event): void => {
    const target = event.target as Node;
    if (!node.contains(target) && !anchor.contains(target)) closePopover();
  };
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closePopover();
      anchor.focus();
    }
  };
  document.addEventListener('pointerdown', onDown, true);
  document.addEventListener('keydown', onKey, true);
  window.addEventListener('resize', place);
  anchor.setAttribute('aria-expanded', 'true');
  openPopover = {
    node,
    anchor,
    cleanup: () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', place);
    },
  };
}

/* ------------------------------------------------------------------ *
 * Form pieces for settings and popovers
 * ------------------------------------------------------------------ */

export function checkbox(label: string, checked: boolean, onChange: (value: boolean) => void, hint?: string): HTMLLabelElement {
  const input = h('input', { type: 'checkbox' });
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));
  return h('label', { class: 'setting setting--check' }, input, h('span', {}, label, hint ? h('span', { class: 'setting-hint', text: hint }) : null));
}

export function select<T extends string>(options: readonly (readonly [T, string])[], value: T, onChange: (value: T) => void): HTMLSelectElement {
  const node = h('select', { class: 'field' });
  for (const [key, label] of options) {
    const option = h('option', { value: key, text: label });
    option.selected = key === value;
    node.append(option);
  }
  node.addEventListener('change', () => onChange(node.value as T));
  return node;
}

export function segmented<T extends string>(options: readonly (readonly [T, string])[], value: T, onChange: (value: T) => void): HTMLDivElement {
  const node = h('div', { class: 'segmented', role: 'group' });
  const buttons = options.map(([key, label]) => {
    const button = h('button', { type: 'button', text: label, 'aria-pressed': String(key === value) });
    button.addEventListener('click', () => {
      for (const other of buttons) other.setAttribute('aria-pressed', String(other === button));
      onChange(key);
    });
    node.append(button);
    return button;
  });
  return node;
}

export function row(label: string, control: HTMLElement, hint?: string): HTMLDivElement {
  const id = `f${Math.random().toString(36).slice(2, 8)}`;
  if (control instanceof HTMLSelectElement || control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) control.id = id;
  return h(
    'div',
    { class: 'setting' },
    h('label', { for: id, text: label }),
    h('div', {}, control, hint ? h('span', { class: 'setting-hint', text: hint }) : null),
  );
}
