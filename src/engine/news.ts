import type { Character } from '../types';
import { countryOf } from '../data/eras';
import { HISTORY, type HistoryEntry } from '../data/history';
import { GENERIC_NEWS } from '../data/news-generic';

/**
 * The front page: the latest year with anything in it, and everything
 * in it — country pieces only for readers born there. Dated history
 * leads; everyday news fills the sheet to three pieces. Refreshed
 * every opening, since the world keeps happening.
 */

/** Pieces on the front page: the significant event first, then filler. */
const PAGE_SIZE = 3;

export function latestNews(c: Character): {
  year: number;
  items: HistoryEntry[];
} | null {
  const now = c.birthYear + c.age;
  const cc = countryOf(c);
  const mine = (h: HistoryEntry) =>
    h.y <= now && (!h.cc || h.cc.includes(cc));
  let best = -Infinity;
  for (const h of HISTORY) {
    if (mine(h) && h.y > best) best = h.y;
  }
  if (best === -Infinity) return null;
  const dated = HISTORY.filter((h) => h.y === best && mine(h));
  const filler = GENERIC_NEWS.filter((g) => g.eras.includes(c.eraId));
  // a different sheet every opening
  for (let i = filler.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filler[i], filler[j]] = [filler[j]!, filler[i]!];
  }
  const extra = filler
    .slice(0, Math.max(0, PAGE_SIZE - dated.length))
    .map((g) => ({ y: best, t: g.t, d: g.d }));
  return { year: best, items: [...dated, ...extra] };
}

/** A calendar year as a headline dateline. */
export function newsYear(year: number): string {
  return year < 0 ? `${-year} BC` : String(year);
}
