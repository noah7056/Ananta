# Ananta — agent instructions

## UI text rule (standing order from the project owner)

Never add explanatory, helper, marketing, or flavor text to the interface
unless explicitly requested. Keep all interface text minimal and purely
functional.

Concretely, do NOT add:

- subtitles, taglines, or descriptive blurbs under titles
- tooltips (`title` attributes) or inline hints
- choice `hint` lines — the `hint` field exists in event data but must not
  be rendered unless explicitly requested
- browser / storage / save notes ("kept in this browser", entry counts, etc.)
- empty-state quips, instructional asides, or philosophical closing lines

Keep ONLY: screen/section titles, buttons and inputs, stat labels and values,
character facts (name, age, place, family), event titles and
descriptions, choice texts, outcome results, journal entries, and epitaphs.
Nothing else belongs in the app, and nothing belongs in the data that
only feeds it: `Era` and `Place` carry no `tagline` or `description`,
because nothing renders them.
The calendar year is backend-only (era selection, log dating) — never
render it in the header or the death screen. Journal Age headers carry
it next to the age (`Age 12 · 1340`).
Journal entries are short narrative sentences in second person — one
`journal` line per effect (`{member}` `{place}` for the rest); outcome
prose stays popup-only, with no mood or scene-setting sentences. Quiet
years log one plain line, and same-age entries share one Age header.

This applies to every screen: creation, game, journal, death.

## Extension points (for future features)

- New era: extend `EraId` in `src/types/index.ts`, add a `*_PLACES`
  list plus one row in `ERAS` in `src/data/eras.ts` (`startYear`,
  `places`, `moneySymbol` / `moneyScale`, `lifeExpectancy`,
  `declineRate`), and add
  name pools in `src/data/names.ts` (gendered first pools per birthplace).
  Eras are named for a **period**, never a country — each holds many
  places from different countries, and a country may exist in one era and
  not another. Currency is per-place first: `moneySymbolOf(character)`
  reads `Place.moneySymbol` and falls back to the era's, so Florence can
  use florins inside a medieval world whose default is a plain `M`.
  Every era must be added to `SCHOOLS`/`JOBS` (career.ts), `OCCUPATIONS`
  (family.ts), `TEACHERS`/`CLASS_SIZES` (classroom.ts), and the pet,
  partner and friend tables (contacts.ts) — the harness in
  README's design notes checks these.
- New birthplace: add one line to the era's `*_PLACES` list in
  `src/data/eras.ts` under its country block — `city(id, country, town)`
  for towns, `region(id, country, full name)` for regions — creation
  renders it automatically in the country picker, then the searchable
  city list. Per-era occupations live in `src/engine/family.ts`.
- New event: append to the right file under `src/data/events/` —
  `common.ts` (anything anywhere, grouped by age), `era.ts` (gated on
  `eras`), or `place.ts` (gated on `places`). `index.ts` composes them
  into `EVENTS`. Money is authored in base units (`money` field, scaled
  by era). Costs never take under-18s below zero — minors spend only
  what they have. Flag gates are used by family events; stat gates work but no
  event uses them yet. `requiresBoss` gates on holding a post with a
  boss on the roster, and `{boss}` names them in any text. Effects can
  also move `performance` (the school/work bar).
  **Nothing may repeat forever.** A repeatable event needs
  `maxPerLife` (3 is the house default, applied to every
  `oncePerLife: false`), and `isEligible` counts occurrences in
  `seenEventIds` — which is why `stageEvent` appends the id every time
  rather than de-duplicating it. Add breadth, not longevity.
- New ailment: add to the catalog in `src/data/ailments.ts` (`drain`,
  `cureCost` base units); inflict via `ChoiceEffect.addAilments` (self) or
  `memberAilments` (involved member, needs `involves: 'family-member'`).
  `{member}` renders a kinship reference (`your mother`, `your sibling Ed`)
  via `kinshipRef` in `src/engine/family.ts`.
  Only your own are curable, one at a time through the doctor in Actions
  (dropdown when several). Hidden instances are revealed by checkups;
  household ones can spread yearly.
- New school or job tier: append to `SCHOOLS` / `JOBS` in
  `src/data/career.ts` (age bands for schools, `smartsRequired` +
  `wage` + `position` for jobs). Schools are primary / middle / high in
  every era. Schooling is never cut short — `workStartAge` is a hard
  floor below which no tier can be held. The career track lives in
  `src/engine/career.ts`: enrol at 6, step up a school, graduate (each
  announced in its own popup), then offers → interview → work. The
  offer/interview chain is driven by `jobFlowStep` in the store and the
  questions live in `src/data/interviews.ts` (three sane answers plus
  one absurd, spliced in at random). Study more / Work more are
  never disabled: `studyCap` / `shiftCap` decide how many sessions a
  year actually pay out, and going past the cap only costs health.
  Girls' access is historical (`schoolAtFor` in `src/data/career.ts`):
  primary only in ancient-world and age-of-sail, none in medieval,
  full from industrial on. A blocked girl gets one `No School` notice
  at 6; one who ages out of what school takes leaves (`Left School`),
  she does not graduate.
- New selectable UI (actions menu, relationships): reuse the `Option`
  component in `src/components/Option.tsx` and selection states in
  `src/components/theme.ts` — do not invent new selection styling.
- Popups (events, notices, section content) use the `Modal` shell in
  `src/components/Modal.tsx`; bottom-bar sections open through the
  store's `openSection` with content in `SectionModal.tsx`. No × anywhere:
  menus and lists close by clicking off; only popups that take action
  (doctor, destructive confirms) end with a Nevermind button. Action
  popups pair a title with one line of context; transient results
  (checkups, cures) use titled `FeedbackModal`s, no buttons, click-off
  to close.
- New interaction: add a row to `CIRCLE_ACTIONS` in `src/engine/bonds.ts`
  and list its key in `actionsFor` (button `text`, `bond` delta,
  era-scaled `cost`, `stats`, one `journal` line using `{name}`, one
  `notice` line; `endsIt` removes them, `asksForAmount` opens the
  amount slider). One table serves the whole Circle — family, friends,
  partners and animals all read from it; what differs is the wording,
  via `schoolVariants` for a classmate and `petVariants` for an animal.
  Relatives use the people set via `interactFamily`. A bond at 0
  removes them and costs happiness. Free company (`cost: 0`) stays
  available in debt — only handing over coin asks for coin.
- Flirting is not a `CIRCLE_ACTIONS` row — its outcome depends on both
  parties, so it is a store action (`flirt`) with its own button in the
  contact detail. Who it shows for is `canFlirtWith` in
  `src/engine/contacts.ts`: friends and partners only, school age and
  up, children only with children, opposite sex only before industry,
  your attraction after. Who you are (`orientation`, settable from 6
  in any period) and what you are (`gender`, settable from 6 once
  industry arrives) live in the Actions menu's Identity view. New
  contacts roll `orientation` at meeting; partners arrive matched to
  yours. A partner is always glad; a friend depends on their own tastes
  (bisexual is a coin flip), and even then closeness decides whether it
  lands (35% plus bond/200, capped at 90%), ±20–40 bond scaled by
  closeness, once per person per year (`flirtedThisYear`, refilled in
  `careerStep`).
- Asking out (`askOut`, same pool as flirting but 10+, friends only,
  once per person per year in `askedOutThisYear`) turns a yes into a
  lover (`kind: 'partner'`, shown in the Circle's Lovers section). The
  odds are closeness plus a bonus for having flirted this year, 5% when
  they are not into you; a no costs 30 bond with a 10% chance of ending
  it on the spot. Asking opens a confirmation first (their orientation,
  sex and `contactStats`, which are hashed off the id so they never
  shift and need no storing); Nevermind backs out. There is only ever
  one lover: asking someone new
  ends what you had, and so does a new partner arriving through an
  event (`applyFx`), both journaled. Answers and fallout queue as
  popups (`infoEvent`: answer, then leaving, then each breakup), and
  flirt jealousy queues behind the flirt notice (promoted by
  `dismissNotice`, which spends `pending` when no event is open).
- Lover's decisions run through `loverFlowStep` in
  `src/engine/contacts.ts` (`leaveEvent`/`begsEvent` build the
  popups), staged like the job chain so outcomes queue behind. A lover
  at nothing from your doing gets a Leaving popup (let them go, or beg:
  10% redemption the first time, 3% the second, never after, tracked on
  `begs`). Breaking up (`breakUp`, partners only) is direct unless they
  beg (25%), in which case you choose to go through or back down.
  Dating (`takeDate`, partners only) reuses the walk chooser (places
  and lengths); refusal odds fall as the bond climbs past 30, the boost
  scales with length, it costs nothing, and it keeps its own yearly
  allowance (`datedThisYear`) so flirting first never blocks the date.
- Houses (`src/data/houses.ts` per-era rungs room → estate, base-unit
  costs; `src/engine/houses.ts` owns the gates): you live with family
  (or lodgings) until you buy at 18+ through the Home block on top of
  Belongings (`HomeBlock` + market list→detail→Buy, one home ever, no
  selling yet). Rich houses (`familyWealth` ≥ 85) may buy a homeless
  adult a cottage yearly (~8%). Asking someone in (`inviteHome`, own
  button in contact/family detail, once per person per year in
  `invitedThisYear`) rolls `inviteChance`; each other adult resident
  rolls `welcomeChance`, objectors lose 8 bond and move out at nothing
  (contacts also leave the Circle via `partingLine`). A married spouse
  kept out asks yearly (`spouseAskEvent`, staged like the job chain,
  outcomes in `homeFlowStep`): invite moves them in (+10 bond), refuse
  costs 15 bond and winds the divorce clock (5% × `moveInRefusals`,
  tracked on the contact). Reads go through `residentsOf` (only the
  living resolve); `sweepResidents` drops the dead and gone — call it
  wherever the Circle shrinks outside ageUp; ageUp sweeps on its own.
  Pets move in through `takeInPet` (one button per animal in the Home
  block): attached kin may ask to keep them (`petKeepEvent`, Nevermind
  leaves them, Take it anyway moves them with a coin-flip bond hit —
  character, never wealth). Groups move through `inviteFamily`
  (`parents` / `siblings` (16+) / `all`: per-person rolls and yearly marks, one objection
  round); parents arriving without young siblings stage `sibsBringEvent`
  (bring them, or leave them at −8 bond all round). Anyone may also ask
  in yearly (`askedEvent`: lovers, then kin, then friends, at most one
  staged a year, outcomes in `homeFlowStep`). Buying never moves you in
  (`movedIn` starts false; `moveIn` leaves the family home at −5 bond a
  parent, `moveOut` leaves the house standing). Invites and asks need
  you living there. The house view (`HouseBody`) shows worth and tax,
  a roster (`MatesBody`, bond bars like a class list), Sell (slider
  50–150% of value, `sellChance`: under crowds in, over walks away)
  and Rent. Tax is 2% of value yearly in every period (`TAX_RATE`):
  pay from the view, or the collector stages `home-tax` the year after
  (pay even into debt, or refuse at ×1.5 owed and −5 reputation).
  Tenants (`findTenant` stages a viewing at your price, 3 a year in
  `viewingsThisYear`; `openRent` lists at your price for yearly
  strangers): acceptance rolls `tenantAcceptChance` on their `wealth`,
  they pay yearly in `ageUp` (misses journal at −5 bond), and read as
  `your tenant` residents. Further houses are `rentals` on the
  character (same shape minus living there): the market's later buys
  land there, `moveIn` converts either way when homeless, everything
  else (tax, viewings, tenants, sale) runs per property. Tenants arrive
  singly or in groups (`makeTenantGroup`: leaseholder carries the
  rent, companions ride `group`). Rented views (`HouseBody` tenants
  section) kick out (`evictTenant`: −10 bond, free with `cause`) and
  change the rent (`setRentPrice`: stays grumble at −3, leavers vacate
  at −8). Let roofs roll yearly doings (`TENANT_EVENTS` in
  `src/data/tenants.ts`, era-gated, choice outcomes in `tenantFlow`,
  notices pre-applied via `applyTenantNotice`); every let roof queues
  its own.
- Children (`src/engine/children.ts`, `Child`/`Pregnancy` on the
  character): `makeLove` (partners only, both 14+, once per lover per
  year in `intimateThisYear`, refilled in `careerStep`) rolls
  `CONCEPTION_CHANCE` when a carrier exists (`carrierOf`: her body +
  his, either way round). Conception stages `pregnancyDecisionEvent`
  at once — keep sets `pregnancy` (birth at `dueAge`, next year) via
  `pregnancyFlowStep`, end clears it with a reputation hit; in ancient
  and medieval a wife carrying a husband's child is not asked (choiceless
  notice, pregnancy set directly). Birth (`birthChild`: era pools for
  the first name, father's surname except today, which takes yours)
  pays happiness and reputation; a gone other parent who carried means
  loss. Yearly keep (`upkeepBase`, 2/3 base units) is split with a
  present other parent by their `wealth` (rolled once at meeting by
  `rollPartnerWealth`, backfilled on old saves); minors pay only what
  they have. Young children (4–14) ask for sweets some years
  (`childAskEvent`, `childFlowStep` moves their bond, floored at 10 —
  children never disown over a sweet). They drift via `driftChildren`
  (same floor), roll in `mortalityStep` like family, and at 18 leave as
  friends when the bond holds (else gone). Detail view is `ChildBody`
  with one Spend time action (`interactChild`) and a two-field rename
  (`nameChild`); keep store guards and `canMakeLove` in sync like the
  other Circle gates.
- Sick children (`ownerId` set to the child id) catch flu, stomach and
  cough yearly under 10 (`sickInfos` queue a notice like deaths do) and
  shake curable ones off at 40% a year. The doctor treats them through
  the same `cureAilment(id, ownerId)` with child wording and +4 bond;
  `ChildCureBlock` lists each sick child's curable ailments. Stray
  ailments (owner dead, left or grown) are dropped by
  `dropStrayAilments` — call it wherever the Circle shrinks outside
  ageUp; ageUp sweeps on its own.
- A child's ask names a real shop item (`askableItems`: cheap, small,
  on a shelf here and now; sweet fallback when the shelves hold
  nothing). The fetch choice stages `pendingChildShop` through
  `choice.openShop` exactly like `pendingBook`, and the section modal
  deep-links onto the right shop and aisle (`initialAisle`). `takeShop`
  on the requested item pays the till then hands it straight to the
  child: no belongings entry, bond and happiness through the usual
  gift reaction (`giftReaction` with the `child` trade), journal and
  notice as usual, errand cleared.
- Infancy: `src/engine/infancy.ts` owns the gates. `FAMILY_AGE` (3) is
  when relatives become reachable at all; `INFANT_AGE` (6) is when
  money, words and your own doctor arrive. Locked-out rows render
  disabled rather than disappearing, matching the Career button.
  Sick infants are cured passively by
  `parentalCare` (70% a year), which journals it. Keep UI hiding and
  store guards in sync: the store returns early for `!canActSocially`.
- New relationship subject: relatives already carry `bond` /
  `yearsKnown` on `FamilyMember`, generated with it and drifted by
  `driftFamily`. Keep bonds as fractions — `clampBond` must not round,
  or the slow yearly fade rounds back to where it started.
- Activities are rows in `ACTIVITIES` (`src/data/activities.ts`); the
  Actions menu groups them Mind / Body from `group`. `cost` is base
  units scaled by the era, and `paidAfterSchool` makes it free until
  `workStartAge`. `progressRate` is skill-bar fill speed for the
  trainable ones (`TRAINABLE` — those carry a 0–100 bar fed by a
  hidden `skillAptitude` rolled at birth, so what comes naturally is
  discovered by playing, not chosen). Repeat use wears the habit
  (`activityHeat`, `wearHabit`); ignore it `COOLDOWN_YEARS` and it
  comes back. Voice and modelling lessons go on the parents' coin
  while too young to pay (`needsParentPayer` in `src/engine/activities.ts`:
  a parent picks up the bill on `pocketMoneyChance` × wealth odds, a
  refusal costs happiness and a little bond). At war the menu holds
  only walks, quiet sitting and the doctor (`availableActivities`
  filters to `walk`/`meditate` when serving; shops, licence and
  identity hide too).
- Walks are their own little system: clicking the walk row opens a
  chooser (length + destination dropdowns) rather than firing at
  once. `src/data/walks.ts` holds `WALK_DURATIONS` (stat scale, habit
  wear, encounter odds), `WALK_PLACES` (gated by `eras` and `places`)
  and `WALK_EVENTS`, each listing the destinations it can happen at
  with 2+ choices whose effects run through `ChoiceEffect` as usual.
  `pickWalkEvent` weights and caps them per life
  (`WALK_EVENT_MAX`); `takeWalk` in the store stages the encounter
  through `stageEvent`, so a walk can end in the ordinary popup flow.
  A quiet walk returns a notice, not a popup.
- Salon works the same way: the `salon` activity row opens a chooser
  instead of firing. `src/data/salon.ts` holds the services (`cost`
  base units, `stats`, `minAge`, gated by `eras`); `salonsFor` in
  `src/engine/salon.ts` filters by age and period, and `takeSalon`
  runs the session through the ordinary habit fatigue under its own
  heat key.
- Books are rows in `BOOKS` (`src/data/books.ts`): `title`, `genre`,
  `pages` (real count; the reader turns one per click), `smarts`
  gained on finishing, gated by `fromEra` (later eras inherit earlier
  books, never the reverse), optional `year` (calendar year it appears
  from), and `minAge` / `maxAge`. `availableBooks` in
  `src/engine/books.ts` draws a fresh shelf of `BOOKS_PER_SHELF` on
  every opening. The library row opens the shelf instead of firing at
  once; finishing calls `finishBook` in the store, which pays the
  book's smarts through the library's fatigue like any activity. A
  `year` on a book also generates a one-time announcement
  (`src/data/events/publications.ts`, no hand-writing): the yearly
  loop gives it the year's slot when the year comes round, one book
  picked at random on ties. Its Read choice carries `openBook`, which
  the store holds as `pendingBook` and the section modal spends by
  landing on the reader.
- History is rows in `HISTORY` (`src/data/history.ts`): `y` (negative
  is BC), `t` headline, `d` a sentence or two, optional `cc` country
  list for niche pieces. Country pieces live in one file per era
  (`history-ancient.ts`, and so on), composed into `HISTORY` in
  `index`-style at the bottom of `history.ts`. They generate notices
  the same way publications do and share the year's slot — one dated
  thing per year, picked at random on ties, gated by `countries` in
  `isEligible` for the country ones. Name the place inline;
  never `{place}`, which would name where the player stands. The news
  reader (`src/engine/news.ts`, `latestNews`) shows the latest year
  with anything in it and every headline in it (country pieces only
  for readers born there); closing it counts as
  reading it (`finishNews`: same gains and fatigue as any activity, no
  popup after).
- New class member: extend `TEACHERS` / `CLASS_SIZES` in
  `src/engine/classroom.ts`. The roster is drawn by `joinClass`, which
  `careerStep` calls on enrolment and on every move up a school — never
  from a React selector, or it is redrawn every render. A school friend
  in the Circle is `SCHOOL_FRIEND_STATUS`: `contactTrade` reads them as
  `a student` until they turn 18, then a trade hashed off their id, and
  `contactAge` keeps them the same age as you.
- New friend, partner or pet: add `meet: { kind, status }` to a choice's
  effects in `src/data/events.ts`. It lands in the Circle list
  (`Character.contacts`), named from the era/place pools or the per-era
  pet list in `src/engine/contacts.ts`. The `status` is where you met
  them; what the list shows is their `trade`, picked once from the
  per-era friend table — so write meeting flavour in `status` freely,
  it never poses as their living. A `chance` on the effect makes only
  the meeting uncertain, never the choice's other effects. The People section is called
  **Circle** because it will hold animals and, later, the dead - keep
  the name broad rather than person-shaped.
- Gigs are rows in `GIGS` (`src/data/gigs.ts`): `text`, `base` pay in
  base units, `minAge`, optional `eras`. The Career menu shows the gig
  option from `GIG_AGE`; `gigsFor` filters by age and period.
  `takeGig` in the store takes a gig id plus a multiple from
  `GIG_MULTIPLES`, rolls `gigChance` (greed and age tilt it), and pays
  `gigPayout` on success. Attempts are capped per year (`gigsThisYear`,
  refilled in `careerStep` like studies and shifts).
- Job hunts run on sectors: every `JobTier` carries a `sector` and
  weekly `hours`. `sectorsFor` lists an era's sectors;
  `jobsInSector` filters to posts old and sharp enough to hold.
  `requestInterview` in the store rolls `huntChance` (money, the
  `schoolRecord` snapshotted at graduation, past jobs and gigs) and on
  success stages the ordinary interview chain for that post, so hunts
  hire through the same popups as offers. Only a staged interview
  spends the year — rejections are free to retry. A no names the weakest leg
  (`huntRejectionReason`) so you know what to fix. Hunts are capped per year
  (`jobHuntsThisYear`, refilled in `careerStep`). New tiers need a
  sector and hours like the rest of the ladder.
- The workplace mirrors the class: `joinCrew` draws a boss plus hands
  on hiring (`afterInterview`), `syncCrew` in `careerStep` keeps the
  roster true to the post (new post, new faces; quitting clears it),
  and befriended coworkers stay listed with a tag like classmates.
  `interactCrew` / `befriendCrew` work the same way (befriending keeps
  their role as `trade`). Asking the boss (`askRaise` / `askPromotion`,
  once each per year in `bossAskedThisYear`) rolls on standing plus the
  boss's bond: a raise pays a quarter more, a promotion climbs like an
  earned one, and a failed promotion backfires into a pay cut — or a
  demotion when standing is poor.
- War (`src/engine/wars.ts`, `serving` holds the war id): the draft
  takes men of fighting age year by year; serving shelves school, work
  and belongings for a rifle, and coming home restores them. Service
  counts as a post for the crew (`joinUnit` draws a general plus hands
  on enlisting, `syncCrew` holds them till home, `crewOf` reads them) —
  the unit lives in the army list, never the Circle (`befriendCrew` and
  boss asks refuse while serving, and old saves muster out of the
  Circle on load). Career offers and enrolment never fire while
  serving, and the menu shows only the service and its Unit. The Circle
  stays visible but every reach fails with Too far; walks go only to
  the camp and the front line (`atWar` places, quiet always). Food
  falls as usual and rations (+35 satiety) land after.
- Crime & punishment (`src/engine/crime.ts`, `sentence`/`offences` on the character): crime events (theft, burglary, smuggling, duels) stage through `commitCrime`, which rolls success or capture. The first catch is a warning — a fine, a `first-offence` flag. After that, `crimeFlowStep` sets `sentence` (years inside, shelving work and school like war) and grows `offences`. `prisonYear` runs the sentence in `ageUp`; coming out restores the life. The record has teeth: `huntChance` and `huntRejectionReason` read it, `canAskOut` closes to repeat offenders. Debt collects when you cannot pay — `debtCollectEvent` stages the collectors, who take what you have and your standing suffers.
- Character flags are collected in state but not displayed (header Marks
  removed as noise until gates make them meaningful).
