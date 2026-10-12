import type { Classmate, Coworker } from '../engine/classroom';

/**
 * Core domain types for Ananta.
 *
 * Everything the game loop needs is expressed here so new
 * eras / events can be added without touching engine code.
 */

/** Playable historical eras (expandable — just add a new entry). */
export type EraId =
  | 'ancient-world'
  | 'medieval'
  | 'age-of-sail'
  | 'industrial'
  | 'atomic'
  | 'modern-day';

export interface Place {
  id: string;
  /** "City, Country" where the era has countries; country alone if not */
  name: string;
  /** country for the picker, e.g. "France" — shared across eras */
  country: string;
  /** city for the picker, e.g. "Lyon"; omit for regions */
  city?: string;
  /** years added to the era's life expectancy (harsh or healthy places) */
  lifespanMod?: number;
  /** currency used here; overrides the era's (Florence in florins) */
  moneySymbol?: string;
}

export interface Era {
  id: EraId;
  name: string;
  years: string;
  /** calendar year a life in this era begins */
  startYear: number;
  places: Place[];
  /** currency symbol shown with funds, e.g. "$" or "¤" */
  moneySymbol: string;
  /** multiplies base-unit money effects into era currency */
  moneyScale: number;
  /** typical lifespan; the death curve anchors here */
  lifeExpectancy: number;
  /** multiplies age-related health decline (higher = harsher times) */
  declineRate: number;
}

/** The six base vitals, always 0–100. Money lives separately on Character. */
export type StatKey =
  | 'health'
  | 'happiness'
  | 'smarts'
  | 'looks'
  | 'energy'
  | 'reputation';

export type Stats = Record<StatKey, number>;

/** Who someone is drawn to. */
export type Orientation = 'straight' | 'gay' | 'bisexual';

/**
 * A parent or sibling generated at birth. Displayed age advances
 * with the character: current age = ageAtBirth + character.age.
 */
export interface FamilyMember {
  id: string;
  relation: 'mother' | 'father' | 'brother' | 'sister';
  firstName: string;
  lastName: string;
  /** age when the character was born */
  ageAtBirth: number;
  /** occupation, "studying", "at home" or "unemployed" */
  status: string;
  /** 0–100: how close you are. Drifts down slowly if neglected. */
  bond: number;
  /** years you have known each other (your age) */
  yearsKnown: number;
}

/**
 * Your own child, born along the way. Age moves with yours:
 * current age = character.age - bornAge. At 18 they are grown and
 * leave the house (as a friend in the Circle, if the bond holds).
 */
export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  /** 'Male' or 'Female' */
  gender: string;
  /** your age when they were born */
  bornAge: number;
  /** 0–100: how close you are */
  bond: number;
  /** years you have known each other (their age) */
  yearsKnown: number;
  /** contact id of the other parent, null when unknown */
  otherParentId: string | null;
}

/** An expected child: carrier known, birth dated by your age. */
export interface Pregnancy {
  /** contact id of the other parent */
  partnerId: string;
  /** true when you carry it yourself */
  playerCarries: boolean;
  /** your age when the baby comes */
  dueAge: number;
}

/**
 * Someone who entered the character's life through an event: a friend,
 * a partner, a pet. Displayed in the Circle list alongside relatives.
 */
export interface Contact {
  id: string;
  name: string;
  kind: 'friend' | 'partner' | 'pet';
  /** what they do, e.g. "at the shop next door" */
  status: string;
  /** drives {they}/{them}/{their} in interaction prose */
  gender: string;
  /** who they are drawn to; absent on older saves, which read straight */
  orientation?: Orientation;
  /** age when they entered your life; current age = this + your age */
  ageAtMeeting: number;
  /** a name you gave an animal yourself; null until you do */
  petName: string | null;
  /** what they do for a living; shown in the Circle list */
  trade?: string;
  /** 0–100: how close you are. Hits 0 and they leave. */
  bond: number;
  /** years you have known them */
  yearsKnown: number;
  /** times you have begged them to stay; redemption gets rarer */
  begs?: number;
  /** a lover who accepted your proposal, not yet married */
  engaged?: boolean;
  /** a lover you married */
  married?: boolean;
  /** proposals refused; a second no breaks more often */
  proposalRefusals?: number;
  /** 0–100: what they can put toward the house; rolled at meeting */
  wealth?: number;
}

/** One sickness instance. ownerId null = the character themselves. */
export interface ActiveAilment {
  ailmentId: string;
  ownerId: string | null;
  known: boolean;
}

export interface LogEntry {  age: number;
  year: number;
  text: string;
  kind: 'birth' | 'event' | 'choice' | 'quiet' | 'death' | 'system';
}

export interface Character {
  id: string;
  name: string;
  gender: string;
  /** who you are drawn to; choosable from childhood, freely */
  orientation: Orientation;
  eraId: EraId;
  placeId: string;
  birthYear: number;
  /** day + month, e.g. "14 March" — displayed with birthYear */
  birthDate: string;
  /** current age in years */
  age: number;
  alive: boolean;
  causeOfDeath: string | null;
  stats: Stats;
  /** funds in era currency; may go negative (debt) */
  money: number;
  /** household at birth: parents and siblings */
  family: FamilyMember[];
  /** people and animals met along the way */
  contacts: Contact[];
  /** your own children, in birth order */
  children: Child[];
  /** an expected child, null when none */
  pregnancy: Pregnancy | null;
  /** item ids owned, in purchase order; duplicates allowed */
  belongings: string[];
  /** 0–100: how fed you are. Falls yearly; empty means hunger. */
  satiety: number;
  /** 0–100: the house you were born into. Never shown, only hinted. */
  familyWealth: number;
  /** born into hunger: no food from home, and sometimes sickness with it */
  destitute: boolean;
  /** war id while serving, null at home */
  serving: string | null;
  /** prison years left, null when free */
  sentence: number | null;
  /** times caught and punished; a record follows */
  offences: number;
  /** belongings set aside on enlisting, restored on coming home */
  stashedBelongings: string[];
  /** lasting sicknesses; hidden ones are found only by checkup */
  ailments: ActiveAilment[];
  /** simple string flags set by choices, e.g. "apprentice", "in-debt" */
  flags: string[];
  /** id of the school tier attended, null when not studying */
  schoolId: string | null;
  /** id of the degree read, null when not at higher study */
  uniId: string | null;
  /** years read toward the degree */
  uniYears: number;
  /** the degree the stored `uniMates` belong to */
  uniFor: string | null;
  /** tutor and course mates at higher study */
  uniMates: Classmate[];
  /** degree ids graduated */
  degrees: string[];
  /** relatives ever asked for tuition; repeats are a long shot */
  askedTuition: string[];
  /** relatives ever asked to pay for the licence; repeats are a long shot */
  askedLicence: string[];
  /** relative-and-item pairs ever asked for (`memberId:itemId`); repeats are a long shot */
  askedShop: string[];
  /** id of the job tier held, null when not working */
  jobId: string | null;
  /** times the current job has raised your wage */
  jobRaises: number;
  /** years held in the current post; raises only come with tenure */
  jobYears: number;
  /** 0–100: how well you are doing in whatever you are doing */
  performance: number;
  /** worked past your hours this year; a raise roll awaits */
  workedHard: boolean;
  /** study sessions spent this year, refilled on each ageUp */
  studiesThisYear: number;
  /** extra shifts worked this year, refilled on each ageUp */
  shiftsThisYear: number;
  /** gig attempts sent this year, refilled on each ageUp */
  gigsThisYear: number;
  /** job hunts requested this year, refilled on each ageUp */
  jobHuntsThisYear: number;
  /** standing at graduation; employers weigh it when you ask for work */
  schoolRecord: number | null;
  /** posts held over a lifetime; employers count it as experience */
  jobsHeld: number;
  /** gigs completed over a lifetime; employers count it too */
  gigsDone: number;
  /** activities used this year, for the fatigue curve */
  activitiesUsed: string[];
  /**
   * How fresh each activity is, 0–1. Doing one drops it hard, and it
   * only comes back after a few years off. Keyed by ActivityKey.
   */
  activityHeat: Record<string, number>;
  /** how many years ago each activity was last used, for the cooldown */
  activityAged: Record<string, number>;
  /**
   * Unspent fraction of the year's decay, carried into next year.
   * Vitals are whole numbers, so without this a slow 0.3 a year would
   * round away forever and nothing would ever actually wear out.
   */
  decayRemainder: Stats;
  /**
   * Ids of the last few walk encounters, so the same one does not
   * fire twice running. Kept short; oldest drops off the end.
   */
  recentWalkEvents: string[];
  /**
   * Skill progress for trainable activities (0–100). Keyed by ActivityKey,
   * only present once started. Fills exponentially based on aptitude.
   */
  skillProgress: Record<string, number>;
  /**
   * Hidden aptitude per trainable activity (0.3–2.0), rolled at birth.
   * Determines how fast skillProgress fills. Revealed on first use.
   */
  skillAptitude: Record<string, number>;
  /** relatives asked for money this year */
  askedThisYear: string[];
  /** people already flirted with this year */
  flirtedThisYear: string[];
  /** people already asked out this year */
  askedOutThisYear: string[];
  /** lovers already taken out this year */
  datedThisYear: string[];
  /** lovers already lain with this year */
  intimateThisYear: string[];
  /** the school the stored `classmates` belong to */
  classFor: string | null;
  /** classmates and teacher of the school you attend */
  classmates: Classmate[];
  /** the post the stored `coworkers` belong to */
  crewFor: string | null;
  /** coworkers and boss at the post you hold */
  coworkers: Coworker[];
  /** asked the boss for a raise or promotion this year */
  bossAskedThisYear: string[];
  /** begging attempts spent this year, refilled on each ageUp */
  begsThisYear: number;
  /** event ids already seen that are once-per-life */
  seenEventIds: string[];
  log: LogEntry[];
}

/** Stat gate, e.g. { health: { min: 30 } } */
export type StatGate = Partial<
  Record<StatKey, { min?: number; max?: number }>
>;

export interface ChoiceEffect {
  /** vital deltas applied on pick, e.g. { health: -8, happiness: +10 } */
  stats?: Partial<Record<StatKey, number>>;
  /** funds delta in base units; multiplied by the era's moneyScale */
  money?: number;
  /** lasting ailments inflicted on self (ids in the ailment catalog) */
  addAilments?: string[];
  /** lasting ailments inflicted on the involved family member */
  memberAilments?: string[];
  /** flags to add / remove */
  addFlags?: string[];
  removeFlags?: string[];
  /** someone enters your life: friend, partner or pet */
  meet?: { kind: Contact['kind']; status: string };
  /** chance (0–1) that the `meet` actually happens; defaults to certain */
  chance?: number;
  /** open the library reader for this book after the popup closes */
  openBook?: string;
  /** standing delta (school or work bar), e.g. slacking costs some */
  performance?: number;
  /** journal line written after picking (supports {name}) */
  result?: string;
  /**
   * one-line story sentence for the journal (supports {name},
   * {member}, {place}). Outcome prose stays in the popup only.
   */
  journal?: string;
}

export interface LifeChoice {
  id: string;
  text: string;
  /** small flavour line under the button */
  hint?: string;
  /** open this shop item after the popup closes, for a child's ask */
  openShop?: string;
  effects: ChoiceEffect;
}

export interface LifeEventConditions {
  /** if omitted → eligible in every era */
  eras?: EraId[];
  /** restrict to places (place ids) */
  places?: string[];
  /** restrict to specific genders (e.g. 'Male', 'Female') */
  genders?: string[];
  minAge?: number;
  maxAge?: number;
  /** eligible only in this calendar year (birthYear + age) */
  year?: number;
  /** eligible only in these countries (birthplace country) */
  countries?: string[];
  /** eligible only holding a post with a boss on the roster */
  requiresBoss?: boolean;
  requiredFlags?: string[];
  excludedFlags?: string[];
  minStats?: StatGate;
  maxStats?: StatGate;
  /** default true — seen at most once per life */
  oncePerLife?: boolean;
  /** times it may fire in one life, if more than oncePerLife allows */
  maxPerLife?: number;
}

export interface LifeEvent {
  id: string;
  title: string;
  /** supports {name}, {place}, {year} templating */
  description: string;
  category: 'childhood' | 'youth' | 'adult' | 'fate' | 'opportunity' | 'peril' | 'family' | 'illness' | 'school' | 'work' | 'social' | 'random';
  conditions: LifeEventConditions;
  /** relative likelihood when several events are eligible */
  weight: number;
  /** empty choices = notice popup: effects apply on appearance, no decision */
  choices: LifeChoice[];
  /** onset effects applied when the event fires (notices) */
  effects?: ChoiceEffect;
  /** involve a random household member ({member} templating) */
  involves?: 'family-member';
}

/** The event currently on screen awaiting a decision (or null in quiet years). */
export interface ActiveEvent {
  event: LifeEvent;
  /** resolved description with {name} etc. filled in */
  text: string;
  /** result line shown after the player picks, before ageing again */
  lastResult: string | null;
  lastChoiceId: string | null;
  /** involved household member, if any */
  memberId: string | null;
}
