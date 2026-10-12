import type { EraId } from '../types';

/**
 * Wars that draft. Men of fighting age living through the window get
 * called up year by year; serving, refusing, and coming home are
 * handled by the store through the war flow.
 *
 * To extend: add a row with the calendar years. Draft age stays
 * 18–45 unless a war says otherwise.
 */

export interface WarDef {
  id: string;
  /** what it is called in journals and popups */
  name: string;
  /** first and last calendar year, inclusive */
  years: [number, number];
  /** periods whose lives can be drafted into it */
  eras: EraId[];
  /** odds of papers arriving in each year of the window */
  draftChance: number;
  minAge?: number;
  maxAge?: number;
}

export const WARS: WarDef[] = [
  {
    id: 'napoleonic-wars',
    name: 'the Napoleonic Wars',
    years: [1803, 1815],
    eras: ['age-of-sail'],
    draftChance: 0.4,
    minAge: 18,
    maxAge: 45,
  },
  {
    id: 'first-world-war',
    name: 'the Great War',
    years: [1914, 1918],
    eras: ['industrial'],
    draftChance: 0.5,
    minAge: 18,
    maxAge: 45,
  },
  {
    id: 'second-world-war',
    name: 'the Second World War',
    years: [1939, 1945],
    eras: ['industrial'],
    draftChance: 0.5,
    minAge: 18,
    maxAge: 45,
  },
];
