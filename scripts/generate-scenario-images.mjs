// Optimized WebP variants for homepage photography.
// - arrival: Shanghai skyline crop (people-free top region of hero-mobile.jpg) to match transport copy
// - food: lantern-lit street scene (hero.jpg)
// - help: remote terraced landscape (fits "help that works offline")
// - atmosphere: soft Shanghai backdrop layered behind the hero phone at low opacity
import sharp from 'sharp';

await sharp('public/hero-mobile.jpg')
  .extract({ left: 0, top: 100, width: 852, height: 720 })
  .resize(900, 760, { fit: 'cover' })
  .webp({ quality: 76 })
  .toFile('public/scenario-arrival-900.webp');

await sharp('public/hero.jpg')
  .resize(900, 760, { fit: 'cover', position: 'attention' })
  .webp({ quality: 76 })
  .toFile('public/scenario-food-900.webp');

await sharp('public/images/hero-china-landscape.jpg')
  .resize(900, 760, { fit: 'cover', position: 'attention' })
  .webp({ quality: 76 })
  .toFile('public/scenario-help-900.webp');

await sharp('public/hero-mobile.jpg')
  .extract({ left: 0, top: 60, width: 852, height: 900 })
  .resize(900, 950)
  .webp({ quality: 62 })
  .toFile('public/hero-atmosphere-900.webp');

console.log('scenario + atmosphere images written');
