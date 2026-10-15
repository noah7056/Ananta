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

/**
 * Where to kneel. Deliberately not the walk list: a proposal wants
 * somewhere that means something — high ground, still water, old
 * stone — not the market you cross every day.
 */
export interface ProposalSpot {
  id: string;
  text: string;
  eras?: EraId[];
}

export const PROPOSAL_SPOTS: ProposalSpot[] = [
  { id: 'proposal-overlook', text: 'The hill above the town' },
  { id: 'proposal-water', text: 'Still water at dusk' },
  { id: 'proposal-garden', text: 'The walled garden' },
  { id: 'proposal-steps', text: 'The old stone steps', eras: ['ancient-world', 'medieval', 'age-of-sail'] },
  { id: 'proposal-chapel', text: 'The quiet chapel', eras: ['medieval', 'age-of-sail', 'industrial'] },
  { id: 'proposal-theatre', text: 'The empty theatre', eras: ['ancient-world', 'industrial', 'atomic', 'modern-day'] },
  { id: 'proposal-bridge', text: 'The bridge at sunset' },
  { id: 'proposal-hearth', text: 'The family hearth' },
];

export function proposalSpotsFor(c: Character): ProposalSpot[] {
  return PROPOSAL_SPOTS.filter((s) => !s.eras || s.eras.includes(c.eraId));
}

/**
 * Where to take a lover. Strolls are free air; feasts cost coin and
 * land harder; shows sit between. The feast carries its own tiers —
 * tavern, restaurant, banquet — as sub-choices of the same evening.
 */
export interface DateSpot {
  id: string;
  outing: 'stroll' | 'feast' | 'show';
  text: string;
  cost: number;
  bonus: number;
  eras?: EraId[];
}

export const DATE_OUTINGS = [
  { id: 'stroll', text: 'A stroll' },
  { id: 'feast', text: 'A feast' },
  { id: 'show', text: 'A show' },
] as const;

export const DATE_SPOTS: DateSpot[] = [
  { id: 'date-river', outing: 'stroll', text: 'A picnic by the river', cost: 0, bonus: 0 },
  { id: 'date-garden', outing: 'stroll', text: 'An evening garden walk', cost: 0, bonus: 0 },
  { id: 'date-tavern', outing: 'feast', text: 'Tavern supper', cost: 2, bonus: 4 },
  { id: 'date-restaurant', outing: 'feast', text: 'Restaurant dinner', cost: 6, bonus: 8 },
  { id: 'date-banquet', outing: 'feast', text: 'Grand banquet', cost: 14, bonus: 14 },
  { id: 'date-theatre', outing: 'show', text: 'The theatre', cost: 3, bonus: 5, eras: ['ancient-world', 'industrial', 'atomic', 'modern-day'] },
  { id: 'date-dance', outing: 'show', text: 'The dance hall', cost: 2, bonus: 4, eras: ['industrial', 'atomic', 'modern-day'] },
  { id: 'date-minstrel', outing: 'show', text: 'Minstrels in the square', cost: 0, bonus: 2, eras: ['ancient-world', 'medieval', 'age-of-sail'] },
];

export function dateSpotsFor(c: Character, outing?: string): DateSpot[] {
  return DATE_SPOTS.filter(
    (s) =>
      (!outing || s.outing === outing) &&
      (!s.eras || s.eras.includes(c.eraId)),
  );
}

export function dateSpotCost(s: DateSpot, c: Character): number {
  return Math.max(0, Math.round(s.cost * getEra(c.eraId).moneyScale));
}
