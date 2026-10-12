import type { Character, EraId } from '../types';
import { countryOf, getEra } from '../data/eras';
import type { ShopItemDef } from '../data/shopping';
import { aislesFor, itemById, itemsFor, shopsFor } from './shopping';

/**
 * Driving. Motors need a licence; horses never did.
 *
 * Only the motor eras ask for one — earlier periods get in and go.
 * Where one is needed, the age depends on the country: most
 * places say 18, some say 17 or 16.
 */

/** Periods where driving without a licence is not driving at all. */
export const LICENCE_ERAS: EraId[] = ['industrial', 'atomic', 'modern-day'];

/** What most of the world says. */
export const DEFAULT_LICENCE_AGE = 18;

/** Places that say otherwise. Everywhere else reads 18. */
export const LICENCE_AGE_BY_COUNTRY: Record<string, number> = {
  'United States': 16,
  Canada: 16,
  'United Kingdom': 17,
  Australia: 17,
  Ireland: 17,
};

/** Base-unit price of the licence itself, scaled by the era. */
export const LICENCE_COST = 4;

/** The flag set when a licence is held. */
export const LICENCE_FLAG = 'has-licence';

/** Does this period ask for a licence at all? */
export function needsLicence(eraId: EraId): boolean {
  return LICENCE_ERAS.includes(eraId);
}

/** How old you must be here, in this country, to hold one. */
export function licenceAgeFor(c: Character): number {
  return LICENCE_AGE_BY_COUNTRY[countryOf(c)] ?? DEFAULT_LICENCE_AGE;
}

/** Whether this character holds a licence. */
export function hasLicence(c: Character): boolean {
  return c.flags.includes(LICENCE_FLAG);
}

/** Whether a licence is on offer: needed, not held, old enough. */
export function canGetLicence(c: Character): boolean {
  return (
    needsLicence(c.eraId) && !hasLicence(c) && c.age >= licenceAgeFor(c)
  );
}

/** What the licence costs in this era's currency. */
export function licenceCost(c: Character): number {
  return Math.max(0, Math.round(LICENCE_COST * getEra(c.eraId).moneyScale));
}

/** Whether this belonging is something you can drive or ride. */
export function isVehicle(itemId: string): boolean {
  return itemById(itemId)?.vehicle === true;
}

/** Whether this character owns anything they can drive or ride. */
export function ownsVehicle(c: Character): boolean {
  return (c.belongings ?? []).some(isVehicle);
}

/** Whether this character may take this vehicle out right now. */
export function canDrive(c: Character): boolean {
  return !needsLicence(c.eraId) || hasLicence(c);
}

/**
 * The humblest vehicle on sale to this character right now, for a
 * rich house that feels generous. Null when nothing is on offer.
 */
export function giftVehicleFor(c: Character): ShopItemDef | null {
  let cheapest: ShopItemDef | null = null;
  for (const shop of shopsFor(c)) {
    const aisles = shop.aisles ? aislesFor(c, shop.id) : [undefined];
    for (const aisle of aisles) {
      for (const item of itemsFor(c, shop.id, aisle)) {
        if (!item.vehicle) continue;
        if (!cheapest || item.cost < cheapest.cost) cheapest = item;
      }
    }
  }
  return cheapest;
}
