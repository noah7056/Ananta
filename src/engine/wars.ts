import type { Character, LifeEvent, LogEntry } from '../types';
import { getEra } from '../data/eras';
import { WARS, type WarDef } from '../data/wars';
import { joinUnit } from './classroom';

/**
 * Being called up. Men of fighting age living through a war's years
 * get their papers year by year; serving, refusing, and coming home
 * run through the store, same shape as the lover chains.
 */

/** The war drafting this life this year, if any. */
export function draftFor(c: Character, year: number): WarDef | null {
  if (c.serving) return null;
  if (c.gender !== 'Male') return null;
  return (
    WARS.find(
      (w) =>
        w.eras.includes(c.eraId) &&
        year >= w.years[0] &&
        year <= w.years[1] &&
        c.age >= (w.minAge ?? 18) &&
        c.age <= (w.maxAge ?? 45),
    ) ?? null
  );
}

/** A year at the front: fire your rifle, or keep your head down. */
export function warYearEvent(war: WarDef): LifeEvent {
  return {
    id: `war-year-${war.id}`,
    title: war.name,
    description: 'Mud, waiting, and the guns at night. Today it is your turn on the line.',
    category: 'fate',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'shoot',
        text: 'Fire your rifle',
        effects: {
          journal: 'You fired your rifle.',
          result: 'Smoke, noise, and afterwards.',
        },
      },
      {
        id: 'hold',
        text: 'Keep your head down',
        effects: {
          journal: 'You kept your head down.',
          result: 'Another day, still breathing.',
        },
      },
    ],
  };
}

/** Quiet war years still get a line. */
const WAR_LINES = [
  'You spent the year in the trenches.',
  'You marched, waited, and marched again.',
  'Another year of mud and waiting.',
];

/** One deployed year: battle, wounds, disease — or nothing, loudly. */
export function warYear(
  c: Character,
  rng: () => number = Math.random,
): { character: Character; died: string | null } {
  const roll = rng();
  if (roll < 0.06) return { character: c, died: 'killed in action' };
  if (roll < 0.11) {
    const wound = 5 + Math.floor(rng() * 8);
    const entry: LogEntry = {
      age: c.age,
      year: c.birthYear + c.age,
      text: 'You were wounded.',
      kind: 'event',
    };
    return {
      character: {
        ...c,
        stats: { ...c.stats, health: Math.max(0, c.stats.health - wound) },
        log: [...c.log, entry],
      },
      died: null,
    };
  }
  if (roll < 0.15) {
    const entry: LogEntry = {
      age: c.age,
      year: c.birthYear + c.age,
      text: 'Dysentery took hold of you.',
      kind: 'event',
    };
    const sick: Character = {
      ...c,
      ailments: [...c.ailments, { ailmentId: 'stomach', ownerId: null, known: true }],
      log: [...c.log, entry],
    };
    return { character: sick, died: null };
  }
  const entry: LogEntry = {
    age: c.age,
    year: c.birthYear + c.age,
    text: WAR_LINES[c.age % WAR_LINES.length]!,
    kind: 'event',
  };
  return {
    character: {
      ...c,
      stats: { ...c.stats, health: Math.max(0, c.stats.health - 2) },
      log: [...c.log, entry],
    },
    died: null,
  };
}

/** Papers arrive: serve, or answer for refusing. */
export function draftEvent(war: WarDef): LifeEvent {
  return {
    id: `draft-${war.id}`,
    title: 'Called Up',
    description: `Your papers have come: ${war.name} wants you. Report, or answer for it.`,
    category: 'fate',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'serve',
        text: 'Serve',
        effects: {
          journal: `You went to ${war.name}.`,
          result: 'You report for duty.',
        },
      },
      {
        id: 'refuse',
        text: 'Refuse',
        effects: {
          journal: 'You refused the call-up.',
          result: 'You stay home — marked.',
        },
      },
    ],
  };
}

/**
 * What the papers come to. Serving sets everything else aside for
 * a rifle; refusing costs coin, cheer, and a flag that follows.
 */
export function warFlowStep(
  eventId: string,
  choiceId: string,
  c: Character,
): { character: Character; events: LifeEvent[]; jobId: null } | null {
  const m = /^draft-(.+)$/.exec(eventId);
  if (m) {
    const war = WARS.find((w) => w.id === m[1]);
    if (!war) return { character: c, events: [], jobId: null };
    if (choiceId === 'serve') {
      // you meet the unit: drawn into the army list, never the Circle
      const enlisted: Character = {
        ...c,
        serving: war.id,
        belongings: ['service-rifle'],
        stashedBelongings: [...(c.stashedBelongings ?? []), ...(c.belongings ?? [])],
        schoolId: null,
        jobId: null,
      };
      return {
        character: joinUnit(enlisted),
        events: [],
        jobId: null,
      };
    }
    const fine = 2 * getEra(c.eraId).moneyScale;
    return {
      character: {
        ...c,
        money: c.money - fine,
        flags: [...c.flags, 'draft-dodger'],
        stats: {
          ...c.stats,
          happiness: Math.max(0, Math.min(100, c.stats.happiness - 8)),
        },
      },
      events: [],
      jobId: null,
    };
  }
  // firing the rifle: rarely commended, usually haunted
  const w = /^war-year-(.+)$/.exec(eventId);
  if (w && choiceId === 'shoot') {
    if (Math.random() < 0.15) {
      const entry: LogEntry = {
        age: c.age,
        year: c.birthYear + c.age,
        text: 'You were commended.',
        kind: 'event',
      };
      return {
        character: {
          ...c,
          flags: [...c.flags, 'decorated'],
          stats: {
            ...c.stats,
            happiness: Math.max(0, Math.min(100, c.stats.happiness + 4)),
          },
          log: [...c.log, entry],
        },
        events: [],
        jobId: null,
      };
    }
    const entry: LogEntry = {
      age: c.age,
      year: c.birthYear + c.age,
      text: 'You fired, and try not to think about it.',
      kind: 'event',
    };
    return {
      character: {
        ...c,
        stats: {
          ...c.stats,
          happiness: Math.max(0, Math.min(100, c.stats.happiness - 3)),
        },
        log: [...c.log, entry],
      },
      events: [],
      jobId: null,
    };
  }
  return null;
}
