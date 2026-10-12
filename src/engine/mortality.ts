import type { Character, Child, Contact, EraId, FamilyMember } from '../types';
import { getEra } from '../data/eras';
import { AILMENTS } from '../data/ailments';
import { memberAge } from './family';
import { bondLossPenalty, contactAge, contactRef } from './contacts';
import { childAge } from './children';
import { crisisFor } from './crises';

/**
 * The years other people die. Parents, siblings, lovers and pets all
 * roll once a year against the same curve the world uses: negligible
 * while young, steep past the era's life expectancy, harsher in
 * harder times. The ancient world orphans children; the modern world
 * buries parents when you are grown.
 *
 * The store's ageUp calls mortalityStep after the bond drift, applies
 * the grief and the journals, and queues one notice for a parent or
 * spouse. Everything else here is pure.
 */

export type DeathSeverity = 'parent' | 'spouse' | 'other';

export interface Death {
  /** family, contact or child id of who died */
  id: string;
  kind: 'family' | 'contact' | 'child';
  /** the member, for grief (bond) and kinship wording */
  member: FamilyMember | Contact | Child;
  /** journal-ready cause, e.g. "a fever" / "the plague" / "old age" */
  cause: string;
  severity: DeathSeverity;
  /** one second-person journal line */
  journal: string;
  /** happiness grief, from the bond like any other loss */
  grief: number;
}

/** Harshness relative to the modern day, so old worlds kill more. */
function harshness(eraId: EraId): number {
  return getEra(eraId).declineRate / getEra('modern-day').declineRate;
}

/**
 * Annual odds of dying at an age. Doubles roughly every seven years
 * past forty; children barely register except where the world is
 * hard enough to kill them.
 */
function baseRisk(age: number): number {
  if (age < 1) return 0.02;
  if (age < 5) return 0.008;
  if (age < 30) return 0.001;
  if (age < 40) return 0.002;
  return 0.005 * Math.pow(2, (age - 40) / 7);
}

/** Small children die of the world in hard times; rarely now. */
function childRisk(age: number, eraId: EraId): number {
  if (age >= 5) return 0;
  switch (eraId) {
    case 'ancient-world':
    case 'medieval':
    case 'age-of-sail':
      return 0.015;
    case 'industrial':
      return 0.008;
    default:
      return 0.001;
  }
}

/** Extra household risk while a crisis window covers this year. */
function crisisRisk(c: Character, year: number): number {
  const k = crisisFor(c, year);
  if (!k || !k.ailmentId) return 0;
  return Math.min(0.15, -k.onset * 0.01);
}

/** A known household sickness makes its owner likelier to go. */
function sickMultiplier(c: Character, memberId: string): number {
  const sick = c.ailments.some(
    (a) => a.ownerId === memberId && a.known && (AILMENTS[a.ailmentId]?.drain ?? 0) > 0,
  );
  return sick ? 3 : 1;
}

function fullRisk(
  c: Character,
  age: number,
  year: number,
  memberId: string,
): number {
  const risk =
    (Math.max(baseRisk(age), childRisk(age, c.eraId)) * harshness(c.eraId) +
      crisisRisk(c, year)) *
    sickMultiplier(c, memberId);
  return Math.min(0.9, risk);
}

const PLAIN_CAUSES = [
  'a fever',
  'a bad winter',
  'a cough that never lifted',
  'a sudden seizure',
  'a flux of the bowels',
];

function crisisCause(c: Character, year: number): string | null {
  const k = crisisFor(c, year);
  if (!k || !k.ailmentId) return null;
  if (k.ailmentId === 'plague') return 'the plague';
  if (k.ailmentId === 'hunger') return 'hunger';
  if (k.ailmentId === 'influenza') return 'influenza';
  if (k.ailmentId === 'covid') return 'covid';
  return 'the sickness going round';
}

function pickCause(
  c: Character,
  age: number,
  year: number,
  rng: () => number,
): string {
  if (age >= 62) return 'old age';
  if (rng() < 0.35) {
    const crisis = crisisCause(c, year);
    if (crisis) return crisis;
  }
  return PLAIN_CAUSES[Math.floor(rng() * PLAIN_CAUSES.length)] ?? 'a fever';
}

function familyJournal(m: FamilyMember, cause: string): string {
  return `Your ${m.relation} ${m.firstName} ${m.lastName} died of ${cause}.`;
}

function contactJournal(m: Contact, cause: string): string {
  if (m.kind === 'pet') return `${cap(m.petName ?? m.name)} is dead.`;
  if (m.kind === 'partner') return `${cap(contactRef(m))} died of ${cause}.`;
  return `${m.name} died of ${cause}.`;
}

function childJournal(m: Child, cause: string): string {
  const kin = m.gender === 'Female' ? 'daughter' : 'son';
  return `Your ${kin} ${m.firstName} ${m.lastName} died of ${cause}.`;
}

export function severityOf(m: FamilyMember | Contact | Child): DeathSeverity {
  if ('relation' in m) {
    return m.relation === 'mother' || m.relation === 'father' ? 'parent' : 'other';
  }
  if ('kind' in m) {
    return m.kind === 'partner' ? 'spouse' : 'other';
  }
  return 'other';
}

/**
 * Pets burn fast: risk ramps from middle age for them, so a
 * childhood animal rarely sees you grown.
 */
function petRisk(petYears: number, eraId: EraId): number {
  if (petYears < 6) return 0.002 * harshness(eraId);
  return Math.min(0.9, 0.04 * Math.pow(1.5, petYears - 6) * harshness(eraId));
}

export interface MortalityStep {
  family: FamilyMember[];
  contacts: Contact[];
  children: Child[];
  deaths: Death[];
}

/**
 * Roll the year for everyone around the character. Survivors stay in
 * the lists; the dead come back described, journaled and grieved,
 * for the store to apply and announce.
 */
export function mortalityStep(
  c: Character,
  year: number,
  rng: () => number = Math.random,
): MortalityStep {
  const deaths: Death[] = [];
  const family: FamilyMember[] = [];
  for (const m of c.family) {    const age = memberAge(m, c.age);
    if (rng() < fullRisk(c, age, year, m.id)) {
      const cause = pickCause(c, age, year, rng);
      deaths.push({
        id: m.id,
        kind: 'family',
        member: m,
        cause,
        severity: severityOf(m),
        journal: familyJournal(m, cause),
        grief: griefFor(m),
      });
    } else {
      family.push(m);
    }
  }
  const contacts: Contact[] = [];
  for (const m of c.contacts) {
    if (m.kind === 'pet') {
      const petYears = m.ageAtMeeting + m.yearsKnown;
      if (rng() < petRisk(petYears, c.eraId)) {
        deaths.push({
          id: m.id,
          kind: 'contact',
          member: m,
          cause: 'old age',
          severity: 'other',
          journal: contactJournal(m, 'old age'),
          grief: Math.min(griefFor(m), 6),
        });
        continue;
      }
      contacts.push(m);
      continue;
    }
    const age = contactAge(m, c.age);
    if (rng() < fullRisk(c, age, year, m.id)) {
      const cause = pickCause(c, age, year, rng);
      deaths.push({
        id: m.id,
        kind: 'contact',
        member: m,
        cause,
        severity: severityOf(m),
        journal: contactJournal(m, cause),
        grief: griefFor(m),
      });
    } else {
      contacts.push(m);
    }
  }
  const children: Child[] = [];
  for (const k of c.children ?? []) {
    const age = childAge(k, c.age);
    if (rng() < fullRisk(c, age, year, '')) {
      const cause = pickCause(c, age, year, rng);
      deaths.push({
        id: k.id,
        kind: 'child',
        member: k,
        cause,
        severity: 'other',
        journal: childJournal(k, cause),
        grief: griefFor(k),
      });
    } else {
      children.push(k);
    }
  }
  return { family, contacts, children, deaths };
}

/** Grief like any other loss: deeper bonds and longer years hurt more. */
function griefFor(m: { bond: number; yearsKnown: number }): number {
  return bondLossPenalty(m);
}

/**
 * What a dead parent leaves, from the house they kept: rich houses
 * pay out, poor ones leave nothing. Base units for the store to
 * scale into era currency — sized like a large event payout, not a
 * fortune, so inheritances matter without flooding the economy.
 */
export function inheritanceBaseUnits(familyWealth: number): number {
  const w = Math.max(0, Math.min(100, familyWealth)) / 100;
  return Math.round(8 * w * w);
}

/** No mother and no father left in the house. */
export function isOrphaned(family: FamilyMember[]): boolean {
  return !family.some((m) => m.relation === 'mother' || m.relation === 'father');
}

/**
 * Drop sicknesses owned by nobody around: the dead, the left, the
 * grown and gone. Call it wherever the Circle shrinks outside ageUp;
 * ageUp sweeps on its own.
 */
export function dropStrayAilments(c: Character): Character {
  const ids = new Set<string>();
  for (const m of c.family) ids.add(m.id);
  for (const m of c.contacts) ids.add(m.id);
  for (const k of c.children ?? []) ids.add(k.id);
  if (!c.ailments.some((a) => a.ownerId && !ids.has(a.ownerId))) return c;
  return {
    ...c,
    ailments: c.ailments.filter((a) => !a.ownerId || ids.has(a.ownerId)),
  };
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
