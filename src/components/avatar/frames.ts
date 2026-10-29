// Avatar kareleri (site.ts → avatar). İmleç takibi kare listesini soldan sağa kullanır.
// 1. 3 poz (public/avatar/poz-sol|orta|sag.webp, `npm run avatar` üretir) varsa: 3 kare (sol, orta, sağ).
// 2. Yoksa kareler: frame-01 = sola bakış … frame-31 = sağa bakış.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { site } from '../../data/site';

const { frames, pattern, alt, poses } = site.avatar;
const hasPoses = poses.every((p) => existsSync(join(process.cwd(), 'public', p)));
const pad = (n: number) => String(n).padStart(2, '0');
export const srcs = hasPoses ? poses : Array.from({ length: frames }, (_, i) => pattern.replace('{n}', pad(i + 1)));
export const mid = srcs[Math.floor(srcs.length / 2)];
export { alt };
