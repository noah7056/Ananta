import type { Character, Stats } from '../types';
import { getEra } from '../data/eras';
import { renderText } from './eventEngine';

export const clampStat = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

export function clampStats(s: Stats): Stats {
  return {
    health: clampStat(s.health),
    happiness: clampStat(s.happiness),
    smarts: clampStat(s.smarts),
    looks: clampStat(s.looks),
    energy: clampStat(s.energy ?? 70),
    reputation: clampStat(s.reputation ?? 50),
  };
}

/** "¤42" / "$1,250" / "-$30" — funds with the era's symbol. */
export function formatFunds(money: number, symbol: string): string {
  const rounded = Math.round(money);
  const sign = rounded < 0 ? '-' : '';
  return `${sign}${symbol}${Math.abs(rounded).toLocaleString('en-US')}`;
}

/** Single plain line for uneventful years. */
export function quietLine(c: Character, placeName: string): string {
  return renderText('Another year comes.', c, placeName);
}

/**
 * Yearly vital drift:
 * Equal chance of no stat changes (50%) or some stats change (50%).
 * When stats change: either 1 or 2 stats change by a small amount (-2 to +2),
 * and NEVER health or energy (health changes only via events or illness;
 * energy has its own exertion/rest economy).
 */
export function yearlyDrift(
  _c: Character,
  _declineRate: number,
  rng: () => number = Math.random,
): Partial<Stats> {
  const drift: Partial<Stats> = {};
  // 50% chance no stat changes
  if (rng() < 0.5) {
    return drift;
  }
  // 50% chance: 1 or 2 mood/mind stats change slightly
  const driftable: (keyof Stats)[] = ['happiness', 'smarts', 'looks', 'reputation'];
  const count = rng() < 0.5 ? 1 : 2;
  const shuffled = [...driftable].sort(() => rng() - 0.5);
  const chosen = shuffled.slice(0, count);
  const deltas = [-2, -1, 1, 2];

  for (const stat of chosen) {
    drift[stat] = deltas[Math.floor(rng() * deltas.length)];
  }
  return drift;
}

/**
 * Death only occurs when health completely deteriorates to 0.
 * No sudden unmotivated deaths.
 */
export function deathRoll(
  c: Character,
  _lifeExpectancy: number,
): string | null {
  if (c.stats.health <= 0) {
    const heart = c.ailments.find((a) => a.ownerId === null && a.ailmentId === 'heart-disease');
    if (heart) return 'complications from chronic heart disease';
    const failing = c.ailments.find((a) => a.ownerId === null && a.ailmentId === 'failing-health');
    if (failing) return 'failing organ functions in old age';
    const anyAilment = c.ailments.find((a) => a.ownerId === null);
    if (anyAilment) return `complications from ${anyAilment.ailmentId}`;
    return 'worn down by failing health in old age';
  }
  return null;
}

/** One-line epitaph quality based on the finished life. */
export function epitaph(c: Character): string {
  const s = c.stats;
  const score = s.happiness + s.smarts + s.looks;
  if (c.age < 10) return 'A brief candle, mourned deeply.';
  if (score > 200) return 'A luminous life, well and warmly lived.';
  if (score > 140) return 'A full life of ups and downs, faced head-on.';
  const comfortLine = 20 * getEra(c.eraId).moneyScale;
  if (c.money > comfortLine) return 'Died comfortable — richer in coin than in years.';
  if (s.happiness > 70) return 'Remembered with deep joy and affection.';
  return 'An ordinary life, which is to say: an extraordinary one.';
}

/** A life as plain text: header, epitaph, then the journal by age. */
export function lifeAsText(c: Character): string {
  const era = getEra(c.eraId);
  const lines = [
    `${c.name} — ${era.name}, age ${c.age}${c.alive ? '' : ` — died: ${c.causeOfDeath ?? 'old age'}`}`,
    `“${epitaph(c)}”`,
    '',
  ];
  let lastAge = -1;
  for (const e of c.log) {
    if (e.age !== lastAge) {
      lines.push(`Age ${e.age} · ${e.year}`);
      lastAge = e.age;
    }
    lines.push(e.text);
  }
  return lines.join('\n');
}

/** Download the life as a file: JSON with character + text journal. */
export function downloadLife(c: Character): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    character: c,
    journal: lifeAsText(c),
    epitaph: epitaph(c),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safe = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'life';
  a.href = url;
  a.download = `ananta-${safe}-age-${c.age}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
