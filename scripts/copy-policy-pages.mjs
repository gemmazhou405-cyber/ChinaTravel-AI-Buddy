import { mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const pages = [
  'pricing',
  'terms',
  'privacy',
  'refund',
  'contact',
  'about',
  'china-travel-apps',
  'alipay-for-foreigners',
  'china-payment-guide',
  'china-travel-checklist',
  'china-emergency-numbers',
  'faq',
];
const distDir = 'dist';
const source = join(distDir, 'index.html');

await Promise.all(
  pages.map(async (page) => {
    const targetDir = join(distDir, page);
    await mkdir(targetDir, { recursive: true });
    await copyFile(source, join(targetDir, 'index.html'));
  }),
);
