import type { EraId, Stats } from '../types';

/**
 * Shops and what they sell. A shop with `aisles` is browsed one
 * aisle at a time (a dropdown switches the list); a shop without
 * aisles shows everything in one scrollable list. Counts differ by
 * period on purpose: a Roman has three shops, a modern has six.
 *
 * Costs are base units, scaled by the era at the till. `once`
 * marks durables: owned at most one at a time. Everything else is
 * consumable and can be bought again.
 */

export interface ShopDef {
  id: string;
  /** button and heading text */
  text: string;
  /** periods where this shop exists */
  eras: EraId[];
  /** when present, items split across these lists */
  aisles?: string[];
}

export interface ShopItemDef {
  id: string;
  shopId: string;
  /** which list it sits in; only for aisled shops */
  aisle?: string;
  /** button text */
  text: string;
  /** journal line, second person */
  journal: string;
  /** one line for the feedback popup */
  notice: string;
  /** base-unit cost, scaled by the era */
  cost: number;
  /** owned at most once; repeat buys disabled while owned */
  once?: boolean;
  /** satiety points when eaten; absent means it is not food */
  sates?: number;
  /** parents keep children stocked with these until 18 */
  staple?: boolean;
  /**
   * Who loves or hates it, as lowercase trade keywords matched
   * against what the recipient does (plus 'child' under 14).
   * Absent means everyone takes it neutrally, like food.
   */
  tastes?: { love?: string[]; hate?: string[] };
  /** a ring: proposable, and several can be owned at once */
  ring?: boolean;
  /** a vehicle: drivable from the belongings, with a licence where one is needed */
  vehicle?: boolean;
  /** what buying it does */
  stats?: Partial<Stats>;
  minAge?: number;
  maxAge?: number;
  /** restrict to places (place ids) */
  places?: string[];
}

export const SHOPS: ShopDef[] = [
  { id: 'market', text: 'Market', eras: ['ancient-world', 'medieval', 'age-of-sail', 'industrial'], aisles: ['Food', 'Cloth', 'Tools'] },
  { id: 'blacksmith', text: 'Blacksmith', eras: ['ancient-world'] },
  { id: 'scribe', text: 'Scribe', eras: ['ancient-world'] },
  { id: 'apothecary', text: 'Apothecary', eras: ['medieval'] },
  { id: 'armorer', text: 'Armorer', eras: ['medieval'] },
  { id: 'outfitter', text: 'Outfitter', eras: ['age-of-sail'] },
  { id: 'bookseller', text: 'Bookseller', eras: ['age-of-sail', 'industrial'] },
  { id: 'dept', text: 'Department store', eras: ['industrial', 'atomic'], aisles: ['Cloth', 'Home'] },
  { id: 'bicycle', text: 'Bicycle shop', eras: ['industrial'] },
  { id: 'stable', text: 'Stable', eras: ['ancient-world', 'medieval', 'age-of-sail', 'industrial'] },
  { id: 'motorworks', text: 'Motor works', eras: ['industrial'] },
  { id: 'supermarket', text: 'Supermarket', eras: ['atomic', 'modern-day'], aisles: ['Food', 'Home'] },
  { id: 'pharmacy', text: 'Pharmacy', eras: ['atomic', 'modern-day'] },
  { id: 'records', text: 'Record shop', eras: ['atomic'] },
  { id: 'phone', text: 'Phone store', eras: ['modern-day'] },
  { id: 'cars', text: 'Car dealership', eras: ['atomic', 'modern-day'] },
  { id: 'bookshop', text: 'Bookshop', eras: ['modern-day'] },
  { id: 'jeweler', text: 'Goldsmith', eras: ['ancient-world', 'medieval', 'age-of-sail', 'industrial', 'atomic', 'modern-day'] },
];

export const SHOP_ITEMS: ShopItemDef[] = [
  // market: food aisle, all periods it exists
  { id: 'bread', shopId: 'market', aisle: 'Food', text: 'Bread', journal: 'You bought bread at the market.', notice: 'Still warm from the oven.', cost: 1, sates: 30, staple: true },
  { id: 'cheese', shopId: 'market', aisle: 'Food', text: 'Cheese', journal: 'You bought cheese at the market.', notice: 'It will keep.', cost: 1, sates: 25, stats: { happiness: 1 } },
  { id: 'wine', shopId: 'market', aisle: 'Food', text: 'Wine', journal: 'You bought wine at the market.', notice: 'A full skin of it.', cost: 2, stats: { happiness: 2 }, minAge: 14, tastes: { love: ['priest', 'monk', 'poet', 'noble'], hate: ['child'] } },
  { id: 'market-apples', shopId: 'market', aisle: 'Food', text: 'Basket of apples', journal: 'You bought a basket of apples at the market.', notice: 'Crisp and sweet.', cost: 1, sates: 15, stats: { health: 1 }, tastes: { love: ['child', 'farmer'] } },
  { id: 'market-figs', shopId: 'market', aisle: 'Food', text: 'Dried figs', journal: 'You bought dried figs at the market.', notice: 'Sweet and chewy.', cost: 1, sates: 15, stats: { happiness: 1 } },
  { id: 'market-meat', shopId: 'market', aisle: 'Food', text: 'Salted pork', journal: 'You bought salted pork at the market.', notice: 'Hearty fare for the pot.', cost: 2, sates: 35, stats: { health: 1 } },
  { id: 'market-honey', shopId: 'market', aisle: 'Food', text: 'Jar of honey', journal: 'You bought a jar of honey at the market.', notice: 'Wild clover sweetness.', cost: 2, sates: 10, stats: { happiness: 2 }, tastes: { love: ['child', 'cook'] } },
  { id: 'market-ale', shopId: 'market', aisle: 'Food', text: 'Jug of ale', journal: 'You bought a jug of ale at the market.', notice: 'Foaming and cold.', cost: 1, sates: 10, minAge: 14, stats: { happiness: 2 }, tastes: { love: ['soldier', 'sailor', 'blacksmith', 'farmer'], hate: ['child', 'priest'] } },
  { id: 'market-spices', shopId: 'market', aisle: 'Food', text: 'Pouch of spices', journal: 'You bought a pouch of spices at the market.', notice: 'Fragrant and costly.', cost: 3, stats: { happiness: 1 }, tastes: { love: ['cook', 'merchant', 'noble'] } },

  // market: cloth aisle
  { id: 'tunic', shopId: 'market', aisle: 'Cloth', text: 'Tunic', journal: 'You bought a tunic at the market.', notice: 'Plain, sturdy, yours.', cost: 2, once: true, stats: { looks: 2 } },
  { id: 'cloak', shopId: 'market', aisle: 'Cloth', text: 'Cloak', journal: 'You bought a cloak at the market.', notice: 'Heavy wool against the rain.', cost: 3, once: true, stats: { looks: 2, health: 1 } },
  { id: 'market-boots', shopId: 'market', aisle: 'Cloth', text: 'Leather boots', journal: 'You bought leather boots at the market.', notice: 'Sturdy soles for long roads.', cost: 3, once: true, stats: { health: 1, looks: 1 } },
  { id: 'market-shirt', shopId: 'market', aisle: 'Cloth', text: 'Linen shirt', journal: 'You bought a linen shirt at the market.', notice: 'Light against the skin.', cost: 2, once: true, stats: { looks: 1 } },
  { id: 'market-hat', shopId: 'market', aisle: 'Cloth', text: 'Straw hat', journal: 'You bought a straw hat at the market.', notice: 'Shade against the high sun.', cost: 1, once: true, stats: { health: 1 } },
  { id: 'market-scarf', shopId: 'market', aisle: 'Cloth', text: 'Silk scarf', journal: 'You bought a silk scarf at the market.', notice: 'Soft weave and rich dye.', cost: 4, once: true, stats: { looks: 3 } },
  { id: 'market-apron', shopId: 'market', aisle: 'Cloth', text: 'Work apron', journal: 'You bought a work apron at the market.', notice: 'Thick canvas to take the stains.', cost: 1, once: true, tastes: { love: ['cook', 'smith', 'carpenter', 'farmer'] } },

  // market: tools aisle
  { id: 'knife', shopId: 'market', aisle: 'Tools', text: 'Knife', journal: 'You bought a knife at the market.', notice: 'It takes an edge well.', cost: 2, once: true, tastes: { love: ['farmer', 'cook', 'carpenter', 'smith', 'hunter'], hate: ['priest', 'monk', 'child'] } },
  { id: 'lamp', shopId: 'market', aisle: 'Tools', text: 'Oil lamp', journal: 'You bought an oil lamp at the market.', notice: 'It burns steady and clear.', cost: 1, once: true, stats: { happiness: 1 } },
  { id: 'market-pot', shopId: 'market', aisle: 'Tools', text: 'Iron pot', journal: 'You bought an iron pot at the market.', notice: 'Heavy enough for any hearth.', cost: 2, once: true, stats: { happiness: 1 } },
  { id: 'market-rope', shopId: 'market', aisle: 'Tools', text: 'Coil of rope', journal: 'You bought a coil of rope at the market.', notice: 'Hemp twisted tight.', cost: 1, once: true, tastes: { love: ['sailor', 'builder', 'hunter', 'farmer'] } },
  { id: 'market-axe', shopId: 'market', aisle: 'Tools', text: 'Handaxe', journal: 'You bought a handaxe at the market.', notice: 'Bites deep into timber.', cost: 3, once: true, minAge: 12, tastes: { love: ['woodcutter', 'carpenter', 'farmer', 'hunter'] } },
  { id: 'market-whetstone', shopId: 'market', aisle: 'Tools', text: 'Whetstone', journal: 'You bought a whetstone at the market.', notice: 'Fine grit to keep edges true.', cost: 1, once: true, tastes: { love: ['smith', 'soldier', 'hunter', 'cook'] } },
  { id: 'market-bowl', shopId: 'market', aisle: 'Tools', text: 'Wooden bowl & spoon', journal: 'You bought a wooden bowl and spoon.', notice: 'Smooth turned birch.', cost: 1, once: true, stats: { happiness: 1 } },

  // blacksmith (ancient)
  { id: 'dagger', shopId: 'blacksmith', text: 'Dagger', journal: 'You bought a dagger from the smith.', notice: 'Short, honest iron.', cost: 4, once: true, tastes: { love: ['soldier', 'guard', 'hunter', 'mercenary'], hate: ['farmer', 'priest', 'monk', 'scribe', 'scholar', 'doctor', 'merchant', 'child'] } },
  { id: 'horseshoes', shopId: 'blacksmith', text: 'A set of horseshoes', journal: 'You had the horse shod by the smith.', notice: 'Four shoes, well nailed.', cost: 2, stats: { happiness: 1 }, tastes: { love: ['stableman', 'groom', 'farmer', 'driver', 'messenger'] } },
  { id: 'ploughshare', shopId: 'blacksmith', text: 'Ploughshare', journal: 'You bought a ploughshare from the smith.', notice: 'It will turn good earth.', cost: 3, once: true, tastes: { love: ['farmer'] } },
  { id: 'smith-kettle', shopId: 'blacksmith', text: 'Iron kettle', journal: 'You bought an iron kettle from the smith.', notice: 'Sturdy iron for boiling over coals.', cost: 2, once: true, stats: { happiness: 1 } },
  { id: 'smith-sickle', shopId: 'blacksmith', text: 'Sickle', journal: 'You bought a sickle from the smith.', notice: 'Curved iron for the harvest.', cost: 2, once: true, tastes: { love: ['farmer'] } },
  { id: 'smith-spear', shopId: 'blacksmith', text: 'Hunting spear', journal: 'You bought a hunting spear from the smith.', notice: 'Leaf-bladed iron on ash.', cost: 4, once: true, minAge: 12, tastes: { love: ['hunter', 'soldier', 'guard'], hate: ['child', 'priest', 'scribe'] } },
  { id: 'smith-tongs', shopId: 'blacksmith', text: 'Fire tongs', journal: 'You bought fire tongs from the smith.', notice: 'Long arms to tend the embers.', cost: 1, once: true },
  { id: 'smith-nails', shopId: 'blacksmith', text: 'Bag of wrought nails', journal: 'You bought wrought iron nails from the smith.', notice: 'Square-headed and unbending.', cost: 1, tastes: { love: ['carpenter', 'builder'] } },

  // scribe (ancient)
  { id: 'scroll', shopId: 'scribe', text: 'Scroll', journal: 'You bought a scroll from the scribe.', notice: 'Copied clean, no blots.', cost: 3, stats: { smarts: 2 }, tastes: { love: ['scribe', 'scholar', 'teacher', 'student', 'priest', 'monk', 'clerk', 'poet'] } },
  { id: 'letter', shopId: 'scribe', text: 'A letter written', journal: 'You paid the scribe to write a letter.', notice: 'Your words in a fair hand.', cost: 1, stats: { happiness: 1 }, tastes: { love: ['scribe', 'scholar', 'student', 'poet'] } },
  { id: 'scribe-papyrus', shopId: 'scribe', text: 'Sheet of papyrus', journal: 'You bought a sheet of papyrus from the scribe.', notice: 'Smooth reeds pressed flat.', cost: 1, stats: { smarts: 1 }, tastes: { love: ['scribe', 'scholar', 'student', 'poet'] } },
  { id: 'scribe-ink', shopId: 'scribe', text: 'Reed pen & ink', journal: 'You bought a reed pen and ink from the scribe.', notice: 'Lampblack ink and split cane.', cost: 2, once: true, stats: { smarts: 2 }, tastes: { love: ['scribe', 'scholar', 'student', 'clerk'] } },
  { id: 'scribe-tablet', shopId: 'scribe', text: 'Wax writing tablet', journal: 'You bought a wax writing tablet from the scribe.', notice: 'Beeswax in a wooden frame.', cost: 2, once: true, stats: { smarts: 1 }, tastes: { love: ['student', 'teacher', 'merchant', 'scribe'] } },
  { id: 'scribe-seal', shopId: 'scribe', text: 'Stone seal stamp', journal: 'You bought an engraved seal stamp from the scribe.', notice: 'Carved steatite to leave your mark.', cost: 4, once: true, stats: { looks: 1, smarts: 1 }, tastes: { love: ['merchant', 'noble', 'scribe', 'clerk'] } },

  // apothecary (medieval)
  { id: 'herbs', shopId: 'apothecary', text: 'Herb bundle', journal: 'You bought herbs from the apothecary.', notice: 'Bitter, and good for you.', cost: 1, stats: { health: 2 }, tastes: { love: ['doctor', 'physician', 'surgeon', 'apothecary', 'healer', 'midwife'] } },
  { id: 'poultice', shopId: 'apothecary', text: 'Poultice', journal: 'You bought a poultice from the apothecary.', notice: 'It draws the ache out.', cost: 2, stats: { health: 3 }, tastes: { love: ['doctor', 'physician', 'surgeon', 'apothecary', 'healer'] } },
  { id: 'tonic', shopId: 'apothecary', text: 'Tonic', journal: 'You bought a tonic from the apothecary.', notice: 'You feel it working by nightfall.', cost: 2, stats: { health: 2, happiness: 1 }, tastes: { love: ['doctor', 'physician', 'apothecary'] } },
  { id: 'apoth-pastilles', shopId: 'apothecary', text: 'Candied mint pastilles', journal: 'You bought candied mint pastilles from the apothecary.', notice: 'Sweet sugar and sharp peppermint.', cost: 1, stats: { happiness: 2, health: 1 }, tastes: { love: ['child'] } },
  { id: 'apoth-lavender', shopId: 'apothecary', text: 'Lavender oil', journal: 'You bought lavender oil from the apothecary.', notice: 'A soothing vial of fragrant oil.', cost: 1, stats: { happiness: 2, energy: 3 } },
  { id: 'apoth-salve', shopId: 'apothecary', text: 'Healing salve', journal: 'You bought healing salve from the apothecary.', notice: 'Beeswax and marigold for cuts.', cost: 1, stats: { health: 2 } },
  { id: 'apoth-soap', shopId: 'apothecary', text: 'Bar of herbal soap', journal: 'You bought herbal soap from the apothecary.', notice: 'Lathers rich with sage and lye.', cost: 1, stats: { health: 1, looks: 1 } },
  { id: 'apoth-cloves', shopId: 'apothecary', text: 'Pouch of dried cloves', journal: 'You bought dried cloves from the apothecary.', notice: 'Numbs an aching tooth.', cost: 1, stats: { health: 1 } },

  // armorer (medieval)
  { id: 'sword', shopId: 'armorer', text: 'Sword', journal: 'You bought a sword from the armorer.', notice: 'Balanced to your hand.', cost: 8, once: true, minAge: 14, tastes: { love: ['soldier', 'knight', 'guard', 'warrior', 'mercenary', 'hunter'], hate: ['farmer', 'priest', 'monk', 'nun', 'cleric', 'scribe', 'scholar', 'teacher', 'student', 'doctor', 'merchant', 'child'] } },
  { id: 'gambeson', shopId: 'armorer', text: 'Gambeson', journal: 'You bought a padded gambeson.', notice: 'Thick cloth stops more than cold.', cost: 4, once: true, stats: { health: 1 }, tastes: { love: ['soldier', 'knight', 'guard', 'mercenary'] } },
  { id: 'armor-helmet', shopId: 'armorer', text: 'Kettle hat', journal: 'You bought an iron kettle hat from the armorer.', notice: 'Wide brim deflects blows from above.', cost: 5, once: true, minAge: 14, stats: { health: 2 }, tastes: { love: ['soldier', 'knight', 'guard', 'mercenary'] } },
  { id: 'armor-shield', shopId: 'armorer', text: 'Wooden buckler', journal: 'You bought a wooden buckler from the armorer.', notice: 'Iron boss and bound oak.', cost: 3, once: true, minAge: 12, stats: { health: 1 }, tastes: { love: ['soldier', 'knight', 'guard'] } },
  { id: 'armor-bow', shopId: 'armorer', text: 'Yew hunting bow', journal: 'You bought a yew hunting bow from the armorer.', notice: 'A tall stave of cured yew.', cost: 6, once: true, minAge: 12, stats: { happiness: 2 }, tastes: { love: ['hunter', 'guard', 'soldier'], hate: ['priest', 'monk', 'child'] } },
  { id: 'armor-gauntlets', shopId: 'armorer', text: 'Leather gauntlets', journal: 'You bought leather gauntlets from the armorer.', notice: 'Reinforced hide protects the wrists.', cost: 3, once: true, stats: { looks: 1 }, tastes: { love: ['soldier', 'knight', 'blacksmith'] } },
  { id: 'armor-mail', shopId: 'armorer', text: 'Chainmail hauberk', journal: 'You bought a chainmail hauberk from the armorer.', notice: 'Thousands of riveted iron links.', cost: 14, once: true, minAge: 16, stats: { health: 3, looks: 2 }, tastes: { love: ['knight', 'soldier', 'noble'], hate: ['child'] } },

  // outfitter (age of sail)
  { id: 'coat', shopId: 'outfitter', text: 'Sea coat', journal: 'You bought a sea coat from the outfitter.', notice: 'Canvas and tar against the spray.', cost: 3, once: true, stats: { looks: 2, health: 1 } },
  { id: 'boots', shopId: 'outfitter', text: 'Sea boots', journal: 'You bought sea boots from the outfitter.', notice: 'They will outlast you.', cost: 3, once: true, stats: { health: 1 } },
  { id: 'sextant', shopId: 'outfitter', text: 'Sextant', journal: 'You bought a sextant from the outfitter.', notice: 'Brass that finds the horizon.', cost: 8, once: true, stats: { smarts: 2 }, tastes: { love: ['sailor', 'navigator', 'captain', 'fisher', 'pirate', 'boatman'] } },
  { id: 'outfit-spyglass', shopId: 'outfitter', text: 'Brass spyglass', journal: 'You bought a brass spyglass from the outfitter.', notice: 'Pulls the horizon right to your eye.', cost: 6, once: true, stats: { smarts: 2 }, tastes: { love: ['sailor', 'captain', 'navigator'] } },
  { id: 'outfit-compass', shopId: 'outfitter', text: 'Pocket compass', journal: 'You bought a pocket compass from the outfitter.', notice: 'The needle points true north.', cost: 3, once: true, stats: { smarts: 1 }, tastes: { love: ['sailor', 'captain', 'navigator', 'explorer'] } },
  { id: 'outfit-pipe', shopId: 'outfitter', text: 'Briar pipe', journal: 'You bought a briar pipe from the outfitter.', notice: 'Polished bowl and vulcanite stem.', cost: 2, once: true, minAge: 16, stats: { happiness: 2 }, tastes: { love: ['sailor', 'captain', 'scholar'] } },
  { id: 'outfit-bag', shopId: 'outfitter', text: 'Canvas sea bag', journal: 'You bought a canvas sea bag from the outfitter.', notice: 'Tar-stitched and cavernous.', cost: 2, once: true },
  { id: 'outfit-biscuit', shopId: 'outfitter', text: 'Ship’s biscuit', journal: 'You bought hard ship’s biscuit from the outfitter.', notice: 'Hard as stone, but it will keep.', cost: 1, sates: 20 },
  { id: 'outfit-knitcap', shopId: 'outfitter', text: 'Wool watch cap', journal: 'You bought a wool watch cap from the outfitter.', notice: 'Thick ribbing against the north wind.', cost: 1, once: true, stats: { health: 1 } },

  // bookseller (sail + industrial)
  { id: 'atlas', shopId: 'bookseller', text: 'Atlas', journal: 'You bought an atlas from the bookseller.', notice: 'The world, folded flat.', cost: 4, once: true, stats: { smarts: 3 }, tastes: { love: ['scholar', 'teacher', 'student', 'sailor', 'navigator', 'captain'] } },
  { id: 'novel', shopId: 'bookseller', text: 'Novel', journal: 'You bought a novel from the bookseller.', notice: 'Three evenings of somebody else.', cost: 2, stats: { happiness: 2, smarts: 1 }, tastes: { love: ['scholar', 'teacher', 'student', 'poet', 'clerk'] } },
  { id: 'primer', shopId: 'bookseller', text: 'Primer', journal: 'You bought a primer from the bookseller.', notice: 'Plain lessons, well set.', cost: 1, stats: { smarts: 2 }, tastes: { love: ['teacher', 'student', 'scholar', 'priest'] } },
  { id: 'book-journal', shopId: 'bookseller', text: 'Leather journal', journal: 'You bought a leather journal from the bookseller.', notice: 'Clean creamy pages awaiting ink.', cost: 2, once: true, stats: { smarts: 2, happiness: 1 }, tastes: { love: ['scholar', 'student', 'writer', 'poet', 'clerk'] } },
  { id: 'book-poetry', shopId: 'bookseller', text: 'Book of verse', journal: 'You bought a book of verse from the bookseller.', notice: 'Rhymes of love and the sea.', cost: 2, stats: { happiness: 2, looks: 1 }, tastes: { love: ['poet', 'student', 'teacher', 'scholar'] } },
  { id: 'book-almanac', shopId: 'bookseller', text: 'Farmer’s almanac', journal: 'You bought an almanac from the bookseller.', notice: 'Moon phases and planting tables.', cost: 1, stats: { smarts: 1 }, tastes: { love: ['farmer', 'sailor'] } },
  { id: 'book-dictionary', shopId: 'bookseller', text: 'Pocket dictionary', journal: 'You bought a dictionary from the bookseller.', notice: 'Words defined with stern clarity.', cost: 3, once: true, stats: { smarts: 3 }, tastes: { love: ['student', 'teacher', 'scholar'] } },
  { id: 'book-songbook', shopId: 'bookseller', text: 'Folio of ballads', journal: 'You bought a ballad folio from the bookseller.', notice: 'Songs with simple sheet notes.', cost: 1, stats: { happiness: 2 }, tastes: { love: ['musician', 'student', 'sailor'] } },

  // department store (industrial + atomic)
  { id: 'suit', shopId: 'dept', aisle: 'Cloth', text: 'Suit', journal: 'You bought a suit at the department store.', notice: 'Cut to fit, pressed sharp.', cost: 6, once: true, stats: { looks: 4 } },
  { id: 'dress', shopId: 'dept', aisle: 'Cloth', text: 'Dress', journal: 'You bought a dress at the department store.', notice: 'It turns heads on the street.', cost: 6, once: true, stats: { looks: 4 } },
  { id: 'dept-overcoat', shopId: 'dept', aisle: 'Cloth', text: 'Overcoat', journal: 'You bought an overcoat at the department store.', notice: 'Heavy melton wool down to the knees.', cost: 7, once: true, stats: { looks: 3, health: 1 } },
  { id: 'dept-shoes', shopId: 'dept', aisle: 'Cloth', text: 'Leather shoes', journal: 'You bought leather shoes at the department store.', notice: 'Polished calfskin, quiet soles.', cost: 4, once: true, stats: { looks: 2 } },
  { id: 'dept-sweater', shopId: 'dept', aisle: 'Cloth', text: 'Knit cardigan', journal: 'You bought a knit cardigan at the department store.', notice: 'Soft wool against the autumn chill.', cost: 3, once: true, stats: { happiness: 1, health: 1 } },
  { id: 'dept-hat', shopId: 'dept', aisle: 'Cloth', text: 'Fedora', journal: 'You bought a fedora at the department store.', notice: 'Felt brim with a clean crease.', cost: 2, once: true, stats: { looks: 2 } },
  { id: 'dept-necktie', shopId: 'dept', aisle: 'Cloth', text: 'Silk necktie', journal: 'You bought a silk necktie at the department store.', notice: 'A dash of quiet pattern.', cost: 2, stats: { looks: 2 } },

  { id: 'kettle', shopId: 'dept', aisle: 'Home', text: 'Kettle', journal: 'You bought a kettle at the department store.', notice: 'It sings on the boil.', cost: 2, once: true, stats: { happiness: 1 } },
  { id: 'blanket', shopId: 'dept', aisle: 'Home', text: 'Wool blanket', journal: 'You bought a wool blanket.', notice: 'Heavy enough for January.', cost: 2, once: true, stats: { health: 1 } },
  { id: 'dept-lamp', shopId: 'dept', aisle: 'Home', text: 'Bedside lamp', journal: 'You bought a bedside lamp at the department store.', notice: 'A gentle pool of evening light.', cost: 3, once: true, stats: { happiness: 1 } },
  { id: 'dept-teapot', shopId: 'dept', aisle: 'Home', text: 'Porcelain teapot', journal: 'You bought a porcelain teapot at the department store.', notice: 'Fine glaze and comfortable handle.', cost: 3, once: true, stats: { happiness: 2 } },
  { id: 'dept-clock', shopId: 'dept', aisle: 'Home', text: 'Mantel clock', journal: 'You bought a mantel clock at the department store.', notice: 'Steadily marks every passing hour.', cost: 4, once: true, stats: { happiness: 1 } },
  { id: 'dept-skillet', shopId: 'dept', aisle: 'Home', text: 'Cast-iron skillet', journal: 'You bought a cast-iron skillet at the department store.', notice: 'Heavy base holds even heat.', cost: 2, once: true },
  { id: 'dept-fan', shopId: 'dept', aisle: 'Home', text: 'Electric table fan', journal: 'You bought an electric fan at the department store.', notice: 'Whirs softly through summer heat.', cost: 4, once: true, stats: { happiness: 2 } },

  // bicycle shop (industrial)
  { id: 'bicycle', shopId: 'bicycle', text: 'Bicycle', journal: 'You bought a bicycle.', notice: 'Two wheels and the whole town.', cost: 10, once: true, minAge: 8, vehicle: true, stats: { happiness: 4, health: 1 }, tastes: { love: ['messenger', 'courier', 'student', 'driver'] } },
  { id: 'bell', shopId: 'bicycle', text: 'Bicycle bell', journal: 'You bought a bell for the bicycle.', notice: 'It rings clear down the lane.', cost: 1 },
  { id: 'bike-headlight', shopId: 'bicycle', text: 'Carbide headlamp', journal: 'You bought a carbide lamp for the bicycle.', notice: 'A bright white beam into the dark.', cost: 2, once: true, stats: { happiness: 1 } },
  { id: 'bike-pannier', shopId: 'bicycle', text: 'Leather saddlebag', journal: 'You bought a leather saddlebag for the bicycle.', notice: 'Room for books and groceries.', cost: 3, once: true },
  { id: 'bike-pump', shopId: 'bicycle', text: 'Frame pump', journal: 'You bought a tire pump for the bicycle.', notice: 'Clips snugly to the downtube.', cost: 1, once: true },
  { id: 'bike-kit', shopId: 'bicycle', text: 'Puncture repair kit', journal: 'You bought a puncture kit for the bicycle.', notice: 'Patches, glue, and a tire lever.', cost: 1, tastes: { love: ['mechanic', 'courier'] } },

  // stable (ancient world through industrial — horses before motors)
  { id: 'horse', shopId: 'stable', text: 'Horse', journal: 'You bought a horse at the stable.', notice: 'It eyes you like it knows the price.', cost: 25, once: true, minAge: 10, vehicle: true, stats: { happiness: 5 }, tastes: { love: ['stableman', 'groom', 'farmer', 'driver', 'messenger'] } },
  { id: 'stable-pony', shopId: 'stable', text: 'Pony', journal: 'You bought a pony at the stable.', notice: 'Short, sturdy, and patient.', cost: 16, once: true, minAge: 8, vehicle: true, stats: { happiness: 4 }, tastes: { love: ['child', 'groom'] } },
  { id: 'cart', shopId: 'stable', text: 'Cart', journal: 'You bought a cart at the stable.', notice: 'Two wheels, room for everything.', cost: 40, once: true, minAge: 14, vehicle: true, stats: { happiness: 5 } },
  { id: 'carriage', shopId: 'stable', text: 'Carriage', journal: 'You bought a carriage at the stable.', notice: 'Nobody walks past it twice.', cost: 70, once: true, minAge: 16, vehicle: true, stats: { happiness: 8, looks: 2 } },
  { id: 'stable-saddle', shopId: 'stable', text: 'Tooled leather saddle', journal: 'You bought a tooled saddle at the stable.', notice: 'Deep seat and oiled stirrups.', cost: 8, once: true, stats: { looks: 2, happiness: 1 } },
  { id: 'stable-crop', shopId: 'stable', text: 'Riding crop', journal: 'You bought a riding crop at the stable.', notice: 'Braided leather with a neat wrist loop.', cost: 2, once: true },
  { id: 'stable-oats', shopId: 'stable', text: 'Sack of sweet oats', journal: 'You bought a sack of sweet oats at the stable.', notice: 'The horses nicker as you walk past.', cost: 1, tastes: { love: ['stableman', 'groom', 'farmer'] } },

  // motor works (industrial — the dear new machines)
  { id: 'motorcycle', shopId: 'motorworks', text: 'Motorcycle', journal: 'You bought a motorcycle at the motor works.', notice: 'It shakes the street awake.', cost: 45, once: true, minAge: 18, vehicle: true, stats: { happiness: 7 } },
  { id: 'motorcar', shopId: 'motorworks', text: 'Motorcar', journal: 'You bought a motorcar at the motor works.', notice: 'Nobody on your street has one.', cost: 90, once: true, minAge: 18, vehicle: true, stats: { happiness: 10, looks: 2 } },
  { id: 'motor-goggles', shopId: 'motorworks', text: 'Motoring goggles', journal: 'You bought motoring goggles at the motor works.', notice: 'Curved glass and brass wire mesh.', cost: 3, once: true, stats: { looks: 1 } },
  { id: 'motor-duster', shopId: 'motorworks', text: 'Linen duster coat', journal: 'You bought a motoring duster at the motor works.', notice: 'Shields your clothes from the road grime.', cost: 5, once: true, stats: { looks: 2 } },
  { id: 'motor-tools', shopId: 'motorworks', text: 'Roll of wrenches', journal: 'You bought a wrench roll at the motor works.', notice: 'Tempered steel spanners.', cost: 4, once: true, stats: { smarts: 1 }, tastes: { love: ['mechanic', 'driver'] } },
  { id: 'motor-horn', shopId: 'motorworks', text: 'Brass bulb horn', journal: 'You bought a brass horn at the motor works.', notice: 'Honks loud enough to startle the geese.', cost: 2, once: true, stats: { happiness: 1 } },

  // supermarket (atomic + modern)
  { id: 'supermarket-bread', shopId: 'supermarket', aisle: 'Food', text: 'Bread', journal: 'You bought bread at the supermarket.', notice: 'Sliced and bagged.', cost: 1, sates: 30, staple: true },
  { id: 'groceries', shopId: 'supermarket', aisle: 'Food', text: 'A bag of groceries', journal: 'You filled a bag at the supermarket.', notice: 'Enough for the week.', cost: 2, sates: 45, staple: true, stats: { health: 1, happiness: 1 } },
  { id: 'coffee', shopId: 'supermarket', aisle: 'Food', text: 'Coffee', journal: 'You bought coffee at the supermarket.', notice: 'Dark roast, whole beans.', cost: 1, sates: 5, stats: { happiness: 2 } },
  { id: 'super-chocolate', shopId: 'supermarket', aisle: 'Food', text: 'Chocolate bar', journal: 'You bought a chocolate bar at the supermarket.', notice: 'Rich milk chocolate melts on your tongue.', cost: 1, sates: 10, stats: { happiness: 3 }, tastes: { love: ['child'] } },
  { id: 'super-soda', shopId: 'supermarket', aisle: 'Food', text: 'Cold soda', journal: 'You bought a cold soda at the supermarket.', notice: 'Ice-cold carbonated fizz.', cost: 1, sates: 5, stats: { happiness: 2 }, tastes: { love: ['child', 'student'] } },
  { id: 'super-cereal', shopId: 'supermarket', aisle: 'Food', text: 'Box of cereal', journal: 'You bought a box of cereal at the supermarket.', notice: 'Crunchy morning breakfast.', cost: 1, sates: 25, stats: { happiness: 1 } },
  { id: 'super-steak', shopId: 'supermarket', aisle: 'Food', text: 'Prime steak', journal: 'You bought a prime steak at the supermarket.', notice: 'Marbled and thick-cut.', cost: 3, sates: 40, stats: { health: 1, happiness: 2 } },
  { id: 'super-icecream', shopId: 'supermarket', aisle: 'Food', text: 'Tub of ice cream', journal: 'You bought a tub of ice cream at the supermarket.', notice: 'Creamy vanilla sweetness.', cost: 2, sates: 15, stats: { happiness: 4 }, tastes: { love: ['child'] } },
  { id: 'super-fruit', shopId: 'supermarket', aisle: 'Food', text: 'Fresh fruit carton', journal: 'You bought fresh fruit at the supermarket.', notice: 'Oranges, berries, and apples.', cost: 2, sates: 20, stats: { health: 2 } },
  { id: 'super-tea', shopId: 'supermarket', aisle: 'Food', text: 'Box of green tea', journal: 'You bought green tea at the supermarket.', notice: 'Calming dried leaves in sachets.', cost: 1, sates: 5, stats: { health: 1, happiness: 1 } },

  { id: 'pan', shopId: 'supermarket', aisle: 'Home', text: 'Frying pan', journal: 'You bought a frying pan.', notice: 'Heavy iron, seasoned well.', cost: 2, once: true },
  { id: 'sheets', shopId: 'supermarket', aisle: 'Home', text: 'Bed sheets', journal: 'You bought bed sheets.', notice: 'Clean cotton, folded tight.', cost: 2, once: true, stats: { happiness: 1 } },
  { id: 'super-mug', shopId: 'supermarket', aisle: 'Home', text: 'Ceramic coffee mug', journal: 'You bought a ceramic mug at the supermarket.', notice: 'Warm in your hands.', cost: 1, stats: { happiness: 1 } },
  { id: 'super-towel', shopId: 'supermarket', aisle: 'Home', text: 'Bath towel', journal: 'You bought a bath towel at the supermarket.', notice: 'Thick, fluffy terrycloth.', cost: 1, once: true, stats: { happiness: 1 } },
  { id: 'super-candle', shopId: 'supermarket', aisle: 'Home', text: 'Scented candle', journal: 'You bought a scented candle at the supermarket.', notice: 'Smells of pine and vanilla.', cost: 1, stats: { happiness: 2 } },
  { id: 'super-detergent', shopId: 'supermarket', aisle: 'Home', text: 'Laundry detergent', journal: 'You bought laundry detergent at the supermarket.', notice: 'Leaves clothes smelling fresh.', cost: 1, stats: { health: 1 } },
  { id: 'super-knives', shopId: 'supermarket', aisle: 'Home', text: 'Kitchen knife set', journal: 'You bought a knife set at the supermarket.', notice: 'Razor-sharp stainless steel.', cost: 3, once: true },

  // pharmacy (atomic + modern)
  { id: 'aspirin', shopId: 'pharmacy', text: 'Aspirin', journal: 'You bought aspirin at the pharmacy.', notice: 'The headache gives up by noon.', cost: 1, stats: { health: 2 }, tastes: { love: ['doctor', 'physician', 'surgeon', 'nurse'] } },
  { id: 'vitamins', shopId: 'pharmacy', text: 'Vitamins', journal: 'You bought vitamins at the pharmacy.', notice: 'One a day with water.', cost: 2, stats: { health: 2 }, tastes: { love: ['doctor', 'physician', 'nurse'] } },
  { id: 'bandages', shopId: 'pharmacy', text: 'Bandages', journal: 'You bought bandages at the pharmacy.', notice: 'Gauze and tape for the kit.', cost: 1, stats: { health: 1 } },
  { id: 'pharm-coughdrops', shopId: 'pharmacy', text: 'Cough drops', journal: 'You bought cough drops at the pharmacy.', notice: 'Honey-lemon lozenges soothe the throat.', cost: 1, stats: { health: 1, happiness: 1 }, tastes: { love: ['child'] } },
  { id: 'pharm-sunscreen', shopId: 'pharmacy', text: 'Sunscreen bottle', journal: 'You bought sunscreen at the pharmacy.', notice: 'Protects from the harsh sun.', cost: 2, stats: { health: 1, looks: 1 } },
  { id: 'pharm-firstaid', shopId: 'pharmacy', text: 'First-aid kit', journal: 'You bought a first-aid kit at the pharmacy.', notice: 'Antiseptic, gauze, and scissors.', cost: 4, once: true, stats: { health: 3 } },
  { id: 'pharm-antacid', shopId: 'pharmacy', text: 'Antacid tablets', journal: 'You bought antacids at the pharmacy.', notice: 'Quick relief for a restless stomach.', cost: 1, stats: { health: 2 } },
  { id: 'pharm-thermometer', shopId: 'pharmacy', text: 'Digital thermometer', journal: 'You bought a thermometer at the pharmacy.', notice: 'Accurate temperature in seconds.', cost: 2, once: true, stats: { smarts: 1 } },
  { id: 'pharm-hygiene', shopId: 'pharmacy', text: 'Toothbrush & paste', journal: 'You bought a toothbrush and paste at the pharmacy.', notice: 'Fresh mint clean.', cost: 1, stats: { health: 1, looks: 1 } },

  // record shop (atomic)
  { id: 'record', shopId: 'records', text: 'Record', journal: 'You bought a record.', notice: 'It crackles before the first song.', cost: 2, stats: { happiness: 3 }, tastes: { love: ['musician', 'minstrel', 'student'] } },
  { id: 'radio', shopId: 'records', text: 'Transistor radio', journal: 'You bought a transistor radio.', notice: 'It fits in a coat pocket.', cost: 5, once: true, stats: { happiness: 3 }, tastes: { love: ['student', 'musician', 'messenger', 'driver'] } },
  { id: 'rec-single', shopId: 'records', text: '7-inch vinyl single', journal: 'You bought a 45 rpm single.', notice: 'The hit single of the summer.', cost: 1, stats: { happiness: 2 }, tastes: { love: ['child', 'student'] } },
  { id: 'rec-album', shopId: 'records', text: 'Double gatefold album', journal: 'You bought a gatefold vinyl album.', notice: 'Liner notes and glossy sleeve art.', cost: 3, stats: { happiness: 4 }, tastes: { love: ['musician', 'student'] } },
  { id: 'rec-headphones', shopId: 'records', text: 'Padded headphones', journal: 'You bought padded headphones.', notice: 'Shuts out the noise of the house.', cost: 4, once: true, stats: { happiness: 3 } },
  { id: 'rec-turntable', shopId: 'records', text: 'Hi-fi turntable', journal: 'You bought a hi-fi turntable.', notice: 'Warm analog sound fills the living room.', cost: 12, once: true, stats: { happiness: 6, looks: 1 } },
  { id: 'rec-poster', shopId: 'records', text: 'Concert poster', journal: 'You bought a concert poster.', notice: 'Bold psych-rock artwork for the wall.', cost: 1, stats: { happiness: 2, looks: 1 }, tastes: { love: ['student', 'musician'] } },

  // phone store (modern)
  { id: 'phone', shopId: 'phone', text: 'Phone', journal: 'You bought a phone.', notice: 'It lights up in your hand.', cost: 15, once: true, minAge: 10, stats: { happiness: 4, smarts: 1 } },
  { id: 'phonecase', shopId: 'phone', text: 'Phone case', journal: 'You bought a case for the phone.', notice: 'It survives the first drop.', cost: 2 },
  { id: 'phone-earbuds', shopId: 'phone', text: 'Wireless earbuds', journal: 'You bought wireless earbuds.', notice: 'Snug fit with punchy bass.', cost: 5, once: true, minAge: 10, stats: { happiness: 3 } },
  { id: 'phone-powerbank', shopId: 'phone', text: 'Power bank', journal: 'You bought a portable power bank.', notice: 'Keeps your devices charged on the go.', cost: 3, once: true },
  { id: 'phone-tablet', shopId: 'phone', text: 'Tablet', journal: 'You bought a tablet computer.', notice: 'A bright screen for reading and video.', cost: 20, once: true, minAge: 8, stats: { happiness: 4, smarts: 2 }, tastes: { love: ['child', 'student'] } },
  { id: 'phone-watch', shopId: 'phone', text: 'Smartwatch', journal: 'You bought a smartwatch.', notice: 'Vibrates on your wrist with every ping.', cost: 12, once: true, minAge: 12, stats: { happiness: 3, health: 1, looks: 2 } },
  { id: 'phone-cable', shopId: 'phone', text: 'Braided charging cable', journal: 'You bought a braided charging cable.', notice: 'Extra long and tangle-free.', cost: 1 },

  // car dealership (atomic + modern)
  { id: 'scooter', shopId: 'cars', text: 'Scooter', journal: 'You bought a scooter.', notice: 'It starts first time, every time.', cost: 15, once: true, minAge: 16, vehicle: true, stats: { happiness: 4 } },
  { id: 'usedcar', shopId: 'cars', text: 'Used car', journal: 'You bought a used car.', notice: 'It starts on the second try.', cost: 30, once: true, minAge: 18, vehicle: true, stats: { happiness: 5 }, tastes: { love: ['driver', 'mechanic', 'messenger', 'courier'] } },
  { id: 'car-truck', shopId: 'cars', text: 'Pickup truck', journal: 'You bought a pickup truck.', notice: 'High clearance and a heavy flatbed.', cost: 40, once: true, minAge: 18, vehicle: true, stats: { happiness: 5 }, tastes: { love: ['farmer', 'mechanic', 'builder', 'driver'] } },
  { id: 'car-suv', shopId: 'cars', text: 'Family SUV', journal: 'You bought a family SUV.', notice: 'Seats seven with luggage to spare.', cost: 50, once: true, minAge: 18, vehicle: true, stats: { happiness: 6 } },
  { id: 'newcar', shopId: 'cars', text: 'New car', journal: 'You bought a new car.', notice: 'Nobody has sat in it but you.', cost: 60, once: true, minAge: 18, vehicle: true, stats: { happiness: 8, looks: 2 }, tastes: { love: ['driver', 'mechanic'] } },
  { id: 'car-sports', shopId: 'cars', text: 'Convertible sports car', journal: 'You bought a convertible sports car.', notice: 'Top down, engine roaring.', cost: 85, once: true, minAge: 18, vehicle: true, stats: { happiness: 10, looks: 4 } },
  { id: 'luxurycar', shopId: 'cars', text: 'Luxury car', journal: 'You bought a luxury car.', notice: 'The whole street stops to look.', cost: 120, once: true, minAge: 18, vehicle: true, stats: { happiness: 12, looks: 4 } },

  // bookshop (modern)
  { id: 'paperback', shopId: 'bookshop', text: 'Paperback', journal: 'You bought a paperback.', notice: 'It fits in the back pocket.', cost: 1, stats: { happiness: 2, smarts: 1 }, tastes: { love: ['teacher', 'student', 'scholar', 'writer', 'poet'] } },
  { id: 'hardcover', shopId: 'bookshop', text: 'Hardcover', journal: 'You bought a hardcover.', notice: 'It will survive the rereads.', cost: 3, once: true, stats: { happiness: 2, smarts: 2 }, tastes: { love: ['teacher', 'scholar', 'writer'] } },
  { id: 'book-graphicnovel', shopId: 'bookshop', text: 'Graphic novel', journal: 'You bought a graphic novel at the bookshop.', notice: 'Vivid art and gripping pages.', cost: 1, stats: { happiness: 3 }, tastes: { love: ['child', 'student', 'artist'] } },
  { id: 'book-cookbook', shopId: 'bookshop', text: 'Hardcover cookbook', journal: 'You bought a cookbook at the bookshop.', notice: 'Rich photographs and tested recipes.', cost: 2, once: true, stats: { smarts: 1, happiness: 2 }, tastes: { love: ['cook', 'chef'] } },
  { id: 'book-travel', shopId: 'bookshop', text: 'Travel guidebook', journal: 'You bought a travel guide at the bookshop.', notice: 'Maps and hidden spots around the world.', cost: 2, once: true, stats: { smarts: 1, happiness: 1 } },
  { id: 'book-encyclopedia', shopId: 'bookshop', text: 'Illustrated encyclopedia', journal: 'You bought an encyclopedia at the bookshop.', notice: 'Dense facts on science and history.', cost: 4, once: true, stats: { smarts: 4 }, tastes: { love: ['student', 'teacher', 'scholar'] } },
  { id: 'book-fountainpen', shopId: 'bookshop', text: 'Fountain pen & notebook', journal: 'You bought a fountain pen and notebook.', notice: 'Smooth black ink on heavy paper.', cost: 3, once: true, stats: { smarts: 1, looks: 1 } },

  // goldsmith (every era — for what comes later)
  { id: 'copper-ring', shopId: 'jeweler', text: 'Copper ring', journal: 'You bought a copper ring.', notice: 'Plain, warm, a little rough.', cost: 3, ring: true },
  { id: 'jewel-locket', shopId: 'jeweler', text: 'Silver locket', journal: 'You bought a silver locket from the goldsmith.', notice: 'Engraved scrollwork with space for a portrait.', cost: 5, once: true, stats: { looks: 2, happiness: 2 } },
  { id: 'jewel-brooch', shopId: 'jeweler', text: 'Gemstone brooch', journal: 'You bought a gemstone brooch from the goldsmith.', notice: 'Faceted stones set in worked silver.', cost: 7, once: true, stats: { looks: 2 } },
  { id: 'silver-ring', shopId: 'jeweler', text: 'Silver ring', journal: 'You bought a silver ring.', notice: 'It catches the light.', cost: 8, ring: true },
  { id: 'jewel-pocketwatch', shopId: 'jeweler', text: 'Gold pocket watch', journal: 'You bought a gold pocket watch from the goldsmith.', notice: 'Swiss escapement ticking behind an engraved case.', cost: 12, once: true, minAge: 14, stats: { looks: 2, smarts: 1 } },
  { id: 'jewel-pearls', shopId: 'jeweler', text: 'String of pearls', journal: 'You bought a string of pearls from the goldsmith.', notice: 'Lustrous matched pearls on silk thread.', cost: 16, once: true, stats: { looks: 4, happiness: 2 }, tastes: { love: ['noble', 'merchant'] } },
  { id: 'gold-ring', shopId: 'jeweler', text: 'Gold ring', journal: 'You bought a gold ring.', notice: 'Heavy, and worth every coin.', cost: 20, ring: true },
  { id: 'jewel-diamond', shopId: 'jeweler', text: 'Diamond ring', journal: 'You bought a diamond ring from the goldsmith.', notice: 'Brilliant cut gemstone that catches every glance.', cost: 45, ring: true, stats: { looks: 3, happiness: 4 } },

  // issued, never sold
  { id: 'service-rifle', shopId: 'army', text: 'Service rifle', journal: 'You were issued a rifle.', notice: 'Oiled, numbered, yours.', cost: 0 },
  { id: 'army-rations', shopId: 'army', text: 'Army rations', journal: 'You drew your ration packs.', notice: 'Hard tack, salt pork, and tea.', cost: 0, sates: 30 },
];
