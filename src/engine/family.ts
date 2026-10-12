import type { EraId, FamilyMember } from '../types';
import { randomName, type NameGender } from '../data/names';

/**
 * Random household generation at birth: 0–2 parents, 0–4 siblings,
 * each with a fitting name, an age, and a status (occupation,
 * studying, at home, or unemployed). Add per-era occupations here
 * to extend the world of work.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const OCCUPATIONS: Record<EraId, string[]> = {
  'ancient-world': [
    'baker', 'fuller', 'farmer', 'weaver', 'mason', 'merchant',
    'boatman', 'tanner', 'potter', 'scribe', 'soldier', 'fisher',
  ],
  medieval: [
    'blacksmith', 'miller', 'farmer', 'weaver', 'mason', 'merchant',
    'baker', 'shepherd', 'fisher', 'servant', 'priest', 'guard',
  ],
  'age-of-sail': [
    'shipwright', 'chandler', 'farmer', 'weaver', 'cooper', 'merchant',
    'baker', 'fisher', 'servant', 'sailor', 'brewer', 'cartier',
  ],
  industrial: [
    'mill worker', 'clerk', 'shopkeeper', 'carter', 'musician',
    'seamstress', 'publican', 'nurse', 'policeman', 'stenographer',
    'dockworker', 'teacher',
  ],
  atomic: [
    'teacher', 'nurse', 'driver', 'engineer', 'shop assistant', 'cook',
    'cleaner', 'technician', 'mechanic', 'electrician', 'designer',
    'carer',
  ],
  'modern-day': [
    'teacher', 'nurse', 'driver', 'engineer', 'shop assistant', 'cook',
    'cleaner', 'programmer', 'mechanic', 'electrician', 'designer',
    'carer',
  ],
};

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function occupationsFor(eraId: EraId): string[] {
  return (
    OCCUPATIONS[eraId] ?? [
      'farmer', 'weaver', 'mason', 'merchant', 'baker', 'servant',
      'fisher', 'guard', 'cook', 'porter', 'scribe', 'herder',
    ]
  );
}

function parentStatus(age: number, eraId: EraId, rng: () => number): string {
  const r = rng();
  if (r < 0.15) return 'unemployed';
  if (age < 24 && r < 0.35) return 'studying';
  return pick(occupationsFor(eraId), rng);
}

function siblingStatus(age: number, eraId: EraId, rng: () => number): string {
  if (age < 7) return 'at home';
  if (age < 14) return rng() < 0.75 ? 'studying' : 'at home';
  const r = rng();
  if (r < 0.6) return pick(occupationsFor(eraId), rng);
  if (r < 0.8) return 'studying';
  return 'unemployed';
}

/** Random birth day + month, e.g. "14 March". */
export function randomBirthDate(rng: () => number = Math.random): string {
  return `${1 + Math.floor(rng() * 28)} ${pick(MONTHS, rng)}`;
}

/**
 * The sign you were born under, from a "14 March" birth date. The
 * twelve-sign zodiac reaches back to about 500 BC — before that,
 * the sky had no such divisions.
 */
export function zodiacSign(birthDate: string): string | null {
  const [dayStr, month] = birthDate.split(' ');
  const day = Number(dayStr);
  if (!month || !Number.isFinite(day)) return null;
  const m = MONTHS.indexOf(month) + 1;
  if (m < 1) return null;
  const md = m * 100 + day;
  if (md >= 1222 || md <= 119) return 'Capricorn';
  if (md <= 218) return 'Aquarius';
  if (md <= 320) return 'Pisces';
  if (md <= 419) return 'Aries';
  if (md <= 520) return 'Taurus';
  if (md <= 620) return 'Gemini';
  if (md <= 722) return 'Cancer';
  if (md <= 822) return 'Leo';
  if (md <= 922) return 'Virgo';
  if (md <= 1022) return 'Libra';
  if (md <= 1121) return 'Scorpio';
  return 'Sagittarius';
}

let memberSeq = 0;

/** A random household sharing the given family name. */
export function generateFamily(
  eraId: EraId,
  placeId: string,
  familyName: string,
  rng: () => number = Math.random,
): FamilyMember[] {
  const members: FamilyMember[] = [];
  const firstName = (gender: NameGender) =>
    randomName(eraId, placeId, rng, gender).split(' ')[0] ?? 'Robin';
  const id = () => `fam-${Date.now()}-${memberSeq++}`;

  const sibRoll = rng();
  const sibCount =
    sibRoll < 0.25 ? 0 : sibRoll < 0.55 ? 1 : sibRoll < 0.8 ? 2 : sibRoll < 0.92 ? 3 : 4;
  const sibAges: number[] = [];
  for (let i = 0; i < sibCount; i++) {
    const relation = rng() < 0.5 ? 'brother' : 'sister';
    const age = 1 + Math.floor(rng() * 16);
    sibAges.push(age);
    members.push({
      id: id(),
      relation,
      firstName: firstName(relation === 'sister' ? 'female' : 'male'),
      lastName: familyName,
      ageAtBirth: age,
      status: siblingStatus(age, eraId, rng),
      bond: 70,
      yearsKnown: 0,
    });
  }

  const parentRoll = rng();
  const relations: Array<'mother' | 'father'> =
    parentRoll < 0.12
      ? []
      : parentRoll < 0.35
        ? [rng() < 0.7 ? 'mother' : 'father']
        : ['mother', 'father'];
  // old enough to actually have the oldest child: sixteen at the birth
  const oldest = sibAges.length > 0 ? Math.max(...sibAges) : 0;
  for (const relation of relations) {
    const age = Math.max(20, oldest + 17) + Math.floor(rng() * 18);
    members.push({
      id: id(),
      relation,
      firstName: firstName(relation === 'mother' ? 'female' : 'male'),
      lastName: familyName,
      ageAtBirth: age,
      status: parentStatus(age, eraId, rng),
      // parents start close; siblings a little less so
      bond: relation === 'mother' || relation === 'father' ? 75 : 70,
      yearsKnown: 0,
    });
  }
  return members;
}

/** A member's current age for a character of the given age. */
export function memberAge(m: FamilyMember, characterAge: number): number {
  return m.ageAtBirth + characterAge;
}
/**
 * How to refer to a member: "your mother Elena Rossi",
 * "your brother Ed J". The name always follows, so even two
 * brothers read plainly.
 */
export function kinshipRef(m: FamilyMember, family: FamilyMember[]): string {
  return `your ${m.relation} ${m.firstName} ${m.lastName}`;
}

/** One-line household summary for the birth journal entry. */
export function familySummary(members: FamilyMember[]): string | null {
  if (members.length === 0) return null;
  return members
    .map(
      (m) =>
        `${cap(kinshipRef(m, members))} (${m.ageAtBirth}, ${m.status}).`,
    )
    .join(' ');
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
