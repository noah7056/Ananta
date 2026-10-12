import type { EraId } from '../types';

/**
 * Gigs. Small jobs for school-age money and side money after: pick
 * one, name the pay you want, and see if the work comes through.
 * Asking over the fair rate, being very young, or being very old all
 * make it likelier you hear nothing back.
 *
 * To extend: add a row. `base` is the fair pay in base units; the pay
 * dropdown offers fractions and multiples of it. Gate with `minAge`
 * (staggered through the school years so the list keeps growing) and
 * `eras` for period work.
 */

export interface GigDef {
  id: string;
  /** e.g. "Mow lawns" */
  text: string;
  /** fair pay in base units, scaled by the era like all money */
  base: number;
  minAge: number;
  /** gate to a period; omit for everywhere */
  eras?: EraId[];
}

/** Asks on offer, as multiples of the fair rate. */
export const GIG_MULTIPLES = [0.5, 1, 2, 3];

export const GIGS: GigDef[] = [
  // anywhere, any time
  { id: 'errands', text: 'Run errands', base: 2, minAge: 10 },
  { id: 'clean', text: 'Clean up', base: 1, minAge: 10 },
  { id: 'neighbour', text: 'Help a neighbour', base: 1, minAge: 10 },
  { id: 'firewood', text: 'Gather firewood', base: 2, minAge: 10 },
  { id: 'carry', text: 'Carry loads', base: 2, minAge: 12 },
  { id: 'mind', text: 'Mind children', base: 2, minAge: 14 },

  // ancient world
  { id: 'water', text: 'Carry water', base: 2, minAge: 10, eras: ['ancient-world'] },
  { id: 'scrolls', text: 'Copy scrolls', base: 3, minAge: 14, eras: ['ancient-world'] },

  // middle ages
  { id: 'stables', text: 'Muck out stables', base: 2, minAge: 12, eras: ['medieval'] },
  { id: 'bell', text: 'Ring the church bell', base: 1, minAge: 14, eras: ['medieval'] },

  // age of sail
  { id: 'decks', text: 'Scrub decks', base: 2, minAge: 12, eras: ['age-of-sail'] },
  { id: 'nets', text: 'Mend nets', base: 3, minAge: 14, eras: ['age-of-sail'] },

  // industrial
  { id: 'sweep', text: 'Sweep the workshop', base: 2, minAge: 12, eras: ['industrial'] },
  { id: 'parcels', text: 'Deliver parcels', base: 3, minAge: 14, eras: ['industrial'] },

  // atomic
  { id: 'papers', text: 'Deliver newspapers', base: 2, minAge: 12, eras: ['atomic'] },
  { id: 'lawns', text: 'Mow lawns', base: 3, minAge: 16, eras: ['atomic', 'modern-day'] },

  // modern day
  { id: 'dogs', text: 'Walk dogs', base: 2, minAge: 12, eras: ['modern-day'] },
  { id: 'groceries', text: 'Deliver groceries', base: 3, minAge: 17, eras: ['modern-day'] },
];
