import type { EraId } from '../types';
import { getEra } from './eras';

/**
 * Houses to buy, per era. Each era holds the same five rungs —
 * a room, a cottage, a house, a villa, an estate — under its own
 * names. Costs are base units, scaled by the era like everything
 * else: a room runs a few years of entry wages, an estate a fortune.
 *
 * To extend: add a HouseDef to the era's list. `home` on the
 * character holds the owned id; residents live in `home.residents`.
 */

export interface HouseDef {
  /** rung, shared across eras: 'room' | 'cottage' | 'house' | 'villa' | 'estate' */
  id: string;
  /** e.g. "a studio flat" */
  text: string;
  /** base-unit cost, scaled by the era */
  cost: number;
  /** earliest age a purchase can be made */
  minAge: number;
}

const COSTS = { room: 60, cottage: 150, house: 400, villa: 1000, estate: 2500 };
const BUY_AGE = 18;

function rung(id: keyof typeof COSTS, text: string): HouseDef {
  return { id, text, cost: COSTS[id], minAge: BUY_AGE };
}

export const HOUSES: Record<EraId, HouseDef[]> = {
  'ancient-world': [
    rung('room', 'A room in an insula'),
    rung('cottage', 'A small domus'),
    rung('house', 'A townhouse'),
    rung('villa', 'A villa'),
    rung('estate', 'A palace'),
  ],
  medieval: [
    rung('room', 'A room in a tenement'),
    rung('cottage', 'A cottage'),
    rung('house', 'A merchant house'),
    rung('villa', 'A manor house'),
    rung('estate', 'A castle'),
  ],
  'age-of-sail': [
    rung('room', 'A garret room'),
    rung('cottage', 'A cottage'),
    rung('house', 'A merchant house'),
    rung('villa', 'A country house'),
    rung('estate', 'A great estate'),
  ],
  industrial: [
    rung('room', 'A tenement room'),
    rung('cottage', 'A terrace cottage'),
    rung('house', 'A townhouse'),
    rung('villa', 'A detached villa'),
    rung('estate', 'A mansion'),
  ],
  atomic: [
    rung('room', 'A bedsit'),
    rung('cottage', 'A bungalow'),
    rung('house', 'A suburban house'),
    rung('villa', 'A detached villa'),
    rung('estate', 'A mansion'),
  ],
  'modern-day': [
    rung('room', 'A studio flat'),
    rung('cottage', 'A terraced house'),
    rung('house', 'A semi-detached house'),
    rung('villa', 'A detached house'),
    rung('estate', 'A penthouse'),
  ],
};

/** Every house on the market in this period, cheap first. */
export function housesFor(eraId: EraId): HouseDef[] {
  return HOUSES[eraId] ?? [];
}

/** The rung by id in this period, for an owned home. */
export function houseById(eraId: EraId, id: string): HouseDef | undefined {
  return housesFor(eraId).find((h) => h.id === id);
}

/** What it costs in this era's currency, as a positive figure. */
export function houseCost(house: HouseDef, eraId: EraId): number {
  return Math.max(0, Math.round(house.cost * getEra(eraId).moneyScale));
}
