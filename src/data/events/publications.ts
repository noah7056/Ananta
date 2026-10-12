import type { LifeEvent } from '../../types';
import { BOOKS } from '../books';

/**
 * Fresh off the press. Every book with a publication year gets one
 * announcement, eligible only in that calendar year — so if you live
 * through it, you may hear about it. Books sharing a year compete
 * like any events do, and only one fires.
 *
 * Nothing to add by hand: a `year` on a book is enough.
 */
export const PUBLICATION_EVENTS: LifeEvent[] = BOOKS.filter(
  (b) => b.year !== undefined,
).map((b) => ({
  id: `published-${b.id}`,
  title: 'Fresh off the press',
  description: `${b.title} has just come out, and everybody is talking about it.`,
  category: 'opportunity',
  conditions: {
    year: b.year,
    minAge: b.minAge,
    maxAge: b.maxAge,
    oncePerLife: true,
  },
  weight: 4,
  choices: [
    {
      id: 'read',
      text: 'Read it',
      effects: {
        openBook: b.id,
        journal: `You got hold of ${b.title} the week it came out.`,
      },
    },
    {
      id: 'leave',
      text: 'Nevermind',
      effects: {
        journal: `You let ${b.title} pass you by.`,
      },
    },
  ],
}));
