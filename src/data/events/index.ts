import type { LifeEvent } from '../../types';
import { COMMON_EVENTS } from './common';
import { ERA_EVENTS } from './era';
import { PLACE_EVENTS } from './place';
import { PUBLICATION_EVENTS } from './publications';

/**
 * The event catalog, in three files:
 *
 *   common.ts — anything that can happen anywhere, grouped by age
 *   era.ts    — gated on `eras`, one period at a time
 *   place.ts  — gated on `places`, one birthplace at a time
 *
 * Publication announcements live apart (`publications.ts`, one per
 * dated book) because the yearly loop gives them the year's slot
 * outright when their year comes round — they are not rolled for.
 *
 * To add an event, drop it in the right file. House rules for every
 * entry: second person throughout, a money figure only where it
 * matters, one journal sentence per choice, and `maxPerLife` on
 * anything repeatable so nothing comes round twice.
 */
export const EVENTS: LifeEvent[] = [
  ...COMMON_EVENTS,
  ...ERA_EVENTS,
  ...PLACE_EVENTS,
];

export { COMMON_EVENTS, ERA_EVENTS, PLACE_EVENTS, PUBLICATION_EVENTS };