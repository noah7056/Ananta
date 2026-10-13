import type { Character, Contact, FamilyMember, HomeResident, LifeEvent, LogEntry } from '../types';
import { houseById, houseCost, housesFor } from '../data/houses';
import type { TenantEventDef } from '../data/tenants';
import { moneySymbolOf } from '../data/eras';
import { randomName, type NameGender } from '../data/names';
import {
  bondLossPenalty,
  contactAge,
  contactRef,
  contactTrade,
  FRIEND_TRADES,
  leaveEvent,
  rollOrientation,
  rollPartnerWealth,
} from './contacts';
import { partingLine } from './bonds';
import { kinshipRef, memberAge } from './family';
import { formatFunds } from './life';
import { wealthTier } from './wealth';

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

/**
 * Roofs over heads. You live with family until you buy a house of
 * your own; after that, people you ask in share it. Residents are
 * kind-and-id refs, so the dead and the gone must be swept — reads
 * go through `residentsOf`, which only names the living.
 */

/** The rung a rich house gives away; the market's second shelf. */
export const GIFT_HOUSE_ID = 'cottage';

/** Family wealth at which a house may be given away. */
export const GIFT_WEALTH = 85;

/** Odds a rich house buys one in a year, while you own nothing. */
export const GIFT_CHANCE = 0.08;

/** Bond cost of turning a spouse away, and the divorce clock it winds. */
export const REFUSE_BOND = 15;
export const DIVORCE_PER_REFUSAL = 0.05;

/** Name of the owned house, or null while homeless. */
export function houseName(c: Character): string | null {
  if (!c.home) return null;
  return houseById(c.eraId, c.home.houseId)?.text ?? null;
}

/** Where you live, for the Belongings block. */
export function residenceLabel(c: Character): string {
  if (c.home?.movedIn) return houseName(c) ?? 'In lodgings';
  const parents = c.family.some(
    (m) => m.relation === 'mother' || m.relation === 'father',
  );
  if (parents) return 'With your parents';
  if (c.family.length > 0) return 'With family';
  return 'In lodgings';
}

export interface ResidentLine {
  scope: 'contact' | 'family' | 'pet';
  id: string;
  label: string;
  sub: string;
}

/** Everyone sharing your roof who is still around, for display. */
export function residentsOf(c: Character): ResidentLine[] {
  if (!c.home) return [];
  const out: ResidentLine[] = [];
  for (const r of c.home.residents) {
    if (r.scope === 'pet') {
      const m = c.contacts.find((x) => x.id === r.id);
      if (!m || m.kind !== 'pet') continue;
      out.push({
        scope: r.scope,
        id: r.id,
        label: m.petName ?? m.name,
        sub: `Age ${contactAge(m, c.age)}`,
      });
      continue;
    }
    if (r.scope === 'contact') {
      const m = c.contacts.find((x) => x.id === r.id);
      if (!m || m.kind === 'pet') continue;
      const trade = contactTrade(m, c.age, c.eraId);
      out.push({
        scope: r.scope,
        id: r.id,
        label: contactRef(m),
        sub:
          r.rent && r.rent > 0
            ? `Age ${contactAge(m, c.age)} · ${trade} · ${formatFunds(r.rent, moneySymbolOf(c))}/yr`
            : `Age ${contactAge(m, c.age)} · ${trade}`,
      });
    } else {
      const m = c.family.find((x) => x.id === r.id);
      if (!m) continue;
      out.push({
        scope: r.scope,
        id: r.id,
        label: kinshipRef(m, c.family),
        sub: `Age ${memberAge(m, c.age)} · ${m.status}`,
      });
    }
  }
  return out;
}

/** Whether this person (or animal) already lives with you. */
export function isResident(
  c: Character,
  scope: 'contact' | 'family' | 'pet',
  id: string,
): boolean {
  return (c.home?.residents ?? []).some((r) => r.scope === scope && r.id === id);
}

/** Drop residents and tenants who are dead or gone. */
export function sweepResidents(c: Character): Character {
  const sweep = (list: HomeResident[]): HomeResident[] =>
    list.filter((r) =>
      r.scope === 'contact'
        ? c.contacts.some((x) => x.id === r.id)
        : r.scope === 'family'
          ? c.family.some((x) => x.id === r.id)
          : c.contacts.some((x) => x.id === r.id),
    );
  const homeResidents = sweep(c.home?.residents ?? []);
  const rentals = c.rentals.map((r) => ({ ...r, tenants: sweep(r.tenants) }));
  if (
    homeResidents.length === (c.home?.residents ?? []).length &&
    rentals.every((r, i) => r.tenants.length === (c.rentals[i]?.tenants ?? []).length)
  ) {
    return c;
  }
  return {
    ...c,
    home: c.home ? { ...c.home, residents: homeResidents } : c.home,
    rentals,
  };
}

/**
 * Whether the move-in button shows: you own a roof, they are a
 * person (never an animal), they are not already under it, and you
 * have not asked them this year.
 */
export function canInviteHome(
  c: Character,
  m: Contact | FamilyMember,
  isContact: boolean,
): boolean {
  if (!c.home?.movedIn || c.alive === false) return false;
  if (isContact && (m as Contact).kind === 'pet') return false;
  if (isResident(c, isContact ? 'contact' : 'family', m.id)) return false;
  return !(c.invitedThisYear ?? []).includes(
    `${isContact ? 'contact' : 'family'}:${m.id}`,
  );
}

/** Odds an ask to move in lands: closeness carries it, lovers more so. */
export function inviteChance(
  kind: 'contact' | 'family',
  bond: number,
  isPartner: boolean,
): number {
  if (kind === 'family') return Math.min(0.9, 0.35 + bond / 200);
  return Math.min(0.9, 0.25 + bond / 150 + (isPartner ? 0.2 : 0));
}

/** Odds a cohabitant takes the newcomer well; bond with you decides. */
export function welcomeChance(bond: number): number {
  return Math.min(0.9, 0.5 + bond / 200);
}

/**
 * Whoever already lives with you gets a say about a newcomer.
 * Objectors cool toward you; at nothing they move out (contacts
 * leave the Circle too). Pets never object, and the newcomer never
 * objects to themselves.
 */
export function objectToNewcomer(
  c: Character,
  newcomer: string,
  skip?: { scope: string; id: string } | { scope: string; id: string }[],
): { character: Character; lines: string[] } {
  const skips = skip === undefined ? [] : Array.isArray(skip) ? skip : [skip];
  const lines: string[] = [];
  let contacts = [...c.contacts];
  let family = [...c.family];
  let residents = [...(c.home?.residents ?? [])];
  for (const r of c.home?.residents ?? []) {
    if (r.scope === 'pet') continue;
    if (skips.some((s) => s.scope === r.scope && s.id === r.id)) continue;
    const person =
      r.scope === 'contact'
        ? contacts.find((x) => x.id === r.id)
        : family.find((x) => x.id === r.id);
    if (!person) continue;
    if (Math.random() < welcomeChance(person.bond)) continue;
    const ref =
      r.scope === 'contact'
        ? contactRef(person as Contact)
        : kinshipRef(person as FamilyMember, family);
    lines.push(`${cap(ref)} does not take to living with ${newcomer}.`);
    const next = clamp(person.bond - 8);
    if (r.scope === 'contact') {
      contacts = contacts.map((x) => (x.id === r.id ? { ...x, bond: next } : x));
      if (next <= 0) {
        residents = residents.filter((x) => !(x.scope === r.scope && x.id === r.id));
        contacts = contacts.filter((x) => x.id !== r.id);
        lines.push(partingLine((person as Contact).name, (person as Contact).kind));
      }
    } else {
      family = family.map((x) => (x.id === r.id ? { ...x, bond: next } : x));
      if (next <= 0) {
        residents = residents.filter((x) => !(x.scope === r.scope && x.id === r.id));
      }
    }
  }
  if (!c.home) return { character: c, lines };
  return {
    character: { ...c, contacts, family, home: { ...c.home, residents } },
    lines,
  };
}

/** Odds someone asks you to take them in this year. */
export function inboundAskChance(
  c: Character,
  m: Contact | FamilyMember,
  isContact: boolean,
): number {
  if (!isContact) return 0.08;
  const con = m as Contact;
  if (con.kind === 'partner' && !con.married) {
    const dated = (c.datedThisYear ?? []).includes(con.id);
    return 0.1 + (dated ? 0.1 : 0);
  }
  return 0.03;
}

/** The house a rich family gives: the market's second shelf. */
export function giftHouseFor(c: Character) {
  return (
    housesFor(c.eraId).find((h) => h.id === GIFT_HOUSE_ID) ??
    housesFor(c.eraId)[0]
  );
}

/** Someone without your roof asks for room: a lover, kin, a friend. */
export function askedEvent(
  scope: 'contact' | 'family',
  name: string,
  id: string,
  isPartner: boolean,
): LifeEvent {
  const ref = cap(name);
  return {
    id: `home-asked-${scope}-${id}`,
    title: 'Move in',
    description: isPartner
      ? `${ref} wants to live with you.`
      : `${ref} asks if there is room for them.`,
    category: 'social',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'take-in',
        text: 'Take them in',
        effects: {
          stats: { happiness: 4 },
          journal: `${ref} moved in with you.`,
          result: 'You make room, and they take it.',
        },
      },
      {
        id: 'not-yet',
        text: 'Say not yet',
        effects: {
          stats: { happiness: -2 },
          journal: `You told ${ref} not yet.`,
          result: 'It lands badly, and you both know it.',
        },
      },
    ],
  };
}

/** Kin attached to your animal ask to keep it when you take it in. */
export function petKeepEvent(
  petLabel: string,
  memberLabel: string,
  petId: string,
  memberId: string,
): LifeEvent {
  return {
    id: `home-pet-keep-${petId}|${memberId}`,
    title: 'Keep them',
    description: `${cap(memberLabel)} wants to keep ${petLabel}.`,
    category: 'social',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'take',
        text: 'Take them anyway',
        effects: {
          stats: { happiness: 2 },
          journal: `You took ${petLabel} with you.`,
          result: 'Yours is yours, even when it stings.',
        },
      },
      {
        id: 'leave',
        text: 'Nevermind',
        effects: {
          journal: `You left ${petLabel} with ${memberLabel}.`,
          result: 'Some things stay where they are.',
        },
      },
    ],
  };
}

/** Parents who moved in without the young ones ask to bring them. */
export function sibsBringEvent(): LifeEvent {
  return {
    id: 'home-sibs-bring',
    title: 'Bring them',
    description: 'Your parents will not leave the young ones behind.',
    category: 'social',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'bring',
        text: 'Bring them too',
        effects: {
          stats: { happiness: 2 },
          journal: 'You took the whole family in.',
          result: 'The house is full, and that is that.',
        },
      },
      {
        id: 'leave',
        text: 'Leave them',
        effects: {
          stats: { happiness: -6 },
          journal: 'You left the kids behind.',
          result: 'It sits badly with everyone, yourself included.',
        },
      },
    ],
  };
}
/** A spouse kept out of your house asks to be let in. */
export function spouseAskEvent(spouse: Contact): LifeEvent {
  return {
    id: `home-spouse-ask-${spouse.id}`,
    title: 'Move in',
    description: `${spouse.name} wants to live with you.`,
    category: 'social',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'invite',
        text: 'Ask them to move in',
        effects: {
          stats: { happiness: 6 },
          journal: `${spouse.name} moved in with you.`,
          result: 'There is room, and now there is company.',
        },
      },
      {
        id: 'refuse',
        text: 'Say not yet',
        effects: {
          stats: { happiness: -4 },
          journal: `You told ${spouse.name} not yet.`,
          result: 'It lands badly, and you both know it.',
        },
      },
    ],
  };
}

/** Yearly dues on a house: a fiftieth of its value, in every period. */
export const TAX_RATE = 0.02;

/** What the year costs its owner, in era currency. */
export function taxAmount(c: Character, prop = 'home'): number {
  const houseId = prop === 'home' ? c.home?.houseId : rentalByUid(c, prop)?.houseId;
  if (!houseId) return 0;
  const house = houseById(c.eraId, houseId);
  if (!house) return 0;
  return Math.max(1, Math.round(houseCost(house, c.eraId) * TAX_RATE));
}

/** The collector at the door: pay what is owed, or send them off. */
export function taxDueEvent(owedText: string, id = 'home-tax'): LifeEvent {
  return {
    id,
    title: 'Tax due',
    description: `The collector wants ${owedText}.`,
    category: 'social',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'pay',
        text: 'Pay it',
        effects: {
          journal: 'You paid the tax.',
          result: 'The book is marked, and they go.',
        },
      },
      {
        id: 'refuse',
        text: 'Send them away',
        effects: {
          journal: 'You sent the collector away.',
          result: 'They will be back, and the book grows heavier.',
        },
      },
    ],
  };
}

/** Tenants sized up in a row in one year. */
export const VIEWINGS_PER_YEAR = 3;

/** A fair yearly rent: a twelfth of the house, near enough. */
export const FAIR_RENT_RATE = 0.08;

/** What the rooms usually fetch in a year, in era currency. */
export function fairRent(c: Character, prop = 'home'): number {
  const houseId =
    prop === 'home' ? c.home?.houseId : rentalByUid(c, prop)?.houseId;
  if (!houseId) return 1;
  const house = houseById(c.eraId, houseId);
  if (!house) return 1;
  return Math.max(1, Math.round(houseCost(house, c.eraId) * FAIR_RENT_RATE));
}

/**
 * Odds a buyer meets your price: under value they crowd in, over it
 * they walk away.
 */
export function sellChance(price: number, value: number): number {
  return Math.max(
    0.05,
    Math.min(0.95, 0.7 - (price / Math.max(1, value) - 1) * 1.5),
  );
}

/**
 * Odds a stranger takes your rooms at your price: the rich mind a
 * high figure less, the poor walk sooner.
 */
export function tenantAcceptChance(
  wealth: number,
  price: number,
  fair: number,
): number {
  return Math.max(
    0.05,
    Math.min(
      0.95,
      0.55 + wealth / 250 - Math.max(0, price / Math.max(1, fair) - 1) * 0.8,
    ),
  );
}

/** Display name of a property's house, if it still stands. */
export function propHouseText(c: Character, prop: string): string | null {
  const houseId = prop === 'home' ? c.home?.houseId : rentalByUid(c, prop)?.houseId;
  if (!houseId) return null;
  return houseById(c.eraId, houseId)?.text ?? null;
}

/** What a property is worth, in era currency. */
export function propValue(c: Character, prop: string): number {
  const houseId = prop === 'home' ? c.home?.houseId : rentalByUid(c, prop)?.houseId;
  if (!houseId) return 0;
  const house = houseById(c.eraId, houseId);
  return house ? houseCost(house, c.eraId) : 0;
}

export interface PropTenantLine {
  id: string;
  name: string;
  sub: string;
  bond: number;
  rent: number;
  cause: boolean;
  married: boolean;
}

/** Tenants (and their companions) in a property, for the house view. */
export function propTenantLines(c: Character, prop: string): PropTenantLine[] {
  const out: PropTenantLine[] = [];
  for (const e of propTenants(c, prop)) {
    if ((e.rent ?? 0) <= 0 && !e.group) continue;
    const m = c.contacts.find((x) => x.id === e.id);
    if (!m || m.kind === 'pet') continue;
    const holder = e.group ? c.contacts.find((x) => x.id === e.group) : null;
    out.push({
      id: e.id,
      name: contactRef(m),
      sub:
        (e.rent ?? 0) > 0
          ? `${formatFunds(e.rent ?? 0, moneySymbolOf(c))}/yr`
          : holder
            ? `came with ${holder.name.split(' ')[0]}`
            : 'with the tenants',
      bond: m.bond,
      rent: e.rent ?? 0,
      cause: e.cause ?? false,
      married: m.kind === 'partner' && !!m.married,
    });
  }
  return out;
}

/** A rental by its id. */
export function rentalByUid(c: Character, uid: string) {
  return c.rentals.find((r) => r.uid === uid);
}

/** Tenant entries (leaseholders and companions) in a property. */
export function propTenants(c: Character, prop: string): HomeResident[] {
  if (prop === 'home') {
    return (c.home?.residents ?? []).filter((r) => r.scope === 'contact');
  }
  return rentalByUid(c, prop)?.tenants ?? [];
}

function mapPropContacts(
  c: Character,
  prop: string,
  fn: (list: HomeResident[]) => HomeResident[],
): Character {
  if (prop === 'home') {
    if (!c.home) return c;
    return {
      ...c,
      home: {
        ...c.home,
        residents: [
          ...c.home.residents.filter((r) => r.scope !== 'contact'),
          ...fn(c.home.residents.filter((r) => r.scope === 'contact')),
        ],
      },
    };
  }
  return {
    ...c,
    rentals: c.rentals.map((r) => (r.uid === prop ? { ...r, tenants: fn(r.tenants) } : r)),
  };
}

function propViewing(c: Character, prop: string): Contact[] {
  return prop === 'home' ? (c.home?.viewing ?? []) : (rentalByUid(c, prop)?.viewing ?? []);
}

function setPropViewing(c: Character, prop: string, viewing: Contact[]): Character {
  if (prop === 'home') {
    return c.home ? { ...c, home: { ...c.home, viewing } } : c;
  }
  return {
    ...c,
    rentals: c.rentals.map((r) => (r.uid === prop ? { ...r, viewing } : r)),
  };
}

function propRentAsked(c: Character, prop: string): number {
  return prop === 'home' ? (c.home?.rentAsked ?? 0) : (rentalByUid(c, prop)?.rentAsked ?? 0);
}

/** Which property holds the viewing with this leaseholder id. */
function viewingProp(c: Character, id: string): string | null {
  if ((c.home?.viewing ?? []).some((v) => v.id === id)) return 'home';
  const r = c.rentals.find((x) => x.viewing.some((v) => v.id === id));
  return r ? r.uid : null;
}

/** A stranger answering about the rooms, means and all. */
export function makeTenant(
  c: Character,
  rng: () => number = Math.random,
): Contact {
  const sex: NameGender = rng() < 0.5 ? 'male' : 'female';
  const trades = FRIEND_TRADES[c.eraId] ?? [];
  return {
    id: `tenant-${Date.now()}-${Math.floor(rng() * 1e6)}`,
    name: randomName(c.eraId, c.placeId, rng, sex),
    gender: sex === 'male' ? 'Male' : 'Female',
    orientation: rollOrientation(rng),
    kind: 'friend',
    status: 'looking for a place',
    trade: trades.length > 0 ? trades[Math.floor(rng() * trades.length)] : 'at work',
    wealth: rollPartnerWealth(rng),
    ageAtMeeting: 22 + Math.floor(rng() * 16),
    petName: null,
    bond: 40,
    yearsKnown: 0,
  };
}

/** One applicant or several: couples, families and friends come too. */
export function makeTenantGroup(
  c: Character,
  rng: () => number = Math.random,
): Contact[] {
  const first = makeTenant(c, rng);
  const extra = rng() < 0.5 ? 0 : rng() < 0.6 ? 1 : 2;
  const rest: Contact[] = [];
  for (let i = 0; i < extra; i++) {
    const m = makeTenant(c, rng);
    rest.push({
      ...m,
      bond: 35,
      status: `with ${first.name.split(' ')[0] ?? first.name}`,
    });
  }
  return [first, ...rest];
}

function tenantLines(group: Contact[], age: number): string {
  const [first, ...rest] = group;
  if (!first) return '';
  const base =
    `${cap(first.name)}, ${age}, ${first.trade ?? 'at work'}. ` +
    `Of ${wealthTier(first.wealth ?? 50)} means.`;
  if (rest.length === 0) return base;
  return `${base} With ${rest.map((m) => m.name).join(' and ')}.`;
}

/** Sizing strangers up for the rooms, at your asking price. */
export function viewingEvent(
  c: Character,
  prop: string,
  group: Contact[],
  priceText: string,
): LifeEvent {
  const first = group[0];
  return {
    id: `home-viewing-${prop}|${first?.id ?? 'none'}`,
    title: group.length > 1 ? 'Tenants' : 'A tenant',
    description: `${tenantLines(group, contactAge(first!, c.age))} They will pay ${priceText} a year.`,
    category: 'social',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'rent',
        text: 'Rent it to them',
        effects: {
          stats: { happiness: 2 },
          result: 'You talk it over.',
        },
      },
      {
        id: 'else',
        text: 'Someone else',
        effects: { result: 'You see who else is looking.' },
      },
      {
        id: 'never',
        text: 'Nevermind',
        effects: { result: 'You leave it for now.' },
      },
    ],
  };
}

/** A stranger come of their own to an open listing, at your price. */
export function tenantAskEvent(
  c: Character,
  prop: string,
  group: Contact[],
  priceText: string,
): LifeEvent {
  const first = group[0];
  return {
    id: `home-tenant-ask-${prop}|${first?.id ?? 'none'}`,
    title: group.length > 1 ? 'Tenants' : 'A tenant',
    description: `${tenantLines(group, contactAge(first!, c.age))} They will pay ${priceText} a year.`,
    category: 'social',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'rent',
        text: 'Rent it to them',
        effects: {
          stats: { happiness: 2 },
          result: 'You talk it over.',
        },
      },
      {
        id: 'never',
        text: 'Nevermind',
        effects: { result: 'You leave it for now.' },
      },
    ],
  };
}

function followNotice(id: string, title: string, text: string): LifeEvent {
  return {
    id,
    title,
    description: text,
    category: 'social',
    conditions: {},
    weight: 0,
    choices: [],
    effects: { journal: text },
  };
}

/**
 * What sizing a stranger up comes to: rented (they join the Circle
 * and the roof, paying yearly) or thought better of it. Someone else
 * brings the next in line, while the year still has viewings in it.
 */
function viewingFlow(
  c: Character,
  choiceId: string,
  prop: string,
  id: string,
): { character: Character; events: LifeEvent[]; jobId: null } | null {
  const group = propViewing(c, prop);
  const clear = setPropViewing(c, prop, []);
  if (group.length === 0 || group[0]!.id !== id) {
    return { character: clear, events: [], jobId: null };
  }
  const [first, ...rest] = group;
  const names = group.map((m) => m.name).join(' and ');
  const takes = group.length > 1 ? 'take' : 'takes';
  if (choiceId === 'rent') {
    const price = propRentAsked(c, prop);
    const accepted =
      Math.random() < tenantAcceptChance(first!.wealth ?? 50, price, fairRent(c, prop));
    if (!accepted) {
      return {
        character: clear,
        events: [
          followNotice(`home-norent-${first!.id}`, 'No', `${cap(first!.name)} thinks better of it.`),
        ],
        jobId: null,
      };
    }
    const moved: Contact[] = [
      { ...first!, status: 'your tenant' },
      ...rest,
    ];
    let character: Character = {
      ...c,
      contacts: [...c.contacts, ...moved],
    };
    const entries = [
      { scope: 'contact' as const, id: first!.id, rent: price },
      ...rest.map((m) => ({
        scope: 'contact' as const,
        id: m.id,
        rent: 0,
        group: first!.id,
      })),
    ];
    if (prop === 'home' && c.home) {
      character = {
        ...character,
        home: { ...c.home, residents: [...c.home.residents, ...entries] },
      };
    } else {
      character = {
        ...character,
        rentals: character.rentals.map((r) =>
          r.uid === prop ? { ...r, tenants: [...r.tenants, ...entries] } : r,
        ),
      };
    }
    character = setPropViewing(character, prop, []);
    // moving into the lived-in house is noticed, like any arrival.
    if (prop === 'home' && character.home?.movedIn) {
      const heard = objectToNewcomer(
        character,
        group.length > 1 ? 'the new tenants' : contactRef(first!),
        entries.map((e) => ({ scope: e.scope, id: e.id })),
      );
      character = {
        ...heard.character,
        log: [
          ...heard.character.log,
          ...heard.lines.map(
            (t): LogEntry => ({
              age: c.age,
              year: c.birthYear + c.age,
              text: t,
              kind: 'event',
            }),
          ),
        ],
      };
    }
    return {
      character,
      events: [
        followNotice(`home-rented-${first!.id}`, 'Rented', `${cap(names)} ${takes} the rooms.`),
      ],
      jobId: null,
    };
  }
  if (choiceId === 'else') {
    if ((c.viewingsThisYear ?? 0) >= VIEWINGS_PER_YEAR) {
      return {
        character: clear,
        events: [followNotice('home-no-viewings', 'No one', 'No one else is looking.')],
        jobId: null,
      };
    }
    const next = makeTenantGroup(c);
    const priceText = formatFunds(propRentAsked(c, prop), moneySymbolOf(c));
    return {
      character: {
        ...setPropViewing(c, prop, next),
        viewingsThisYear: (c.viewingsThisYear ?? 0) + 1,
      },
      events: [viewingEvent(c, prop, next, priceText)],
      jobId: null,
    };
  }
  return { character: clear, events: [], jobId: null };
}

/**
 * What asking in — or turning away — a spouse comes to. Same shape
 * as the lover chains, so the store stages it the same way.
 */
export function homeFlowStep(
  eventId: string,
  choiceId: string,
  c: Character,
): { character: Character; events: LifeEvent[]; jobId: null } | null {
  const m = /^home-spouse-ask-(.+)$/.exec(eventId);
  if (m) {
    const me = c.contacts.find((x) => x.id === m![1]);
    return spouseFlow(c, choiceId, me);
  }
  const ask = /^home-asked-(contact|family)-(.+)$/.exec(eventId);
  if (ask) {
    const scope = ask[1] as 'contact' | 'family';
    const me =
      scope === 'contact'
        ? c.contacts.find((x) => x.id === ask![2])
        : c.family.find((x) => x.id === ask![2]);
    if (!me) return { character: c, events: [], jobId: null };
    if (choiceId === 'take-in') {
      const residents =
        c.home && !isResident(c, scope, me.id)
          ? [...c.home.residents, { scope, id: me.id }]
          : (c.home?.residents ?? []);
      const character: Character =
        scope === 'contact'
          ? {
              ...c,
              contacts: c.contacts.map((x) =>
                x.id === me.id ? { ...x, bond: clamp(x.bond + 6) } : x,
              ),
              home: c.home ? { ...c.home, residents } : c.home,
            }
          : {
              ...c,
              family: c.family.map((x) =>
                x.id === me.id ? { ...x, bond: clamp(x.bond + 6) } : x,
              ),
              home: c.home ? { ...c.home, residents } : c.home,
            };
      return { character, events: [], jobId: null };
    }
    // turned away: lovers sting most, kin less, friends least.
    const cost =
      scope === 'contact' ? ((me as Contact).kind === 'partner' ? 8 : 3) : 5;
    const strained = clamp(me.bond - cost);
    const character: Character =
      scope === 'contact'
        ? {
            ...c,
            contacts: c.contacts.map((x) =>
              x.id === me.id ? { ...x, bond: strained } : x,
            ),
          }
        : {
            ...c,
            family: c.family.map((x) =>
              x.id === me.id ? { ...x, bond: strained } : x,
            ),
          };
    if (scope === 'contact' && strained <= 0) {
      const con = me as Contact;
      return {
        character,
        events: [leaveEvent({ ...con, bond: 0 })],
        jobId: null,
      };
    }
    return { character, events: [], jobId: null };
  }
  const viewing = /^home-viewing-(.+)\|(.+)$/.exec(eventId);
  if (viewing) {
    const prop = viewingProp(c, viewing[2]);
    if (prop === null) return { character: c, events: [], jobId: null };
    return viewingFlow(c, choiceId, prop, viewing[2]);
  }
  const task = /^home-tenant-ask-(.+)\|(.+)$/.exec(eventId);
  if (task) {
    const prop = viewingProp(c, task[2]);
    if (prop === null) return { character: c, events: [], jobId: null };
    if (choiceId !== 'rent') {
      return { character: setPropViewing(c, prop, []), events: [], jobId: null };
    }
    return viewingFlow(c, 'rent', prop, task[2]);
  }
  if (eventId === 'home-tax') {
    return taxChoice(c, 'home', choiceId);
  }
  const rtax = /^rent-tax-(.+)$/.exec(eventId);
  if (rtax) {
    return taxChoice(c, rtax[1], choiceId);
  }
  const tenant = /^home-t-([a-z]+)\|([^|]+)\|(.+)$/.exec(eventId);
  if (tenant) {
    return tenantFlow(c, tenant[1], tenant[2], tenant[3], choiceId);
  }
  const keep = /^home-pet-keep-(.+)\|(.+)$/.exec(eventId);
  if (keep) {
    const pet = c.contacts.find((x) => x.id === keep![1]);
    const kin = c.family.find((x) => x.id === keep![2]);
    if (!pet || pet.kind !== 'pet') return { character: c, events: [], jobId: null };
    if (choiceId !== 'take') return { character: c, events: [], jobId: null };
    const label = pet.petName ?? pet.name;
    const residents =
      c.home && !isResident(c, 'pet', pet.id)
        ? [...c.home.residents, { scope: 'pet' as const, id: pet.id }]
        : (c.home?.residents ?? []);
    let character: Character = {
      ...c,
      home: c.home ? { ...c.home, residents } : c.home,
    };
    // taking it anyway can sting whoever was attached — a coin flip,
    // owed to character, never to wealth.
    if (kin && Math.random() < 0.5) {
      const ref = kinshipRef(kin, character.family);
      character = {
        ...character,
        family: character.family.map((x) =>
          x.id === kin.id ? { ...x, bond: clamp(x.bond - 10) } : x,
        ),
        log: [
          ...character.log,
          {
            age: c.age,
            year: c.birthYear + c.age,
            text: `${cap(ref)} is sore about losing ${label}.`,
            kind: 'event' as const,
          },
        ],
      };
    }
    return { character, events: [], jobId: null };
  }
  if (eventId === 'home-sibs-bring') {
    const young = c.family.filter(
      (x) =>
        (x.relation === 'brother' || x.relation === 'sister') &&
        memberAge(x, c.age) < 16 &&
        !isResident(c, 'family', x.id),
    );
    if (choiceId === 'bring') {
      const ids = new Set(young.map((x) => x.id));
      const residents = [
        ...(c.home?.residents ?? []),
        ...young.map((x) => ({ scope: 'family' as const, id: x.id })),
      ];
      return {
        character: {
          ...c,
          family: c.family.map((x) =>
            ids.has(x.id) ? { ...x, bond: clamp(x.bond + 5) } : x,
          ),
          home: c.home ? { ...c.home, residents } : c.home,
        },
        events: [],
        jobId: null,
      };
    }
    // taken in the parents and left the kids: worse, all round.
    return {
      character: {
        ...c,
        family: c.family.map((x) => ({ ...x, bond: clamp(x.bond - 8) })),
      },
      events: [],
      jobId: null,
    };
  }
  return null;
}

function setPropTax(c: Character, prop: string, owed: number): Character {
  if (prop === 'home') {
    return c.home ? { ...c, home: { ...c.home, taxOwed: owed } } : c;
  }
  return {
    ...c,
    rentals: c.rentals.map((r) => (r.uid === prop ? { ...r, taxOwed: owed } : r)),
  };
}

function propTaxOwed(c: Character, prop: string): number {
  return prop === 'home'
    ? (c.home?.taxOwed ?? 0)
    : (rentalByUid(c, prop)?.taxOwed ?? 0);
}

function taxChoice(
  c: Character,
  prop: string,
  choiceId: string,
): { character: Character; events: LifeEvent[]; jobId: null } {
  const owed = propTaxOwed(c, prop);
  if (choiceId === 'pay') {
    return {
      character: setPropTax({ ...c, money: c.money - owed }, prop, 0),
      events: [],
      jobId: null,
    };
  }
  return {
    character: {
      ...setPropTax(c, prop, Math.round(owed * 1.5)),
      stats: {
        ...c.stats,
        reputation: Math.max(0, Math.min(100, (c.stats.reputation ?? 50) - 5)),
      },
    },
    events: [],
    jobId: null,
  };
}

/** A leaseholder and their contact, or null when either is gone. */
function tenantOf(
  c: Character,
  prop: string,
  tenantId: string,
): { entry: HomeResident; contact: Contact } | null {
  const entry = propTenants(c, prop).find(
    (e) => e.id === tenantId && (e.rent ?? 0) > 0,
  );
  const contact = c.contacts.find((x) => x.id === tenantId);
  if (!entry || !contact || contact.kind === 'pet') return null;
  return { entry, contact };
}

function stampLine(c: Character, text: string): LogEntry {
  return { age: c.age, year: c.birthYear + c.age, text, kind: 'event' };
}

/** Nudge a tenant's bond; at nothing they are gone from the Circle too. */
export function bumpTenant(
  c: Character,
  prop: string,
  tenantId: string,
  delta: number,
): { character: Character; lines: string[] } {
  const found = tenantOf(c, prop, tenantId);
  if (!found) return { character: c, lines: [] };
  const lines: string[] = [];
  const next = clamp(found.contact.bond + delta);
  let character: Character = {
    ...c,
    contacts: c.contacts.map((x) =>
      x.id === tenantId ? { ...x, bond: next } : x,
    ),
  };
  if (next <= 0) {
    character = mapPropContacts(character, prop, (list) =>
      list.filter((e) => e.id !== tenantId && e.group !== tenantId),
    );
    character = {
      ...character,
      contacts: character.contacts.filter((x) => x.id !== tenantId),
    };
    lines.push(partingLine(found.contact.name, found.contact.kind));
  }
  return { character, lines };
}

/** Note something against a tenant: kicking out stings nobody but them. */
export function markCause(c: Character, prop: string, tenantId: string): Character {
  return mapPropContacts(c, prop, (list) =>
    list.map((e) => (e.id === tenantId ? { ...e, cause: true } : e)),
  );
}

/** Set a leaseholder's yearly rent. */
export function setTenantRent(
  c: Character,
  prop: string,
  tenantId: string,
  rent: number,
): Character {
  return mapPropContacts(c, prop, (list) =>
    list.map((e) => (e.id === tenantId ? { ...e, rent } : e)),
  );
}

/**
 * Turn a tenant out, companions and all. With cause it costs no
 * bond; without, it costs ten. At nothing they leave the Circle too.
 */
export function evictTenant(
  c: Character,
  prop: string,
  tenantId: string,
  withCause: boolean,
): { character: Character; lines: string[] } {
  const found = tenantOf(c, prop, tenantId);
  if (!found) return { character: c, lines: [] };
  const lines = [`${cap(contactRef(found.contact))} was turned out.`];
  let character = mapPropContacts(c, prop, (list) =>
    list.filter((e) => e.id !== tenantId && e.group !== tenantId),
  );
  const next = clamp(found.contact.bond - (withCause ? 0 : 10));
  character = {
    ...character,
    contacts: character.contacts.map((x) =>
      x.id === tenantId ? { ...x, bond: next } : x,
    ),
  };
  if (next <= 0) {
    character = {
      ...character,
      contacts: character.contacts.filter((x) => x.id !== tenantId),
    };
    lines.push(partingLine(found.contact.name, found.contact.kind));
  }
  return { character, lines };
}

/** A tenant walks out on their own, group and all. */
export function tenantLeaves(
  c: Character,
  prop: string,
  tenantId: string,
  bondHit: number,
  line: string,
): { character: Character; lines: string[] } {
  const found = tenantOf(c, prop, tenantId);
  if (!found) return { character: c, lines: [] };
  const lines = [line];
  let character = mapPropContacts(c, prop, (list) =>
    list.filter((e) => e.id !== tenantId && e.group !== tenantId),
  );
  const next = clamp(found.contact.bond - bondHit);
  character = {
    ...character,
    contacts: character.contacts.map((x) =>
      x.id === tenantId ? { ...x, bond: next } : x,
    ),
  };
  if (next <= 0) {
    character = {
      ...character,
      contacts: character.contacts.filter((x) => x.id !== tenantId),
    };
    lines.push(partingLine(found.contact.name, found.contact.kind));
  }
  return { character, lines };
}

/** A tenant doing in your rooms, for the yearly roll. */
export function tenantChoiceEvent(
  c: Character,
  prop: string,
  tenantId: string,
  def: TenantEventDef,
): LifeEvent | null {
  const found = tenantOf(c, prop, tenantId);
  if (!found) return null;
  return {
    id: `home-t-${def.key}|${prop}|${tenantId}`,
    title: def.title,
    description: def.describe(cap(found.contact.name)),
    category: 'social',
    conditions: {},
    weight: 0,
    choices: def.choices.map((ch) => ({
      id: ch.id,
      text: ch.text,
      effects: ch.effects,
    })),
  };
}

/** Gains from a choiceless tenant notice, applied before staging. */
export function applyTenantNotice(
  c: Character,
  prop: string,
  tenantId: string,
  key: string,
): Character {
  const found = tenantOf(c, prop, tenantId);
  if (!found) return c;
  const rent = found.entry.rent ?? 0;
  let character = c;
  if (key === 'care') {
    character = bumpTenant(character, prop, tenantId, 3).character;
  } else if (key === 'gift') {
    character = {
      ...bumpTenant(character, prop, tenantId, 3).character,
      money: character.money + Math.max(1, Math.round(rent * 0.1)),
    };
  } else if (key === 'roof') {
    character = {
      ...bumpTenant(character, prop, tenantId, 4).character,
      stats: clampStatsLike(character.stats, { happiness: 1 }),
    };
  }
  return character;
}

function clampStatsLike(
  stats: Character['stats'],
  delta: Partial<Character['stats']>,
): Character['stats'] {
  const out = { ...stats };
  (Object.keys(delta) as (keyof typeof delta)[]).forEach((k) => {
    if (k && delta[k] !== undefined) {
      (out as Record<string, number>)[k] = Math.max(
        0,
        Math.min(100, ((out as Record<string, number>)[k] ?? 50) + (delta[k] ?? 0)),
      );
    }
  });
  return out;
}

/**
 * What a tenant's doing comes to: bonds move, rents change, causes
 * are noted, and some answers end with the door shutting — or them
 * walking out of it themselves.
 */
function tenantFlow(
  c: Character,
  key: string,
  prop: string,
  tenantId: string,
  choiceId: string,
): { character: Character; events: LifeEvent[]; jobId: null } | null {
  const found = tenantOf(c, prop, tenantId);
  if (!found) return { character: c, events: [], jobId: null };
  const rent = found.entry.rent ?? 0;
  const name = found.contact.name;
  const withLog = (ch: Character, lines: string[]): Character => ({
    ...ch,
    log: [...ch.log, ...lines.map((t) => stampLine(ch, t))],
  });

  if (key === 'party') {
    if (choiceId === 'overlook') {
      const bumped = bumpTenant(c, prop, tenantId, 4);
      return { character: withLog(bumped.character, bumped.lines), events: [], jobId: null };
    }
    if (choiceId === 'pay') {
      const repair = Math.max(1, Math.round(rent / 2));
      const bumped = bumpTenant(
        markCause({ ...c, money: c.money + repair }, prop, tenantId),
        prop,
        tenantId,
        -8,
      );
      return { character: withLog(bumped.character, bumped.lines), events: [], jobId: null };
    }
    const out = evictTenant(c, prop, tenantId, true);
    return { character: withLog(out.character, out.lines), events: [], jobId: null };
  }
  if (key === 'charity') {
    if (choiceId === 'allow') {
      const bumped = bumpTenant(c, prop, tenantId, 5);
      return { character: withLog(bumped.character, bumped.lines), events: [], jobId: null };
    }
    let bumped = bumpTenant(c, prop, tenantId, -5);
    if (Math.random() < 0.25) {
      const gone = tenantLeaves(bumped.character, prop, tenantId, 5, `${cap(name)} moved out.`);
      return { character: withLog(gone.character, [...bumped.lines, ...gone.lines]), events: [], jobId: null };
    }
    return { character: withLog(bumped.character, bumped.lines), events: [], jobId: null };
  }
  if (key === 'cut') {
    if (choiceId === 'agree') {
      const lowered = setTenantRent(c, prop, tenantId, Math.max(1, Math.round(rent * 0.8)));
      const bumped = bumpTenant(lowered, prop, tenantId, 6);
      return { character: withLog(bumped.character, bumped.lines), events: [], jobId: null };
    }
    let bumped = bumpTenant(c, prop, tenantId, -5);
    if (Math.random() < 0.25) {
      const gone = tenantLeaves(bumped.character, prop, tenantId, 5, `${cap(name)} moved out.`);
      return { character: withLog(gone.character, [...bumped.lines, ...gone.lines]), events: [], jobId: null };
    }
    return { character: withLog(bumped.character, bumped.lines), events: [], jobId: null };
  }
  if (key === 'noise') {
    if (choiceId === 'warn') {
      const bumped = bumpTenant(c, prop, tenantId, -4);
      return { character: withLog(bumped.character, bumped.lines), events: [], jobId: null };
    }
    return { character: c, events: [], jobId: null };
  }
  if (key === 'sublet') {
    if (choiceId === 'cut') {
      const raised = setTenantRent(c, prop, tenantId, Math.round(rent * 1.2));
      const bumped = bumpTenant(raised, prop, tenantId, -3);
      return { character: withLog(bumped.character, bumped.lines), events: [], jobId: null };
    }
    let bumped = bumpTenant(markCause(c, prop, tenantId), prop, tenantId, -6);
    if (Math.random() < 0.3) {
      const gone = tenantLeaves(bumped.character, prop, tenantId, 5, `${cap(name)} moved out.`);
      return { character: withLog(gone.character, [...bumped.lines, ...gone.lines]), events: [], jobId: null };
    }
    return { character: withLog(bumped.character, bumped.lines), events: [], jobId: null };
  }
  if (key === 'shrine') {
    const bumped = bumpTenant(c, prop, tenantId, choiceId === 'allow' ? 3 : -4);
    return { character: withLog(bumped.character, bumped.lines), events: [], jobId: null };
  }
  if (key === 'band') {
    if (choiceId === 'allow') {
      const bumped = bumpTenant(c, prop, tenantId, 2);
      return { character: withLog(bumped.character, bumped.lines), events: [], jobId: null };
    }
    let bumped = bumpTenant(c, prop, tenantId, -5);
    if (Math.random() < 0.25) {
      const gone = tenantLeaves(bumped.character, prop, tenantId, 5, `${cap(name)} moved out.`);
      return { character: withLog(gone.character, [...bumped.lines, ...gone.lines]), events: [], jobId: null };
    }
    return { character: withLog(bumped.character, bumped.lines), events: [], jobId: null };
  }
  return null;
}

function spouseFlow(c: Character, choiceId: string, me: Contact | undefined) {
  if (!me || !me.married) return { character: c, events: [], jobId: null };

  if (choiceId === 'invite') {
    const residents =
      c.home && !isResident(c, 'contact', me.id)
        ? [...c.home.residents, { scope: 'contact' as const, id: me.id }]
        : (c.home?.residents ?? []);
    const character: Character = {
      ...c,
      contacts: c.contacts.map((x) =>
        x.id === me.id ? { ...x, bond: clamp(x.bond + 10) } : x,
      ),
      home: c.home ? { ...c.home, residents } : c.home,
    };
    return { character, events: [], jobId: null };
  }

  // turned away: it costs closeness, and every refusal winds the
  // divorce clock a little further.
  const refusals = (me.moveInRefusals ?? 0) + 1;
  const strained = clamp(me.bond - REFUSE_BOND);
  let character: Character = {
    ...c,
    contacts: c.contacts.map((x) =>
      x.id === me.id ? { ...x, bond: strained, moveInRefusals: refusals } : x,
    ),
  };
  if (strained <= 0) {
    return { character, events: [leaveEvent({ ...me, bond: 0 })], jobId: null };
  }
  if (Math.random() < DIVORCE_PER_REFUSAL * refusals) {
    const penalty = bondLossPenalty(me);
    character = {
      ...character,
      contacts: character.contacts.filter((x) => x.id !== me.id),
      stats: {
        ...character.stats,
        happiness: Math.max(
          0,
          Math.min(100, character.stats.happiness - penalty),
        ),
      },
    };
    const text = `You divorced ${me.name}.`;
    return {
      character: {
        ...character,
        log: [
          ...character.log,
          { age: c.age, year: c.birthYear + c.age, text, kind: 'event' as const },
        ],
      },
      events: [
        {
          id: `home-divorced-${me.id}`,
          title: 'Divorced',
          description: text,
          category: 'social' as const,
          conditions: {},
          weight: 0,
          choices: [],
          effects: { journal: text },
        },
      ],
      jobId: null,
    };
  }
  return { character, events: [], jobId: null };
}
