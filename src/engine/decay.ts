import type { Character, EraId, Stats } from '../types';
import { getEra } from '../data/eras';
import { clampStats } from './life';

/**
 * The slow grind of a year. Vitals decay whether you do anything
 * about it or not — the older and harder the world, the faster.
 * This is what makes mind and body worth spending a year on.
 */

/** Base cost of a year, before the era and the age weigh in. */
const BASE_DECAY: Stats = {
  health: 0.4,
  happiness: 0.3,
  smarts: 0.35,
  looks: 0.5,
  energy: 0.5,
  reputation: 0,
};

/**
 * Extra decay per era. The ancient world is the worst of it — no
 * hygiene, no doctors, and disease that was simply a fact of life.
 */
const ERA_DECAY: Record<EraId, Partial<Stats>> = {
  'ancient-world': { health: 1.1, looks: 0.4 },
  medieval: { health: 0.7 },
  'age-of-sail': { health: 0.8 },
  industrial: { health: 0.5 },
  atomic: { health: 0.2 },
  'modern-day': { health: 0.05 },
};

/** From this age the body starts going regardless of what you do. */
const OLD_AGE = 45;

/** How much worse each decade past that costs, per year. */
const OLD_AGE_STEP = 0.09;

/**
 * What a year takes off every vital. Fractional, so it takes a few
 * years of neglect to actually cost you points.
 */
export function yearlyDecay(
  c: Character,
  age: number,
  eraId: EraId,
): Partial<Stats> {
  const era = getEra(eraId);
  const scale = era.declineRate;
  const extra = ERA_DECAY[eraId] ?? {};
  const yearsPast = Math.max(0, age - OLD_AGE) / 10;
  const oldAge = 1 + yearsPast * OLD_AGE_STEP;

  return {
    health: (BASE_DECAY.health + (extra.health ?? 0)) * scale * oldAge,
    happiness: (BASE_DECAY.happiness + (extra.happiness ?? 0)) * scale * oldAge,
    smarts: (BASE_DECAY.smarts + (extra.smarts ?? 0)) * scale * oldAge,
    looks: (BASE_DECAY.looks + (extra.looks ?? 0)) * scale * oldAge,
    energy: (BASE_DECAY.energy + (extra.energy ?? 0)) * scale * oldAge,
    reputation: 0,
  };
}

/**
 * Young bodies put things back. Children and young adults recover a
 * little of what a year takes, so decay is felt in adulthood.
 */
export function yearlyRecovery(
  c: Character,
  age: number,
  eraId: EraId,
): Partial<Stats> {
  const scale = getEra(eraId).declineRate;
  if (age >= 25) return { energy: 0.35 * scale };
  const strength = (25 - age) / 25;
  return {
    health: 0.5 * strength * scale,
    smarts: 0.35 * strength,
    looks: 0.3 * strength,
    energy: (0.6 * strength + 0.35) * scale,
  };
}

/**
 * Spend the year's changes against the vitals, carrying whatever does
 * not divide evenly into next year's budget.
 *
 * Vitals are whole numbers, so a year that costs 0.38 would otherwise
 * round away to nothing and the grind would never actually land.
 * Truncating rather than rounding keeps the loss honest: a vital only
 * drops a point once a whole point has genuinely gone.
 */
export function applyYearlyChange(
  stats: Stats,
  changes: Partial<Stats>,
  remainder: Stats,
): { stats: Stats; remainder: Stats } {
  const next = {} as Stats;
  const carry = {} as Stats;
  for (const key of VITAL_KEYS) {
    const total = (changes[key] ?? 0) + (remainder[key] ?? 0);
    const whole = Math.trunc(total);
    carry[key] = total - whole;
    next[key] = stats[key] + whole;
  }
  return { stats: clampStats(next), remainder: carry };
}

const VITAL_KEYS: (keyof Stats)[] = [
  'health',
  'happiness',
  'smarts',
  'looks',
  'energy',
  'reputation',
];

/**
 * Reputation fades toward obscurity (50) rather than decaying away:
 * fame and infamy both blur unless renewed. 5% of the distance a year.
 */
export function reputationDrift(reputation: number): number {
  return (50 - reputation) * 0.05;
}