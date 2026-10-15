import type { Character, Contact, EraId, FamilyMember, LifeEvent, LogEntry, Orientation, Stats } from '../types';
import { randomName, type NameGender } from '../data/names';
import { occupationsFor } from './family';
import { ERA_ORDER } from '../data/eras';
import { partingLine } from './bonds';

/**
 * People and animals who enter a life outside the birth household:
 * friends, partners, pets. Each carries a bond that can be built up
 * or worn down, and they leave when it runs out.
 */

const PET_KINDS: Record<EraId, string[]> = {
  'ancient-world': ['a dog', 'a cat', 'a hunting falcon', 'a dormouse'],
  medieval: ['a scruffy dog', 'a barn cat', 'a pony', 'a hawk'],
  'age-of-sail': ['a ship’s cat', 'a mongrel dog', 'a parrot', 'a pony'],
  industrial: ['a terrier', 'a grey cat', 'a canary', 'a mongrel dog'],
  atomic: ['a terrier', 'a grey cat', 'a canary', 'a goldfish'],
  'modern-day': ['a dog', 'a cat', 'a hamster', 'a rabbit'],
};

const PET_AGES: Record<EraId, number[]> = {
  'ancient-world': [1, 2, 3, 5],
  medieval: [1, 2, 3, 5],
  'age-of-sail': [1, 2, 4, 6],
  industrial: [1, 2, 4, 6],
  atomic: [1, 2, 4, 7],
  'modern-day': [1, 2, 4, 7],
};

const PARTNER_ROLES: Record<EraId, string[]> = {
  'ancient-world': [
    'in the house',
    'at the olive press',
    'in the arena',
    'at the baths',
  ],
  medieval: [
    'at the market stall',
    'in the wool trade',
    'keeping house',
    'at the smithy',
  ],
  'age-of-sail': [
    'on the quay',
    'in the counting house',
    'running the alehouse',
    'aboard a ship',
  ],
  industrial: [
    'at the mill',
    'at the office',
    'in the schoolroom',
    'running the lodging house',
  ],
  atomic: [
    'at the office',
    'teaching school',
    'in the factory',
    'at the hospital',
  ],
  'modern-day': [
    'at the hospital',
    'teaching',
    'in design',
    'at the shop next door',
  ],
};

/** What a friend does for a living, drawn once at creation. */
export const FRIEND_TRADES: Record<EraId, string[]> = {
  'ancient-world': [
    'a legionary', 'a scribe', 'a blacksmith', 'a merchant', 'a priest',
  ],
  medieval: [
    'a blacksmith', 'a baker', 'a mason', 'a weaver', 'a priest',
  ],
  'age-of-sail': [
    'a sailor', 'a clerk', 'a surgeon', 'a merchant', 'a blacksmith',
  ],
  industrial: [
    'a mill worker', 'an engineer', 'a clerk', 'a baker', 'a teacher',
  ],
  atomic: [
    'a clerk', 'an engineer', 'a nurse', 'a teacher', 'a driver',
  ],
  'modern-day': [
    'an officer', 'a baker', 'a nurse', 'a driver', 'a teacher',
  ],
};

/** Age band new friends arrive in; their age counts on from here. */
const MEETING_AGE = 22;

/** Bonds fade very slowly — a bit a year of neglect. */
const YEARLY_FADE = 0.7;

/** Below this, you are still at school yourself. */
const WORKING_AGE = 18;

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** How to refer to someone by pronoun, given their gender. */
export function pronoun(gender: string, form: 'subj' | 'obj' | 'poss' = 'subj'): string {
  const g = gender.toLowerCase();
  if (g === 'animal') return 'it';
  if (g === 'female') return form === 'obj' || form === 'poss' ? 'her' : 'she';
  if (g === 'male') return form === 'obj' ? 'him' : form === 'poss' ? 'his' : 'he';
  return form === 'obj' ? 'them' : form === 'poss' ? 'their' : 'they';
}

/** A member's gender, taken from the relation they hold. */
export function kinGender(m: FamilyMember): { name: string; gender: string } {
  return {
    name: m.firstName,
    gender:
      m.relation === 'mother' || m.relation === 'sister' ? 'Female' : 'Male',
  };
}

/** Third-person forms for a FamilyMember. */
export function kinPronouns(m: FamilyMember): {
  they: string;
  them: string;
  their: string;
} {
  return pronounsFor(
    m.relation === 'mother' || m.relation === 'sister' ? 'Female' : 'Male',
  );
}

/**
 * Fill a variant's placeholders: {name} who they are, {they} {them}
 * {their} their pronouns, {trade} what they actually do.
 */
export function fillVariant(
  template: string,
  m: { name: string; gender: string },
  extra: { name: string; trade: string; money?: string },
): string {
  const p = pronounsFor(m.gender);
  const was = m.gender.toLowerCase() === 'animal' ? 'is' : 'was';
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return template
    .replaceAll('{name}', extra.name)
    .replaceAll('{trade}', extra.trade)
    .replaceAll('{money}', extra.money ?? '')
    .replaceAll('{was}', was)
    .replaceAll('{They}', cap(p.they))
    .replaceAll('{they}', p.they)
    .replaceAll('{them}', p.them)
    .replaceAll('{their}', p.their);
}

/** Fill {they} {them} {their} {his} {her} with the right forms. */
export function pronounsFor(gender: string): {
  they: string;
  them: string;
  their: string;
} {
  return {
    they: pronoun(gender, 'subj'),
    them: pronoun(gender, 'obj'),
    their: pronoun(gender, 'poss'),
  };
}

/** Bonds keep their fraction: a slow fade must not round back to itself. */
function clampBond(v: number): number {
  return Math.max(0, Math.min(100, v));
}

/** What a new lover can put toward the house; rolled once, kept. */
export function rollPartnerWealth(rng: () => number = Math.random): number {
  return 15 + Math.floor(rng() * 70);
}

/** Build the contact an event's `meet` effect calls for. */
export function makeContact(
  c: Character,
  kind: Contact['kind'],
  status: string,
  rng: () => number = Math.random,
): Contact {
  const id = `con-${Date.now()}-${Math.floor(rng() * 1e6)}`;
  if (kind === 'pet') {
    return {
      id,
      name: pick(PET_KINDS[c.eraId] ?? PET_KINDS['modern-day'], rng),
      kind,
      gender: 'animal',
      status: 'kept at home',
      ageAtMeeting: pick(PET_AGES[c.eraId] ?? PET_AGES['modern-day'], rng),
      petName: null,
      bond: 60,
      yearsKnown: 0,
    };
  }
  const orientation = rollOrientation(rng);
  // a partner arrives already into you: their sex follows what you go
  // for, and their own tastes follow them
  let sex: NameGender = rng() < 0.5 ? 'male' : 'female';
  let theirs = orientation;
  if (kind === 'partner') {
    const mine = (c.orientation ?? 'straight') as Orientation;
    if (mine === 'straight' && (c.gender === 'Female' || c.gender === 'Male')) {
      sex = c.gender === 'Female' ? 'male' : 'female';
    } else if (mine === 'gay' && (c.gender === 'Female' || c.gender === 'Male')) {
      sex = c.gender === 'Female' ? 'female' : 'male';
    }
    theirs =
      sex !== (c.gender === 'Female' ? 'female' : 'male')
        ? rng() < 0.85
          ? 'straight'
          : 'bisexual'
        : rng() < 0.85
          ? 'gay'
          : 'bisexual';
  }
  const name = randomName(c.eraId, c.placeId, rng, sex);
  // what they do is picked once, here, so it never changes under the
  // player; where you met them is kept on the status, out of the way
  const trade =
    kind === 'partner'
      ? pick(PARTNER_ROLES[c.eraId] ?? PARTNER_ROLES['modern-day'], rng)
      : pick(FRIEND_TRADES[c.eraId] ?? FRIEND_TRADES['modern-day'], rng);
  // someone you meet as a child is a child too, not a grown adult:
  // they arrive around your own age and grow up alongside you
  const ageAtMeeting =
    c.age < 18
      ? Math.max(4, c.age - 2 + Math.floor(rng() * 5))
      : MEETING_AGE + Math.floor(rng() * 16);
  return {
    id,
    name,
    gender: sex === 'male' ? 'Male' : 'Female',
    orientation: theirs,
    kind,
    status,
    trade,
    wealth: rollPartnerWealth(rng),
    ageAtMeeting,
    metAtAge: c.age,
    petName: null,
    bond: 50,
    yearsKnown: 0,
  };
}
/** A contact's current age: it moves with yours. */
export function contactAge(m: Contact, characterAge: number): number {
  // you were in the same class, so you have always been the same age
  if (m.status === SCHOOL_FRIEND_STATUS) return characterAge;
  // old saves predate metAtAge: estimate it from how long you have known them
  const metAt = m.metAtAge ?? Math.max(0, characterAge - m.yearsKnown);
  return Math.max(0, m.ageAtMeeting + (characterAge - metAt));
}

/** The status a school friend carries once they are in the Circle. */
export const SCHOOL_FRIEND_STATUS = 'a friend from school';

/**
 * What they do now. A school friend is a student while they are still
 * one, and afterwards works somewhere — the same place every time you
 * look, since it is derived from who they are rather than rolled.
 */
export function contactTrade(m: Contact, characterAge: number, eraId: EraId): string {
  if (m.kind === 'pet') return m.status;
  if (m.status !== SCHOOL_FRIEND_STATUS) return m.trade ?? tradeFor(m, eraId);
  if (contactAge(m, characterAge) < WORKING_AGE) return 'a student';
  return tradeFor(m, eraId);
}

/**
 * A trade picked once and kept: stored at creation for new friends,
 * hashed off the id for older saves that predate the field.
 */
function tradeFor(m: Contact, eraId: EraId): string {
  if (m.trade) return m.trade;
  const trades =
    m.kind === 'partner'
      ? (PARTNER_ROLES[eraId] ?? [])
      : (FRIEND_TRADES[eraId] ?? []);
  if (trades.length === 0) return 'at work';
  // stable per person: hash the id so it never shifts under you
  let hash = 0;
  for (const ch of m.id) hash = (hash * 31 + ch.charCodeAt(0)) % 9973;
  return trades[hash % trades.length];
}

/** How a contact reads in the list: "your friend Ed J", "a scruffy dog". */
export function contactRef(m: Contact): string {
  if (m.kind === 'pet') return m.petName ?? m.name;
  if (m.kind === 'partner') {
    if (m.married) {
      if (m.gender === 'Female') return `your wife ${m.name}`;
      if (m.gender === 'Male') return `your husband ${m.name}`;
      return `your spouse ${m.name}`;
    }
    if (m.engaged) {
      if (m.gender === 'Female') return `your fiancée ${m.name}`;
      if (m.gender === 'Male') return `your fiancé ${m.name}`;
      return `your betrothed ${m.name}`;
    }
    return `your partner ${m.name}`;
  }
  return `your friend ${m.name}`;
}

/**
 * What they are like, fixed for life. Derived off who they are, so it
 * never shifts under you and needs no storing.
 */
export function contactStats(m: Contact): Stats {
  const out = {} as Stats;
  (['health', 'happiness', 'smarts', 'looks', 'energy', 'reputation'] as const).forEach((k) => {
    let hash = 0;
    const seed = `${m.id}:${k}`;
    for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) % 9973;
    out[k] = 30 + (hash % 51);
  });
  return out;
}

/** Old enough to know who you are. */
export const IDENTITY_AGE = 6;

/** Old enough to act on it. */
export const FLIRT_AGE = 12;

/** Old enough to ask someone to be yours. */
export const ASKOUT_AGE = 10;

/** Most people are straight; some are not. Rolled once, kept. */
export function rollOrientation(rng: () => number = Math.random): Orientation {
  const r = rng();
  if (r < 0.8) return 'straight';
  if (r < 0.9) return 'gay';
  return 'bisexual';
}

/** From the industrial age on, who you are is yours to say. */
function freeIdentities(eraId: EraId): boolean {
  return ERA_ORDER.indexOf(eraId) >= ERA_ORDER.indexOf('industrial');
}

/** Old enough to say who you are drawn to, in any period. */
export function canChooseOrientation(c: Character): boolean {
  return c.age >= IDENTITY_AGE;
}

/** Old enough to say what you are — only once industry arrives. */
export function canChooseGender(c: Character): boolean {
  return c.age >= IDENTITY_AGE && freeIdentities(c.eraId);
}

/**
 * Whether the flirt button shows for this person. Never animals, and
 * children only with children: school age can look sideways at school
 * age, grown people at grown people. Before industry only the opposite
 * sex is on the table at all. After that, whoever your attraction
 * allows.
 */
export function canFlirtWith(player: Character, m: Contact): boolean {
  if (m.kind !== 'friend' && m.kind !== 'partner') return false;
  if (player.age < IDENTITY_AGE) return false;
  const tAge = contactAge(m, player.age);
  if (tAge < IDENTITY_AGE) return false;
  if ((player.age < FLIRT_AGE) !== (tAge < FLIRT_AGE)) return false;
  if (!freeIdentities(player.eraId)) return m.gender !== player.gender;
  const mine = player.orientation ?? 'straight';
  if (mine === 'bisexual') return true;
  if (mine === 'gay') return m.gender === player.gender;
  return m.gender !== player.gender;
}

/**
 * Whether the ask-out button shows: the flirting pool, friends only,
 * and old enough to mean it. A record closes some doors.
 */
export function canAskOut(player: Character, m: Contact): boolean {
  if (m.kind !== 'friend') return false;
  if (player.age < ASKOUT_AGE) return false;
  if (player.offences > 1) return false;
  return canFlirtWith(player, m);
}

/** Old enough to marry. */
export const MARRY_AGE = 18;

/**
 * Whether the proposal button shows: a lover, grown, not yet
 * promised or wed.
 */
export function canPropose(player: Character, m: Contact): boolean {
  return (
    m.kind === 'partner' &&
    !m.engaged &&
    !m.married &&
    player.age >= MARRY_AGE
  );
}

/** Whether the wedding button shows: promised, grown, not yet wed. */
export function canMarry(player: Character, m: Contact): boolean {
  return (
    m.kind === 'partner' &&
    !!m.engaged &&
    !m.married &&
    player.age >= MARRY_AGE
  );
}

/** A lover saying they are done: let them go, or beg them to stay. */
export function leaveEvent(m: Contact): LifeEvent {
  return {
    id: `lover-leaving-${m.id}`,
    title: 'Leaving',
    description: `${m.name} says it is over.`,
    category: 'social',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'let-go',
        text: 'Let them go',
        effects: {
          stats: { happiness: -bondLossPenalty(m) },
          journal: partingLine(m.name, m.kind),
          result: 'You let them go.',
        },
      },
      {
        id: 'beg',
        text: 'Beg them to stay',
        effects: {
          journal: `You begged ${m.name} to stay.`,
          result: 'You ask them to stay.',
        },
      },
    ],
  };
}

/** Ending it yourself, and they ask you not to. */
export function begsEvent(m: Contact): LifeEvent {
  return {
    id: `lover-begs-${m.id}`,
    title: 'Wait',
    description: `${m.name} is asking you not to do this.`,
    category: 'social',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'through',
        text: 'End it anyway',
        effects: {
          stats: { happiness: -bondLossPenalty(m) },
          journal: `You ended it with ${m.name}.`,
          result: 'It is over because you said so.',
        },
      },
      {
        id: 'back',
        text: 'Back down',
        effects: {
          stats: { happiness: 2 },
          journal: `You almost ended it with ${m.name}.`,
          result: 'Not today, then.',
        },
      },
    ],
  };
}

/** A spouse stopping an ask-out: go through with it, or think again. */
export function confrontEvent(spouse: Contact, askee: Contact): LifeEvent {
  const he = cap(pronoun(spouse.gender, 'subj'));
  return {
    id: `askout-confront-${askee.id}`,
    title: 'Stop',
    description: `${spouse.name} heard what you are about to do, and does not approve. Hurt, ${he.toLowerCase()} asks you to think again.`,
    category: 'social',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'proceed',
        text: 'Ask anyway',
        effects: {
          journal: `You asked ${askee.name} to be yours anyway.`,
          result: 'You do not listen.',
        },
      },
      {
        id: 'drop',
        text: 'Nevermind',
        effects: {
          journal: 'You thought better of it.',
          result: 'You let it go.',
        },
      },
    ],
  };
}

/**
 * What a lover's leaving or begging comes to. Same shape as the job
 * chains, so the store stages it the same way: removals and reprieves
 * happen here, follow-up popups queue behind.
 */
export function loverFlowStep(
  eventId: string,
  choiceId: string,
  c: Character,
): { character: Character; events: LifeEvent[]; jobId: null } | null {
  let m = /^lover-leaving-(.+)$/.exec(eventId);
  if (m) {
    const me = c.contacts.find((x) => x.id === m![1]);
    if (!me) return { character: c, events: [], jobId: null };
    if (choiceId === 'beg') {
      const times = me.begs ?? 0;
      const redeemed =
        Math.random() < (times === 0 ? 0.1 : times === 1 ? 0.03 : 0);
      const begged = { ...me, begs: times + 1 };
      if (redeemed) {
        const stayed = c.contacts.map((x) =>
          x.id === me.id ? { ...begged, bond: 10 } : x,
        );
        return {
          character: { ...c, contacts: stayed },
          events: [
            {
              id: `lover-stayed-${me.id}`,
              title: 'Staying',
              description: `${me.name} stays.`,
              category: 'social',
              conditions: {},
              weight: 0,
              choices: [],
              effects: {
                stats: { happiness: 4 },
                journal: `You begged ${me.name} to stay, and they did.`,
              },
            },
          ],
          jobId: null,
        };
      }
      return {
        character: {
          ...c,
          contacts: c.contacts.map((x) => (x.id === me.id ? begged : x)).filter((x) => x.id !== me.id),
        },
        events: [
          {
            id: `lover-left-${me.id}`,
            title: 'Gone',
            description: `${me.name} goes.`,
            category: 'social',
            conditions: {},
            weight: 0,
            choices: [],
            effects: { journal: partingLine(me.name, me.kind) },
          },
        ],
        jobId: null,
      };
    }
    return {
      character: { ...c, contacts: c.contacts.filter((x) => x.id !== me.id) },
      events: [],
      jobId: null,
    };
  }
  m = /^askout-confront-(.+)$/.exec(eventId);
  if (m) {
    const askee = c.contacts.find((x) => x.id === m![1]);
    if (!askee || askee.kind !== 'friend') return { character: c, events: [], jobId: null };
    if (choiceId !== 'proceed') return { character: c, events: [], jobId: null };
    // through with it: the new lover joins, other lovers go, spouses strain
    let contacts = c.contacts.map((x) =>
      x.id === askee.id ? { ...x, kind: 'partner' as const } : x,
    );
    const log: LogEntry[] = [];
    const events: LifeEvent[] = [];
    // the ask itself already raised happiness; only fallout counts here
    let happiness = 0;
    for (const d of contacts.filter(
      (x) => x.kind === 'partner' && !x.married && x.id !== askee.id,
    )) {
      contacts = contacts.filter((x) => x.id !== d.id);
      log.push({
        age: c.age,
        year: c.birthYear + c.age,
        text: partingLine(d.name, d.kind),
        kind: 'event',
      });
    }
    for (const s of contacts.filter((x) => x.kind === 'partner' && x.married)) {
      const strainedBond = clampBond(s.bond - 40);
      contacts = contacts.map((x) => (x.id === s.id ? { ...x, bond: strainedBond } : x));
      log.push({
        age: c.age,
        year: c.birthYear + c.age,
        text: `${s.name} heard about it.`,
        kind: 'event',
      });
      if (Math.random() < 0.35 || strainedBond <= 0) {
        // going through with it divorces far more often than drifting apart
        if (Math.random() < 0.4) {
          events.push(begsEvent({ ...s, bond: strainedBond }));
        } else {
          happiness -= bondLossPenalty(s);
          contacts = contacts.filter((x) => x.id !== s.id);
          const text = `You divorced ${s.name}.`;
          log.push({ age: c.age, year: c.birthYear + c.age, text, kind: 'event' });
          events.push({
            id: `askout-divorced-${s.id}`,
            title: 'Divorced',
            description: text,
            category: 'social',
            conditions: {},
            weight: 0,
            choices: [],
            effects: { journal: text },
          });
        }
      } else {
        const text = `${s.name} heard about it.`;
        events.push({
          id: `askout-strained-${s.id}`,
          title: 'Strained',
          description: text,
          category: 'social',
          conditions: {},
          weight: 0,
          choices: [],
          effects: { journal: text },
        });
      }
    }
    return {
      character: {
        ...c,
        contacts,
        stats: { ...c.stats, happiness: Math.max(0, Math.min(100, c.stats.happiness + happiness)) },
        log: [...c.log, ...log],
      },
      events,
      jobId: null,
    };
  }
  m = /^lover-begs-(.+)$/.exec(eventId);
  if (m) {
    const me = c.contacts.find((x) => x.id === m![1]);
    if (!me) return { character: c, events: [], jobId: null };
    if (choiceId === 'through') {
      return {
        character: { ...c, contacts: c.contacts.filter((x) => x.id !== me.id) },
        events: [],
        jobId: null,
      };
    }
    return { character: c, events: [], jobId: null };
  }
  return null;
}

/**
 * A year passes: everyone ages, and bonds slip. Neglect is slow, but
 * a bond that reaches zero is gone — nobody waits to be pushed out.
 * Returns the survivors and the ones who left this year.
 */
export function driftBonds(c: Character): {
  contacts: Contact[];
  lost: Contact[];
} {
  const contacts: Contact[] = [];
  const lost: Contact[] = [];
  for (const m of c.contacts) {
    const next = {
      ...m,
      yearsKnown: m.yearsKnown + 1,
      bond: clampBond(m.bond - YEARLY_FADE),
    };
    if (next.bond <= 0) lost.push(m);
    else contacts.push(next);
  }
  return { contacts, lost };
}

/** Family members age and drift the same way. */
export function driftFamily(c: Character): {
  family: FamilyMember[];
  lost: FamilyMember[];
} {
  const family: FamilyMember[] = [];
  const lost: FamilyMember[] = [];
  for (const m of c.family) {
    const currentAge = m.ageAtBirth + c.age;
    // studying ends: grown kin move on to work, infants are at home —
    // the flag must not freeze at birth
    let status = m.status;
    if (status === 'studying' && currentAge >= 20) {
      const r = Math.random();
      if (r < 0.6) {
        const pool = occupationsFor(c.eraId);
        status = pool[Math.floor(Math.random() * pool.length)] ?? 'unemployed';
      } else if (r < 0.8) {
        status = 'unemployed';
      } else {
        status = 'at home';
      }
    }
    if (status === 'studying' && currentAge < 7) status = 'at home';
    const next = {
      ...m,
      status,
      yearsKnown: m.yearsKnown + 1,
      bond: clampBond(m.bond - YEARLY_FADE),
    };
    if (next.bond <= 0) lost.push(m);
    else family.push(next);
  }
  return { family, lost };
}

/**
 * How much happiness losing them costs: deeper bonds hurt more, and
 * long relationships hurt most of all. Works for contacts and kin.
 */
export function bondLossPenalty(m: {
  bond: number;
  yearsKnown: number;
}): number {
  const depth = m.bond / 100;
  const weight = Math.min(1.5, 0.4 + m.yearsKnown / 20);
  return Math.max(2, Math.round(depth * weight * 12));
}

/** Nudge a bond after an interaction and clamp it. */
export function applyBond(m: Contact, delta: number): Contact {
  return { ...m, bond: clampBond(m.bond + delta) };
}