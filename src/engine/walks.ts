import type { Character, LifeEvent } from '../types';
import {
  WALK_EVENTS,
  WALK_EVENT_MAX,
  WALK_PLACES,
  type WalkEvent,
  type WalkPlace,
} from '../data/walks';

/**
 * Where a walk can go and what can happen on it. The store supplies
 * the walk; this decides what is on offer for this character, in this
 * period, in this place.
 */

/** Destinations reachable from where and when you are. */
export function walkPlacesFor(c: Character): WalkPlace[] {
  // at war there is the camp, the line, and nowhere else
  if (c.serving) return WALK_PLACES.filter((p) => p.atWar);
  return WALK_PLACES.filter(
    (p) =>
      !p.atWar &&
      (p.eras === undefined || p.eras.includes(c.eraId)) &&
      (p.places === undefined || p.places.includes(c.placeId)) &&
      (p.minAge === undefined || c.age >= p.minAge),
  );
}

/** Can this encounter happen here, now, and to you? */
function fits(e: WalkEvent, c: Character, placeId: string): boolean {
  if (!e.at.includes(placeId)) return false;
  if (e.eras && !e.eras.includes(c.eraId)) return false;
  if (e.places && !e.places.includes(c.placeId)) return false;
  if (e.minAge !== undefined && c.age < e.minAge) return false;
  if (e.maxAge !== undefined && c.age > e.maxAge) return false;
  if (e.requiredFlags?.some((f) => !c.flags.includes(f))) return false;
  if (e.excludedFlags?.some((f) => c.flags.includes(f))) return false;
  // counted the same way as any repeatable event: recorded every time
  const seen = c.seenEventIds.filter((id) => id === e.id).length;
  return seen < WALK_EVENT_MAX;
}

/**
 * What finds you on a walk, or null for an uneventful one. Weighted,
 * capped per life like every other repeatable thing, and never the
 * same encounter twice running.
 */
export function pickWalkEvent(
  c: Character,
  placeId: string,
  rng: () => number = Math.random,
): WalkEvent | null {
  const recent = c.recentWalkEvents ?? [];
  let pool = WALK_EVENTS.filter((e) => !recent.includes(e.id) && fits(e, c, placeId));
  if (pool.length === 0) pool = WALK_EVENTS.filter((e) => fits(e, c, placeId));
  if (pool.length === 0) return null;
  const total = pool.reduce((sum, e) => sum + (e.weight ?? 1), 0);
  let roll = rng() * total;
  for (const e of pool) {
    roll -= e.weight ?? 1;
    if (roll <= 0) return e;
  }
  return pool[pool.length - 1];
}

/**
 * A walk encounter takes the same popup path as any other event, so
 * the choices, the effects and the outcome all behave the same.
 */
export function walkEventAs(e: WalkEvent): LifeEvent {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    category: 'random',
    conditions: {},
    weight: e.weight ?? 1,
    choices: e.choices.map((ch) => ({
      id: ch.id,
      text: ch.text,
      effects: ch.effects,
    })),
  };
}
