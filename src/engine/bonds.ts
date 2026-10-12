import type { Contact, Stats } from '../types';

/**
 * Spending time on the people and animals in your life. Each action
 * moves a bond up or down, costs a little of something, and says so
 * in one line. The Circle popup renders whichever set fits the kind:
 * people get words and money, animals get treats and hands.
 *
 * Every action carries a few ways to do it (`variants`) so the same
 * button does not read the same way twice.
 *
 * Add specific interactions per kind to the tables below.
 */

export type Interaction =
  | 'time'
  | 'money'
  | 'compliment'
  | 'insult'
  | 'treat'
  | 'pet'
  | 'release';

/** One way of performing an interaction. */
export interface Variant {
  /** short journal sentence, {name} is the contact */
  journal: string;
  /** one line shown in the feedback popup */
  notice: string;
  /** bond override; falls back to the action's own */
  bond?: number;
  /** stat overrides; fall back to the action's own */
  stats?: Partial<Stats>;
}

export interface InteractionDef {
  /** button text */
  text: string;
  /** bond delta; ignored by `release`, which ends things */
  bond: number;
  /** era-scaled money cost (a gift is negative) */
  cost: number;
  /** stat deltas on the character */
  stats: Partial<Stats>;
  /** ways to do it; one is picked at random */
  variants: Variant[];
  /** wordings used instead when the other party is a school-age peer */
  schoolVariants?: Variant[];
  /** wordings used instead when the other party is an animal */
  petVariants?: Variant[];
  /** ends the relationship: they are removed from the Circle */
  endsIt?: boolean;
  /** opens the amount slider instead of resolving immediately */
  asksForAmount?: boolean;
  /** opens the pet-naming field instead of resolving immediately */
  asksForName?: boolean;
}

/** What you can do with another person. */
/** What you can do with another person. */
const PEOPLE: Record<Interaction, InteractionDef> = {
  time: {
    text: 'Spend time together',
    bond: 8,
    cost: 0,
    stats: { happiness: 2 },
    variants: [
      { journal: 'You spent the afternoon with {name}.', notice: 'The hours go by without you noticing them.' },
      { journal: 'You took a long walk with {name}.', notice: 'Neither of you says much, and it is fine.' },
      { journal: 'You shared a meal with {name}.', notice: 'You talk over everything and then some.' },
      { journal: 'You sat up half the night talking with {name}.', notice: 'You lose track of the hour entirely.' },
      { journal: 'You kept {name} company at {trade}.', notice: 'It passes the afternoon, and {they} is glad of the company.' },
    ],
    // a classmate has no trade to be kept company at
    schoolVariants: [
      { journal: 'You spent the break with {name}.', notice: 'The bell goes and neither of you noticed.' },
      { journal: 'You walked home with {name} and talked all the way.', notice: 'You get there much later than you meant to.' },
      { journal: 'You sat with {name} through the long lesson.', notice: 'It is easier to get through when {they} is beside you.' },
      { journal: 'You shared your lunch with {name}.', notice: 'You talk about everything that matters.' },
      { journal: 'You helped {name} catch up on the work.', notice: 'Neither of you minds. Not really.' },
    ],
    petVariants: [
      { journal: 'You spent the afternoon with {name}.', notice: 'It sleeps where you can see it the whole time.' },
      { journal: 'You took {name} out for a walk.', notice: 'It trots ahead of you the entire way.' },
      { journal: 'You sat on the floor with {name} for a while.', notice: 'It falls asleep against your legs.' },
      { journal: 'You let {name} sit in whatever patch of sun it found.', notice: 'You take the cold side of the room without discussing it.' },
    ],
  },
  money: {
    text: 'Give them money',
    bond: 6,
    cost: 0,
    asksForAmount: true,
    stats: { happiness: 1 },
    variants: [
      { journal: 'You pressed {money} on {name} and would not hear a refusal.', notice: 'They take it, and they remember that you gave it.' },
      { journal: 'You handed {name} {money} and told {them} to spend it well.', notice: 'They take it, and they remember that you gave it.' },
    ],
  },
  compliment: {
    text: 'Compliment them',
    bond: 5,
    cost: 0,
    stats: { happiness: 1 },
    variants: [
      { journal: 'You told {name} {they} {was} nice.', notice: 'They look pleased, and try not to show it.' },
      { journal: 'You told {name} {they} {was} very kind.', notice: 'It lands well. They are not used to hearing it.' },
      { journal: 'You told {name} {they} {was} the best company you have had.', notice: 'They laugh it off, but they keep it.' },
      { journal: 'You told {name} you could not have done it without {them}.', notice: 'They are quietly pleased all evening.' },
      { journal: 'You told {name} {they} had a good hand for {trade}.', notice: '{They} starts talking about it, warmly.' },
      { journal: 'You told {name} nobody does {trade} better.', notice: '{They} did not expect to hear it, and it shows.' },
    ],
    schoolVariants: [
      { journal: 'You told {name} {they} {was} nice.', notice: '{They} is pleased, and tries not to show it.' },
      { journal: 'You told {name} {they} {was} very kind.', notice: 'It lands well. {They} is not used to hearing it.' },
      { journal: 'You told {name} {they} was the best company you have had.', notice: '{They} laughs it off, but keeps it.' },
      { journal: 'You told {name} {they} always understood the work.', notice: '{They} did not expect to hear it, and it shows.' },
    ],
    petVariants: [
      { journal: 'You told {name} {they} {was} the best listener you have.', notice: 'It comes over when it hears its name, which is not the same thing.' },
      { journal: 'You told {name} {they} {was} the cleverest thing in the house.', notice: 'It does not understand a word, but it is pleased with the tone.' },
      { journal: 'You sat and told {name} about your day.', notice: 'It listens with its whole body and says nothing, which is why you keep going.' },
    ],
  },
  insult: {
    text: 'Insult them',
    bond: -12,
    cost: 0,
    stats: { happiness: -2, reputation: -1 },
    variants: [
      { journal: 'You told {name} {they} {was} tiresome.', notice: 'You watch it land, and you cannot take it back.', bond: -10 },
      { journal: 'You told {name} you had never met anyone so dull.', notice: 'They go quiet for the rest of the evening.', bond: -16 },
      { journal: 'You made a joke at {name}’s expense.', notice: 'Not one of them is laughing.', bond: -12 },
      { journal: 'You said something you knew would cut {name}.', notice: 'It cuts. That was rather the point.', bond: -18 },
      { journal: 'You told {name} {they} {was} no good at {trade}.', notice: '{They} does not forget it, and neither will you.', bond: -14 },
    ],
    schoolVariants: [
      { journal: 'You told {name} {they} {was} tiresome.', notice: 'You watch it land, and you cannot take it back.', bond: -10 },
      { journal: 'You told {name} you had never met anyone so dull.', notice: '{They} goes quiet for the rest of the lesson.', bond: -16 },
      { journal: 'You made a joke at {name}’s expense.', notice: 'Not one of them is laughing.', bond: -12 },
    ],
  },
  treat: {
    text: 'Give it a treat',
    bond: 7,
    cost: -1,
    stats: { happiness: 2 },
    variants: [
      { journal: 'You gave {name} a treat.', notice: 'It takes it in one bite and comes back for more.' },
      { journal: 'You found {name} a treat you would have liked yourself.', notice: 'It is gone in a single bite.' },
      { journal: 'You shared a little of your own supper with {name}.', notice: 'It cleans the bowl.' },
    ],
  },
  pet: {
    text: 'Pet it',
    bond: 5,
    cost: 0,
    stats: { happiness: 2 },
    variants: [
      { journal: 'You scratched behind the ears of {name}.', notice: 'It leans into your hand and stays there.' },
      { journal: 'You rubbed the belly of {name}.', notice: 'It rolls over without being asked.' },
      { journal: 'You stroked the head of {name}.', notice: 'It closes its eyes and sighs.' },
      { journal: 'You gave {name} a good scratch where it matters most.', notice: 'It goes boneless against you.' },
    ],
  },
  release: {
    text: 'Release it',
    bond: 0,
    cost: 0,
    stats: { happiness: -2 },
    endsIt: true,
    variants: [
      { journal: 'You let {name} go.', notice: 'You open the gate and it does not come back.' },
    ],
  },
};

/**
 * Family, friends, partners and animals all read from one table.
 * What differs is only the wording: `petVariants` are used for an
 * animal, `schoolVariants` for a classmate, `variants` otherwise.
 * The action list per kind is `actionsFor`.
 */
export const CIRCLE_ACTIONS = PEOPLE;

/** The table every kind reads from. */
export function tableFor(_kind: Contact['kind'] | 'family') {
  return PEOPLE;
}

/**
 * The set of actions available. People get time, and money and words
 * only once they are a child with coin in hand. Animals get handled —
 * no coin, no conversation, and a way out.
 */
export function actionsFor(
  kind: Contact['kind'],
  opts: { canAct?: boolean; canGiveMoney?: boolean } = {},
): { key: Interaction; def: InteractionDef }[] {
  if (kind === 'pet') {
    // an infant can pet an animal and be with it, nothing more
    const keys: Interaction[] =
      opts.canAct === false ? ['pet', 'time'] : ['pet', 'treat', 'time', 'release'];
    return keys.map((key) => ({ key, def: PEOPLE[key] }));
  }
  const keys: Interaction[] = ['time'];
  if (opts.canAct !== false) {
    if (opts.canGiveMoney) keys.push('money');
    keys.push('compliment', 'insult');
  }
  return keys.map((key) => ({ key, def: PEOPLE[key] }));
}

/** Can the character afford it? Gifts are negative costs. */
export function canAfford(
  def: InteractionDef,
  money: number,
  moneyScale: number,
): boolean {
  // free company stays free, even in debt — only paying asks for coin
  if (def.cost >= 0) return true;
  return money + def.cost * moneyScale >= 0;
}

/** What a gift does for the bond, scaled by size. Small change is
 *  barely noticed; a real gift is. */
export function giftBond(amount: number, moneyScale: number): number {
  const units = amount / Math.max(1, moneyScale);
  return Math.max(1, Math.round(units * 3));
}

/** The largest gift you could hand over without going into debt. */
export function maxGift(money: number, moneyScale: number): number {
  return Math.max(0, Math.floor(money));
}

/** Pick one way of doing it, from the set that fits the company. */
export function pickVariant(
  def: InteractionDef,
  rng: () => number = Math.random,
  audience: 'person' | 'school' | 'pet' = 'person',
): Variant {
  const set =
    audience === 'pet'
      ? def.petVariants
      : audience === 'school'
        ? def.schoolVariants
        : undefined;
  const pool =
    set && set.length > 0
      ? set
      : def.variants.length > 0
        ? def.variants
        : FALLBACK_VARIANT;
  return pool[Math.floor(rng() * pool.length)] ?? pool[0];
}

/** {was}/{were} reads correctly for every gender, animals included. */
function wasWere(gender: string): string {
  return gender.toLowerCase() === 'animal' ? 'is' : 'was';
}

/** Resolve an interaction into its numbers and lines. */
export function resolveAction(
  def: InteractionDef,
  rng: () => number = Math.random,
  audience: 'person' | 'school' | 'pet' = 'person',
): { variant: Variant; bond: number; stats: Partial<Stats> } {
  const variant = pickVariant(def, rng, audience);
  return {
    variant,
    bond: variant.bond ?? def.bond,
    stats: variant.stats ?? def.stats,
  };
}

const FALLBACK_VARIANT: Variant[] = [
  { journal: 'You spent time with {name}.', notice: 'It goes well enough.' },
];

/** The line they say when the bond finally runs out. */
export function partingLine(
  name: string,
  kind: Contact['kind'] | 'family',
): string {
  if (kind === 'pet') {
    return `${cap(name)} will not come when you call. Whatever this was, it is over.`;
  }
  if (kind === 'partner') {
    return `${name} says they cannot do this any more. They are not coming back.`;
  }
  return `${name} does not want you in their life any more.`;
}

/** What releasing an animal means when you are the one letting go. */
export function releaseLine(m: Contact): string {
  return `${cap(m.name)} goes out through the gate and does not look back.`;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
