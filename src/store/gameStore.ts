import { create } from 'zustand';
import type {
  ActiveAilment,
  ActiveEvent,
  Character,
  Child,
  ChoiceEffect,
  Contact,
  Era,
  EraId,
  FamilyMember,
  LifeEvent,
  LogEntry,
  Orientation,
  Stats,
} from '../types';
import { ERAS, getEra, moneySymbolOf } from '../data/eras';
import { EVENTS } from '../data/events';
import { PUBLICATION_EVENTS } from '../data/events/publications';
import { HISTORY_EVENTS } from '../data/history';
import {
  eligibleEvents,
  isEligible,
  pickEvent,
  renderText,
} from '../engine/eventEngine';
import { clampStats, deathRoll, formatFunds, quietLine, yearlyDrift } from '../engine/life';
import {
  afterInterview,
  careerStep,
  huntCap,
  huntChance,
  huntRejectionReason,
  interviewEvent,
  isAbsurdAnswer,
  JOB_OFFER_EVENT,
  INTERVIEW_EVENT,
  jobTitle,
  jobWage,
  monthlyWage,
  NEW_POST_STANDING,
  schoolName,
  shiftCap,
  studyCap,
} from '../engine/career';
import { jobById, jobForSmarts, nextJob, prevJob, workStartAge, degreeById, degreesFor, degreeCost, UNI_NAMES } from '../data/career';
import {
  ACTIVITIES,
  BEG_CAP,
  BEG_CHANCE,
  TRAINABLE,
  resolveActivity,
  type ActivityKey,
} from '../data/activities';
import {
  canAfford as activityCanAfford,
  effectiveness,
  isOpen,
  needsParentPayer,
  sessionGain,
  stepMultiplier,
  rollAptitudes,
  skillProgressGain,
  effectiveCost,
  canAffordEffective,
  wearHabit,
} from '../engine/activities';
import { WALK_DURATIONS, WALK_PLACES } from '../data/walks';
import { pickWalkEvent, walkEventAs, walkPlacesFor } from '../engine/walks';
import { BOOKS } from '../data/books';
import { eligibleBooks } from '../engine/books';
import { SALON_SERVICES } from '../data/salon';
import { salonCost, salonGain, salonsFor } from '../engine/salon';
import { itemById, itemsFor, shopById, shopCost, isOwnedOut, giftRefusalChance, stapleFor, ownedEdibles, giftReaction, GIFT_BOND, GIFT_HAPPINESS, ringBonus, type GiftReaction } from '../engine/shopping';
import { needsLicence, hasLicence, licenceAgeFor, licenceCost, canDrive, isVehicle, ownsVehicle, giftVehicleFor, LICENCE_FLAG } from '../engine/driving';
import { WEDDING_VENUES, venuesFor, venueCost } from '../data/weddings';
import { tenantEventsFor } from '../data/tenants';
import { houseById, houseCost, housesFor } from '../data/houses';
import {
  askedEvent,
  applyTenantNotice,
  bumpTenant,
  canInviteHome,
  evictTenant,
  fairRent,
  giftHouseFor,
  GIFT_CHANCE,
  GIFT_WEALTH,
  homeFlowStep,
  inboundAskChance,
  inviteChance,
  isResident,
  makeTenantGroup,
  objectToNewcomer,
  petKeepEvent,
  propTenants,
  rentalByUid,
  sellChance,
  setTenantRent,
  sibsBringEvent,
  spouseAskEvent,
  sweepResidents,
  taxAmount,
  taxDueEvent,
  tenantAcceptChance,
  tenantAskEvent,
  tenantChoiceEvent,
  tenantLeaves,
  viewingEvent,
} from '../engine/houses';
import { WARS, type WarDef } from '../data/wars';
import { draftFor, draftEvent, warFlowStep, warYear, warYearEvent } from '../engine/wars';
import {
  caughtEvent,
  crimeFlowStep,
  crimeOdds,
  CRIMES,
  debtCollectEvent,
  prisonYear,
} from '../engine/crime';
import { birthWealthHint, infantFedLevel, rollWealth, stapleSkipChance, stapleTarget, pocketChanceFactor, wealthTier } from '../engine/wealth';
import { GIGS, GIG_MULTIPLES } from '../data/gigs';
import {
  gigCap,
  gigChance,
  gigPayout,
  gigsFor,
  GIG_AGE,
} from '../engine/gigs';
import { yearlyDecay, yearlyRecovery, applyYearlyChange, reputationDrift } from '../engine/decay';
import { mortalityStep, inheritanceBaseUnits, isOrphaned, dropStrayAilments } from '../engine/mortality';
import { crisisFor, crisisEvent, pastCrises } from '../engine/crises';
import { AILMENTS } from '../data/ailments';
import { familySummary, generateFamily, kinshipRef, memberAge, randomBirthDate, zodiacSign } from '../engine/family';
import {
  applyBond,
  begsEvent,
  bondLossPenalty,
  canChooseGender,
  canChooseOrientation,
  canAskOut,
  canFlirtWith,
  confrontEvent,
  contactAge,
  contactRef,
  contactTrade,
  driftBonds,
  driftFamily,
  fillVariant,
  kinGender,
  leaveEvent,
  loverFlowStep,
  makeContact,
  pronoun,
  rollOrientation,
  rollPartnerWealth,
  SCHOOL_FRIEND_STATUS,
} from '../engine/contacts';
import {
  askableRelatives,
  canActSocially,
  canAskForMoney,
  canSeeDoctor,
  canSeeFamily,
  isInfant,
  parentalCare,
  pocketMoneyAmount,
  pocketMoneyChance,
  askChance,
} from '../engine/infancy';
import { classOf, crewOf, syncCrew, joinUni, uniOf } from '../engine/classroom';
import type { Classmate, Coworker } from '../engine/classroom';
import {
  birthChild,
  canMakeLove,
  carrierOf,
  childAge,
  childAskEvent,
  childFlowStep,
  childRef,
  driftChildren,
  pregnancyDecisionEvent,
  pregnancyFlowStep,
  upkeepBase,
  CONCEPTION_CHANCE,
} from '../engine/children';
import {
  canAfford,
  giftBond,
  partingLine,
  pickVariant,
  releaseLine,
  resolveAction,
  tableFor,
  type Interaction,
  type InteractionDef,
} from '../engine/bonds';

export type Phase = 'start' | 'playing' | 'dead';

/** Bottom-bar sections. Each opens a popup; content grows over time. */
export type SectionKind = 'social' | 'actions' | 'assets' | 'work';

/** Age at which the Career button unlocks (studies begin). */
export { SCHOOL_START_AGE as STUDY_START_AGE } from '../data/career';

const clampPerformance = (v: number) =>
  Math.max(0, Math.min(100, Math.round(v)));

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Pick the interaction from the table that fits this kind of being. */
function actionDef(
  kind: 'family' | Contact['kind'],
  action: Interaction,
): InteractionDef | null {
  const table = tableFor(kind);
  const allowed =
    kind === 'pet'
      ? (['pet', 'treat', 'time', 'release'] as Interaction[])
      : (['time', 'money', 'compliment', 'insult'] as Interaction[]);
  if (!allowed.includes(action)) return null;
  return table[action] ?? null;
}

/** Save migration: contacts gained petName with the naming feature. */

export interface NewLifeOptions {
  name: string;
  gender: string;
  eraId: EraId;
  birthYear: number;
  placeId: string;
  stats: Stats;
  money: number;
}

interface GameState {
  phase: Phase;
  character: Character | null;
  activeEvent: ActiveEvent | null;
  /** career events waiting behind the current popup */
  pending: ActiveEvent[];
  /** job tier currently being applied for / interviewed for */
  pendingJobId: string | null;
  mustChoose: boolean;
  newLife: (opts: NewLifeOptions) => void;
  ageUp: () => void;
  choose: (choiceId: string) => void;
  startOver: () => void;
  /** open section popup (ignored while an event popup is open) */
  section: SectionKind | null;
  openSection: (kind: SectionKind) => void;
  closeSection: () => void;
  /** dismiss a resolved event popup so time can move on */
  dismissEvent: () => void;
  /** a book to open the reader for once the event popup closes */
  pendingBook: string | null;
  clearPendingBook: () => void;
  /** a child's ask to fulfil at the shops once the popup closes */
  pendingChildShop: { childId: string; itemId: string } | null;
  clearPendingChildShop: () => void;
  /** pay a doctor to cure an ailment of yours or a child's (ignored if unaffordable) */
  cureAilment: (id: string, ownerId?: string | null) => void;
  /** spend time / money / words on someone in the Circle */
  interact: (contactId: string, action: Interaction) => void;
  /** the same, for a relative */
  interactFamily: (memberId: string, action: Interaction) => void;
  /** hand over a chosen amount of coin */
  giftMoney: (contactId: string, amount: number) => void;
  giftMoneyFamily: (memberId: string, amount: number) => void;
  /** ask a grown-up at home for pocket money */
  askForMoney: (memberId: string) => void;
  /** say who you are drawn to */
  setOrientation: (orientation: Orientation) => void;
  /** say what you are (only once industry arrives) */
  setGender: (gender: string) => void;
  /** flirt with a friend or partner, for better or worse */
  flirt: (contactId: string) => void;
  /** ask a friend to be yours; a yes makes them your lover */
  askOut: (contactId: string) => void;
  /** end it with a lover yourself */
  breakUp: (contactId: string) => void;
  /** propose with an owned ring, somewhere you can reach */
  propose: (contactId: string, itemId: string, placeId: string) => void;
  /** marry the promised, at the venue of your means */
  marry: (contactId: string, venueId: string) => void;
  /** take a lover out: pick the evening, pay for it, come home closer */
  takeDate: (contactId: string, durationId: string, placeId: string) => void;
  /** lie with a lover; sometimes a baby comes of it */
  makeLove: (contactId: string) => void;
  /** spend an afternoon with one of your children */
  interactChild: (childId: string) => void;
  /** give a child the name they will carry */
  nameChild: (childId: string, firstName: string, lastName: string) => void;
  /** commit a crime from an event; the store rolls success/caught */
  commitCrime: (crimeId: string) => void;
  /** the classmates and teacher of the school you attend */
  classmates: () => Classmate[];
  /** spend time on someone in your class */
  interactClassmate: (id: string, action: Interaction) => void;
  /** put it to them that you want to be friends */
  befriendClassmate: (id: string) => void;
  /** the tutor and course mates at higher study */
  uniMates: () => Classmate[];
  /** spend time on someone in your course */
  interactUniMate: (id: string, action: Interaction) => void;
  /** put it to them that you want to be friends */
  befriendUniMate: (id: string) => void;
  /** enrol at higher study, paying tuition yourself */
  enrolUni: (degreeId: string) => void;
  /** ask a grown-up at home to pay your tuition */
  askForTuition: (memberId: string, degreeId: string) => void;
  /** put in extra study hours at higher study (requires enrolment) */
  studyUni: () => void;
  /** leave higher study behind */
  quitUni: () => void;
  /** the coworkers and boss at the post you hold */
  coworkers: () => Coworker[];
  /** spend time on someone you work beside */
  interactCrew: (id: string, action: Interaction) => void;
  /** put it to a coworker that you want to be friends */
  befriendCrew: (id: string) => void;
  /** ask the boss for more monthly money */
  askRaise: () => void;
  /** ask the boss for the next post up, at your peril */
  askPromotion: () => void;
  /** give an animal a name of your own choosing */
  namePet: (contactId: string, name: string) => void;
  /** paid checkup: reveals hidden self sicknesses, notice carries the result */
  checkup: () => void;
  /** perform a single self-improvement activity that affects one stat */
  takeActivity: (activity: ActivityKey) => void;
  /** closing the gazette counts as reading it */
  finishNews: () => void;
  /** go out for a walk of a given length, somewhere you can reach */
  takeWalk: (durationId: string, placeId: string) => void;
  /** book a chair: pick the treatment, pay for it, feel the difference */
  takeSalon: (serviceId: string) => void;
  /** pass the test and hold a licence, where one is needed */
  getLicence: () => void;
  /** ask a grown-up at home to pay for the licence */
  askForLicence: (memberId: string) => void;
  /** take an owned vehicle out: how long, where, and with whom */
  takeDrive: (index: number, durationId: string, placeId: string, companion: string) => void;
  /** buy something from a shop; it lands in the belongings */
  takeShop: (itemId: string) => void;
  /** buy a house on the market; the first is home, the rest to let */
  buyHome: (houseId: string) => void;
  /** ask a friend or a relative to live with you; they may not */
  inviteHome: (scope: 'family' | 'contact', id: string) => void;
  /** take one of your animals in; attached kin may ask to keep it */
  takeInPet: (contactId: string) => void;
  /** ask your parents, siblings — or the whole family — to live with you */
  inviteFamily: (group: 'parents' | 'siblings' | 'all') => void;
  /** move into the house you own, or a property of yours */
  moveIn: (prop: string) => void;
  /** move out of your house, back to family or lodgings */
  moveOut: () => void;
  /** sell a house or a property at your price; buyers may walk away */
  sellHome: (prop: string, price: number) => void;
  /** pay what the collector is owed on a property, even into debt */
  payTax: (prop: string) => void;
  /** size strangers up for a property's rooms at your price */
  findTenant: (price: number, prop: string) => void;
  /** leave a property's rooms open for tenants at your price */
  openRent: (price: number, prop: string) => void;
  /** take a property's rooms off the market */
  closeRent: (prop: string) => void;
  /** set a property's rent; tenants take it or leave over it */
  setRentPrice: (prop: string, price: number) => void;
  /** turn a tenant out, companions and all */
  kickOut: (prop: string, contactId: string) => void;
  /** ask a grown-up at home to buy it for you; they may not */
  askForShop: (itemId: string, memberId: string) => void;
  /** throw a belonging away */
  discardItem: (index: number) => void;
  /** give a belonging to a relative or a friend */
  giftItem: (index: number, scope: 'family' | 'contact', id: string) => void;
  /** eat an owned food */
  eatItem: (index: number) => void;
  /** beg for food or money; low odds, many tries */
  takeBeg: (kind: 'food' | 'money') => void;
  /** finish the book you have been reading, page by page */
  finishBook: (bookId: string) => void;
  /** ask for paid gig work at a named price; it may come through */
  takeGig: (gigId: string, multiple: number) => void;
  /** ask an employer for an interview; they may not call back */
  requestInterview: (jobId: string) => void;
  /** put in extra study hours (requires being at school) */
  study: () => void;
  /** work past hours for a year (requires a job) */
  workHarder: () => void;
  /** leave your job behind */
  quitJob: () => void;
  /** transient titled feedback (checkups, cures) */
  notice: { title: string; eyebrow?: string; text: string } | null;
  dismissNotice: () => void;
}

const SAVE_KEY = 'ananta-save-v4';

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function placeNameOf(c: Character): string {
  const era = getEra(c.eraId);
  return era.places.find((p) => p.id === c.placeId)?.name ?? 'home';
}

/** The boss's name, for events that name them. Null when bossless. */
function bossNameOf(c: Character): string | null {
  return crewOf(c).find((m) => m.isBoss)?.name ?? null;
}

/**
 * Death from damage outside the yearly check: same rules (health at
 * zero names the sickness, if any), so event damage gets no free pass
 * into a year of healing first.
 */
function killNow(c: Character, cause: string): Character {
  const deathEntry: LogEntry = {
    age: c.age,
    year: c.birthYear + c.age,
    text: `You died at ${c.age} — ${cause}.`,
    kind: 'death',
  };
  return { ...c, alive: false, causeOfDeath: cause, log: [...c.log, deathEntry] };
}

/**
 * How a received gift reads: journal tail and notice line. Who takes
 * it is named with their own pronoun, and how it landed is stated.
 */
function giftResult(
  reaction: GiftReaction,
  he: string,
  name: string,
): { journal: string; notice: string } {
  switch (reaction) {
    case 'loved':
      return { journal: ` ${he} was delighted.`, notice: `${he} takes the ${name}, delighted.` };
    case 'odd':
      return { journal: ` ${he} found it odd.`, notice: `${he} takes the ${name}, though puzzled.` };
    case 'disliked':
      return { journal: ` It missed, and you both know it.`, notice: `${he} takes the ${name}, but it clearly missed.` };
    case 'neutral':
      return { journal: '', notice: `${he} takes the ${name}.` };
  }
}

/** "a", "a and b", "a, b and c". */
function joinList(items: string[]): string {
  if (items.length <= 2) return items.join(' and ');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** Random starting vitals for the creation screen (user-adjustable). */
export function rollStartingStats(): Stats {
  return {
    health: rand(55, 80),
    happiness: rand(50, 70),
    smarts: rand(35, 65),
    looks: rand(35, 70),
    energy: rand(60, 80),
    reputation: rand(40, 60),
  };
}

/** Starting funds in era currency. Almost always nothing. */
export function rollStartingMoney(moneyScale: number): number {
  if (Math.random() >= 0.03) return 0;
  return rand(10, 25) * moneyScale;
}

/** Add an ailment instance unless already present. */
function addAilment(
  c: Character,
  ailment: ActiveAilment,
): Character {
  if (
    c.ailments.some(
      (a) =>
        a.ailmentId === ailment.ailmentId &&
        (a.ownerId ?? null) === (ailment.ownerId ?? null),
    )
  ) {
    return c;
  }
  return { ...c, ailments: [...c.ailments, ailment] };
}

/**
 * Apply an effect block: vitals, era-scaled funds, flags, ailments.
 * memberId receives memberAilments when the event involves family.
 * Onset ailments are known; silent ones are added hidden elsewhere.
 */
function applyFx(
  c: Character,
  fx: ChoiceEffect,
  moneyScale: number,
  memberId: string | null,
): Character {
  const deltas = fx.stats ?? {};
  const stats = clampStats({
    ...c.stats,
    health: c.stats.health + (deltas.health ?? 0),
    happiness: c.stats.happiness + (deltas.happiness ?? 0),
    smarts: c.stats.smarts + (deltas.smarts ?? 0),
    looks: c.stats.looks + (deltas.looks ?? 0),
    energy: (c.stats.energy ?? 70) + (deltas.energy ?? 0),
    reputation: (c.stats.reputation ?? 50) + (deltas.reputation ?? 0),
  });
  const flags = new Set(c.flags);
  for (const f of fx.addFlags ?? []) flags.add(f);
  for (const f of fx.removeFlags ?? []) flags.delete(f);
  const funds = c.money + Math.round((fx.money ?? 0) * moneyScale);
  let next: Character = {
    ...c,
    stats,
    // minors spend only what they have: events never put them in debt
    money: c.age < 18 ? Math.max(0, funds) : funds,
    flags: [...flags],
    performance: clampPerformance(c.performance + (fx.performance ?? 0)),
  };
  if (fx.meet) {
    // most `meet`s are certain; the rare ones say otherwise
    const meets = (fx.chance ?? 1) >= 1 || Math.random() < (fx.chance ?? 1);
    if (meets) {
      const made = makeContact(c, fx.meet.kind, fx.meet.status);
      // there is only room for one lover: a new one ends the old —
      // unless vows were said, which no arrival ends
      const dumped =
        fx.meet.kind === 'partner'
          ? next.contacts.filter((m) => m.kind === 'partner' && !m.married)
          : [];
      const partings = dumped.map(
        (m) =>
          ({
            age: c.age,
            year: c.birthYear + c.age,
            text: partingLine(m.name, m.kind),
            kind: 'event',
          }) as LogEntry,
      );
      const met: LogEntry = {
        age: c.age,
        year: c.birthYear + c.age,
        text:
          made.kind === 'pet'
            ? `You took in ${made.name}.`
            : `You met ${contactRef(made)}.`,
        kind: 'event',
      };
      next = {
        ...next,
        contacts: [
          ...next.contacts.filter(
            (m) => m.kind !== 'partner' || fx.meet!.kind !== 'partner' || m.married,
          ),
          made,
        ],
        log: [...next.log, ...partings, met],
      };
    }
  }
  for (const a of fx.addAilments ?? []) {
    next = addAilment(next, { ailmentId: a, ownerId: null, known: true });
  }
  if (memberId) {
    for (const a of fx.memberAilments ?? []) {
      next = addAilment(next, { ailmentId: a, ownerId: memberId, known: true });
    }
  }
  // a dumped lover takes nothing with them, not even their sickness
  return dropStrayAilments(next);
}

/**
 * Turn an event into the popup the player sees: apply onset effects,
 * journal the notice headline when there's no decision, and resolve
 * {place}/{member} templating.
 */
function stageEvent(
  c: Character,
  event: LifeEvent,
  moneyScale: number,
): { character: Character; activeEvent: ActiveEvent } {
  const member = event.involves === 'family-member' ? pickMember(c) : null;
  const memberName = member ? kinshipRef(member, c.family) : null;
  const text = renderText(event.description, c, placeNameOf(c), memberName, bossNameOf(c));
  // recorded every time it fires, so maxPerLife can count the repeats
  const seen = [...c.seenEventIds, event.id];
  let next: Character = { ...c, seenEventIds: seen };
  if (event.effects) {
    next = applyFx(next, event.effects, moneyScale, member?.id ?? null);
  }
  if (event.choices.length === 0) {
    // notices carry no decision: journal gets the story sentence
    const headline = event.effects?.journal
      ? renderText(event.effects.journal, next, placeNameOf(next), memberName, bossNameOf(next))
      : memberName
        ? `${event.title} — ${memberName}.`
        : `${event.title}.`;
    const entry: LogEntry = {
      age: next.age,
      year: next.birthYear + next.age,
      text: headline,
      kind: 'event',
    };
    next = { ...next, log: [...next.log, entry] };
  }
  return {
    character: next,
    activeEvent: {
      event,
      text,
      lastResult: null,
      lastChoiceId: null,
      memberId: member?.id ?? null,
    },
  };
}

/**
 * A popup with nothing to decide: title, text, Continue. Built by hand
 * for queued fallout (all state already applied, journals already
 * written), so it carries no effects of its own.
 */
function infoEvent(id: string, title: string, text: string): ActiveEvent {
  return {
    event: {
      id,
      title,
      description: text,
      category: 'social',
      conditions: {},
      weight: 0,
      choices: [],
    },
    text,
    lastResult: null,
    lastChoiceId: null,
    memberId: null,
  };
}

/** Someone entered the Circle: name them once, where they came from. */
function metEvent(m: Contact): ActiveEvent {
  const title =
    m.kind === 'pet' ? 'New pet' : m.kind === 'partner' ? 'New lover' : 'New friend';
  return infoEvent(`met-${m.id}`, title, `${m.name} — ${m.status}.`);
}

/**
 * Chain the job application: applying queues the interview popup,
 * answering it queues either the hiring or the rejection. Returns
 * null for every other event.
 */
function jobFlowStep(
  eventId: string,
  choiceId: string,
  c: Character,
  pendingJobId: string | null,
): { character: Character; events: LifeEvent[]; jobId: string | null } | null {
  if (eventId === JOB_OFFER_EVENT) {
    if (choiceId !== 'apply') return null;
    const job = jobForSmarts(c.eraId, c.age, c.stats.smarts);
    if (!job) return null;
    return {
      character: c,
      events: [interviewEvent(c, job)],
      jobId: job.id,
    };
  }
  if (eventId === INTERVIEW_EVENT) {
    if (!pendingJobId) return null;
    const job = jobById(c.eraId, pendingJobId);
    if (!job) return null;
    const step = afterInterview(c, job, !isAbsurdAnswer(choiceId));
    return { character: step.character, events: step.events, jobId: null };
  }
  return null;
}

function pickMember(
  c: Character,
  rng: () => number = Math.random,
): FamilyMember | null {
  if (c.family.length === 0) return null;
  return c.family[Math.floor(rng() * c.family.length)];
}

/**
 * One untreated household sickness may spread to the character.
 * Skipped when the character already carries it.
 */
function spreadFromHousehold(
  c: Character,
  rng: () => number = Math.random,
): { ailmentId: string; memberId: string } | null {
  const selfIds = new Set(
    c.ailments.filter((a) => a.ownerId === null).map((a) => a.ailmentId),
  );
  for (const a of c.ailments) {
    if (a.ownerId === null || !a.known) continue;
    if (selfIds.has(a.ailmentId)) continue;
    if (rng() < 0.01) return { ailmentId: a.ailmentId, memberId: a.ownerId };
  }
  return null;
}

/**
 * Silent contraction: a hidden sickness, found only by checkup.
 * Risk rises with age and harsher eras.
 */
function silentAilment(
  c: Character,
  era: Era,
  rng: () => number = Math.random,
): string | null {
  const has = (id: string) =>
    c.ailments.some((a) => a.ownerId === null && a.ailmentId === id);
  const p =
    0.002 + (c.age >= 50 ? 0.005 : 0) + Math.max(0, era.declineRate - 1) * 0.01;
  if (rng() >= p) return null;
  const pool = [
    'flu',
    'stomach',
    'cough',
    ...(c.age >= 45 ? ['joints'] : []),
    ...(c.age >= 60 ? ['frailty'] : []),
  ].filter((id) => !has(id));
  if (pool.length === 0) return null;
  return pool[Math.floor(rng() * pool.length)];
}

function persist(character: Character | null, phase: Phase) {
  try {
    if (!character || phase === 'start') {
      localStorage.removeItem(SAVE_KEY);
    } else {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ character, phase }),
      );
    }
  } catch {
    /* storage unavailable — game still works in memory */
  }
}

function loadSaved(): { character: Character; phase: Phase } | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.character) return null;
    // basic sanity: must be a known era
    if (!ERAS.some((e) => e.id === parsed.character.eraId)) return null;
    const character = parsed.character as Character;
    if (!character.stats || typeof character.stats !== 'object') {
      character.stats = rollStartingStats();
    } else {
      if (typeof character.stats.energy !== 'number') character.stats.energy = 70;
      if (typeof character.stats.reputation !== 'number') character.stats.reputation = 50;
    }
    if (!Array.isArray(character.ailments)) {
      character.ailments = [];
    } else if (
      character.ailments.length > 0 &&
      typeof character.ailments[0] === 'string'
    ) {
      character.ailments = (character.ailments as unknown as string[]).map(
        (ailmentId) => ({ ailmentId, ownerId: null, known: true }),
      );
    }
    if (!Array.isArray(character.family)) {
      character.family = [];
    } else {
      // family gained bond and yearsKnown after the first release
      character.family = character.family.map((m) => ({
        ...m,
        bond: typeof m.bond === 'number' ? m.bond : 70,
        yearsKnown: typeof m.yearsKnown === 'number' ? m.yearsKnown : 0,
      }));
    }
    if (!Array.isArray(character.contacts)) {
      character.contacts = [];
    } else {
      // contacts gained age, bond and yearsKnown after the first release
      character.contacts = (character.contacts as unknown as Record<string, unknown>[]).map(
        (m) => ({
          ...m,
          ageAtMeeting: typeof m.ageAtMeeting === 'number' ? m.ageAtMeeting : 22,
          bond: typeof m.bond === 'number' ? m.bond : 50,
          yearsKnown: typeof m.yearsKnown === 'number' ? m.yearsKnown : 0,
          wealth: typeof m.wealth === 'number' ? m.wealth : 15 + Math.floor(Math.random() * 70),
          petName:
            typeof m.petName === 'string' && m.petName ? m.petName : null,
          gender:
            typeof m.gender === 'string'
              ? m.gender
              : m.kind === 'pet'
                ? 'animal'
                : 'they',
        }),
      ) as Character['contacts'];
      // the unit used to muster in the Circle: serving lives keep it
      // in the army list, discharged ones let it go
      const unit = character.contacts.filter(
        (m) => m.status === 'in your unit' || m.status === 'your general',
      );
      if (unit.length > 0) {
        character.contacts = character.contacts.filter(
          (m) => m.status !== 'in your unit' && m.status !== 'your general',
        );
        if (character.serving) {
          character.crewFor = character.serving;
          character.coworkers = unit.map((m) => ({
            id: m.id,
            name: m.name,
            gender: m.gender,
            role: m.status === 'your general' ? 'the general' : 'soldier',
            bond: m.bond,
            isBoss: m.status === 'your general',
          }));
        }
      }
    }
    // career fields arrived after the first release
    if (typeof character.schoolId === 'undefined') character.schoolId = null;
    if (typeof (character as Character).uniId === 'undefined') (character as Character).uniId = null;
    if (typeof (character as Character).uniYears !== 'number') (character as Character).uniYears = 0;
    if (typeof (character as Character).uniFor === 'undefined') (character as Character).uniFor = null;
    if (!Array.isArray((character as Character).uniMates)) (character as Character).uniMates = [];
    if (!Array.isArray((character as Character).degrees)) (character as Character).degrees = [];
    if (!Array.isArray((character as Character).askedTuition)) (character as Character).askedTuition = [];
    if (!Array.isArray((character as Character).askedLicence)) (character as Character).askedLicence = [];
    if (!Array.isArray((character as Character).askedShop)) (character as Character).askedShop = [];
    if (typeof character.jobId === 'undefined') character.jobId = null;
    if (typeof character.jobRaises === 'undefined') character.jobRaises = 0;
    if (typeof character.jobYears === 'undefined') character.jobYears = 0;
    if (typeof character.performance === 'undefined') character.performance = 50;
    if (typeof character.workedHard === 'undefined') character.workedHard = false;
    if (typeof character.studiesThisYear === 'undefined') {
      character.studiesThisYear = 0;
    }
    if (typeof character.shiftsThisYear === 'undefined') {
      character.shiftsThisYear = 0;
    }
    if (typeof character.gigsThisYear === 'undefined') {
      character.gigsThisYear = 0;
    }
    if (typeof character.jobHuntsThisYear === 'undefined') {
      character.jobHuntsThisYear = 0;
    }
    if (typeof character.schoolRecord === 'undefined') {
      character.schoolRecord = null;
    }
    if (typeof character.jobsHeld === 'undefined') {
      character.jobsHeld = 0;
    }
    if (typeof character.gigsDone === 'undefined') {
      character.gigsDone = 0;
    }
    if (!Array.isArray(character.activitiesUsed)) {
      character.activitiesUsed = [];
    }
    if (
      typeof character.activityHeat !== 'object' ||
      character.activityHeat === null
    ) {
      character.activityHeat = {};
    }
    if (
      typeof character.activityAged !== 'object' ||
      character.activityAged === null
    ) {
      character.activityAged = {};
    }
    if (
      typeof character.decayRemainder !== 'object' ||
      character.decayRemainder === null
    ) {
      character.decayRemainder = { health: 0, happiness: 0, smarts: 0, looks: 0, energy: 0, reputation: 0 };
    } else {
      if (typeof character.decayRemainder.energy !== 'number') character.decayRemainder.energy = 0;
      if (typeof character.decayRemainder.reputation !== 'number') character.decayRemainder.reputation = 0;
    }
    if (
      typeof character.skillProgress !== 'object' ||
      character.skillProgress === null
    ) {
      character.skillProgress = {};
    }
    if (
      typeof character.skillAptitude !== 'object' ||
      character.skillAptitude === null
    ) {
      character.skillAptitude = rollAptitudes();
    }
    if (!Array.isArray(character.recentWalkEvents)) {
      character.recentWalkEvents = [];
    }
    if (!Array.isArray(character.askedThisYear)) {
      character.askedThisYear = [];
    }
    if (!Array.isArray(character.flirtedThisYear)) {
      character.flirtedThisYear = [];
    }
    if (!Array.isArray(character.askedOutThisYear)) {
      character.askedOutThisYear = [];
    }
    if (!Array.isArray(character.datedThisYear)) {
      character.datedThisYear = [];
    }
    if (typeof character.orientation === 'undefined') {
      character.orientation = 'straight';
    }
    if (typeof character.classFor === 'undefined') character.classFor = null;
    if (!Array.isArray(character.classmates)) character.classmates = [];
    else {
      // rosters drawn before genders get one now, unseen until now
      character.classmates = character.classmates.map((m) => ({
        ...m,
        gender: m.gender === 'they' ? (Math.random() < 0.5 ? 'Male' : 'Female') : m.gender,
      }));
    }
    if (typeof character.crewFor === 'undefined') character.crewFor = null;
    if (!Array.isArray(character.coworkers)) character.coworkers = [];
    else {
      character.coworkers = character.coworkers.map((m) => ({
        ...m,
        gender: m.gender === 'they' ? (Math.random() < 0.5 ? 'Male' : 'Female') : m.gender,
      }));
    }
    if (!Array.isArray(character.bossAskedThisYear)) {
      character.bossAskedThisYear = [];
    }
    if (!Array.isArray((character as Character).belongings)) {
      (character as Character).belongings = [];
    }
    // children arrived after the first release
    if (!Array.isArray((character as Character).children)) {
      (character as Character).children = [];
    }
    if (!('pregnancy' in character) || (character as Character).pregnancy === undefined) {
      (character as Character).pregnancy = null;
    }
    if (!Array.isArray((character as Character).intimateThisYear)) {
      (character as Character).intimateThisYear = [];
    }
    if (typeof (character as Character).satiety !== 'number') {
      (character as Character).satiety = 80;
    }
    if (typeof (character as Character).familyWealth !== 'number') {
      (character as Character).familyWealth = 50;
    }
    if (typeof (character as Character).destitute !== 'boolean') {
      (character as Character).destitute = false;
    }
    if (!Array.isArray((character as Character).stashedBelongings)) {
      (character as Character).stashedBelongings = [];
    }
    if (!('home' in character) || (character as Character).home === undefined) {
      (character as Character).home = null;
    }
    if (character.home && typeof character.home.movedIn !== 'boolean') {
      // bought when moving in was automatic: they already live there
      character.home = {
        ...character.home,
        movedIn: true,
        taxOwed: 0,
        forRent: false,
        rentAsked: 0,
        viewing: [],
      };
    }
    if (!Array.isArray((character as Character).invitedThisYear)) {
      (character as Character).invitedThisYear = [];
    }
    if (!Array.isArray((character as Character).rentals)) {
      (character as Character).rentals = [];
    }
    if (typeof (character as Character).viewingsThisYear !== 'number') {
      (character as Character).viewingsThisYear = 0;
    }
    if (!('serving' in character) || (character as Character).serving === undefined) {
      (character as Character).serving = null;
    }
    if (typeof (character as Character).sentence !== 'number') {
      (character as Character).sentence = null;
    }
    if (typeof (character as Character).offences !== 'number') {
      (character as Character).offences = 0;
    }
    if (typeof (character as Character).begsThisYear !== 'number') {
      (character as Character).begsThisYear = 0;
    }
    return {
      character,
      phase: parsed.phase === 'dead' ? 'dead' : 'playing',
    };
  } catch {
    return null;
  }
}

const saved =
  typeof localStorage !== 'undefined' ? loadSaved() : null;

export const useGame = create<GameState>((set, get) => ({
  phase: saved ? saved.phase : 'start',
  character: saved ? saved.character : null,
  activeEvent: null,
  pending: [],
  pendingJobId: null,
  mustChoose: false,
  section: null,
  notice: null,
  pendingBook: null,
  pendingChildShop: null,

  newLife: (opts) => {
    const era = getEra(opts.eraId);
    const place = era.places.find((p) => p.id === opts.placeId);
    const displayName = opts.name.trim() || 'Nameless Wanderer';
    const familyName = displayName.split(' ').slice(-1)[0] ?? 'Unknown';
    const birthDate = randomBirthDate();
    const family = generateFamily(opts.eraId, opts.placeId, familyName);
    const household = familySummary(family);
    const birthYear = opts.birthYear ?? era.startYear;
    const sign = birthYear > -500 ? zodiacSign(birthDate) : null;
    const destitute = Math.random() < 0.05;
    const familyWealth = destitute
      ? Math.floor(Math.random() * 16)
      : rollWealth();
    const birthText =
      `You were born in ${place?.name ?? 'an unknown place'}` +
      ` on ${birthDate}` +
      (sign ? `, under the sign of ${sign}` : '') +
      '.' +
      (household ? ` ${household}` : '') +
      ` ${birthWealthHint(familyWealth, destitute)}`;
    const sibCount = family.filter(
      (m) => m.relation === 'brother' || m.relation === 'sister',
    ).length;
    const parentCount = family.length - sibCount;
    const kinFlags: string[] = [];
    if (family.length > 0) kinFlags.push('has-family');
    if (sibCount > 0) kinFlags.push('has-siblings');
    if (parentCount === 0) kinFlags.push('orphan');
    else if (parentCount === 1) kinFlags.push('single-parent');
    else kinFlags.push('two-parents');
    const c: Character = {
      id: `life-${Date.now()}`,
      name: displayName,
      gender: opts.gender,
      orientation: 'straight',
      eraId: opts.eraId,
      placeId: opts.placeId,
      birthYear,
      birthDate,
      age: 0,
      alive: true,
      causeOfDeath: null,
      stats: clampStats(opts.stats),
      money: Math.round(opts.money),
      family,
      contacts: [],
      children: [],
      pregnancy: null,
      belongings: [],
      home: null,
      rentals: [],
      invitedThisYear: [],
      satiety: 80,
      familyWealth,
      destitute,
      serving: null,
      sentence: null,
      offences: 0,
      stashedBelongings: [],
      uniId: null,
      uniYears: 0,
      uniFor: null,
      uniMates: [],
      degrees: [],
      askedTuition: [],
      askedLicence: [],
      askedShop: [],
      ailments: destitute && Math.random() < 0.4
        ? [{ ailmentId: 'wasting', ownerId: null, known: true }]
        : [],
      flags: kinFlags,
      schoolId: null,
      jobId: null,
      jobRaises: 0,
      jobYears: 0,
      performance: 50,
      workedHard: false,
      studiesThisYear: 0,
      shiftsThisYear: 0,
      gigsThisYear: 0,
      jobHuntsThisYear: 0,
      begsThisYear: 0,
      schoolRecord: null,
      jobsHeld: 0,
      gigsDone: 0,
      activitiesUsed: [],
      activityHeat: {},
      activityAged: {},
      decayRemainder: { health: 0, happiness: 0, smarts: 0, looks: 0, energy: 0, reputation: 0 },
      recentWalkEvents: [],
      skillProgress: {},
      skillAptitude: rollAptitudes(),
      askedThisYear: [],
      flirtedThisYear: [],
      askedOutThisYear: [],
      datedThisYear: [],
      intimateThisYear: [],
      viewingsThisYear: 0,
      classFor: null,
      classmates: [],
      crewFor: null,
      coworkers: [],
      bossAskedThisYear: [],
      seenEventIds: [],
      log: [
        {
          age: 0,
          year: birthYear,
          text: birthText,
          kind: 'birth',
        },
      ],
    };
    persist(c, 'playing');
      set({ character: c, activeEvent: null, pending: [], pendingJobId: null, mustChoose: false, phase: 'playing', section: null });
  },

  ageUp: () => {
    const { character, activeEvent } = get();
    if (!character || !character.alive) return;
    // An open event popup blocks time until it is resolved and dismissed.
    if (activeEvent) return;

    const era = getEra(character.eraId);
    const nextAge = character.age + 1;
    const drift = yearlyDrift({ ...character, age: nextAge }, era.declineRate);
    // A year costs something whatever you do about it. Older and
    // harder worlds take more; young bodies put some of it back.
    const decay = yearlyDecay({ ...character, age: nextAge }, nextAge, character.eraId);
    const recovery = yearlyRecovery({ ...character, age: nextAge }, nextAge, character.eraId);
    // lasting sicknesses wear health down every year until cured
    const ailmentDrain = character.ailments.reduce(
      (sum, a) =>
        sum + (a.ownerId === null ? (AILMENTS[a.ailmentId]?.drain ?? 0) : 0),
      0,
    );
    const net = (key: keyof Stats): number =>
      (drift[key] ?? 0) - (decay[key] ?? 0) + (recovery[key] ?? 0);

    // Fractional changes carry over, so slow decay still adds up.
    // Reputation fades toward 50 instead of decaying away.
    const carried = applyYearlyChange(
      character.stats,
      {
        health: net('health'),
        happiness: net('happiness'),
        smarts: net('smarts'),
        looks: net('looks'),
        energy: net('energy'),
        reputation: (drift.reputation ?? 0) + reputationDrift(character.stats.reputation ?? 50),
      },
      character.decayRemainder,
    );

    const merged: Stats = clampStats({
      ...carried.stats,
      health: carried.stats.health - ailmentDrain,
    });
    let c: Character = {
      ...character,
      age: nextAge,
      stats: merged,
      decayRemainder: carried.remainder,
    };

    // Studies and work advance one step a year; a step may raise an
    // event to queue after this year's random one.
    const step = careerStep(c);
    c = step.character;
    c = { ...c, money: c.money + jobWage(c, era.moneyScale) };

    // Everyone you know ages a year, and drifts a little out of reach.
    const bondDrift = driftBonds(c);
    const kinDrift = driftFamily(c);
    c = { ...c, contacts: bondDrift.contacts, family: kinDrift.family };

    // Bonds that ran out on their own: they leave, and it lands.
    const lost = [...bondDrift.lost, ...kinDrift.lost];
    if (lost.length > 0) {
      const penalty = lost.reduce((sum, m) => sum + bondLossPenalty(m), 0);
      const lines = lost.map((m) => {
        const name =
          'name' in m
            ? m.name
            : `${m.firstName} ${m.lastName}`;
        const kind = 'kind' in m ? m.kind : 'family';
        return partingLine(name, kind);
      });
      const entry: LogEntry = {
        age: c.age,
        year: c.birthYear + c.age,
        text: lines.join(' '),
        kind: 'event',
      };
      c = {
        ...c,
        stats: clampStats({ ...c.stats, happiness: c.stats.happiness - penalty }),
        log: [...c.log, entry],
      };
    }

    // Grown children leave the house: close ones as friends in the
    // Circle, the rest gone out of your life.
    const grown: Child[] = [];
    const young: Child[] = [];
    for (const k of c.children ?? []) {
      if (childAge(k, c.age) >= 18) grown.push(k);
      else young.push(k);
    }
    if (grown.length > 0) {
      const entries: LogEntry[] = [];
      const friends: Contact[] = [];
      for (const k of grown) {
        if (k.bond >= 30) {
          friends.push({
            id: k.id,
            name: `${k.firstName} ${k.lastName}`,
            kind: 'friend',
            status: 'your own grown child',
            gender: k.gender,
            orientation: rollOrientation(),
            ageAtMeeting: 18,
            petName: null,
            bond: k.bond,
            yearsKnown: k.yearsKnown,
            wealth: rollPartnerWealth(),
          });
          entries.push({
            age: c.age,
            year: c.birthYear + c.age,
            text: `${k.firstName} ${k.lastName} is grown and gone out into the world.`,
            kind: 'event',
          });
        } else {
          entries.push({
            age: c.age,
            year: c.birthYear + c.age,
            text: `${k.firstName} ${k.lastName} is grown and gone, and you rarely hear from them.`,
            kind: 'event',
          });
        }
      }
      c = {
        ...c,
        children: young,
        contacts: [...c.contacts, ...friends],
        log: [...c.log, ...entries],
      };
    }

    // The years other people die: roll the household and the Circle.
    // Journals are written here; a parent or spouse queues one notice.
    const died = mortalityStep(c, c.birthYear + c.age);
    let deathInfos: ActiveEvent[] = [];
    if (died.deaths.length > 0) {
      const houseWealth = c.familyWealth ?? 50;
      const grief = died.deaths.reduce((sum, d) => sum + d.grief, 0);
      const entries: LogEntry[] = died.deaths.map((d) => ({
        age: c.age,
        year: c.birthYear + c.age,
        text: d.journal,
        kind: 'event',
      }));
      let money = c.money;
      const flags = new Set(c.flags);
      for (const d of died.deaths) {
        if (d.severity === 'parent') {
          money += Math.round(inheritanceBaseUnits(houseWealth) * era.moneyScale);
        }
        if (d.severity === 'spouse' && 'married' in d.member && d.member.married) {
          flags.add('widowed');
        }
      }
      // orphaned young in a poor house: no one left to feed you
      const nowDestitute =
        isOrphaned(died.family) && c.age < 18 && houseWealth < 30 && !c.destitute;
      if (nowDestitute) {
        entries.push({
          age: c.age,
          year: c.birthYear + c.age,
          text: 'There is no one left to feed you.',
          kind: 'event',
        });
      }
      c = {
        ...c,
        family: died.family,
        contacts: died.contacts,
        children: died.children,
        money,
        flags: [...flags],
        destitute: c.destitute || nowDestitute,
        stats: clampStats({ ...c.stats, happiness: c.stats.happiness - grief }),
        log: [...c.log, ...entries],
      };
      const heavy = died.deaths.filter((d) => d.severity !== 'other');
      if (heavy.length > 0) {
        const lines = heavy.map((d) => d.journal).join(' ');
        const rest = died.deaths.length - heavy.length;
        deathInfos = [
          infoEvent(
            `died-${c.age}-${heavy[0]!.id}`,
            'Loss',
            rest > 0 ? `${lines} ${rest} more ${rest === 1 ? 'loss' : 'losses'} this year.` : lines,
          ),
        ];
      }
    }

    // No sickness may point at someone no longer around — dead, left,
    // or grown and gone. Neither may your roof: the gone move out.
    c = dropStrayAilments(c);
    c = sweepResidents(c);
    // Children age whether or not the year took anyone.
    c = { ...c, children: driftChildren(c.children ?? []) };

    // An expected child arrives — or, if the other parent carried it
    // and is gone, is lost.
    if (c.pregnancy && c.age >= c.pregnancy.dueAge) {
      const partner = c.contacts.find((m) => m.id === c.pregnancy!.partnerId) ?? null;
      if (!partner && !c.pregnancy.playerCarries) {
        const entry: LogEntry = {
          age: c.age,
          year: c.birthYear + c.age,
          text: 'You lost the baby.',
          kind: 'event',
        };
        c = {
          ...c,
          pregnancy: null,
          stats: clampStats({ ...c.stats, happiness: c.stats.happiness - 8 }),
          log: [...c.log, entry],
        };
      } else {
        const baby = birthChild(c, partner);
        const entry: LogEntry = {
          age: c.age,
          year: c.birthYear + c.age,
          text: `${cap(childRef(baby))} ${baby.lastName} was born.`,
          kind: 'event',
        };
        c = {
          ...c,
          pregnancy: null,
          children: [...(c.children ?? []), baby],
          stats: clampStats({
            ...c.stats,
            happiness: c.stats.happiness + 4,
            reputation: (c.stats.reputation ?? 50) + 2,
          }),
          log: [...c.log, entry],
        };
      }
    }

    // Children eat: each one costs its keep, and a present other
    // parent pays their share first. Minors spend only what they have.
    const kids = (c.children ?? []).filter((k) => childAge(k, c.age) < 18);
    if (kids.length > 0) {
      let owed = 0;
      for (const k of kids) {
        const keep = upkeepBase(childAge(k, c.age));
        const other = k.otherParentId
          ? c.contacts.find((m) => m.id === k.otherParentId)
          : undefined;
        const share = other ? (other.wealth ?? 50) / 100 : 0;
        owed += keep * (1 - share);
      }
      const due = Math.round(owed * era.moneyScale);
      const pay = c.age < 18 ? Math.min(due, Math.max(0, c.money)) : due;
      if (pay !== 0) {
        const entry: LogEntry = {
          age: c.age,
          year: c.birthYear + c.age,
          text: 'You fed and clothed the children.',
          kind: 'event',
        };
        c = { ...c, money: c.money - pay, log: [...c.log, entry] };
      }
    }

    // Tenants pay their year: the comfortable always can, the poor
    // sometimes cannot, and it cools things when they do not.
    const earners: { id: string; rent: number }[] = [
      ...(c.home?.residents ?? [])
        .filter((r) => r.scope === 'contact' && (r.rent ?? 0) > 0)
        .map((r) => ({ id: r.id, rent: r.rent ?? 0 })),
      ...(c.rentals ?? []).flatMap((h) =>
        h.tenants
          .filter((r) => (r.rent ?? 0) > 0)
          .map((r) => ({ id: r.id, rent: r.rent ?? 0 })),
      ),
    ];
    for (const r of earners) {
      const t = c.contacts.find((x) => x.id === r.id);
      if (!t) continue;
      if (Math.random() < Math.min(1, 0.5 + (t.wealth ?? 50) / 100)) {
        c = { ...c, money: c.money + r.rent };
      } else {
        const entry: LogEntry = {
          age: c.age,
          year: c.birthYear + c.age,
          text: `${t.name} could not pay the rent.`,
          kind: 'event',
        };
        c = {
          ...c,
          contacts: c.contacts.map((x) =>
            x.id === t.id
              ? { ...x, bond: Math.max(0, Math.min(100, x.bond - 5)) }
              : x,
          ),
          log: [...c.log, entry],
        };
      }
    }

    // The collectors come when you owe and cannot pay.
    let debtInfo: ActiveEvent | null = null;
    if (c.money < 0 && c.age >= 18) {
      const ev = debtCollectEvent(c);
      if (ev) {
        const staged = stageEvent(c, ev, era.moneyScale);
        c = staged.character;
        debtInfo = staged.activeEvent;
        c = dropStrayAilments(c);
      }
    }

    // Little bodies catch what goes round: some years a child sickens
    // (noticed or not), and some years a sick child shakes it off.
    let sickInfos: ActiveEvent[] = [];
    const littles = (c.children ?? []).filter((k) => childAge(k, c.age) < 10);
    if (littles.length > 0) {
      const pool = ['flu', 'stomach', 'cough'];
      for (const k of littles) {
        const has = c.ailments.some((a) => a.ownerId === k.id);
        if (!has && Math.random() < 0.1) {
          const ail = pool[Math.floor(Math.random() * pool.length)]!;
          c = {
            ...c,
            ailments: [...c.ailments, { ailmentId: ail, ownerId: k.id, known: true }],
          };
          const entry: LogEntry = {
            age: c.age,
            year: c.birthYear + c.age,
            text: `${k.firstName} is sick.`,
            kind: 'event',
          };
          c = { ...c, log: [...c.log, entry] };
          sickInfos.push(infoEvent(`sick-${k.id}-${c.age}`, 'Poorly', `${k.firstName} is sick.`));
        }
      }
      for (const a of c.ailments.filter(
        (a) => a.ownerId && !AILMENTS[a.ailmentId]?.incurable && Math.random() < 0.4,
      )) {
        const k = (c.children ?? []).find((x) => x.id === a.ownerId);
        // young bodies shake things off; grown relatives keep theirs
        if (!k || childAge(k, c.age) >= 10) continue;
        const entry: LogEntry = {
          age: c.age,
          year: c.birthYear + c.age,
          text: `${k.firstName} is well again.`,
          kind: 'event',
        };
        c = {
          ...c,
          ailments: c.ailments.filter((x) => x !== a),
          log: [...c.log, entry],
        };
      }
    }

    // Too small to speak for yourself: parents take you to the doctor.
    const care = parentalCare(c);
    if (care) {
      const cured = new Set(care.cured);
      const entry: LogEntry = {
        age: c.age,
        year: c.birthYear + c.age,
        text: care.journal,
        kind: 'event',
      };
      c = {
        ...c,
        ailments: c.ailments.filter((a) => !cured.has(a.ailmentId)),
        stats: clampStats({ ...c.stats, health: c.stats.health + 5 }),
        log: [...c.log, entry],
      };
    }

    // Food: infants are fed, children are kept stocked, adults fend.
    // Rich houses feed better; poor ones sometimes have nothing;
    // destitute ones never do.
    const wealth = c.familyWealth ?? 50;
    const fedLevel = c.destitute ? 45 : infantFedLevel(wealth);
    if (isInfant(c)) {
      c = { ...c, satiety: fedLevel };
    } else {
      if (c.age < 18 && !c.destitute && Math.random() >= stapleSkipChance(wealth)) {
        const staple = stapleFor(c);
        const target = stapleTarget(wealth);
        if (staple) {
          const stock = (c.belongings ?? []).filter((id) => id === staple.id).length;
          if (stock < target) {
            c = {
              ...c,
              belongings: [...(c.belongings ?? []), ...Array(target - stock).fill(staple.id)],
            };
          }
        }
      }
      const wellFed = (c.satiety ?? 80) >= 70;
      const satiety = Math.max(0, (c.satiety ?? 80) - 30);
      c = {
        ...c,
        satiety,
        stats: clampStats({ ...c.stats, health: c.stats.health + (wellFed ? 3 : 0) }),
      };
      if (satiety <= 0) {
        const entry: LogEntry = {
          age: c.age,
          year: c.birthYear + c.age,
          text: 'You went hungry this year.',
          kind: 'event',
        };
        c = {
          ...c,
          stats: clampStats({ ...c.stats, health: c.stats.health - 10 }),
          log: [...c.log, entry],
        };
      } else if (satiety <= 25) {
        const entry: LogEntry = {
          age: c.age,
          year: c.birthYear + c.age,
          text: 'Food runs short.',
          kind: 'event',
        };
        c = { ...c, log: [...c.log, entry] };
      }
    }
    if (c.serving) {
      // the army feeds its own: hunger first, then rations on top
      c = { ...c, satiety: Math.min(100, (c.satiety ?? 80) + 35) };
    }

    // Rich houses sometimes put a licensed child on wheels themselves.
    if (
      hasLicence(c) &&
      !c.destitute &&
      wealthTier(wealth) === 'wealthy' &&
      !(c.belongings ?? []).some(isVehicle) &&
      askableRelatives(c).length > 0 &&
      Math.random() < 0.1
    ) {
      const gift = giftVehicleFor(c);
      const giver = askableRelatives(c)[Math.floor(Math.random() * askableRelatives(c).length)];
      if (gift && giver) {
        const gidx = c.family.findIndex((m) => m.id === giver.id);
        const ref = kinshipRef(giver, c.family);
        const name = gift.text.toLowerCase();
        const family = [...c.family];
        if (gidx >= 0) {
          family[gidx] = { ...family[gidx]!, bond: clampPerformance(family[gidx]!.bond + 8) };
        }
        const entry: LogEntry = {
          age: c.age,
          year: c.birthYear + c.age,
          text: `${cap(ref)} bought you the ${name}.`,
          kind: 'event',
        };
        c = {
          ...c,
          family,
          stats: clampStats({
            ...c.stats,
            health: c.stats.health + (gift.stats?.health ?? 0),
            happiness: c.stats.happiness + (gift.stats?.happiness ?? 0) + 2,
            smarts: c.stats.smarts + (gift.stats?.smarts ?? 0),
            looks: c.stats.looks + (gift.stats?.looks ?? 0),
            energy: (c.stats.energy ?? 70) + (gift.stats?.energy ?? 0),
            reputation: (c.stats.reputation ?? 50) + (gift.stats?.reputation ?? 0),
          }),
          belongings: [...(c.belongings ?? []), gift.id],
          log: [...c.log, entry],
        };
      }
    }

    // Rich houses sometimes buy a grown child without a roof a modest one.
    if (
      !c.home &&
      c.age >= 18 &&
      !c.destitute &&
      (c.familyWealth ?? 50) >= GIFT_WEALTH &&
      askableRelatives(c).length > 0 &&
      Math.random() < GIFT_CHANCE
    ) {
      const gift = giftHouseFor(c);
      const giver = askableRelatives(c)[Math.floor(Math.random() * askableRelatives(c).length)];
      if (gift && giver) {
        const gidx = c.family.findIndex((m) => m.id === giver.id);
        const ref = kinshipRef(giver, c.family);
        const name = gift.text.charAt(0).toLowerCase() + gift.text.slice(1);
        const family = [...c.family];
        if (gidx >= 0) {
          family[gidx] = { ...family[gidx]!, bond: clampPerformance(family[gidx]!.bond + 8) };
        }
        const entry: LogEntry = {
          age: c.age,
          year: c.birthYear + c.age,
          text: `${cap(ref)} bought you ${name}.`,
          kind: 'event',
        };
        c = {
          ...c,
          family,
          home: {
            houseId: gift.id,
            residents: [],
            movedIn: false,
            taxOwed: 0,
            forRent: false,
            rentAsked: 0,
            viewing: [],
          },
          stats: clampStats({ ...c.stats, happiness: c.stats.happiness + 6 }),
          log: [...c.log, entry],
        };
      }
    }

    // Death check first — only fatal when health reaches 0.
    const lifespanMod =
      era.places.find((p) => p.id === c.placeId)?.lifespanMod ?? 0;
    const cause = deathRoll(c, era.lifeExpectancy + lifespanMod);
    if (cause) {
      const deathEntry: LogEntry = {
        age: c.age,
        year: c.birthYear + c.age,
        text: `You died at ${c.age} — ${cause}.`,
        kind: 'death',
      };
      c = {
        ...c,
        alive: false,
        causeOfDeath: cause,
        log: [...c.log, deathEntry],
      };
      persist(c, 'dead');
      set({ character: c, activeEvent: null, pending: [], pendingJobId: null, mustChoose: false, phase: 'dead', section: null });
      return;
    }

    // coming home: the war ended while you served
    if (c.serving) {
      const war = WARS.find((w) => w.id === c.serving);
      if (!war || c.birthYear + c.age > war.years[1]) {
        const entry: LogEntry = {
          age: c.age,
          year: c.birthYear + c.age,
          text: `You came home from ${war?.name ?? 'the war'}.`,
          kind: 'event',
        };
        c = {
          ...c,
          serving: null,
          belongings: [...(c.stashedBelongings ?? []), ...(c.belongings ?? [])],
          stashedBelongings: [],
          crewFor: null,
          coworkers: [],
          log: [...c.log, entry],
        };
      }
    }

    // outliving it: crisis sicknesses lift once their years pass
    for (const k of pastCrises(c, c.birthYear + c.age)) {
      if (k.recovered === undefined) continue;
      const entry: LogEntry = {
        age: c.age,
        year: c.birthYear + c.age,
        text: k.recovered,
        kind: 'event',
      };
      c = {
        ...c,
        ailments: c.ailments.filter((a) => !(a.ownerId === null && a.ailmentId === k.ailmentId)),
        log: [...c.log, entry],
      };
    }

    // Sickness in the household can spread to the character, unfelt at first.
    const spread = spreadFromHousehold(c);
    let picked: LifeEvent | null = null;
    let quiet = false;
    // the bad years strike first: plague and flu take whoever is alive
    const crisis = crisisFor(c, c.birthYear + c.age);
    const war = draftFor(c, c.birthYear + c.age);
    const drafted = !!war && Math.random() < war.draftChance;
    if (crisis && Math.random() < crisis.catchChance) {
      picked = crisisEvent(crisis);
    } else if (c.sentence) {
      // a prison year: the world goes on without you
      const front = prisonYear(c);
      c = front.character;
      if (front.died) {
        const dead = killNow(c, front.died);
        persist(dead, 'dead');
        set({ character: dead, activeEvent: null, pending: [], pendingJobId: null, mustChoose: false, phase: 'dead', section: null });
        return;
      }
      if (c.sentence === null) {
        const entry: LogEntry = {
          age: c.age,
          year: c.birthYear + c.age,
          text: 'You served your time and came out.',
          kind: 'event',
        };
        c = { ...c, log: [...c.log, entry] };
      }
    } else if (c.serving) {
      // deployed years belong to the war: danger first, orders after
      const front = warYear(c);
      c = front.character;
      if (front.died) {
        const dead = killNow(c, front.died);
        persist(dead, 'dead');
        set({ character: dead, activeEvent: null, pending: [], pendingJobId: null, mustChoose: false, phase: 'dead', section: null });
        return;
      }
      const servingWar = WARS.find((w) => w.id === c.serving);
      if (servingWar) picked = warYearEvent(servingWar);
    } else if (drafted && war) {
      picked = draftEvent(war);
    } else if (spread) {
      const def = AILMENTS[spread.ailmentId];
      const src = c.family.find((m) => m.id === spread.memberId);
      const srcName = src ? kinshipRef(src, c.family) : 'a relative';
      c = addAilment(c, {
        ailmentId: spread.ailmentId,
        ownerId: null,
        known: false,
      });
      picked = {
        id: `caught-${spread.ailmentId}`,
        title: `Caught ${def?.name ?? 'something'}`,
        description: `You catch ${def?.name.toLowerCase() ?? 'something'} — most likely from ${srcName}.`,
        category: 'illness',
        conditions: {},
        weight: 0,
        effects: { journal: `You caught the ${def?.name.toLowerCase() ?? 'something'} from ${srcName}.` },
        choices: [],
      };
    } else {
      // Incurable condition development in old age for motivated deterioration
      const hasIncurable = c.ailments.some(
        (a) => a.ownerId === null && AILMENTS[a.ailmentId]?.incurable,
      );
      if (!hasIncurable && c.age >= Math.max(50, era.lifeExpectancy - 6)) {
        const over = Math.max(1, c.age - Math.max(50, era.lifeExpectancy - 6));
        // a slow clock that plateaus: most meet it in their 80s, a few
        // dodge it past a hundred
        const termChance = Math.min(0.12, 0.02 + over * 0.008);
        if (Math.random() < termChance) {
          const termId = c.age >= era.lifeExpectancy + 4 ? 'failing-health' : 'heart-disease';
          const def = AILMENTS[termId];
          c = addAilment(c, { ailmentId: termId, ownerId: null, known: true });
          picked = {
            id: `onset-${termId}`,
            title: def.name,
            description: termId === 'heart-disease'
              ? 'Chest pains and shortness of breath have become persistent. The physician confirms you have chronic heart disease.'
              : 'Your vital strength has waned noticeably. The physician confirms your organs are failing in old age.',
            category: 'illness',
            conditions: {},
            weight: 0,
            effects: {
              stats: { health: -8 },
              journal: `You were diagnosed with ${def.name.toLowerCase()}.`,
            },
            choices: [],
          };
        }
      }

      if (!picked) {
        // Dated things announce themselves — a book coming out, or the
        // world doing something worth hearing about. Living through the
        // year is the luck; which one, when a year holds several, is
        // the draw.
        const dated = [...PUBLICATION_EVENTS, ...HISTORY_EVENTS].filter((e) =>
          isEligible(e, c),
        );
        if (dated.length > 0) {
          picked = dated[Math.floor(Math.random() * dated.length)];
        }
      }

      if (!picked) {
        // A hidden sickness can settle in unnoticed — found only by checkup.
        const silent = silentAilment(c, era);
        if (silent) {
          c = addAilment(c, { ailmentId: silent, ownerId: null, known: false });
        }

        // ~82% of years carry an event; otherwise a quiet year.
        const pool = eligibleEvents(EVENTS, c);
        const eventRoll = Math.random();
        if (pool.length === 0 || eventRoll > 0.82) {
          quiet = true;
        } else {
          const rolled = pickEvent(pool);
          if (rolled) picked = rolled;
          else quiet = true;
        }
      }
    }

    // A young child asks for something, some years.
    let childAsk: LifeEvent | null = null;
    const askers = (c.children ?? []).filter((k) => {
      const a = childAge(k, c.age);
      return a >= 4 && a <= 14;
    });
    if (askers.length > 0 && Math.random() < 0.35) {
      childAsk = childAskEvent(c, askers[Math.floor(Math.random() * askers.length)]!);
    }
    // Dues on every roof: unpaid last year, the collector comes this year.
    // Pay from the house view and no popup ever comes.
    const taxEvents: LifeEvent[] = [];
    if (c.home) {
      if (c.home.taxOwed > 0) {
        taxEvents.push(taxDueEvent(formatFunds(c.home.taxOwed, moneySymbolOf(c))));
      } else {
        const due = taxAmount(c, 'home');
        if (due > 0) c = { ...c, home: { ...c.home, taxOwed: due } };
      }
    }
    for (const rental of c.rentals ?? []) {
      if (rental.taxOwed > 0) {
        taxEvents.push(
          taxDueEvent(formatFunds(rental.taxOwed, moneySymbolOf(c)), `rent-tax-${rental.uid}`),
        );
      } else {
        const due = taxAmount(c, rental.uid);
        if (due > 0) {
          c = {
            ...c,
            rentals: (c.rentals ?? []).map((r) =>
              r.uid === rental.uid ? { ...r, taxOwed: due } : r,
            ),
          };
        }
      }
    }
    // A spouse kept out of your house asks to be let in, every year apart.
    let spouseAsk: LifeEvent | null = null;
    if (c.home?.movedIn && !c.serving && !c.sentence) {
      const apart = c.contacts.find(
        (m) => m.kind === 'partner' && m.married && !isResident(c, 'contact', m.id),
      );
      if (apart) spouseAsk = spouseAskEvent(apart);
    }
    // Asked to take someone in: lovers first, then kin, then friends.
    // Spouses ask their own way; the rest ask here, at most one a year.
    let inboundAsk: LifeEvent | null = null;
    if (c.home?.movedIn && !c.serving && !c.sentence && canActSocially(c)) {
      const candidates: {
        scope: 'contact' | 'family';
        id: string;
        isPartner: boolean;
        label: string;
      }[] = [];
      for (const m of c.contacts) {
        if (m.kind === 'pet') continue;
        if (m.kind === 'partner' && m.married) continue;
        if (contactAge(m, c.age) < 16) continue;
        if (isResident(c, 'contact', m.id)) continue;
        if ((c.invitedThisYear ?? []).includes(`contact:${m.id}`)) continue;
        candidates.push({
          scope: 'contact',
          id: m.id,
          isPartner: m.kind === 'partner',
          label: contactRef(m),
        });
      }
      for (const m of c.family) {
        if (memberAge(m, c.age) < 16) continue;
        if (isResident(c, 'family', m.id)) continue;
        if ((c.invitedThisYear ?? []).includes(`family:${m.id}`)) continue;
        candidates.push({
          scope: 'family',
          id: m.id,
          isPartner: false,
          label: kinshipRef(m, c.family),
        });
      }
      candidates.sort((a, b) => {
        const rank = (x: { isPartner: boolean; scope: string }) =>
          x.isPartner ? 0 : x.scope === 'family' ? 1 : 2;
        return rank(a) - rank(b);
      });
      for (const cand of candidates) {
        const person =
          cand.scope === 'contact'
            ? c.contacts.find((x) => x.id === cand.id)
            : c.family.find((x) => x.id === cand.id);
        if (!person) continue;
        if (
          Math.random() <
          inboundAskChance(c, person, cand.scope === 'contact')
        ) {
          inboundAsk = askedEvent(cand.scope, cand.label, cand.id, cand.isPartner);
          break;
        }
      }
    }
    // An open listing may bring strangers to the door, at your price —
    // the house first, then every open property behind it.
    const tenantAsks: LifeEvent[] = [];
    const openProps: string[] = [
      ...(c.home?.forRent ? ['home'] : []),
      ...(c.rentals ?? []).filter((r) => r.forRent).map((r) => r.uid),
    ];
    if (canActSocially(c)) {
      for (const prop of openProps) {
        if (tenantAsks.length > 0 && inboundAsk) break;
        if (Math.random() < 0.25) {
          const group = makeTenantGroup(c);
          const asked =
            prop === 'home' ? (c.home?.rentAsked ?? 0) : (rentalByUid(c, prop)?.rentAsked ?? 0);
          const priceText = formatFunds(asked, moneySymbolOf(c));
          if (prop === 'home' && c.home) {
            c = { ...c, home: { ...c.home, viewing: group } };
          } else {
            c = {
              ...c,
              rentals: (c.rentals ?? []).map((r) =>
                r.uid === prop ? { ...r, viewing: group } : r,
              ),
            };
          }
          tenantAsks.push(tenantAskEvent(c, prop, group, priceText));
          if (inboundAsk) break;
        }
      }
    }
    // Tenants get up to things: every let roof rolls its own yearly
    // doing, and each stages behind the rest.
    const tenantEvents: LifeEvent[] = [];
    if (!c.serving && !c.sentence) {
      const letProps: string[] = [
        ...(c.home &&
        (c.home.residents ?? []).some((r) => r.scope === 'contact' && (r.rent ?? 0) > 0)
          ? ['home']
          : []),
        ...(c.rentals ?? [])
          .filter((r) => r.tenants.some((t) => (t.rent ?? 0) > 0))
          .map((r) => r.uid),
      ];
      for (const prop of letProps) {
        if (Math.random() >= 0.3) continue;
        const leases = propTenants(c, prop).filter((e) => (e.rent ?? 0) > 0);
        if (leases.length === 0) continue;
        const lease = leases[Math.floor(Math.random() * leases.length)]!;
        const defs = tenantEventsFor(c.eraId);
        if (defs.length === 0) continue;
        const def = defs[Math.floor(Math.random() * defs.length)]!;
        if (def.choices.length === 0) {
          const tname =
            c.contacts.find((x) => x.id === lease.id)?.name ?? 'your tenant';
          c = applyTenantNotice(c, prop, lease.id, def.key);
          tenantEvents.push({
            id: `home-tn-${def.key}|${prop}|${lease.id}`,
            title: def.title,
            description: def.describe(cap(tname)),
            category: 'social',
            conditions: {},
            weight: 0,
            choices: [],
            effects: { journal: def.describe(cap(tname)) },
          });
        } else {
          const staged = tenantChoiceEvent(c, prop, lease.id, def);
          if (staged) tenantEvents.push(staged);
        }
      }
    }
    // Career events wait behind this year's random event.
    const career = step.events;
    const queue: LifeEvent[] = [
      ...(picked ? [picked] : []),
      ...(childAsk ? [childAsk] : []),
      ...(spouseAsk ? [spouseAsk] : []),
      ...(inboundAsk ? [inboundAsk] : []),
      ...tenantAsks,
      ...taxEvents,
      ...tenantEvents,
      ...career,
    ];
    if (queue.length === 0 && deathInfos.length === 0 && sickInfos.length === 0 && !debtInfo) {
      if (quiet) {
        const entry: LogEntry = {
          age: c.age,
          year: c.birthYear + c.age,
          text: quietLine(c, placeNameOf(c)),
          kind: 'quiet',
        };
        c = { ...c, log: [...c.log, entry] };
      }
      persist(c, 'playing');
      set({ character: c, activeEvent: null, mustChoose: false, pending: [], pendingJobId: null });
      return;
    }

    let next = c;
    let active: ActiveEvent | null = null;
    const pending: ActiveEvent[] = [];
    // death, sickness and debt fallout goes first, then the year's events behind it
    for (const info of [...deathInfos, ...sickInfos, ...(debtInfo ? [debtInfo] : [])]) {
      if (!active) active = info;
      else pending.push(info);
    }
    for (const [i, e] of queue.entries()) {
      const staged = stageEvent(next, e, era.moneyScale);
      next = staged.character;
      if (i === 0 && !active) active = staged.activeEvent;
      else pending.push(staged.activeEvent);
    }
    // arrivals from the year's events get named behind the popup
    for (const m of next.contacts) {
      if (!c.contacts.some((x) => x.id === m.id)) pending.push(metEvent(m));
    }

    // onset damage lands after the yearly check, so check again here —
    // otherwise a killing blow waits a whole healing year to count
    const aftermath = deathRoll(next, era.lifeExpectancy + lifespanMod);
    if (aftermath) {
      const dead = killNow(next, aftermath);
      persist(dead, 'dead');
      set({ character: dead, activeEvent: null, pending: [], pendingJobId: null, mustChoose: false, phase: 'dead', section: null });
      return;
    }

    persist(next, 'playing');
    set({
      character: next,
      activeEvent: active,
      mustChoose: (active?.event.choices.length ?? 0) > 0,
      pending,
      pendingJobId: null,
    });
  },

  choose: (choiceId) => {
    const { character, activeEvent } = get();
    if (!character || !activeEvent) return;
    const choice = activeEvent.event.choices.find((ch) => ch.id === choiceId);
    if (!choice || activeEvent.lastResult) return;

    const place = placeNameOf(character);
    const memberId = activeEvent.memberId;
    const member = memberId
      ? (character.family.find((m) => m.id === memberId) ?? null)
      : null;
    const memberName = member ? kinshipRef(member, character.family) : null;
    const withFx = applyFx(
      character,
      choice.effects,
      getEra(character.eraId).moneyScale,
      memberId,
    );

  const result = choice.effects.result
    ? renderText(choice.effects.result, character, place, memberName, bossNameOf(character))
      : 'Life shifts a little.';

  const journalText = choice.effects.journal
    ? renderText(choice.effects.journal, character, place, memberName, bossNameOf(character))
      : `${activeEvent.event.title}: chose “${choice.text}”.`;

    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: journalText,
      kind: 'choice',
    };

    let c: Character = {
      ...withFx,
      log: [...withFx.log, entry],
    };

    const fatal = deathRoll(c, getEra(c.eraId).lifeExpectancy);
    if (fatal) {
      const dead = killNow(c, fatal);
      persist(dead, 'dead');
      set({ character: dead, activeEvent: null, pending: [], pendingJobId: null, mustChoose: false, phase: 'dead', section: null, pendingBook: null });
      return;
    }

    // The job application flow chains its own popups, and so do
    // lover's decisions: begging, being begged, and what comes of it.
    // A child's ask for a shop thing parks the errand until dismissal.
    const askMatch = /^child-ask-(.+)$/.exec(activeEvent.event.id);
    const childShop = choice.openShop && askMatch
      ? { childId: askMatch[1], itemId: choice.openShop }
      : get().pendingChildShop;
    const flow =
      jobFlowStep(
        activeEvent.event.id,
        choiceId,
        c,
        get().pendingJobId,
      ) ?? loverFlowStep(activeEvent.event.id, choiceId, c) ?? homeFlowStep(activeEvent.event.id, choiceId, c) ?? warFlowStep(activeEvent.event.id, choiceId, c) ?? pregnancyFlowStep(activeEvent.event.id, choiceId, c) ?? childFlowStep(activeEvent.event.id, choiceId, c) ?? crimeFlowStep(activeEvent.event.id, choiceId, c);
    if (flow) {
      const era = getEra(c.eraId);
      // flow.character carries the outcome (hired → jobId, rejected → not)
      let staged = flow.character;
      const follow: ActiveEvent[] = [];
      for (const e of flow.events) {
        const out = stageEvent(staged, e, era.moneyScale);
        staged = out.character;
        follow.push(out.activeEvent);
      }
      const fatal = deathRoll(staged, era.lifeExpectancy);
      if (fatal) {
        const dead = killNow(staged, fatal);
        persist(dead, 'dead');
        set({ character: dead, activeEvent: null, pending: [], pendingJobId: null, mustChoose: false, phase: 'dead', section: null, pendingBook: null });
        return;
      }
      for (const m of staged.contacts) {
        if (!c.contacts.some((x) => x.id === m.id)) follow.push(metEvent(m));
      }
      const cleaned = dropStrayAilments(staged);
      persist(cleaned, 'playing');
      set({
        character: cleaned,
        activeEvent: { ...activeEvent, lastResult: result, lastChoiceId: choiceId },
        mustChoose: false,
        pending: [...get().pending, ...follow],
        pendingJobId: flow.jobId,
        pendingChildShop: childShop,
      });
      return;
    }

    persist(c, 'playing');
    set({
      character: c,
      activeEvent: { ...activeEvent, lastResult: result, lastChoiceId: choiceId },
      mustChoose: false,
      pending: [
        ...get().pending,
        ...c.contacts
          .filter((m) => !character.contacts.some((x) => x.id === m.id))
          .map((m) => metEvent(m)),
      ],
      pendingBook: choice.effects.openBook ?? get().pendingBook,
      pendingChildShop: childShop,
    });
  },

  startOver: () => {
    persist(null, 'start');
    set({ phase: 'start', character: null, activeEvent: null, pending: [], pendingJobId: null, mustChoose: false, section: null, pendingBook: null, pendingChildShop: null });
  },

  openSection: (kind) => {
    if (get().activeEvent) return;
    set({ section: kind });
  },

  closeSection: () => {
    set({ section: null });
  },

  dismissEvent: () => {
    const { mustChoose, pending } = get();
    if (mustChoose) return;
    // the next queued career event takes the popup's place
    const [next, ...rest] = pending;
    if (next) {
      set({
        activeEvent: next,
        pending: rest,
        mustChoose: next.event.choices.length > 0,
      });
      return;
    }
    set({ activeEvent: null });
    // a book opened from an event takes you to the reader;
    // a child's ask takes you to the shops
    if (get().pendingBook) set({ section: 'actions' });
    else if (get().pendingChildShop) set({ section: 'actions' });
  },

  clearPendingBook: () => {
    set({ pendingBook: null });
  },

  clearPendingChildShop: () => {
    set({ pendingChildShop: null });
  },

  cureAilment: (id, ownerId = null) => {
    const { character } = get();
    if (!character) return;
    const idx = character.ailments.findIndex(
      (a) => a.ailmentId === id && (a.ownerId ?? null) === (ownerId ?? null),
    );
    if (idx < 0) return;
    const def = AILMENTS[id];
    if (!def || def.incurable) return;
    const era = getEra(character.eraId);
    const cost = def.cureCost * era.moneyScale;
    if (character.money < cost) return;
    const child = ownerId
      ? (character.children ?? []).find((k) => k.id === ownerId) ?? null
      : null;
    if (ownerId && !child) return;
    const curedText = child
      ? `The doctor treats ${child.firstName} for the ${def.name.toLowerCase()}. The worst of it is over.`
      : `The doctor treats you for the ${def.name.toLowerCase()}. You are no longer suffering from it.`;
    const journalText = child
      ? `${child.firstName} was treated for the ${def.name.toLowerCase()} by a doctor.`
      : `You were successfully treated for the ${def.name.toLowerCase()} by a doctor.`;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: journalText,
      kind: 'event',
    };
    const children = child
      ? (character.children ?? []).map((k) =>
        k.id === child.id
          ? { ...k, bond: Math.max(0, Math.min(100, k.bond + 4)) }
          : k,
      )
      : character.children;
    const c: Character = {
      ...character,
      money: character.money - cost,
      ailments: character.ailments.filter((_, i) => i !== idx),
      children,
      stats: clampStats({
        ...character.stats,
        health: child ? character.stats.health : character.stats.health + 5,
      }),
      log: [...character.log, entry],
    };
    persist(c, character.alive ? 'playing' : 'dead');
    set({ character: c, section: null, notice: { title: 'Treated', eyebrow: 'Doctor', text: curedText } });
  },

  giftMoney: (contactId, amount) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (!canActSocially(character)) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const idx = character.contacts.findIndex((m) => m.id === contactId);
    if (idx < 0) return;
    const me = character.contacts[idx];
    if (me.kind === 'pet') return;
    const era = getEra(character.eraId);
    const give = Math.max(0, Math.min(Math.floor(amount), character.money));
    if (give <= 0) return;
    const bumped = applyBond(me, giftBond(give, era.moneyScale));
    const contacts = [...character.contacts];
    contacts[idx] = bumped;
    const variant = pickVariant(tableFor('friend').money);
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: fillVariant(variant.journal, bumped, {
        name: contactRef(bumped),
        trade: contactTrade(bumped, character.age, character.eraId),
        money: formatFunds(give, moneySymbolOf(character)),
      }),
      kind: 'event',
    };
    const c: Character = {
      ...character,
      contacts,
      money: character.money - give,
      stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 1 }),
      log: [...character.log, entry],
    };
    if (bumped.bond <= 0) {
      const penalty = bondLossPenalty(me);
      const gone: Character = {
        ...c,
        contacts: c.contacts.filter((_, i) => i !== idx),
        stats: clampStats({ ...c.stats, happiness: c.stats.happiness - penalty }),
      };
      const goneEntry: LogEntry = {
        age: gone.age,
        year: gone.birthYear + gone.age,
        text: partingLine(me.name, me.kind),
        kind: 'event',
      };
      const final: Character = dropStrayAilments({ ...gone, log: [...gone.log, goneEntry] });
      persist(final, 'playing');
      set({
        character: final,
        section: null,
        notice: { title: 'Lost', eyebrow: cap(me.kind), text: goneEntry.text },
      });
      return;
    }
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: 'Gave money',
        eyebrow: contactRef(bumped),
        text: `They take ${formatFunds(give, moneySymbolOf(character))}, and they remember that you gave it.`,
      },
    });
  },

  giftMoneyFamily: (memberId, amount) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (!canActSocially(character)) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const idx = character.family.findIndex((m) => m.id === memberId);
    if (idx < 0) return;
    const era = getEra(character.eraId);
    const give = Math.max(0, Math.min(Math.floor(amount), character.money));
    if (give <= 0) return;
    const me = character.family[idx];
    const kin = kinGender(me);
    const ref = kinshipRef(me, character.family);
    const bumped = { ...me, bond: clampPerformance(me.bond + giftBond(give, era.moneyScale)) };
    const family = [...character.family];
    family[idx] = bumped;
    const variant = pickVariant(tableFor('family').money);
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: fillVariant(variant.journal, kin, {
        name: ref,
        trade: me.status,
        money: formatFunds(give, moneySymbolOf(character)),
      }),
      kind: 'event',
    };
    const c: Character = {
      ...character,
      family,
      money: character.money - give,
      stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 1 }),
      log: [...character.log, entry],
    };
    if (bumped.bond <= 0) {
      const penalty = bondLossPenalty(me);
      const gone: Character = {
        ...c,
        family: c.family.filter((_, i) => i !== idx),
        stats: clampStats({ ...c.stats, happiness: c.stats.happiness - penalty }),
      };
      const goneEntry: LogEntry = {
        age: gone.age,
        year: gone.birthYear + gone.age,
        text: `${me.firstName} no longer wants you in their life.`,
        kind: 'event',
      };
      const final: Character = dropStrayAilments({ ...gone, log: [...gone.log, goneEntry] });
      persist(final, 'playing');
      set({
        character: final,
        section: null,
        notice: { title: 'Lost', eyebrow: cap(ref), text: goneEntry.text },
      });
      return;
    }
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: 'Gave money',
        eyebrow: cap(ref),
        text: `They take ${formatFunds(give, moneySymbolOf(character))}, and they remember that you gave it.`,
      },
    });
  },

  interact: (contactId, action) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const idx = character.contacts.findIndex((m) => m.id === contactId);
    if (idx < 0) return;
    const me = character.contacts[idx];
    // Infants have no say in it and no coin to give, but they can be
    // held and played with.
    if (!canActSocially(character) && action !== 'time' && action !== 'pet') {
      return;
    }
    const def = actionDef(me.kind, action);
    if (!def) return;
    const era = getEra(character.eraId);
    if (!canAfford(def, character.money, era.moneyScale)) return;
    // money opens its own slider, naming its own field
    if (def.asksForAmount || def.asksForName) return;
    // Animals get animal wording; everyone else gets the plain set.
    const done = resolveAction(def, Math.random, me.kind === 'pet' ? 'pet' : 'person');
    const bumped = applyBond(me, done.bond);
    const fill = (template: string, contact: typeof me): string =>
      fillVariant(template, contact, {
        name: contactRef(contact),
        trade: contactTrade(contact, character.age, character.eraId),
      });

    const withDef = (base: Character, contact: typeof me): Character => {
      const entry: LogEntry = {
        age: base.age,
        year: base.birthYear + base.age,
        text: fill(done.variant.journal, contact),
        kind: 'event',
      };
      return {
        ...base,
        money: base.money + Math.round(def.cost * era.moneyScale),
        stats: clampStats({
          ...base.stats,
          happiness: base.stats.happiness + (done.stats.happiness ?? 0),
          health: base.stats.health + (done.stats.health ?? 0),
        }),
        log: [...base.log, entry],
      };
    };

    // Releasing an animal is your own choice, not a failed bond.
    if (def.endsIt) {
      const gone: Character = {
        ...withDef(character, me),
        contacts: character.contacts.filter((_, i) => i !== idx),
      };
      const released = { ...gone, log: [...gone.log.slice(0, -1), { ...gone.log[gone.log.length - 1], text: releaseLine(me) }] };
      persist(released, 'playing');
      set({
        character: released,
        section: null,
        notice: { title: 'Released', eyebrow: cap(me.name), text: releaseLine(me) },
      });
      return;
    }

    const contacts = [...character.contacts];
    contacts[idx] = bumped;
    const c = withDef({ ...character, contacts }, bumped);

    // A bond at zero ends it, and the closer and longer it was,
    // the more it takes out of you.
    if (bumped.bond <= 0) {
      const penalty = bondLossPenalty(me);
      const gone: Character = {
        ...c,
        contacts: c.contacts.filter((_, i) => i !== idx),
        stats: clampStats({
          ...c.stats,
          happiness: c.stats.happiness - penalty,
        }),
      };
      const goneEntry: LogEntry = {
        age: gone.age,
        year: gone.birthYear + gone.age,
        text: partingLine(me.name, me.kind),
        kind: 'event',
      };
      const final: Character = dropStrayAilments({ ...gone, log: [...gone.log, goneEntry] });
      persist(final, 'playing');
      set({
        character: final,
        section: null,
        notice: {
          title: 'Lost',
          eyebrow: me.kind === 'pet' ? 'Pet' : cap(me.kind),
text: partingLine(me.name, me.kind),
        },
      });
      return;
    }

    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: def.text,
        eyebrow: contactRef(bumped),
        text: fill(done.variant.notice, bumped),
      },
    });
  },

  interactChild: (childId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    const idx = (character.children ?? []).findIndex((k) => k.id === childId);
    if (idx < 0) return;
    if (!canActSocially(character)) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const ch = character.children[idx];
    const moved = { ...ch, bond: Math.max(0, Math.min(100, ch.bond + 8)) };
    const children = [...character.children];
    children[idx] = moved;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: `You spent the afternoon with ${ch.firstName}.`,
      kind: 'event',
    };
    const c: Character = {
      ...character,
      children,
      stats: clampStats({
        ...character.stats,
        happiness: character.stats.happiness + 2,
      }),
      log: [...character.log, entry],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: ch.firstName,
        text: 'You lose track of the hour entirely.',
      },
    });
  },

  interactFamily: (memberId, action) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const idx = character.family.findIndex((m) => m.id === memberId);
    if (idx < 0) return;
    // under 3 you are not company yet; after that, held but not reasoned with
    if (!canSeeFamily(character)) return;
    if (!canActSocially(character) && action !== 'time') return;
    const def = actionDef('family', action);
    if (!def || def.endsIt) return;
    const era = getEra(character.eraId);
    if (!canAfford(def, character.money, era.moneyScale)) return;
    const me = character.family[idx];
    const ref = kinshipRef(me, character.family);
    const done = resolveAction(def);
    const kin = kinGender(me);
    const bumped = { ...me, bond: clampPerformance(me.bond + done.bond) };
    const family = [...character.family];
    family[idx] = bumped;
    const fill = (template: string): string =>
      fillVariant(template, kin, { name: ref, trade: me.status });
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: fill(done.variant.journal),
      kind: 'event',
    };
    const c: Character = {
      ...character,
      family,
      money: character.money + Math.round(def.cost * era.moneyScale),
      stats: clampStats({
        ...character.stats,
        happiness: character.stats.happiness + (done.stats.happiness ?? 0),
        health: character.stats.health + (done.stats.health ?? 0),
        energy: (character.stats.energy ?? 70) + (done.stats.energy ?? 0),
        reputation: (character.stats.reputation ?? 50) + (done.stats.reputation ?? 0),
      }),
      log: [...character.log, entry],
    };

    if (bumped.bond <= 0) {
      const penalty = bondLossPenalty(me);
      const gone: Character = {
        ...c,
        family: c.family.filter((_, i) => i !== idx),
        stats: clampStats({
          ...c.stats,
          happiness: c.stats.happiness - penalty,
        }),
      };
      const goneEntry: LogEntry = {
        age: gone.age,
        year: gone.birthYear + gone.age,
        text: `${me.firstName} no longer wants you in their life.`,
        kind: 'event',
      };
      const final: Character = dropStrayAilments({ ...gone, log: [...gone.log, goneEntry] });
      persist(final, 'playing');
      set({
        character: final,
        section: null,
        notice: { title: 'Lost', eyebrow: cap(ref), text: goneEntry.text },
      });
      return;
    }

    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: def.text, eyebrow: cap(ref), text: fill(done.variant.notice) },
    });
  },

  uniMates: () => {
    const { character } = get();
    if (!character) return [];
    return uniOf(character);
  },

  interactUniMate: (id, action) => {
    const { character } = get();
    if (!character || !character.alive) return;
    const idx = uniOf(character).findIndex((m) => m.id === id);
    if (idx < 0) return;
    const me = uniOf(character)[idx];
    const def = actionDef('friend', action);
    if (!def || def.endsIt || def.asksForAmount || def.asksForName) return;
    const era = getEra(character.eraId);
    if (!canAfford(def, character.money, era.moneyScale)) return;
    const done = resolveAction(def, Math.random, 'school');
    const bumped: Classmate = { ...me, bond: clampPerformance(me.bond + done.bond) };
    // course mates are not friends until befriended, and the tutor
    // never is — so the journal names them plainly, never as a friend
    const mateName = bumped.isTeacher
      ? `your tutor ${bumped.name}`
      : bumped.name;
    const fill = (t: string): string =>
      fillVariant(t, bumped, {
        name: mateName,
        trade: bumped.status,
      });
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: fill(done.variant.journal),
      kind: 'event',
    };
    const c: Character = {
      ...character,
      uniMates: character.uniMates.map((m) => (m.id === id ? bumped : m)),
      money: character.money + Math.round(def.cost * era.moneyScale),
      stats: clampStats({
        ...character.stats,
        happiness: character.stats.happiness + (done.stats.happiness ?? 0),
        health: character.stats.health + (done.stats.health ?? 0),
        energy: (character.stats.energy ?? 70) + (done.stats.energy ?? 0),
        reputation: (character.stats.reputation ?? 50) + (done.stats.reputation ?? 0),
      }),
      log: [...character.log, entry],
    };

    // a course mate pushed too far stops coming back
    if (bumped.bond <= 0) {
      const gone: Character = {
        ...c,
        uniMates: c.uniMates.filter((m) => m.id !== id),
        stats: clampStats({ ...c.stats, happiness: c.stats.happiness - 2 }),
      };
      const goneEntry: LogEntry = {
        age: gone.age,
        year: gone.birthYear + gone.age,
        text: `${bumped.name} stops speaking to you.`,
        kind: 'event',
      };
      const final: Character = dropStrayAilments({ ...gone, log: [...gone.log, goneEntry] });
      persist(final, 'playing');
      set({
        character: final,
        section: null,
        notice: { title: 'Lost', eyebrow: cap(me.kind), text: goneEntry.text },
      });
      return;
    }

    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: def.text, eyebrow: bumped.name, text: fill(done.variant.notice) },
    });
  },

  befriendUniMate: (id) => {
    const { character } = get();
    if (!character || !character.alive) return;
    const me = uniOf(character).find((m) => m.id === id);
    if (!me) return;
    // already in the Circle: still in the course, nothing to add
    if (character.contacts.some((m) => m.id === id)) return;
    // a good relationship makes them far likelier to say yes
    const odds = 0.15 + me.bond / 130;
    const accepted = Math.random() < odds;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: accepted
        ? `You and ${me.name} are friends now.`
        : `You asked ${me.name} if you were friends. They said no.`,
      kind: 'event',
    };
    if (!accepted) {
      const c: Character = {
        ...character,
        stats: clampStats({ ...character.stats, happiness: character.stats.happiness - 3 }),
        log: [...character.log, entry],
      };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        notice: { title: 'Refused', eyebrow: me.name, text: 'They say they do not really know you.' },
      });
      return;
    }
    // into the Circle, bond and all — and still in the course
    const { isTeacher: _dropped, ...promoted } = me;
    const c: Character = {
      ...character,
      contacts: [
        ...character.contacts,
        { ...promoted, status: SCHOOL_FRIEND_STATUS, orientation: rollOrientation() },
      ],
      stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 5 }),
      log: [...character.log, entry],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'Friends', eyebrow: me.name, text: 'They say yes, and that is that.' },
    });
  },

  enrolUni: (degreeId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    const degree = degreeById(degreeId);
    if (!degree) return;
    if (!degreesFor(character.eraId, character.age).some((d) => d.id === degreeId)) return;
    if (character.age < 18 || character.schoolId !== null || character.uniId !== null) return;
    const cost = degreeCost(degree, character.eraId);
    if (character.money < cost) return;
    if (character.serving) {
      const uni = UNI_NAMES[character.eraId];
      set({
        section: null,
        notice: { title: degree.field, eyebrow: 'War', text: `${cap(uni)} will have to wait.` },
      });
      return;
    }
    const uni = UNI_NAMES[character.eraId];
    let c: Character = {
      ...character,
      money: character.money - cost,
      uniId: degree.id,
      uniYears: 0,
    };
    c = joinUni(c);
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: `You enrolled at ${uni} to read ${degree.field}.`,
      kind: 'event',
    };
    const enrolled: Character = { ...c, log: [...c.log, entry] };
    persist(enrolled, 'playing');
    set({
      character: enrolled,
      section: null,
      notice: { title: degree.field, eyebrow: uni, text: 'You are in.' },
    });
  },

  askForTuition: (memberId, degreeId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    const degree = degreeById(degreeId);
    if (!degree) return;
    if (!degreesFor(character.eraId, character.age).some((d) => d.id === degreeId)) return;
    if (character.age < 18 || character.schoolId !== null || character.uniId !== null) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: degree.field, eyebrow: 'War', text: 'There is a war on. That will have to wait.' },
      });
      return;
    }
    const idx = character.family.findIndex((m) => m.id === memberId);
    if (idx < 0) return;
    const me = character.family[idx];
    if (!askableRelatives(character).some((m) => m.id === memberId)) return;
    const ref = kinshipRef(me, character.family);
    const uni = UNI_NAMES[character.eraId];
    const wealth = character.familyWealth ?? 50;
    // paying again is a long shot; the first ask is the real one
    const again = (character.askedTuition ?? []).includes(memberId);
    const odds = Math.min(
      0.9,
      pocketMoneyChance(me.bond) *
        pocketChanceFactor(wealth, character.destitute ?? false) *
        (again ? 0.1 : 1),
    );
    const gave = odds > 0 && Math.random() < odds;
    const askedTuition = again
      ? character.askedTuition
      : [...(character.askedTuition ?? []), memberId];
    if (!gave) {
      const entry: LogEntry = {
        age: character.age,
        year: character.birthYear + character.age,
        text: `You asked ${ref} for tuition and were refused.`,
        kind: 'event',
      };
      const c: Character = {
        ...character,
        askedTuition,
        stats: clampStats({ ...character.stats, happiness: character.stats.happiness - 4 }),
        log: [...character.log, entry],
      };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        notice: { title: 'Refused', eyebrow: cap(ref), text: 'They say there is none to spare, and they do not look at you.' },
      });
      return;
    }
    let c: Character = {
      ...character,
      askedTuition,
      uniId: degree.id,
      uniYears: 0,
      stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 3 }),
    };
    c = joinUni(c);
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: `You enrolled at ${uni} to read ${degree.field}. ${cap(ref)} is paying.`,
      kind: 'event',
    };
    const enrolled: Character = { ...c, log: [...c.log, entry] };
    persist(enrolled, 'playing');
    set({
      character: enrolled,
      section: null,
      notice: { title: degree.field, eyebrow: cap(ref), text: 'They pay the tuition without a word about it.' },
    });
  },

  studyUni: () => {
    const { character } = get();
    if (!character || !character.alive || !character.uniId) return;
    if (get().activeEvent) return;
    const uni = UNI_NAMES[character.eraId];
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Study', eyebrow: 'War', text: 'There is a war on. That will have to wait.' },
      });
      return;
    }
    const cap = studyCap(Math.min(character.stats.health, character.stats.energy ?? 70));
    const gain = character.studiesThisYear < cap;
    // work and study at once wears you down faster, in body and mood
    const double = !!character.jobId;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: gain
        ? `You studied late at ${uni}.`
        : `You pushed through more study at ${uni} and felt it.`,
      kind: 'event',
    };
    const c: Character = {
      ...character,
      stats: clampStats({
        ...character.stats,
        smarts: character.stats.smarts + (gain ? 5 : 1),
        health: character.stats.health - (gain ? 0 : 1) - (double ? 1 : 0),
        energy: (character.stats.energy ?? 70) - (gain ? 2 : 6) - (double ? 2 : 0),
        happiness: character.stats.happiness - (double ? 3 : 0),
      }),
      performance: clampPerformance(character.performance + (gain ? 12 : 3)),
      studiesThisYear: character.studiesThisYear + 1,
      log: [...character.log, entry],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: 'Study',
        eyebrow: uni,
        text: gain
          ? 'You read until the light faded.'
          : 'Your eyes give out before you do. You are running on empty.',
      },
    });
  },

  quitUni: () => {
    const { character } = get();
    if (!character || !character.alive || !character.uniId) return;
    const uni = UNI_NAMES[character.eraId];
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: `You left ${uni}.`,
      kind: 'event',
    };
    const c: Character = {
      ...character,
      uniId: null,
      uniYears: 0,
      uniFor: null,
      uniMates: [],
      log: [...character.log, entry],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'Left', eyebrow: uni, text: 'You leave your studies behind.' },
    });
  },

  askForMoney: (memberId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (!canAskForMoney(character)) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const idx = character.family.findIndex((m) => m.id === memberId);
    if (idx < 0) return;
    const me = character.family[idx];
    if (!askableRelatives(character).some((m) => m.id === memberId)) return;
    const era = getEra(character.eraId);
    const ref = kinshipRef(me, character.family);
    const odds = askChance(character, me);
    const gave = odds > 0 && Math.random() < odds;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: gave
        ? `${cap(ref)} gave you pocket money.`
        : `You asked ${ref} for money and were refused.`,
      kind: 'event',
    };
    const amount = gave
      ? pocketMoneyAmount(me.bond, era.moneyScale, character.familyWealth ?? 50, character.destitute ?? false)
      : 0;
    const c: Character = {
      ...character,
      money: character.money + amount,
      askedThisYear: [...character.askedThisYear, memberId],
      stats: clampStats({
        ...character.stats,
        happiness: character.stats.happiness + (gave ? 3 : -4),
      }),
      log: [...character.log, entry],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: gave ? 'Given' : 'Refused',
        eyebrow: cap(ref),
        text: gave
          ? `They hand you ${formatFunds(amount, moneySymbolOf(character))} without a word about it.`
          : 'They say there is none to spare, and they do not look at you.',
      },
    });
  },

  setOrientation: (orientation) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (!canChooseOrientation(character)) return;
    if (orientation !== 'straight' && orientation !== 'gay' && orientation !== 'bisexual') return;
    if (character.orientation === orientation) return;
    const c: Character = { ...character, orientation };
    persist(c, 'playing');
    set({ character: c });
  },

  setGender: (gender) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (!canChooseGender(character)) return;
    if (gender !== 'Male' && gender !== 'Female') return;
    if (character.gender === gender) return;
    const c: Character = { ...character, gender };
    persist(c, 'playing');
    set({ character: c });
  },

  flirt: (contactId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const idx = character.contacts.findIndex((m) => m.id === contactId);
    if (idx < 0) return;
    const me = character.contacts[idx];
    if (!canFlirtWith(character, me)) return;
    if (character.flirtedThisYear.includes(contactId)) {
      set({
        section: null,
        notice: { title: 'Flirted', text: 'You already tried that this year.' },
      });
      return;
    }

    // a partner is into you by definition; a friend depends on their
    // tastes — the bisexual ones could go either way. And even when
    // they could be into you, closeness decides whether it lands.
    const theirs = me.orientation ?? 'straight';
    let attracted = me.kind === 'partner';
    if (!attracted) {
      if (theirs === 'bisexual') attracted = Math.random() < 0.5;
      else if (theirs === 'gay') attracted = character.gender === me.gender;
      else attracted = character.gender !== me.gender;
    }
    const intoYou =
      me.kind === 'partner' ||
      (attracted && Math.random() < Math.min(0.9, 0.35 + me.bond / 200));
    const delta = intoYou
      ? Math.round(20 + me.bond / 5)
      : -Math.round(20 + (100 - me.bond) / 5);
    const moved: Contact = {
      ...me,
      bond: Math.max(0, Math.min(100, me.bond + delta)),
    };
    const contacts = [...character.contacts];
    contacts[idx] = moved;
    const ref = contactRef(me);
    const flirtLines =
      me.kind === 'partner'
        ? [
            `You flirted with ${ref}.`,
            `You made ${ref} laugh like before.`,
            `You and ${ref} shared a look that lingered.`,
          ]
        : intoYou
          ? [
              `You flirted with ${ref}, and they flirted back.`,
              `You made ${ref} laugh, and it meant something.`,
              `You and ${ref} shared a look that lingered.`,
            ]
          : [
              `You tried it on with ${ref}, and it fell flat.`,
              `You flirted with ${ref}, and they looked away.`,
              `You overplayed it with ${ref}.`,
            ];
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: flirtLines[Math.floor(Math.random() * flirtLines.length)],
      kind: 'event',
    };
    // flirting around behind a lover's back can get back to them.
    // a spouse hears less often, and takes it better
    let extras: LogEntry[] = [];
    let strained = contacts;
    const jealous: ActiveEvent[] = [];
    const others = me.kind === 'friend'
      ? character.contacts.filter(
        (m) => m.kind === 'partner' && m.id !== contactId,
      )
      : [];
    const softened = others.some((m) => m.married);
    if (me.kind === 'friend' && Math.random() < (softened ? 0.15 : 0.5)) {
      strained = contacts.map((m) =>
        m.kind === 'partner' && m.id !== contactId
          ? { ...m, bond: Math.max(0, Math.min(100, m.bond - (softened ? 3 : 8))) }
          : m,
      );
      extras = others.map(
        (m) =>
          ({
            age: character.age,
            year: character.birthYear + character.age,
            text: `Word of it got back to ${m.name}.`,
            kind: 'event',
          }) as LogEntry,
      );
      for (const m of others) {
        jealous.push(
          infoEvent(
            `flirt-jealous-${m.id}`,
            'Noticed',
            `Word of it got back to ${m.name}.`,
          ),
        );
      }
    }
    const c: Character = {
      ...character,
      contacts: strained,
      flirtedThisYear: [...character.flirtedThisYear, contactId],
      stats: clampStats({
        ...character.stats,
        happiness: character.stats.happiness + (intoYou ? 6 : -6),
      }),
      log: [...character.log, entry, ...extras],
    };
    if (moved.bond <= 0 && me.kind !== 'partner') {
      const penalty = bondLossPenalty(me);
      const gone: Character = {
        ...c,
        contacts: c.contacts.filter((_, i) => i !== idx),
        stats: clampStats({ ...c.stats, happiness: c.stats.happiness - penalty }),
      };
      const goneEntry: LogEntry = {
        age: gone.age,
        year: gone.birthYear + gone.age,
        text: partingLine(me.name, me.kind),
        kind: 'event',
      };
      const final: Character = dropStrayAilments({ ...gone, log: [...gone.log, goneEntry] });
      persist(final, 'playing');
      set({
        character: final,
        section: null,
        notice: { title: 'Lost', eyebrow: cap(me.kind), text: goneEntry.text },
        pending: jealous,
      });
      return;
    }
    // a lover at nothing does not go quietly: they say so, to your face
    if (moved.bond <= 0) {
      const era = getEra(c.eraId);
      const staged = stageEvent(c, leaveEvent(moved), era.moneyScale);
      persist(staged.character, 'playing');
      set({
        character: staged.character,
        section: null,
        notice: null,
        activeEvent: staged.activeEvent,
        mustChoose: staged.activeEvent.event.choices.length > 0,
      });
      return;
    }
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: 'Flirted',
        eyebrow: contactRef(moved),
        text:
          me.kind === 'partner'
            ? 'Some things do not wear out.'
            : intoYou
              ? 'They laugh in a way that answers the question.'
              : 'The temperature of the room changes.',
      },
      pending: jealous,
    });
  },

  askOut: (contactId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const idx = character.contacts.findIndex((m) => m.id === contactId);
    if (idx < 0) return;
    const me = character.contacts[idx];
    if (!canAskOut(character, me)) return;
    if (character.askedOutThisYear.includes(contactId)) {
      set({
        section: null,
        notice: { title: 'Ask', text: 'You already asked this year.' },
      });
      return;
    }

    // whether they are into you, decided the same way as a flirt
    const theirs = me.orientation ?? 'straight';
    let intoYou: boolean;
    if (theirs === 'bisexual') intoYou = Math.random() < 0.5;
    else if (theirs === 'gay') intoYou = character.gender === me.gender;
    else intoYou = character.gender !== me.gender;
    // closeness carries it, and so does having flirted already
    const warmed = character.flirtedThisYear.includes(contactId);
    const chance = !intoYou
      ? 0.05
      : Math.min(0.95, 0.15 + me.bond / 150 + (warmed ? 0.25 : 0));
    const spouses = character.contacts.filter(
      (m) => m.kind === 'partner' && m.married && m.id !== contactId,
    );
    let yes = Math.random() < chance;
    // married and willing: most want no part of it
    let marriedNo = false;
    if (yes && spouses.length > 0 && Math.random() < 0.6) {
      yes = false;
      marriedNo = true;
    }

    const askLines = yes
      ? [
          `You asked ${me.name} to be yours, and they said yes.`,
          `You asked, and ${me.name} said yes.`,
        ]
      : [
          `You asked ${me.name} to be yours, and they said no.`,
          `You asked, and ${me.name} said no.`,
        ];
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: askLines[Math.floor(Math.random() * askLines.length)],
      kind: 'event',
    };
    const kept: Contact =
      yes && spouses.length === 0
        ? { ...me, kind: 'partner' }
        : !yes
          ? { ...me, bond: Math.max(0, Math.min(100, me.bond - 30)) }
          : me;
    const contacts = [...character.contacts];
    contacts[idx] = kept;
    let c: Character = {
      ...character,
      contacts,
      askedOutThisYear: [...character.askedOutThisYear, contactId],
      stats: clampStats({
        ...character.stats,
        happiness: character.stats.happiness + (yes ? 8 : -6),
      }),
      log: [...character.log, entry],
    };
    // a no can end it on the spot
    if (!yes && Math.random() < 0.1) {
      c.contacts[idx] = { ...kept, bond: 0 };
    }
    // the answer comes first; what it costs queues behind it
    const queue: ActiveEvent[] = [
      infoEvent(
        `ask-${yes ? 'together' : 'rejected'}-${contactId}`,
        yes ? 'Together' : 'Rejected',
        yes
          ? 'They have been waiting for you to ask.'
          : marriedNo
            ? 'They want no part of a married life.'
            : 'They look away, and that is the answer.',
      ),
    ];
    let contactsNow = c.contacts;
    let penalty = 0;
    const extras: LogEntry[] = [];
    const gone =
      !yes && contactsNow[idx].bond <= 0
        ? ([
            {
              age: character.age,
              year: character.birthYear + character.age,
              text: partingLine(me.name, me.kind),
              kind: 'event',
            } as LogEntry,
          ])
        : [];
    if (gone.length > 0) {
      penalty = bondLossPenalty(me);
      contactsNow = contactsNow.filter((_, i) => i !== idx);
      queue.push(infoEvent(`ask-gone-${contactId}`, 'Lost', gone[0].text));
    }
    // asking someone new ends what you had — one lover, no more.
    // a promised answer waits on the spouse first, so nothing ends yet
    const dumped = yes && spouses.length > 0
      ? []
      : contactsNow.filter(
        (m) => m.kind === 'partner' && !m.married && !(yes && m.id === contactId),
      );
    for (const d of dumped) {
      const line: LogEntry = {
        age: character.age,
        year: character.birthYear + character.age,
        text: partingLine(d.name, d.kind),
        kind: 'event',
      };
      extras.push(line);
      queue.push(infoEvent(`ask-dumped-${d.id}`, 'Lost', line.text));
    }
    // a willing answer behind a marriage goes through the spouse first
    if (yes && spouses.length > 0) {
      const staged = stageEvent(
        c,
        confrontEvent(spouses[0]!, me),
        getEra(character.eraId).moneyScale,
      );
      queue.splice(0, queue.length, staged.activeEvent);
      contactsNow = staged.character.contacts;
    }
    contactsNow = contactsNow.filter(
      (m) => m.kind !== 'partner' || !dumped.some((h) => h.id === m.id),
    );
    const fin: Character = dropStrayAilments({
      ...c,
      contacts: contactsNow,
      stats: clampStats({
        ...c.stats,
        happiness: c.stats.happiness - penalty,
      }),
      log: [...c.log, ...gone, ...extras],
    });
    persist(fin, 'playing');
    set({
      character: fin,
      section: null,
      notice: null,
      activeEvent: queue[0],
      mustChoose: queue[0].event.choices.length > 0,
      pending: queue.slice(1),
    });
  },

  breakUp: (contactId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    const me = character.contacts.find((m) => m.id === contactId);
    if (!me || me.kind !== 'partner') return;
    // sometimes they ask you not to — a spouse, more often
    if (Math.random() < (me.married ? 0.4 : 0.25)) {
      const era = getEra(character.eraId);
      const staged = stageEvent(
        character,
        begsEvent(me),
        era.moneyScale,
      );
      persist(staged.character, 'playing');
      set({
        character: staged.character,
        section: null,
        notice: null,
        activeEvent: staged.activeEvent,
        mustChoose: staged.activeEvent.event.choices.length > 0,
      });
      return;
    }
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: me.married ? `You divorced ${me.name}.` : `You broke up with ${me.name}.`,
      kind: 'event',
    };
    const c: Character = sweepResidents({
      ...character,
      contacts: character.contacts.filter((m) => m.id !== contactId),
      log: [...character.log, entry],
    });
    const cleaned = dropStrayAilments(c);
    persist(cleaned, 'playing');
    set({
      character: cleaned,
      section: null,
      notice: { title: 'Over', eyebrow: contactRef(me), text: entry.text },
    });
  },

  takeDate: (contactId, durationId, placeId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const me = character.contacts.find((m) => m.id === contactId);
    if (!me || me.kind !== 'partner') return;
    if (!canFlirtWith(character, me)) return;
    if (character.datedThisYear.includes(contactId)) {
      set({
        section: null,
        notice: { title: 'Date', text: 'You already took them out this year.' },
      });
      return;
    }
    const duration = WALK_DURATIONS.find((d) => d.id === durationId);
    const place = WALK_PLACES.find((p) => p.id === placeId);
    if (!duration || !place) return;
    if (!walkPlacesFor(character).some((p) => p.id === placeId)) return;

    // a bad patch of it and they may not feel like going out
    const refusal =
      me.bond < 30 ? Math.max(0, 0.5 - me.bond / 60) : 0;
    if (Math.random() < refusal) {
      const entry: LogEntry = {
        age: character.age,
        year: character.birthYear + character.age,
        text: 'You asked your lover out and they stayed home.',
        kind: 'event',
      };
      const c: Character = {
        ...character,
        log: [...character.log, entry],
      };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        notice: {
          title: 'No',
          eyebrow: contactRef(me),
          text: "They don't feel like going out.",
        },
      });
      return;
    }
    const boost = Math.round(25 * duration.scale);
    const moved: Contact = {
      ...me,
      bond: Math.max(0, Math.min(100, me.bond + boost)),
    };
    const placeText =
      place.text.charAt(0).toLowerCase() + place.text.slice(1);
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: `You took your lover out to ${placeText}.`,
      kind: 'event',
    };
    const c: Character = {
      ...character,
      contacts: character.contacts.map((m) => (m.id === contactId ? moved : m)),
      datedThisYear: [...character.datedThisYear, contactId],
      log: [...character.log, entry],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: 'Date',
        eyebrow: contactRef(moved),
        text: 'You come home closer than you went out.',
      },
    });
  },

  makeLove: (contactId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (!canActSocially(character)) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const idx = character.contacts.findIndex((m) => m.id === contactId);
    if (idx < 0) return;
    const me = character.contacts[idx];
    if (!canMakeLove(character, me)) return;
    if ((character.intimateThisYear ?? []).includes(contactId)) {
      set({
        section: null,
        notice: { title: 'Love', text: 'Not now — there will be other nights.' },
      });
      return;
    }
    const era = getEra(character.eraId);
    const moved = applyBond(me, 6);
    const contacts = [...character.contacts];
    contacts[idx] = moved;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: `You lay with ${me.name}.`,
      kind: 'event',
    };
    const c: Character = {
      ...character,
      contacts,
      intimateThisYear: [...(character.intimateThisYear ?? []), contactId],
      stats: clampStats({
        ...character.stats,
        happiness: character.stats.happiness + 3,
        energy: (character.stats.energy ?? 70) - 2,
      }),
      log: [...character.log, entry],
    };
    // sometimes a baby comes of it: the decision follows at once
    const carrier = carrierOf(character, me);
    if (carrier && Math.random() < CONCEPTION_CHANCE) {
      const staged = stageEvent(
        c,
        pregnancyDecisionEvent(me, carrier === 'player', character.eraId),
        era.moneyScale,
      );
      const forced = staged.activeEvent.event.choices.length === 0;
      persist(staged.character, 'playing');
      set({
        character: forced
          ? {
            ...staged.character,
            pregnancy: { partnerId: me.id, playerCarries: true, dueAge: character.age + 1 },
          }
          : staged.character,
        section: null,
        notice: null,
        activeEvent: staged.activeEvent,
        mustChoose: staged.activeEvent.event.choices.length > 0,
      });
      return;
    }
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: 'Love',
        eyebrow: contactRef(moved),
        text: 'Afterwards you sleep well.',
      },
    });
  },

  propose: (contactId, itemId, placeId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (character.age < 18) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const idx = character.contacts.findIndex((m) => m.id === contactId);
    if (idx < 0) return;
    const me = character.contacts[idx];
    if (me.kind !== 'partner' || me.engaged || me.married) return;
    const item = itemById(itemId);
    if (!item?.ring) return;
    const belongings = [...(character.belongings ?? [])];
    const ridx = belongings.indexOf(itemId);
    if (ridx < 0) return;
    const place = WALK_PLACES.find((p) => p.id === placeId);
    if (!place || !walkPlacesFor(character).some((p) => p.id === placeId)) return;
    const where = place.text.charAt(0).toLowerCase() + place.text.slice(1);
    const he = cap(pronoun(me.gender, 'subj'));
    const chance = Math.min(0.95, 0.25 + me.bond / 200 + ringBonus(item));
    const yes = Math.random() < chance;
    if (yes) {
      belongings.splice(ridx, 1);
      const moved: Contact = {
        ...applyBond(me, 20),
        engaged: true,
        proposalRefusals: 0,
      };
      const contacts = [...character.contacts];
      contacts[idx] = moved;
      const c: Character = {
        ...character,
        contacts,
        belongings,
        stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 8 }),
        log: [
          ...character.log,
          {
            age: character.age,
            year: character.birthYear + character.age,
            text: `You proposed to ${me.name} at ${where}. ${he} said yes.`,
            kind: 'event',
          } as LogEntry,
        ],
      };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        notice: { title: 'Engaged', eyebrow: contactRef(moved), text: `${he} said yes.` },
      });
      return;
    }
    const refusals = (me.proposalRefusals ?? 0) + 1;
    const moved = { ...applyBond(me, -15), proposalRefusals: refusals };
    const contacts = [...character.contacts];
    contacts[idx] = moved;
    const c: Character = {
      ...character,
      contacts,
      stats: clampStats({ ...character.stats, happiness: character.stats.happiness - 6 }),
      log: [
        ...character.log,
        {
          age: character.age,
          year: character.birthYear + character.age,
          text: `You proposed to ${me.name} at ${where}. ${he} said no.`,
          kind: 'event',
        } as LogEntry,
      ],
    };
    // a second no breaks far more often than the first
    if (Math.random() < (refusals <= 1 ? 0.1 : 0.4)) {
      const penalty = bondLossPenalty(me);
      const gone: Character = {
        ...c,
        contacts: c.contacts.filter((_, i) => i !== idx),
        stats: clampStats({ ...c.stats, happiness: c.stats.happiness - penalty }),
      };
      const final: Character = dropStrayAilments({ ...gone, log: [...gone.log, { age: gone.age, year: gone.birthYear + gone.age, text: partingLine(me.name, me.kind), kind: 'event' } as LogEntry] });
      persist(final, 'playing');
      set({
        character: final,
        section: null,
        notice: { title: 'Lost', eyebrow: contactRef(me), text: partingLine(me.name, me.kind) },
      });
      return;
    }
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'Refused', eyebrow: contactRef(moved), text: `${he} said no.` },
    });
  },

  marry: (contactId, venueId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (character.age < 18) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const idx = character.contacts.findIndex((m) => m.id === contactId);
    if (idx < 0) return;
    const me = character.contacts[idx];
    if (me.kind !== 'partner' || !me.engaged || me.married) return;
    const venue = WEDDING_VENUES.find((v) => v.id === venueId);
    if (!venue || !venuesFor(character).some((v) => v.id === venueId)) return;
    const cost = venueCost(venue, character);
    if (character.money < cost) return;
    const moved: Contact = { ...applyBond(me, 10), married: true };
    const contacts = [...character.contacts];
    contacts[idx] = moved;
    const at = venue.text.toLowerCase();
    const c: Character = {
      ...character,
      contacts,
      money: character.money - cost,
      stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 10 }),
      log: [
        ...character.log,
        {
          age: character.age,
          year: character.birthYear + character.age,
          text: `You married ${me.name} at the ${at}.`,
          kind: 'event',
        } as LogEntry,
      ],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'Married', eyebrow: contactRef(moved), text: `Married at the ${at}.` },
    });
  },

  classmates: () => {
    const { character } = get();
    if (!character || !character.alive) return [];
    // the roster is drawn on enrolment and kept across terms
    return classOf(character);
  },

  interactClassmate: (id, action) => {
    const { character } = get();
    if (!character || !character.alive) return;
    const idx = classOf(character).findIndex((m) => m.id === id);
    if (idx < 0) return;
    const me = classOf(character)[idx];
    const def = actionDef('friend', action);
    if (!def || def.endsIt || def.asksForAmount || def.asksForName) return;
    const era = getEra(character.eraId);
    if (!canAfford(def, character.money, era.moneyScale)) return;
    const done = resolveAction(def, Math.random, 'school');
    const bumped: Classmate = { ...me, bond: clampPerformance(me.bond + done.bond) };
    // classmates are not friends until befriended, and the teacher
    // never is — so the journal names them plainly, never as a friend
    const classmateName = bumped.isTeacher
      ? `your teacher ${bumped.name}`
      : bumped.name;
    const fill = (t: string): string =>
      fillVariant(t, bumped, {
        name: classmateName,
        trade: bumped.status,
      });
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: fill(done.variant.journal),
      kind: 'event',
    };
    const c: Character = {
      ...character,
      classmates: character.classmates.map((m) => (m.id === id ? bumped : m)),
      money: character.money + Math.round(def.cost * era.moneyScale),
      stats: clampStats({
        ...character.stats,
        happiness: character.stats.happiness + (done.stats.happiness ?? 0),
        health: character.stats.health + (done.stats.health ?? 0),
        energy: (character.stats.energy ?? 70) + (done.stats.energy ?? 0),
        reputation: (character.stats.reputation ?? 50) + (done.stats.reputation ?? 0),
      }),
      log: [...character.log, entry],
    };

    // A classmate pushed too far stops coming back
    if (bumped.bond <= 0) {
      const gone: Character = {
        ...c,
        classmates: c.classmates.filter((m) => m.id !== id),
        stats: clampStats({ ...c.stats, happiness: c.stats.happiness - 2 }),
      };
      const goneEntry: LogEntry = {
        age: gone.age,
        year: gone.birthYear + gone.age,
        text: `${bumped.name} stops speaking to you.`,
        kind: 'event',
      };
      const final: Character = dropStrayAilments({ ...gone, log: [...gone.log, goneEntry] });
      persist(final, 'playing');
      set({
        character: final,
        section: null,
        notice: { title: 'Lost', eyebrow: cap(me.kind), text: goneEntry.text },
      });
      return;
    }

    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: def.text, eyebrow: bumped.name, text: fill(done.variant.notice) },
    });
  },

  befriendClassmate: (id) => {
    const { character } = get();
    if (!character || !character.alive) return;
    const me = classOf(character).find((m) => m.id === id);
    if (!me) return;
    // already in the Circle: still in the class, nothing to add
    if (character.contacts.some((m) => m.id === id)) return;
    // a good relationship makes them far likelier to say yes
    const odds = 0.15 + me.bond / 130;
    const accepted = Math.random() < odds;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: accepted
        ? `You and ${me.name} are friends now.`
        : `You asked ${me.name} if you were friends. They said no.`,
      kind: 'event',
    };
    if (!accepted) {
      const c: Character = {
        ...character,
        stats: clampStats({ ...character.stats, happiness: character.stats.happiness - 3 }),
        log: [...character.log, entry],
      };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        notice: { title: 'Refused', eyebrow: me.name, text: 'They say they do not really know you.' },
      });
      return;
    }
    // into the Circle, bond and all — and still in the class
    const { isTeacher: _dropped, ...promoted } = me;
    const c: Character = {
      ...character,
      contacts: [
        ...character.contacts,
        { ...promoted, status: SCHOOL_FRIEND_STATUS, orientation: rollOrientation() },
      ],
      stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 5 }),
      log: [...character.log, entry],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'Friends', eyebrow: me.name, text: 'They say yes, and that is that.' },
    });
  },

  coworkers: () => {
    const { character } = get();
    if (!character) return [];
    return crewOf(character);
  },

  interactCrew: (id, action) => {
    const { character } = get();
    if (!character || !character.alive) return;
    const idx = crewOf(character).findIndex((m) => m.id === id);
    if (idx < 0) return;
    const me = crewOf(character)[idx];
    const def = actionDef('friend', action);
    if (!def || def.endsIt || def.asksForAmount || def.asksForName) return;
    const era = getEra(character.eraId);
    if (!canAfford(def, character.money, era.moneyScale)) return;
    const done = resolveAction(def, Math.random, 'person');
    const bumped: Coworker = { ...me, bond: clampPerformance(me.bond + done.bond) };
    const fill = (t: string): string =>
      fillVariant(t, bumped, {
        name: bumped.name,
        trade: bumped.role,
      });
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: fill(done.variant.journal),
      kind: 'event',
    };
    const coworkers = [...character.coworkers];
    const ci = coworkers.findIndex((m) => m.id === id);
    if (ci >= 0) coworkers[ci] = bumped;
    const c: Character = {
      ...character,
      coworkers,
      money: character.money + Math.round(def.cost * era.moneyScale),
      stats: clampStats({
        ...character.stats,
        happiness: character.stats.happiness + (done.stats.happiness ?? 0),
        health: character.stats.health + (done.stats.health ?? 0),
        energy: (character.stats.energy ?? 70) + (done.stats.energy ?? 0),
        reputation: (character.stats.reputation ?? 50) + (done.stats.reputation ?? 0),
      }),
      log: [...character.log, entry],
    };

    // a coworker pushed too far stops coming back
    if (bumped.bond <= 0) {
      const gone: Character = {
        ...c,
        coworkers: c.coworkers.filter((m) => m.id !== id),
        stats: clampStats({ ...c.stats, happiness: c.stats.happiness - 2 }),
      };
      const goneEntry: LogEntry = {
        age: gone.age,
        year: gone.birthYear + gone.age,
        text: `${bumped.name} stops speaking to you.`,
        kind: 'event',
      };
      const final: Character = dropStrayAilments({ ...gone, log: [...gone.log, goneEntry] });
      persist(final, 'playing');
      set({
        character: final,
        section: null,
        notice: { title: 'Lost', eyebrow: 'Friend', text: goneEntry.text },
      });
      return;
    }

    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: def.text, eyebrow: bumped.name, text: fill(done.variant.notice) },
    });
  },

  befriendCrew: (id) => {
    const { character } = get();
    if (!character || !character.alive) return;
    // the unit stays in the army list, never the Circle
    if (character.serving) return;
    const me = crewOf(character).find((m) => m.id === id);
    if (!me) return;
    if (character.contacts.some((m) => m.id === id)) return;
    const odds = 0.15 + me.bond / 130;
    const accepted = Math.random() < odds;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: accepted
        ? `You and ${me.name} are friends now.`
        : `You asked ${me.name} if you were friends. They said no.`,
      kind: 'event',
    };
    if (!accepted) {
      const c: Character = {
        ...character,
        stats: clampStats({ ...character.stats, happiness: character.stats.happiness - 3 }),
        log: [...character.log, entry],
      };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        notice: { title: 'Refused', eyebrow: me.name, text: 'They say they do not really know you.' },
      });
      return;
    }
    const c: Character = {
      ...character,
      contacts: [
        ...character.contacts,
        {
          id: me.id,
          name: me.name,
          kind: 'friend',
          status: 'a friend from work',
          gender: me.gender,
          orientation: rollOrientation(),
          trade: me.role,
          ageAtMeeting: character.age,
          petName: null,
          bond: me.bond,
          yearsKnown: 0,
        },
      ],
      stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 5 }),
      log: [...character.log, entry],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'Friends', eyebrow: me.name, text: 'They say yes, and that is that.' },
    });
  },

  askRaise: () => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (!character.jobId) return;
    const boss = crewOf(character).find((m) => m.isBoss);
    if (!boss) return;
    if (character.bossAskedThisYear.includes('raise')) {
      set({
        section: null,
        notice: { title: 'Raise', text: 'Not this year.' },
      });
      return;
    }
    const chance = Math.min(
      0.9,
      0.35 + character.performance / 250 + boss.bond / 250,
    );
    const raise = Math.random() < chance;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: raise
        ? 'You asked for a raise and got one.'
        : 'You asked for a raise and were refused.',
      kind: 'event',
    };
    const c: Character = {
      ...character,
      jobRaises: character.jobRaises + (raise ? 1 : 0),
      bossAskedThisYear: [...character.bossAskedThisYear, 'raise'],
      log: [...character.log, entry],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: 'Raise',
        text: raise
          ? `You now earn ${formatFunds(monthlyWage(c, getEra(c.eraId).moneyScale), moneySymbolOf(c))} a month.`
          : 'They say the budget is what it is.',
      },
    });
  },

  askPromotion: () => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (!character.jobId) return;
    const boss = crewOf(character).find((m) => m.isBoss);
    if (!boss) return;
    if (character.bossAskedThisYear.includes('promotion')) {
      set({
        section: null,
        notice: { title: 'Promotion', text: 'Not this year.' },
      });
      return;
    }
    const next = nextJob(character.eraId, character.jobId);
    if (!next || character.stats.smarts < next.smartsRequired) {
      set({
        section: null,
        notice: { title: 'Promotion', text: 'You are not ready for the next post.' },
      });
      return;
    }
    if (next.requiresVehicle && !ownsVehicle(character)) {
      set({
        section: null,
        notice: { title: 'Promotion', text: 'The next post needs its own transport.' },
      });
      return;
    }
    const chance = Math.min(
      0.75,
      0.2 + character.performance / 300 + boss.bond / 300,
    );
    const promoted = Math.random() < chance;
    if (promoted) {
      const c: Character = {
        ...character,
        jobId: next.id,
        jobYears: 0,
        jobRaises: character.jobRaises + 1,
        performance: NEW_POST_STANDING,
        bossAskedThisYear: [...character.bossAskedThisYear, 'promotion'],
      };
      Object.assign(c, syncCrew(c));
      const entry: LogEntry = {
        age: c.age,
        year: c.birthYear + c.age,
        text: `You were promoted to ${next.title}.`,
        kind: 'event',
      };
      const fin: Character = { ...c, log: [...c.log, entry] };
      persist(fin, 'playing');
      set({
        character: fin,
        section: null,
        notice: {
          title: 'Promoted',
          text: `You now earn ${formatFunds(monthlyWage(fin, getEra(fin.eraId).moneyScale), moneySymbolOf(fin))} a month.`,
        },
      });
      return;
    }
    // it backfires: a bad patch of work can cost the post itself
    const demote = character.performance < 40;
    const prev = demote ? prevJob(character.eraId, character.jobId) : null;
    const target = prev ? prev.id : character.jobId;
    const c: Character = {
      ...character,
      jobId: target,
      jobYears: 0,
      jobRaises: target === character.jobId ? Math.max(0, character.jobRaises - 1) : character.jobRaises,
      performance: target === character.jobId ? character.performance : NEW_POST_STANDING,
      bossAskedThisYear: [...character.bossAskedThisYear, 'promotion'],
    };
    Object.assign(c, syncCrew(c));
    const demoted = target !== character.jobId;
    const entry: LogEntry = {
      age: c.age,
      year: c.birthYear + c.age,
      text: demoted
        ? `You were demoted to ${jobById(c.eraId, target)?.title ?? 'a lower post'}.`
        : 'Your pay was cut.',
      kind: 'event',
    };
    const fin: Character = { ...c, log: [...c.log, entry] };
    persist(fin, 'playing');
    set({
      character: fin,
      section: null,
      notice: {
        title: demoted ? 'Demoted' : 'Pay cut',
        text: demoted ? entry.text : 'The same hours for less.',
      },
    });
  },

  namePet: (contactId, name) => {
    const { character } = get();
    if (!character || !character.alive) return;
    const idx = character.contacts.findIndex((m) => m.id === contactId);
    if (idx < 0) return;
    const me = character.contacts[idx];
    if (me.kind !== 'pet') return;
    const chosen = name.trim();
    if (!chosen) return;
    const capped = chosen.slice(0, 24);
    const contacts = [...character.contacts];
    contacts[idx] = { ...me, petName: cap(capped) };
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: `You named ${me.name} ${cap(capped)}.`,
      kind: 'event',
    };
    const c: Character = { ...character, contacts, log: [...character.log, entry] };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'Named', eyebrow: cap(capped), text: `It turns at the name, and comes to you.` },
    });
  },

  nameChild: (childId, firstName, lastName) => {
    const { character } = get();
    if (!character || !character.alive) return;
    const idx = (character.children ?? []).findIndex((k) => k.id === childId);
    if (idx < 0) return;
    const ch = character.children[idx];
    const first = firstName.trim().slice(0, 24);
    const last = lastName.trim().slice(0, 24);
    if (!first && !last) return;
    const renamed = {
      ...ch,
      firstName: first ? cap(first) : ch.firstName,
      lastName: last ? cap(last) : ch.lastName,
    };
    const children = [...character.children];
    children[idx] = renamed;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: `You named your ${renamed.gender === 'Female' ? 'daughter' : 'son'} ${renamed.firstName} ${renamed.lastName}.`,
      kind: 'event',
    };
    const c: Character = { ...character, children, log: [...character.log, entry] };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'Named', eyebrow: `${renamed.firstName} ${renamed.lastName}`, text: `A name they will carry.` },
    });
  },

  commitCrime: (crimeId) => {
    const { character, activeEvent } = get();
    if (!character || !character.alive) return;
    if (activeEvent && activeEvent.event.id !== crimeId) return;
    const crime = CRIMES.find((k) => k.id === crimeId);
    if (!crime) return;
    const era = getEra(character.eraId);
    const odds = crimeOdds(crime, character);
    const gotAway = Math.random() < odds;
    const attemptText =
      activeEvent?.event.choices.find((c) => c.id === 'do-it')?.effects?.journal ??
      (crimeId === 'crime-pickpocket'
        ? 'You went for the purse.'
        : crimeId === 'crime-burglary'
        ? 'You forced the lock on an empty house.'
        : crimeId === 'crime-smuggle'
        ? 'You took the cart past the watch.'
        : crimeId === 'crime-duel'
        ? 'You called them out over the insult.'
        : `You went for the ${crime.title.toLowerCase()}.`);
    const attemptEntry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: attemptText,
      kind: 'choice',
    };
    if (gotAway) {
      const pay = Math.round(crime.pay * era.moneyScale);
      const entry: LogEntry = {
        age: character.age,
        year: character.birthYear + character.age,
        text: `You got away with the ${crime.title.toLowerCase()}.`,
        kind: 'event',
      };
      const c: Character = {
        ...character,
        money: character.money + pay,
        stats: clampStats({
          ...character.stats,
          happiness: character.stats.happiness + 2,
          energy: (character.stats.energy ?? 70) - 2,
        }),
        flags: character.flags.includes('light-fingers')
          ? character.flags
          : [...character.flags, 'light-fingers'],
        log: [...character.log, attemptEntry, entry],
      };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        activeEvent: null,
        mustChoose: false,
        notice: { title: crime.title, eyebrow: 'Away', text: `It comes off. ${formatFunds(pay, moneySymbolOf(character))} richer.` },
      });
      return;
    }
    // caught: the world does its work
    const withAttempt: Character = {
      ...character,
      log: [...character.log, attemptEntry],
    };
    const staged = stageEvent(withAttempt, caughtEvent(crime, withAttempt), era.moneyScale);
    persist(staged.character, 'playing');
    set({
      character: staged.character,
      section: null,
      notice: null,
      activeEvent: staged.activeEvent,
      mustChoose: staged.activeEvent.event.choices.length > 0,
    });
  },

  checkup: () => {
    const { character } = get();
    if (!character) return;
    const era = getEra(character.eraId);
    const fee = 2 * era.moneyScale;
    if (character.money < fee) return;
    const hidden = character.ailments.filter(
      (a) => a.ownerId === null && !a.known,
    );
    const found = hidden.map((a) => AILMENTS[a.ailmentId]?.name ?? a.ailmentId);
    const revealed =
      found.length > 0
        ? `The doctor examines you. They inform you that you are suffering from ${joinList(found.map((n) => `the ${n.toLowerCase()}`))}.`
        : null;
    const journalText = found.length > 0
      ? `You were diagnosed with ${joinList(found.map((n) => `the ${n.toLowerCase()}`))}.`
      : `You went for a medical checkup.`;
    const c: Character = {
      ...character,
      money: character.money - fee,
      ailments: character.ailments.map((a) =>
        a.ownerId === null ? { ...a, known: true } : a,
      ),
      log: [
        ...character.log,
        {
          age: character.age,
          year: character.birthYear + character.age,
          text: journalText,
          kind: 'event',
        } as LogEntry,
      ],
    };
    persist(c, character.alive ? 'playing' : 'dead');
    set({
      character: c,
      section: null,
      notice: { title: 'Checkup', eyebrow: 'Doctor', text: revealed ?? 'The doctor examines you. They declare that you are in perfect health.' },
    });
  },

  takeActivity: (key) => {
    const { character } = get();
    if (!character || !character.alive) return;
    const def = ACTIVITIES.find((a) => a.key === key);
    if (!def || !isOpen(def, character)) return;
    // at war the front leaves room for walks, quiet sitting, and nothing else
    if (character.serving && key !== 'walk' && key !== 'meditate') {
      set({
        section: null,
        notice: { title: resolveActivity(def, character.eraId).text, eyebrow: 'War', text: 'There is a war on. That will have to wait.' },
      });
      return;
    }
    // voice and modelling lessons go on the parents' coin while too
    // young to pay: the house's means and their fondness decide
    const lessonAsk = needsParentPayer(def, character);
    if (!lessonAsk && !canAffordEffective(def, character)) return;
    let payerRef: string | null = null;
    if (lessonAsk) {
      const askable = askableRelatives(character);
      const parents = askable.filter((m) => m.relation === 'mother' || m.relation === 'father');
      const pool = parents.length > 0 ? parents : askable;
      if (pool.length === 0) {
        set({
          section: null,
          notice: { title: resolveActivity(def, character.eraId).text, text: 'There is no one to ask.' },
        });
        return;
      }
      const payer = [...pool].sort((a, b) => b.bond - a.bond)[0]!;
      const wealth = character.familyWealth ?? 50;
      const odds = Math.min(
        0.9,
        pocketMoneyChance(payer.bond) *
          pocketChanceFactor(wealth, character.destitute ?? false),
      );
      const ref = kinshipRef(payer, character.family);
      if (!(odds > 0 && Math.random() < odds)) {
        const next = [...character.family];
        const fi = next.findIndex((m) => m.id === payer.id);
        if (fi >= 0) next[fi] = { ...next[fi]!, bond: clampPerformance(next[fi]!.bond - 3) };
        const entry: LogEntry = {
          age: character.age,
          year: character.birthYear + character.age,
          text: `You asked ${ref} to pay for the lessons and were refused.`,
          kind: 'event',
        };
        const c: Character = {
          ...character,
          family: next,
          stats: clampStats({ ...character.stats, happiness: character.stats.happiness - 2 }),
          log: [...character.log, entry],
        };
        persist(c, 'playing');
        set({
          character: c,
          section: null,
          notice: { title: 'Refused', eyebrow: cap(ref), text: 'They say there is none to spare, and they do not look at you.' },
        });
        return;
      }
      payerRef = cap(ref);
    }

    const era = getEra(character.eraId);
    const resolved = resolveActivity(def, character.eraId);
    const gain = sessionGain(def, character);
    const cost = effectiveCost(def, character);
    const isTrainable = TRAINABLE.includes(key);
    const firstTime = isTrainable && !(key in character.skillProgress);
    const progressGain = isTrainable ? skillProgressGain(def, character) : 0;
    const newProgress = isTrainable
      ? Math.min(100, (character.skillProgress[key] ?? 0) + progressGain)
      : 0;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: renderText(resolved.journal, character, placeNameOf(character)),
      kind: 'event',
    };
    const c: Character = {
      ...character,
      stats: clampStats({
        ...character.stats,
        health: character.stats.health + (gain.health ?? 0),
        happiness: character.stats.happiness + (gain.happiness ?? 0),
        smarts: character.stats.smarts + (gain.smarts ?? 0),
        looks: character.stats.looks + (gain.looks ?? 0),
        energy: (character.stats.energy ?? 70) + (gain.energy ?? 0),
        reputation: (character.stats.reputation ?? 50) + (gain.reputation ?? 0),
      }),
      money: character.money - (lessonAsk ? 0 : cost),
      activitiesUsed: [...character.activitiesUsed, key],
      // wearing the habit out is what stops it being spammed
      activityHeat: {
        ...character.activityHeat,
        [key]: stepMultiplier(character.activityHeat[key] ?? 1, true, 0),
      },
      activityAged: { ...character.activityAged, [key]: 0 },
      skillProgress: isTrainable
        ? { ...character.skillProgress, [key]: newProgress }
        : character.skillProgress,
      log: [...character.log, entry],
    };
    persist(c, 'playing');
    const noticeText = firstTime
      ? `You discover you${character.skillAptitude[key] >= 1.2 ? ' have a natural aptitude for' : character.skillAptitude[key] <= 0.6 ? ' struggle with' : ' have some talent for'} this.`
      : resolved.notice;
    set({
      character: c,
      section: null,
      notice: { title: resolved.text, eyebrow: payerRef ?? 'Action', text: noticeText },
    });
  },

  finishNews: () => {
    const { character } = get();
    if (!character || !character.alive) return;
    const def = ACTIVITIES.find((a) => a.key === 'news');
    if (!def || !isOpen(def, character)) return;
    // closing the gazette counts as reading it: same gains and wear
    // as any session, journaled, with no popup after
    const gain = sessionGain(def, character);
    const c: Character = {
      ...character,
      stats: clampStats({
        ...character.stats,
        health: character.stats.health + (gain.health ?? 0),
        happiness: character.stats.happiness + (gain.happiness ?? 0),
        smarts: character.stats.smarts + (gain.smarts ?? 0),
        looks: character.stats.looks + (gain.looks ?? 0),
        energy: (character.stats.energy ?? 70) + (gain.energy ?? 0),
        reputation: (character.stats.reputation ?? 50) + (gain.reputation ?? 0),
      }),
      activitiesUsed: [...character.activitiesUsed, 'news'],
      activityHeat: {
        ...character.activityHeat,
        news: stepMultiplier(character.activityHeat['news'] ?? 1, true, 0),
      },
      activityAged: { ...character.activityAged, news: 0 },
      log: [
        ...character.log,
        {
          age: character.age,
          year: character.birthYear + character.age,
          text: renderText(
            resolveActivity(def, character.eraId).journal,
            character,
            placeNameOf(character),
          ),
          kind: 'event',
        } as LogEntry,
      ],
    };
    persist(c, 'playing');
    set({ character: c });
  },

  takeWalk: (durationId, placeId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    const def = ACTIVITIES.find((a) => a.key === 'walk');
    if (!def || !isOpen(def, character)) return;
    const duration = WALK_DURATIONS.find((d) => d.id === durationId);
    const place = WALK_PLACES.find((p) => p.id === placeId);
    if (!duration || !place) return;
    if (!walkPlacesFor(character).some((p) => p.id === placeId)) return;

    const era = getEra(character.eraId);
    const resolved = resolveActivity(def, character.eraId);
    const gain = sessionGain(def, character);
    const energyCost = duration.energyCost ?? 0;
    const c: Character = {
      ...character,
      stats: clampStats({
        ...character.stats,
        health:
          character.stats.health +
          (gain.health ?? 0) * duration.scale,
        energy:
          (character.stats.energy ?? 70) +
          (gain.energy ?? 0) * duration.scale -
          energyCost,
        happiness:
          character.stats.happiness + (gain.happiness ?? 0) * duration.scale,
        smarts: character.stats.smarts + (gain.smarts ?? 0) * duration.scale,
        looks: character.stats.looks + (gain.looks ?? 0) * duration.scale,
        reputation: (character.stats.reputation ?? 50) + (gain.reputation ?? 0) * duration.scale,
      }),
      // a longer walk tires the habit out that much faster
      activityHeat: {
        ...character.activityHeat,
        walk: wearHabit(character, 'walk', duration.wear),
      },
      activityAged: { ...character.activityAged, walk: 0 },
      activitiesUsed: [...character.activitiesUsed, 'walk'],
      log: [
        ...character.log,
        {
          age: character.age,
          year: character.birthYear + character.age,
          text: renderText(duration.journal, character, placeNameOf(character)),
          kind: 'event',
        } as LogEntry,
      ],
    };

    const chance = duration.eventChance + (place.eventBias ?? 0);
    const encounter = Math.random() < chance ? pickWalkEvent(c, placeId) : null;
    if (encounter) {
      // the walk still counts; the encounter goes through the usual popup
      const staged = stageEvent(c, walkEventAs(encounter), era.moneyScale);
      // remember what just happened so the next walk is not the same one
      const recent = [
        ...(character.recentWalkEvents ?? []).slice(-5),
        encounter.id,
      ];
      const staged2: Character = { ...staged.character, recentWalkEvents: recent };
      persist(staged2, 'playing');
      set({
        character: staged2,
        section: null,
        notice: null,
        activeEvent: staged.activeEvent,
        mustChoose: staged.activeEvent.event.choices.length > 0,
      });
      return;
    }

    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: resolved.text,
        eyebrow: 'Action',
        text: duration.notice,
      },
    });
  },

  takeSalon: (serviceId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    const def = ACTIVITIES.find((a) => a.key === 'salon');
    if (!def || !isOpen(def, character)) return;
    const service = SALON_SERVICES.find((s) => s.id === serviceId);
    const open = salonsFor(character);
    if (!service || !open.some((s) => s.id === serviceId)) return;
    const cost = salonCost(service, character);
    if (character.money < cost) return;

    const resolved = open.find((s) => s.id === serviceId) ?? service;
    if (character.serving) {
      set({
        section: null,
        notice: { title: resolved.text, eyebrow: 'War', text: 'There is a war on. That will have to wait.' },
      });
      return;
    }
    const gain = salonGain(service, character);
    const c: Character = {
      ...character,
      stats: clampStats({
        ...character.stats,
        health: character.stats.health + (gain.health ?? 0),
        happiness: character.stats.happiness + (gain.happiness ?? 0),
        smarts: character.stats.smarts + (gain.smarts ?? 0),
        looks: character.stats.looks + (gain.looks ?? 0),
        energy: (character.stats.energy ?? 70) + (gain.energy ?? 0),
        reputation: (character.stats.reputation ?? 50) + (gain.reputation ?? 0),
      }),
      money: character.money - cost,
      activitiesUsed: [...character.activitiesUsed, serviceId],
      activityHeat: {
        ...character.activityHeat,
        [serviceId]: stepMultiplier(character.activityHeat[serviceId] ?? 1, true, 0),
      },
      activityAged: { ...character.activityAged, [serviceId]: 0 },
      log: [
        ...character.log,
        {
          age: character.age,
          year: character.birthYear + character.age,
          text: renderText(resolved.journal, character, placeNameOf(character)),
          kind: 'event',
        } as LogEntry,
      ],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: resolved.text, eyebrow: 'Action', text: resolved.notice },
    });
  },

  getLicence: () => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (!needsLicence(character.eraId) || hasLicence(character)) return;
    if (character.age < licenceAgeFor(character)) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Driving licence', eyebrow: 'War', text: 'There is a war on. That will have to wait.' },
      });
      return;
    }
    const cost = licenceCost(character);
    if (character.money < cost) return;
    const c: Character = {
      ...character,
      money: character.money - cost,
      flags: [...character.flags, LICENCE_FLAG],
      log: [
        ...character.log,
        {
          age: character.age,
          year: character.birthYear + character.age,
          text: 'You passed the test and got your driving licence.',
          kind: 'event',
        } as LogEntry,
      ],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'Driving licence', text: 'You passed and got your licence.' },
    });
  },

  askForLicence: (memberId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (!needsLicence(character.eraId) || hasLicence(character)) return;
    if (character.age < licenceAgeFor(character)) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Driving licence', eyebrow: 'War', text: 'There is a war on. That will have to wait.' },
      });
      return;
    }
    const idx = character.family.findIndex((m) => m.id === memberId);
    if (idx < 0) return;
    const me = character.family[idx];
    if (!askableRelatives(character).some((m) => m.id === memberId)) return;
    const ref = kinshipRef(me, character.family);
    const wealth = character.familyWealth ?? 50;
    // asking again is a long shot; the first ask is the real one
    const again = (character.askedLicence ?? []).includes(memberId);
    const odds = Math.min(
      0.9,
      pocketMoneyChance(me.bond) *
        pocketChanceFactor(wealth, character.destitute ?? false) *
        (again ? 0.1 : 1),
    );
    const gave = odds > 0 && Math.random() < odds;
    const askedLicence = again
      ? character.askedLicence
      : [...(character.askedLicence ?? []), memberId];
    if (!gave) {
      const entry: LogEntry = {
        age: character.age,
        year: character.birthYear + character.age,
        text: `You asked ${ref} to pay for your licence and were refused.`,
        kind: 'event',
      };
      const c: Character = {
        ...character,
        askedLicence,
        stats: clampStats({ ...character.stats, happiness: character.stats.happiness - 4 }),
        log: [...character.log, entry],
      };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        notice: { title: 'Refused', eyebrow: cap(ref), text: 'They say there is none to spare, and they do not look at you.' },
      });
      return;
    }
    const c: Character = {
      ...character,
      askedLicence,
      flags: [...character.flags, LICENCE_FLAG],
      stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 3 }),
      log: [
        ...character.log,
        {
          age: character.age,
          year: character.birthYear + character.age,
          text: `You passed the test and got your driving licence. ${cap(ref)} is paying.`,
          kind: 'event',
        } as LogEntry,
      ],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'Driving licence', eyebrow: cap(ref), text: 'They pay for the licence without a word about it.' },
    });
  },

  takeDrive: (index, durationId, placeId, companion) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (!canActSocially(character)) return;
    const belongings = [...(character.belongings ?? [])];
    if (index < 0 || index >= belongings.length) return;
    const item = itemById(belongings[index] ?? '');
    if (!item?.vehicle) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: item.text, eyebrow: 'War', text: 'There is a war on. That will have to wait.' },
      });
      return;
    }
    if (!canDrive(character)) {
      set({
        section: null,
        notice: { title: item.text, eyebrow: 'Belongings', text: 'You need a licence before you can drive it.' },
      });
      return;
    }
    const duration = WALK_DURATIONS.find((d) => d.id === durationId);
    const place = WALK_PLACES.find((p) => p.id === placeId);
    if (!duration || !place) return;
    if (!walkPlacesFor(character).some((p) => p.id === placeId)) return;

    // who comes: nobody, a relative, or someone from the Circle
    let companionName: string | null = null;
    let companionKey: string | null = null;
    if (companion !== 'alone') {
      const cut = companion.indexOf(':');
      const scope = companion.slice(0, cut);
      const pid = companion.slice(cut + 1);
      if (scope === 'family') {
        const me = character.family.find((m) => m.id === pid);
        if (!me) return;
        companionName = kinshipRef(me, character.family);
        companionKey = `family:${me.id}`;
      } else if (scope === 'contact') {
        const me = character.contacts.find((m) => m.id === pid);
        if (!me || me.kind === 'pet') return;
        companionName = contactRef(me);
        companionKey = `contact:${me.id}`;
      } else {
        return;
      }
    }

    const scale = effectiveness(character.activityHeat['drive'] ?? 1, character.stats.health, character.stats.energy);
    const gain = Math.round(6 * duration.scale * scale);
    const placeText = place.text.charAt(0).toLowerCase() + place.text.slice(1);
    const what = item.text.charAt(0).toLowerCase() + item.text.slice(1);
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: companionName
        ? `You drove the ${what} to ${placeText} with ${companionName}.`
        : `You drove the ${what} to ${placeText}.`,
      kind: 'event',
    };
    let c: Character = {
      ...character,
      stats: clampStats({
        ...character.stats,
        happiness: character.stats.happiness + gain,
        energy: (character.stats.energy ?? 70) - (duration.energyCost ?? 0),
      }),
      activityHeat: {
        ...character.activityHeat,
        drive: wearHabit(character, 'drive', duration.wear),
      },
      activityAged: { ...character.activityAged, drive: 0 },
      activitiesUsed: [...character.activitiesUsed, 'drive'],
      log: [...character.log, entry],
    };

    // company brings you closer, and they say so afterwards
    const follow: ActiveEvent[] = [];
    if (companionKey) {
      const boost = Math.round(10 * duration.scale);
      const cut = companionKey.indexOf(':');
      const pid = companionKey.slice(cut + 1);
      if (companionKey.startsWith('family:')) {
        const idx = c.family.findIndex((m) => m.id === pid);
        if (idx >= 0) {
          const me = c.family[idx]!;
          const ref = kinshipRef(me, c.family);
          const family = [...c.family];
          family[idx] = { ...me, bond: clampPerformance(me.bond + boost) };
          const extra: LogEntry = {
            age: c.age,
            year: c.birthYear + c.age,
            text: `You drove out with ${ref}.`,
            kind: 'event',
          };
          c = { ...c, family, log: [...c.log, extra] };
          follow.push(infoEvent(`drive-with-${pid}`, 'Closer', `${cap(ref)} loved the drive.`));
        }
      } else {
        const idx = c.contacts.findIndex((m) => m.id === pid);
        if (idx >= 0) {
          const me = c.contacts[idx]!;
          const contacts = [...c.contacts];
          contacts[idx] = applyBond(me, boost);
          const extra: LogEntry = {
            age: c.age,
            year: c.birthYear + c.age,
            text: `You drove out with ${contactRef(me)}.`,
            kind: 'event',
          };
          c = { ...c, contacts, log: [...c.log, extra] };
          follow.push(infoEvent(`drive-with-${pid}`, 'Closer', `${cap(contactRef(me))} loved the drive.`));
        }
      }
    }

    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: item.text,
        eyebrow: 'Belongings',
        text: duration.notice,
      },
      pending: [...get().pending, ...follow],
    });
  },

  takeShop: (itemId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (!canActSocially(character)) return;
    const item = itemById(itemId);
    if (!item) return;
    const shop = shopById(item.shopId);
    if (!shop || !shop.eras.includes(character.eraId)) return;
    if (!itemsFor(character, shop.id, item.aisle).some((i) => i.id === itemId)) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: item.text, eyebrow: 'War', text: 'There is a war on. That will have to wait.' },
      });
      return;
    }
    if (isOwnedOut(item, character)) return;
    const cost = shopCost(item, character);
    if (character.money < cost) return;
    // bought for a waiting child: straight to them, never to the shelf
    const errand = get().pendingChildShop;
    const asker = errand && errand.itemId === item.id
      ? (character.children ?? []).find((k) => k.id === errand.childId) ?? null
      : null;
    if (errand && asker) {
      const name = item.text.toLowerCase();
      const reaction = giftReaction(item, 'child', childAge(asker, character.age));
      const he = cap(pronoun(asker.gender, 'subj'));
      const said = giftResult(reaction, he, name);
      const children = [...(character.children ?? [])];
      const ai = children.findIndex((k) => k.id === asker.id);
      children[ai] = {
        ...asker,
        bond: Math.max(10, Math.min(100, asker.bond + GIFT_BOND.family[reaction])),
      };
      const c: Character = {
        ...character,
        children,
        money: character.money - cost,
        stats: clampStats({
          ...character.stats,
          happiness: character.stats.happiness + GIFT_HAPPINESS[reaction],
        }),
        log: [
          ...character.log,
          {
            age: character.age,
            year: character.birthYear + character.age,
            text: `You gave the ${name} to ${asker.firstName}.${said.journal}`,
            kind: 'event',
          } as LogEntry,
        ],
      };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        notice: { title: item.text, eyebrow: asker.firstName, text: said.notice },
        pendingChildShop: null,
      });
      return;
    }
    const c: Character = {
      ...character,
      stats: clampStats({
        ...character.stats,
        health: character.stats.health + (item.stats?.health ?? 0),
        happiness: character.stats.happiness + (item.stats?.happiness ?? 0),
        smarts: character.stats.smarts + (item.stats?.smarts ?? 0),
        looks: character.stats.looks + (item.stats?.looks ?? 0),
        energy: (character.stats.energy ?? 70) + (item.stats?.energy ?? 0),
        reputation: (character.stats.reputation ?? 50) + (item.stats?.reputation ?? 0),
      }),
      money: character.money - cost,
      belongings: [...(character.belongings ?? []), item.id],
      log: [
        ...character.log,
        {
          age: character.age,
          year: character.birthYear + character.age,
          text: renderText(item.journal, character, placeNameOf(character)),
          kind: 'event',
        } as LogEntry,
      ],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: item.text, eyebrow: shop.text, text: item.notice },
    });
  },

  buyHome: (houseId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (character.home) return;
    if (character.age < 18) return;
    const house = houseById(character.eraId, houseId);
    if (!house) return;
    if (character.age < house.minAge) return;
    if (!housesFor(character.eraId).some((h) => h.id === houseId)) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const cost = houseCost(house, character.eraId);
    if (character.money < cost) return;
    const bought = house.text.charAt(0).toLowerCase() + house.text.slice(1);
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: `You bought ${bought}.`,
      kind: 'event',
    };
    const c: Character = character.home
      ? {
          ...character,
          money: character.money - cost,
          rentals: [
            ...(character.rentals ?? []),
            {
              uid: `rent-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
              houseId: house.id,
              taxOwed: 0,
              forRent: false,
              rentAsked: 0,
              viewing: [],
              tenants: [],
            },
          ],
          stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 6 }),
          log: [...character.log, entry],
        }
      : {
          ...character,
          money: character.money - cost,
          home: {
            houseId: house.id,
            residents: [],
            movedIn: false,
            taxOwed: 0,
            forRent: false,
            rentAsked: 0,
            viewing: [],
          },
          stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 6 }),
          log: [...character.log, entry],
        };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: house.text,
        eyebrow: character.home ? 'To let' : 'Home',
        text: character.home ? 'Yours to let.' : 'The keys are yours.',
      },
    });
  },

  moveIn: (prop) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    // homeless owners move; moving between roofs is not done.
    if (character.home?.movedIn) return;
    const houseId =
      prop === 'home' ? character.home?.houseId : rentalByUid(character, prop)?.houseId;
    if (!houseId) return;
    const house = houseById(character.eraId, houseId);
    const name = house ? house.text.charAt(0).toLowerCase() + house.text.slice(1) : 'your house';
    const parents = character.family.filter(
      (m) => m.relation === 'mother' || m.relation === 'father',
    );
    const family =
      parents.length > 0
        ? character.family.map((m) =>
            m.relation === 'mother' || m.relation === 'father'
              ? { ...m, bond: clampPerformance(m.bond - 5) }
              : m,
          )
        : character.family;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text:
        parents.length > 0
          ? 'You moved out of the family home.'
          : `You moved into ${name}.`,
      kind: 'event',
    };
    // a let property becomes the house, tenants and all; whatever
    // stood as the house becomes a property in its place.
    const rentals = (character.rentals ?? []).filter((r) => r.uid !== prop);
    const demote =
      character.home && prop !== 'home'
        ? [
            ...rentals,
            {
              uid: `rent-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
              houseId: character.home.houseId,
              taxOwed: character.home.taxOwed,
              forRent: false,
              rentAsked: 0,
              viewing: [],
              tenants: character.home.residents.filter((r) => r.scope === 'contact'),
            },
          ]
        : rentals;
    const fromRental =
      prop !== 'home' ? (character.rentals ?? []).find((r) => r.uid === prop) : null;
    const home = fromRental
      ? {
          houseId: fromRental.houseId,
          residents: fromRental.tenants,
          movedIn: true,
          taxOwed: fromRental.taxOwed,
          forRent: false,
          rentAsked: fromRental.rentAsked,
          viewing: [],
        }
      : character.home
        ? { ...character.home, movedIn: true, viewing: [] }
        : null;
    if (!home) return;
    const c: Character = {
      ...character,
      family,
      home,
      rentals: demote,
      stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 2 }),
      log: [...character.log, entry],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'Moved in', eyebrow: 'Home', text: 'You live here now.' },
    });
  },

  moveOut: () => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (!character.home?.movedIn) return;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: 'You moved out of your house.',
      kind: 'event',
    };
    const c: Character = {
      ...character,
      home: { ...character.home, viewing: [] },
      log: [...character.log, entry],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'Moved out', eyebrow: 'Home', text: 'The house stands empty of you.' },
    });
  },

  sellHome: (prop, price) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    const houseId =
      prop === 'home' ? character.home?.houseId : rentalByUid(character, prop)?.houseId;
    if (!houseId) return;
    const house = houseById(character.eraId, houseId);
    if (!house) return;
    const value = houseCost(house, character.eraId);
    const amount = Math.max(0, Math.floor(price));
    const sold = Math.random() < sellChance(amount, value);
    if (!sold) {
      const entry: LogEntry = {
        age: character.age,
        year: character.birthYear + character.age,
        text: 'No one met your price.',
        kind: 'event',
      };
      const c: Character = { ...character, log: [...character.log, entry] };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        notice: { title: 'No sale', eyebrow: house.text, text: 'No one met your price.' },
      });
      return;
    }
    const bought = house.text.charAt(0).toLowerCase() + house.text.slice(1);
    const hadTenants =
      prop === 'home'
        ? (character.home?.residents ?? []).length > 0
        : (rentalByUid(character, prop)?.tenants ?? []).length > 0;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: `You sold ${bought} for ${formatFunds(amount, moneySymbolOf(character))}.${hadTenants ? ' The tenants leave.' : ''}`,
      kind: 'event',
    };
    const c: Character =
      prop === 'home'
        ? {
            ...character,
            money: character.money + amount,
            home: null,
            stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 2 }),
            log: [...character.log, entry],
          }
        : {
            ...character,
            money: character.money + amount,
            rentals: (character.rentals ?? []).filter((r) => r.uid !== prop),
            stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 2 }),
            log: [...character.log, entry],
          };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'Sold', eyebrow: house.text, text: entry.text },
    });
  },

  payTax: (prop) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    const owed =
      prop === 'home'
        ? (character.home?.taxOwed ?? 0)
        : (rentalByUid(character, prop)?.taxOwed ?? 0);
    if (owed <= 0) return;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: 'You paid the tax.',
      kind: 'event',
    };
    const c: Character =
      prop === 'home' && character.home
        ? {
            ...character,
            money: character.money - owed,
            home: { ...character.home, taxOwed: 0 },
            log: [...character.log, entry],
          }
        : {
            ...character,
            money: character.money - owed,
            rentals: (character.rentals ?? []).map((r) =>
              r.uid === prop ? { ...r, taxOwed: 0 } : r,
            ),
            log: [...character.log, entry],
          };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'Paid', eyebrow: 'Tax', text: 'The book is marked.' },
    });
  },

  findTenant: (price, prop) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (prop === 'home' ? !character.home : !rentalByUid(character, prop)) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const amount = Math.max(1, Math.floor(price));
    const group = makeTenantGroup(character);
    const priceText = formatFunds(amount, moneySymbolOf(character));
    let c: Character = {
      ...character,
      viewingsThisYear: (character.viewingsThisYear ?? 0) + 1,
    };
    if (prop === 'home' && c.home) {
      c = { ...c, home: { ...c.home, rentAsked: amount, viewing: group } };
    } else {
      c = {
        ...c,
        rentals: c.rentals.map((r) =>
          r.uid === prop ? { ...r, rentAsked: amount, viewing: group } : r,
        ),
      };
    }
    const era = getEra(c.eraId);
    const staged = stageEvent(c, viewingEvent(c, prop, group, priceText), era.moneyScale);
    persist(staged.character, 'playing');
    set({
      character: staged.character,
      section: null,
      notice: null,
      activeEvent: staged.activeEvent,
      mustChoose: staged.activeEvent.event.choices.length > 0,
    });
  },

  openRent: (price, prop) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    const already =
      prop === 'home'
        ? !character.home || character.home.forRent
        : !rentalByUid(character, prop) || rentalByUid(character, prop)?.forRent;
    if (already) return;
    const amount = Math.max(1, Math.floor(price));
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: 'You put the rooms up for rent.',
      kind: 'event',
    };
    const c: Character =
      prop === 'home' && character.home
        ? {
            ...character,
            home: { ...character.home, forRent: true, rentAsked: amount },
            log: [...character.log, entry],
          }
        : {
            ...character,
            rentals: (character.rentals ?? []).map((r) =>
              r.uid === prop ? { ...r, forRent: true, rentAsked: amount } : r,
            ),
            log: [...character.log, entry],
          };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'To let', eyebrow: 'Home', text: 'Word gets round.' },
    });
  },

  closeRent: (prop) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    const open =
      prop === 'home'
        ? character.home?.forRent
        : rentalByUid(character, prop)?.forRent;
    if (!open) return;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: 'You took the rooms off the market.',
      kind: 'event',
    };
    const c: Character =
      prop === 'home' && character.home
        ? {
            ...character,
            home: { ...character.home, forRent: false, viewing: [] },
            log: [...character.log, entry],
          }
        : {
            ...character,
            rentals: (character.rentals ?? []).map((r) =>
              r.uid === prop ? { ...r, forRent: false, viewing: [] } : r,
            ),
            log: [...character.log, entry],
          };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'Closed', eyebrow: 'Home', text: 'No more strangers at the door.' },
    });
  },

  setRentPrice: (prop, price) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    const exists =
      prop === 'home' ? !!character.home : !!rentalByUid(character, prop);
    if (!exists) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const amount = Math.max(1, Math.floor(price));
    const stamp = (text: string): LogEntry => ({
      age: character.age,
      year: character.birthYear + character.age,
      text,
      kind: 'event',
    });
    const old =
      prop === 'home'
        ? (character.home?.rentAsked ?? 0)
        : (rentalByUid(character, prop)?.rentAsked ?? 0);
    const leases = propTenants(character, prop).filter((e) => (e.rent ?? 0) > 0);
    let c: Character =
      prop === 'home' && character.home
        ? {
            ...character,
            home: {
              ...character.home,
              rentAsked: amount,
              residents: character.home.residents.map((e) =>
                (e.rent ?? 0) > 0 ? { ...e, rent: amount } : e,
              ),
            },
          }
        : {
            ...character,
            rentals: (character.rentals ?? []).map((r) =>
              r.uid === prop
                ? {
                    ...r,
                    rentAsked: amount,
                    tenants: r.tenants.map((e) =>
                      (e.rent ?? 0) > 0 ? { ...e, rent: amount } : e,
                    ),
                  }
                : r,
            ),
          };
    const lines: string[] = [];
    const fair = fairRent(c, prop);
    for (const lease of leases) {
      if (amount <= old) {
        const bumped = bumpTenant(c, prop, lease.id, 3);
        c = bumped.character;
        lines.push(...bumped.lines);
        continue;
      }
      const contact = c.contacts.find((x) => x.id === lease.id);
      const stayed =
        contact &&
        Math.random() < tenantAcceptChance(contact.wealth ?? 50, amount, fair);
      if (stayed) {
        const bumped = bumpTenant(c, prop, lease.id, -3);
        c = bumped.character;
        lines.push(...bumped.lines);
      } else {
        const gone = tenantLeaves(
          c,
          prop,
          lease.id,
          8,
          `${cap(contactRef(contact!))} moved out rather than pay it.`,
        );
        c = gone.character;
        lines.push(...gone.lines);
      }
    }
    c = {
      ...c,
      stats: clampStats({ ...c.stats, happiness: c.stats.happiness + (amount <= old ? 1 : 0) }),
      log: [
        ...c.log,
        stamp(`You set the rent at ${formatFunds(amount, moneySymbolOf(c))}.`),
        ...lines.map((t) => stamp(t)),
      ],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: 'Let',
        eyebrow: 'Rent',
        text:
          lines.length > 0
            ? lines[0]!
            : amount <= old
              ? 'They take the news well.'
              : 'They grumble, and stay.',
      },
    });
  },

  kickOut: (prop, contactId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const tenant = propTenants(character, prop).find(
      (e) => e.id === contactId && (e.rent ?? 0) > 0,
    );
    const contact = character.contacts.find((m) => m.id === contactId);
    if (!tenant || !contact) return;
    if (contact.kind === 'partner' && contact.married) {
      set({
        section: null,
        notice: { title: 'Married', text: 'That takes a divorce, not a notice.' },
      });
      return;
    }
    const out = evictTenant(character, prop, contactId, tenant.cause ?? false);
    const stamp = (text: string): LogEntry => ({
      age: character.age,
      year: character.birthYear + character.age,
      text,
      kind: 'event',
    });
    const c: Character = {
      ...out.character,
      log: [...out.character.log, ...out.lines.map((t) => stamp(t))],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: 'Out', eyebrow: cap(contactRef(contact)), text: out.lines[0] ?? 'Gone.' },
    });
  },

  inviteHome: (scope, id) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (!character.home?.movedIn) return;
    if (!canActSocially(character)) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const key = `${scope}:${id}`;
    if ((character.invitedThisYear ?? []).includes(key)) {
      set({
        section: null,
        notice: { title: 'Asked', text: 'You already asked this year.' },
      });
      return;
    }
    const stamp = (text: string): LogEntry => ({
      age: character.age,
      year: character.birthYear + character.age,
      text,
      kind: 'event',
    });
    const markAsked = (c: Character): Character => ({
      ...c,
      invitedThisYear: [...(c.invitedThisYear ?? []), key],
    });

    // Who else is already under your roof gets a say about newcomers.
    const objections = (c: Character, newcomer: string) =>
      objectToNewcomer(c, newcomer, { scope, id });

    if (scope === 'contact') {
      const me = character.contacts.find((m) => m.id === id);
      if (!me || me.kind === 'pet') return;
      if (isResident(character, 'contact', id)) return;
      const ref = contactRef(me);
      const yes = Math.random() < inviteChance('contact', me.bond, me.kind === 'partner');
      if (!yes) {
        const moved = applyBond(me, -5);
        const contacts = character.contacts.map((m) => (m.id === id ? moved : m));
        const c = markAsked({
          ...character,
          contacts,
          stats: clampStats({ ...character.stats, happiness: character.stats.happiness - 2 }),
          log: [...character.log, stamp(`${cap(ref)} would rather stay where they are.`)],
        });
        persist(c, 'playing');
        set({
          character: c,
          section: null,
          notice: { title: 'Refused', eyebrow: cap(ref), text: 'They are not leaving where they are.' },
        });
        return;
      }
      let c: Character = markAsked({
        ...character,
        home: { ...character.home!, residents: [...character.home!.residents, { scope: 'contact' as const, id }] },
        stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 4 }),
        log: [...character.log, stamp(`${cap(ref)} moved in with you.`)],
      });
      const heard = objections(c, ref);
      c = {
        ...heard.character,
        log: [...heard.character.log, ...heard.lines.map((t) => stamp(t))],
      };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        notice: {
          title: 'Moved in',
          eyebrow: cap(ref),
          text: heard.lines.length > 0 ? heard.lines[0]! : 'You make room, and they take it.',
        },
      });
      return;
    }

    const me = character.family.find((m) => m.id === id);
    if (!me) return;
    if (isResident(character, 'family', id)) return;
    const ref = kinshipRef(me, character.family);
    const yes = Math.random() < inviteChance('family', me.bond, false);
    if (!yes) {
      const family = character.family.map((m) =>
        m.id === id ? { ...m, bond: clampPerformance(m.bond - 3) } : m,
      );
      const c = markAsked({
        ...character,
        family,
        stats: clampStats({ ...character.stats, happiness: character.stats.happiness - 2 }),
        log: [...character.log, stamp(`${cap(ref)} would rather stay where they are.`)],
      });
      persist(c, 'playing');
      set({
        section: null,
        character: c,
        notice: { title: 'Refused', eyebrow: cap(ref), text: 'They are not leaving where they are.' },
      });
      return;
    }
    let c: Character = markAsked({
      ...character,
      home: { ...character.home!, residents: [...character.home!.residents, { scope: 'family' as const, id }] },
      stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 4 }),
      log: [...character.log, stamp(`${cap(ref)} moved in with you.`)],
    });
    const heard = objections(c, ref);
    c = {
      ...heard.character,
      log: [...heard.character.log, ...heard.lines.map((t) => stamp(t))],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: 'Moved in',
        eyebrow: cap(ref),
        text: heard.lines.length > 0 ? heard.lines[0]! : 'You make room, and they take it.',
      },
    });
  },

  takeInPet: (contactId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (!character.home?.movedIn) return;
    if (!canActSocially(character)) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const me = character.contacts.find((m) => m.id === contactId);
    if (!me || me.kind !== 'pet') return;
    if (isResident(character, 'pet', contactId)) return;
    const label = me.petName ?? me.name;
    const stamp = (text: string): LogEntry => ({
      age: character.age,
      year: character.birthYear + character.age,
      text,
      kind: 'event',
    });
    // kin attached to them may ask to keep them — owed to character,
    // never to wealth.
    const kin = character.family;
    const asker =
      kin.length > 0 && Math.random() < 0.4
        ? kin[Math.floor(Math.random() * kin.length)]!
        : null;
    if (!asker) {
      const c: Character = {
        ...character,
        home: {
          ...character.home,
          residents: [...character.home.residents, { scope: 'pet' as const, id: me.id }],
        },
        stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 2 }),
        log: [...character.log, stamp(`You took ${label} in.`)],
      };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        notice: { title: cap(label), eyebrow: 'Home', text: 'They settle in at once.' },
      });
      return;
    }
    const era = getEra(character.eraId);
    const staged = stageEvent(
      character,
      petKeepEvent(label, kinshipRef(asker, character.family), me.id, asker.id),
      era.moneyScale,
    );
    persist(staged.character, 'playing');
    set({
      character: staged.character,
      section: null,
      notice: null,
      activeEvent: staged.activeEvent,
      mustChoose: staged.activeEvent.event.choices.length > 0,
    });
  },

  inviteFamily: (group) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (!character.home?.movedIn) return;
    if (!canActSocially(character)) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const label =
      group === 'parents'
        ? 'your parents'
        : group === 'siblings'
          ? 'your siblings'
          : 'your family';
    const targets = character.family.filter(
      (m) =>
        (group === 'all' ||
          m.relation === 'mother' ||
          m.relation === 'father' ||
          (group === 'siblings' &&
            (m.relation === 'brother' || m.relation === 'sister') &&
            memberAge(m, character.age) >= 16)) &&
        !isResident(character, 'family', m.id) &&
        !(character.invitedThisYear ?? []).includes(`family:${m.id}`),
    );
    if (targets.length === 0) return;
    const stamp = (text: string): LogEntry => ({
      age: character.age,
      year: character.birthYear + character.age,
      text,
      kind: 'event',
    });
    let c: Character = {
      ...character,
      invitedThisYear: [
        ...(character.invitedThisYear ?? []),
        ...targets.map((m) => `family:${m.id}`),
      ],
    };
    const accepted: FamilyMember[] = [];
    let family = [...c.family];
    for (const t of targets) {
      if (Math.random() < inviteChance('family', t.bond, false)) accepted.push(t);
      else {
        family = family.map((m) =>
          m.id === t.id ? { ...m, bond: clampPerformance(m.bond - 3) } : m,
        );
      }
    }
    c = { ...c, family };
    if (accepted.length === 0) {
      c = {
        ...c,
        stats: clampStats({ ...c.stats, happiness: c.stats.happiness - 2 }),
        log: [...c.log, stamp(`${cap(label)} would rather stay where they are.`)],
      };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        notice: { title: 'Refused', eyebrow: cap(label), text: 'They are not leaving where they are.' },
      });
      return;
    }
    // whoever already lives there gets a say, before the rest move in.
    const heard = objectToNewcomer(c, label);
    c = {
      ...heard.character,
      log: [...heard.character.log, ...heard.lines.map((t) => stamp(t))],
    };
    // parents in without the young ones: they ask to bring them.
    c = {
      ...c,
      home: c.home
        ? {
            ...c.home,
            residents: [
              ...c.home.residents,
              ...accepted.map((m) => ({ scope: 'family' as const, id: m.id })),
            ],
          }
        : c.home,
      stats: clampStats({ ...c.stats, happiness: c.stats.happiness + 4 }),
      log: [...c.log, stamp(`${cap(label)} moved in with you.`)],
    };
    // parents in without the young ones: they ask to bring them.
    const youngLeft =
      group === 'parents' && accepted.length > 0
        ? c.family.filter(
            (m) =>
              (m.relation === 'brother' || m.relation === 'sister') &&
              memberAge(m, c.age) < 16 &&
              !isResident(c, 'family', m.id),
          )
        : [];
    if (youngLeft.length > 0) {
      const era = getEra(c.eraId);
      const staged = stageEvent(c, sibsBringEvent(), era.moneyScale);
      persist(staged.character, 'playing');
      set({
        character: staged.character,
        section: null,
        notice: null,
        activeEvent: staged.activeEvent,
        mustChoose: staged.activeEvent.event.choices.length > 0,
      });
      return;
    }
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: 'Moved in',
        eyebrow: cap(label),
        text: heard.lines.length > 0 ? heard.lines[0]! : 'You make room, and they take it.',
      },
    });
  },

  askForShop: (itemId, memberId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (!canActSocially(character)) return;
    const item = itemById(itemId);
    if (!item) return;
    const shop = shopById(item.shopId);
    if (!shop || !shop.eras.includes(character.eraId)) return;
    if (!itemsFor(character, shop.id, item.aisle).some((i) => i.id === itemId)) return;
    if (isOwnedOut(item, character)) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: item.text, eyebrow: 'War', text: 'There is a war on. That will have to wait.' },
      });
      return;
    }
    const idx = character.family.findIndex((m) => m.id === memberId);
    if (idx < 0) return;
    const me = character.family[idx];
    if (!askableRelatives(character).some((m) => m.id === memberId)) return;
    const ref = kinshipRef(me, character.family);
    const name = item.text.toLowerCase();
    const wealth = character.familyWealth ?? 50;
    // dear things are a harder ask; asking again is a long shot
    const key = `${memberId}:${itemId}`;
    const again = (character.askedShop ?? []).includes(key);
    const odds = Math.min(
      0.9,
      pocketMoneyChance(me.bond) *
        pocketChanceFactor(wealth, character.destitute ?? false) *
        (8 / (8 + item.cost)) *
        (again ? 0.1 : 1),
    );
    const gave = odds > 0 && Math.random() < odds;
    const askedShop = again
      ? character.askedShop
      : [...(character.askedShop ?? []), key];
    if (!gave) {
      const entry: LogEntry = {
        age: character.age,
        year: character.birthYear + character.age,
        text: `You asked ${ref} for the ${name} and were refused.`,
        kind: 'event',
      };
      const c: Character = {
        ...character,
        askedShop,
        stats: clampStats({ ...character.stats, happiness: character.stats.happiness - 2 }),
        log: [...character.log, entry],
      };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        notice: { title: 'Refused', eyebrow: cap(ref), text: 'They say there is none to spare, and they do not look at you.' },
      });
      return;
    }
    const c: Character = {
      ...character,
      askedShop,
      stats: clampStats({
        ...character.stats,
        health: character.stats.health + (item.stats?.health ?? 0),
        happiness: character.stats.happiness + (item.stats?.happiness ?? 0) + 2,
        smarts: character.stats.smarts + (item.stats?.smarts ?? 0),
        looks: character.stats.looks + (item.stats?.looks ?? 0),
        energy: (character.stats.energy ?? 70) + (item.stats?.energy ?? 0),
        reputation: (character.stats.reputation ?? 50) + (item.stats?.reputation ?? 0),
      }),
      belongings: [...(character.belongings ?? []), item.id],
      log: [
        ...character.log,
        {
          age: character.age,
          year: character.birthYear + character.age,
          text: `${cap(ref)} bought you the ${name}.`,
          kind: 'event',
        } as LogEntry,
      ],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: item.text, eyebrow: cap(ref), text: 'They buy it without a word about it.' },
    });
  },

  discardItem: (index) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    const belongings = [...(character.belongings ?? [])];
    if (index < 0 || index >= belongings.length) return;
    const [removed] = belongings.splice(index, 1);
    const item = removed ? itemById(removed) : undefined;
    const name = item?.text ?? 'it';
    const c: Character = {
      ...character,
      belongings,
      log: [
        ...character.log,
        {
          age: character.age,
          year: character.birthYear + character.age,
          text: `You threw away the ${name.toLowerCase()}.`,
          kind: 'event',
        } as LogEntry,
      ],
    };
    persist(c, 'playing');
    set({
      character: c,
      notice: { title: 'Thrown away', eyebrow: 'Belongings', text: `The ${name.toLowerCase()} is gone.` },
    });
  },

  giftItem: (index, scope, id) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (!canActSocially(character)) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: 'Too far', text: 'You are at war, far from them.' },
      });
      return;
    }
    const belongings = [...(character.belongings ?? [])];
    if (index < 0 || index >= belongings.length) return;
    const itemId = belongings[index];
    const item = itemId ? itemById(itemId) : undefined;
    if (!item) return;
    const name = item.text.toLowerCase();

    if (scope === 'contact') {
      const idx = character.contacts.findIndex((m) => m.id === id);
      if (idx < 0) return;
      const me = character.contacts[idx];
      if (me.kind === 'pet') return;
      const ref = contactRef(me);
      if (Math.random() < giftRefusalChance(me.bond)) {
        const bumped = applyBond(me, -5);
        const contacts = [...character.contacts];
        contacts[idx] = bumped;
        const c: Character = {
          ...character,
          contacts,
          stats: clampStats({ ...character.stats, happiness: character.stats.happiness - 1 }),
          log: [...character.log, { age: character.age, year: character.birthYear + character.age, text: `${cap(ref)} would not take the ${name}.`, kind: 'event' } as LogEntry],
        };
        if (bumped.bond <= 0) {
          const penalty = bondLossPenalty(me);
          const gone: Character = {
            ...c,
            contacts: c.contacts.filter((_, i) => i !== idx),
            stats: clampStats({ ...c.stats, happiness: c.stats.happiness - penalty }),
          };
          const final: Character = dropStrayAilments({ ...gone, log: [...gone.log, { age: gone.age, year: gone.birthYear + gone.age, text: partingLine(me.name, me.kind), kind: 'event' } as LogEntry] });
          persist(final, 'playing');
          set({ character: final, section: null, notice: { title: 'Refused', eyebrow: cap(ref), text: partingLine(me.name, me.kind) } });
          return;
        }
        persist(c, 'playing');
        set({ character: c, section: null, notice: { title: 'Refused', eyebrow: cap(ref), text: `${cap(ref)} would not take the ${name}.` } });
        return;
      }
      const trade = contactTrade(me, character.age, character.eraId);
      const reaction = giftReaction(item, trade, contactAge(me, character.age));
      const he = cap(pronoun(me.gender, 'subj'));
      const said = giftResult(reaction, he, name);
      const bumped = applyBond(me, GIFT_BOND.contact[reaction]);
      const contacts = [...character.contacts];
      contacts[idx] = bumped;
      belongings.splice(index, 1);
      const c: Character = {
        ...character,
        contacts,
        belongings,
        stats: clampStats({ ...character.stats, happiness: character.stats.happiness + GIFT_HAPPINESS[reaction] }),
        log: [...character.log, { age: character.age, year: character.birthYear + character.age, text: `You gave the ${name} to ${ref}.${said.journal}`, kind: 'event' } as LogEntry],
      };
      if (bumped.bond <= 0) {
        const penalty = bondLossPenalty(me);
        const gone: Character = {
          ...c,
          contacts: c.contacts.filter((_, i) => i !== idx),
          stats: clampStats({ ...c.stats, happiness: c.stats.happiness - penalty }),
        };
        const final: Character = dropStrayAilments({ ...gone, log: [...gone.log, { age: gone.age, year: gone.birthYear + gone.age, text: partingLine(me.name, me.kind), kind: 'event' } as LogEntry] });
        persist(final, 'playing');
        set({ character: final, section: null, notice: { title: 'Lost', eyebrow: cap(ref), text: partingLine(me.name, me.kind) } });
        return;
      }
      persist(c, 'playing');
      set({ character: c, section: null, notice: { title: 'Given', eyebrow: cap(ref), text: said.notice } });
      return;
    }

    const idx = character.family.findIndex((m) => m.id === id);
    if (idx < 0) return;
    const me = character.family[idx];
    const ref = kinshipRef(me, character.family);
    if (Math.random() < giftRefusalChance(me.bond)) {
      const bumped = { ...me, bond: clampPerformance(me.bond - 5) };
      const family = [...character.family];
      family[idx] = bumped;
      const c: Character = {
        ...character,
        family,
        stats: clampStats({ ...character.stats, happiness: character.stats.happiness - 1 }),
        log: [...character.log, { age: character.age, year: character.birthYear + character.age, text: `${cap(ref)} would not take the ${name}.`, kind: 'event' } as LogEntry],
      };
      if (bumped.bond <= 0) {
        const penalty = bondLossPenalty(me);
        const gone: Character = {
          ...c,
          family: c.family.filter((_, i) => i !== idx),
          stats: clampStats({ ...c.stats, happiness: c.stats.happiness - penalty }),
        };
        const goneEntry: LogEntry = {
          age: gone.age,
          year: gone.birthYear + gone.age,
          text: `${me.firstName} no longer wants you in their life.`,
          kind: 'event',
        };
        const final: Character = dropStrayAilments({ ...gone, log: [...gone.log, goneEntry] });
        persist(final, 'playing');
        set({ character: final, section: null, notice: { title: 'Lost', eyebrow: cap(ref), text: goneEntry.text } });
        return;
      }
      persist(c, 'playing');
      set({ character: c, section: null, notice: { title: 'Refused', eyebrow: cap(ref), text: `${cap(ref)} would not take the ${name}.` } });
      return;
    }
    const reaction = giftReaction(item, me.status, memberAge(me, character.age));
    const he = cap(pronoun(kinGender(me).gender, 'subj'));
    const said = giftResult(reaction, he, name);
    const family = [...character.family];
    family[idx] = { ...me, bond: clampPerformance(me.bond + GIFT_BOND.family[reaction]) };
    belongings.splice(index, 1);
    const c: Character = {
      ...character,
      family,
      belongings,
      stats: clampStats({ ...character.stats, happiness: character.stats.happiness + GIFT_HAPPINESS[reaction] }),
      log: [...character.log, { age: character.age, year: character.birthYear + character.age, text: `You gave the ${name} to ${ref}.${said.journal}`, kind: 'event' } as LogEntry],
    };
    if (family[idx]!.bond <= 0) {
      const penalty = bondLossPenalty(me);
      const gone: Character = {
        ...c,
        family: c.family.filter((_, i) => i !== idx),
        stats: clampStats({ ...c.stats, happiness: c.stats.happiness - penalty }),
      };
      const goneEntry: LogEntry = {
        age: gone.age,
        year: gone.birthYear + gone.age,
        text: `${me.firstName} no longer wants you in their life.`,
        kind: 'event',
      };
      const final: Character = dropStrayAilments({ ...gone, log: [...gone.log, goneEntry] });
      persist(final, 'playing');
      set({ character: final, section: null, notice: { title: 'Lost', eyebrow: cap(ref), text: goneEntry.text } });
      return;
    }
    persist(c, 'playing');
    set({ character: c, section: null, notice: { title: 'Given', eyebrow: cap(ref), text: said.notice } });
  },

  eatItem: (index) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (!canActSocially(character)) return;
    const belongings = [...(character.belongings ?? [])];
    if (index < 0 || index >= belongings.length) return;
    const item = itemById(belongings[index] ?? '');
    if (!item?.sates) return;
    belongings.splice(index, 1);
    const name = item.text.toLowerCase();
    const c: Character = {
      ...character,
      belongings,
      satiety: Math.max(0, Math.min(100, (character.satiety ?? 80) + item.sates)),
      stats: clampStats({ ...character.stats, happiness: character.stats.happiness + 1 }),
      log: [
        ...character.log,
        {
          age: character.age,
          year: character.birthYear + character.age,
          text: `You ate the ${name}.`,
          kind: 'event',
        } as LogEntry,
      ],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: item.text, eyebrow: 'Belongings', text: item.notice },
    });
  },

  takeBeg: (kind) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (!canActSocially(character)) return;
    const def = ACTIVITIES.find((a) => a.key === 'beg');
    if (!def || !isOpen(def, character)) return;
    const resolved = resolveActivity(def, character.eraId);
    if (character.serving) {
      set({
        section: null,
        notice: { title: resolved.text, eyebrow: 'War', text: 'There is a war on. That will have to wait.' },
      });
      return;
    }
    if ((character.begsThisYear ?? 0) >= BEG_CAP) {
      set({
        section: null,
        notice: { title: resolved.text, eyebrow: 'Action', text: 'No one stops any more.' },
      });
      return;
    }
    const begsThisYear = (character.begsThisYear ?? 0) + 1;
    if (Math.random() >= BEG_CHANCE) {
      const c: Character = {
        ...character,
        begsThisYear,
        stats: clampStats({ ...character.stats, happiness: character.stats.happiness - 1 }),
        log: [
          ...character.log,
          {
            age: character.age,
            year: character.birthYear + character.age,
            text: 'No one stopped for you.',
            kind: 'event',
          } as LogEntry,
        ],
      };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        notice: { title: resolved.text, eyebrow: 'Action', text: 'No one stops.' },
      });
      return;
    }
    if (kind === 'food') {
      const staple = stapleFor(character);
      if (!staple) return;
      const c: Character = {
        ...character,
        begsThisYear,
        belongings: [...(character.belongings ?? []), staple.id],
        stats: clampStats({
          ...character.stats,
          reputation: (character.stats.reputation ?? 50) - 1,
        }),
        log: [
          ...character.log,
          {
            age: character.age,
            year: character.birthYear + character.age,
            text: 'A stranger shared food with you.',
            kind: 'event',
          } as LogEntry,
        ],
      };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        notice: { title: resolved.text, eyebrow: 'Action', text: staple.notice },
      });
      return;
    }
    const era = getEra(character.eraId);
    const pay = 1 * era.moneyScale;
    const symbol = moneySymbolOf(character);
    const c: Character = {
      ...character,
      begsThisYear,
      money: character.money + pay,
      stats: clampStats({
        ...character.stats,
        reputation: (character.stats.reputation ?? 50) - 1,
      }),
      log: [
        ...character.log,
        {
          age: character.age,
          year: character.birthYear + character.age,
          text: `A stranger spared you ${formatFunds(pay, symbol)}.`,
          kind: 'event',
        } as LogEntry,
      ],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: resolved.text, eyebrow: 'Action', text: `They press ${formatFunds(pay, symbol)} into your hand.` },
    });
  },

  finishBook: (bookId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    const book = BOOKS.find((b) => b.id === bookId);
    if (!book || !eligibleBooks(character).some((b) => b.id === bookId)) return;
    const lib = ACTIVITIES.find((a) => a.key === 'library');
    if (!lib || !isOpen(lib, character)) return;

    // a finished book pays what the library would have, scaled the same way
    const scale = effectiveness(
      character.activityHeat['library'] ?? 1,
      character.stats.health,
      character.stats.energy,
    );
    const c: Character = {
      ...character,
      stats: clampStats({
        ...character.stats,
        smarts: character.stats.smarts + book.smarts * scale,
        happiness:
          character.stats.happiness + (book.happiness ?? 0) * scale,
      }),
      activityHeat: {
        ...character.activityHeat,
        library: wearHabit(character, 'library', 0),
      },
      activityAged: { ...character.activityAged, library: 0 },
      activitiesUsed: [...character.activitiesUsed, 'library'],
      log: [
        ...character.log,
        {
          age: character.age,
          year: character.birthYear + character.age,
          text: book.journal,
          kind: 'event',
        } as LogEntry,
      ],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: { title: book.title, eyebrow: 'Action', text: book.notice },
    });
  },

  takeGig: (gigId, multiple) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    if (character.age < GIG_AGE) return;
    const gig = GIGS.find((g) => g.id === gigId);
    if (!gig || !gigsFor(character).some((g) => g.id === gigId)) return;
    if (!GIG_MULTIPLES.includes(multiple)) return;
    if (character.serving) {
      set({
        section: null,
        notice: { title: gig.text, eyebrow: 'War', text: 'There is a war on. That will have to wait.' },
      });
      return;
    }

    // the year's gigs are spent; asking again just hears nothing
    const spent = character.gigsThisYear >= gigCap(Math.min(character.stats.health, character.stats.energy ?? 70));
    const landed = !spent && Math.random() < gigChance(multiple, character.age);
    if (!landed && spent) {
      set({
        section: null,
        notice: { title: gig.text, eyebrow: 'Gig', text: 'No answer comes back.' },
      });
      return;
    }
    const pay = landed ? gigPayout(gig, multiple, character) : 0;
    const symbol = moneySymbolOf(character);
    const c: Character = {
      ...character,
      money: character.money + pay,
      stats: clampStats({
        ...character.stats,
        energy: (character.stats.energy ?? 70) - (landed ? 3 : 0),
      }),
      // only work that pays spends the year's gigs; asking is free
      gigsThisYear: character.gigsThisYear + (landed ? 1 : 0),
      gigsDone: (character.gigsDone ?? 0) + (landed ? 1 : 0),
      log: [
        ...character.log,
        {
          age: character.age,
          year: character.birthYear + character.age,
          text: landed
            ? `You ${gig.text.toLowerCase()} for ${formatFunds(pay, symbol)}.`
            : `You asked about ${gig.text.toLowerCase()} work and heard nothing back.`,
          kind: 'event',
        } as LogEntry,
      ],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: gig.text,
        eyebrow: 'Gig',
        text: landed
          ? `It comes through: ${formatFunds(pay, symbol)}.`
          : 'No answer comes back.',
      },
    });
  },

  requestInterview: (jobId) => {
    const { character } = get();
    if (!character || !character.alive) return;
    if (get().activeEvent) return;
    const job = jobById(character.eraId, jobId);
    if (!job) return;
    // degree posts need the degree first
    if (job.requiresDegree && !(character.degrees ?? []).includes(job.requiresDegree)) {
      set({
        section: null,
        notice: { title: job.title, eyebrow: 'Work', text: 'They wanted to see a degree.' },
      });
      return;
    }
    // posts on wheels need the wheels first
    if (job.requiresVehicle && !ownsVehicle(character)) {
      set({
        section: null,
        notice: { title: job.title, eyebrow: 'Work', text: 'They needed someone with their own transport.' },
      });
      return;
    }
    if (character.serving) {
      set({
        section: null,
        notice: { title: job.title, eyebrow: 'War', text: 'There is a war on. That will have to wait.' },
      });
      return;
    }
    // only posts you are old and sharp enough to hold
    if (character.age < job.minAge || character.stats.smarts < job.smartsRequired) return;
    // only once school is behind you
    if (schoolName(character) !== null || character.age < workStartAge(character.eraId)) return;
    // past the year's asks, nobody calls back
    if (character.jobHuntsThisYear >= huntCap(Math.min(character.stats.health, character.stats.energy ?? 70))) {
      set({
        section: null,
        notice: { title: job.title, eyebrow: 'Work', text: 'Nobody is hiring right now.' },
      });
      return;
    }

    const accepted = Math.random() < huntChance(character);
    const asked: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: accepted
        ? `You asked ${job.title} for an interview.`
        : `You asked ${job.title} for work and heard nothing.`,
      kind: 'event',
    };
    if (!accepted) {
      // a no costs nothing but pride: only landed interviews spend the year
      const c: Character = {
        ...character,
        log: [...character.log, asked],
      };
      persist(c, 'playing');
      set({
        character: c,
        section: null,
        notice: { title: job.title, eyebrow: 'Work', text: huntRejectionReason(character) },
      });
      return;
    }
    // they agree to see you: the interview goes through the usual chain
    const c: Character = {
      ...character,
      jobHuntsThisYear: character.jobHuntsThisYear + 1,
      log: [...character.log, asked],
    };
    const era = getEra(character.eraId);
    const staged = stageEvent(c, interviewEvent(c, job), era.moneyScale);
    persist(staged.character, 'playing');
    set({
      character: staged.character,
      section: null,
      notice: null,
      activeEvent: staged.activeEvent,
      mustChoose: staged.activeEvent.event.choices.length > 0,
      pendingJobId: job.id,
    });
  },

  study: () => {
    const { character } = get();
    if (!character || !character.alive || !character.schoolId) return;
    const school = schoolName(character);
    // in poor health the mind only takes so much; you may still sit
    // down and study, but past the cap it costs more than it gives
    const cap = studyCap(Math.min(character.stats.health, character.stats.energy ?? 70));
    const gain = character.studiesThisYear < cap;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: gain
        ? `You studied hard at ${school ?? 'school'}.`
        : `You pushed through more study at ${school ?? 'school'} and felt it.`,
      kind: 'event',
    };
    const c: Character = {
      ...character,
      stats: clampStats({
        ...character.stats,
        smarts: character.stats.smarts + (gain ? 5 : 1),
        health: character.stats.health - (gain ? 0 : 1),
        energy: (character.stats.energy ?? 70) - (gain ? 2 : 6),
      }),
      performance: clampPerformance(character.performance + (gain ? 12 : 3)),
      studiesThisYear: character.studiesThisYear + 1,
      log: [...character.log, entry],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: 'Study',
        eyebrow: school ?? undefined,
        text: gain
          ? 'You read until the light faded.'
          : 'Your eyes give out before you do. You are running on empty.',
      },
    });
  },

  workHarder: () => {
    const { character } = get();
    if (!character || !character.alive || !character.jobId) return;
    const title = jobTitle(character);
    const cap = shiftCap(Math.min(character.stats.health, character.stats.energy ?? 70));
    const gain = character.shiftsThisYear < cap;
    // work and study at once wears you down faster, in body and mood
    const double = !!character.uniId;
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: gain
        ? `You put in the long hours as ${title ?? 'a worker'}.`
        : `You kept at it as ${title ?? 'a worker'} until your body gave out.`,
      kind: 'event',
    };
    const c: Character = {
      ...character,
      stats: clampStats({
        ...character.stats,
        health: character.stats.health - (gain ? 1 : 7) - (double ? 2 : 0),
        energy: (character.stats.energy ?? 70) - (gain ? 4 : 7) - (double ? 2 : 0),
        happiness: character.stats.happiness - (gain ? 2 : 4) - (double ? 3 : 0),
      }),
      performance: clampPerformance(character.performance + (gain ? 15 : 3)),
      // only the capped shifts count towards the year's raise roll
      workedHard: gain,
      shiftsThisYear: character.shiftsThisYear + 1,
      log: [...character.log, entry],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: 'Worked harder',
        eyebrow: title ?? undefined,
        text: gain
          ? 'You stayed late and took on more than your share.'
          : 'You are worn through. Another hour like that and you will not get up.',
      },
    });
  },

  quitJob: () => {
    const { character } = get();
    if (!character || !character.alive || !character.jobId) return;
    const title = jobTitle(character);
    const entry: LogEntry = {
      age: character.age,
      year: character.birthYear + character.age,
      text: `You quit your job as ${title ?? 'a worker'}.`,
      kind: 'event',
    };
    const c: Character = {
      ...character,
      jobId: null,
      jobRaises: 0,
      jobYears: 0,
      workedHard: false,
      performance: 0,
      crewFor: null,
      coworkers: [],
      log: [...character.log, entry],
    };
    persist(c, 'playing');
    set({
      character: c,
      section: null,
      notice: {
        title: 'Resigned',
        eyebrow: title ?? undefined,
        text: 'You hand in your notice and walk out for the last time.',
      },
    });
  },

  dismissNotice: () => {
    // a queued fallout (a lover noticing, and the like) takes the
    // popup's place once its notice is gone
    const { activeEvent, pending } = get();
    if (activeEvent || pending.length === 0) {
      set({ notice: null });
      return;
    }
    const [next, ...rest] = pending;
    set({
      notice: null,
      activeEvent: next,
      pending: rest,
      mustChoose: next.event.choices.length > 0,
    });
  },
}));
