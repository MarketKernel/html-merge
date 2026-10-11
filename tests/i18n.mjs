/**
 * The dictionaries in src/locales against the strings the interface shows:
 * no stale keys, the same placeholders as the English text, a form for every
 * plural category of the language — and the lookup itself in src/core/i18n.ts.
 * A string a dictionary lacks is only reported: it is shown in English.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { checker, load, root } from '../tools/load.mjs';
import { compare, dictionaries, extract } from '../tools/i18n.mjs';

const { check, done } = checker();
const I = await load('core/i18n');
const strings = await extract();
const all = await dictionaries();
const placeholders = (text) => [...new Set(text.match(/\{\w+\}/g) ?? [])].sort();

check('a dictionary per language', Object.keys(all).sort(), Object.keys(I.LANGUAGES).filter((code) => code !== 'en').sort());

for (const [language, dictionary] of Object.entries(all)) {
  const { missing, unused } = compare(strings, dictionary);
  check(`${language}: no unused strings`, unused, []);
  const lacking = Object.entries(missing).flatMap(([context, texts]) => Object.keys(texts).map((text) => `${context} / ${text}`));
  if (lacking.length) console.log(`  ${language}: ${lacking.length} strings not translated (shown in English)`);

  const categories = new Intl.PluralRules(language).resolvedOptions().pluralCategories.slice().sort();
  const problems = [];
  for (const [context, texts] of Object.entries(dictionary)) {
    for (const [text, value] of Object.entries(texts)) {
      const forms = strings[context]?.[text];
      if (forms === undefined) continue;
      const expected = placeholders(text);
      if (forms === null || typeof value === 'string') {
        if (typeof value !== 'string' || !value.trim()) problems.push(`${context} / ${text}: not a text`);
        else if (JSON.stringify(placeholders(value)) !== JSON.stringify(expected)) problems.push(`${context} / ${text}: placeholders ${placeholders(value)}`);
        continue;
      }
      if (!value || typeof value !== 'object') {
        problems.push(`${context} / ${text}: neither a text nor plural forms`);
        continue;
      }
      if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(categories)) {
        problems.push(`${context} / ${text}: forms ${Object.keys(value)}, the language has ${categories}`);
      }
      for (const [category, form] of Object.entries(value)) {
        // A form may leave the number out ("one entry"), never anything else.
        const needed = expected.filter((name) => name !== '{count}');
        const got = placeholders(form);
        if (!got.every((name) => expected.includes(name)) || !needed.every((name) => got.includes(name))) {
          problems.push(`${context} / ${text} [${category}]: placeholders ${got}`);
        }
      }
    }
  }
  check(`${language}: well-formed translations`, problems, []);
}

// A translator now and then writes a context a second time at the end of a dictionary;
// JSON.parse keeps the last one and the first one's strings are lost without a word.
for (const language of Object.keys(all)) {
  const text = await readFile(join(root, 'src', 'locales', `${language}.json`), 'utf8');
  const contexts = [...text.matchAll(/^  "([^"]+)": \{/gm)].map((m) => m[1]);
  check(`${language}: each context once`, contexts.length, new Set(contexts).size);
}

// The lookup
check('english by default', I.t('status', 'Identical'), 'Identical');
check('placeholders filled', I.t('settings', 'Version {version}', { version: '1.2.3' }), 'Version 1.2.3');
check('english plural: one', I.tn('folder', '{count} file', '{count} files', 1), '1 file');
check('english plural: other', I.tn('folder', '{count} file', '{count} files', 3), '3 files');
I.setLanguage('ru');
check('translated', I.t('status', 'Identical'), all.ru.status?.Identical ?? 'Identical');
check('unknown text stays english', I.t('status', 'No such thing'), 'No such thing');
check('unknown context stays english', I.t('nowhere', 'Identical'), 'Identical');
const files = all.ru.folder?.['{count} files'];
if (files) {
  check('russian plural: one', I.tn('folder', '{count} file', '{count} files', 21), files.one.replace('{count}', '21'));
  check('russian plural: few', I.tn('folder', '{count} file', '{count} files', 3), files.few.replace('{count}', '3'));
  check('russian plural: many', I.tn('folder', '{count} file', '{count} files', 11), files.many.replace('{count}', '11'));
}
check('left to right', I.isRightToLeft(), false);
I.setLanguage('uk');
const ukFiles = all.uk.folder?.['{count} files'];
if (ukFiles) {
  check('ukrainian plural: one', I.tn('folder', '{count} file', '{count} files', 1), ukFiles.one.replace('{count}', '1'));
  check('ukrainian plural: few', I.tn('folder', '{count} file', '{count} files', 22), ukFiles.few.replace('{count}', '22'));
  check('ukrainian plural: many', I.tn('folder', '{count} file', '{count} files', 5), ukFiles.many.replace('{count}', '5'));
}
I.setLanguage('ar');
check('arabic is right to left', I.isRightToLeft(), true);
I.setLanguage('en');
check('browser language', I.detectLanguage(['nl-NL', 'pt-BR', 'en']), 'pt');
check('browser language: ukrainian', I.detectLanguage(['uk-UA', 'ru', 'en']), 'uk');
check('browser language: none known', I.detectLanguage(['nl', 'sv']), 'en');
check('language names', Object.keys(I.LANGUAGES).length, 17);

done('i18n');
