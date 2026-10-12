import type { Character, EraId, LifeEvent, LogEntry } from '../types';
import { getEra } from '../data/eras';

/**
 * Crime and its consequences. The first time you are caught it is a
 * warning — a fine, a fright, a mark. The second time it is a record,
 * and the record follows: employers ask, families hesitate, and the
 * next stretch inside is longer than the last.
 *
 * Sentences run like war: a prison year shelves the working life and
 * the body still decays, then you come home to what you left. Debt
 * collects when you cannot pay — the collectors take what you have.
 */

export interface CrimeDef {
  id: string;
  title: string;
  /** supports {name} and {place} */
  description: string;
  minAge: number;
  maxAge: number;
  eras?: EraId[];
  /** base units taken when it works */
  pay: number;
  /** how hard the world comes down on a catch */
  severity: 'petty' | 'serious' | 'violent';
}

export const CRIMES: CrimeDef[] = [
  {
    id: 'crime-pickpocket',
    title: 'An Easy Mark',
    description:
      'A stranger in the crowd at {place} is close enough that the purse at their belt is practically asking for it.',
    minAge: 12,
    maxAge: 60,
    pay: 3,
    severity: 'petty',
  },
  {
    id: 'crime-burglary',
    title: 'The Empty House',
    description:
      'A house on the edge of {place} stands empty at this hour, and the lock is the kind that opens to patience.',
    minAge: 14,
    maxAge: 55,
    pay: 6,
    severity: 'serious',
  },
  {
    id: 'crime-smuggle',
    title: 'Past the Watch',
    description:
      'A cart of untaxed goods needs moving past the watch in {place}, and the man with the cart is not particular.',
    minAge: 16,
    maxAge: 50,
    eras: ['age-of-sail', 'industrial'],
    pay: 8,
    severity: 'serious',
  },
  {
    id: 'crime-duel',
    title: 'The Insult',
    description:
      'Somebody in {place} said something about your mother that cannot be allowed to stand, and the only answer they will take is steel.',
    minAge: 18,
    maxAge: 45,
    pay: 0,
    severity: 'violent',
  },
];

/** Odds a crime comes off, before the world notices. */
export function crimeOdds(crime: CrimeDef, c: Character): number {
  let chance = crime.severity === 'petty' ? 0.6 : crime.severity === 'serious' ? 0.5 : 0.4;
  if (c.offences > 0) chance -= 0.15 * c.offences;
  if (c.flags.includes('decorated')) chance += 0.1;
  if (c.flags.includes('draft-dodger')) chance -= 0.1;
  return Math.max(0.15, Math.min(0.9, chance));
}

/** Prison years for a caught crime, by severity and record. */
export function sentenceYears(crime: CrimeDef, c: Character): number {
  const base = crime.severity === 'petty' ? 1 : crime.severity === 'serious' ? 3 : 5;
  return base + Math.min(4, c.offences * 2);
}

/**
 * The caught popup: what the world does about it. A first offence is
 * a warning — a fine, or a beating when there is nothing to take.
 * After that, the sentence is the cells.
 */
export function caughtEvent(crime: CrimeDef, c: Character): LifeEvent {
  const first = c.offences === 0;
  const years = sentenceYears(crime, c);
  const baseFine = crime.severity === 'petty' ? 2 : crime.severity === 'serious' ? 6 : 10;
  const title = first ? 'Caught' : 'The Record';
  const description = first
    ? `The watch has you for the ${crime.title.toLowerCase()}. There is a fine in it, and a mark against your name.`
    : `The watch has you again. This time there is a sentence: ${years} year${years === 1 ? '' : 's'} inside.`;
  return {
    id: `caught-${crime.id}-${c.age}`,
    title,
    description,
    category: 'peril',
    conditions: {},
    weight: 0,
    choices:
      c.age >= 16 && !first
        ? [
            {
              id: 'accept',
              text: 'Accept the sentence',
              effects: {
                journal: `You were sentenced to ${years} year${years === 1 ? '' : 's'} for the ${crime.title.toLowerCase()}.`,
                result: 'The cell door shuts behind you.',
              },
            },
          ]
        : [
            {
              id: 'pay',
              text: 'Pay the fine',
              effects: {
                money: -baseFine,
                stats: { reputation: -3 },
                journal: `You paid the fine for the ${crime.title.toLowerCase()}.`,
                result: 'You hand over the coin and walk away with a warning.',
              },
            },
          ],
  };
}

/**
 * What the caught popup comes to. Paying the fine is a warning; the
 * rest is a sentence, and the record grows. Same shape as the lover
 * and war flows, so the store chains it the same way.
 */
export function crimeFlowStep(
  eventId: string,
  choiceId: string,
  c: Character,
): { character: Character; events: LifeEvent[]; jobId: null } | null {
  const m = /^caught-(.+)-(\d+)$/.exec(eventId);
  if (!m) return null;
  const crime = CRIMES.find((k) => k.id === m![1]);
  if (!crime) return null;
  const firstFlag = !c.flags.includes('first-offence') ? [...c.flags, 'first-offence'] : c.flags;
  if (choiceId === 'pay') {
    return {
      character: {
        ...c,
        offences: c.offences + 1,
        flags: c.offences === 0 ? firstFlag : c.flags,
        stats: clampStats({ ...c.stats, reputation: c.stats.reputation - 3 }),
      },
      events: [],
      jobId: null,
    };
  }
  // the cells: a sentence, and the record grows
  const years = sentenceYears(crime, c);
  return {
    character: {
      ...c,
      sentence: years,
      offences: c.offences + 1,
      flags: c.offences === 0 ? firstFlag : c.flags,
      schoolId: null,
      jobId: null,
      uniId: null,
      uniYears: 0,
      uniFor: null,
      uniMates: [],
      stats: clampStats({ ...c.stats, reputation: c.stats.reputation - 5 }),
    },
    events: [],
    jobId: null,
  };
}

/** One year inside: the world goes on without you. */
export function prisonYear(
  c: Character,
  rng: () => number = Math.random,
): { character: Character; died: string | null } {
  const entry: LogEntry = {
    age: c.age,
    year: c.birthYear + c.age,
    text: 'You served a year inside.',
    kind: 'event',
  };
  const sentence = (c.sentence ?? 1) - 1;
  const hard = rng() < 0.1;
  const wound = hard ? 4 + Math.floor(rng() * 6) : 0;
  return {
    character: {
      ...c,
      sentence: sentence > 0 ? sentence : null,
      jobId: null,
      schoolId: null,
      stats: clampStats({
        ...c.stats,
        health: c.stats.health - 2 - wound,
        energy: c.stats.energy - 1,
      }),
      log: [...c.log, entry],
    },
    died: c.stats.health - 2 - wound <= 0 ? 'dead in prison' : null,
  };
}

/**
 * The collectors come when you owe and cannot pay: they take what
 * you have, and what they cannot take they take in standing. Not a
 * game over — a hole you climb out of.
 */
export function debtCollectEvent(c: Character): LifeEvent | null {
  if (c.money >= 0) return null;
  return {
    id: `debt-collect-${c.age}`,
    title: 'The Collectors',
    description: `You owe more than you have, and the men who lent to you have come for it.`,
    category: 'peril',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'pay-up',
        text: 'Hand over what you have',
        effects: {
          money: -c.money / getEra(c.eraId).moneyScale,
          stats: { reputation: -4 },
          journal: 'The collectors took what you had.',
          result: 'They leave you the clothes on your back.',
        },
      },
    ],
  };
}

function clampStats(s: Character['stats']): Character['stats'] {
  const out = { ...s };
  for (const k of ['health', 'happiness', 'smarts', 'looks', 'energy', 'reputation'] as const) {
    out[k] = Math.max(0, Math.min(100, Math.round(out[k] ?? (k === 'reputation' ? 50 : 70))));
  }
  return out;
}
