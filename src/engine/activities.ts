import type { Character, EraId, Stats } from '../types';
import { getEra } from '../data/eras';
import {
  ACTIVITIES,
  TRAINABLE,
  resolveActivity,
  type ActivityDef,
  type ActivityKey,
  type ResolvedActivity,
} from '../data/activities';
import { workStartAge } from '../data/career';

/**
 * How well an activity works for you right now. Doing the same thing
 * over and over in one year wears it out — each session is worth a
 * fraction of the last, and by the fifth there is almost nothing in
 * it. Leave it alone and it comes back over a few years.
 */

/** How many years of not doing it before it is fully effective again. */
export const COOLDOWN_YEARS = 3;

/**
 * How sharply repeat sessions lose their value. Applied once per
 * year, so a habit leaned on every single year decays geometrically
 * and ends up worth almost nothing.
 */
const FATIGUE = 0.45;

/** Below this health or energy nothing is worth much. */
const POOR_HEALTH = 45;

/** A session's value once fatigue and weariness have had their say. */
export function effectiveness(multiplier: number, health: number, energy?: number): number {
  const worn = Math.min(health, energy ?? health);
  const tired = worn < POOR_HEALTH ? 0.5 : 1;
  return Math.max(0.05, Math.min(1, multiplier)) * tired;
}

/**
 * Yearly decay of a habit. Use it and it drops hard. Ignore it, and
 * it only comes back once the cooldown has run out — so the play is
 * to rotate, not to press everything every year.
 */
export function stepMultiplier(
  current: number,
  usedThisYear: boolean,
  yearsIdle: number,
): number {
  if (usedThisYear) return current * FATIGUE;
  return yearsIdle >= COOLDOWN_YEARS ? 1 : current;
}

/** Every activity you could do this year, wording resolved. */
export function availableActivities(
  c: Character,
): { key: ActivityKey; def: ResolvedActivity }[] {
  const era: EraId = c.eraId;
  // at war the front leaves room for walks, quiet sitting, and nothing else;
  // in prison only quiet sitting remains
  const open = c.serving
    ? ACTIVITIES.filter((def) => def.key === 'walk' || def.key === 'meditate')
    : c.sentence
    ? ACTIVITIES.filter((def) => def.key === 'meditate')
    : ACTIVITIES;
  return open.filter((def) => isOpen(def, c)).map((def) => ({
    key: def.key,
    def: resolveActivity(def, era),
  }));
}

/** Is this activity open to someone of this age? */
export function isOpen(def: ActivityDef, c: Character): boolean {
  if (def.minAge !== undefined && c.age < def.minAge) return false;
  if (def.maxAge !== undefined && c.age > def.maxAge) return false;
  return true;
}

/** What it costs in this era's currency, as a positive figure. */
export function activityCost(
  def: ActivityDef,
  c: Character,
): number {
  return Math.max(0, Math.round((def.cost ?? 0) * getEra(c.eraId).moneyScale));
}

/** Can the character pay for it? Lessons cost money. */
export function canAfford(def: ActivityDef, c: Character): boolean {
  if (!def.cost) return true;
  return activityCost(def, c) <= c.money;
}

/**
 * Voice and modelling lessons are asked of the parents while too
 * young to pay: the house's means and their fondness decide.
 */
export function needsParentPayer(def: ActivityDef, c: Character): boolean {
  if (def.key !== 'voice' && def.key !== 'modelling') return false;
  if (c.age >= workStartAge(c.eraId)) return false;
  return (def.cost ?? 0) > 0;
}

/** The vitals a session actually moves, after fatigue and weariness. */
export function sessionGain(
  def: ActivityDef,
  c: Character,
): Partial<Stats> {
  const scale = effectiveness(c.activityHeat[def.key] ?? 1, c.stats.health, c.stats.energy);
  const out: Partial<Stats> = {};
  for (const [k, v] of Object.entries(def.stats)) {
    const amount = (v ?? 0) * scale;
    if (amount !== 0) out[k as keyof Stats] = amount;
  }
  return out;
}

// ── Skill progress ──────────────────────────────────────────────────────

/** Base progress per session before aptitude and exponential scaling. */
const BASE_PROGRESS = 1.5;

/** How much aptitude accelerates the exponential fill. */
const APTITUDE_SCALE = 0.04;

/** Roll a hidden aptitude for each trainable activity (fate at birth). */
export function rollAptitudes(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const key of TRAINABLE) {
    // 0.3 (struggles) to 2.0 (natural talent)
    out[key] = 0.3 + Math.random() * 1.7;
  }
  return out;
}

/**
 * Progress gained from one session. Exponential: the more you have,
 * the faster it fills, scaled by aptitude and by how quickly the
 * skill takes to you.
 */
export function skillProgressGain(
  def: ActivityDef,
  c: Character,
): number {
  const current = c.skillProgress[def.key] ?? 0;
  const aptitude = c.skillAptitude[def.key] ?? 1;
  const rate = def.progressRate ?? 1;
  return BASE_PROGRESS * rate * (1 + aptitude * APTITUDE_SCALE * current);
}

/**
 * Wear the habit out by one use, plus whatever extra a longer walk
 * puts into it. Indexes the fatigue by `1 + extra`.
 */
export function wearHabit(c: Character, key: string, extra: number): number {
  return (c.activityHeat[key] ?? 1) * Math.pow(FATIGUE, 1 + Math.max(-0.2, extra));
}

/** Is this activity free because you are still studying? */
export function isFreeWhileStudying(def: ActivityDef, c: Character): boolean {
  if (!def.paidAfterSchool) return false;
  return c.age < workStartAge(c.eraId);
}

/** Effective cost: 0 if still studying, otherwise the era-scaled price. */
export function effectiveCost(def: ActivityDef, c: Character): number {
  if (isFreeWhileStudying(def, c)) return 0;
  return activityCost(def, c);
}

/** Can the character afford the effective cost? */
export function canAffordEffective(def: ActivityDef, c: Character): boolean {
  return effectiveCost(def, c) <= c.money;
}