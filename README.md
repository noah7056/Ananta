# 🐍 Ananta — Live Infinite Lives

An open-source, **data-driven** life simulation game inspired by BitLife — but bigger.
Live complete lives from birth to death across historical eras, places and identities.

> MVP demo: Vite + React + TypeScript + Tailwind + Zustand. No backend. Saves to localStorage.

## Quick start

```bash
npm install
npm run dev     # play at http://localhost:5173
npm run build   # typecheck + production build
npm run preview # preview the production build
```

Requires Node 18+.

## How it plays

1. **Begin a life** — pick a birth year to land in a period (Ancient
   World, Middle Ages, Age of Sail, Industrial, Atomic, Modern Day), then
   pick a country and search its cities for somewhere to be born — Rome,
   Toledo, Osaka, Detroit, Lagos, and a hundred more that existed then.
   Tune your stats and funds, or randomize everything. A household
   (parents, siblings) and birth date are drawn automatically.
2. **Age up year by year** — press + in the bottom bar. Each year brings
   either a quiet year or an event popup (a choice to make or
   a notice to acknowledge).
   The bar also holds Circle, Actions, Belongings and Career (unlocks
   at school age).
3. **Studies, then work** — at 6 you enrol at the primary school, then
   middle, then high; graduating lands you a job suited to your smarts.
   Career shows what you're doing, a standing bar, and (once employed)
   your monthly pay. Options: *Study more* while at school, *Work more*
   or *Quit your job* once employed. A hard-worked year can earn a raise.
   Study more and Work more can be pressed any number of times: up to
   the yearly cap they pay out, past it they only cost energy (and a
   little health). Below 45 health or energy the cap drops to one. Jobs come as an offer you can
   refuse, then an interview with four answers — one of them absurd,
   and it ends the interview.
4. **Choices matter** — they move six vitals (Health, Happiness, Smarts,
   Looks, Energy, Reputation), shift
   your **funds** (era currency, separate from vitals), and set **flags**
   that unlock or block future events.
5. **Mind and body** — the Actions menu groups activities under *Mind* and
   *Body*. Each activity costs money (era-scaled) and raises one or more
   vitals. Repeating the same activity in consecutive years yields less
   and less — effectiveness drops to 45% each year you lean on it. Leave
   it alone for three years and it resets to full. Rotation beats
   repetition. Era-specific wording resolves per period (a medieval walk
   is "Walk the lane", a modern one is "Take a walk").
6. **Yearly decay** — vitals drift down every year whether you act or not.
   The grind is slow in modern times and harsh in the ancient world.
   Fractional losses carry over year to year, so a 0.34/yr health decay
   still costs you a point every few years. Young bodies (< 25) recover
   a little of what the year takes.
7. **Die** — health collapse and old age catch everyone eventually. You get an
   epitaph, final vitals and remembered moments, then the serpent turns:
   be reborn.

## Project structure

```
src/
  types/          Character, LifeEvent, Choice, Era, Stats…
  data/
    eras.ts       Era definitions (places, currency, lifespan)
    career.ts     Per-era school + job ladders, wages, `SCHOOL_START_AGE`
    interviews.ts Job interview questions (3 sane answers + 1 absurd)
    activities.ts Mind/Body activity definitions (group, cost, effects, era wording)
    gigs.ts        Small paid jobs (name, fair pay, age/era gates)
    salon.ts       Body care: treatments, prices, age/era gates
    events/      The catalog, split by scope — add yours here:
      common.ts  anywhere, grouped by age of life (ADD YOURS HERE)
      era.ts     gated on `eras`, one period at a time
      place.ts   gated on `places`, one birthplace at a time
      index.ts   composes them into `EVENTS`
    names.ts      Name pools + randomizer
  engine/
    eventEngine.ts  isEligible / eligibleEvents / pickEvent / renderText
    life.ts         yearlyDrift / deathRoll / quietLine / epitaph
    career.ts       careerStep / jobFlow inputs / jobWage / schoolName
    contacts.ts    contacts: makeContact / age / trade / bond drift & loss
    infancy.ts     infant gates + parentalCare (parents see the doctor)
    classroom.ts   your class: roster per school, joinClass / classOf
    bonds.ts       interactions: variants, actionsFor, gift/name openers
    activities.ts  fatigue/cooldown: stepMultiplier, availableActivities, sessionGain
    walks.ts       destinations, durations and encounters: walkPlacesFor / pickWalkEvent
    books.ts       the shelf: titles, genres, page counts, era/age gates
    gigs.ts        gig odds and pay: gigChance / gigPayout / gigsFor
    salon.ts       pampering: salonsFor (age/period filter)
    decay.ts        yearlyDecay / yearlyRecovery / applyYearlyChange (fractional carry)
  store/
    gameStore.ts  Zustand store: newLife / ageUp / choose + localStorage save
  components/
    StartScreen.tsx  character creation (era → birthplace → identity → stats)
    GameScreen.tsx   header + vitals + journal feed + bottom action bar
    Modal.tsx        generic popup shell (no ×; Nevermind or click-off to close)
    FeedbackModal.tsx  titled transient result popup (no buttons, click-off closes)
    EventModal.tsx   yearly event popup + choice buttons + outcome
    SectionModal.tsx bottom-bar sections (Circle, Actions, Doctor, Career)
    ActionBar.tsx    Age (+) plus section buttons, Career age-gated
    StatBar.tsx      stat bars + funds row
    Journal.tsx      chronological life feed (oldest first, pinned to latest)
    DeathScreen.tsx  end-of-life summary + rebirth
    Option.tsx     reusable selectable row (creation today, action menus next)
    theme.ts       shared palette: panels, buttons, inputs, selection states
  App.tsx  phase router (start → playing → dead)
```

## Adding content (no engine changes needed)

**New event** — append to the right file under `src/data/events/`
(`common.ts` for anywhere, `era.ts` for a period, `place.ts` for a
birthplace):

```ts
{
  id: 'my-event',
  title: 'Something happens',
  description: '{name} faces trouble in {place} in {year}.', // {name} {place} {year} {age} {member}
  category: 'opportunity',          // childhood | youth | adult | fate | opportunity | peril | family | illness
  conditions: {
    eras: ['modern-day'],           // omit = all eras
    minAge: 16, maxAge: 30,
    requiredFlags: ['creator'],    // optional
    excludedFlags: ['in-debt'],    // optional
    // minStats / maxStats also supported, e.g. minStats: { money: { min: 40 } }
    oncePerLife: true,              // default true
    maxPerLife: 3,                  // with oncePerLife:false — house default
  },
  weight: 2,                        // 1 = rare, 3 = common
  effects: { ... },                // optional onset effects, applied on appearance
  involves: 'family-member',       // optional: templates a random {member}
  choices: [
    {
      id: 'brave',
      text: 'Do the brave thing',
      hint: 'Risky but glorious',
      effects: {
        stats: { happiness: 8, health: -4 },
        money: 5,   // base units × era moneyScale
        addFlags: ['hero'],
        addAilments: ['flu'],        // lasting sickness (self)
        memberAilments: ['flu'],     // lasting sickness (involved member)
        result: '{name} becomes a legend in {place}.',
        journal: 'You did the brave thing.',   // one journal sentence
      },
    },
    // …2–4 choices, or [] for a notice popup (onset effects only)
  ],
}
```

**New era** — extend the `EraId` union in `src/types/index.ts`, then append
to `ERAS` in `src/data/eras.ts` with its own `startYear`, `places`
(`lifespanMod` optional, ± years), `moneySymbol` / `moneyScale`
(currency), `lifeExpectancy` (typical lifespan) and `declineRate`
(age-decline harshness). Birthplaces render automatically from the
selected era, and events with `eras: [...]` keep working; universal
events flow into the new era automatically. Add matching name pools in
`src/data/names.ts` (per birthplace, with a per-era fallback).

## Design notes

- **Vitals are 0–100** (Health, Happiness, Smarts, Looks, Energy,
  Reputation), clamped after every change. Editable at creation (5–95).
  Energy is the short-term body budget: exertion (extra shifts, gigs,
  long walks, late study) spends it, rest restores it, and exhaustion
  halves what activities pay. Reputation is slow social standing:
  witnessed kindness and boldness raise it, cruelty and begging lower
  it, and it fades toward obscurity (50) unless renewed. Death still
  answers to health alone.
- **Currency is per-place**: `moneySymbolOf` reads `Place.moneySymbol`
  and falls back to the era's, so one era holds several coins — medieval
  England `d`, Florence `ƒ`, Novgorod a plain `M`; London `£`, Detroit
  `$`, Delhi `R`, Tokyo `¥`, Bengaluru `₹`, Lagos `₦`. Each birthplace
  carries its historical coin where one exists to show — denarii `d`
  across Rome, drachmae across the Greek east, cash in China and Japan,
  ducats in Venice, bezants in Constantinople, guilders, livres,
  lire, pesetas, kroner, rubles and rand in their centuries — and a
  plain `M` where none does. Places that did
  not exist in a period are simply not offered in it.
- **Every era must be complete**: names (per place, then per era), job
  and school ladders, occupations, teachers, class size, pets, partners
  and trades all carry an entry per era. A missing one falls through to
  another era's data, which is almost always wrong.
- **Funds are separate currency**, unbounded, may go negative (debt).
  Debt locks nothing free: company, walks and lessons without a price
  stay open, only paying asks for coin. Event `money` is authored in
  base units and multiplied by the era's
  `moneyScale`; the job wage in `career.ts` is scaled the same way and
  rises 25% per raise. Under-18s never go below zero — minors spend
  only what they have.
- **Career** is a yearly step in `engine/career.ts`: primary → middle →
  high school (each move announced in its own popup) → graduation → job
  offers → an interview → work → a roll for a raise each year you worked
  hard. Offers always start at the bottom rung; climbing is by
  promotion, and sharp hires climb fast. Standing (0–100) slips 3 a year and is pushed up by Study / Work
  harder. Career events queue behind the random event in the store's
  `pending`, and the job application chains its own popups through
  `jobFlowStep`. The career popup shows the field you work in, your title,
  monthly pay and weekly hours,
  and while at school a *Class* button opens your classmates.
  Standing drifts down 6 a year and starts each new stage near nothing
  (`NEW_POST_STANDING`), so a promotion puts you back at the bottom of
  a new post and a wage bump costs you half of what you had. Raises
  also need tenure (`jobYears`): the odds scale up over the first four
  years in a post, so it is never an annual event.
  Schooling is never cut short — `workStartAge` is a hard floor below
  which no job tier can be held.
   `STUDIES_PER_YEAR` caps Study's smarts gain per year; the button
   disables once spent and the allowance refills on each ageUp.
- **Career menu** — Current occupation (the school or job, opening the
  detail view with Study / Work more, Quit and Class) plus, from 15 on,
  Find a gig, and after graduation, Look for a job.
- **Gigs** (`src/data/gigs.ts`, `src/engine/gigs.ts`) are small paid
  jobs unlocked through the school years — errands and carrying loads
  anywhere, water-carrying and scroll-copying in the ancient world,
  stables and firewood in the middle ages, decks and nets under sail,
  sweeping and parcels in the industrial age, papers and lawns in the
  atomic age, dogs and groceries today; everything open by graduation.
  Pick one, name the pay (half to triple the fair rate), and send it:
  fair asks land most years, greed and youth and old age tilt the odds
  down. Two attempts a year.
- **Job hunting** — after graduation the Career menu offers a hunt
  through hiring sectors (the legion, the state and the market in the
  ancient world; craft, trade and guild in the middle ages; trade, sea
  and docks under sail; mill, office and rail in the industrial age;
  office and operations in the atomic age; administration, consulting
  and management today). Each sector lists the posts you are old and
  sharp enough to hold, with monthly pay and weekly hours. Asking for
  an interview is not free: employers weigh your money, your school
  record and your past jobs and gigs, and two asks a year is all you
  get. A yes runs the ordinary interview; a no names the weakest leg,
  so you know whether to study, gather experience, or get established.
  Only landed interviews spend the year — rejections are free to retry.
  Random offers only ever come while you hold no job.
- **Workplace** — Career → *Workplace* opens the boss and the hands
  around you, drawn on hiring and true to the post (a new post means
  new faces). Spend time on anyone in it or *Be friends* (they stay
  listed, tagged, like classmates). Ask the boss for a raise (a quarter
  more monthly, likelier standing well with them) or a promotion
  (climbs like an earned one, but likelier to fail — and failure bites
  back as a pay cut, or a demotion when your standing is poor). The boss
  may also ask for overtime nights by name: work them and feel it for
  days, refuse and watch your standing slip.
- **New school or job tier** — append to `SCHOOLS` / `JOBS` in
  `src/data/career.ts`. `smartsRequired` is what a raise needs to
  promote you into the tier. New interviews go in
  `src/data/interviews.ts` — three sane answers plus the absurd one,
  which is spliced into the four options at random and fails the
  interview.
- **War** — drafted men serve year by year; serving shelves school,
  work and belongings for a rifle, and coming home restores them. At
  war the Actions menu holds only walks, quiet sitting and the doctor;
  Career shows only the service and its Unit (a general and soldiers,
  never in the Circle); walks go only to the camp and the front line;
  no job offers come. The Circle stays visible but every reach fails —
  you are too far from them. Food falls as usual and army rations land
  after.
- The calendar year is backend-only: it picks the era and dates the
  log, and is never shown in the UI (header, journal, death screen).
- **Circle** (the old People section) lists the birth household, then
  friends, then pets. A choice's `meet: { kind, status }` adds a friend,
  partner or pet — names come from the era/place pools, pets from a
  per-era list. Each has an age that moves with yours, a profession
  drawn once from the per-era friend table (what the list shows — never
  where you met them), and a **bond** (0–100) shown as a bar. A school
  friend reads as a student until 18 and works somewhere after.
  Relatives carry bonds too, so every row in the list opens a detail view.
- **Flirting** — friends and partners get a Flirt button when they are
  your kind of person: school-age children with each other, grown
  people with each other, the opposite sex before industry, whoever
  your attraction allows after. Your attraction is yours to set from
  childhood in the Actions menu, and from industry so is your sex. A
  partner is always glad to hear it; a friend answers according to
  their own tastes, and a bad mismatch can end the friendship. Once
  per person per year.
- **Lovers** — a separate Circle section, and only ever one of them.
  Ask a friend out (10 and up) and a yes makes them yours; asking shows
  you their orientation, sex and stats first, so you can back out.
  Flirting first helps, closeness helps more, and someone not into you
  almost always says no. A no costs the friendship dearly and can end
  it, each turn of it with its own popup. Flirting around while taken
  can get back to your lover, and asking someone new ends what you had.
  A lover at nothing from your doing
  gets a say: let them go, or beg (rarely works twice). You can end it
  yourself too, though they may beg you to stay. Taking a lover out —
  pick where and how grand, free — mends things a lot, unless they refuse
  to come.
- **Children** — lie with a lover (14 and up, once per lover per year)
  and a child may come of it, when her body and his allow. You decide
  whether to keep it — except in the ancient world and middle ages,
  where a wife carrying her husband's child is not asked. Birth comes
  the next year: era names, the father's surname (yours, today), and a
  naming view for first and last. Children cost their keep every year,
    split with a present other parent by their means; young ones ask for
  sweets, and how you answer moves them; at 18 the close ones stay on
  as friends. They sicken and die like everyone else. Sick children are
  announced and treated at the doctor like you are, one cure at a time.
  A child's ask names something really on the shelves: fetching it
  opens the right shop on the right shelf, and buying it hands it
  straight to them, with their reaction to follow.- **Salon & spa** (`src/data/salon.ts`) — one body-care menu whose
  chairs change with the period: oil massages and depilation in Rome,
  barber-surgeons and herbal baths in the middle ages, powdered wigs
  under sail, hot-towel shaves in the industrial age, manicures and sun
  lamps in the atomic age, and the full modern list (nails, spray tans,
  tanning beds, four waxes up to the very expensive brazilian).
  Massages from childhood, the rest from high school, the dearest
  chairs after studies. Same habit fatigue as everything else.
- **Bonds** drift down 0.5 a year for both contacts and relatives
  (`driftBonds` / `driftFamily`) and move with interactions
  (`CIRCLE_ACTIONS`). One table serves the whole Circle; only the
  wording differs (`schoolVariants` for a classmate, `petVariants` for
  an animal). Money opens a slider sized to your funds rather than firing
  straight away, and animals can be given a name of your own. Each
  action carries several wordings (`variants`) picked at random, so the
  same button never reads twice the same way, plus `schoolVariants` for
  when the other party is a classmate — nobody is kept company at their
  trade at seven. A bond that reaches 0 —
  by neglect or by insult — means they leave: a journal line
  and a happiness hit scaled by how close it was and how long you had
  known them. Neglect alone is enough; nobody waits to be pushed out.
- **Infancy** (`engine/infancy.ts`): family is reachable from 3; under
  6 you can only spend time with people and Actions has no doctor (the
  bar greys out). A sick infant is taken to one by their parents 70% a
  year, cured passively and journaled. As a child you can *Ask for
  pocket money* from any relative old enough to have some — the odds
  scale with your bond, from nothing at 25 up to 78% at 95. Asking
  again the same year is nearly pointless (full → 15% → nothing); a
  parent you are close to forgives the second ask, and the list of
  asks clears each year.
- **Your class** (`engine/classroom.ts`) is drawn on enrolment and on
  every move up a school: a teacher plus a handful of pupils, all your
  age. Career → *Class* opens it; you can spend time on anyone in it
  or *Be friends*, which succeeds on `0.15 + bond/130`. A friend joins
  the Circle but stays listed in the class with a (friends) tag until
  the next school, and stays in the Circle through every later school.
  A school friend is `a student` while young and then works somewhere,
  the trade hashed off their id so it never shifts between visits.
- **Walks** open a chooser: how long (a short walk through all
  afternoon — longer is worth more and tires the habit out faster), and
  where (your neighbourhood and the park anywhere; the forum and the
  harbour in the ancient world; the coffee house and the docks under
  sail; the station and the works in the industrial age; the cinema and
  the dance hall in the atomic age; the shopping centre and the river
  path today; the canal ring in Amsterdam and the Forum Romanum in
  Rome). Longer walks and livelier places meet more along the way —
  21 encounters, each with 2–3 choices that cost or pay money, health
  or happiness. The same encounter never fires twice running, and each
  one is capped at six appearances a life. A walk may also simply be a
  quiet afternoon.
- **Skills**: voice lessons and modelling carry a progress bar fed by
  an aptitude rolled at birth — some people find a note easily and some
  do not, and you only find out which by doing it. The bar fills
  faster the further along you are, and a natural talent reaches the
  top in a fraction of the effort. Working out, voice and modelling cost
  money once education is behind you; voice and modelling before that
  go on a parent's coin, asked for and sometimes refused.
- **The library** shows a shelf of six books, different every time you
  look — histories and philosophy in the ancient world, chronicles and
  romances in the middle ages, voyages under sail, novels and manuals
  in the industrial age,   pictures and atoms in the atomic age,
  textbooks and bestsellers today, and picture books and fables while
  young. Pick one and read it a page at a time; longer books teach
  more. Finishing one pays smarts through the usual fatigue, so the
  third book in a year is worth less than the first. Books with a
  publication year announce themselves when the year comes round —
  read one hot off the press or let it pass you by.
- **History** (`src/data/history.ts`, 617 entries from 800 BC to 2024,
  country pieces in per-era files)
  announces itself the same way: live through the year and the world
  tells you what it did — games at Olympia, Caesar murdered, Hastings,
  the Black Death, the Armada, the Bastille, Waterloo, the Somme, the
  moon landing, the wall coming down. Notices, no decisions; one dated
  thing per year. The ancient world also keeps country pieces — Cannae
  and Carrhae, Boudica and Alesia, the First Emperor and paper — heard
  only by readers born there.
- **News** — the Actions menu carries the papers (criers and gazettes
  in older periods): the front page shows the latest year with anything
  in it, every headline of it when a year holds several. Closing it
  counts as reading it, and pays a little like everything else.
- **Flags** are plain strings (`apprentice`, `has-pet`, `in-debt`…) matched by
  `requiredFlags` / `excludedFlags`. Households set kin flags at birth
  (`has-siblings`, `two-parents`, `single-parent`, `orphan`) for family events.
- **Ailments** live in `src/data/ailments.ts` (`drain`, `cureCost` in base
  units). Illness notices inflict them (known); silent yearly contraction
  and household spread add them hidden. They drain health yearly until
  treated: Actions → doctor offers a paid checkup (reveals hidden ones)
  and cures your own, one at a time (a dropdown when several).
  Household sickness spreads but cannot be treated directly.
- Each year: drift (era-scaled) → career step + job wage → ailment drain
  → death roll → household spread → silent contraction → ~82% chance of
  one weighted eligible event, else a quiet year. A career milestone
  waits behind the random event. Open popups must be resolved before
  ageing again.
- **The event catalog is 132 entries** and every repeatable one is capped
  at 3 appearances in a life, so a long run draws broadly rather than
  seeing the same game of tag forever. Measured over eleven 80-year
  lives across all six eras: 39–53 distinct events each, and nothing
  repeated more than three times.
- **Journal** groups entries by year under one Age · Year header. Entries
  are short narrative sentences in second person — one `journal` line per
  effect (`{member}` `{place}` for the rest); outcome prose stays in the
  popup. Quiet years log one plain line.
- Death curve anchors on the era's `lifeExpectancy` (+ birthplace mod):
  negligible ~20 years early, climbing past the anchor; low health
  amplifies the risk; health ≤ 0 is fatal.
- **Mortality of loved ones** (`engine/mortality.ts`): parents, siblings,
  lovers and pets roll yearly against the era's curve — negligible young,
  steep past life expectancy, harsher in harder times, with child
  mortality in pre-industrial eras and shared risk in plague/famine
  years. Grief scales with the bond like any other loss; dead parents
  leave an inheritance from the house's wealth; orphaned minors in poor
  houses go destitute; a widowed spouse sets a flag. A parent or spouse
  queues one notice popup, the rest are journal lines.
- **Crime & punishment** (`engine/crime.ts`): theft, burglary, smuggling and duels run through the crime engine — commit from an event, and the store rolls success or capture. The first time you are caught it is a warning (a fine, a mark). After that, the record follows: a sentence to the cells (shelving work and school for the stretch, like war), and when you come out employers and lovers' families can see it. Debt collects when you cannot pay — the collectors take what you have and your standing suffers.

## Roadmap ideas

- More eras (Edo Japan, Ancient Rome, Space Colony…) and event packs per era
- Relationships, careers, education & skill systems
- Money as real currency + assets
- Achievements / ribbon endings, life score
- Import/export lives as JSON, seedable RNG

MIT — expand the serpent. 🐍
