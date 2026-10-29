import { getCollection } from 'astro:content';
import { getMediumPosts, mediumTag } from './medium';
import { kultur, type Parca, type KulturItem } from './kultur';

// Taslaklar (draft: true) sadece yerelde (npm run dev) görünür, canlı sitede görünmez.
const visible = (d: { data: { draft: boolean } }) => import.meta.env.DEV || !d.data.draft;

// Sitedeki tüm yazılar tek tipte: site içi yazılar + Medium yazıları
export type Post = {
  title: string;
  href: string;
  external: boolean; // true = Medium'a gider
  date: Date;
  tag: string;
  description?: string;
  creator?: string;
  cover?: string;
  color?: string;
  draft?: boolean;
};

export async function getLocalPosts() {
  return (await getCollection('blog', visible)).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getPosts(): Promise<Post[]> {
  const local = await getLocalPosts();
  const linked = new Set(local.map((p) => p.data.medium?.split('?')[0]).filter(Boolean));
  const items: Post[] = local.map((p) => ({
    title: p.data.title, href: `/blog/${p.id}/`, external: false, date: p.data.date, tag: p.data.tag,
    description: p.data.description, creator: p.data.creator, cover: p.data.cover, color: p.data.color, draft: p.data.draft,
  }));
  for (const m of await getMediumPosts()) {
    if (linked.has(m.link)) continue; // aynı yazı sitede de varsa tekrar gösterme
    items.push({ title: m.title, href: m.link, external: true, date: m.date, tag: mediumTag(m.tags), description: m.summary, cover: m.image });
  }
  return items.sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

export async function getProjects() {
  return (await getCollection('projeler', visible)).sort(
    (a, b) => a.data.order - b.data.order || b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

// Kültür sayfası öğesi: kultur.ts listesi + o türdeki yazılar (listede olmayanlar otomatik eklenir)
export type CultureItem = {
  title: string; tag: string; creator?: string; credit?: string; cover?: string; color?: string; poster?: KulturItem['poster'];
  href?: string; external?: boolean; parts?: (Parca & { href?: string; external?: boolean })[];
};
const isExt = (u?: string) => !!u && /^https?:/.test(u);
const norm = (s: string) => s.toLocaleLowerCase('tr').replace(/\s+/g, ' ').trim();

export async function getCulture(): Promise<CultureItem[]> {
  const posts = await getPosts();
  const byTitle = new Map(posts.map((p) => [norm(p.title), p]));
  const items: CultureItem[] = kultur.map((k) => {
    const post = byTitle.get(norm(k.title));
    const href = k.yazi ?? post?.href;
    return {
      title: k.title, tag: k.tur, creator: k.creator, credit: k.credit, cover: k.cover ?? post?.cover, color: k.color, poster: k.poster,
      href, external: k.yazi ? isExt(k.yazi) : post?.external,
      parts: k.parts?.map((pt) => ({ ...pt, href: pt.yazi, external: isExt(pt.yazi) })),
    };
  });
  const listed = new Set(kultur.map((k) => norm(k.title)));
  for (const p of posts) {
    if (!['kitap', 'film', 'dizi', 'tiyatro', 'konser'].includes(p.tag) || listed.has(norm(p.title))) continue;
    items.push({ title: p.title, tag: p.tag, creator: p.creator, cover: p.cover, color: p.color, href: p.href, external: p.external });
  }
  return items;
}
