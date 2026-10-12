import type { Era, EraId, Place } from '../types';

/**
 * The playable eras. They are named for a period rather than a
 * country: you pick the age of the world, then any place that
 * existed in it. Places carry their own currency and their own
 * lifespan, so one era holds a dozen different lives.
 *
 * To add a new era, append a PLACES list below plus one row in ERAS
 * (and extend EraId in src/types/index.ts) — no engine changes needed.
 *
 * Money is authored in base units everywhere (events, wages) and
 * multiplied by the era's moneyScale at apply time, so one event
 * pack stays sensible from coins to modern currency.
 *
 * HOW TO ADD A BIRTHPLACE
 * - Find the era, then the country block ("── Italy ──"). Countries
 *   within an era are listed in picker order; cities stay grouped
 *   under their country, so copy a neighbour line.
 * - A town is one line; the display name defaults to "City, Country":
 *     city('industrial-italy-naples', 'Italy', 'Naples', { moneySymbol: 'L' }),
 * - A region with no single town (no city dropdown entry) is one line:
 *     region('ancient-world-rhine', 'Germania', 'The Rhine Frontier', { lifespanMod: -2 }),
 * - A new country is a new block at the end of the era:
 *     // ── Newcountry ──
 *     city('...', 'Newcountry', '...'),
 * - Rules: the id must be unique across the whole file (prefix it with
 *   the era, e.g. 'medieval-...'). Pass `name:` only when the display
 *   differs from "City, Country". Pass `moneySymbol:` only when the
 *   place used its own coin (otherwise the era's applies). Pass
 *   `lifespanMod:` only for harsher/healthier places (years added to
 *   the era's life expectancy).
 */

/** Options shared by both place helpers; every field is optional. */
interface PlaceOpts {
  /** display name; defaults to "City, Country" for towns */
  name?: string;
  /** currency used here; defaults to the era's moneySymbol */
  moneySymbol?: string;
  /** years added to the era's life expectancy */
  lifespanMod?: number;
}

/**
 * A town: shows its city in the picker under its country. The display
 * name is "City, Country" unless `name` overrides it.
 */
function city(id: string, country: string, cityName: string, opts: PlaceOpts = {}): Place {
  const { name = `${cityName}, ${country}`, ...rest } = opts;
  return { id, name, country, city: cityName, ...rest };
}

/**
 * A region with no single town: shows the full name in the picker and
 * has no city entry (e.g. 'Yorkshire, England', 'The Rhine Frontier').
 */
function region(id: string, country: string, name: string, opts: Omit<PlaceOpts, 'name'> = {}): Place {
  return { id, name, country, ...opts };
}


// ════ Ancient World · c. 100 AD ════
// Countries: Italy · Egypt · Britain · France · Greece · Judaea · Spain · Tunisia · Syria · Parthia · Germania · China · Nubia · India · Japan · Arabia · Ethiopia
const ANCIENT_WORLD_PLACES: Place[] = [
  // ── Italy ──
  city('roman-rome', 'Italy', 'Rome', { name: 'Rome', moneySymbol: 'd', lifespanMod: 1 }),
  city('italy-ostia', 'Italy', 'Ostia', { moneySymbol: 'd' }),
  city('italy-mediolanum', 'Italy', 'Mediolanum', { name: 'Mediolanum', moneySymbol: 'd' }),
  city('italy-neapolis', 'Italy', 'Neapolis', { name: 'Neapolis', moneySymbol: 'd' }),
  // ── Egypt ──
  city('roman-egypt', 'Egypt', 'Alexandria', { name: 'Alexandria', moneySymbol: 'Δρ', lifespanMod: 1 }),
  city('egypt-memphis', 'Egypt', 'Memphis', { moneySymbol: 'Δρ' }),
  // ── Britain ──
  region('roman-britain', 'Britain', 'Britannia', { moneySymbol: 'd', lifespanMod: -3 }),
  city('britain-eboracum', 'Britain', 'Eboracum'),
  city('britain-londinium', 'Britain', 'Londinium', { name: 'Londinium', moneySymbol: 'd' }),
  // ── France ──
  city('roman-gaul', 'France', 'Lugdunum', { name: 'Lugdunum', moneySymbol: 'd' }),
  city('france-lutetia', 'France', 'Lutetia', { name: 'Lutetia', moneySymbol: 'd' }),
  // ── Greece ──
  city('greece-athens', 'Greece', 'Athens', { moneySymbol: 'Δρ' }),
  city('greece-corinth', 'Greece', 'Corinth', { moneySymbol: 'Δρ' }),
  city('greece-byzantium', 'Greece', 'Byzantium', { name: 'Byzantium', moneySymbol: 'Δρ' }),
  // ── Judaea ──
  city('judea-jerusalem', 'Judaea', 'Jerusalem', { moneySymbol: 'M' }),
  city('judea-caesarea', 'Judaea', 'Caesarea'),
  // ── Spain ──
  city('hispania-tarraco', 'Spain', 'Tarraco', { moneySymbol: 'd' }),
  city('hispania-emerita', 'Spain', 'Emerita'),
  city('hispania-corduba', 'Spain', 'Corduba'),
  city('spain-hispalis', 'Spain', 'Hispalis', { name: 'Hispalis', moneySymbol: 'd' }),
  // ── Tunisia ──
  city('africa-carthage', 'Tunisia', 'Carthage', { moneySymbol: 'M' }),
  city('africa-utica', 'Tunisia', 'Utica'),
  // ── Syria ──
  city('syria-antioch', 'Syria', 'Antioch', { moneySymbol: 'Δρ' }),
  city('syria-palmyra', 'Syria', 'Palmyra'),
  city('syria-dura', 'Syria', 'Dura'),
  // ── Parthia ──
  city('parthia-ctesiphon', 'Parthia', 'Ctesiphon', { moneySymbol: 'Δρ' }),
  city('parthia-ecbatana', 'Parthia', 'Ecbatana'),
  // ── Germania ──
  region('germania-frontier', 'Germania', 'The Rhine Frontier', { moneySymbol: 'M', lifespanMod: -2 }),
  city('germania-mogontiacum', 'Germania', 'Mogontiacum'),
  // ── China ──
  city('china-changan', 'China', "Chang'an", { moneySymbol: '文' }),
  city('china-luoyang', 'China', 'Luoyang'),
  city('china-chengdu', 'China', 'Chengdu'),
  // ── Nubia ──
  city('nubia-meroe', 'Nubia', 'Meroë', { moneySymbol: 'M' }),
  city('nubia-napata', 'Nubia', 'Napata'),
  // ── India ──
  city('india-pataliputra', 'India', 'Pataliputra'),
  city('india-varanasi', 'India', 'Varanasi'),
  // ── Japan ──
  city('japan-yamato', 'Japan', 'Yamato'),
  city('japan-nara', 'Japan', 'Nara'),
  // ── Arabia ──
  city('arabia-petra', 'Arabia', 'Petra'),
  city('arabia-medina', 'Arabia', 'Medina'),
  // ── Ethiopia ──
  city('ethiopia-axum', 'Ethiopia', 'Axum'),
  city('ethiopia-gondar', 'Ethiopia', 'Gondar'),
];

// ════ Middle Ages · c. 1300 ════
// Countries: England · Italy · Russia · France · Spain · Germany · Ireland · Scotland · Byzantium · Egypt · Holy Land · Norway · Poland · China · Japan · India · Hungary · Sweden · Portugal · Mali · Greece · Tunisia · Arabia
const MEDIEVAL_PLACES: Place[] = [
  // ── England ──
  region('england-village', 'England', 'Yorkshire, England', { moneySymbol: 'd', lifespanMod: -2 }),
  city('england-york', 'England', 'York', { moneySymbol: 'd' }),
  city('england-canterbury', 'England', 'Canterbury', { moneySymbol: 'd' }),
  city('england-london-med', 'England', 'London'),
  city('england-bristol-med', 'England', 'Bristol', { moneySymbol: 'd' }),
  // ── Italy ──
  city('italy-florence', 'Italy', 'Florence', { moneySymbol: 'ƒ', lifespanMod: 2 }),
  city('italy-venice', 'Italy', 'Venice', { moneySymbol: 'D' }),
  city('italy-rome-med', 'Italy', 'Rome', { moneySymbol: 'ƒ' }),
  city('italy-milan-med', 'Italy', 'Milan', { moneySymbol: 'ƒ' }),
  city('italy-genoa-med', 'Italy', 'Genoa', { moneySymbol: 'ƒ' }),
  city('italy-naples-med', 'Italy', 'Naples', { moneySymbol: 'ƒ' }),
  // ── Russia ──
  city('russia-novgorod', 'Russia', 'Novgorod', { moneySymbol: 'M', lifespanMod: -4 }),
  city('russia-kiev', 'Russia', 'Kiev', { moneySymbol: 'M' }),
  city('russia-moscow-med', 'Russia', 'Moscow'),
  // ── France ──
  city('france-paris', 'France', 'Paris', { moneySymbol: 'd' }),
  city('france-rouen', 'France', 'Rouen', { moneySymbol: 'd' }),
  city('france-lyon-med', 'France', 'Lyon'),
  // ── Spain ──
  city('iberia-toledo', 'Spain', 'Toledo', { moneySymbol: 'M' }),
  city('spain-cordoba', 'Spain', 'Córdoba', { moneySymbol: 'M' }),
  city('spain-merida-med', 'Spain', 'Mérida'),
  city('spain-barcelona-med', 'Spain', 'Barcelona', { moneySymbol: 'M' }),
  city('spain-sevilla-med', 'Spain', 'Sevilla', { moneySymbol: 'M' }),
  city('spain-tarragona-med', 'Spain', 'Tarragona', { moneySymbol: 'M' }),
  // ── Germany ──
  city('germany-aachen', 'Germany', 'Aachen', { moneySymbol: 'd' }),
  city('germany-lubeck', 'Germany', 'Lübeck', { moneySymbol: 'd' }),
  city('germany-mainz-med', 'Germany', 'Mainz'),
  city('germany-hamburg-med', 'Germany', 'Hamburg', { moneySymbol: 'd' }),
  // ── Ireland ──
  city('ireland-dublin', 'Ireland', 'Dublin', { moneySymbol: 'd' }),
  city('ireland-limerick', 'Ireland', 'Limerick'),
  // ── Scotland ──
  city('scotland-edinburgh', 'Scotland', 'Edinburgh', { moneySymbol: 'd' }),
  city('scotland-perth', 'Scotland', 'Perth'),
  // ── Byzantium ──
  city('byzantium-constantinople', 'Byzantium', 'Constantinople', { name: 'Constantinople', moneySymbol: 'B', lifespanMod: 1 }),
  city('byzantium-nicaea', 'Byzantium', 'Nicaea'),
  city('byzantium-smyrna-med', 'Byzantium', 'Smyrna', { moneySymbol: 'B' }),
  // ── Egypt ──
  city('egypt-cairo-med', 'Egypt', 'Cairo', { moneySymbol: 'D' }),
  city('egypt-alexandria-med', 'Egypt', 'Alexandria'),
  // ── Holy Land ──
  city('holyland-jerusalem', 'Holy Land', 'Jerusalem', { name: 'Jerusalem', moneySymbol: 'B' }),
  city('holyland-acre', 'Holy Land', 'Acre'),
  city('holyland-antioch-med', 'Holy Land', 'Antioch', { name: 'Antioch', moneySymbol: 'B' }),
  // ── Norway ──
  city('norway-bergen', 'Norway', 'Bergen', { moneySymbol: 'd' }),
  city('norway-nidaros', 'Norway', 'Nidaros'),
  // ── Poland ──
  city('poland-krakow', 'Poland', 'Kraków', { moneySymbol: 'gr' }),
  city('poland-gniezno', 'Poland', 'Gniezno'),
  city('poland-warsaw-med', 'Poland', 'Warsaw', { moneySymbol: 'gr' }),
  // ── China ──
  city('china-hangzhou', 'China', 'Hangzhou', { moneySymbol: '文' }),
  city('china-kaifeng', 'China', 'Kaifeng'),
  city('china-luoyang-med', 'China', 'Luoyang'),
  city('china-beijing-med', 'China', 'Beijing', { moneySymbol: '文' }),
  city('china-chengdu-med', 'China', 'Chengdu', { moneySymbol: '文' }),
  // ── Japan ──
  city('japan-kyoto', 'Japan', 'Kyoto', { moneySymbol: '文' }),
  city('japan-kamakura', 'Japan', 'Kamakura'),
  city('japan-nara-med', 'Japan', 'Nara'),
  // ── India ──
  city('india-delhi-med', 'India', 'Delhi', { moneySymbol: 'T' }),
  city('india-varanasi-med', 'India', 'Varanasi'),
  city('india-patna-med', 'India', 'Patna'),
  // ── Hungary ──
  city('hungary-buda', 'Hungary', 'Buda'),
  city('hungary-esztergom', 'Hungary', 'Esztergom'),
  // ── Sweden ──
  city('sweden-uppsala', 'Sweden', 'Uppsala'),
  city('sweden-visby', 'Sweden', 'Visby'),
  // ── Portugal ──
  city('portugal-coimbra', 'Portugal', 'Coimbra'),
  city('portugal-evora', 'Portugal', 'Evora'),
  city('portugal-lisbon-med', 'Portugal', 'Lisbon'),
  city('portugal-porto-med', 'Portugal', 'Porto'),
  // ── Mali ──
  city('mali-timbuktu', 'Mali', 'Timbuktu'),
  city('mali-djenne', 'Mali', 'Djenné'),
  // ── Greece ──
  city('greece-athens-med', 'Greece', 'Athens'),
  city('greece-corinth-med', 'Greece', 'Corinth'),
  // ── Tunisia ──
  city('tunisia-tunis-med', 'Tunisia', 'Tunis', { name: 'Tunis' }),
  // ── Arabia ──
  city('arabia-medina-med', 'Arabia', 'Medina', { name: 'Medina' }),
];

// ════ Age of Sail · c. 1650 ════
// Countries: Netherlands · Spain · England · Japan · India · France · Italy · Ottoman Empire · China · Russia · Ireland · Scotland · America · Brazil · Mexico · Portugal · Sweden · Austria · Siam · Germany · Poland · Norway · Cuba
const AGE_OF_SAIL_PLACES: Place[] = [
  // ── Netherlands ──
  city('netherlands-amsterdam', 'Netherlands', 'Amsterdam', { moneySymbol: 'ƒ', lifespanMod: 1 }),
  city('netherlands-batavia', 'Netherlands', 'Batavia', { moneySymbol: 'ƒ' }),
  city('netherlands-rotterdam-sail', 'Netherlands', 'Rotterdam', { moneySymbol: 'ƒ' }),
  // ── Spain ──
  city('spain-sevilla', 'Spain', 'Sevilla', { moneySymbol: '$' }),
  city('spain-madrid-sail', 'Spain', 'Madrid', { moneySymbol: '$' }),
  city('spain-barcelona-sail', 'Spain', 'Barcelona', { moneySymbol: '$' }),
  // ── England ──
  city('england-london-17c', 'England', 'London', { moneySymbol: '£', lifespanMod: -1 }),
  city('england-bristol', 'England', 'Bristol', { moneySymbol: '£' }),
  city('england-liverpool-sail', 'England', 'Liverpool', { moneySymbol: '£' }),
  city('england-york-sail', 'England', 'York', { moneySymbol: '£' }),
  // ── Japan ──
  city('japan-osaka', 'Japan', 'Osaka', { moneySymbol: '文', lifespanMod: 2 }),
  city('japan-nagasaki', 'Japan', 'Nagasaki'),
  city('japan-edo', 'Japan', 'Edo'),
  city('japan-kyoto-sail', 'Japan', 'Kyoto'),
  city('japan-nara-sail', 'Japan', 'Nara'),
  // ── India ──
  city('india-surat', 'India', 'Surat', { moneySymbol: 'R' }),
  city('india-goa', 'India', 'Old Goa', { moneySymbol: 'R' }),
  city('india-delhi-sail', 'India', 'Delhi'),
  city('india-varanasi-sail', 'India', 'Varanasi'),
  city('india-patna-sail', 'India', 'Patna', { moneySymbol: 'R' }),
  // ── France ──
  city('france-paris-sail', 'France', 'Paris', { moneySymbol: 'L' }),
  city('france-marseille', 'France', 'Marseille', { moneySymbol: 'L' }),
  city('france-rouen-sail', 'France', 'Rouen', { moneySymbol: 'L' }),
  city('france-lyon-sail', 'France', 'Lyon', { moneySymbol: 'L' }),
  // ── Italy ──
  city('italy-venice-sail', 'Italy', 'Venice', { moneySymbol: 'D' }),
  city('italy-genoa', 'Italy', 'Genoa', { moneySymbol: 'D' }),
  city('italy-rome-sail', 'Italy', 'Rome'),
  city('italy-milan-sail', 'Italy', 'Milan', { moneySymbol: 'D' }),
  city('italy-florence-sail', 'Italy', 'Florence', { moneySymbol: 'D' }),
  city('italy-naples-sail', 'Italy', 'Naples', { moneySymbol: 'D' }),
  // ── Ottoman Empire ──
  city('ottoman-istanbul', 'Ottoman Empire', 'Istanbul', { moneySymbol: 'M' }),
  city('ottoman-cairo', 'Ottoman Empire', 'Cairo', { moneySymbol: 'M' }),
  city('ottoman-alexandria', 'Ottoman Empire', 'Alexandria'),
  city('ottoman-athens', 'Ottoman Empire', 'Athens'),
  city('ottoman-jerusalem', 'Ottoman Empire', 'Jerusalem'),
  city('ottoman-antioch', 'Ottoman Empire', 'Antioch'),
  city('ottoman-smyrna-sail', 'Ottoman Empire', 'Smyrna', { moneySymbol: 'M' }),
  city('ottoman-acre-sail', 'Ottoman Empire', 'Acre', { moneySymbol: 'M' }),
  city('ottoman-thessaloniki-sail', 'Ottoman Empire', 'Thessaloniki', { moneySymbol: 'M' }),
  city('ottoman-tunis-sail', 'Ottoman Empire', 'Tunis', { moneySymbol: 'M' }),
  city('ottoman-medina-sail', 'Ottoman Empire', 'Medina', { moneySymbol: 'M' }),
  // ── China ──
  city('china-canton', 'China', 'Canton', { moneySymbol: '文' }),
  city('china-amoy', 'China', 'Amoy'),
  city('china-xian-sail', 'China', "Xi'an"),
  city('china-hangzhou-sail', 'China', 'Hangzhou', { moneySymbol: '文' }),
  city('china-beijing-sail', 'China', 'Beijing', { moneySymbol: '文' }),
  // ── Russia ──
  city('russia-moscow-sail', 'Russia', 'Moscow', { moneySymbol: 'R' }),
  city('russia-petersburg-sail', 'Russia', 'St Petersburg'),
  city('russia-kiev-sail', 'Russia', 'Kiev'),
  // ── Ireland ──
  city('ireland-dublin-sail', 'Ireland', 'Dublin', { moneySymbol: '£' }),
  // ── Scotland ──
  city('scotland-edinburgh-sail', 'Scotland', 'Edinburgh', { moneySymbol: '£' }),
  city('scotland-glasgow', 'Scotland', 'Glasgow'),
  // ── America ──
  city('america-boston', 'America', 'Boston', { moneySymbol: '$' }),
  city('america-philadelphia', 'America', 'Philadelphia'),
  city('america-charleston', 'America', 'Charleston'),
  // ── Brazil ──
  city('brazil-bahia', 'Brazil', 'Bahia', { moneySymbol: '$' }),
  city('brazil-recife', 'Brazil', 'Recife'),
  city('brazil-rio-sail', 'Brazil', 'Rio de Janeiro'),
  // ── Mexico ──
  city('mexico-veracruz', 'Mexico', 'Veracruz', { moneySymbol: '$' }),
  city('mexico-mexicocity-sail', 'Mexico', 'Mexico City'),
  city('mexico-acapulco', 'Mexico', 'Acapulco'),
  // ── Portugal ──
  city('portugal-lisbon', 'Portugal', 'Lisbon'),
  city('portugal-oporto', 'Portugal', 'Oporto'),
  // ── Sweden ──
  city('sweden-stockholm-sail', 'Sweden', 'Stockholm'),
  city('sweden-gothenburg', 'Sweden', 'Gothenburg'),
  // ── Austria ──
  city('austria-vienna-sail', 'Austria', 'Vienna'),
  city('austria-salzburg', 'Austria', 'Salzburg'),
  // ── Siam ──
  city('siam-ayutthaya', 'Siam', 'Ayutthaya'),
  city('siam-lopburi', 'Siam', 'Lopburi'),
  // ── Germany ──
  city('germany-hamburg-sail', 'Germany', 'Hamburg'),
  city('germany-lubeck-sail', 'Germany', 'Lübeck'),
  city('germany-mainz-sail', 'Germany', 'Mainz'),
  // ── Poland ──
  city('poland-warsaw-sail', 'Poland', 'Warsaw'),
  city('poland-krakow-sail', 'Poland', 'Kraków'),
  // ── Norway ──
  city('norway-bergen-sail', 'Norway', 'Bergen'),
  city('norway-trondheim-sail', 'Norway', 'Trondheim'),
  // ── Cuba ──
  city('cuba-havana-sail', 'Cuba', 'Havana', { moneySymbol: '$' }),
  city('cuba-santiago-sail', 'Cuba', 'Santiago', { moneySymbol: '$' }),
];

// ════ Industrial Age · c. 1880 ════
// Countries: United Kingdom · United States · Germany · France · India · Italy · Spain · Russia · Austria · Belgium · Netherlands · Japan · China · Brazil · Australia · Sweden · Ireland · Egypt · Ottoman Empire · Mexico · Argentina · Greece · Scotland · Canada · Nigeria · South Africa · South Korea · Portugal · Poland · Hungary · Norway
const INDUSTRIAL_PLACES: Place[] = [
  // ── United Kingdom ──
  city('uk-manchester', 'United Kingdom', 'Manchester', { moneySymbol: '£', lifespanMod: -3 }),
  city('uk-london-ind', 'United Kingdom', 'London', { moneySymbol: '£' }),
  city('uk-birmingham', 'United Kingdom', 'Birmingham', { moneySymbol: '£' }),
  city('uk-bristol-ind', 'United Kingdom', 'Bristol', { moneySymbol: '£' }),
  city('uk-liverpool-ind', 'United Kingdom', 'Liverpool', { moneySymbol: '£' }),
  city('uk-york-ind', 'United Kingdom', 'York', { moneySymbol: '£' }),
  // ── United States ──
  city('usa-pittsburgh', 'United States', 'Pittsburgh', { moneySymbol: '$', lifespanMod: -2 }),
  city('usa-newyork-ind', 'United States', 'New York', { moneySymbol: '$' }),
  city('usa-chicago', 'United States', 'Chicago', { moneySymbol: '$' }),
  city('usa-detroit-ind', 'United States', 'Detroit', { moneySymbol: '$' }),
  city('usa-losangeles-ind', 'United States', 'Los Angeles', { moneySymbol: '$' }),
  city('usa-boston-ind', 'United States', 'Boston', { moneySymbol: '$' }),
  city('usa-philadelphia-ind', 'United States', 'Philadelphia', { moneySymbol: '$' }),
  // ── Germany ──
  city('germany-ruhr', 'Germany', 'Essen', { moneySymbol: 'M', lifespanMod: -2 }),
  city('germany-berlin-ind', 'Germany', 'Berlin', { moneySymbol: 'M' }),
  city('germany-hamburg-ind', 'Germany', 'Hamburg', { moneySymbol: 'M' }),
  city('germany-lubeck-ind', 'Germany', 'Lübeck', { moneySymbol: 'M' }),
  city('germany-mainz-ind', 'Germany', 'Mainz', { moneySymbol: 'M' }),
  // ── France ──
  city('france-paris-19c', 'France', 'Paris', { moneySymbol: 'F', lifespanMod: 1 }),
  city('france-lyon', 'France', 'Lyon', { moneySymbol: 'F' }),
  city('france-rouen-ind', 'France', 'Rouen', { moneySymbol: 'F' }),
  // ── India ──
  city('india-bombay', 'India', 'Bombay', { moneySymbol: 'R', lifespanMod: -3 }),
  city('india-calcutta', 'India', 'Calcutta'),
  city('india-madras', 'India', 'Madras'),
  city('india-delhi-ind', 'India', 'Delhi'),
  city('india-varanasi-ind', 'India', 'Varanasi'),
  city('india-patna-ind', 'India', 'Patna', { moneySymbol: 'R' }),
  city('india-bengaluru-ind', 'India', 'Bengaluru', { moneySymbol: 'R' }),
  // ── Italy ──
  city('italy-milan', 'Italy', 'Milan', { moneySymbol: 'L' }),
  city('italy-turin', 'Italy', 'Turin', { moneySymbol: 'L' }),
  city('italy-rome-ind', 'Italy', 'Rome'),
  city('italy-venice-ind', 'Italy', 'Venice', { moneySymbol: 'L' }),
  city('italy-florence-ind', 'Italy', 'Florence', { moneySymbol: 'L' }),
  city('italy-genoa-ind', 'Italy', 'Genoa', { moneySymbol: 'L' }),
  city('italy-naples-ind', 'Italy', 'Naples', { moneySymbol: 'L' }),
  // ── Spain ──
  city('spain-barcelona', 'Spain', 'Barcelona', { moneySymbol: 'P' }),
  city('spain-madrid-ind', 'Spain', 'Madrid', { moneySymbol: 'P' }),
  city('spain-sevilla-ind', 'Spain', 'Sevilla', { moneySymbol: 'P' }),
  city('spain-cordoba-ind', 'Spain', 'Córdoba', { moneySymbol: 'P' }),
  city('spain-merida-ind', 'Spain', 'Mérida', { moneySymbol: 'P' }),
  city('spain-tarragona-ind', 'Spain', 'Tarragona', { moneySymbol: 'P' }),
  // ── Russia ──
  city('russia-petersburg', 'Russia', 'St Petersburg', { moneySymbol: 'R' }),
  city('russia-moscow-ind', 'Russia', 'Moscow'),
  city('russia-kiev-ind', 'Russia', 'Kiev', { moneySymbol: 'R' }),
  // ── Austria ──
  city('austria-vienna', 'Austria', 'Vienna', { moneySymbol: 'ƒ' }),
  city('austria-salzburg-ind', 'Austria', 'Salzburg', { moneySymbol: 'ƒ' }),
  // ── Belgium ──
  city('belgium-liege', 'Belgium', 'Liège', { moneySymbol: 'F' }),
  city('belgium-antwerp', 'Belgium', 'Antwerp'),
  // ── Netherlands ──
  city('netherlands-rotterdam', 'Netherlands', 'Rotterdam', { moneySymbol: 'ƒ' }),
  city('netherlands-amsterdam-ind', 'Netherlands', 'Amsterdam'),
  city('netherlands-jakarta-ind', 'Netherlands', 'Jakarta', { moneySymbol: 'ƒ' }),
  city('netherlands-surabaya-ind', 'Netherlands', 'Surabaya', { moneySymbol: 'ƒ' }),
  // ── Japan ──
  city('japan-yokohama', 'Japan', 'Yokohama', { moneySymbol: '¥' }),
  city('japan-osaka-ind', 'Japan', 'Osaka'),
  city('japan-kyoto-ind', 'Japan', 'Kyoto'),
  city('japan-nara-ind', 'Japan', 'Nara'),
  city('japan-tokyo-ind', 'Japan', 'Tokyo', { moneySymbol: '¥' }),
  city('japan-nagasaki-ind', 'Japan', 'Nagasaki', { moneySymbol: '¥' }),
  // ── China ──
  city('china-shanghai', 'China', 'Shanghai', { moneySymbol: '文' }),
  city('china-canton-ind', 'China', 'Canton'),
  city('china-xian-ind', 'China', "Xi'an"),
  city('china-hangzhou-ind', 'China', 'Hangzhou', { moneySymbol: '文' }),
  city('china-beijing-ind', 'China', 'Beijing', { moneySymbol: '文' }),
  city('china-amoy-ind', 'China', 'Amoy', { moneySymbol: '文' }),
  // ── Brazil ──
  city('brazil-rio', 'Brazil', 'Rio de Janeiro', { moneySymbol: 'R$' }),
  city('brazil-saopaulo-ind', 'Brazil', 'São Paulo'),
  city('brazil-salvador-ind', 'Brazil', 'Salvador', { moneySymbol: 'R$' }),
  city('brazil-recife-ind', 'Brazil', 'Recife', { moneySymbol: 'R$' }),
  // ── Australia ──
  city('australia-melbourne-ind', 'Australia', 'Melbourne', { moneySymbol: '£' }),
  city('australia-sydney-ind', 'Australia', 'Sydney'),
  city('australia-adelaide', 'Australia', 'Adelaide'),
  // ── Sweden ──
  city('sweden-stockholm', 'Sweden', 'Stockholm', { moneySymbol: 'kr' }),
  city('sweden-gothenburg-ind', 'Sweden', 'Gothenburg', { moneySymbol: 'kr' }),
  city('sweden-malmo-ind', 'Sweden', 'Malmö', { moneySymbol: 'kr' }),
  // ── Ireland ──
  city('ireland-dublin-ind', 'Ireland', 'Dublin', { moneySymbol: '£' }),
  city('ireland-cork-ind', 'Ireland', 'Cork', { moneySymbol: '£' }),
  // ── Egypt ──
  city('egypt-cairo-ind', 'Egypt', 'Cairo', { moneySymbol: 'E£' }),
  city('egypt-alexandria-ind', 'Egypt', 'Alexandria', { moneySymbol: 'E£' }),
  // ── Ottoman Empire ──
  city('ottoman-istanbul-ind', 'Ottoman Empire', 'Istanbul'),
  city('ottoman-izmir', 'Ottoman Empire', 'Smyrna'),
  city('ottoman-acre-ind', 'Ottoman Empire', 'Acre'),
  city('ottoman-antioch-ind', 'Ottoman Empire', 'Antioch'),
  city('ottoman-tunis-ind', 'Ottoman Empire', 'Tunis'),
  city('ottoman-medina-ind', 'Ottoman Empire', 'Medina'),
  city('ottoman-jerusalem-ind', 'Ottoman Empire', 'Jerusalem'),
  // ── Mexico ──
  city('mexico-mexicocity-ind', 'Mexico', 'Mexico City', { moneySymbol: '$' }),
  city('mexico-guadalajara', 'Mexico', 'Guadalajara', { moneySymbol: '$' }),
  city('mexico-veracruz-ind', 'Mexico', 'Veracruz', { moneySymbol: '$' }),
  // ── Argentina ──
  city('argentina-buenosaires-ind', 'Argentina', 'Buenos Aires', { moneySymbol: '$' }),
  city('argentina-cordoba', 'Argentina', 'Cordoba', { moneySymbol: '$' }),
  city('argentina-rosario-ind', 'Argentina', 'Rosario', { moneySymbol: '$' }),
  // ── Greece ──
  city('greece-athens-ind', 'Greece', 'Athens'),
  city('greece-thessaloniki', 'Greece', 'Thessaloniki'),
  // ── Scotland ──
  city('scotland-edinburgh-ind', 'Scotland', 'Edinburgh', { moneySymbol: '£' }),
  city('scotland-glasgow-ind', 'Scotland', 'Glasgow', { moneySymbol: '£' }),
  // ── Canada ──
  city('canada-toronto-ind', 'Canada', 'Toronto', { moneySymbol: '$' }),
  city('canada-montreal-ind', 'Canada', 'Montreal', { moneySymbol: '$' }),
  // ── Nigeria ──
  city('nigeria-lagos-ind', 'Nigeria', 'Lagos'),
  city('nigeria-ibadan-ind', 'Nigeria', 'Ibadan'),
  // ── South Africa ──
  city('southafrica-johannesburg-ind', 'South Africa', 'Johannesburg'),
  city('southafrica-capetown-ind', 'South Africa', 'Cape Town', { moneySymbol: '£' }),
  // ── South Korea ──
  city('korea-seoul-ind', 'South Korea', 'Seoul'),
  city('korea-busan-ind', 'South Korea', 'Busan'),
  // ── Portugal ──
  city('portugal-lisbon-ind', 'Portugal', 'Lisbon'),
  city('portugal-porto-ind', 'Portugal', 'Porto'),
  // ── Poland ──
  city('poland-warsaw-ind', 'Poland', 'Warsaw'),
  city('poland-krakow-ind', 'Poland', 'Kraków'),
  // ── Hungary ──
  city('hungary-budapest-ind', 'Hungary', 'Budapest'),
  // ── Norway ──
  city('norway-bergen-ind', 'Norway', 'Bergen', { moneySymbol: 'kr' }),
  city('norway-trondheim-ind', 'Norway', 'Trondheim', { moneySymbol: 'kr' }),
];

// ════ Atomic Age · c. 1965 ════
// Countries: United Kingdom · United States · Soviet Union · Japan · India · France · Germany · Italy · China · Brazil · Nigeria · Australia · Cuba · Spain · Poland · Egypt · Canada · Mexico · South Korea · Sweden · Turkey · Argentina · Scotland · Netherlands · Austria · Norway · Indonesia · South Africa · Israel · Tunisia · Greece · Portugal · Hungary · Ireland
const ATOMIC_PLACES: Place[] = [
  // ── United Kingdom ──
  city('uk-london-60s', 'United Kingdom', 'London', { moneySymbol: '£', lifespanMod: 1 }),
  city('uk-liverpool', 'United Kingdom', 'Liverpool', { moneySymbol: '£' }),
  city('uk-manchester-atomic', 'United Kingdom', 'Manchester', { moneySymbol: '£' }),
  city('uk-birmingham-atomic', 'United Kingdom', 'Birmingham', { moneySymbol: '£' }),
  city('uk-bristol-atomic', 'United Kingdom', 'Bristol', { moneySymbol: '£' }),
  // ── United States ──
  city('usa-detroit', 'United States', 'Detroit', { moneySymbol: '$', lifespanMod: -1 }),
  city('usa-newyork-atomic', 'United States', 'New York', { moneySymbol: '$' }),
  city('usa-losangeles', 'United States', 'Los Angeles', { moneySymbol: '$' }),
  city('usa-chicago-atomic', 'United States', 'Chicago', { moneySymbol: '$' }),
  city('usa-pittsburgh-atomic', 'United States', 'Pittsburgh', { moneySymbol: '$' }),
  city('usa-boston-atomic', 'United States', 'Boston', { moneySymbol: '$' }),
  city('usa-philadelphia-atomic', 'United States', 'Philadelphia', { moneySymbol: '$' }),
  // ── Soviet Union ──
  city('ussr-moscow', 'Soviet Union', 'Moscow', { moneySymbol: 'R', lifespanMod: -1 }),
  city('ussr-leningrad', 'Soviet Union', 'Leningrad', { moneySymbol: 'R' }),
  city('ussr-kiev', 'Soviet Union', 'Kiev', { moneySymbol: 'R' }),
  // ── Japan ──
  city('japan-tokyo-60s', 'Japan', 'Tokyo', { moneySymbol: '¥', lifespanMod: 2 }),
  city('japan-osaka-atomic', 'Japan', 'Osaka', { moneySymbol: '¥' }),
  city('japan-kyoto-atomic', 'Japan', 'Kyoto'),
  city('japan-nara-atomic', 'Japan', 'Nara', { moneySymbol: '¥' }),
  city('japan-nagasaki-atomic', 'Japan', 'Nagasaki', { moneySymbol: '¥' }),
  city('japan-yokohama-atomic', 'Japan', 'Yokohama', { moneySymbol: '¥' }),
  // ── India ──
  city('india-delhi-60s', 'India', 'Delhi', { moneySymbol: 'R', lifespanMod: -2 }),
  city('india-bombay-atomic', 'India', 'Bombay'),
  city('india-varanasi-atomic', 'India', 'Varanasi', { moneySymbol: 'R' }),
  city('india-calcutta-atomic', 'India', 'Calcutta', { moneySymbol: 'R' }),
  city('india-madras-atomic', 'India', 'Madras', { moneySymbol: 'R' }),
  city('india-bengaluru-atomic', 'India', 'Bengaluru', { moneySymbol: 'R' }),
  city('india-patna-atomic', 'India', 'Patna', { moneySymbol: 'R' }),
  // ── France ──
  city('france-paris-atomic', 'France', 'Paris', { moneySymbol: 'F' }),
  city('france-marseille-atomic', 'France', 'Marseille', { moneySymbol: '€' }),
  city('france-lyon-atomic', 'France', 'Lyon', { moneySymbol: 'F' }),
  // ── Germany ──
  city('germany-berlin-atomic', 'Germany', 'West Berlin', { moneySymbol: 'DM' }),
  city('germany-hamburg', 'Germany', 'Hamburg'),
  city('germany-essen-atomic', 'Germany', 'Essen', { moneySymbol: 'DM' }),
  // ── Italy ──
  city('italy-rome-atomic', 'Italy', 'Rome', { moneySymbol: 'L' }),
  city('italy-milan-atomic', 'Italy', 'Milan', { moneySymbol: '€' }),
  city('italy-venice-atomic', 'Italy', 'Venice', { moneySymbol: 'L' }),
  city('italy-florence-atomic', 'Italy', 'Florence', { moneySymbol: 'L' }),
  city('italy-genoa-atomic', 'Italy', 'Genoa', { moneySymbol: 'L' }),
  city('italy-turin-atomic', 'Italy', 'Turin', { moneySymbol: 'L' }),
  city('italy-naples-atomic', 'Italy', 'Naples', { moneySymbol: 'L' }),
  // ── China ──
  city('china-beijing', 'China', 'Beijing', { moneySymbol: '¥' }),
  city('china-shanghai-atomic', 'China', 'Shanghai', { moneySymbol: '¥' }),
  city('china-xian-atomic', 'China', "Xi'an"),
  city('china-canton-atomic', 'China', 'Canton', { moneySymbol: '¥' }),
  city('china-hangzhou-atomic', 'China', 'Hangzhou', { moneySymbol: '¥' }),
  // ── Brazil ──
  city('brazil-saopaulo-atomic', 'Brazil', 'São Paulo', { moneySymbol: 'Cr$' }),
  city('brazil-rio-atomic', 'Brazil', 'Rio de Janeiro', { moneySymbol: 'R$' }),
  city('brazil-salvador-atomic', 'Brazil', 'Salvador', { moneySymbol: 'R$' }),
  city('brazil-recife-atomic', 'Brazil', 'Recife', { moneySymbol: 'R$' }),
  // ── Nigeria ──
  city('nigeria-lagos-atomic', 'Nigeria', 'Lagos', { moneySymbol: '₦' }),
  city('nigeria-ibadan', 'Nigeria', 'Ibadan'),
  // ── Australia ──
  city('australia-sydney', 'Australia', 'Sydney', { moneySymbol: '$' }),
  city('australia-melbourne-atomic', 'Australia', 'Melbourne', { moneySymbol: 'A$' }),
  city('australia-adelaide-atomic', 'Australia', 'Adelaide', { moneySymbol: 'A$' }),
  // ── Cuba ──
  city('cuba-havana', 'Cuba', 'Havana', { moneySymbol: '$' }),
  city('cuba-santiago', 'Cuba', 'Santiago', { moneySymbol: '$' }),
  // ── Spain ──
  city('spain-madrid', 'Spain', 'Madrid', { moneySymbol: 'P' }),
  city('spain-barcelona-atomic', 'Spain', 'Barcelona', { moneySymbol: 'P' }),
  city('spain-cordoba-atomic', 'Spain', 'Córdoba', { moneySymbol: 'P' }),
  // ── Poland ──
  city('poland-warsaw', 'Poland', 'Warsaw', { moneySymbol: 'zł' }),
  city('poland-krakow-atomic', 'Poland', 'Krakow'),
  // ── Egypt ──
  city('egypt-cairo-atomic', 'Egypt', 'Cairo', { moneySymbol: 'E£' }),
  city('egypt-alexandria-atomic', 'Egypt', 'Alexandria', { moneySymbol: 'E£' }),
  // ── Canada ──
  city('canada-toronto-atomic', 'Canada', 'Toronto', { moneySymbol: '$' }),
  city('canada-montreal', 'Canada', 'Montreal', { moneySymbol: '$' }),
  // ── Mexico ──
  city('mexico-mexicocity-atomic', 'Mexico', 'Mexico City', { moneySymbol: '$' }),
  city('mexico-guadalajara-atomic', 'Mexico', 'Guadalajara', { moneySymbol: '$' }),
  city('mexico-veracruz-atomic', 'Mexico', 'Veracruz', { moneySymbol: '$' }),
  // ── South Korea ──
  city('korea-seoul-atomic', 'South Korea', 'Seoul', { moneySymbol: '₩' }),
  city('korea-busan', 'South Korea', 'Busan', { moneySymbol: '₩' }),
  // ── Sweden ──
  city('sweden-stockholm-atomic', 'Sweden', 'Stockholm', { moneySymbol: 'kr' }),
  city('sweden-malmo', 'Sweden', 'Malmö', { moneySymbol: 'kr' }),
  city('sweden-gothenburg-atomic', 'Sweden', 'Gothenburg', { moneySymbol: 'kr' }),
  // ── Turkey ──
  city('turkey-antakya-atomic', 'Turkey', 'Antakya', { moneySymbol: '₺' }),
  city('turkey-izmir-atomic', 'Turkey', 'Izmir', { moneySymbol: '₺' }),
  // ── Argentina ──
  city('argentina-buenosaires-atomic', 'Argentina', 'Buenos Aires', { moneySymbol: '$' }),
  city('argentina-cordoba-atomic', 'Argentina', 'Cordoba', { moneySymbol: '$' }),
  city('argentina-rosario-atomic', 'Argentina', 'Rosario', { moneySymbol: '$' }),
  // ── Scotland ──
  city('scotland-edinburgh-atomic', 'Scotland', 'Edinburgh', { moneySymbol: '£' }),
  city('scotland-glasgow-atomic', 'Scotland', 'Glasgow', { moneySymbol: '£' }),
  // ── Netherlands ──
  city('netherlands-amsterdam-atomic', 'Netherlands', 'Amsterdam', { moneySymbol: 'ƒ' }),
  city('netherlands-rotterdam-atomic', 'Netherlands', 'Rotterdam', { moneySymbol: 'ƒ' }),
  // ── Austria ──
  city('austria-vienna-atomic', 'Austria', 'Vienna'),
  city('austria-salzburg-atomic', 'Austria', 'Salzburg'),
  // ── Norway ──
  city('norway-bergen-atomic', 'Norway', 'Bergen', { moneySymbol: 'kr' }),
  city('norway-trondheim-atomic', 'Norway', 'Trondheim', { moneySymbol: 'kr' }),
  // ── Indonesia ──
  city('indonesia-jakarta-atomic', 'Indonesia', 'Jakarta', { moneySymbol: 'Rp' }),
  city('indonesia-surabaya-atomic', 'Indonesia', 'Surabaya', { moneySymbol: 'Rp' }),
  // ── South Africa ──
  city('southafrica-johannesburg-atomic', 'South Africa', 'Johannesburg', { moneySymbol: 'R' }),
  city('southafrica-capetown-atomic', 'South Africa', 'Cape Town', { moneySymbol: 'R' }),
  // ── Israel ──
  city('israel-jerusalem-atomic', 'Israel', 'Jerusalem'),
  // ── Tunisia ──
  city('tunisia-tunis-atomic', 'Tunisia', 'Tunis', { moneySymbol: 'DT' }),
  // ── Greece ──
  city('greece-athens-atomic', 'Greece', 'Athens', { moneySymbol: 'Δρ' }),
  city('greece-thessaloniki-atomic', 'Greece', 'Thessaloniki', { moneySymbol: 'Δρ' }),
  // ── Portugal ──
  city('portugal-lisbon-atomic', 'Portugal', 'Lisbon'),
  city('portugal-porto-atomic', 'Portugal', 'Porto'),
  // ── Hungary ──
  city('hungary-budapest-atomic', 'Hungary', 'Budapest'),
  // ── Ireland ──
  city('ireland-dublin-atomic', 'Ireland', 'Dublin', { moneySymbol: '£' }),
  city('ireland-cork-atomic', 'Ireland', 'Cork', { moneySymbol: '£' }),
];

// ════ Modern Day · c. 2025 ════
// Countries: United States · United Kingdom · India · Japan · Nigeria · Australia · Brazil · France · Germany · Italy · Spain · Canada · China · South Korea · Mexico · Argentina · South Africa · Russia · Netherlands · Egypt · Turkey · Ireland · Indonesia · Greece · Israel · Iran · Saudi Arabia · Ethiopia · Tunisia · Syria · Portugal · Hungary · Poland · Austria · Sweden · Scotland · Norway · Cuba · Ukraine
const MODERN_DAY_PLACES: Place[] = [
  // ── United States ──
  city('usa-brooklyn', 'United States', 'Brooklyn', { moneySymbol: '$' }),
  city('usa-chicago-modern', 'United States', 'Chicago', { moneySymbol: '$' }),
  city('usa-losangeles-modern', 'United States', 'Los Angeles', { moneySymbol: '$' }),
  city('usa-newyork-modern', 'United States', 'New York', { moneySymbol: '$' }),
  city('usa-detroit-modern', 'United States', 'Detroit', { moneySymbol: '$' }),
  city('usa-pittsburgh-modern', 'United States', 'Pittsburgh', { moneySymbol: '$' }),
  city('usa-boston-modern', 'United States', 'Boston', { moneySymbol: '$' }),
  city('usa-philadelphia-modern', 'United States', 'Philadelphia', { moneySymbol: '$' }),
  // ── United Kingdom ──
  city('uk-london', 'United Kingdom', 'London', { moneySymbol: '£', lifespanMod: 1 }),
  city('uk-manchester-modern', 'United Kingdom', 'Manchester', { moneySymbol: '£' }),
  city('uk-york-modern', 'United Kingdom', 'York', { moneySymbol: '£' }),
  city('uk-birmingham-modern', 'United Kingdom', 'Birmingham', { moneySymbol: '£' }),
  city('uk-bristol-modern', 'United Kingdom', 'Bristol', { moneySymbol: '£' }),
  city('uk-liverpool-modern', 'United Kingdom', 'Liverpool', { moneySymbol: '£' }),
  // ── India ──
  city('india-bengaluru', 'India', 'Bengaluru', { moneySymbol: '₹', lifespanMod: -1 }),
  city('india-mumbai-modern', 'India', 'Mumbai'),
  city('india-delhi-modern', 'India', 'Delhi'),
  city('india-varanasi-modern', 'India', 'Varanasi'),
  city('india-patna-modern', 'India', 'Patna'),
  city('india-kolkata-modern', 'India', 'Kolkata', { moneySymbol: '₹' }),
  city('india-chennai-modern', 'India', 'Chennai', { moneySymbol: '₹' }),
  // ── Japan ──
  city('japan-tokyo', 'Japan', 'Tokyo', { moneySymbol: '¥', lifespanMod: 2 }),
  city('japan-osaka-modern', 'Japan', 'Osaka', { moneySymbol: '¥' }),
  city('japan-kyoto-modern', 'Japan', 'Kyoto', { moneySymbol: '¥' }),
  city('japan-nara-modern', 'Japan', 'Nara', { moneySymbol: '¥' }),
  city('japan-nagasaki-modern', 'Japan', 'Nagasaki', { moneySymbol: '¥' }),
  city('japan-yokohama-modern', 'Japan', 'Yokohama', { moneySymbol: '¥' }),
  // ── Nigeria ──
  city('nigeria-lagos', 'Nigeria', 'Lagos', { moneySymbol: '₦' }),
  city('nigeria-abuja', 'Nigeria', 'Abuja'),
  city('nigeria-ibadan-modern', 'Nigeria', 'Ibadan', { moneySymbol: '₦' }),
  // ── Australia ──
  city('australia-melbourne', 'Australia', 'Melbourne', { moneySymbol: '$', lifespanMod: 1 }),
  city('australia-sydney-modern', 'Australia', 'Sydney', { moneySymbol: 'A$' }),
  city('australia-adelaide-modern', 'Australia', 'Adelaide', { moneySymbol: 'A$' }),
  // ── Brazil ──
  city('brazil-saopaulo', 'Brazil', 'São Paulo', { moneySymbol: 'R$' }),
  city('brazil-rio-modern', 'Brazil', 'Rio de Janeiro', { moneySymbol: 'R$' }),
  city('brazil-salvador-modern', 'Brazil', 'Salvador', { moneySymbol: 'R$' }),
  city('brazil-recife-modern', 'Brazil', 'Recife', { moneySymbol: 'R$' }),
  // ── France ──
  city('france-paris-modern', 'France', 'Paris', { moneySymbol: '€' }),
  city('france-lyon-modern', 'France', 'Lyon', { moneySymbol: '€' }),
  city('france-rouen-modern', 'France', 'Rouen', { moneySymbol: '€' }),
  // ── Germany ──
  city('germany-berlin-modern', 'Germany', 'Berlin', { moneySymbol: '€' }),
  city('germany-hamburg-modern', 'Germany', 'Hamburg', { moneySymbol: '€' }),
  city('germany-mainz-modern', 'Germany', 'Mainz', { moneySymbol: '€' }),
  city('germany-essen-modern', 'Germany', 'Essen', { moneySymbol: '€' }),
  // ── Italy ──
  city('italy-rome-modern', 'Italy', 'Rome', { moneySymbol: '€' }),
  city('italy-milan-modern', 'Italy', 'Milan', { moneySymbol: '€' }),
  city('italy-venice-modern', 'Italy', 'Venice', { moneySymbol: '€' }),
  city('italy-florence-modern', 'Italy', 'Florence', { moneySymbol: '€' }),
  city('italy-genoa-modern', 'Italy', 'Genoa', { moneySymbol: '€' }),
  city('italy-turin-modern', 'Italy', 'Turin', { moneySymbol: '€' }),
  city('italy-naples-modern', 'Italy', 'Naples', { moneySymbol: '€' }),
  // ── Spain ──
  city('spain-madrid-modern', 'Spain', 'Madrid', { moneySymbol: '€' }),
  city('spain-tarragona-modern', 'Spain', 'Tarragona', { moneySymbol: '€' }),
  city('spain-merida-modern', 'Spain', 'Mérida', { moneySymbol: '€' }),
  city('spain-cordoba-modern', 'Spain', 'Córdoba', { moneySymbol: '€' }),
  city('spain-barcelona-modern', 'Spain', 'Barcelona', { moneySymbol: '€' }),
  city('spain-sevilla-modern', 'Spain', 'Sevilla', { moneySymbol: '€' }),
  // ── Canada ──
  city('canada-toronto', 'Canada', 'Toronto', { moneySymbol: '$' }),
  city('canada-montreal-modern', 'Canada', 'Montreal', { moneySymbol: '$' }),
  // ── China ──
  city('china-shanghai-modern', 'China', 'Shanghai', { moneySymbol: '¥' }),
  city('china-beijing-modern', 'China', 'Beijing', { moneySymbol: '¥' }),
  city('china-xian-modern', 'China', "Xi'an", { moneySymbol: '¥' }),
  city('china-chengdu-modern', 'China', 'Chengdu', { moneySymbol: '¥' }),
  city('china-luoyang-modern', 'China', 'Luoyang', { moneySymbol: '¥' }),
  city('china-guangzhou-modern', 'China', 'Guangzhou', { moneySymbol: '¥' }),
  city('china-hangzhou-modern', 'China', 'Hangzhou', { moneySymbol: '¥' }),
  city('china-xiamen-modern', 'China', 'Xiamen', { moneySymbol: '¥' }),
  // ── South Korea ──
  city('korea-seoul', 'South Korea', 'Seoul', { moneySymbol: '₩' }),
  city('korea-busan-modern', 'South Korea', 'Busan', { moneySymbol: '₩' }),
  // ── Mexico ──
  city('mexico-mexicocity', 'Mexico', 'Mexico City', { moneySymbol: '$' }),
  city('mexico-guadalajara-modern', 'Mexico', 'Guadalajara', { moneySymbol: '$' }),
  city('mexico-veracruz-modern', 'Mexico', 'Veracruz', { moneySymbol: '$' }),
  // ── Argentina ──
  city('argentina-buenosaires', 'Argentina', 'Buenos Aires', { moneySymbol: '$' }),
  city('argentina-rosario', 'Argentina', 'Rosario', { moneySymbol: '$' }),
  city('argentina-cordoba-modern', 'Argentina', 'Cordoba', { moneySymbol: '$' }),
  // ── South Africa ──
  city('southafrica-joburg', 'South Africa', 'Johannesburg', { moneySymbol: 'R' }),
  city('southafrica-capetown', 'South Africa', 'Cape Town', { moneySymbol: 'R' }),
  // ── Russia ──
  city('russia-moscow-modern', 'Russia', 'Moscow', { moneySymbol: '₽' }),
  city('russia-petersburg-modern', 'Russia', 'St Petersburg', { moneySymbol: '₽' }),
  // ── Netherlands ──
  city('netherlands-amsterdam-modern', 'Netherlands', 'Amsterdam', { moneySymbol: '€' }),
  city('netherlands-rotterdam-modern', 'Netherlands', 'Rotterdam', { moneySymbol: '€' }),
  // ── Egypt ──
  city('egypt-cairo', 'Egypt', 'Cairo', { moneySymbol: 'E£' }),
  city('egypt-alexandria', 'Egypt', 'Alexandria', { moneySymbol: 'E£' }),
  // ── Turkey ──
  city('turkey-istanbul', 'Turkey', 'Istanbul', { moneySymbol: '₺' }),
  city('turkey-ankara', 'Turkey', 'Ankara', { moneySymbol: '₺' }),
  city('turkey-antakya-modern', 'Turkey', 'Antakya', { moneySymbol: '₺' }),
  city('turkey-izmir-modern', 'Turkey', 'Izmir', { moneySymbol: '₺' }),
  // ── Ireland ──
  city('ireland-dublin-modern', 'Ireland', 'Dublin', { moneySymbol: '€' }),
  city('ireland-cork', 'Ireland', 'Cork', { moneySymbol: '€' }),
  // ── Indonesia ──
  city('indonesia-jakarta', 'Indonesia', 'Jakarta', { moneySymbol: 'Rp' }),
  city('indonesia-surabaya', 'Indonesia', 'Surabaya', { moneySymbol: 'Rp' }),
  // ── Greece ──
  city('greece-athens-modern', 'Greece', 'Athens', { moneySymbol: '€' }),
  city('greece-corinth-modern', 'Greece', 'Corinth', { moneySymbol: '€' }),
  city('greece-thessaloniki-modern', 'Greece', 'Thessaloniki', { moneySymbol: '€' }),
  // ── Israel ──
  city('israel-jerusalem-modern', 'Israel', 'Jerusalem', { moneySymbol: '₪' }),
  // ── Iran ──
  city('iran-hamadan-modern', 'Iran', 'Hamadan'),
  // ── Saudi Arabia ──
  city('saudi-medina-modern', 'Saudi Arabia', 'Medina'),
  // ── Ethiopia ──
  city('ethiopia-axum-modern', 'Ethiopia', 'Axum', { moneySymbol: 'Br' }),
  city('ethiopia-gondar-modern', 'Ethiopia', 'Gondar', { moneySymbol: 'Br' }),
  // ── Tunisia ──
  city('tunisia-tunis-modern', 'Tunisia', 'Tunis', { moneySymbol: 'DT' }),
  // ── Syria ──
  city('syria-palmyra-modern', 'Syria', 'Palmyra', { moneySymbol: '£S' }),
  // ── Portugal ──
  city('portugal-lisbon-modern', 'Portugal', 'Lisbon', { moneySymbol: '€' }),
  city('portugal-porto-modern', 'Portugal', 'Porto', { moneySymbol: '€' }),
  // ── Hungary ──
  city('hungary-budapest-modern', 'Hungary', 'Budapest', { moneySymbol: 'Ft' }),
  // ── Poland ──
  city('poland-warsaw-modern', 'Poland', 'Warsaw', { moneySymbol: 'zł' }),
  city('poland-krakow-modern', 'Poland', 'Kraków', { moneySymbol: 'zł' }),
  // ── Austria ──
  city('austria-vienna-modern', 'Austria', 'Vienna', { moneySymbol: '€' }),
  city('austria-salzburg-modern', 'Austria', 'Salzburg', { moneySymbol: '€' }),
  // ── Sweden ──
  city('sweden-stockholm-modern', 'Sweden', 'Stockholm', { moneySymbol: 'kr' }),
  city('sweden-gothenburg-modern', 'Sweden', 'Gothenburg', { moneySymbol: 'kr' }),
  city('sweden-malmo-modern', 'Sweden', 'Malmö', { moneySymbol: 'kr' }),
  // ── Scotland ──
  city('scotland-edinburgh-modern', 'Scotland', 'Edinburgh', { moneySymbol: '£' }),
  city('scotland-glasgow-modern', 'Scotland', 'Glasgow', { moneySymbol: '£' }),
  // ── Norway ──
  city('norway-bergen-modern', 'Norway', 'Bergen', { moneySymbol: 'kr' }),
  city('norway-trondheim-modern', 'Norway', 'Trondheim', { moneySymbol: 'kr' }),
  // ── Cuba ──
  city('cuba-havana-modern', 'Cuba', 'Havana', { moneySymbol: '$' }),
  city('cuba-santiago-modern', 'Cuba', 'Santiago', { moneySymbol: '$' }),
  // ── Ukraine ──
  city('ukraine-kyiv-modern', 'Ukraine', 'Kyiv', { moneySymbol: '₴' }),
];

export const ERAS: Era[] = [
  {
    id: 'ancient-world', name: 'Ancient World', years: 'c. 100 AD', startYear: 100, moneySymbol: 'M', moneyScale: 1, lifeExpectancy: 38, declineRate: 1.4, places: ANCIENT_WORLD_PLACES,
  },
  {
    id: 'medieval', name: 'Middle Ages', years: 'c. 1300', startYear: 1300, moneySymbol: 'M', moneyScale: 1, lifeExpectancy: 40, declineRate: 1.35, places: MEDIEVAL_PLACES,
  },
  {
    id: 'age-of-sail', name: 'Age of Sail', years: 'c. 1650', startYear: 1650, moneySymbol: 'M', moneyScale: 3, lifeExpectancy: 42, declineRate: 1.3, places: AGE_OF_SAIL_PLACES,
  },
  {
    id: 'industrial', name: 'Industrial Age', years: 'c. 1880', startYear: 1880, moneySymbol: 'M', moneyScale: 8, lifeExpectancy: 46, declineRate: 1.25, places: INDUSTRIAL_PLACES,
  },
  {
    id: 'atomic', name: 'Atomic Age', years: 'c. 1965', startYear: 1965, moneySymbol: '$', moneyScale: 15, lifeExpectancy: 68, declineRate: 0.95, places: ATOMIC_PLACES,
  },
  {
    id: 'modern-day', name: 'Modern Day', years: 'c. 2025', startYear: 2025, moneySymbol: '$', moneyScale: 20, lifeExpectancy: 72, declineRate: 0.75, places: MODERN_DAY_PLACES,
  },
];

export const ERA_MAP: Record<EraId, Era> = Object.fromEntries(
  ERAS.map((e) => [e.id, e]),
) as Record<EraId, Era>;

/** Periods oldest first. Later eras inherit what earlier ones had. */
export const ERA_ORDER: EraId[] = ERAS.map((e) => e.id);

export function getEra(id: EraId): Era {
  return ERA_MAP[id];
}

/**
 * The currency of a birthplace. Places override the era — Florence
 * dealt in florins while Yorkshire used pennies — so symbols differ
 * within one era. Where a place had no single coin in common the era
 * falls back to a plain M.
 */
export function moneySymbolOf(c: { eraId: EraId; placeId: string }): string {
  const era = getEra(c.eraId);
  return era.places.find((p) => p.id === c.placeId)?.moneySymbol ?? era.moneySymbol;
}

/** The country of a birthplace, for country-specific news and events. */
export function countryOf(c: { eraId: EraId; placeId: string }): string {
  const era = getEra(c.eraId);
  return era.places.find((p) => p.id === c.placeId)?.country ?? '';
}

/** Every place available in an era, for the birthplace picker. */
export function placesOf(eraId: EraId): Era['places'] {
  return getEra(eraId).places;
}

/**
 * Does this place match a search? Case- and accent-blind, across
 * name, country and city, so "united" finds Detroit.
 */
export function matchesPlace(place: Era['places'][number], query: string): boolean {
  const q = fold(query.trim());
  if (!q) return true;
  return (
    fold(place.name).includes(q) ||
    fold(place.country).includes(q) ||
    (place.city ? fold(place.city).includes(q) : false)
  );
}

/** Strip accents and case so searching is forgiving. */
function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
