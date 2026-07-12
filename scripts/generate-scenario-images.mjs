// Optimized WebP variants for the homepage scenario-card photography.
// Sources are the existing multi-MB JPGs; cards render at ~560px wide max.
import sharp from 'sharp';

const JOBS = [
  { src: 'public/images/hero-china-landscape.jpg', out: 'public/scenario-arrival-900.webp' },
  { src: 'public/hero.jpg', out: 'public/scenario-food-900.webp' },
  { src: 'public/hero-mobile.jpg', out: 'public/scenario-help-900.webp' },
];

for (const { src, out } of JOBS) {
  await sharp(src)
    .resize(900, 760, { fit: 'cover', position: 'attention' })
    .webp({ quality: 76 })
    .toFile(out);
  console.log(`${out} written`);
}
