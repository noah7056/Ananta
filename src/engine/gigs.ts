import type { Character } from '../types';
import { getEra } from '../data/eras';
import { GIGS, type GigDef } from '../data/gigs';

/**
 * Small jobs. Two attempts a year; asking over the fair rate, being
 * very young, or being very old all tilt the odds against you.
 */

/** Gig attempts allowed per year, like study sessions and shifts. */
export const GIGS_PER_YEAR = 2;

/** Old enough for high school is old enough to ask for gig work. */
export const GIG_AGE = 15;

/** Below this health or energy the cap drops to one, like study and shifts. */
const POOR_HEALTH = 45;

export function gigCap(health: number): number {
  return health < POOR_HEALTH ? 1 : GIGS_PER_YEAR;
}

/** Gigs old enough and in the right period to take. */
export function gigsFor(c: Character): GigDef[] {
  return GIGS.filter(
    (g) =>
      c.age >= g.minAge &&
      (g.eras === undefined || g.eras.includes(c.eraId)),
  );
}

/**
 * Odds the work comes through. A fair ask starts high; every multiple
 * over it costs nearly half the chance. The very young are not taken
 * seriously and the very old are not taken at all.
 */
export function gigChance(multiple: number, age: number): number {
  const greed = Math.max(0, multiple - 1) * 0.45;
  const young = age < 16 ? (16 - age) * 0.06 : 0;
  const old = age > 55 ? (age - 55) * 0.02 : 0;
  return Math.max(0.05, Math.min(0.95, 0.8 - greed - young - old));
}

/** What the gig pays in this era's money when it comes through. */
export function gigPayout(gig: GigDef, multiple: number, c: Character): number {
  return Math.round(gig.base * multiple * getEra(c.eraId).moneyScale);
}
