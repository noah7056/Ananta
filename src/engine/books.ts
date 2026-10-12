import type { Character } from '../types';
import { BOOKS, BOOKS_PER_SHELF, type BookDef } from '../data/books';
import { ERA_ORDER } from '../data/eras';

/**
 * What is on the shelf for this reader. Filtered by period and age,
 * then shuffled and cut to the shelf size — so the list is different
 * every time you look. Old books survive into later eras; a book
 * with a year only exists from that year on.
 */

/** Everything this reader could in principle pick up. */
export function eligibleBooks(c: Character): BookDef[] {
  const now = c.birthYear + c.age;
  const eraIdx = ERA_ORDER.indexOf(c.eraId);
  return BOOKS.filter(
    (b) =>
      (b.fromEra === undefined || ERA_ORDER.indexOf(b.fromEra) <= eraIdx) &&
      (b.year === undefined || now >= b.year) &&
      (b.minAge === undefined || c.age >= b.minAge) &&
      (b.maxAge === undefined || c.age <= b.maxAge),
  );
}

/** A fresh shelf: up to the cap, in no particular order. */
export function availableBooks(
  c: Character,
  rng: () => number = Math.random,
): BookDef[] {
  const pool = [...eligibleBooks(c)];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, BOOKS_PER_SHELF);
}
