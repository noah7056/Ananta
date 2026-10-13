import type { EraId, Stats } from '../types';

/**
 * Things the people in your rented rooms get up to, good and bad.
 * Each template names one tenant; the engine picks per property and
 * year, and `homeFlowStep` carries the outcomes. Notices (no choices)
 * are staged with their gains already applied.
 *
 * To extend: add a template with a unique `key`. Choice outcomes
 * (bonds, money, rent, leaving) live in the flow, words live here.
 */

export interface TenantChoiceDef {
  id: string;
  text: string;
  effects: {
    stats?: Partial<Stats>;
    journal: string;
    result: string;
  };
}

export interface TenantEventDef {
  key: string;
  title: string;
  eras?: EraId[];
  choices: TenantChoiceDef[];
  describe: (name: string) => string;
}

export const TENANT_EVENTS: TenantEventDef[] = [
  {
    key: 'party',
    title: 'A party',
    choices: [
      {
        id: 'overlook',
        text: 'Overlook it',
        effects: {
          journal: 'You overlooked the party.',
          result: 'They promise it will not happen again.',
        },
      },
      {
        id: 'pay',
        text: 'Make them pay',
        effects: {
          journal: 'They paid for what the party broke.',
          result: 'Coin changes hands, and the matter closes.',
        },
      },
      {
        id: 'out',
        text: 'Turn them out',
        effects: {
          journal: 'You turned them out over the party.',
          result: 'The door shuts behind them.',
        },
      },
    ],
    describe: (n) => `${n} threw a party that got out of hand. Something is broken.`,
  },
  {
    key: 'charity',
    title: 'A gathering',
    choices: [
      {
        id: 'allow',
        text: 'Allow it',
        effects: {
          stats: { reputation: 2, happiness: 1 },
          journal: 'You let them hold a charity gathering.',
          result: 'The rooms fill with neighbours.',
        },
      },
      {
        id: 'refuse',
        text: 'Refuse',
        effects: {
          journal: 'You refused them the gathering.',
          result: 'They take it personally.',
        },
      },
    ],
    describe: (n) => `${n} asks to hold a small charity gathering in the rooms.`,
  },
  {
    key: 'cut',
    title: 'A cut',
    choices: [
      {
        id: 'agree',
        text: 'Agree',
        effects: {
          journal: 'You cut their rent.',
          result: 'They are grateful, loudly.',
        },
      },
      {
        id: 'refuse',
        text: 'Refuse',
        effects: {
          journal: 'You held them to the rent.',
          result: 'The air cools.',
        },
      },
    ],
    describe: (n) => `${n} asks for a cut on the rent.`,
  },
  {
    key: 'care',
    title: 'Kept well',
    choices: [],
    describe: (n) => `${n} keeps the rooms better than you would.`,
  },
  {
    key: 'noise',
    title: 'Noise',
    choices: [
      {
        id: 'warn',
        text: 'Warn them',
        effects: {
          journal: 'You warned them about the noise.',
          result: 'They turn it down, for now.',
        },
      },
      {
        id: 'be',
        text: 'Let it be',
        effects: {
          stats: { reputation: -3 },
          journal: 'You let the noise be.',
          result: 'The neighbours learn your name.',
        },
      },
    ],
    describe: () => 'The neighbours complain about the noise from your rooms.',
  },
  {
    key: 'gift',
    title: 'Something extra',
    choices: [],
    describe: (n) => `${n} left something for you with the rent.`,
  },
  {
    key: 'sublet',
    title: 'Strangers',
    eras: ['industrial', 'atomic', 'modern-day'],
    choices: [
      {
        id: 'cut',
        text: 'Take a cut',
        effects: {
          journal: 'You took a cut of the sublet.',
          result: 'The strangers stay, and so does your share.',
        },
      },
      {
        id: 'forbid',
        text: 'Forbid it',
        effects: {
          journal: 'You forbade the sublet.',
          result: 'They hear you out in silence.',
        },
      },
    ],
    describe: (n) => `${n} has been letting the spare corner to strangers.`,
  },
  {
    key: 'shrine',
    title: 'Smoke',
    eras: ['ancient-world', 'medieval'],
    choices: [
      {
        id: 'allow',
        text: 'Allow it',
        effects: {
          journal: 'You let the shrine burn.',
          result: 'The walls darken a little more.',
        },
      },
      {
        id: 'stop',
        text: 'Ask them to stop',
        effects: {
          journal: 'You made them put the shrine out.',
          result: 'The rooms smell of rain again.',
        },
      },
    ],
    describe: (n) => `${n} keeps a shrine that smokes up the walls.`,
  },
  {
    key: 'band',
    title: 'Evenings',
    eras: ['atomic', 'modern-day'],
    choices: [
      {
        id: 'allow',
        text: 'Allow it',
        effects: {
          stats: { happiness: 1 },
          journal: 'You let the band play on.',
          result: 'Some evenings are louder than others.',
        },
      },
      {
        id: 'refuse',
        text: 'Refuse',
        effects: {
          journal: 'You stopped the band.',
          result: 'The evenings go quiet.',
        },
      },
    ],
    describe: (n) => `${n} practises with a band in the evenings.`,
  },
  {
    key: 'roof',
    title: 'Mended',
    choices: [],
    describe: (n) => `${n} patched the roof before the rains.`,
  },
];

/** The templates on offer in this period. */
export function tenantEventsFor(eraId: EraId): TenantEventDef[] {
  return TENANT_EVENTS.filter((e) => !e.eras || e.eras.includes(eraId));
}
