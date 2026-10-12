import type { Character } from '../types';
import { getEra } from '../data/eras';
import { SHOPS, SHOP_ITEMS, type ShopDef, type ShopItemDef } from '../data/shopping';

/**
 * What is for sale here and now. Shops gate on the period; items
 * gate on age and place, and durables (`once`) on ownership.
 */

/** Every shop open in this period. */
export function shopsFor(c: Character): ShopDef[] {
  return SHOPS.filter((s) => s.eras.includes(c.eraId));
}

export function shopById(id: string): ShopDef | undefined {
  return SHOPS.find((s) => s.id === id);
}

export function itemById(id: string): ShopItemDef | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

function itemOpen(item: ShopItemDef, c: Character): boolean {
  if (item.minAge !== undefined && c.age < item.minAge) return false;
  if (item.maxAge !== undefined && c.age > item.maxAge) return false;
  if (item.places !== undefined && !item.places.includes(c.placeId)) return false;
  return true;
}

/** Aisles with something on the shelf, in shop order. */
export function aislesFor(c: Character, shopId: string): string[] {
  const shop = shopById(shopId);
  if (!shop?.aisles) return [];
  return shop.aisles.filter((a) =>
    SHOP_ITEMS.some((i) => i.shopId === shopId && i.aisle === a && itemOpen(i, c)),
  );
}

/** Everything on the shelf in one shop (and aisle, for aisled shops). */
export function itemsFor(c: Character, shopId: string, aisle?: string): ShopItemDef[] {
  const shop = shopById(shopId);
  if (!shop || !shop.eras.includes(c.eraId)) return [];
  return SHOP_ITEMS.filter(
    (i) =>
      i.shopId === shopId &&
      itemOpen(i, c) &&
      (shop.aisles ? i.aisle === (aisle ?? aislesFor(c, shopId)[0]) : true),
  );
}

/** What it costs in this era's currency, as a positive figure. */
export function shopCost(item: ShopItemDef, c: Character): number {
  return Math.max(0, Math.round(item.cost * getEra(c.eraId).moneyScale));
}

/** How many of this item sit in the belongings. */
export function ownedCount(c: Character, itemId: string): number {
  return (c.belongings ?? []).filter((id) => id === itemId).length;
}

/** Durables sell once: disabled while one is owned. */
export function isOwnedOut(item: ShopItemDef, c: Character): boolean {
  return !!item.once && ownedCount(c, item.id) > 0;
}

/** Odds a gift is refused outright. Only very bad bonds refuse. */
export function giftRefusalChance(bond: number): number {
  return bond <= 10 ? 0.25 : 0;
}

/** How a gift lands: loved, neutral, odd, or missed entirely. */
export type GiftReaction = 'loved' | 'neutral' | 'odd' | 'disliked';

/**
 * What the recipient does and how much they like it. Trade keywords
 * match against what they do; children are children everywhere.
 * A loved trade wins, a hated one misses, a specialized gift for a
 * stranger puzzles, and plain goods please everyone alike.
 */
export function giftReaction(
  item: ShopItemDef,
  trade: string,
  age: number,
): GiftReaction {
  const tags = `${trade.toLowerCase()}${age < 14 ? ' child' : ''}`;
  const hit = (words?: string[]) => words?.some((w) => tags.includes(w)) ?? false;
  if (hit(item.tastes?.love)) return 'loved';
  if (hit(item.tastes?.hate)) return 'disliked';
  if ((item.tastes?.love?.length ?? 0) > 0 || (item.tastes?.hate?.length ?? 0) > 0) {
    return 'odd';
  }
  return 'neutral';
}

/** Bond for a received gift, by audience and reaction. */
export const GIFT_BOND: Record<'contact' | 'family', Record<GiftReaction, number>> = {
  contact: { loved: 14, neutral: 8, odd: 3, disliked: -5 },
  family: { loved: 10, neutral: 6, odd: 2, disliked: -4 },
};

/** Happiness for a received gift, by reaction. */
export const GIFT_HAPPINESS: Record<GiftReaction, number> = {
  loved: 2,
  neutral: 1,
  odd: 0,
  disliked: -2,
};

/** The staple parents stock: first staple whose shop is open here. */
export function stapleFor(c: Character): ShopItemDef | undefined {
  return SHOP_ITEMS.find(
    (i) => i.staple && shopById(i.shopId)?.eras.includes(c.eraId),
  );
}

/** Owned foods with counts, most filling first. */
export function ownedEdibles(
  c: Character,
): { item: ShopItemDef; count: number }[] {
  const counts = new Map<string, number>();
  for (const id of c.belongings ?? []) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const out: { item: ShopItemDef; count: number }[] = [];
  for (const [id, count] of counts) {
    const item = itemById(id);
    if (item?.sates) out.push({ item, count });
  }
  return out.sort((a, b) => (b.item.sates ?? 0) - (a.item.sates ?? 0));
}

/** Owned rings with counts, dearest first. */
export function ringsOwned(
  c: Character,
): { item: ShopItemDef; count: number }[] {
  const counts = new Map<string, number>();
  for (const id of c.belongings ?? []) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const out: { item: ShopItemDef; count: number }[] = [];
  for (const [id, count] of counts) {
    const item = itemById(id);
    if (item?.ring) out.push({ item, count });
  }
  return out.sort((a, b) => b.item.cost - a.item.cost);
}

/** A dearer ring asks better. */
export function ringBonus(item: ShopItemDef): number {
  return item.cost >= 15 ? 0.2 : item.cost >= 6 ? 0.1 : 0;
}
