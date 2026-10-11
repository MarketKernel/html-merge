/** Sizes, dates and numbers in the interface language. */

import { dateFormat, language } from './i18n';

const numbers = new Map<string, Intl.NumberFormat>();

function numberFormat(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${language()}|${JSON.stringify(options)}`;
  let format = numbers.get(key);
  if (!format) {
    format = new Intl.NumberFormat(language(), options);
    numbers.set(key, format);
  }
  return format;
}

export function formatNumber(value: number): string {
  return numberFormat({}).format(value);
}

const UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const;

/** 1.2 MB, in the language's own way of writing it; powers of 1024, as file managers count. */
export function formatSize(bytes: number): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  // "18 byte" reads oddly in a column of sizes; the narrow form is "18B", "18 Б".
  return numberFormat({ style: 'unit', unit: UNITS[unit], unitDisplay: unit === 0 ? 'narrow' : 'short', maximumFractionDigits: unit === 0 || value >= 100 ? 0 : 1 }).format(value);
}

export function formatDate(ms: number): string {
  if (!ms) return '';
  return dateFormat({ dateStyle: 'short', timeStyle: 'short' }).format(ms);
}
