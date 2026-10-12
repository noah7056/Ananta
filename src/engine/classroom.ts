import type { Character, Contact, EraId } from '../types';
import { randomName, type NameGender } from '../data/names';
import { FRIEND_TRADES } from './contacts';

/**
 * Your classmates and your teacher. The roster is drawn the first
 * time you open it and held for as long as you stay in that school,
 * so the same faces come back after a term. Changing school throws
 * the whole class out and builds a new one; anyone you actually
 * befriend joins the Circle proper too, bond and all, and stays there.
 */

export interface Classmate extends Contact {
  /** the teacher is an adult and does not age with you */
  isTeacher: boolean;
}

const CLASS_SIZES: Record<EraId, number> = {
  'ancient-world': 5,
  medieval: 6,
  'age-of-sail': 6,
  industrial: 7,
  atomic: 8,
  'modern-day': 8,
};

const TEACHERS: Record<EraId, { male: string[]; female: string[] }> = {
  'ancient-world': {
    male: ['Master Gaius', 'Rhetor Seneca', 'grammarian Lucius'],
    female: ['Mistress Livia'],
  },
  medieval: {
    male: ['Brother Aldric', 'Master Hobb'],
    female: ['Sister Maud', 'Dame Cecily'],
  },
  'age-of-sail': {
    male: ['Master Graves', 'Petrus Vlack', 'Jan Baptist'],
    female: ['Mistress Crome'],
  },
  industrial: {
    male: ['Mr. Doyle', 'Mr. Hallam'],
    female: ['Miss Adler', 'Mrs. Niblett'],
  },
  atomic: {
    male: ['Mr. Doyle', 'Mr. Kowalski'],
    female: ['Miss Adler', 'Mrs. Vance'],
  },
  'modern-day': {
    male: ['Mr. Okafor', 'Mr. Halloran', 'Dr. Nandi'],
    female: ['Ms. Ferrari', 'Dr. Nandi'],
  },
};

/** Adults this age or older are past school with you. */
const ADULT_AGE = 18;

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function makeRoster(c: Character): Classmate[] {
  const era: EraId = c.eraId;
  const rng = Math.random;
  const teacherGender: NameGender = rng() < 0.5 ? 'male' : 'female';
  const members: Classmate[] = [
    {
      id: `class-teacher`,
      name: pick(TEACHERS[era][teacherGender], rng),
      kind: 'friend',
      gender: teacherGender === 'male' ? 'Male' : 'Female',
      status: 'your teacher',
      ageAtMeeting: ADULT_AGE + 8 + Math.floor(rng() * 22),
      petName: null,
      bond: 40,
      yearsKnown: 0,
      isTeacher: true,
    },
  ];
  const count = CLASS_SIZES[era] ?? 6;
  for (let i = 0; i < count; i++) {
    const gender: NameGender = rng() < 0.5 ? 'male' : 'female';
    members.push({
      // classmates are always your age, whoever they are
      id: `class-pupil-${i}-${Math.floor(rng() * 1e6)}`,
      name: randomName(era, c.placeId, rng, gender),
      kind: 'friend',
      gender: gender === 'male' ? 'Male' : 'Female',
      status: 'in your class',
      ageAtMeeting: c.age,
      petName: null,
      bond: 30,
      yearsKnown: 0,
      isTeacher: false,
    });
  }
  return members;
}

/**
 * The class as it stands. A new school means a new class, drawn on
 * enrolment; within a school the roster is the one already drawn,
 * minus anyone pushed away for good.
 */
export function classOf(c: Character): Classmate[] {
  if (!c.schoolId || c.classFor !== c.schoolId) return [];
  return Array.isArray(c.classmates) ? c.classmates : [];
}

/**
 * Draw the class for the school you have just joined. Called once, on
 * enrolment and on every move up a school — so the roster is a fact about
 * the character rather than something the UI invents.
 */
export function joinClass(c: Character): Character {
  return {
    ...c,
    classFor: c.schoolId,
    classmates: makeRoster(c),
  };
}

/**
 * Course mates at higher study: a tutor and fellow readers. Drawn
 * once, on enrolment — held until graduation or leaving, like a class.
 */
export function uniOf(c: Character): Classmate[] {
  if (!c.uniId || c.uniFor !== c.uniId) return [];
  return Array.isArray(c.uniMates) ? c.uniMates : [];
}

function makeUniRoster(c: Character): Classmate[] {
  const era: EraId = c.eraId;
  const rng = Math.random;
  const tutorGender: NameGender = rng() < 0.5 ? 'male' : 'female';
  const members: Classmate[] = [
    {
      id: `uni-tutor`,
      name: pick(TEACHERS[era][tutorGender], rng),
      kind: 'friend',
      gender: tutorGender === 'male' ? 'Male' : 'Female',
      status: 'your tutor',
      ageAtMeeting: ADULT_AGE + 8 + Math.floor(rng() * 22),
      petName: null,
      bond: 40,
      yearsKnown: 0,
      isTeacher: true,
    },
  ];
  const count = 4 + Math.floor(rng() * 3);
  for (let i = 0; i < count; i++) {
    const gender: NameGender = rng() < 0.5 ? 'male' : 'female';
    members.push({
      id: `uni-pupil-${i}-${Math.floor(rng() * 1e6)}`,
      name: randomName(era, c.placeId, rng, gender),
      kind: 'friend',
      gender: gender === 'male' ? 'Male' : 'Female',
      status: 'in your course',
      ageAtMeeting: c.age,
      petName: null,
      bond: 30,
      yearsKnown: 0,
      isTeacher: false,
    });
  }
  return members;
}

/** Draw the course for the degree just started. Called once, on enrolment. */
export function joinUni(c: Character): Character {
  return {
    ...c,
    uniFor: c.uniId,
    uniMates: makeUniRoster(c),
  };
}

/** Someone you work beside: a coworker, or the boss who decides raises. */
export interface Coworker {
  id: string;
  name: string;
  gender: string;
  /** what they do beside you — a boss is simply the boss */
  role: string;
  bond: number;
  isBoss: boolean;
}

/** The crew as it stands: drawn on hiring, held while the post holds. */
export function crewOf(c: Character): Coworker[] {
  const post = c.jobId ?? c.serving ?? null;
  if (!post || c.crewFor !== post) return [];
  return Array.isArray(c.coworkers) ? c.coworkers : [];
}

function makeCrew(c: Character, rng: () => number = Math.random): Coworker[] {
  const era: EraId = c.eraId;
  const bossGender: NameGender = rng() < 0.5 ? 'male' : 'female';
  const crew: Coworker[] = [
    {
      id: `crew-boss`,
      name: randomName(era, c.placeId, rng, bossGender),
      gender: bossGender === 'male' ? 'Male' : 'Female',
      role: 'the boss',
      bond: 40,
      isBoss: true,
    },
  ];
  const trades =
    FRIEND_TRADES[era] ?? FRIEND_TRADES['modern-day'];
  for (let i = 0; i < 4; i++) {
    const gender: NameGender = rng() < 0.5 ? 'male' : 'female';
    crew.push({
      id: `crew-${i}-${Math.floor(rng() * 1e6)}`,
      name: randomName(era, c.placeId, rng, gender),
      gender: gender === 'male' ? 'Male' : 'Female',
      role: pick(trades, rng),
      bond: 30,
      isBoss: false,
    });
  }
  return crew;
}

/**
 * Draw the crew for the post just taken. Called on hiring and on
 * every move between posts — so, like the class, it is a fact about
 * the character rather than something the UI invents.
 */
export function joinCrew(c: Character): Character {
  if (!c.jobId) return { ...c, crewFor: null, coworkers: [] };
  return { ...c, crewFor: c.jobId, coworkers: makeCrew(c) };
}

/**
 * Keep the crew true to the post: a new post means new faces, no post
 * means no crew. Anyone befriended keeps their Circle seat regardless.
 * Service counts as a post: the unit draws once and holds till home.
 */
export function syncCrew(c: Character): Character {
  const post = c.jobId ?? c.serving ?? null;
  if (!post) {
    if (!c.crewFor && (!c.coworkers || c.coworkers.length === 0)) return c;
    return { ...c, crewFor: null, coworkers: [] };
  }
  if (c.crewFor === post && Array.isArray(c.coworkers)) return c;
  if (c.serving && !c.jobId) return joinUnit(c);
  return joinCrew(c);
}

/**
 * Draw the unit on reporting for duty: a general and the soldiers
 * beside you, held till you come home. They live in the army list,
 * never the Circle.
 */
export function joinUnit(c: Character): Character {
  if (!c.serving) return { ...c, crewFor: null, coworkers: [] };
  const rng: () => number = Math.random;
  // the draft takes men; the unit reads male throughout
  const crew: Coworker[] = [
    {
      id: `unit-general`,
      name: randomName(c.eraId, c.placeId, rng, 'male'),
      gender: 'Male',
      role: 'the general',
      bond: 40,
      isBoss: true,
    },
  ];
  for (let i = 0; i < 4; i++) {
    crew.push({
      id: `unit-${i}-${Math.floor(rng() * 1e6)}`,
      name: randomName(c.eraId, c.placeId, rng, 'male'),
      gender: 'Male',
      role: 'soldier',
      bond: 30,
      isBoss: false,
    });
  }
  return { ...c, crewFor: c.serving, coworkers: crew };
}