import type { Character, Child, Contact, EraId, LifeEvent } from '../types';
import { getEra } from '../data/eras';
import { randomName, type NameGender } from '../data/names';
import { contactAge } from './contacts';
import {
  itemsFor,
  shopById,
  shopsFor,
} from './shopping';
import type { ShopItemDef } from '../data/shopping';

/**
 * Your own children: making them, carrying them, feeding them,
 * being asked by them, and watching them grow out of the house.
 *
 * Children live on Character.children with their age derived from
 * your own (age - bornAge). At 18 the store turns them into a friend
 * in the Circle; death rolls them in mortalityStep like family.
 * Pure functions here; the store applies and announces.
 */

/** Old enough for this at all. */
export const LOVE_AGE = 14;

/** Odds one lovemaking conceives. */
export const CONCEPTION_CHANCE = 0.12;

/** A child's current age for a character of the given age. */
export function childAge(ch: Child, characterAge: number): number {
  return characterAge - ch.bornAge;
}

/** How to refer to them: "your son Ed", "your daughter Ed". */
export function childRef(ch: Child): string {
  return `your ${ch.gender === 'Female' ? 'daughter' : 'son'} ${ch.firstName}`;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Whether this lover and you can lie together right now. */
export function canMakeLove(player: Character, m: Contact): boolean {
  if (m.kind !== 'partner') return false;
  if (player.age < LOVE_AGE) return false;
  if (contactAge(m, player.age) < LOVE_AGE) return false;
  if (player.pregnancy) return false;
  return true;
}

/**
 * Who would carry a child of the two of you: you, them, or nobody.
 * Only a female body with a male partner conceives, either way round.
 */
export function carrierOf(
  player: Character,
  partner: Contact,
): 'player' | 'partner' | null {
  if (player.gender === 'Female' && partner.gender === 'Male') return 'player';
  if (player.gender === 'Male' && partner.gender === 'Female') return 'partner';
  return null;
}

/** Yearly keep of one child, base units: schooling age costs more. */
export function upkeepBase(age: number): number {
  return age < 6 ? 2 : 3;
}

/**
 * The decision on a conception: keep it or end it. In the ancient
 * world and the middle ages a woman carrying a husband's child is
 * not asked — the notice says so, and that is the end of it.
 */
export function pregnancyDecisionEvent(
  partner: Contact,
  playerCarries: boolean,
  eraId: EraId,
): LifeEvent {
  const forced =
    playerCarries &&
    partner.gender === 'Male' &&
    (eraId === 'ancient-world' || eraId === 'medieval');
  if (forced) {
    return {
      id: `preg-decide-${partner.id}`,
      title: 'With Child',
      description: `${partner.name} says the child will be born, and that is the end of it.`,
      category: 'family',
      conditions: {},
      weight: 0,
      choices: [],
      effects: {
        stats: { happiness: -1, reputation: 1 },
        journal: 'You are going to have a baby.',
      },
    };
  }
  const repHit = eraId === 'ancient-world' || eraId === 'medieval' ? -5 : -3;
  const oldWorld = eraId === 'ancient-world' || eraId === 'medieval';
  // letting the carrier decide: her choice in later eras, a harder
  // ask where wives were not consulted — still allowed, still judged
  const deferText = playerCarries
    ? `Ask ${partner.name} what to do`
    : partner.gender === 'Female'
      ? 'Leave the choice to her'
      : `Leave the choice to ${partner.gender === 'Male' ? 'him' : 'them'}`;
  return {
    id: `preg-decide-${partner.id}`,
    title: 'With Child',
    description: playerCarries
      ? `You are with child by ${partner.name}.`
      : `${partner.name} is with child by you.`,
    category: 'family',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'keep',
        text: 'Keep the baby',
        effects: {
          stats: { happiness: 2, reputation: 1 },
          result: 'It is decided.',
          journal: 'You decided to keep the baby.',
        },
      },
      {
        id: 'end',
        text: 'End it quietly',
        effects: {
          stats: { happiness: -6, reputation: repHit },
          result: 'It is done, and not spoken of.',
          journal: 'You ended the pregnancy quietly.',
        },
      },
      {
        id: 'defer',
        text: deferText,
        effects: {
          stats: oldWorld && !playerCarries ? { happiness: -1, reputation: -1 } : {},
          result: 'You leave it in their hands.',
          journal: `You left the choice to ${partner.name}.`,
        },
      },
    ],
  };
}

/**
 * What the decision comes to. Keep starts the wait for next year;
 * end clears it (the effects already landed through the choice).
 * Same shape as the lover flow, so the store chains it the same way.
 */
export function pregnancyFlowStep(
  eventId: string,
  choiceId: string,
  c: Character,
): { character: Character; events: LifeEvent[]; jobId: null } | null {
  const m = /^preg-decide-(.+)$/.exec(eventId);
  if (!m) return null;
  const partner = c.contacts.find((x) => x.id === m![1]);
  if (!partner) return { character: c, events: [], jobId: null };
  if (choiceId === 'end') {
    return { character: { ...c, pregnancy: null }, events: [], jobId: null };
  }
  const carrier = carrierOf(c, partner);
  if (!carrier) return { character: c, events: [], jobId: null };
  // deferred to the carrier: closeness tilts them toward keeping;
  // old-world carriers keep more often
  if (choiceId === 'defer') {
    const ancient = c.eraId === 'ancient-world' || c.eraId === 'medieval';
    const odds = Math.min(0.9, 0.45 + partner.bond / 200 + (ancient ? 0.15 : 0));
    if (Math.random() >= odds) {
      return { character: { ...c, pregnancy: null }, events: [], jobId: null };
    }
  }
  return {
    character: {
      ...c,
      pregnancy: {
        partnerId: partner.id,
        playerCarries: carrier === 'player',
        dueAge: c.age + 1,
      },
    },
    events: [],
    jobId: null,
  };
}

/** A young child's ask: sweets from the market, answer freely. */
export function childAskEvent(
  c: Character,
  ch: Child,
  rng: () => number = Math.random,
): LifeEvent {
  const wants = askableItems(c, childAge(ch, c.age));
  const item = wants.length > 0 ? wants[Math.floor(rng() * wants.length)]! : null;
  if (!item) {
    return {
      id: `child-ask-${ch.id}`,
      title: 'Ask',
      description: `${cap(childRef(ch))} tugs at you for a sweet.`,
      category: 'family',
      conditions: {},
      weight: 0,
      choices: [
        {
          id: 'buy',
          text: 'Buy the sweet',
          effects: {
            money: -1,
            stats: { happiness: 2 },
            result: 'Gone in three bites.',
            journal: `You bought ${ch.firstName} a sweet.`,
          },
        },
        {
          id: 'refuse',
          text: 'Say no',
          effects: {
            stats: { happiness: -1 },
            result: 'Not today.',
            journal: `You refused ${ch.firstName} a sweet.`,
          },
        },
      ],
    };
  }
  const shop = shopById(item.shopId);
  return {
    id: `child-ask-${ch.id}`,
    title: 'Ask',
    description: `${cap(childRef(ch))} tugs at you for ${anItem(item)}.`,
    category: 'family',
    conditions: {},
    weight: 0,
    choices: [
      {
        id: 'fetch',
        text: `Buy it at the ${shop?.text.toLowerCase() ?? 'shop'}`,
        openShop: item.id,
        effects: {
          result: 'You will see about it.',
          journal: `You promised ${ch.firstName} ${anItem(item)}.`,
        },
      },
      {
        id: 'refuse',
        text: 'Say no',
        effects: {
          stats: { happiness: -1 },
          result: 'Not today.',
          journal: `You refused ${ch.firstName} ${anItem(item)}.`,
        },
      },
    ],
  };
}

/** What a child could plausibly ask for: cheap, small, on a shelf here. */
export function askableItems(c: Character, age: number): ShopItemDef[] {
  const out: ShopItemDef[] = [];
  for (const shop of shopsFor(c)) {
    const aisles = shop.aisles ?? [undefined];
    for (const aisle of aisles) {
      for (const item of itemsFor(c, shop.id, aisle)) {
        if (item.cost > 4) continue;
        if (item.vehicle || item.ring || item.staple) continue;
        if ((item.minAge ?? 0) > age) continue;
        out.push(item);
      }
    }
  }
  return out;
}

function anItem(item: ShopItemDef): string {
  const word = item.text.charAt(0).toLowerCase();
  const article = 'aeiou'.includes(word) ? 'an' : 'a';
  return `${article} ${item.text.toLowerCase()}`;
}

/**
 * What the answer costs in closeness. Same shape as the lover flow.
 * Fetching promises little until the thing is handed over; small
 * bonds never quite empty: children do not disown you over a sweet.
 */
export function childFlowStep(
  eventId: string,
  choiceId: string,
  c: Character,
): { character: Character; events: LifeEvent[]; jobId: null } | null {
  const m = /^child-ask-(.+)$/.exec(eventId);
  if (!m) return null;
  const child = (c.children ?? []).find((x) => x.id === m![1]);
  if (!child) return { character: c, events: [], jobId: null };
  const delta = choiceId === 'buy' ? 8 : choiceId === 'fetch' ? 2 : -8;
  const bond = Math.max(
    10,
    Math.min(100, child.bond + delta),
  );
  return {
    character: {
      ...c,
      children: c.children.map((x) => (x.id === child.id ? { ...x, bond } : x)),
    },
    events: [],
    jobId: null,
  };
}

function surnameOf(name: string): string {
  return name.split(' ').slice(-1)[0] ?? name;
}

/**
 * The baby itself: sex at chance, first name from the era and place
 * pools, last name by the house rule — the father's everywhere but
 * today, where it takes yours.
 */
export function birthChild(
  c: Character,
  partner: Contact | null,
  rng: () => number = Math.random,
): Child {
  const sex: NameGender = rng() < 0.5 ? 'male' : 'female';
  const firstName =
    randomName(c.eraId, c.placeId, rng, sex).split(' ')[0] ?? 'Robin';
  const playerLast = surnameOf(c.name);
  let lastName = playerLast;
  if (
    c.eraId !== 'modern-day' &&
    c.gender === 'Female' &&
    partner &&
    partner.gender === 'Male'
  ) {
    lastName = surnameOf(partner.name);
  }
  return {
    id: `kid-${Date.now()}-${Math.floor(rng() * 1e6)}`,
    firstName,
    lastName,
    gender: sex === 'female' ? 'Female' : 'Male',
    bornAge: c.age,
    bond: 75,
    yearsKnown: 0,
    otherParentId: partner?.id ?? null,
  };
}

/** A year passes for the children: older, a little drifted, never bare. */
export function driftChildren(children: Child[]): Child[] {
  return (children ?? []).map((ch) => ({
    ...ch,
    yearsKnown: ch.yearsKnown + 1,
    bond: Math.max(10, ch.bond - 0.5),
  }));
}
