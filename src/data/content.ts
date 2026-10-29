import { getCollection } from 'astro:content';

// Taslaklar (draft: true) sadece yerelde (npm run dev) görünür, canlı sitede görünmez.
const visible = (d: { data: { draft: boolean } }) => import.meta.env.DEV || !d.data.draft;

export async function getPosts() {
  return (await getCollection('blog', visible)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

export async function getProjects() {
  return (await getCollection('projeler', visible)).sort(
    (a, b) => a.data.order - b.data.order || b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
