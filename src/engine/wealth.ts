/**
 * The house you are born into. Rolled once per life, never shown —
 * only hinted at in the birth line. It tilts pocket money and
 * childhood food, and later systems can read it too.
 */

export type WealthTier = 'poor' | 'modest' | 'comfortable' | 'wealthy';

/** 0–100, bunched in the middle: most houses get by. */
export function rollWealth(rng: () => number = Math.random): number {
  return Math.round((rng() * 100 + rng() * 100) / 2);
}

export function wealthTier(w: number): WealthTier {
  if (w < 25) return 'poor';
  if (w < 50) return 'modest';
  if (w < 75) return 'comfortable';
  return 'wealthy';
}

/** One hint sentence for the birth entry. */
export function birthWealthHint(w: number, destitute = false): string {
  if (destitute) return 'You were born into hunger.';
  switch (wealthTier(w)) {
    case 'poor':
      return 'There is little to spare in the house.';
    case 'modest':
      return 'The house keeps itself, and little more.';
    case 'comfortable':
      return 'The house wants for nothing.';
    case 'wealthy':
      return 'The house has more than it needs.';
  }
}

/** How wealth moves the odds of pocket money. */
export function pocketChanceFactor(w: number, destitute = false): number {
  if (destitute) return 0.2;
  switch (wealthTier(w)) {
    case 'poor':
      return 0.5;
    case 'modest':
      return 0.8;
    case 'comfortable':
      return 1.1;
    case 'wealthy':
      return 1.4;
  }
}

/** How wealth moves the size of pocket money. */
export function pocketAmountFactor(w: number, destitute = false): number {
  if (destitute) return 0.3;
  switch (wealthTier(w)) {
    case 'poor':
      return 0.5;
    case 'modest':
      return 0.8;
    case 'comfortable':
      return 1.2;
    case 'wealthy':
      return 2;
  }
}

/** How well infants are fed: poor houses feed less. */
export function infantFedLevel(w: number): number {
  switch (wealthTier(w)) {
    case 'poor':
      return 60;
    case 'modest':
      return 70;
    case 'comfortable':
      return 80;
    case 'wealthy':
      return 90;
  }
}

/** Staples parents keep children stocked with. */
export function stapleTarget(w: number): number {
  switch (wealthTier(w)) {
    case 'poor':
      return 2;
    case 'modest':
      return 2;
    case 'comfortable':
      return 2;
    case 'wealthy':
      return 3;
  }
}

/** Odds a very poor house has nothing to give this year. */
export function stapleSkipChance(w: number): number {
  return wealthTier(w) === 'poor' ? 0.5 : 0;
}
