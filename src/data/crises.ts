import type { EraId } from '../types';

/**
 * Years the world itself kills: plague and flu windows that strike
 * anyone alive in them, whatever their age. Caught once — the
 * ailments are incurable, so living through it means dodging it.
 *
 * To extend: add a row with the calendar years and the ailment it
 * inflicts. Keep windows short; a few percent dodge even the worst.
 */

export interface CrisisDef {
  id: string;
  /** notice title */
  title: string;
  /** one or two plain sentences for the popup */
  description: string;
  /** catalog id inflicted on a catch; omit for money-only years */
  ailmentId?: string;
  /** first and last calendar year, inclusive */
  years: [number, number];
  /** periods whose lives can live through it */
  eras: EraId[];
  /** odds of catching it in each year of the window */
  catchChance: number;
  /** immediate health loss on catching (negative) */
  onset: number;
  /** base-unit funds lost each catching year (selling the future to eat) */
  money?: number;
  /** journal line, second person */
  journal: string;
  /** journal line when the years pass with the sickness still on you */
  recovered?: string;
  /** false when survivors keep the sickness for life (default true) */
  recovers?: boolean;
}

export const CRISES: CrisisDef[] = [
  {
    id: 'antonine-plague',
    title: 'The Plague',
    description: 'Soldiers brought it home from the east, and now the dead lie unburied for want of hands.',
    ailmentId: 'plague',
    years: [165, 169],
    eras: ['ancient-world'],
    catchChance: 0.5,
    onset: -12,
    journal: 'You caught the plague.',
    recovered: 'You lived through the plague.',
    recovers: false,
  },
  {
    id: 'black-death',
    title: 'The Plague',
    description: 'The dying carts pass daily now. Your turn has come: the swellings are under your arms.',
    ailmentId: 'plague',
    years: [1348, 1350],
    eras: ['medieval'],
    catchChance: 0.7,
    onset: -15,
    journal: 'You caught the plague.',
    recovered: 'You lived through the plague.',
    recovers: false,
  },
  {
    id: 'great-plague',
    title: 'The Plague',
    description: 'The red cross is painted on doors up and down the street. Now it is painted on yours.',
    ailmentId: 'plague',
    years: [1665, 1666],
    eras: ['age-of-sail'],
    catchChance: 0.5,
    onset: -10,
    journal: 'You caught the plague.',
    recovered: 'You lived through the plague.',
    recovers: false,
  },
  {
    id: 'spanish-flu',
    title: 'Influenza',
    description: 'Half the street is coughing blood and the hospitals turn people away. Now your chest burns too.',
    ailmentId: 'influenza',
    years: [1918, 1920],
    eras: ['industrial'],
    catchChance: 0.35,
    onset: -5,
    journal: 'You caught influenza.',
    recovered: 'You shook off influenza.',
  },
  {
    id: 'covid',
    title: 'Covid',
    description: 'A dry cough going round turns out to be more than that. The streets empty and the hospitals fill.',
    ailmentId: 'covid',
    years: [2020, 2022],
    eras: ['modern-day'],
    catchChance: 0.3,
    onset: -3,
    journal: 'You caught Covid.',
    recovered: 'You shook off Covid.',
  },
  {
    id: 'great-famine',
    title: 'The Famine',
    description: 'Three wet summers have rotted the grain in the fields. Bread costs its weight in silver.',
    ailmentId: 'hunger',
    years: [1315, 1317],
    eras: ['medieval'],
    catchChance: 0.55,
    onset: -10,
    money: -2,
    journal: 'The harvest failed, and you went hungry.',
    recovered: 'The harvest came back, and you ate.',
  },
  {
    id: 'great-depression',
    title: 'The Depression',
    description: 'Banks are failing and the jobless queue round the block. Nobody is hiring, and savings melt.',
    years: [1929, 1933],
    eras: ['industrial'],
    catchChance: 1,
    onset: -2,
    money: -4,
    journal: 'You stood in the breadline.',
  },
];
