import type { Character, EraId } from '../types';
import { getEra } from '../data/eras';

/**
 * Where to marry. One rite in every period costs nothing; the rest
 * cost coin. Only the promised get to pick.
 */

export interface WeddingVenue {
  id: string;
  /** button text */
  text: string;
  /** base-unit cost, scaled by the era; the rite is free */
  cost: number;
  /** gate to a period; omit for everywhere */
  eras?: EraId[];
}

export const WEDDING_VENUES: WeddingVenue[] = [
  { id: 'temple', text: 'Temple rite', cost: 0, eras: ['ancient-world'] },
  { id: 'chapel', text: 'Chapel prayer', cost: 0, eras: ['medieval', 'age-of-sail'] },
  { id: 'registry', text: 'Registry office', cost: 0, eras: ['industrial', 'atomic'] },
  { id: 'courthouse', text: 'Courthouse', cost: 0, eras: ['modern-day'] },
  { id: 'garden', text: 'Garden wedding', cost: 5 },
  { id: 'hall', text: 'Grand hall', cost: 15 },
  { id: 'cathedral', text: 'Cathedral', cost: 30 },
];

/** Every venue open in this period. */
export function venuesFor(c: Character): WeddingVenue[] {
  return WEDDING_VENUES.filter((v) => !v.eras || v.eras.includes(c.eraId));
}

/** What it costs in this era's currency, as a positive figure. */
export function venueCost(v: WeddingVenue, c: Character): number {
  return Math.max(0, Math.round(v.cost * getEra(c.eraId).moneyScale));
}
