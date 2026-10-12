/**
 * Ailment catalog: lasting sicknesses inflicted by illness events
 * (ChoiceEffect.addAilments) and cured one at a time by doctors.
 * drain is yearly health loss, cureCost is base units × moneyScale.
 * Add entries here to expand sickness — no engine changes needed.
 */
export interface AilmentDef {
  name: string;
  drain: number;
  cureCost: number;
  incurable?: boolean;
}

export const AILMENTS: Record<string, AilmentDef> = {
  flu: { name: 'Flu', drain: 2, cureCost: 4 },
  stomach: { name: 'Bad stomach', drain: 2, cureCost: 3 },
  cough: { name: 'Winter cough', drain: 1, cureCost: 3 },
  joints: { name: 'Stiff joints', drain: 1, cureCost: 5 },
  frailty: { name: 'Frailty', drain: 3, cureCost: 10 },
  'heart-disease': { name: 'Heart disease', drain: 6, cureCost: 0, incurable: true },
  'failing-health': { name: 'Failing organs', drain: 10, cureCost: 0, incurable: true },
  wasting: { name: 'Wasting sickness', drain: 2, cureCost: 0, incurable: true },
  plague: { name: 'The Plague', drain: 18, cureCost: 0, incurable: true },
  influenza: { name: 'Influenza', drain: 4, cureCost: 0, incurable: true },
  covid: { name: 'Covid', drain: 3, cureCost: 0, incurable: true },
  hunger: { name: 'Hunger', drain: 5, cureCost: 4 },
};
