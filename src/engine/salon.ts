import type { Character, EraId, Stats } from '../types';
import { getEra } from '../data/eras';
import {
  SALON_SERVICES,
  type SalonService,
} from '../data/salon';
import { effectiveness } from './activities';

/**
 * What pampering is on offer here and now. Same habit rules as
 * everything else: repeat one chair and it pays less, leave it alone
 * and it comes back.
 */

/** A service with this period's wording applied. */
export interface ResolvedSalon extends SalonService {
  text: string;
  journal: string;
  notice: string;
}

/** Every service open to someone of this age, in this period. */
export function salonsFor(c: Character): ResolvedSalon[] {
  const era: EraId = c.eraId;
  return SALON_SERVICES.filter((s) => isOpen(s, c)).map((s) => ({
    ...s,
    ...(s.wording?.[era] ?? {}),
  }));
}

function isOpen(s: SalonService, c: Character): boolean {
  if (s.minAge !== undefined && c.age < s.minAge) return false;
  if (s.maxAge !== undefined && c.age > s.maxAge) return false;
  if (s.eras !== undefined && !s.eras.includes(c.eraId)) return false;
  return true;
}

/** What it costs in this era's currency, as a positive figure. */
export function salonCost(s: SalonService, c: Character): number {
  return Math.max(0, Math.round(s.cost * getEra(c.eraId).moneyScale));
}

/** The vitals a session actually moves, after fatigue and weariness. */
export function salonGain(s: SalonService, c: Character): Partial<Stats> {
  const scale = effectiveness(c.activityHeat[s.id] ?? 1, c.stats.health, c.stats.energy);
  const out: Partial<Stats> = {};
  for (const [k, v] of Object.entries(s.stats)) {
    const amount = (v ?? 0) * scale;
    if (amount !== 0) out[k as keyof Stats] = amount;
  }
  return out;
}
