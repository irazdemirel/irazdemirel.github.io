// referanslar/avatar/sol.png, orta.png, sag.png → public/avatar/poz-sol|orta|sag.webp
// Kaynak PNG'ler git'e girmez (referanslar/ ignore); siteye sadece küçültülmüş webp'ler girer.
// Kullanım: npm run avatar
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const pozlar = ['sol', 'orta', 'sag'];
const eksik = pozlar.filter((p) => !existsSync(`referanslar/avatar/${p}.png`));
if (eksik.length) {
  console.error(`Eksik: ${eksik.map((p) => `referanslar/avatar/${p}.png`).join(', ')}`);
  process.exit(1);
}
for (const p of pozlar) {
  const out = `public/avatar/poz-${p}.webp`;
  const info = await sharp(`referanslar/avatar/${p}.png`)
    .resize(640, 640, { fit: 'cover' })
    .webp({ quality: 82 })
    .toFile(out);
  console.log(`${out} (${Math.round(info.size / 1024)} KB)`);
}
