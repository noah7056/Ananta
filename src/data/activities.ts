import type { EraId, StatKey, Stats } from '../types';
import { getEra } from '../data/eras';
import { SCHOOL_START_AGE } from '../data/career';

/**
 * Mind and body, spent over a year. Each row is one thing you can do
 * in the Actions menu; what it is called and what it says changes with
 * the period, because a Roman and a Brooklyner do not spend an
 * afternoon the same way.
 *
 * Add a row to ACTIVITIES. Nothing else needs touching.
 */

export type ActivityKey =
  | 'walk'
  | 'workout'
  | 'garden'
  | 'library'
  | 'meditate'
  | 'voice'
  | 'modelling'
  | 'salon'
  | 'news'
  | 'beg';

/**
 * The activities that train a skill of your own. They carry a progress
 * bar that fills as you do them, at a pace set by the aptitude you
 * were born with — so what comes naturally is something you discover
 * by playing, not something you pick.
 */
export const TRAINABLE: ActivityKey[] = ['voice', 'modelling'];

export interface ActivityDef {
  key: ActivityKey;
  group: 'mind' | 'body';
  /** button text */
  text: string;
  /** journal line, second person */
  journal: string;
  /** one line for the feedback popup */
  notice: string;
  /** what a full session does */
  stats: Partial<Stats>;
  /** base-unit cost, scaled by the era; a gift is negative */
  cost?: number;
  /** how quickly this trains a skill, when it is trainable */
  progressRate?: number;
  minAge?: number;
  maxAge?: number;
  /** era-specific wording, when the era has its own way of saying it */
  eras?: Partial<Record<EraId, { text: string; journal: string; notice: string }>>;
  /** free while studying, costs once you have finished */
  paidAfterSchool?: boolean;
}

/** A row with its era wording already applied. */
export interface ResolvedActivity extends ActivityDef {
  journal: string;
  notice: string;
  text: string;
}

export const ACTIVITIES: ActivityDef[] = [
  {
    key: 'walk',
    group: 'body',
    text: 'Take a walk',
    journal: 'You went for a walk.',
    notice: 'The hours go by and you feel better for them.',
    stats: { happiness: 4, health: 1, energy: 3 },
    minAge: 4,
    eras: {
      'ancient-world': {
        text: 'Walk the cardo',
        journal: 'You walked the cardo and looked at everything.',
        notice: 'The whole city passes you while you take your time.',
      },
      medieval: {
        text: 'Walk the lane',
        journal: 'You walked the lane out of {place}.',
        notice: 'It is a long way to nowhere and you are in no hurry.',
      },
      'age-of-sail': {
        text: 'Walk the quay',
        journal: 'You walked the quay in {place}.',
        notice: 'Everything here smells of tar and rope and salt.',
      },
    },
  },
  {
    key: 'workout',
    group: 'body',
    text: 'Work out',
    journal: 'You worked out.',
    notice: 'You are pleasantly wrecked afterwards.',
    stats: { health: 5, looks: 2, energy: -3 },
    minAge: 10,
    cost: 2,
    paidAfterSchool: true,
    eras: {
      'ancient-world': {
        text: 'Train at the palaestra',
        journal: 'You trained at the palaestra in {place}.',
        notice: 'Oil, dust, and an instructor who does not accept excuses.',
      },
      medieval: {
        text: 'Practise in the yard',
        journal: 'You practised in the yard in {place}.',
        notice: 'The yard is mud and you are going to be mud.',
      },
      'age-of-sail': {
        text: 'Work the rigging',
        journal: 'You worked the rigging in {place}.',
        notice: 'Up and down a rope in a seaway, which is worse than it sounds.',
      },
      industrial: {
        text: 'Work out at the gym',
        journal: 'You worked out at the gym in {place}.',
        notice: 'Heavy iron in a room with a fan bolted to the ceiling.',
      },
    },
  },
  {
    key: 'beg',
    group: 'body',
    text: 'Beg',
    journal: 'You begged in {place}.',
    notice: 'A few coins, and a few looks away.',
    stats: {},
    minAge: 6,
    eras: {
      'ancient-world': {
        text: 'Beg alms',
        journal: 'You begged alms in {place}.',
        notice: 'A crust here, a coin there.',
      },
      medieval: {
        text: 'Beg alms',
        journal: 'You begged alms in {place}.',
        notice: 'A crust here, a coin there.',
      },
      'modern-day': {
        text: 'Panhandle',
        journal: 'You panhandled in {place}.',
        notice: 'Mostly looks away. Sometimes not.',
      },
    },
  },
  {
    key: 'garden',
    group: 'body',
    text: 'Tend the garden',
    journal: 'You spent the year in the garden.',
    notice: 'Nothing dramatic happens. You are better for it anyway.',
    stats: { happiness: 5, health: 2, energy: 1 },
    minAge: 6,
    eras: {
      'ancient-world': {
        text: 'Work the villa gardens',
        journal: 'You worked the gardens of {place}.',
        notice: 'Box, laurel, and a slave who is better at this than you.',
      },
      medieval: {
        text: 'Dig the garden',
        journal: 'You dug in the garden in {place}.',
        notice: 'Your back has opinions and it shares them loudly.',
      },
      industrial: {
        text: 'Work an allotment',
        journal: 'You kept an allotment in {place}.',
        notice: 'Behind the row, out of the smoke, and nobody bothers you.',
      },
    },
  },
  {
    key: 'salon',
    group: 'body',
    text: 'Salon & spa',
    journal: 'You spent time on yourself.',
    notice: 'You come out feeling looked after.',
    stats: {},
    minAge: SCHOOL_START_AGE,
    eras: {
      'ancient-world': {
        text: 'The baths',
        journal: 'You spent the afternoon at the baths in {place}.',
        notice: 'Oil, hot water, and an hour you did not have to spend.',
      },
      medieval: {
        text: 'The bathhouse',
        journal: 'You spent an hour at the bathhouse in {place}.',
        notice: 'Hot water and strong soap.',
      },
      'age-of-sail': {
        text: 'The wash-house',
        journal: 'You took the waters at the wash-house in {place}.',
        notice: 'Scrubbed within an inch of polite.',
      },
      industrial: {
        text: 'The public baths',
        journal: 'You took the waters at the public baths in {place}.',
        notice: 'A penny well spent.',
      },
      atomic: {
        text: 'The beauty parlor',
        journal: 'You spent the afternoon at the beauty parlor in {place}.',
        notice: 'You come out somebody else.',
      },
    },
  },
  {
    key: 'library',
    group: 'mind',
    text: 'Go to the library',
    journal: 'You spent the year in the library.',
    notice: 'A whole winter indoors with other people’s problems.',
    stats: { smarts: 5, happiness: 2, energy: 1 },
    minAge: 7,
    eras: {
      'ancient-world': {
        text: 'Work in the great library',
        journal: 'You worked in the great library at {place}.',
        notice: 'Scrolls, dust, and someone always copying someone.',
      },
      medieval: {
        text: 'Read in the scriptorium',
        journal: 'You read in the scriptorium in {place}.',
        notice: 'A cold room, bad light, and a monk who does not like you.',
      },
      'age-of-sail': {
        text: 'Read in the coffee house',
        journal: 'You read in the coffee house in {place}.',
        notice: 'A broadsheet, a coffee, and an argument at the next table.',
      },
    },
  },
  {
    key: 'meditate',
    group: 'mind',
    text: 'Meditate',
    journal: 'You spent the year sitting quietly.',
    notice: 'An hour a day of doing nothing on purpose.',
    stats: { happiness: 5, health: 1, energy: 4 },
    minAge: 10,
    eras: {
      medieval: {
        text: 'Pray',
        journal: 'You kept the hours in {place}.',
        notice: 'The whole village is down and so are you.',
      },
      'age-of-sail': {
        text: 'Sit at anchor',
        journal: 'You sat at anchor off {place} for a day.',
        notice: 'The only day all year with nothing whatsoever to do.',
      },
      'ancient-world': {
        text: 'Contemplate',
        journal: 'You sat and contemplated in {place}.',
        notice: 'The philosophers would approve, and one of them would join you.',
      },
    },
  },
  {
    key: 'voice',
    group: 'mind',
    text: 'Take voice lessons',
    journal: 'You took voice lessons.',
    notice: 'You can hold a note now. That was not always true.',
    stats: { happiness: 3, looks: 2 },
    minAge: 8,
    cost: 2,
    paidAfterSchool: true,
    progressRate: 1.6,
    eras: {
      'ancient-world': {
        text: 'Learn declamation',
        journal: 'You learned declamation in {place}.',
        notice: 'You stand in a hall and make the walls work for you.',
      },
      'age-of-sail': {
        text: 'Learn a shanty',
        journal: 'You learned a shanty in {place}.',
        notice: 'The only voice you have ever been asked to raise.',
      },
      industrial: {
        text: 'Join the church choir',
        journal: 'You sang in the choir in {place}.',
        notice: 'A hundred neighbours and one very exposed solo.',
      },
    },
  },
  {
    key: 'modelling',
    group: 'mind',
    text: 'Take modelling lessons',
    journal: 'You took modelling lessons.',
    notice: 'You hold a pose for an absurd length of time. It builds something.',
    stats: { looks: 6, happiness: 2, energy: -2 },
    cost: 3,
    minAge: 12,
    paidAfterSchool: true,
    progressRate: 1.6,
    eras: {
      industrial: {
        text: 'Sit for an artist',
        journal: 'You sat for an artist in {place}.',
        notice: 'Three hours holding still while somebody studies your face.',
      },
      atomic: {
        text: 'Take modelling lessons',
        journal: 'You took modelling lessons in {place}.',
        notice: 'A photographer’s studio, a hard chair, and a very long exposure.',
      },
    },
  },
  {
    key: 'news',
    group: 'mind',
    text: 'Check the news',
    journal: 'You caught up on the news.',
    notice: 'You know what the world is doing.',
    stats: { smarts: 2, happiness: 1 },
    minAge: 6,
    eras: {
      'ancient-world': {
        text: 'Hear the news',
        journal: 'You listened for news in {place}.',
        notice: 'War, grain and gossip, in that order.',
      },
      medieval: {
        text: 'Hear the news',
        journal: 'You listened to the crier in {place}.',
        notice: 'Oyez, oyez, and so forth.',
      },
      'age-of-sail': {
        text: 'Read the gazette',
        journal: 'You read the gazette in {place}.',
        notice: 'Three months old and still news.',
      },
      industrial: {
        text: 'Read the newspaper',
        journal: 'You read the newspaper in {place}.',
        notice: 'The ink comes off on your fingers.',
      },
      atomic: {
        text: 'Watch the news',
        journal: 'You watched the evening news in {place}.',
        notice: 'The world, in black and white.',
      },
    },
  },
];

/** Begging: low odds per try, but many tries a year. */
export const BEG_CAP = 6;
export const BEG_CHANCE = 0.3;

/** The row, with whatever wording this period uses. */
export function resolveActivity(
  def: ActivityDef,
  eraId: EraId,
): ResolvedActivity {
  const over = def.eras?.[eraId];
  return over ? { ...def, ...over } : { ...def };
}