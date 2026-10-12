import type { Character, LifeEvent } from '../types';
import { CRISES, type CrisisDef } from '../data/crises';

/**
 * What the bad years do. A life inside a crisis window rolls to
 * catch it every year; having caught it once is enough, since the
 * sicknesses do not get cured.
 */

/** The crisis striking this life this year, if any. */
export function crisisFor(c: Character, year: number): CrisisDef | null {
  return (
    CRISES.find(
      (k) =>
        k.eras.includes(c.eraId) &&
        year >= k.years[0] &&
        year <= k.years[1] &&
        (!k.ailmentId ||
          !(c.ailments ?? []).some((a) => a.ailmentId === k.ailmentId)),
    ) ?? null
  );
}

/** The catch, as the year's notice: onset lands, no decision. */
export function crisisEvent(k: CrisisDef): LifeEvent {
  return {
    id: `crisis-${k.id}`,
    title: k.title,
    description: k.description,
    category: 'illness',
    conditions: {},
    weight: 0,
    choices: [],
    effects: {
      stats: { health: k.onset },
      ...(k.ailmentId ? { addAilments: [k.ailmentId] } : {}),
      money: k.money,
      journal: k.journal,
    },
  };
}

/** Crises whose years have passed while the sickness lingers: time to recover. */
export function pastCrises(c: Character, year: number): CrisisDef[] {
  return CRISES.filter(
    (k) =>
      k.recovers !== false &&
      k.ailmentId !== undefined &&
      k.recovered !== undefined &&
      year > k.years[1] &&
      (c.ailments ?? []).some((a) => a.ownerId === null && a.ailmentId === k.ailmentId),
  );
}
