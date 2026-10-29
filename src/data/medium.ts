// Medium yazıları: site her derlendiğinde Medium RSS'inden çekilir (her gün otomatik yeniden derlenir).
// Medium'da yazıya etiket (tag) olarak kitap / film / dizi / tiyatro / konser / öğrenme / proje
// eklersen, sitede ilgili yere (raf, sahne...) düşer.
import { site } from './site';

export type MediumPost = { title: string; link: string; date: Date; tags: string[]; image?: string; summary: string };

const KNOWN = ['kitap', 'film', 'dizi', 'tiyatro', 'konser', 'öğrenme', 'proje'];

const decode = (s: string) =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const pick = (xml: string, tag: string) => decode(xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1] ?? '').trim();

let cache: MediumPost[] | null = null;

export async function getMediumPosts(): Promise<MediumPost[]> {
  if (cache) return cache;
  const user = site.links.medium.match(/medium\.com\/(@[\w.-]+)/)?.[1] ?? site.links.medium.match(/https?:\/\/([\w-]+)\.medium\.com/)?.[1];
  if (!user) return (cache = []);
  const feed = user.startsWith('@') ? `https://medium.com/feed/${user}` : `https://${user}.medium.com/feed`;
  try {
    const res = await fetch(feed, { headers: { 'user-agent': 'Mozilla/5.0 (site build)' } });
    if (!res.ok) throw new Error(String(res.status));
    const xml = await res.text();
    cache = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
      const html = pick(it, 'content:encoded');
      const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const tags = [...it.matchAll(/<category>([\s\S]*?)<\/category>/g)].map((m) => decode(m[1]).trim().toLocaleLowerCase('tr'));
      return {
        title: pick(it, 'title'),
        link: pick(it, 'link').split('?')[0],
        date: new Date(pick(it, 'pubDate')),
        tags,
        image: html.match(/<img[^>]+src="([^"]+)"/)?.[1],
        summary: text.slice(0, 160) + (text.length > 160 ? '…' : ''),
      };
    });
  } catch (e) {
    console.warn('[medium] RSS alınamadı:', e);
    cache = [];
  }
  return cache;
}

export const mediumTag = (tags: string[]) => tags.find((t) => KNOWN.includes(t)) ?? 'medium';
