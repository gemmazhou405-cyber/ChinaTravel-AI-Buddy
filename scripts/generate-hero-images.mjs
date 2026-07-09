// Generates the responsive hero image set from the highest-resolution source photo.
// public/hero-product.png (spec source) does not exist; hero-china-landscape.jpg (2400x1600)
// is the largest asset, so the 4:5 crop tops out at 1280w native — 1800w would upscale.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SOURCE = 'public/images/hero-china-landscape.jpg';
const WIDTHS = [768, 1200];
const ASPECT = 4 / 5;

await mkdir('public', { recursive: true });

for (const width of WIDTHS) {
  const height = Math.round(width / ASPECT);
  const base = sharp(SOURCE).resize(width, height, { fit: 'cover', position: 'attention' });
  await base.clone().avif({ quality: 55 }).toFile(`public/hero-product-${width}.avif`);
  await base.clone().webp({ quality: 78 }).toFile(`public/hero-product-${width}.webp`);
}

await sharp(SOURCE)
  .resize(1200, 1500, { fit: 'cover', position: 'attention' })
  .png({ compressionLevel: 9, palette: true })
  .toFile('public/hero-product.png');

console.log('hero image set generated: 768/1200 avif+webp, 1200 png fallback');
