import type { Character, EraId, FamilyMember } from '../types';
import { AILMENTS } from '../data/ailments';
import { memberAge } from './family';
import { pocketAmountFactor, pocketChanceFactor } from './wealth';

/**
 * Being small. Infants cannot act on the world: no doctor of their
 * own, no money, no words aimed at other people. Parents carry them
 * to a physician instead, which the year resolves on its own.
 */

/** Below this age you are carried, not in charge. */
export const INFANT_AGE = 6;

/** Older than this you may act on people and pay for your own care. */
export const CHILD_AGE = 6;

/** From here you can be shown to family: play, walks, company. */
export const FAMILY_AGE = 3;

/** Odds a parent takes a sick infant to the doctor that year. */
const PARENT_DOCTOR_CHANCE = 0.7;

/** Relatives younger than this have no money to give you. */
const ADULT_AGE = 18;

/**
 * A relative only funds you so often. The first ask in a year is the
 * real one; the second is a long shot and the third is a flat no.
 */
const ASK_ODDS = [1, 0.15, 0];

/** The relatives you have already asked this year. */
export function asksLeft(c: Character, memberId: string): number {
  return c.askedThisYear.filter((id) => id === memberId).length;
}

/**
 * The odds for this ask. A close relationship earns the chance back,
 * so a child their parents are fond of starts fresh each year.
 */
export function askChance(c: Character, member: FamilyMember): number {
  const base = pocketMoneyChance(member.bond);
  // how many times this relative has already been asked this year
  const asked = c.askedThisYear.filter((id) => id === member.id).length;
  // warmth is what makes them forget the last time
  const forgiven = member.bond >= 80;
  const step = Math.min(asked, forgiven ? 1 : ASK_ODDS.length - 1);
  // poor houses say no more often, rich ones less
  const chance = base * pocketChanceFactor(c.familyWealth ?? 50, c.destitute ?? false);
  return Math.min(0.95, chance * (ASK_ODDS[step] ?? 0));
}

/** Below this age the doctor's own popup is closed to you. */
export const SELF_DOCTOR_AGE = INFANT_AGE;

export function isInfant(c: Character): boolean {
  return c.age < INFANT_AGE;
}

/** May you pay, or say something pointed, to another person? */
export function canActSocially(c: Character): boolean {
  return c.age >= CHILD_AGE;
}

/** May you spend time with the family? They have you from age 3. */
export function canSeeFamily(c: Character): boolean {
  return c.age >= FAMILY_AGE;
}

/** May you book your own appointment? */
export function canSeeDoctor(c: Character): boolean {
  return c.age >= SELF_DOCTOR_AGE;
}

/**
 * The odds a parent hands over pocket money. A close relationship is
 * nearly a yes; a poor one is nearly a no.
 */
export function pocketMoneyChance(bond: number): number {
  const b = Math.max(0, Math.min(100, bond));
  return Math.max(0, Math.min(0.9, (b - 25) / 90));
}

/** What a parent will hand over, in base units. */
export function pocketMoneyAmount(
  bond: number,
  moneyScale: number,
  wealth = 50,
  destitute = false,
  rng: () => number = Math.random,
): number {
  const generosity = 0.5 + bond / 200;
  const base = Math.max(1, Math.round((1 + rng() * 3) * generosity * moneyScale));
  return Math.max(1, Math.round(base * pocketAmountFactor(wealth, destitute)));
}

/** The grown-ups you can ask: a parent or an older sibling. */
export function canAskForMoney(c: Character): boolean {
  if (!canActSocially(c)) return false;
  return askableRelatives(c).length > 0;
}

export function askableRelatives(c: Character): FamilyMember[] {
  return c.family.filter(
    (m) => memberAge(m, c.age) >= ADULT_AGE,
  );
}

/**
 * A year of being carried to the doctor: parents treat what is
 * treatable, and quietly leave the rest. Returns the cured ailments
 * (by id) and the journal sentence, or null if nobody acted.
 */
export function parentalCare(
  c: Character,
  rng: () => number = Math.random,
): { cured: string[]; journal: string } | null {
  if (!isInfant(c)) return null;
  const sick = c.ailments.filter(
    (a) => a.ownerId === null && AILMENTS[a.ailmentId]?.cureCost > 0,
  );
  if (sick.length === 0) return null;
  if (rng() >= PARENT_DOCTOR_CHANCE) return null;

  const cured = sick.map((a) => a.ailmentId);
  const named = cured
    .map((id) => AILMENTS[id]?.name.toLowerCase() ?? id)
    .join(cured.length > 1 ? ' and ' : '');
  return {
    cured,
    journal: `Your parents took you to the doctor for the ${named}.`,
  };
}
