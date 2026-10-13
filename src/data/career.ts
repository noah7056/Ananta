import type { EraId } from '../types';
import { getEra } from './eras';

/**
 * Studies and work, per era. Each era has a ladder of school types
 * (by age) and a ladder of jobs (by smarts). Wages are authored in
 * base units and scaled by the era's moneyScale, like event money.
 *
 * To extend: append a SchoolTier to the era's SCHOOLS and a JobTier
 * to its JOBS. `smartsRequired` on a job is what a raise needs to
 * promote you into the next tier.
 */

export interface SchoolTier {
  id: string;
  /** e.g. "the high school" */
  name: string;
  minAge: number;
  maxAge: number;
}

export interface JobTier {
  id: string;
  /** e.g. "a blacksmith's apprentice" */
  title: string;
  /** where you sit in the shop, e.g. "entry level" */
  position: string;
  /** which shelf of the job hunt it sits on, e.g. "Craft" */
  sector: string;
  /** hours worked in a week, shown wherever the job is */
  hours: number;
  /** earliest age this job can be taken */
  minAge: number;
  /** yearly wage in base units */
  wage: number;
  /** smarts needed to be hired into, or promoted into, this tier */
  smartsRequired: number;
  /** degree id needed alongside, e.g. "medicine" */
  requiresDegree?: string;
  /** the post needs its own transport: hire and promotion ask for a vehicle */
  requiresVehicle?: boolean;
}

/** Age at which studies begin (career section unlocks). */
export const SCHOOL_START_AGE = 6;

/**
 * Primary → middle → high in every era. The age at which you may
 * first hold a job is the last school's exit age plus one.
 */
const GRADUATION_AGE = 18;

/**
 * Everyone does primary → middle → high school before working.
 * The tiers are the same in every era; only their age bands and
 * the jobs behind them differ.
 */
export const SCHOOLS: Record<EraId, SchoolTier[]> = {
  'ancient-world': [
    { id: 'primary-school', name: 'the ludus', minAge: 6, maxAge: 10 },
    { id: 'middle-school', name: 'the grammatic school', minAge: 11, maxAge: 14 },
    { id: 'high-school', name: 'the rhetoric school', minAge: 15, maxAge: 17 },
  ],
  medieval: [
    { id: 'primary-school', name: 'the primary school', minAge: 6, maxAge: 10 },
    { id: 'middle-school', name: 'the middle school', minAge: 11, maxAge: 14 },
    { id: 'high-school', name: 'the high school', minAge: 15, maxAge: 17 },
  ],
  'age-of-sail': [
    { id: 'primary-school', name: 'the petty school', minAge: 6, maxAge: 10 },
    { id: 'middle-school', name: 'the grammar school', minAge: 11, maxAge: 14 },
    { id: 'high-school', name: 'the Latin school', minAge: 15, maxAge: 17 },
  ],
  industrial: [
    { id: 'primary-school', name: 'the board school', minAge: 6, maxAge: 10 },
    { id: 'middle-school', name: 'the middle school', minAge: 11, maxAge: 14 },
    { id: 'high-school', name: 'the grammar school', minAge: 15, maxAge: 17 },
  ],
  atomic: [
    { id: 'primary-school', name: 'the primary school', minAge: 6, maxAge: 10 },
    { id: 'middle-school', name: 'the middle school', minAge: 11, maxAge: 14 },
    { id: 'high-school', name: 'the high school', minAge: 15, maxAge: 17 },
  ],
  'modern-day': [
    { id: 'primary-school', name: 'the primary school', minAge: 6, maxAge: 10 },
    { id: 'middle-school', name: 'the middle school', minAge: 11, maxAge: 14 },
    { id: 'high-school', name: 'the high school', minAge: 15, maxAge: 17 },
  ],
};

/**
 * Jobs open once school is finished: no tier can be hired before
 * `GRADUATION_AGE`, whatever its own `minAge` says. Wages are yearly
 * in base units, kept high enough that the monthly figure in the
 * career popup is never a bare zero.
 */
export const JOBS: Record<EraId, JobTier[]> = {
  'ancient-world': [
    { id: 'apprentice', title: "a smith's apprentice", position: 'entry level', sector: 'Craft', hours: 54, minAge: 18, wage: 12, smartsRequired: 0 },
    { id: 'farmhand', title: 'a farmhand', position: 'the fields', sector: 'Land', hours: 60, minAge: 18, wage: 14, smartsRequired: 0 },
    { id: 'scribe', title: 'a scribe', position: 'the records office', sector: 'State', hours: 42, minAge: 18, wage: 18, smartsRequired: 20 },
    { id: 'journeyman', title: 'a legionary', position: 'skilled', sector: 'Military', hours: 60, minAge: 18, wage: 24, smartsRequired: 35 },
    { id: 'tutor', title: 'a tutor', position: 'a rich household', sector: 'State', hours: 36, minAge: 18, wage: 30, smartsRequired: 40, requiresDegree: 'letters' },
    { id: 'merchant', title: 'a merchant', position: 'the market', sector: 'Trade', hours: 48, minAge: 18, wage: 34, smartsRequired: 50, requiresVehicle: true },
    { id: 'advocate', title: 'an advocate', position: 'the courts', sector: 'State', hours: 44, minAge: 18, wage: 38, smartsRequired: 50, requiresDegree: 'law' },
    { id: 'physician', title: 'a physician', position: 'a rich practice', sector: 'State', hours: 40, minAge: 18, wage: 40, smartsRequired: 55, requiresDegree: 'medicine' },
    { id: 'master', title: 'a centenarius', position: 'centurion', sector: 'Military', hours: 60, minAge: 18, wage: 44, smartsRequired: 60 },
    { id: 'guild-elder', title: 'a senator', position: 'the curia', sector: 'State', hours: 36, minAge: 18, wage: 70, smartsRequired: 80 },
  ],
  medieval: [
    { id: 'apprentice', title: "a blacksmith's apprentice", position: 'entry level', sector: 'Craft', hours: 54, minAge: 18, wage: 12, smartsRequired: 0 },
    { id: 'field-hand', title: 'a field hand', position: 'the fields', sector: 'Land', hours: 60, minAge: 18, wage: 14, smartsRequired: 0 },
    { id: 'laborer', title: "a mason's laborer", position: 'the building site', sector: 'Craft', hours: 60, minAge: 18, wage: 18, smartsRequired: 20 },
    { id: 'journeyman', title: 'a journeyman', position: 'skilled', sector: 'Craft', hours: 48, minAge: 18, wage: 24, smartsRequired: 35, requiresVehicle: true },
    { id: 'chronicler', title: 'a chronicler', position: 'the abbey', sector: 'Guild', hours: 40, minAge: 18, wage: 30, smartsRequired: 40, requiresDegree: 'letters' },
    { id: 'shopkeeper', title: 'a shopkeeper', position: 'a market stall', sector: 'Trade', hours: 44, minAge: 18, wage: 32, smartsRequired: 50 },
    { id: 'canon-lawyer', title: 'a canon lawyer', position: 'the church courts', sector: 'Guild', hours: 40, minAge: 18, wage: 38, smartsRequired: 50, requiresDegree: 'law' },
    { id: 'physician', title: 'a physician', position: 'a town practice', sector: 'Guild', hours: 40, minAge: 18, wage: 40, smartsRequired: 55, requiresDegree: 'medicine' },
    { id: 'master', title: 'a master craftsman', position: 'your own workshop', sector: 'Craft', hours: 48, minAge: 18, wage: 42, smartsRequired: 60 },
    { id: 'guild-elder', title: 'an elder of the guild', position: 'head of the workshop', sector: 'Guild', hours: 36, minAge: 18, wage: 66, smartsRequired: 80 },
  ],
  'age-of-sail': [
    { id: 'apprentice', title: 'an apprentice in the counting house', position: 'entry level', sector: 'Trade', hours: 48, minAge: 18, wage: 16, smartsRequired: 0 },
    { id: 'deckhand', title: 'a deckhand', position: 'the forecastle', sector: 'Sea', hours: 60, minAge: 18, wage: 18, smartsRequired: 0 },
    { id: 'dockworker', title: 'a dockworker', position: 'the quayside', sector: 'Docks', hours: 60, minAge: 18, wage: 22, smartsRequired: 20, requiresVehicle: true },
    { id: 'notary', title: 'a notary', position: 'the port office', sector: 'Trade', hours: 44, minAge: 18, wage: 26, smartsRequired: 45, requiresDegree: 'law' },
    { id: 'journeyman', title: 'an able seaman', position: 'deck hand', sector: 'Sea', hours: 60, minAge: 18, wage: 28, smartsRequired: 35 },
    { id: 'schoolmaster', title: 'a schoolmaster', position: 'the port school', sector: 'Trade', hours: 40, minAge: 18, wage: 30, smartsRequired: 40, requiresDegree: 'letters' },
    { id: 'navigator', title: 'a navigator', position: 'the chart room', sector: 'Sea', hours: 54, minAge: 18, wage: 38, smartsRequired: 50 },
    { id: 'surgeon', title: "a ship's surgeon", position: 'the cockpit', sector: 'Sea', hours: 54, minAge: 18, wage: 44, smartsRequired: 55, requiresDegree: 'medicine' },
    { id: 'master', title: 'a ship\u2019s master', position: 'master mariner', sector: 'Sea', hours: 60, minAge: 18, wage: 48, smartsRequired: 60 },
    { id: 'guild-elder', title: 'a merchant factor', position: 'the great cabin', sector: 'Trade', hours: 44, minAge: 18, wage: 76, smartsRequired: 80 },
  ],
  industrial: [
    { id: 'factory-hand', title: 'a mill hand', position: 'entry level', sector: 'Mill', hours: 60, minAge: 18, wage: 22, smartsRequired: 0 },
    { id: 'sweeper', title: 'a factory sweeper', position: 'the shop floor', sector: 'Mill', hours: 60, minAge: 18, wage: 24, smartsRequired: 0 },
    { id: 'clerk', title: 'a clerk', position: 'the office', sector: 'Office', hours: 44, minAge: 18, wage: 30, smartsRequired: 20, requiresVehicle: true },
    { id: 'schoolmaster', title: 'a schoolmaster', position: 'the board school', sector: 'Office', hours: 40, minAge: 18, wage: 34, smartsRequired: 40, requiresDegree: 'letters' },
    { id: 'machine-operator', title: 'a machine minder', position: 'skilled', sector: 'Mill', hours: 54, minAge: 18, wage: 38, smartsRequired: 35 },
    { id: 'solicitor', title: 'a solicitor', position: 'a firm', sector: 'Office', hours: 46, minAge: 18, wage: 44, smartsRequired: 50, requiresDegree: 'law' },
    { id: 'engine-driver', title: 'an engine driver', position: 'the footplate', sector: 'Rail', hours: 54, minAge: 18, wage: 50, smartsRequired: 50 },
    { id: 'doctor', title: 'a doctor', position: 'a practice', sector: 'Office', hours: 44, minAge: 18, wage: 58, smartsRequired: 55, requiresDegree: 'medicine' },
    { id: 'foreman', title: 'a foreman', position: 'shop floor', sector: 'Mill', hours: 50, minAge: 18, wage: 62, smartsRequired: 60 },
    { id: 'engineer', title: 'an engineer', position: 'the drawing office', sector: 'Mill', hours: 48, minAge: 18, wage: 72, smartsRequired: 60, requiresDegree: 'engineering' },
    { id: 'works-manager', title: 'a works manager', position: 'head of the works', sector: 'Office', hours: 44, minAge: 18, wage: 96, smartsRequired: 80 },
  ],
  atomic: [
    { id: 'junior-clerk', title: 'a junior clerk', position: 'entry level', sector: 'Office', hours: 40, minAge: 18, wage: 30, smartsRequired: 0 },
    { id: 'cleaner', title: 'a cleaner', position: 'the night shift', sector: 'Service', hours: 40, minAge: 18, wage: 32, smartsRequired: 0, requiresVehicle: true },
    { id: 'typist', title: 'a typist', position: 'the typing pool', sector: 'Office', hours: 40, minAge: 18, wage: 40, smartsRequired: 20 },
    { id: 'teacher', title: 'a teacher', position: 'a classroom', sector: 'Office', hours: 40, minAge: 18, wage: 48, smartsRequired: 40, requiresDegree: 'letters' },
    { id: 'officer', title: 'an officer', position: 'skilled', sector: 'Office', hours: 44, minAge: 18, wage: 52, smartsRequired: 35 },
    { id: 'solicitor', title: 'a solicitor', position: 'a firm', sector: 'Office', hours: 44, minAge: 18, wage: 60, smartsRequired: 55, requiresDegree: 'law' },
    { id: 'supervisor', title: 'a supervisor', position: 'the shop floor', sector: 'Operations', hours: 44, minAge: 18, wage: 68, smartsRequired: 50, requiresVehicle: true },
    { id: 'doctor', title: 'a doctor', position: 'a practice', sector: 'Operations', hours: 44, minAge: 18, wage: 76, smartsRequired: 55, requiresDegree: 'medicine' },
    { id: 'engineer', title: 'an engineer', position: 'the drawing office', sector: 'Operations', hours: 46, minAge: 18, wage: 78, smartsRequired: 60, requiresDegree: 'engineering' },
    { id: 'senior-manager', title: 'a department head', position: 'senior', sector: 'Operations', hours: 48, minAge: 18, wage: 84, smartsRequired: 60 },
    { id: 'director', title: 'a director', position: 'the board', sector: 'Operations', hours: 50, minAge: 18, wage: 130, smartsRequired: 80 },
  ],
  'modern-day': [
    { id: 'junior-associate', title: 'a junior associate', position: 'entry level', sector: 'Administration', hours: 44, minAge: 18, wage: 20, smartsRequired: 0 },
    { id: 'cleaner', title: 'a cleaner', position: 'the night shift', sector: 'Service', hours: 40, minAge: 18, wage: 22, smartsRequired: 0, requiresVehicle: true },
    { id: 'assistant', title: 'an administrative assistant', position: 'the front office', sector: 'Administration', hours: 40, minAge: 18, wage: 32, smartsRequired: 25 },
    { id: 'teacher', title: 'a teacher', position: 'a classroom', sector: 'Administration', hours: 40, minAge: 18, wage: 40, smartsRequired: 40, requiresDegree: 'letters' },
    { id: 'associate', title: 'an associate', position: 'skilled', sector: 'Consulting', hours: 44, minAge: 18, wage: 45, smartsRequired: 40 },
    { id: 'team-lead', title: 'a team lead', position: 'project teams', sector: 'Consulting', hours: 44, minAge: 18, wage: 62, smartsRequired: 55 },
    { id: 'lawyer', title: 'a lawyer', position: 'a firm', sector: 'Consulting', hours: 48, minAge: 18, wage: 68, smartsRequired: 55, requiresDegree: 'law' },
    { id: 'engineer', title: 'an engineer', position: 'a studio', sector: 'Consulting', hours: 44, minAge: 18, wage: 70, smartsRequired: 55, requiresDegree: 'engineering' },
    { id: 'doctor', title: 'a doctor', position: 'a practice', sector: 'Consulting', hours: 44, minAge: 18, wage: 72, smartsRequired: 55, requiresDegree: 'medicine' },
    { id: 'senior-manager', title: 'a senior manager', position: 'senior staff', sector: 'Management', hours: 48, minAge: 18, wage: 80, smartsRequired: 65 },
    { id: 'department-head', title: 'a department head', position: 'senior leadership', sector: 'Management', hours: 50, minAge: 18, wage: 130, smartsRequired: 80 },
  ],
};

/** The school a character of this age attends, or null outside school ages. */
export function schoolAt(eraId: EraId, age: number): SchoolTier | null {
  return (
    SCHOOLS[eraId].find((s) => age >= s.minAge && age <= s.maxAge) ?? null
  );
}

/**
 * The school a character of this age and sex may attend. Girls'
 * access is historical: the ancient ludus and the petty school take
 * them, the grammar and rhetoric schools do not; medieval schooling
 * is closed to them; from industry on, school is open to everyone.
 */
const GIRLS_PRIMARY_ONLY: EraId[] = ['ancient-world', 'age-of-sail'];
const GIRLS_NO_SCHOOL: EraId[] = ['medieval'];

export function schoolAtFor(
  eraId: EraId,
  age: number,
  gender: string,
): SchoolTier | null {
  if (gender !== 'Female') return schoolAt(eraId, age);
  if (GIRLS_NO_SCHOOL.includes(eraId)) return null;
  const tier = schoolAt(eraId, age);
  if (!tier) return null;
  if (GIRLS_PRIMARY_ONLY.includes(eraId) && tier.id !== 'primary-school') {
    return null;
  }
  return tier;
}

/** Display name of a tier by id, for leavers. */
export function schoolTierName(eraId: EraId, id: string): string | null {
  return SCHOOLS[eraId].find((s) => s.id === id)?.name ?? null;
}

/** Earliest age any job in this era can be held. */
export function workStartAge(eraId: EraId): number {
  return Math.max(GRADUATION_AGE, ...JOBS[eraId].map((j) => j.minAge));
}

/**
 * The rung a new hire starts on, or null when they are too young to
 * hold any job at all.
 *
 * Offers always start at the bottom rung you qualify for — which, the
 * bottom tier asking nothing, is the bottom rung outright. Climbing is
 * what promotions are for; a sharp hire climbs fast.
 */
export function jobForSmarts(
  eraId: EraId,
  age: number,
  smarts: number,
  degrees: string[] = [],
): JobTier | null {
  if (age < workStartAge(eraId)) return null;
  const pool = JOBS[eraId].filter(
    (j) =>
      age >= j.minAge &&
      (!j.requiresDegree || degrees.includes(j.requiresDegree)),
  );
  if (pool.length === 0) return null;
  return pool.find((j) => j.smartsRequired <= smarts) ?? pool[0];
}

export function jobById(eraId: EraId, jobId: string): JobTier | null {
  return JOBS[eraId].find((j) => j.id === jobId) ?? null;
}

  /** The tier above the current one, or null at the top. */
  export function nextJob(eraId: EraId, jobId: string): JobTier | null {
    const jobs = JOBS[eraId];
    const idx = jobs.findIndex((j) => j.id === jobId);
    return idx >= 0 ? (jobs[idx + 1] ?? null) : null;
  }

  /** The tier below the current one, or null at the bottom. */
  export function prevJob(eraId: EraId, jobId: string): JobTier | null {
    const jobs = JOBS[eraId];
    const idx = jobs.findIndex((j) => j.id === jobId);
    return idx > 0 ? (jobs[idx - 1] ?? null) : null;
  }

/**
 * Higher study, after school is done. Every period has somewhere to
 * read further — an academy where there are no universities yet.
 * Tuition is base units, paid once on enrolment, by you or by family.
 */

export interface DegreeDef {
  id: string;
  /** e.g. "Medicine" */
  field: string;
  /** years of study to graduate */
  years: number;
  /** base-unit tuition, scaled by the era */
  cost: number;
  /** earliest age of enrolment */
  minAge?: number;
  /** gate to a period; omit for everywhere */
  eras?: EraId[];
}

/** What higher study is called here. */
export const UNI_NAMES: Record<EraId, string> = {
  'ancient-world': 'the Academy',
  medieval: 'the university',
  'age-of-sail': 'the academy',
  industrial: 'the university',
  atomic: 'the university',
  'modern-day': 'the university',
};

export const DEGREES: DegreeDef[] = [
  { id: 'medicine', field: 'Medicine', years: 4, cost: 36, minAge: 18 },
  { id: 'law', field: 'Law', years: 3, cost: 30, minAge: 18 },
  { id: 'letters', field: 'Letters', years: 2, cost: 18, minAge: 18 },
  { id: 'engineering', field: 'Engineering', years: 4, cost: 36, minAge: 18, eras: ['industrial', 'atomic', 'modern-day'] },
];

/** Every degree open to someone of this age, in this period. */
export function degreesFor(eraId: EraId, age: number): DegreeDef[] {
  return DEGREES.filter(
    (d) =>
      (d.minAge === undefined || age >= d.minAge) &&
      (!d.eras || d.eras.includes(eraId)),
  );
}

export function degreeById(id: string): DegreeDef | null {
  return DEGREES.find((d) => d.id === id) ?? null;
}

/** What tuition costs in this era's currency, as a positive figure. */
export function degreeCost(d: DegreeDef, eraId: EraId): number {
  return Math.max(0, Math.round(d.cost * getEra(eraId).moneyScale));
}
