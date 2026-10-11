/** Preferences, remembered in localStorage between sessions; every field is checked when read. */

import { DEFAULT_OPTIONS, type CompareOptions, type WhitespaceMode } from '../core/diff';
import { DEFAULT_EXCLUDE, type CompareMethod, type Shown } from '../core/folder';
import { detectLanguage, isLanguage, type Language } from '../core/i18n';
import type { InlineMode } from '../core/inline';

export type Theme = 'system' | 'light' | 'dark';
export type Layout = 'auto' | 'split' | 'unified';

export interface Settings {
  /** 'auto' follows the browser's languages. */
  language: Language | 'auto';
  theme: Theme;
  compare: CompareOptions;
  /** What changed inside a changed line: words, characters, or nothing. */
  inline: InlineMode;
  method: CompareMethod;
  /** Names and paths left out of folder comparisons. */
  exclude: string;
  /** Name.TXT and name.txt are the same file. */
  ignoreNameCase: boolean;
  /** Side by side, one under the other, or side by side unless the screen is narrow. */
  layout: Layout;
  fold: boolean;
  context: number;
  syntax: boolean;
  whitespace: boolean;
  tabSize: number;
  fontSize: number;
  show: Shown;
  flat: boolean;
}

const KEY = 'html-merge';

export const TAB_SIZES = [2, 3, 4, 8];
export const FONT_SIZES = [11, 12, 13, 14, 15, 16, 18];
export const CONTEXTS = [0, 1, 2, 3, 5, 10];

const DEFAULTS: Settings = {
  language: 'auto',
  theme: 'system',
  compare: { ...DEFAULT_OPTIONS },
  inline: 'word',
  method: 'content',
  exclude: DEFAULT_EXCLUDE,
  ignoreNameCase: false,
  layout: 'auto',
  fold: false,
  context: 3,
  syntax: true,
  whitespace: false,
  tabSize: 4,
  fontSize: 13,
  show: { same: true, different: true, left: true, right: true },
  flat: false,
};

const pick = <T>(value: unknown, choices: readonly T[], fallback: T): T => (choices.includes(value as T) ? (value as T) : fallback);
const flag = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback);

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const stored = JSON.parse(raw) as Partial<Omit<Settings, 'compare' | 'show'>> & { compare?: Partial<CompareOptions>; show?: Partial<Shown> };
    const compare: Partial<CompareOptions> = stored.compare ?? {};
    const show: Partial<Shown> = stored.show ?? {};
    return {
      language: isLanguage(stored.language) ? stored.language : 'auto',
      theme: pick<Theme>(stored.theme, ['system', 'light', 'dark'], DEFAULTS.theme),
      compare: {
        whitespace: pick<WhitespaceMode>(compare.whitespace, ['none', 'change', 'all'], DEFAULT_OPTIONS.whitespace),
        ignoreCase: flag(compare.ignoreCase, DEFAULT_OPTIONS.ignoreCase),
        ignoreBlankLines: flag(compare.ignoreBlankLines, DEFAULT_OPTIONS.ignoreBlankLines),
        ignoreEol: flag(compare.ignoreEol, DEFAULT_OPTIONS.ignoreEol),
      },
      inline: pick<InlineMode>(stored.inline, ['word', 'char', 'none'], DEFAULTS.inline),
      method: pick<CompareMethod>(stored.method, ['content', 'quick'], DEFAULTS.method),
      exclude: typeof stored.exclude === 'string' ? stored.exclude.slice(0, 4000) : DEFAULTS.exclude,
      ignoreNameCase: flag(stored.ignoreNameCase, DEFAULTS.ignoreNameCase),
      layout: pick<Layout>(stored.layout, ['auto', 'split', 'unified'], DEFAULTS.layout),
      fold: flag(stored.fold, DEFAULTS.fold),
      context: pick(Number(stored.context), CONTEXTS, DEFAULTS.context),
      syntax: flag(stored.syntax, DEFAULTS.syntax),
      whitespace: flag(stored.whitespace, DEFAULTS.whitespace),
      tabSize: pick(Number(stored.tabSize), TAB_SIZES, DEFAULTS.tabSize),
      fontSize: pick(Number(stored.fontSize), FONT_SIZES, DEFAULTS.fontSize),
      show: {
        same: flag(show.same, true),
        different: flag(show.different, true),
        left: flag(show.left, true),
        right: flag(show.right, true),
      },
      flat: flag(stored.flat, DEFAULTS.flat),
    };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* private mode or a full quota — the page works either way */
  }
}

export function resolveLanguage(choice: Settings['language']): Language {
  return choice === 'auto' ? detectLanguage() : choice;
}

export function applyTheme(theme: Theme): void {
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset['theme'] = dark ? 'dark' : 'light';
}

export function applyText(settings: Settings): void {
  const style = document.documentElement.style;
  style.setProperty('--code-size', `${settings.fontSize}px`);
  style.setProperty('--lh', `${Math.round(settings.fontSize * 1.54)}px`);
  style.setProperty('--tab', String(settings.tabSize));
}

/** Side by side, unless the setting says otherwise or a phone's screen is too narrow for two columns. */
export function isUnified(settings: Settings): boolean {
  if (settings.layout === 'auto') return window.innerWidth < 760;
  return settings.layout === 'unified';
}
