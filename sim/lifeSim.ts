/**
 * Headless life simulator: lives whole lives through the real store,
 * asserting invariants every tick and collecting balance signals.
 *
 * Run: npm run sim [-- seed livesPerEra]
 * Bundle + execute only; never imported by the game.
 */
import { useGame, rollStartingStats, rollStartingMoney } from '../src/store/gameStore';
import { ERAS, getEra } from '../src/data/eras';
import { SHOP_ITEMS } from '../src/data/shopping';
import { availableActivities } from '../src/engine/activities';
import { AILMENTS } from '../src/data/ailments';
import { BEG_CAP } from '../src/data/activities';
import { CRISES } from '../src/data/crises';
import { crisisFor } from '../src/engine/crises';
import { WARS } from '../src/data/wars';
import { draftFor, draftEvent, warFlowStep, warYear, warYearEvent } from '../src/engine/wars';
import { CRIMES } from '../src/engine/crime';
import { JOBS, jobForSmarts, DEGREES, degreesFor } from '../src/data/career';
import { hasNamePool } from '../src/data/names';
import { ACTIVITIES } from '../src/data/activities';
import { generateFamily } from '../src/engine/family';
import { jobsInSector, huntChance } from '../src/engine/career';
import { kinshipRef } from '../src/engine/family';
import { joinUni, uniOf } from '../src/engine/classroom';
import { walkPlacesFor } from '../src/engine/walks';
import { WALK_DURATIONS } from '../src/data/walks';
import { salonsFor } from '../src/engine/salon';
import { gigsFor } from '../src/engine/gigs';
import { eligibleBooks } from '../src/engine/books';
import {
  shopsFor,
  itemsFor,
  aislesFor,
  stapleFor,
  ownedEdibles,
  shopCost,
  itemById,
  giftReaction,
  ringsOwned,
  ringBonus,
  shopById,
} from '../src/engine/shopping';
import { venuesFor } from '../src/data/weddings';
import { latestNews } from '../src/engine/news';
import { GENERIC_NEWS } from '../src/data/news-generic';
import { HISTORY } from '../src/data/history';
import { contactRef, canAskOut, canFlirtWith, confrontEvent, loverFlowStep } from '../src/engine/contacts';
import { askableRelatives } from '../src/engine/infancy';
import {
  rollWealth,
  wealthTier,
  birthWealthHint,
  pocketChanceFactor,
  pocketAmountFactor,
  infantFedLevel,
  stapleTarget,
  stapleSkipChance,
} from '../src/engine/wealth';
import { askChance, pocketMoneyAmount } from '../src/engine/infancy';
import type { Character, EraId } from '../src/types';

// ── seeded rng (overrides global before the game rolls anything) ──
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const seed = Number(process.argv[2] ?? 7);
const livesPerEra = Number(process.argv[3] ?? 30);
// independent stream per life, drawn from a master stream: nearby life
// indexes must not get correlated seeds
const master = mulberry32(seed);
const LIFE_SEEDS = new Map<string, number>();
function reseed(life: string) {
  let s = LIFE_SEEDS.get(life);
  if (s === undefined) {
    s = Math.floor(master() * 2147483647);
    LIFE_SEEDS.set(life, s);
  }
  Math.random = mulberry32(s);
}
reseed('master');

interface Violation { life: string; age: number; kind: string; detail: string; }
const violations: Violation[] = [];
function flag(life: string, c: Character | null, kind: string, detail: string) {
  if (violations.length < 40) {
    violations.push({ life, age: c?.age ?? -1, kind, detail });
  }
}

const ITEM_IDS = new Set(SHOP_ITEMS.map((i) => i.id));

function checkInvariants(life: string, c: Character | null) {
  if (!c) return;
  for (const [k, v] of Object.entries(c.stats)) {
    if (!Number.isFinite(v) || v < 0 || v > 100) {
      flag(life, c, 'stat-range', `${k}=${v}`);
    }
  }
  if (!Number.isFinite(c.satiety) || c.satiety < 0 || c.satiety > 100) {
    flag(life, c, 'satiety-range', `satiety=${c.satiety}`);
  }
  if (c.age < 18 && c.money < 0) {
    flag(life, c, 'minor-debt', `money=${c.money}`);
  }
  const seen = new Set<string>();
  for (const id of c.belongings ?? []) {
    if (!ITEM_IDS.has(id)) flag(life, c, 'unknown-item', id);
    const def = SHOP_ITEMS.find((i) => i.id === id);
    if (def?.once) {
      if (seen.has(id)) flag(life, c, 'duplicate-durable', id);
      seen.add(id);
    }
  }
  for (const m of c.contacts ?? []) {
    if (m.bond < 0 || m.bond > 100) flag(life, c, 'contact-bond', `${m.name}=${m.bond}`);
  }
  for (const m of c.family ?? []) {
    if (m.bond < 0 || m.bond > 100) flag(life, c, 'family-bond', `${m.relation}=${m.bond}`);
  }
  for (const k of c.children ?? []) {
    if (k.bond < 0 || k.bond > 100) flag(life, c, 'child-bond', `${k.firstName}=${k.bond}`);
    if (k.bornAge > c.age) flag(life, c, 'child-age', `${k.firstName} born=${k.bornAge} age=${c.age}`);
    if (!k.firstName || !k.lastName) flag(life, c, 'child-name', JSON.stringify(k).slice(0, 80));
  }
  if (c.pregnancy && c.pregnancy.dueAge < c.age) {
    flag(life, c, 'pregnancy-overdue', `due=${c.pregnancy.dueAge} age=${c.age}`);
  }
  for (const e of c.log ?? []) {
    if (typeof e.age !== 'number' || typeof e.year !== 'number') {
      flag(life, c, 'log-shape', JSON.stringify(e).slice(0, 80));
      break;
    }
    if (e.year !== c.birthYear + e.age) {
      flag(life, c, 'log-year', `age=${e.age} year=${e.year} birth=${c.birthYear}`);
      break;
    }
  }
}

// ── coverage: every era must actually sell food, care, work ──
const coverage: string[] = [];
function fakeChar(eraId: EraId, age: number, birthYear?: number): Character {
  const era = getEra(eraId);
  return {
    eraId,
    placeId: era.places[0]!.id,
    birthYear: birthYear ?? era.startYear,
    age,
    belongings: [],
    satiety: 80,
    familyWealth: 50,
    stats: { health: 70, happiness: 60, smarts: 50, looks: 50, energy: 70, reputation: 50 },
  } as Character;
}
for (const era of ERAS) {
  const adult = fakeChar(era.id, 30);
  const shops = shopsFor(adult);
  if (shops.length === 0) coverage.push(`${era.id}: no shops at 30`);
  for (const s of shops) {
    const aisles = s.aisles ?? [undefined];
    let n = 0;
    for (const a of aisles) n += itemsFor(adult, s.id, a).length;
    if (n === 0) coverage.push(`${era.id}/${s.id}: empty shelf at 30`);
    if (s.aisles && aislesFor(adult, s.id).length === 0) {
      coverage.push(`${era.id}/${s.id}: no aisles at 30`);
    }
  }
  if (!stapleFor(adult)) coverage.push(`${era.id}: no staple`);
  if (!availableActivities(fakeChar(era.id, 6)).some((a) => a.key === 'beg')) {
    coverage.push(`${era.id}: no begging at 6`);
  }
  if (salonsFor(adult).length === 0) coverage.push(`${era.id}: no salon at 30`);
  if (gigsFor(fakeChar(era.id, 20)).length === 0) coverage.push(`${era.id}: no gigs at 20`);
}
// wealth unit checks
for (const w of [0, 24, 25, 49, 50, 74, 75, 100]) {
  const t = wealthTier(w);
  const expect = w < 25 ? 'poor' : w < 50 ? 'modest' : w < 75 ? 'comfortable' : 'wealthy';
  if (t !== expect) coverage.push(`wealthTier(${w})=${t}, want ${expect}`);
  if (!birthWealthHint(w)) coverage.push(`no birth hint for ${w}`);
  if (!(pocketChanceFactor(w) > 0 && pocketAmountFactor(w) > 0)) coverage.push(`bad pocket factor ${w}`);
  if (!(infantFedLevel(w) >= 0 && infantFedLevel(w) <= 100)) coverage.push(`bad fed level ${w}`);
  if (!(stapleTarget(w) >= 0 && stapleSkipChance(w) >= 0 && stapleSkipChance(w) <= 1)) {
    coverage.push(`bad staple params ${w}`);
  }
}
for (let i = 0; i < 500; i++) {
  const w = rollWealth();
  if (w < 0 || w > 100) {
    coverage.push(`rollWealth out of range: ${w}`);
    break;
  }
}

// crises are well-formed: windows, odds, known ailments, real eras
for (const k of CRISES) {
  if (k.years[0] > k.years[1]) coverage.push(`crisis ${k.id}: window inverted`);
  if (!(k.catchChance > 0 && k.catchChance <= 1)) coverage.push(`crisis ${k.id}: chance`);
  if (!(k.onset <= 0)) coverage.push(`crisis ${k.id}: onset`);
  if (k.money !== undefined && !(k.money < 0)) coverage.push(`crisis ${k.id}: money`);
  if (k.ailmentId !== undefined && !AILMENTS[k.ailmentId]) coverage.push(`crisis ${k.id}: unknown ailment`);
  if (!k.eras.every((e) => ERAS.some((x) => x.id === e))) coverage.push(`crisis ${k.id}: era`);
  if (!k.journal || !k.description) coverage.push(`crisis ${k.id}: text`);
  if (k.ailmentId !== undefined && k.recovers !== false && !k.recovered) coverage.push(`crisis ${k.id}: recovery text`);
}
// covid reaches modern lives born before it, and stays in its window
{
  const kid = fakeChar('modern-day', 4, 2018);
  const hit = crisisFor(kid, kid.birthYear + kid.age);
  if (!hit || hit.id !== 'covid') coverage.push('covid unreachable for 2018 modern birth');
  const adult = fakeChar('modern-day', 30);
  if (crisisFor(adult, adult.birthYear + adult.age)) coverage.push('covid fires past its window');
}
// wars draft who they should, spare who they should not
{
  const man34 = { ...fakeChar('industrial', 34), gender: 'Male', serving: null } as never;
  const d1 = draftFor(man34, 1916);
  if (!d1 || d1.id !== 'first-world-war') coverage.push('WWI draft missing');
  const d2 = draftFor({ ...fakeChar('industrial', 30), gender: 'Male', serving: null } as never, 1941);
  if (!d2 || d2.id !== 'second-world-war') coverage.push('WWII draft missing');
  const old = draftFor({ ...fakeChar('industrial', 50), gender: 'Male', serving: null } as never, 1916);
  if (old) coverage.push('draft past 45');
  const woman = draftFor({ ...fakeChar('industrial', 25), gender: 'Female', serving: null } as never, 1916);
  if (woman) coverage.push('draft takes women');
  const serving = draftFor({ ...fakeChar('industrial', 25), gender: 'Male', serving: 'first-world-war' } as never, 1916);
  if (serving) coverage.push('draft while serving');
  // no child soldiers: 17 in 1914 hears nothing, 18 hears papers
  const kid = draftFor({ ...fakeChar('industrial', 17, 1897), gender: 'Male', serving: null } as never, 1914);
  if (kid) coverage.push('draft takes minors');
  const grown = draftFor({ ...fakeChar('industrial', 18, 1896), gender: 'Male', serving: null } as never, 1914);
  if (!grown || grown.id !== 'first-world-war') coverage.push('draft misses new adults');
  const nappy = draftFor({ ...fakeChar('age-of-sail', 25, 1785), gender: 'Male', serving: null } as never, 1810);
  if (!nappy || nappy.id !== 'napoleonic-wars') coverage.push('napoleonic draft missing');
  const antonine = crisisFor(fakeChar('ancient-world', 68), 168);
  if (!antonine || antonine.id !== 'antonine-plague') coverage.push('antonine unreachable');
  const crash = crisisFor(fakeChar('industrial', 40), 1930);
  if (!crash || crash.id !== 'great-depression') coverage.push('depression unreachable');
  const de = draftEvent(d1!);
  if (de.choices.length !== 2) coverage.push('draft choices');
  const enlisted = warFlowStep(de.id, 'serve', {
    ...fakeChar('industrial', 30), gender: 'Male', serving: null, schoolId: 'x', jobId: 'y',
    belongings: ['bread', 'tunic'], contacts: [],
  } as never);
  const ec = enlisted?.character as unknown as Record<string, unknown>;
  if (!enlisted || ec['serving'] !== 'first-world-war') coverage.push('serve sets serving');
  if (!enlisted || JSON.stringify((ec['belongings'] as string[])) !== '["service-rifle","army-rations","army-rations"]') coverage.push('serve issues rifle');
  if (!enlisted || (ec['stashedBelongings'] as string[]).length !== 2) coverage.push('serve stashes');
  if (!enlisted || (ec['contacts'] as unknown[]).length !== 0) coverage.push('serve leaks unit to Circle');
  if (!enlisted || (ec['coworkers'] as unknown[]).length !== 5) coverage.push('serve musters unit');
  if (!enlisted || ec['crewFor'] !== 'first-world-war') coverage.push('serve tags crew');
  const dodged = warFlowStep(de.id, 'refuse', { ...fakeChar('industrial', 30), gender: 'Male', flags: [], money: 100, stats: { happiness: 50 } } as never);
  const dc = dodged?.character as unknown as Record<string, unknown>;
  if (!dodged || !(dc['flags'] as string[]).includes('draft-dodger')) coverage.push('refuse flags');
  const wy = warYearEvent(d1!);
  if (wy.choices.map((ch) => ch.id).join(',') !== 'shoot,hold') coverage.push('war-year choices');
  let sawDeath = false;
  for (let i = 0; i < 300; i++) {
    const r = warYear({ ...fakeChar('industrial', 30), age: 30, ailments: [], log: [], stats: { health: 80 } } as never);
    if (r.died && r.died !== 'killed in action') coverage.push(`war death text: ${r.died}`);
    if (r.died) sawDeath = true;
    const h = (r.character.stats as { health: number }).health;
    if (!(h >= 0)) coverage.push('war health below zero');
  }
  if (!sawDeath) coverage.push('war never kills in 300 years');
}
// gift reactions behave: loved, missed, puzzling, and plain
const tasteCases: [string, string, number, string][] = [
  ['scroll', 'scribe', 30, 'loved'],
  ['sword', 'priest', 40, 'disliked'],
  ['sword', 'baker', 40, 'odd'],
  ['bread', 'king', 40, 'neutral'],
  ['wine', 'altar boy', 10, 'disliked'],
  ['sword', 'knight', 10, 'loved'],
];
for (const [id, trade, age, want] of tasteCases) {
  const item = itemById(id);
  const got = item ? giftReaction(item, trade, age) : 'missing-item';
  if (got !== want) coverage.push(`giftReaction(${id}, ${trade}, ${age})=${got}, want ${want}`);
}
// a ring in every era, a venue in every era, tags that read right
for (const era of ERAS) {
  const adult = fakeChar(era.id, 30);
  const ringOpen = SHOP_ITEMS.some(
    (i) => i.ring && shopById(i.shopId)?.eras.includes(era.id) && itemsFor(adult, i.shopId, i.aisle).some((x) => x.id === i.id),
  );
  if (!ringOpen) coverage.push(`${era.id}: no ring for sale`);
  if (venuesFor(adult).length === 0) coverage.push(`${era.id}: no wedding venue`);
}
const refCases: [object, string][] = [
  [{ kind: 'partner', name: 'Ed', gender: 'Female', married: true }, 'your wife Ed'],
  [{ kind: 'partner', name: 'Ed', gender: 'Male', married: true }, 'your husband Ed'],
  [{ kind: 'partner', name: 'Ed', gender: 'Female', engaged: true }, 'your fiancée Ed'],
  [{ kind: 'partner', name: 'Ed', gender: 'Male', engaged: true }, 'your fiancé Ed'],
  [{ kind: 'partner', name: 'Ed', gender: 'Male' }, 'your partner Ed'],
];
for (const [m, want] of refCases) {
  const got = contactRef(m as never);
  if (got !== want) coverage.push(`contactRef=${got}, want ${want}`);
}
const copper = itemById('copper-ring');
const gold = itemById('gold-ring');
if (!copper?.ring || !gold?.ring) coverage.push('rings not marked');
if (copper && ringBonus(copper) !== 0) coverage.push('copper ring bonus');
if (gold && ringBonus(gold) !== 0.2) coverage.push('gold ring bonus');
// every birthplace has its own names, every new country its own news
for (const era of ERAS) {
  for (const p of era.places) {
    if (!hasNamePool(p.id)) coverage.push(`${era.id}/${p.id}: no name pool`);
  }
}
for (const cc of ['India', 'Japan', 'Arabia', 'Ethiopia', 'Hungary', 'Sweden', 'Portugal', 'Mali', 'Siam', 'Austria', 'Ottoman Empire', 'Mexico', 'Argentina', 'Greece', 'Canada', 'South Korea', 'Turkey', 'Ireland', 'Indonesia', 'Egypt']) {
  if (HISTORY.filter((h) => h.cc?.includes(cc)).length < 4) {
    coverage.push(`country ${cc}: fewer than 4 pieces`);
  }
}
if (ACTIVITIES.some((a) => a.key === 'diet')) coverage.push('diet row still listed');
if ('takeDiet' in useGame.getState()) coverage.push('takeDiet still on store');
// parents are old enough to have their oldest child
for (const era of ERAS) {
  for (let i = 0; i < 200; i++) {
    const fam = generateFamily(era.id, era.places[0]!.id, 'Test');
    const oldestSib = Math.max(0, ...fam.filter((m) => m.relation === 'brother' || m.relation === 'sister').map((m) => m.ageAtBirth));
    for (const m of fam.filter((x) => x.relation === 'mother' || x.relation === 'father')) {
      if (m.ageAtBirth < 18 || m.ageAtBirth - oldestSib < 16) {
        coverage.push(`${era.id}: parent ${m.ageAtBirth} with oldest child ${oldestSib}`);
        break;
      }
    }
  }
}
// brothers read as brothers, even two of them
{
  const fam = [
    { relation: 'brother', firstName: 'Ed', lastName: 'J' },
    { relation: 'brother', firstName: 'Fred', lastName: 'J' },
    { relation: 'sister', firstName: 'Ana', lastName: 'J' },
    { relation: 'sister', firstName: 'Bea', lastName: 'J' },
  ] as never[];
  const refs = fam.map((m) => kinshipRef(m as never, fam as never));
  if (refs.some((r) => r.includes('sibling'))) coverage.push(`sibling fallback: ${refs.join(' / ')}`);
  if (refs[0] !== 'your brother Ed J' || refs[2] !== 'your sister Ana J') {
    coverage.push(`kinship refs: ${refs.join(' / ')}`);
  }
}
// plague kills fast now
if ((AILMENTS.plague?.drain ?? 0) < 15) coverage.push('plague too slow');
// every era hires the uneducated: two no-brains rungs, wages climbing
for (const era of ERAS) {
  const tiers = JOBS[era.id];
  const lenient = tiers.filter((j) => j.smartsRequired <= 0);
  if (lenient.length < 2) coverage.push(`${era.id}: only ${lenient.length} lenient rungs`);
  for (let i = 1; i < tiers.length; i++) {
    if (tiers[i]!.wage < tiers[i - 1]!.wage) coverage.push(`${era.id}: ladder out of order at ${tiers[i]!.id}`);
  }
  const seen = jobsInSector(era.id, lenient[1]?.sector ?? '', 18, 5);
  if (lenient[1] && !seen.some((j) => j.id === lenient[1]!.id)) {
    coverage.push(`${era.id}: lenient rung not huntable at smarts 5`);
  }
}
// higher study everywhere: degrees open, jobs need them, enrolment works
for (const era of ERAS) {
  const open = degreesFor(era.id, 25);
  if (open.length === 0) coverage.push(`${era.id}: no degrees`);
  for (const d of DEGREES) {
    if (d.eras && !d.eras.includes(era.id)) continue;
    const posts = JOBS[era.id].filter((j) => j.requiresDegree === d.id);
    if (posts.length === 0 && (d.eras ?? [era.id]).includes(era.id)) {
      coverage.push(`${era.id}: degree ${d.id} hires nowhere`);
    }
  }
}
{
  // degree gates hold: no degree, no doctor post, no offer, no promotion past it
  const blind = jobsInSector('modern-day', 'Consulting', 30, 90);
  if (blind.some((j) => j.requiresDegree)) coverage.push('degree jobs shown without degree');
  const eyed = jobsInSector('modern-day', 'Consulting', 30, 90, ['medicine']);
  if (!eyed.some((j) => j.id === 'doctor')) coverage.push('doctor hidden with degree');
  const adult = { ...fakeChar('modern-day', 30), schoolId: null, jobId: null, degrees: [] as string[] } as never;
  void adult;
  const offerBlind = jobForSmarts('modern-day', 30, 90, []);
  if (offerBlind?.requiresDegree) coverage.push('offer dangles a degree post');
  const offerFair = jobForSmarts('modern-day', 30, 90, ['medicine']);
  if (offerFair?.requiresDegree) coverage.push('offer skips to a degree post');
}
{
  // enrolment draws the course
  const u = joinUni({ ...fakeChar('modern-day', 20), uniId: 'letters' } as never);
  if (uniOf(u as never).length < 2) coverage.push('uni roster empty');
}
// the front page always carries three pieces, dated first
for (const era of ERAS) {
  const pool = GENERIC_NEWS.filter((g) => g.eras.includes(era.id));
  if (pool.length < 40) coverage.push(`${era.id}: thin generic news (${pool.length})`);
  for (const age of [10, 40, 80]) {
    const news = latestNews(fakeChar(era.id, age));
    if (!news) {
      coverage.push(`${era.id} age ${age}: no news at all`);
      continue;
    }
    if (news.items.length < 3) {
      coverage.push(`${era.id} age ${age}: ${news.items.length} pieces`);
    }
    const [first] = news.items;
    if (first && !HISTORY.some((h) => h.t === first.t && h.y === news.year)) {
      coverage.push(`${era.id} age ${age}: front piece is not dated`);
    }
  }
}
// confrontation flow: drop changes nothing, proceed gains a lover
{
  const base = {
    eraId: 'modern-day', placeId: 'x', age: 30, belongings: [], satiety: 80,
    familyWealth: 50, stats: { health: 80, happiness: 70, smarts: 60, looks: 60, energy: 70, reputation: 50 },
    log: [],
  };
  const spouse = {
    id: 'sp', name: 'Ed', kind: 'partner', status: 'x', gender: 'Female',
    orientation: 'straight', ageAtMeeting: 20, petName: null, bond: 80, yearsKnown: 5,
    engaged: true, married: true,
  };
  const askee = {
    id: 'af', name: 'Jo', kind: 'friend', status: 'x', gender: 'Male',
    orientation: 'straight', ageAtMeeting: 20, petName: null, bond: 60, yearsKnown: 2,
  };
  const ev = confrontEvent(spouse as never, askee as never);
  if (ev.choices.length !== 2) coverage.push('confront choices');
  if (!ev.id.startsWith('askout-confront-')) coverage.push('confront id');
  const char = { ...base, contacts: [{ ...spouse, bond: 100 }, askee] } as never;
  const dropped = loverFlowStep(ev.id, 'drop', char);
  if (!dropped || dropped.character.contacts.length !== 2) coverage.push('confront drop');
  if (dropped && dropped.events.length !== 0) coverage.push('confront drop events');
  const went = loverFlowStep(ev.id, 'proceed', char);
  const after = went?.character.contacts ?? [];
  if (!after.some((m: { id: string; kind: string }) => m.id === 'af' && m.kind === 'partner')) {
    coverage.push('confront proceed gains lover');
  }
  const keptSpouse = after.find((m: { id: string }) => m.id === 'sp') as { bond: number } | undefined;
  if (keptSpouse) {
    // no divorce this roll: strained by exactly 40
    if (keptSpouse.bond !== 60) coverage.push(`confront proceed spouse bond=${keptSpouse.bond}, want 60`);
  } else {
    // divorced: begged or gone with the journal to show it
    const log = (went?.character.log ?? []) as { text: string }[];
    const evts = (went?.events ?? []) as { id: string }[];
    const ok = log.some((e) => e.text.includes('divorced')) || evts.some((e) => e.id.startsWith('lover-begs-'));
    if (!ok) coverage.push('confront proceed divorce untraced');
  }
}
const pocket: Record<string, { gave: number; n: number; sum: number }> = {};
for (const w of [10, 35, 60, 90]) {
  const c = { ...fakeChar('modern-day', 10), familyWealth: w, askedThisYear: [] } as Character;
  const key = wealthTier(w);
  pocket[key] = { gave: 0, n: 0, sum: 0 };
  for (let i = 0; i < 2000; i++) {
    const odds = askChance(c, { bond: 70 } as never);
    pocket[key].n++;
    if (Math.random() < odds) {
      pocket[key].gave++;
      pocket[key].sum += pocketMoneyAmount(70, 20, w);
    }
  }
}

// child shop errand: a promised item lands on the child, never the shelf
{
  const st = useGame.getState();
  const modern = getEra('modern-day');
  st.newLife({
    name: 'Sim Parent',
    gender: 'Female',
    eraId: 'modern-day',
    birthYear: modern.startYear,
    placeId: modern.places[0]!.id,
    stats: { health: 80, happiness: 70, smarts: 60, looks: 60, energy: 70, reputation: 50 },
    money: 1000,
  });
  const got = useGame.getState();
  const c0 = got.character;
  if (!c0) coverage.push('kidshop no character');
  else {
    const kid = {
      id: 'kid-test', firstName: 'Ed', lastName: 'Test', gender: 'Male',
      bornAge: 25, bond: 50, yearsKnown: 5, otherParentId: null,
    };
    useGame.setState({
      character: { ...c0, age: 30, money: 1000, children: [kid] },
      pendingChildShop: { childId: 'kid-test', itemId: 'coffee' },
    });
    const before = useGame.getState().character!;
    useGame.getState().takeShop('coffee');
    const after = useGame.getState().character!;
    if (after.belongings.includes('coffee')) coverage.push('kidshop landed on shelf');
    if (after.money >= before.money) coverage.push('kidshop free');
    if ((after.children ?? [])[0]?.bond !== 56) coverage.push(`kidshop bond=${(after.children ?? [])[0]?.bond}, want 56`);
    const last = after.log[after.log.length - 1];
    if (!last?.text.startsWith('You gave the coffee to Ed')) coverage.push('kidshop journal');
    if (useGame.getState().pendingChildShop !== null) coverage.push('kidshop errand stuck');
    // and a sick child is cured through the same doctor
    useGame.setState({
      character: {
        ...useGame.getState().character!,
        ailments: [{ ailmentId: 'flu', ownerId: 'kid-test', known: true }],
      },
    });
    useGame.getState().cureAilment('flu', 'kid-test');
    const cured = useGame.getState().character!;
    if (cured.ailments.some((a) => a.ownerId === 'kid-test')) coverage.push('kidcure stuck');
    if (!(cured.children ?? [])[0] || (cured.children ?? [])[0]!.bond !== 60) {
      coverage.push(`kidcure bond=${(cured.children ?? [])[0]?.bond}, want 60`);
    }
  }
}

// crime: caught twice means a record, and the record closes doors
{
  const st = useGame.getState();
  const modern = getEra('modern-day');
  st.newLife({
    name: 'Sim Thief',
    gender: 'Male',
    eraId: 'modern-day',
    birthYear: modern.startYear,
    placeId: modern.places[0]!.id,
    stats: { health: 80, happiness: 70, smarts: 60, looks: 60, energy: 70, reputation: 50 },
    money: 500,
  });
  const c0 = useGame.getState().character;
  if (!c0) coverage.push('crime no character');
  else {
    useGame.setState({
      character: { ...c0, age: 25, money: 500, sentence: null, offences: 0, flags: [] },
    });
    // first offence: caught, fined, warned
    const origRandom = Math.random;
    Math.random = () => 0.99; // force the caught path
    useGame.getState().commitCrime('crime-pickpocket');
    Math.random = origRandom;
    let cur = useGame.getState().character!;
    // resolve any staged popups
    let guard = 0;
    while (useGame.getState().activeEvent && guard++ < 20) {
      const ev = useGame.getState().activeEvent!;
      if (useGame.getState().mustChoose && ev.event.choices.length > 0) {
        useGame.getState().choose(ev.event.choices[0]!.id);
      } else {
        useGame.getState().dismissEvent();
      }
      cur = useGame.getState().character!;
    }
    if (cur.offences !== 1) coverage.push(`crime first offence=${cur.offences}, want 1`);
    if (!cur.flags.includes('first-offence')) coverage.push('crime first-offence flag missing');
    // second offence: caught again, sentenced
    Math.random = () => 0.99; // force the caught path
    useGame.getState().commitCrime('crime-burglary');
    Math.random = origRandom;
    guard = 0;
    while (useGame.getState().activeEvent && guard++ < 20) {
      const ev = useGame.getState().activeEvent!;
      if (useGame.getState().mustChoose && ev.event.choices.length > 0) {
        useGame.getState().choose(ev.event.choices[0]!.id);
      } else {
        useGame.getState().dismissEvent();
      }
      cur = useGame.getState().character!;
    }
    if (cur.offences !== 2) coverage.push(`crime second offence=${cur.offences}, want 2`);
    if (!cur.sentence || cur.sentence < 1) coverage.push(`crime sentence=${cur.sentence}, want >= 1`);
    // serve it out
    const startAge = cur.age;
    while (useGame.getState().character?.sentence && guard++ < 30) {
      useGame.getState().ageUp();
      while (useGame.getState().activeEvent && guard++ < 40) {
        const ev = useGame.getState().activeEvent!;
        if (useGame.getState().mustChoose && ev.event.choices.length > 0) {
          useGame.getState().choose(ev.event.choices[0]!.id);
        } else {
          useGame.getState().dismissEvent();
        }
      }
    }
    cur = useGame.getState().character!;
    if (cur.sentence !== null) coverage.push('crime sentence stuck');
    if (cur.age <= startAge) coverage.push('crime prison did not advance age');
    // record closes doors
    const before = huntChance(cur);
    if (before > 0.5) coverage.push(`crime huntChance=${before.toFixed(2)}, want <= 0.5`);
  }
}

// ── lives ──
interface LifeStat {
  era: string; tier: string; lifespan: number; hungry: number; money18: number | null;
  crash: string | null; cause: string | null; firstHungry: number | null;
  destitute: boolean; wasting: boolean; wealth: number; seedn: number;
  hp18: number | null; hap18: number | null; bel18: number | null; ail18: number | null;
  stuck: boolean;
}

const wedStats = { proposed: 0, married: 0, divorced: 0, marryTried: 0, proposeTried: 0, marryMoney: [] as number[], proposedSeeds: [] as string[] };
const metStats = { met: 0 };
const crisisStats = { plague: 0, flu: 0, famine: 0, recovered: 0, breadline: 0 };
const uniStats = { enrolled: 0, graduated: 0 };
const warStats = { served: 0, refused: 0, kia: 0, home: 0, servedFates: [] as string[] };
const deathStats = { deaths: 0, parents: 0, parentsYoung: 0, orphans: 0, perEra: {} as Record<string, { deaths: number; parents: number; parentsYoung: number; orphans: number; n: number }> };
const kidStats = { born: 0, ended: 0, grown: 0, childDeaths: 0, forced: 0, gifts: 0, promised: 0, kidCures: 0 };
const crimeStats = { attempts: 0, caught: 0, prisonYears: 0, debtEvents: 0 };
const lives: LifeStat[] = [];
let actions = 0;

function cheapestFood(c: Character): string | null {
  let best: { id: string; cost: number } | null = null;
  for (const s of shopsFor(c)) {
    const aisles = s.aisles ? aislesFor(c, s.id) : [undefined];
    for (const a of aisles) {
      for (const item of itemsFor(c, s.id, a)) {
        if (!item.sates) continue;
        const cost = shopCost(item, c);
        if (cost <= c.money && (!best || cost < best.cost)) best = { id: item.id, cost };
      }
    }
  }
  return best?.id ?? null;
}

function cheapestRing(c: Character): string | null {
  let best: { id: string; cost: number } | null = null;
  for (const s of shopsFor(c)) {
    const aisles = s.aisles ? aislesFor(c, s.id) : [undefined];
    for (const a of aisles) {
      for (const item of itemsFor(c, s.id, a)) {
        if (!item.ring) continue;
        const cost = shopCost(item, c);
        if (cost <= c.money && (!best || cost < best.cost)) best = { id: item.id, cost };
      }
    }
  }
  return best?.id ?? null;
}

function driveLife(eraId: EraId, n: number) {
  const life = `${eraId}#${n}`;
  reseed(life);
  const era = getEra(eraId);
  const place = era.places[Math.floor(Math.random() * era.places.length)]!;
  try {
    useGame.getState().newLife({
      name: 'Sim Doubt',
      gender: Math.random() < 0.5 ? 'Female' : 'Male',
      eraId,
      birthYear: era.startYear,
      placeId: place.id,
      stats: rollStartingStats(),
      money: rollStartingMoney(era.moneyScale),
    });
    if (process.env.FORCE_WEALTH) {
      const st = useGame.getState();
      if (st.character) {
        useGame.setState({
          character: { ...st.character, familyWealth: Number(process.env.FORCE_WEALTH) },
        });
      }
    }
    } catch (e) {
    lives.push({ era: eraId, tier: '?', lifespan: 0, hungry: 0, money18: null, crash: `newLife: ${String(e).slice(0, 120)}`, cause: null, firstHungry: null, destitute: false, wasting: false, wealth: -1, seedn: LIFE_SEEDS.get(life) ?? -1, stuck: false });
    return;
  }
  let money18: number | null = null;
  let snap18: { hp: number; hap: number; bel: number; ail: number } | null = null;
  let ticks = 0;
  let lastAge = -1;
  let sameAge = 0;
  const bornWasting = (useGame.getState().character?.ailments ?? []).some((a) => a.ailmentId === 'wasting');
  for (let i = 0; i < 3000; i++) {
    ticks = i;
    const s = useGame.getState();
    const c = s.character;
    if (!c || !c.alive || useGame.getState().phase === 'dead' || c.age >= 130) break;
    try {
      checkInvariants(life, c);
      if (c.age === lastAge) sameAge++;
      else { sameAge = 0; lastAge = c.age; }
      if (sameAge === 150) {
        console.log(
          `STUCK ${life} age=${c.age} hp=${c.stats.health} sat=${c.satiety} money=${c.money} ` +
          `bel=${(c.belongings ?? []).join(',') || '-'} serving=${c.serving ?? '-'} ` +
          `ev=${s.activeEvent ? `${s.activeEvent.event.id}:${s.mustChoose ? 'must' : 'free'}:${s.activeEvent.lastResult ?? '-'}` : '-'} ` +
          `pen=${s.pending.map((p) => p.event.id).join('|') || '-'} not=${s.notice ? s.notice.title : '-'} ` +
          `beg=${c.begsThisYear ?? 0} gig=${c.gigsThisYear ?? 0} hunt=${c.jobHuntsThisYear ?? 0} ` +
          `school=${c.schoolId ?? '-'} job=${c.jobId ?? '-'}`,
        );
      }
      if (process.env.VERBOSE && (c.age < 25 || c.age % 10 === 0)) {
        console.log(
          `age=${c.age} hp=${c.stats.health} hap=${c.stats.happiness} sat=${c.satiety} money=${c.money} ` +
          `wealth=${c.familyWealth} ail=${c.contacts.length}:${c.family.length}:${c.ailments.map((a) => a.ailmentId).join('+') || '-'} bel=${(c.belongings ?? []).length} ` +
          `ev=${s.activeEvent ? `${s.activeEvent.event.id}:${s.mustChoose ? 'must' : 'free'}` : '-'} pen=${s.pending.length} not=${s.notice ? 1 : 0} beg=${c.begsThisYear ?? 0}`,
        );
      }
      if (c.age === 18 && money18 === null) {
        money18 = c.money;
        snap18 = {
          hp: c.stats.health, hap: c.stats.happiness,
          bel: (c.belongings ?? []).length, ail: (c.ailments ?? []).length,
        };
      }
      // resolve popups first
      if (s.activeEvent) {
        const ev = s.activeEvent;
        if (s.mustChoose && ev.event.choices.length > 0) {
          const pick = ev.event.choices[Math.floor(Math.random() * ev.event.choices.length)]!;
          // crime events route through the crime engine
          if (CRIMES.some((k) => k.id === ev.event.id) && pick.id === 'do-it') {
            s.commitCrime(ev.event.id);
          } else {
            s.choose(pick.id);
          }
        } else {
          s.dismissEvent();
        }
        continue;
      }
      if (s.notice) s.dismissNotice();
      const me = useGame.getState().character!;
      // eat threshold varies per life: a fixed one phase-locks with the
      // 30-decay/30-bread cycle and every life eats in lockstep
      const eatAt = 35 + ((LIFE_SEEDS.get(life) ?? 0) % 20);
      // 1. eat when hungry (soldiers live on rations: buying and
      // begging are blocked at war, so fall through to the year)
      if (me.satiety < eatAt && !me.serving) {
        const ed = ownedEdibles(me);
        if (ed.length > 0) {
          useGame.getState().eatItem(me.belongings.indexOf(ed[0]!.item.id));
          actions++;
          continue;
        }
        if (me.age >= 6) {
          const food = cheapestFood(me);
          if (food) {
            useGame.getState().takeShop(food);
            actions++;
            continue;
          }
          // broke and hungry: beg for food (until the year's tries run out)
          if ((me.begsThisYear ?? 0) < BEG_CAP) {
            useGame.getState().takeBeg('food');
            actions++;
            continue;
          }
        }
      }
      // 1b. care first: checkups reveal, cures remove, before anything else
      if (me.age >= 6 && Math.random() < 0.7) {
        const scale = getEra(me.eraId).moneyScale;
        const unknown = me.ailments.some((a) => a.ownerId === null && !a.known);
        if (unknown && me.money >= 2 * scale) {
          useGame.getState().checkup();
          actions++;
        } else {
          const curable = me.ailments.find(
            (a) =>
              a.ownerId === null &&
              a.known &&
              AILMENTS[a.ailmentId] &&
              !AILMENTS[a.ailmentId].incurable &&
              AILMENTS[a.ailmentId].cureCost * scale <= me.money,
          );
          if (curable) {
            useGame.getState().cureAilment(curable.ailmentId);
            actions++;
          } else {
            // a sick child goes to the doctor too
            const kidAil = me.ailments.find(
              (a) =>
                a.ownerId !== null &&
                (me.children ?? []).some((k) => k.id === a.ownerId) &&
                a.known &&
                AILMENTS[a.ailmentId] &&
                !AILMENTS[a.ailmentId].incurable &&
                AILMENTS[a.ailmentId].cureCost * scale <= me.money,
            );
            if (kidAil && kidAil.ownerId) {
              useGame.getState().cureAilment(kidAil.ailmentId, kidAil.ownerId);
              actions++;
            }
          }
        }
      }
      // 2a. weddings: tend, propose and marry on their own roll
      if (me.age >= 18 && Math.random() < 0.4) {
        const lover = me.contacts.find((m) => m.kind === 'partner' && !m.married);
        const rings = ringsOwned(me);
        if (lover && lover.bond < 70) {
          useGame.getState().interact(lover.id, 'time');
          actions++;
        } else if (lover && rings.length === 0) {
          const ring = cheapestRing(me);
          if (ring) {
            useGame.getState().takeShop(ring);
            actions++;
          }
        } else if (lover && !lover.engaged && lover.bond >= 60 && rings.length > 0) {
          const places = walkPlacesFor(me);
          if (places.length > 0) {
            wedStats.proposeTried++;
            useGame.getState().propose(lover.id, rings[0]!.item.id, places[0]!.id);
            actions++;
          }
        } else if (lover && lover.engaged) {
          const venues = venuesFor(me);
          const free = venues.find((v) => v.cost === 0) ?? venues[0];
          if (free) {
            wedStats.marryTried++;
            wedStats.marryMoney.push(me.money);
            useGame.getState().marry(lover.id, free.id);
            actions++;
          }
        }
      }
      // 2a2. straying while wed: occasional flirts and ask-outs strain it
      if (
        me.age >= 18 &&
        me.contacts.some((m) => m.kind === 'partner' && m.married) &&
        Math.random() < 0.12
      ) {
        const friend = me.contacts.find(
          (m) => m.kind === 'friend' && m.bond >= 40 && canFlirtWith(me, m),
        );
        if (friend && !me.flirtedThisYear.includes(friend.id)) {
          useGame.getState().flirt(friend.id);
          actions++;
        } else if (
          friend &&
          canAskOut(me, friend) &&
          !me.askedOutThisYear.includes(friend.id)
        ) {
          useGame.getState().askOut(friend.id);
          actions++;
        }
      }
      // 2a3. lovemaking: occasional nights with a lover
      if (me.age >= 16 && Math.random() < 0.3 && !me.pregnancy) {
        const lover = me.contacts.find(
          (m) => m.kind === 'partner' && !(me.intimateThisYear ?? []).includes(m.id),
        );
        if (lover) {
          useGame.getState().makeLove(lover.id);
          actions++;
        }
      }
      // 2b. school/work effort
      const r = Math.random();
      if (me.schoolId && r < 0.5) {
        useGame.getState().study();
        actions++;
      } else if (me.jobId && r < 0.5) {
        useGame.getState().workHarder();
        actions++;
      } else if (me.uniId && r < 0.6) {
        useGame.getState().studyUni();
        actions++;
      } else if (
        r < 0.12 &&
        me.age >= 18 &&
        !me.schoolId &&
        !me.uniId &&
        (me.degrees ?? []).length === 0
      ) {
        // read further when affordable, or ask at home when not
        const open = degreesFor(me.eraId, me.age).sort((a, b) => a.cost - b.cost);
        const cheapest = open[0];
        if (cheapest) {
          const scale = getEra(me.eraId).moneyScale;
          if (me.money >= cheapest.cost * scale) {
            useGame.getState().enrolUni(cheapest.id);
            actions++;
          } else {
            const kin = askableRelatives(me);
            if (kin.length > 0) {
              useGame.getState().askForTuition(kin[0]!.id, cheapest.id);
              actions++;
            }
          }
        }
      } else if (r < 0.18 && me.age >= 6) {
        // a waiting child's ask goes to the shops first
        const errand = useGame.getState().pendingChildShop;
        if (errand) {
          const before = useGame.getState().character!.log.length;
          useGame.getState().takeShop(errand.itemId);
          actions++;
          const after = useGame.getState().character!.log;
          if (after.length > before && after[after.length - 1]!.text.startsWith('You gave the ')) {
            kidStats.gifts++;
          }
        } else {
          // chaos purchase: random affordable shelf item
          const options: string[] = [];
          for (const shop of shopsFor(me)) {
            const aisles = shop.aisles ? aislesFor(me, shop.id) : [undefined];
            for (const a of aisles) {
              for (const item of itemsFor(me, shop.id, a)) {
                if (shopCost(item, me) <= me.money) options.push(item.id);
              }
            }
          }
          if (options.length > 0) {
            useGame.getState().takeShop(options[Math.floor(Math.random() * options.length)]!);
            actions++;
          }
        }
      } else if (r < 0.3) {
        const open = availableActivities(me);
        if (open.length > 0) {
          useGame.getState().takeActivity(open[Math.floor(Math.random() * open.length)]!.key);
          actions++;
        }
      } else if (r < 0.38 && me.age >= 14) {
        const gigs = gigsFor(me);
        if (gigs.length > 0) {
          useGame.getState().takeGig(gigs[Math.floor(Math.random() * gigs.length)]!.id, 0.5);
          actions++;
        }
      } else if (r < 0.44) {
        const kin = askableRelatives(me);
        if (kin.length > 0 && me.age < 18) {
          useGame.getState().askForMoney(kin[Math.floor(Math.random() * kin.length)]!.id);
          actions++;
        }
      } else if (r < 0.5 && me.belongings.length > 4) {
        if (me.family.length > 0 && Math.random() < 0.5) {
          const target = me.family[Math.floor(Math.random() * me.family.length)]!;
          useGame.getState().giftItem(0, 'family', target.id);
        } else {
          useGame.getState().discardItem(0);
        }
        actions++;
      } else if (r < 0.54) {
        const ed = ownedEdibles(me);
        if (ed.length > 1) {
          useGame.getState().eatItem(me.belongings.indexOf(ed[0]!.item.id));
          actions++;
        }
      } else if (r < 0.58) {
        const books = eligibleBooks(me);
        if (books.length > 0 && me.age >= 7) {
          useGame.getState().finishBook(books[Math.floor(Math.random() * books.length)]!.id);
          actions++;
        }
      } else if (r < 0.62) {
        const salons = salonsFor(me);
        if (salons.length > 0 && me.age >= 6) {
          useGame.getState().takeSalon(salons[Math.floor(Math.random() * salons.length)]!.id);
          actions++;
        }
      } else if (r < 0.66 && me.age >= 4) {
        const places = walkPlacesFor(me);
        if (places.length > 0) {
          useGame.getState().takeWalk(
            WALK_DURATIONS[Math.floor(Math.random() * WALK_DURATIONS.length)]!.id,
            places[Math.floor(Math.random() * places.length)]!.id,
          );
          actions++;
        }
      }
      useGame.getState().ageUp();
    } catch (e) {
      const done = useGame.getState().character;
      lives.push({
        era: eraId, tier: done ? wealthTier(done.familyWealth ?? 50) : '?',
        lifespan: done?.age ?? -1, hungry: 0, money18,
        crash: `${String(e).slice(0, 160)}`, cause: null, firstHungry: null,
        destitute: done?.destitute ?? false, wasting: false, wealth: done?.familyWealth ?? -1, seedn: LIFE_SEEDS.get(life) ?? -1,
        hp18: null, hap18: null, bel18: null, ail18: null, stuck: false,
      });
      return;
    }
  }
  const done = useGame.getState().character!;
  if (process.env.DUMPLOG === life) {
    for (const e of done.log) console.log(`  LOG age=${e.age} [${e.kind}] ${e.text}`);
    console.log(`  KIDS ${JSON.stringify(done.children ?? [])}`);
    console.log(`  CONTACTS ${JSON.stringify((done.contacts ?? []).map((m) => ({ id: m.id, kind: m.kind, name: m.name })))}`);
    console.log(`  AIL ${JSON.stringify(done.ailments ?? [])}`);
  }
  const hungryEntries = done.log.filter((e) => e.text.includes('hungry'));
  const bornHungry = done.log.some((e) => e.text.includes('born into hunger'));
  const orphanedHungry = done.log.some((e) => e.text.includes('no one left to feed you'));
  if (done.destitute !== (bornHungry || orphanedHungry)) {
    flag(life, done, 'destitute-hint', `destitute=${done.destitute} hint=${bornHungry} orphan=${orphanedHungry}`);
  }
  if (done.log.some((e) => e.text.includes('proposed to'))) {
    wedStats.proposed++;
    wedStats.proposedSeeds.push(`${done.eraId} seed=${LIFE_SEEDS.get(life) ?? -1}`);
  }
  if (done.log.some((e) => e.text.includes('caught the plague'))) crisisStats.plague++;
  if (done.log.some((e) => e.text.includes('caught influenza'))) crisisStats.flu++;
  if (done.log.some((e) => e.text.includes('harvest failed'))) crisisStats.famine++;
  if (done.log.some((e) => e.text.includes('breadline'))) crisisStats.breadline++;
  crisisStats.recovered += done.log.filter((e) =>
    e.text.includes('lived through the plague') ||
    e.text.includes('shook off') ||
    e.text.includes('harvest came back'),
  ).length;
  metStats.met += done.log.filter((e) => e.text.startsWith('You met your ') || e.text.startsWith('You took in ')).length;
  kidStats.born += done.log.filter((e) => e.text.includes(' was born.')).length;
  if (done.log.some((e) => e.text.includes('ended the pregnancy'))) kidStats.ended++;
  if (done.log.some((e) => e.text.includes('You are going to have a baby.'))) kidStats.forced++;
  kidStats.grown += done.log.filter((e) => e.text.includes('is grown and')).length;
  kidStats.childDeaths += done.log.filter((e) => /^Your (son|daughter) /.test(e.text) && e.text.includes(' died of ')).length;
  kidStats.kidCures += done.log.filter((e) => e.text.includes(' was treated for the ') && e.text.startsWith('You ') === false).length;
  kidStats.promised += done.log.filter((e) => e.text.startsWith('You promised ')).length;
  crimeStats.attempts += done.log.filter((e) => e.text.startsWith('You went for the ') || e.text.startsWith('You forced the lock') || e.text.startsWith('You took the cart past') || e.text.startsWith('You called them out')).length;
  crimeStats.caught += done.log.filter((e) => e.text.includes('paid the fine') || e.text.includes('sentenced to')).length;
  crimeStats.prisonYears += done.log.filter((e) => e.text === 'You served a year inside.').length;
  crimeStats.debtEvents += done.log.filter((e) => e.text.includes('The collectors took what you had')).length;
  // household deaths: "X died of Y" lines (family + contacts) and "Z is dead." (pets)
  const deathLines = done.log.filter((e) => e.text.includes(' died of ') || e.text.endsWith(' is dead.'));
  const parentDeaths = deathLines.filter((e) => /^Your (mother|father) /.test(e.text));
  const parentDeathsYoung = parentDeaths.filter((e) => e.age < 18).length;
  const orphanedYoung = (() => {
    if (done.log.some((e) => e.text.includes('no one left to feed you'))) return true;
    const birth = done.log.find((e) => e.kind === 'birth');
    const bornParents = birth
      ? (birth.text.includes('Your mother ') ? 1 : 0) + (birth.text.includes('Your father ') ? 1 : 0)
      : 0;
    if (bornParents === 0) return false;
    return parentDeaths.filter((e) => e.age < 18).length >= bornParents;
  })();
  deathStats.deaths += deathLines.length;
  deathStats.parents += parentDeaths.length;
  deathStats.parentsYoung += parentDeathsYoung;
  if (orphanedYoung) deathStats.orphans++;
  const de = (deathStats.perEra[done.eraId] ??= { deaths: 0, parents: 0, parentsYoung: 0, orphans: 0, n: 0 });
  de.deaths += deathLines.length;
  de.parents += parentDeaths.length;
  de.parentsYoung += parentDeathsYoung;
  if (orphanedYoung) de.orphans++;
  de.n++;
  // no ailment may point at someone no longer in the house, the Circle or the children
  for (const a of done.ailments ?? []) {
    if (
      a.ownerId &&
      !(done.family ?? []).some((m) => m.id === a.ownerId) &&
      !(done.contacts ?? []).some((m) => m.id === a.ownerId) &&
      !(done.children ?? []).some((k) => k.id === a.ownerId)
    ) {
      flag(life, done, 'dangling-ailment', `${a.ailmentId} owner=${a.ownerId}`);
      break;
    }
  }
  if (done.log.some((e) => e.text.includes('enrolled at'))) uniStats.enrolled++;
  if (done.log.some((e) => e.text.includes('graduated in'))) uniStats.graduated++;
  if (done.log.some((e) => e.text.includes('went to the'))) warStats.served++;
  if (done.log.some((e) => e.text.includes('refused the call-up'))) warStats.refused++;
  if (done.causeOfDeath === 'killed in action') warStats.kia++;
  if (done.log.some((e) => e.text.includes('came home from'))) warStats.home++;
  if (done.log.some((e) => e.text.includes('went to the'))) {
    warStats.servedFates.push(`${done.age}:${done.causeOfDeath ?? 'alive'}`);
  }
  if (done.log.some((e) => e.text.startsWith('You married'))) wedStats.married++;
  if (done.log.some((e) => e.text.startsWith('You divorced'))) wedStats.divorced++;
  lives.push({
    era: eraId, tier: wealthTier(done.familyWealth ?? 50),
    lifespan: done.age, hungry: hungryEntries.length, money18,
    crash: null, cause: done.causeOfDeath,
    firstHungry: hungryEntries.length > 0 ? hungryEntries[0]!.age : null,
    destitute: done.destitute ?? false,
    wasting: bornWasting, wealth: done.familyWealth ?? -1, seedn: LIFE_SEEDS.get(life) ?? -1,
    hp18: snap18?.hp ?? null, hap18: snap18?.hap ?? null,
    bel18: snap18?.bel ?? null, ail18: snap18?.ail ?? null,
    stuck: ticks >= 2999 && done.alive && done.age < 130,
  });
}

for (const era of ERAS) {
  for (let n = 0; n < livesPerEra; n++) driveLife(era.id, n);
}
if (process.env.ONLY) {
  const only = process.env.ONLY as string;
  const [eraId, n] = only.split('#');
  LIFE_SEEDS.set(only, Number(process.env.SEEDN ?? 1));
  process.env.VERBOSE = '1';
  driveLife(eraId as EraId, Number(n));
}

// ── report ──
console.log(`seed=${seed} lives=${lives.length} actions=${actions}`);
const crashes = lives.filter((l) => l.crash);
console.log(`crashes=${crashes.length}`);
for (const l of crashes.slice(0, 10)) console.log(`  CRASH ${l.era} age~${l.lifespan}: ${l.crash}`);
console.log(`violations=${violations.length}`);
for (const v of violations) console.log(`  ${v.kind} ${v.life} age=${v.age} ${v.detail}`);
console.log(`coverage=${coverage.length}`);
for (const c of coverage) console.log(`  GAP ${c}`);
const avg = (xs: number[]) => (xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) : '-');
const med = (xs: number[]) => {
  if (!xs.length) return '-';
  const s = [...xs].sort((a, b) => a - b);
  return String(s[Math.floor(s.length / 2)]);
};
console.log(`lifespan avg=${avg(lives.map((l) => l.lifespan))} med=${med(lives.map((l) => l.lifespan))}`);
for (const t of ['poor', 'modest', 'comfortable', 'wealthy']) {
  const g = lives.filter((l) => l.tier === t);
  const hungryShare = g.length ? (g.filter((l) => l.hungry > 0).length / g.length).toFixed(2) : '-';
  const capped = g.length ? (g.filter((l) => l.lifespan >= 130).length / g.length).toFixed(2) : '-';
  console.log(`  ${t}: n=${g.length} life=${avg(g.map((l) => l.lifespan))} med=${med(g.map((l) => l.lifespan))} capped=${capped} hungryShare=${hungryShare} money18=${avg(g.map((l) => l.money18 ?? NaN).filter((x) => !Number.isNaN(x)))}`);
  const num = (f: (l: (typeof g)[number]) => number | null) => avg(g.map(f).filter((x): x is number => x !== null));
  console.log(`    at18: hp=${num((l) => l.hp18)} hap=${num((l) => l.hap18)} bel=${num((l) => l.bel18)} ail=${num((l) => l.ail18)}`);
}
for (const [t, p] of Object.entries(pocket)) {
  console.log(`  pocket/${t}: gaveRate=${(p.gave / p.n).toFixed(2)} avgAmt=${p.gave ? (p.sum / p.gave).toFixed(1) : '-'}`);
}
for (const era of ERAS) {
  const g = lives.filter((l) => l.era === era.id && !l.crash);
  console.log(`  era/${era.id}: n=${g.length} life=${avg(g.map((l) => l.lifespan))} hungryShare=${g.length ? (g.filter((l) => l.hungry > 0).length / g.length).toFixed(2) : '-'}`);
}
const causes = new Map<string, number>();
for (const l of lives) {
  if (l.cause) causes.set(l.cause, (causes.get(l.cause) ?? 0) + 1);
}
console.log(`causes: ${[...causes.entries()].map(([k, v]) => `${k}=${v}`).join(', ')}`);
const fh = lives.filter((l) => l.firstHungry !== null).map((l) => l.firstHungry!);
console.log(`firstHunger avg age=${avg(fh)} hungryYears avg=${avg(lives.map((l) => l.hungry))}`);
const des = lives.filter((l) => l.destitute);
console.log(`destitute n=${des.length} life=${avg(des.map((l) => l.lifespan))} wasting=${des.filter((l) => l.wasting).length}`);
console.log(`weddings: proposeTried=${wedStats.proposeTried} proposed=${wedStats.proposed} married=${wedStats.married} divorced=${wedStats.divorced} marryTried=${wedStats.marryTried} marryMoneyMin=${wedStats.marryMoney.length ? Math.min(...wedStats.marryMoney) : '-'}`);
console.log(`proposedSeeds: ${wedStats.proposedSeeds.join(' ')}`);
console.log(`crisis: plagueCaught=${crisisStats.plague} fluCaught=${crisisStats.flu} famineCaught=${crisisStats.famine} breadline=${crisisStats.breadline} recovered=${crisisStats.recovered}`);
console.log(`met announcements: ${metStats.met}`);
console.log(`kids: born=${kidStats.born} ended=${kidStats.ended} grown=${kidStats.grown} childDeaths=${kidStats.childDeaths} forced=${kidStats.forced} promised=${kidStats.promised} gifts=${kidStats.gifts} kidCures=${kidStats.kidCures}`);
console.log(`crime: attempts=${crimeStats.attempts} caught=${crimeStats.caught} prisonYears=${crimeStats.prisonYears} debtEvents=${crimeStats.debtEvents}`);
console.log(`deaths: household=${deathStats.deaths} parents=${deathStats.parents} parentsYoung=${deathStats.parentsYoung} orphanedYoung=${deathStats.orphans}`);
for (const era of ERAS) {
  const de = deathStats.perEra[era.id];
  if (de) console.log(`  deaths/${era.id}: n=${de.n} perLife=${(de.deaths / de.n).toFixed(2)} parents=${de.parents} parentsYoung=${de.parentsYoung} orphans=${de.orphans}`);
}
console.log(`uni: enrolled=${uniStats.enrolled} graduated=${uniStats.graduated}`);
console.log(`war: served=${warStats.served} refused=${warStats.refused} kia=${warStats.kia} home=${warStats.home}`);
console.log(`servedFates: ${warStats.servedFates.join(' ')}`);
const capped = lives.filter((l) => l.lifespan >= 130 && !l.crash);
console.log(`capped=${capped.length} cappedWealths: ${capped.map((l) => l.wealth).join(',')}`);
const stuck = lives.filter((l) => l.stuck);
console.log(`stuck=${stuck.length} ${stuck.map((l) => `${l.era}:${l.lifespan}:seed=${l.seedn}`).join(' ')}`);
const buckets = (g: LifeStat[]) => {
  const f = (x: number) => (g.length ? (g.filter((l) => l.lifespan >= x).length / g.length).toFixed(2) : '-');
  return `70+=${f(70)} 80+=${f(80)} 90+=${f(90)} 100+=${f(100)} 110+=${f(110)}`;
};
console.log(`reach/all: ${buckets(lives.filter((l) => !l.crash))}`);
for (const e of ['atomic', 'modern-day']) {
  console.log(`reach/${e}: ${buckets(lives.filter((l) => l.era === e && !l.crash))}`);
}
