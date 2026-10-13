import type { Character, EraId, LifeEvent } from '../types';
import {
  JOBS,
  degreeById,
  jobById,
  jobForSmarts,
  nextJob,
  schoolAt,
  schoolAtFor,
  schoolTierName,
  workStartAge,
  SCHOOL_START_AGE,
  type JobTier,
} from '../data/career';
import { INTERVIEWS, type InterviewQuestion } from '../data/interviews';
import { joinClass, syncCrew } from './classroom';
import { ownsVehicle } from './driving';
import { stepMultiplier } from './activities';
import { formatFunds } from './life';
import { getEra, moneySymbolOf } from '../data/eras';

/**
 * The career track: schooling, then work. Every year the character
 * advances one step — enrolling, moving up a school, graduating,
 * being offered a job, or earning a raise for a year of hard work.
 * Each step that matters announces itself as an event, queued after
 * the year's random one. Getting a job takes two popups: an offer
 * you can refuse, then the interview.
 */

/**
 * Study sessions and extra shifts allowed per year. Both are always
 * available in the career popup — going past the cap still works, it
 * just stops paying out and starts costing health.
 */
export const STUDIES_PER_YEAR = 2;
export const SHIFTS_PER_YEAR = 2;
/** Job interviews asked for per year. Past it, nobody calls back. */
export const HUNTS_PER_YEAR = 2;

/** Below this health or energy the cap drops to one. */
const POOR_HEALTH = 45;

export function studyCap(health: number): number {
  return health < POOR_HEALTH ? 1 : STUDIES_PER_YEAR;
}

export function shiftCap(health: number): number {
  return health < POOR_HEALTH ? 1 : SHIFTS_PER_YEAR;
}

export function huntCap(health: number): number {
  return health < POOR_HEALTH ? 1 : HUNTS_PER_YEAR;
}

/**
 * Sectors hiring in this period, in ladder order.
 */
export function sectorsFor(eraId: EraId): string[] {
  const out: string[] = [];
  for (const j of JOBS[eraId]) {
    if (!out.includes(j.sector)) out.push(j.sector);
  }
  return out;
}

/**
 * The posts on offer in a sector that you are old and sharp enough
 * to hold — and degreed enough, where a degree is asked. Anything
 * above your smarts is not shown as available.
 */
export function jobsInSector(
  eraId: EraId,
  sector: string,
  age: number,
  smarts: number,
  degrees: string[] = [],
): JobTier[] {
  return JOBS[eraId].filter(
    (j) =>
      j.sector === sector &&
      age >= j.minAge &&
      smarts >= j.smartsRequired &&
      (!j.requiresDegree || degrees.includes(j.requiresDegree)),
  );
}

/**
 * Odds an employer agrees to see you. Money talks, a good school
 * record talks, and so does a past with jobs and gigs in it. A
 * criminal record closes most doors.
 */
export function huntChance(c: Character): number {
  const scale = getEra(c.eraId).moneyScale;
  const wealth = Math.max(0, c.money) / scale;
  const school = (c.schoolRecord ?? 25) * 0.003;
  const exp = Math.min(1, ((c.jobsHeld ?? 0) + (c.gigsDone ?? 0)) / 7) * 0.2;
  let score = 0.35 + Math.min(0.3, wealth / 1000) + school + exp;
  if (c.offences > 0) score *= Math.max(0.1, 1 - 0.3 * c.offences);
  if (c.flags.includes('first-offence')) score *= 0.7;
  return Math.max(0.05, Math.min(0.95, score));
}

/**
 * Why they did not call back: the weakest leg of the application,
 * so you know what to fix. Nothing wanting: just a bad day.
 */
export function huntRejectionReason(c: Character): string {
  if (c.offences > 1) {
    return 'They knew about your record.';
  }
  if ((c.schoolRecord ?? 25) < 40) {
    return 'They wanted to see better schoolwork.';
  }
  if ((c.jobsHeld ?? 0) + (c.gigsDone ?? 0) < 2) {
    return 'They wanted someone with more experience.';
  }
  const scale = getEra(c.eraId).moneyScale;
  if (Math.max(0, c.money) / scale < 150) {
    return 'They wanted someone better established.';
  }
  return "They don't call back.";
}

/**
 * Standing drifts down this much every year you hold something, so a
 * bar left alone empties out over a working lifetime.
 */
const YEARLY_SLIP = 6;

/**
 * What you start a new stage on: a fresh school, a fresh post. A
 * promotion resets you here too — the credit for the last job buys
 * you the job, not the standing.
 */
/** Standing handed to a fresh post — and to a demoted one. */
export const NEW_POST_STANDING = 15;

/** You graduate with a little of your own standing already. */
const GRADUATE_STANDING = 25;

/**
 * How hard a raise is to come by. A post has to be held a few years
 * before it counts for anything, so the odds start near nothing and
 * only reach a fair chance once you are both established and stood
 * well of by your employer.
 */
const YEARS_BEFORE_RAISE = 4;
const BASE_RAISE_CHANCE = 0.18;

/** Ids the store recognises as part of the job application flow. */
export const JOB_OFFER_EVENT = 'career-job-offer';
export const INTERVIEW_EVENT = 'career-interview';

/** What one year of the career track produced. */
export interface CareerStep {
  character: Character;
  events: LifeEvent[];
}

function notice(
  id: string,
  title: string,
  description: string,
  journal: string,
): LifeEvent {
  return {
    id,
    title,
    description,
    category: 'work',
    conditions: {},
    weight: 0,
    choices: [],
    effects: { journal },
  };
}

function moneyPerMonth(job: JobTier, c: Character): string {
  const era = getEra(c.eraId);
  return formatFunds(
    Math.max(1, Math.round((job.wage * era.moneyScale) / 12)),
    moneySymbolOf(c),
  );
}

/**
 * One career step per year. Enrolling, moving up a school, graduating
 * and job offers all announce themselves; a hard-worked year may earn
 * a raise. Standing slips a little every year unless you put work in.
 */
export function careerStep(
  c: Character,
  rng: () => number = Math.random,
): CareerStep {
  const school = schoolAtFor(c.eraId, c.age, c.gender);
  // Standing drifts down every year you are doing something, so it has
  // to be earned back. A fresh start (a new post) resets it to
  // nothing: you know nobody there and have proved nothing yet.
  const character: Character = {
    ...c,
    performance:
      c.schoolId !== null || c.jobId !== null || (c.uniId ?? null) !== null
        ? clampTo100(c.performance - YEARLY_SLIP)
        : c.performance,
// the study and shift allowances refill every year
    studiesThisYear: 0,
    shiftsThisYear: 0,
    gigsThisYear: 0,
    jobHuntsThisYear: 0,
    begsThisYear: 0,
    // so does the list of relatives already asked this year
    askedThisYear: [],
    // and the people already flirted with this year
    flirtedThisYear: [],
    // and the ones already asked out this year
    askedOutThisYear: [],
    // and the lovers already taken out this year
    datedThisYear: [],
    // and the lovers already lain with this year
    intimateThisYear: [],
    // and the people already asked to move in this year
    invitedThisYear: [],
    // and the tenants sized up this year
    viewingsThisYear: 0,
    // and the list of activities spent this year
    activitiesUsed: [],
  };

  // Age every habit by a year, then let the worn-out ones recover
  // once their cooldown is up.
  character.activityAged = Object.fromEntries(
    Object.entries(c.activityAged ?? {}).map(([k, v]) => [k, v + 1]),
  );
  character.activityHeat = Object.fromEntries(
    Object.entries(c.activityHeat ?? {}).map(([k, v]) => [
      k,
      stepMultiplier(
        v,
        false,
        (character.activityAged[k] ?? 0) + 1,
      ),
    ]),
  );
const hold = (events: LifeEvent[]): CareerStep => ({ character, events });

// the crew tracks the post: new post, new faces; no post, no crew
Object.assign(character, syncCrew(character));

  // Hired: the post starts from nothing, not from a full bar.
  if (c.jobId === null && character.jobId !== null) {
    character.performance = NEW_POST_STANDING;
  }

  // Enrol on the first year of school. Never from the front, nor from prison.
  if (
    character.schoolId === null &&
    character.jobId === null &&
    school &&
    !character.serving &&
    !character.sentence
  ) {
    character.schoolId = school.id;
    character.performance = NEW_POST_STANDING;
    Object.assign(character, joinClass(character));
    return hold([
      notice(
        'career-enrol',
        'First Day of School',
        `You begin your schooling at ${school.name} in {place}.`,
        `You started school at ${school.name}.`,
      ),
    ]);
  }

  // No school takes her: say so once, at school age.
  if (
    character.schoolId === null &&
    character.jobId === null &&
    !school &&
    schoolAt(c.eraId, c.age) !== null &&
    c.age === SCHOOL_START_AGE &&
    !character.serving &&
    !character.sentence
  ) {
    return hold([
      notice(
        'career-no-school',
        'No School',
        'The schools here do not take girls.',
        'There was no school for you.',
      ),
    ]);
  }

  // Moved up a school: the age bands changed while still enrolled.
  if (
    character.schoolId !== null &&
    school &&
    school.id !== character.schoolId &&
    !character.sentence
  ) {
    character.schoolId = school.id;
    // a new school is a new class, the old one forgotten
    Object.assign(character, joinClass(character));
    return hold([
      notice(
        'career-school-step',
        'New School',
        `You move up to ${school.name} in {place}.`,
        `You started at ${school.name}.`,
      ),
    ]);
  }

  // Studies finished: a degree, then the first offer of work. A girl
  // aged out of what the period lets her attend leaves instead.
  if (character.schoolId !== null && !school) {
    const oldName =
      schoolTierName(character.eraId, character.schoolId) ?? 'school';
    character.schoolId = null;
    character.classFor = null;
    character.classmates = [];
    // employers will ask how school went; this is the answer, kept
    // before the standing resets to a graduate's fresh start
    character.schoolRecord = Math.round(c.performance);
    character.performance = GRADUATE_STANDING;
    if (schoolAt(character.eraId, character.age) !== null) {
      return hold([
        notice(
          'career-left-school',
          'Left School',
          `The ${oldName} has no room for girls.`,
          `You left ${oldName}.`,
        ),
      ]);
    }
    return hold([
      notice(
        'career-graduate',
        'Graduation',
        `You leave {place} with a degree in hand.`,
        `You graduated from high school.`,
      ),
    ]);
  }

  // Reading for a degree: another year done, or the degree itself.
  if (character.uniId !== null && !character.sentence) {
    const degree = degreeById(character.uniId);
    character.uniYears = (character.uniYears ?? 0) + 1;
    if (!degree || character.uniYears >= degree.years) {
      character.uniId = null;
      character.uniYears = 0;
      character.uniFor = null;
      character.uniMates = [];
      if (degree && !(character.degrees ?? []).includes(degree.id)) {
        character.degrees = [...(character.degrees ?? []), degree.id];
      }
      return hold([
        notice(
          'career-graduated-uni',
          'Graduated',
          degree
            ? `You graduate in ${degree.field}.`
            : 'You leave your studies behind.',
          degree
            ? `You graduated in ${degree.field}.`
            : 'You left your studies behind.',
        ),
      ]);
    }
  }

  // Out of work, school done and old enough: an employer makes you
  // an offer. Applying and the interview that follows are their own
  // popups; the job is only yours once you are hired. Never at war or inside.
  if (
    character.schoolId === null &&
    character.jobId === null &&
    !school &&
    !character.serving &&
    !character.sentence &&
    character.age >= workStartAge(character.eraId) &&
    rng() < 0.5
  ) {
    const job = jobForSmarts(
      character.eraId,
      character.age,
      character.stats.smarts,
      character.degrees ?? [],
    );
    if (job) return hold([jobOfferEvent(character, job)]);
  }

  // A year of hard work may earn a raise — but rarely. A post has to
  // be held for a few years and proved at, and standing only tilts
  // the odds; it never carries a year on its own.
  const jobId = character.jobId;
  if (jobId !== null && character.workedHard && !character.sentence) {
    character.workedHard = false;
    character.jobYears = (character.jobYears ?? 0) + 1;
    const tenure = Math.min(1, character.jobYears / YEARS_BEFORE_RAISE);
    const chance = BASE_RAISE_CHANCE * tenure * (0.6 + character.performance / 160);
    if (rng() < chance) {
      const next = nextJob(character.eraId, jobId);
      const promoted =
        next !== null &&
        character.stats.smarts >= next.smartsRequired &&
        (!next.requiresDegree || (character.degrees ?? []).includes(next.requiresDegree)) &&
        (!next.requiresVehicle || ownsVehicle(character));
          character.jobId = promoted ? next.id : jobId;
          // a new post means new faces around it
          if (promoted) Object.assign(character, syncCrew(character));
      character.jobRaises = character.jobRaises + 1;
      // the clock on the old post is done
      if (promoted) character.jobYears = 0;
      // A promotion resets you to the start of the new post. Even a
      // wage bump puts you back on probation: the standing that won
      // it is spent, and you have to earn the new rate.
      character.performance = promoted
        ? NEW_POST_STANDING
        : Math.round(character.performance / 2);
      return hold([
        notice(
          'career-raise',
          'A Raise',
          promoted
            ? `Your work has been noticed in {place}. You are promoted to ${next.title}, ${moneyPerMonth(next, character)} a month.`
            : `Your work has been noticed in {place}. Your wage is raised.`,
          promoted
            ? `You were promoted to ${next.title}.`
            : 'You were given a raise.',
        ),
      ]);
    }
    return hold([]);
  }

  return hold([]);
}

/** An employer offers you a post. Taking it is up to you. */
export function jobOfferEvent(c: Character, job: JobTier): LifeEvent {
  return {
    id: JOB_OFFER_EVENT,
    title: 'A Job Offer',
    description:
      `A firm in {place} is hiring ${job.title}. The post is ${job.position}, ` +
      `paying ${moneyPerMonth(job, c)} a month for ${job.hours} hours a week.`,
    category: 'work',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'apply',
        text: 'Apply for the post',
        effects: {
          journal: `You applied for a post as ${job.title}.`,
          result:
            'They tell you to come in for an interview. You are shown through to the office.',
        },
      },
      {
        id: 'decline',
        text: 'Turn the offer down',
        effects: {
          journal: 'You turned down a job offer.',
          result:
            'You walk away from it. There will be other work, or there will not.',
        },
      },
    ],
  };
}

/**
 * The interview: the question they ask you, four answers, one of
 * which is nonsense. Three get you hired, one does not.
 */
export function interviewEvent(
  c: Character,
  job: JobTier,
  rng: () => number = Math.random,
): LifeEvent {
  const q = pickQuestion(rng);
  const absurdAt = Math.floor(rng() * 4);
  const choices = [...q.answers];
  choices.splice(absurdAt, 0, q.absurd);
  return {
    id: INTERVIEW_EVENT,
    title: 'The Interview',
    description: `Interviewing in {place} for the post of ${job.title}. They ask: ${q.question}`,
    category: 'work',
    conditions: {},
    weight: 0,
    choices: choices.map((a) => ({
      id: a.id,
      text: a.text,
      effects: {
        journal: a.journal,
        result: a.result,
      },
    })),
  };
}

function pickQuestion(rng: () => number): InterviewQuestion {
  return INTERVIEWS[Math.floor(rng() * INTERVIEWS.length)];
}

/** Was this the absurd answer? It fails the interview. */
export function isAbsurdAnswer(answerId: string): boolean {
  for (const q of INTERVIEWS) {
    if (q.absurd.id === answerId) return true;
  }
  return false;
}

/**
 * What the interview ended in: hired (job starts, announced in its own
 * queued popup) or turned down.
 */
export function afterInterview(
  c: Character,
  job: JobTier,
  passed: boolean,
): CareerStep {
  if (!passed) {
    return {
      character: c,
      events: [
        notice(
          'career-rejected',
          'Turned Down',
          `The post of ${job.title} in {place} goes to someone else.`,
          'You were turned down for the job.',
        ),
      ],
    };
  }
  const character: Character = {
    ...c,
    jobId: job.id,
    jobRaises: 0,
    jobsHeld: (c.jobsHeld ?? 0) + 1,
    // the new post starts from nothing
    performance: NEW_POST_STANDING,
  };
  Object.assign(character, syncCrew(character));
  return {
    character,
    events: [
      notice(
        'career-hired',
        'Hired',
        `You start work in {place} as ${job.title} — ${job.position}, ` +
          `${moneyPerMonth(job, c)} a month for ${job.hours} hours a week.`,
        `You were hired as ${job.title}.`,
      ),
    ],
  };
}

/** Yearly earnings: the job's wage, up 25% per raise. Zero without work. */
export function jobWage(c: Character, moneyScale: number): number {
  if (!c.jobId) return 0;
  const job = jobById(c.eraId, c.jobId);
  if (!job) return 0;
  return Math.round(job.wage * (1 + c.jobRaises * 0.25) * moneyScale);
}

/** Monthly pay, for display in the career popup. */
export function monthlyWage(c: Character, moneyScale: number): number {
  return Math.max(1, Math.round(jobWage(c, moneyScale) / 12));
}

/** Current job title, or null when not working. */
export function jobTitle(c: Character): string | null {
  return c.jobId ? (jobById(c.eraId, c.jobId)?.title ?? null) : null;
}

/** Name of the school attended, or null. */
export function schoolName(c: Character): string | null {
  return c.schoolId ? (schoolAt(c.eraId, c.age)?.name ?? null) : null;
}

export { SCHOOL_START_AGE };

function clampTo100(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}
