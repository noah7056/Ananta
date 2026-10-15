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

/** A letter from home: answer it, or fold it away for later. */
export function warLetterEvent(): LifeEvent {
  return {
    id: 'war-letter',
    title: 'A Letter From Home',
    description: 'A letter finds you at the front, soft from travelling.',
    category: 'fate',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'reply',
        text: 'Write back at once',
        effects: {
          stats: { happiness: 4 },
          journal: 'You wrote home from the front.',
          result: 'You say you are well, and almost believe it.',
        },
      },
      {
        id: 'keep',
        text: 'Fold it away',
        effects: {
          stats: { happiness: 1 },
          journal: 'You kept the letter close.',
          result: 'You read it twice more before lights out.',
        },
      },
    ],
  };
}

/** A trench raid: volunteers wanted. Glory and danger in one ask. */
export function warRaidEvent(): LifeEvent {
  return {
    id: 'war-raid',
    title: 'Volunteers Wanted',
    description: 'A raid across no-man’s-land at dawn. They are asking for volunteers.',
    category: 'fate',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'volunteer',
        text: 'Volunteer',
        effects: {
          journal: 'You volunteered for the raid.',
          result: 'Over the top before first light.',
        },
      },
      {
        id: 'stay',
        text: 'Stay in the trench',
        effects: {
          stats: { happiness: -1 },
          journal: 'You stayed in the trench.',
          result: 'Someone else goes. You watch them go.',
        },
      },
    ],
  };
}

/** New recruits arrive green. Someone has to show them the ropes. */
export function warRecruitsEvent(): LifeEvent {
  return {
    id: 'war-recruits',
    title: 'Green Recruits',
    description: 'New faces arrive, barely shaving. The sergeant looks at you.',
    category: 'fate',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'mentor',
        text: 'Take them under your wing',
        effects: {
          stats: { happiness: 3, reputation: 2 },
          journal: 'You looked after the new recruits.',
          result: 'You show them what keeps a man alive out here.',
        },
      },
      {
        id: 'ignore',
        text: 'Keep to yourself',
        effects: {
          stats: { happiness: -1 },
          journal: 'You kept to yourself.',
          result: 'They will learn, or they will not.',
        },
      },
    ],
  };
}

/** The field hospital wants hands. The sights stay with you. */
export function warHospitalEvent(): LifeEvent {
  return {
    id: 'war-hospital',
    title: 'The Field Hospital',
    description: 'The field hospital is short of hands after the push.',
    category: 'fate',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'help',
        text: 'Help with the wounded',
        effects: {
          stats: { happiness: -2, reputation: 3 },
          journal: 'You helped in the field hospital.',
          result: 'You hold lamps and basins and do not look away.',
        },
      },
      {
        id: 'rest',
        text: 'Rest instead',
        effects: {
          stats: { energy: 3 },
          journal: 'You rested while others worked.',
          result: 'Sleep, whole and dreamless.',
        },
      },
    ],
  };
}

/** One deployed year brings one face: the line, a letter, a raid, recruits, or the hospital. */
export function pickWarYearEvent(war: WarDef, rng: () => number = Math.random): LifeEvent {
  const roll = rng();
  if (roll < 0.4) return warYearEvent(war);
  if (roll < 0.55) return warLetterEvent();
  if (roll < 0.7) return warRaidEvent();
  if (roll < 0.85) return warRecruitsEvent();
  return warHospitalEvent();
}

/** Quiet war years still get a line. */
const WAR_LINES = [
  'You spent the year in the trenches.',
  'You marched, waited, and marched again.',
  'Another year of mud and waiting.',
];

/** One deployed year: battle, wounds, disease — every hit named. */
export interface WarYearResult {
  character: Character;
  died: string | null;
  /** when hurt but alive: what hit you and how hard, for the popup */
  hit: { cause: string; amount: number } | null;
}

const HIT_CAUSES = [
  'A sniper’s bullet caught you.',
  'Shrapnel tore through the trench.',
  'You stepped on a landmine.',
  'A bayonet found you in the raid.',
  'A shell burst over the parapet.',
];

export function warYear(
  c: Character,
  rng: () => number = Math.random,
): WarYearResult {
  // disarmed at the front: the same mud, worse odds
  const unarmed = (c.flags ?? []).includes('unarmed');
  const kia = unarmed ? 0.1 : 0.06;
  const woundTop = unarmed ? 0.18 : 0.11;
  const roll = rng();
  if (roll < kia) return { character: c, died: 'killed in action', hit: null };
  if (roll < woundTop) {
    const wound = 5 + Math.floor(rng() * 8);
    const cause = HIT_CAUSES[Math.floor(rng() * HIT_CAUSES.length)]!;
    const entry: LogEntry = {
      age: c.age,
      year: c.birthYear + c.age,
      text: `${cause} You lost ${wound} health.`,
      kind: 'event',
    };
    return {
      character: {
        ...c,
        stats: { ...c.stats, health: Math.max(0, c.stats.health - wound) },
        log: [...c.log, entry],
      },
      died: null,
      hit: { cause, amount: wound },
    };
  }
  if (roll < 0.15) {
    const entry: LogEntry = {
      age: c.age,
      year: c.birthYear + c.age,
      text: 'Dysentery took hold of you. You lost 4 health.',
      kind: 'event',
    };
    const sick: Character = {
      ...c,
      ailments: [...c.ailments, { ailmentId: 'stomach', ownerId: null, known: true }],
      stats: { ...c.stats, health: Math.max(0, c.stats.health - 4) },
      log: [...c.log, entry],
    };
    return { character: sick, died: null, hit: { cause: 'Dysentery took hold of you.', amount: 4 } };
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
    hit: null,
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
      // you meet the unit: drawn into the army list, never the Circle.
      // rifle plus the first ration packs; the packs come yearly after
      const enlisted: Character = {
        ...c,
        serving: war.id,
        belongings: ['service-rifle', 'army-rations', 'army-rations'],
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
  // volunteering for the raid: glory or a wound, decided at once
  if (eventId === 'war-raid' && choiceId === 'volunteer') {
    if (Math.random() < 0.25) {
      const wound = 4 + Math.floor(Math.random() * 6);
      const hurt: Character = {
        ...c,
        stats: { ...c.stats, health: Math.max(0, c.stats.health - wound) },
      };
      return {
        character: hurt,
        events: [
          {
            id: 'war-raid-hit',
            title: 'Hit',
            description: `You went over the top and came back bleeding. You lost ${wound} health.`,
            category: 'fate',
            conditions: {},
            weight: 0,
            choices: [],
            effects: { journal: `You were wounded in the raid and lost ${wound} health.` },
          },
        ],
        jobId: null,
      };
    }
    return {
      character: {
        ...c,
        stats: { ...c.stats, reputation: Math.min(100, (c.stats.reputation ?? 50) + 3) },
      },
      events: [],
      jobId: null,
    };
  }
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
