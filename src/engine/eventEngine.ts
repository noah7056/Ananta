import type { Character, LifeEvent } from '../types';
import { crewOf } from './classroom';
import { countryOf } from '../data/eras';

/**
 * The data-driven heart of Ananta.
 * Events declare *when* they may fire; this module only filters + picks.
 */

function statInRange(value: number, min?: number, max?: number): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

/** Is this event allowed to fire for this character right now? */
export function isEligible(event: LifeEvent, c: Character): boolean {
  const cond = event.conditions;

  if (cond.eras && !cond.eras.includes(c.eraId)) return false;
  if (cond.places && !cond.places.includes(c.placeId)) return false;
  if (cond.genders && !cond.genders.includes(c.gender)) return false;
  if (cond.minAge !== undefined && c.age < cond.minAge) return false;
  if (cond.maxAge !== undefined && c.age > cond.maxAge) return false;
  if (cond.year !== undefined && c.birthYear + c.age !== cond.year) return false;
  if (cond.requiresBoss && !crewOf(c).some((m) => m.isBoss)) return false;
  if (cond.countries && !cond.countries.includes(countryOf(c))) return false;

  if (cond.requiredFlags) {
    for (const f of cond.requiredFlags) {
      if (!c.flags.includes(f)) return false;
    }
  }
  if (cond.excludedFlags) {
    for (const f of cond.excludedFlags) {
      if (c.flags.includes(f)) return false;
    }
  }

  if (cond.minStats) {
    for (const [k, gate] of Object.entries(cond.minStats)) {
      const v = c.stats[k as keyof typeof c.stats];
      if (!statInRange(v, (gate as { min?: number }).min)) return false;
    }
  }
  if (cond.maxStats) {
    for (const [k, gate] of Object.entries(cond.maxStats)) {
      const v = c.stats[k as keyof typeof c.stats];
      if (!statInRange(v, undefined, (gate as { max?: number }).max))
        return false;
    }
  }

  const cap = cond.maxPerLife ?? (cond.oncePerLife ?? true ? 1 : Infinity);
  if (c.seenEventIds.filter((id) => id === event.id).length >= cap) {
    return false;
  }

  return true;
}

/** All events eligible right now. */
export function eligibleEvents(
  all: LifeEvent[],
  c: Character,
): LifeEvent[] {
  return all.filter((e) => isEligible(e, c));
}

/** Weighted random pick. Returns null when nothing is eligible. */
export function pickEvent(
  pool: LifeEvent[],
  rng: () => number = Math.random,
): LifeEvent | null {
  if (pool.length === 0) return null;
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let roll = rng() * total;
  for (const e of pool) {
    roll -= e.weight;
    if (roll <= 0) return e;
  }
  return pool[pool.length - 1];
}

/** Fill {name} {place} {year} {age} {member} {boss} placeholders in event text. */
export function renderText(
  template: string,
  c: Character,
  placeName: string,
  memberName?: string | null,
  bossName?: string | null,
): string {
  const member = memberName
    ? memberName.charAt(0).toUpperCase() + memberName.slice(1)
    : 'A relative';
  return template
    .replaceAll('{name}', c.name.split(' ')[0])
    .replaceAll('{place}', placeName)
    .replaceAll('{year}', String(c.birthYear + c.age))
    .replaceAll('{age}', String(c.age))
    .replaceAll('{member}', member)
    .replaceAll('{boss}', bossName ?? 'your boss');
}
