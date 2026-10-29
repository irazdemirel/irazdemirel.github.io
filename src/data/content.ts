import { getCollection } from 'astro:content';
import { getMediumPosts, mediumTag } from './medium';

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
