// GitHub katkı takvimi: derleme sırasında herkese açık profil sayfasından okunur (her gün yeniden derlenir).
import { site } from './site';

export type Day = { date: string; level: number; count: number };

export async function getContributions(): Promise<Day[]> {
  const user = site.links.github.match(/github\.com\/([\w-]+)/)?.[1];
  if (!user) return [];
  try {
    const res = await fetch(`https://github.com/users/${user}/contributions`, { headers: { 'user-agent': 'Mozilla/5.0 (site build)' } });
    if (!res.ok) throw new Error(String(res.status));
    const html = await res.text();
    const counts = new Map<string, number>();
    // <tool-tip for="contribution-day-component-0-0">3 contributions on ...</tool-tip>
    for (const m of html.matchAll(/for="(contribution-day-component-[\d-]+)"[^>]*>([^<]*)</g)) {
      const n = m[2].match(/^(\d+)/);
      counts.set(m[1], n ? Number(n[1]) : 0);
    }
    const days: Day[] = [];
    for (const m of html.matchAll(/<td[^>]*?data-date="([\d-]+)"[^>]*?id="([^"]+)"[^>]*?data-level="(\d)"|<td[^>]*?data-date="([\d-]+)"[^>]*?data-level="(\d)"[^>]*?id="([^"]+)"/g)) {
      const date = m[1] ?? m[4], id = m[2] ?? m[6], level = Number(m[3] ?? m[5]);
      days.push({ date, level, count: counts.get(id) ?? 0 });
    }
    return days.sort((a, b) => a.date.localeCompare(b.date));
  } catch (e) {
    console.warn('[github] katkılar alınamadı:', e);
    return [];
  }
}
