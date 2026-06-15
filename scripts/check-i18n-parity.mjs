import { readFile } from 'node:fs/promises';

const locales = ['en', 'fr', 'de', 'es', 'ja', 'ko'];

function flatten(value, prefix = '') {
  if (Array.isArray(value)) return [prefix];
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, next]) => flatten(next, prefix ? `${prefix}.${key}` : key));
  }
  return [prefix];
}

const localeData = Object.fromEntries(
  await Promise.all(locales.map(async (locale) => {
    const raw = await readFile(`src/i18n/locales/${locale}.json`, 'utf8');
    return [locale, JSON.parse(raw).translation];
  })),
);

const baseKeys = new Set(flatten(localeData.en).filter(Boolean));
const failures = [];

for (const locale of locales.filter((locale) => locale !== 'en')) {
  const keys = new Set(flatten(localeData[locale]).filter(Boolean));
  for (const key of baseKeys) {
    if (!keys.has(key)) failures.push(`${locale}: missing ${key}`);
  }
}

if (failures.length) {
  console.error('i18n key parity failed:');
  failures.slice(0, 80).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 80) console.error(`...and ${failures.length - 80} more`);
  process.exit(1);
}

console.log('i18n key parity passed');
