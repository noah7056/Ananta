import type { EraId, Stats } from '../types';

/**
 * Salon and spa. One menu for everything done to the body on purpose:
 * massages anywhere, barbers and baths in the old world, beauty
 * parlors in the atomic age, and the full modern list — nails, tanning
 * beds, waxes, priced cheap to very expensive. Tanning is not on offer
 * before the atomic age, and waxing gets the modern treatment only.
 *
 * To extend: add a row. Gate it with `eras` and `minAge` — pampering
 * opens at high school, the dearest chairs only after studies.
 */

export interface SalonService {
  id: string;
  /** button text */
  text: string;
  /** journal line, second person */
  journal: string;
  /** one line for the feedback popup */
  notice: string;
  /** what a full session does */
  stats: Partial<Stats>;
  /** base-unit cost, scaled by the era, cheap to very expensive */
  cost: number;
  minAge?: number;
  maxAge?: number;
  /** gate to a period; omit for everywhere */
  eras?: EraId[];
  /** era-specific wording, when the era has its own way of saying it */
  wording?: Partial<Record<EraId, { text: string; journal: string; notice: string }>>;
}

export const SALON_SERVICES: SalonService[] = [
  // anywhere, any time
  {
    id: 'massage',
    text: 'Massage',
    journal: 'You had a massage.',
    notice: 'You come out loose-limbed.',
    stats: { health: 3, happiness: 3 },
    cost: 2,
    minAge: 4,
    wording: {
      'ancient-world': {
        text: 'Oil massage',
        journal: 'You were oiled and kneaded at the baths.',
        notice: 'You come out loose-limbed and smelling of bay.',
      },
      medieval: {
        text: 'Rubdown',
        journal: 'You took a rubdown at the bathhouse.',
        notice: 'Your back forgives you.',
      },
      'age-of-sail': {
        text: 'Rubdown',
        journal: 'You took a rubdown after the voyage.',
        notice: 'The knots of the crossing come undone.',
      },
      industrial: {
        text: 'Turkish bath massage',
        journal: 'You took a massage in the Turkish baths.',
        notice: 'Steam, soap, and strong hands.',
      },
    },
  },
  {
    id: 'haircut',
    text: 'Haircut',
    journal: 'You had your hair cut.',
    notice: 'You look sharper already.',
    stats: { looks: 3, happiness: 1 },
    cost: 1,
    minAge: 6,
  },

  // ancient world
  {
    id: 'oils',
    text: 'Perfumed oils',
    journal: 'You were rubbed with perfumed oils.',
    notice: 'You smell expensive for days.',
    stats: { happiness: 2, looks: 1 },
    cost: 2,
    minAge: 10,
    eras: ['ancient-world'],
  },
  {
    id: 'depilation',
    text: 'Depilation',
    journal: 'You had the hair plucked where it offended.',
    notice: 'Smooth as marble, and it stung.',
    stats: { looks: 4 },
    cost: 2,
    minAge: 15,
    eras: ['ancient-world'],
  },

  // middle ages
  {
    id: 'shave',
    text: 'Shave at the barber-surgeon',
    journal: 'The barber-surgeon shaved you with a straight razor.',
    notice: 'Not a nick on you. A good day.',
    stats: { looks: 3 },
    cost: 1,
    minAge: 14,
    eras: ['medieval'],
  },
  {
    id: 'herbal',
    text: 'Herbal bath',
    journal: 'You soaked in a tub of herbs.',
    notice: 'You smell of rosemary and sleep well.',
    stats: { health: 2, happiness: 2 },
    cost: 1,
    minAge: 10,
    eras: ['medieval'],
  },

  // age of sail
  {
    id: 'wig',
    text: 'Powdered wig',
    journal: 'You were powdered and wigged for the evening.',
    notice: 'Nobody will know your own hair.',
    stats: { looks: 5 },
    cost: 3,
    minAge: 15,
    eras: ['age-of-sail'],
  },
  {
    id: 'soak',
    text: 'Hot soak',
    journal: 'You soaked the voyage out of your bones.',
    notice: 'Hot water does what rum cannot.',
    stats: { health: 2, happiness: 1 },
    cost: 1,
    minAge: 10,
    eras: ['age-of-sail'],
  },

  // industrial
  {
    id: 'hottowel',
    text: 'Hot-towel shave',
    journal: 'The barber wrapped your face in hot towels and shaved you.',
    notice: 'The closest shave of your life.',
    stats: { looks: 3, happiness: 1 },
    cost: 1,
    minAge: 12,
    eras: ['industrial'],
  },
  {
    id: 'pennybath',
    text: 'Penny bath',
    journal: 'You took a penny bath at the public baths.',
    notice: 'Clean to the bone for a penny.',
    stats: { health: 2, happiness: 1 },
    cost: 1,
    minAge: 6,
    eras: ['industrial'],
  },

  // atomic
  {
    id: 'manicure',
    text: 'Manicure',
    journal: 'You had your nails done.',
    notice: 'You keep catching yourself admiring your hands.',
    stats: { looks: 3, happiness: 1 },
    cost: 2,
    minAge: 15,
    eras: ['atomic', 'modern-day'],
  },
  {
    id: 'pedicure',
    text: 'Pedicure',
    journal: 'You had your feet seen to.',
    notice: 'You walk differently for a week.',
    stats: { looks: 3, happiness: 1 },
    cost: 2,
    minAge: 15,
    eras: ['atomic', 'modern-day'],
  },
  {
    id: 'hairdo',
    text: 'Hairdo',
    journal: 'You sat under the dryer and came out somebody else.',
    notice: 'It holds its shape through wind.',
    stats: { looks: 4, happiness: 2 },
    cost: 3,
    minAge: 15,
    eras: ['atomic'],
  },
  {
    id: 'sunlamp',
    text: 'Sun lamp session',
    journal: 'You lay under the sun lamp until you glowed.',
    notice: 'Summer in February.',
    stats: { looks: 4, happiness: 1 },
    cost: 3,
    minAge: 15,
    eras: ['atomic'],
  },

  // modern day
  {
    id: 'both',
    text: 'Manicure and pedicure',
    journal: 'You had the full set done, hands and feet.',
    notice: 'Polished everywhere it shows.',
    stats: { looks: 5, happiness: 2 },
    cost: 3,
    minAge: 18,
    eras: ['modern-day'],
  },
  {
    id: 'spray',
    text: 'Spray tan',
    journal: 'You stood in a booth and were sprayed brown.',
    notice: 'A week in the sun, in ten minutes.',
    stats: { looks: 4, happiness: 2 },
    cost: 3,
    minAge: 15,
    eras: ['modern-day'],
  },
  {
    id: 'bed',
    text: 'Tanning bed',
    journal: 'You lay in the tanning bed until the timer rang.',
    notice: 'Bronzed and a little singed.',
    stats: { looks: 5, happiness: 1, health: -1 },
    cost: 4,
    minAge: 18,
    eras: ['modern-day'],
  },
  {
    id: 'bikini',
    text: 'Bikini wax',
    journal: 'You had a bikini wax.',
    notice: 'Neat, and it stung less than feared.',
    stats: { looks: 3, happiness: 1 },
    cost: 2,
    minAge: 15,
    eras: ['modern-day'],
  },
  {
    id: 'french',
    text: 'French wax',
    journal: 'You had a french wax.',
    notice: 'Precise work, quickly done.',
    stats: { looks: 5, happiness: 1 },
    cost: 3,
    minAge: 15,
    eras: ['modern-day'],
  },
  {
    id: 'hollywood',
    text: 'Hollywood wax',
    journal: 'You had a hollywood wax.',
    notice: 'Nothing left to the imagination, including the bill.',
    stats: { looks: 6, happiness: 2 },
    cost: 5,
    minAge: 18,
    eras: ['modern-day'],
  },
  {
    id: 'brazilian',
    text: 'Brazilian, full body',
    journal: 'You had the full brazilian.',
    notice: 'The dearest hour of your year.',
    stats: { looks: 7, happiness: 2 },
    cost: 6,
    minAge: 18,
    eras: ['modern-day'],
  },
];
