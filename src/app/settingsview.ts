/** The settings dialog, the keyboard help, and the compare options both share. */

import type { WhitespaceMode } from '../core/diff';
import type { CompareMethod } from '../core/folder';
import { LANGUAGES, t, type Language } from '../core/i18n';
import type { InlineMode } from '../core/inline';
import { CONTEXTS, FONT_SIZES, TAB_SIZES, type Layout, type Settings, type Theme } from './settings';
import { canUpdate, checkForUpdate, applyUpdate, updateState, type UpdateState } from './update';
import { checkbox, dialog, h, isMac, row, segmented, select } from './ui';

/** What a change touches, so the page redoes only that. */
export type Change = 'language' | 'theme' | 'text' | 'compare' | 'folders' | 'view';

export function compareControls(settings: Settings, changed: (what: Change) => void): HTMLElement[] {
  const c = settings.compare;
  return [
    row(
      t('settings', 'Whitespace'),
      select<WhitespaceMode>(
        [
          ['none', t('settings', 'Compare')],
          ['change', t('settings', 'Ignore changes in amount')],
          ['all', t('settings', 'Ignore all')],
        ],
        c.whitespace,
        (value) => {
          c.whitespace = value;
          changed('compare');
        },
      ),
    ),
    checkbox(t('settings', 'Ignore case'), c.ignoreCase, (value) => {
      c.ignoreCase = value;
      changed('compare');
    }),
    checkbox(t('settings', 'Ignore blank lines'), c.ignoreBlankLines, (value) => {
      c.ignoreBlankLines = value;
      changed('compare');
    }),
    checkbox(
      t('settings', 'Ignore line endings'),
      c.ignoreEol,
      (value) => {
        c.ignoreEol = value;
        changed('compare');
      },
      t('settings', 'CRLF (Windows), LF (macOS, Linux) and CR are the same.'),
    ),
  ];
}

export function inlineControl(settings: Settings, changed: (what: Change) => void): HTMLElement {
  return row(
    t('settings', 'Changes inside lines'),
    select<InlineMode>(
      [
        ['word', t('settings', 'Words')],
        ['char', t('settings', 'Characters')],
        ['none', t('settings', 'Off')],
      ],
      settings.inline,
      (value) => {
        settings.inline = value;
        changed('view');
      },
    ),
  );
}

export function layoutControl(settings: Settings, changed: (what: Change) => void): HTMLElement {
  return row(
    t('settings', 'Layout'),
    select<Layout>(
      [
        ['auto', t('settings', 'Automatic')],
        ['split', t('settings', 'Side by side')],
        ['unified', t('settings', 'One under the other')],
      ],
      settings.layout,
      (value) => {
        settings.layout = value;
        changed('view');
      },
    ),
  );
}

function updateLine(state: UpdateState): HTMLElement {
  const line = h('p', { class: 'version-line', 'data-setting': 'update' }, t('settings', 'Version {version}', { version: __APP_VERSION__ }));
  if (!canUpdate()) return line;
  const button = (label: string, action: () => void): HTMLButtonElement => {
    const node = h('button', { class: 'link-button', type: 'button', text: label });
    node.addEventListener('click', action);
    return node;
  };
  line.append(' · ');
  if (state.kind === 'ready') {
    line.append(
      state.version ? t('settings', 'Version {version} is ready.', { version: state.version }) : t('settings', 'A new version is ready.'),
      ' ',
      button(t('settings', 'Update'), applyUpdate),
    );
  } else if (state.kind === 'checking') line.append(t('settings', 'Checking…'));
  else {
    line.append(button(t('settings', 'Check for updates'), () => void checkForUpdate()));
    if (state.kind === 'latest') line.append(' ', t('settings', 'This is the latest version.'));
    if (state.kind === 'offline') line.append(' ', t('settings', 'No connection: could not check for updates.'));
  }
  return line;
}

let refreshUpdateLine: ((state: UpdateState) => void) | null = null;

/** The update state changed while the dialog is open. */
export function showUpdateState(state: UpdateState): void {
  refreshUpdateLine?.(state);
}

export function openSettings(settings: Settings, changed: (what: Change) => void, closed: () => void): void {
  dialog(
    t('settings', 'Settings'),
    (body) => {
      const general = h('section', { class: 'settings-section' }, h('h3', { text: t('settings', 'General') }));
      const languages: [Language | 'auto', string][] = [['auto', t('settings', 'Same as the system')], ...(Object.entries(LANGUAGES) as [Language, string][])];
      general.append(
        row(
          t('settings', 'Language'),
          select(languages, settings.language, (value) => {
            settings.language = value;
            changed('language');
          }),
        ),
        row(
          t('settings', 'Theme'),
          segmented<Theme>(
            [
              ['system', t('settings', 'System')],
              ['light', t('settings', 'Light')],
              ['dark', t('settings', 'Dark')],
            ],
            settings.theme,
            (value) => {
              settings.theme = value;
              changed('theme');
            },
          ),
        ),
      );

      const compare = h('section', { class: 'settings-section' }, h('h3', { text: t('settings', 'Comparing') }), ...compareControls(settings, changed), inlineControl(settings, changed));

      const exclude = h('textarea', { class: 'field', rows: '3', spellcheck: 'false' });
      exclude.value = settings.exclude;
      // On every keystroke: Escape closes the dialog without a change event.
      exclude.addEventListener('input', () => {
        settings.exclude = exclude.value;
        changed('folders');
      });
      const folders = h(
        'section',
        { class: 'settings-section' },
        h('h3', { text: t('settings', 'Folders') }),
        row(
          t('settings', 'Compare files by'),
          select<CompareMethod>(
            [
              ['content', t('settings', 'Contents')],
              ['quick', t('settings', 'Size and date')],
            ],
            settings.method,
            (value) => {
              settings.method = value;
              changed('compare');
            },
          ),
          t('settings', 'Size and date is quicker for large folders, but cannot tell two files of the same size apart.'),
        ),
        checkbox(t('settings', 'Ignore case in file names'), settings.ignoreNameCase, (value) => {
          settings.ignoreNameCase = value;
          changed('folders');
        }),
        row(t('settings', 'Leave out'), exclude, t('settings', 'Names or patterns, separated by semicolons: node_modules; *.log; build/ — a trailing slash means folders only.')),
      );

      const numbers = (list: number[]): [string, string][] => list.map((n) => [String(n), String(n)]);
      const view = h(
        'section',
        { class: 'settings-section' },
        h('h3', { text: t('settings', 'View') }),
        layoutControl(settings, changed),
        row(
          t('settings', 'Font size'),
          select(numbers(FONT_SIZES), String(settings.fontSize), (value) => {
            settings.fontSize = Number(value);
            changed('text');
          }),
        ),
        row(
          t('settings', 'Tab size'),
          select(numbers(TAB_SIZES), String(settings.tabSize), (value) => {
            settings.tabSize = Number(value);
            changed('text');
          }),
        ),
        row(
          t('settings', 'Lines around a difference'),
          select(numbers(CONTEXTS), String(settings.context), (value) => {
            settings.context = Number(value);
            changed('view');
          }),
          t('settings', 'Shown when identical lines are folded.'),
        ),
        checkbox(t('settings', 'Syntax colours'), settings.syntax, (value) => {
          settings.syntax = value;
          changed('view');
        }),
        checkbox(t('settings', 'Show whitespace and line endings'), settings.whitespace, (value) => {
          settings.whitespace = value;
          changed('view');
        }),
      );

      const about = h('section', { class: 'settings-section' }, h('h3', { text: t('settings', 'About') }));
      let line = updateLine(updateState());
      about.append(line, h('p', { class: 'setting-hint', text: t('settings', 'HTML Merge only reads: files are never changed, and nothing leaves this page.') }));
      refreshUpdateLine = (state) => {
        const next = updateLine(state);
        line.replaceWith(next);
        line = next;
      };
      body.append(general, compare, folders, view, about);
    },
    () => {
      refreshUpdateLine = null;
      closed();
    },
  );
}

export function openHelp(): void {
  const mod = isMac ? '⌘' : 'Ctrl';
  const keys: [string[], string][] = [
    [['Alt+↓', 'F7'], t('help', 'Next difference')],
    [['Alt+↑', '⇧F7'], t('help', 'Previous difference')],
    [[']'], t('help', 'Next different file')],
    [['['], t('help', 'Previous different file')],
    [[`${mod}+F`], t('help', 'Find in the files, or filter the folder list')],
    [['Enter', '⇧Enter'], t('help', 'Next or previous match')],
    [['↑ ↓ ← →'], t('help', 'Move through the folder list, open and close folders')],
    [['Enter'], t('help', 'Open the selected file')],
    [['Esc'], t('help', 'Back to the folder list')],
    [['F5'], t('help', 'Compare again')],
    [['?'], t('help', 'This help')],
  ];
  dialog(t('help', 'Keyboard shortcuts'), (body) => {
    const table = h('table', { class: 'keys' });
    for (const [combos, what] of keys) {
      const cell = h('td');
      combos.forEach((combo, i) => {
        if (i) cell.append(' ');
        cell.append(h('kbd', { text: combo }));
      });
      table.append(h('tr', {}, cell, h('td', { text: what })));
    }
    body.append(table);
  });
}
