import type { LifeEvent } from '../../types';

/**
 * Events tied to a period, gated on `eras`.
 */
export const ERA_EVENTS: LifeEvent[] = [

  // MIDDLE AGES

  {
    id: 'med-monk-alms',
      title: 'A Wandering Monk',
      description: 'A Franciscan friar in coarse robes passes through {place}, begging for crusts of bread in the name of Saint Francis.',
      category: 'opportunity',
      conditions: { minAge: 14, maxAge: 75, eras: ['medieval'], oncePerLife: false, maxPerLife: 3 },
      weight: 1.5,
      choices: [
        {
          id: 'give',
          text: 'Share your bread and a coin',
          effects: { money: -1, journal: 'You shared bread and coin with a traveling friar.', result: 'The friar blesses your home with heartfelt prayers.' },
        },
        {
          id: 'turnaway',
          text: 'Bar your door against vagrants',
          effects: { journal: 'You turned away a traveling friar asking for alms.', result: 'He bows his head in disappointment and wanders down the road.' },
        },
      ]},


  {
    id: 'med-village-maypole',
      title: 'The Spring Maypole',
      description: 'Ribbons are tied around a tall birch pole in {place} as pipes and drums welcome the return of spring.',
      category: 'social',
      conditions: { minAge: 8, maxAge: 30, eras: ['medieval'], oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'dance',
          text: 'Weave ribbons in the lively dance',
          effects: { stats: { happiness: 7 }, journal: 'You danced merrily around the spring maypole.', result: 'Ribbons tangle playfully as music fills the village green.' },
        },
        {
          id: 'watch',
          text: 'Watch modestly from the shade',
          effects: { journal: 'You enjoyed the spring festival from the shade.', result: 'A peaceful afternoon celebrating the thaw of winter.' },
        },
      ]},


  {
    id: 'med-baron-tax',
      title: 'The Lord’s Bailiff',
      description: 'Armed men accompany the feudal lord’s tax collector through {place}, demanding an extraordinary harvest levy.',
      category: 'peril',
      conditions: { minAge: 20, maxAge: 65, eras: ['medieval'], oncePerLife: true },
      weight: 1.5,
      choices: [
        {
          id: 'pay',
          text: 'Pay the heavy levy without resistance',
          effects: { money: -5, journal: 'You paid a heavy feudal levy to the local baron.', result: 'The bailiff marks your name off with cold indifference.' },
        },
        {
          id: 'hide',
          text: 'Conceal half your grain under the floorboards',
          effects: { stats: { smarts: 5 }, journal: 'You outsmarted the feudal bailiff by hiding your grain.', result: 'The guards search hastily and miss your hidden stash completely.' },
        },
      ]},


  {
    id: 'med-blacksmith-bellows',
      title: 'The Village Forge',
      description: 'The master blacksmith in {place} needs a stout youth to work the leather bellows through long days of forging.',
      category: 'work',
      conditions: { minAge: 12, maxAge: 20, eras: ['medieval'], oncePerLife: true },
      weight: 2,
      choices: [
        {
          id: 'forge',
          text: 'Work the hot bellows until your arms swell with muscle',
          effects: { stats: { health: 6 }, money: 3, journal: 'You pumped the forge bellows as a blacksmith’s apprentice.', result: 'Soot stains your brow, but your upper body grows powerful and hardy.' },
        },
        {
          id: 'decline',
          text: 'Stay away from the smoke and sparks',
          effects: { stats: { looks: 3 }, journal: 'You avoided the smoky heat of the village smithy.', result: 'You preserve your skin and lungs from the furnace smoke.' },
        },
      ]},


  {
    id: 'med-plague-cart',
      title: 'The Cart',
      description: 'A cart comes through {place} with a bell at the front, taking the sick away.',
      category: 'illness',
      conditions: { minAge: 6, maxAge: 60, eras: ['medieval'], oncePerLife: false, maxPerLife: 3 },
      weight: 1.2,
      choices: [
        {
          id: 'go',
          text: 'Go with the cart because everyone is going',
          effects: { addAilments: ['stomach'], stats: { happiness: -4 }, journal: 'You went with the sickness cart in {place}.', result: 'Everyone is very calm, which is the worst part.' },
        },
        {
          id: 'bar',
          text: 'Bar the gate and let it pass',
          effects: { stats: { health: 4, happiness: 2 }, journal: 'You barred your gate against the sickness cart.', result: 'The bell goes past. Whether that was wisdom or luck, you will not know.' },
        },
      ]},


  {
    id: 'med-almsgiving',
      title: 'The Alms Box',
      description: 'A mendicant order has come to the gate of {place} with a box, and a crowd behind them.',
      category: 'adult',
      conditions: { minAge: 16, maxAge: 70, eras: ['medieval'], oncePerLife: false, maxPerLife: 3 },
      weight: 1.8,
      choices: [
        {
          id: 'give',
          text: 'Put money in the box',
          effects: { money: -2, stats: { happiness: 4 }, journal: 'You gave alms to a mendicant order in {place}.', result: 'They pray over you by name, and it is oddly moving.' },
        },
        {
          id: 'pass',
          text: 'Let them move on down the street',
          effects: { journal: 'You let the mendicant order pass without giving.', result: 'The box goes on to the next door, and you shut yours.' },
        },
      ]}
,

  // ATOMIC AGE

  {
    id: 'atom-radio-fights',
      title: 'Prizefight on the Radio',
      description: 'Neighbors squeeze into your parlor around the wooden radio cabinet as crackling static broadcasts a championship boxing match.',
      category: 'social',
      conditions: { minAge: 8, maxAge: 75, eras: ['atomic'], oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'cheer',
          text: 'Cheer excitedly with every punch',
          effects: { stats: { happiness: 6 }, journal: 'You listened to a championship prizefight on the radio.', result: 'The roar of the radio crowd echoes in the room as a knockout lands.' },
        },
        {
          id: 'tinker',
          text: 'Adjust the vacuum tubes to sharpen the signal',
          effects: { stats: { smarts: 4 }, journal: 'You tuned a crystal radio set to clean reception.', result: 'A delicate twist clears the hiss and brings the announcer’s voice crystal clear.' },
        },
      ]},


  {
    id: 'atom-charleston',
      title: 'The Charleston',
      description: 'Every dance hall from Chicago to Harlem is swinging to the rapid kicks and crossed knees of the Charleston.',
      category: 'youth',
      conditions: { minAge: 15, maxAge: 32, eras: ['atomic'], oncePerLife: true },
      weight: 1,
      choices: [
        {
          id: 'learn',
          text: 'Find a partner and practice the wild kicks',
          effects: { stats: { looks: 6 }, meet: { kind: 'friend', status: 'a dancing partner from the hall' }, chance: 0.5, journal: 'You mastered the Charleston dance craze.', result: 'Heels fly and fringes shimmer as you tear up the dance floor.' },
        },
        {
          id: 'shun',
          text: 'Condemn it as scandalous nonsense',
          effects: { journal: 'You disapproved of wild modern dances like the Charleston.', result: 'You maintain strict traditional decorum while the youth go wild.' },
        },
      ]},


  {
    id: 'atom-cinema-rush',
      title: 'The Picture Palace',
      description: 'A magnificent cinema palace downtown is screening a new silent photoplay accompanied by a grand pipe organ.',
      category: 'social',
      conditions: { minAge: 10, maxAge: 65, eras: ['atomic'], oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'ticket',
          text: 'Buy a nickel ticket and lose yourself in the movie',
          effects: { money: -1, stats: { happiness: 6 }, journal: 'You spent an afternoon at a grand silent movie theatre.', result: 'Dramatic organ chords swell as glamorous stars act across the silver screen.' },
        },
        {
          id: 'save',
          text: 'Pocket your nickel and stroll the avenue',
          effects: { stats: { smarts: 2 }, journal: 'You saved your nickel instead of going to the pictures.', result: 'A thrifty choice that keeps your weekly allowance intact.' },
        },
      ]},


  {
    id: 'atom-telephone',
      title: 'The Machine on the Hall Table',
      description: 'The family has a new telephone in {place}, and everyone keeps pretending they are not waiting for it to ring.',
      category: 'social',
      conditions: { minAge: 8, maxAge: 60, eras: ['atomic'], oncePerLife: true },
      weight: 2,
      choices: [
        {
          id: 'lift',
          text: 'Lift it on the first ring, every time',
          effects: { stats: { happiness: 5, smarts: 2 }, journal: 'You learned to lift the telephone before it finished ringing.', result: 'You are the family switchboard, and it is a responsibility.' },
        },
        {
          id: 'ignore',
          text: 'Let it ring itself out',
          effects: { stats: { happiness: -2 }, journal: 'You let the telephone ring itself out in {place}.', result: 'Somebody else always answers. It never stops being strange.' },
        },
      ]},


  {
    id: 'atom-cinema',
      title: 'The Picture House',
      description: 'The picture house in {place} is showing something with a rocket in it, and the queue goes round the block.',
      category: 'social',
      conditions: { minAge: 10, maxAge: 70, eras: ['atomic'], oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'see',
          text: 'Queue for a matinee and believe all of it',
          effects: { money: -1, stats: { happiness: 8, looks: 3 }, journal: 'You queued for a matinee at the picture house in {place}.', result: 'You came out believing you could be an astronaut.' },
        },
        {
          id: 'window',
          text: 'Watch the marquee and go home',
          effects: { stats: { happiness: 2 }, journal: 'You watched the marquee in {place} and went home instead.', result: 'The rocket was enormous. You can still describe it.' },
        },
      ]}
,

  // MODERN DAY

  {
    id: 'modern-late-night',
      title: 'Midnight Scrolling',
      description: 'It is 2 AM in {place}. The cold glow of your handheld screen illuminates your face as notifications refresh endlessly.',
      category: 'adult',
      conditions: { minAge: 13, maxAge: 55, eras: ['modern-day'], oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'sleep',
          text: 'Plug the phone across the room and sleep',
          effects: { stats: { health: 5 }, journal: 'You broke your phone doomscroll habit and went to sleep early.', result: 'You awake energized and clear-headed the next morning.' },
        },
        {
          id: 'scroll',
          text: 'Keep scrolling through sensational headlines',
          effects: { stats: { happiness: -4 }, journal: 'You spent half the night doomscrolling social media.', result: 'Alarming news feeds your anxiety, leaving you exhausted by sunrise.' },
        },
      ]},


  {
    id: 'modern-gym-pass',
      title: 'Fitness Centre',
      description: 'A sleek new gym full of rows of treadmills and iron dumbbells has opened nearby in {place}.',
      category: 'youth',
      conditions: { minAge: 16, maxAge: 65, eras: ['modern-day'], oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'membership',
          text: 'Sign up and commit to three sessions a week',
          effects: { money: -2, stats: { health: 7 }, journal: 'You committed to a regular workout regimen at a modern gym.', result: 'Sweating on the machines yields real vitality and stamina.' },
        },
        {
          id: 'couch',
          text: 'Prefer streaming television from the couch',
          effects: { stats: { happiness: 3 }, journal: 'You stayed on the couch streaming shows instead of going to the gym.', result: 'Comfortable, easy, and completely sweat-free.' },
        },
      ]},


  {
    id: 'modern-coffee-bar',
      title: 'Specialty Coffee',
      description: 'You stop in a trendy cafe in {place} where the barista serves an oat milk latte with foam art.',
      category: 'social',
      conditions: { minAge: 16, maxAge: 55, eras: ['modern-day'], oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'enjoy',
          text: 'Sip the roast slowly and enjoy the ambiance',
          effects: { money: -1, stats: { happiness: 5 }, journal: 'You enjoyed a warm artisanal coffee in a trendy cafe.', result: 'Rich caffeine and calm music offer a lovely pause in your day.' },
        },
        {
          id: 'photo',
          text: 'Snap a polished photo for your social feed',
          effects: { stats: { looks: 4 }, journal: 'You shared a polished photo of your coffee online.', result: 'Likes roll in rapidly, giving your personal profile a boost.' },
        },
      ]}
,

  // ANCIENT WORLD

  {
    id: 'anc-baths',
      title: 'The Baths',
      description: 'A friend talks you into the public baths at {place}, where the whole city steams and argues.',
      category: 'social',
      conditions: { minAge: 14, maxAge: 70, eras: ['ancient-world'], oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        {
          id: 'stay',
          text: 'Stay all afternoon and listen to everyone',
          effects: { stats: { health: 5 }, meet: { kind: 'friend', status: 'met at the baths' }, chance: 0.5, journal: 'You spent an afternoon at the baths of {place}.', result: 'You come out cleaner, looser, and full of other people\u2019s news.' },
        },
        {
          id: 'leave',
          text: 'Pay your share and get out',
          effects: { money: -1, stats: { happiness: 2 }, journal: 'You paid your share at the baths and left before the crowd.', result: 'It was warm, and that was enough.' },
        },
      ]},


  {
    id: 'anc-bread-dole',
      title: 'The Grain Ship',
      description: 'A crowd gathers at the docks in {place} to shout at the government over the price of bread.',
      category: 'adult',
      conditions: { minAge: 16, maxAge: 75, eras: ['ancient-world'], oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'shout',
          text: 'Shout with the crowd about the grain ships',
          effects: { stats: { happiness: 5 }, journal: 'You shouted about the price of bread with a crowd in {place}.', result: 'You are part of something for an afternoon, and it does not last.' },
        },
        {
          id: 'calm',
          text: 'Watch it from the end of the pier',
          effects: { stats: { smarts: 4 }, journal: 'You watched the bread riot in {place} from a safe distance.', result: 'You learn a great deal about how a city decides who eats.' },
        },
      ]},


  {
    id: 'anc-road',
      title: 'The Long Road',
      description: 'You are conscripted to walk a stretch of imperial road with a mule, a pick, and no idea how far it goes.',
      category: 'adult',
      conditions: { minAge: 18, maxAge: 50, eras: ['ancient-world'], oncePerLife: true },
      weight: 1,
      choices: [
        {
          id: 'walk',
          text: 'Walk it and keep the camp fed',
          effects: { stats: { health: 6, happiness: -3 }, money: 3, journal: 'You worked a season on an imperial road.', result: 'Your shoulders are ruined and your purse is not empty.' },
        },
        {
          id: 'desert',
          text: 'Desert in the night with another walker',
          effects: { stats: { health: -5, smarts: 3 }, meet: { kind: 'friend', status: 'on the road with you' }, journal: 'You deserted a road gang with somebody, walking the other way.', result: 'You are free, and slightly famous for it, and you did not walk out alone.' },
        },
      ]}
,

  // AGE OF SAIL

  {
    id: 'sail-shore-leave',
      title: 'Shore Leave',
      description: 'Your ship is in port at {place} for a week, and the whole shore has other ideas about what a week is for.',
      category: 'adult',
      conditions: { minAge: 17, maxAge: 60, eras: ['age-of-sail'], oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'spend',
          text: 'Spend everything you have and enjoy it',
          effects: { money: -3, stats: { happiness: 9, health: -2 }, journal: 'You drank and spent your pay on shore leave in {place}.', result: 'You cannot remember most of it and would do it again.' },
        },
        {
          id: 'save',
          text: 'Stay aboard and keep your wages',
          effects: { money: 4, stats: { happiness: -2 }, journal: 'You stayed aboard through shore leave and saved your wages.', result: 'You listen to it through the planking, and you are better off.' },
        },
      ]},


  {
    id: 'sail-news',
      title: 'Word From Afar',
      description: 'A printed sheet arrives in {place} with three months of news on it, most of it a month stale.',
      category: 'adult',
      conditions: { minAge: 14, maxAge: 75, eras: ['age-of-sail'], oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'read',
          text: 'Read it front to back for the price of an hour',
          effects: { money: -1, stats: { smarts: 6 }, journal: 'You read a printed broadsheet through in {place}.', result: 'Two wars, one comet, and a price list for pepper.' },
        },
        {
          id: 'ignore',
          text: 'Leave it for someone who cares',
          effects: { stats: { happiness: 2 }, journal: 'You left the news unread in {place}.', result: 'News will still be there tomorrow, and so will you.' },
        },
      ]}
,

  // INDUSTRIAL AGE

  {
    id: 'ind-mill-bell',
      title: 'The Bell',
      description: 'The mill bell in {place} goes at six, and if you are not at the gate before it finishes you lose the shift.',
      category: 'work',
      conditions: { minAge: 12, maxAge: 60, eras: ['industrial'], oncePerLife: false, maxPerLife: 3 },
      weight: 2.2,
      choices: [
        {
          id: 'run',
          text: 'Run for the gate and make the shift',
          effects: { stats: { health: -4, happiness: -2 }, money: 2, journal: 'You ran for the mill gate and made the shift in {place}.', result: 'Fourteen hours, and the bell still nearly beat you.' },
        },
        {
          id: 'late',
          text: 'Arrive late and take the consequences',
          effects: { stats: { happiness: -5, health: 2 }, journal: 'You missed the mill bell in {place} and were docked.', result: 'You lose more wages than the sleep was worth.' },
        },
      ]},


  {
    id: 'ind-chartist',
      title: 'A Meeting in the Back Room',
      description: 'Word is that a meeting is being held in a back room in {place}, about the vote and the hours.',
      category: 'adult',
      conditions: { minAge: 18, maxAge: 60, eras: ['industrial'], oncePerLife: true },
      weight: 1,
      choices: [
        {
          id: 'go',
          text: 'Go, and be seen going',
          effects: { stats: { happiness: 6, smarts: 3 }, meet: { kind: 'friend', status: 'in the union with you' }, chance: 0.5, journal: 'You went to a meeting about the vote in {place}.', result: 'You sign your name in a book. So do a dozen people you know.' },
        },
        {
          id: 'skip',
          text: 'Keep your head down and stay away',
          effects: { stats: { happiness: -3 }, journal: 'You stayed away from the meeting in {place}.', result: 'The foreman notices who was there and who was not.' },
        },
      ]},

  // MOTORS (parents push a licence; horses never needed one)

  {
    id: 'motor-parents-licence',
      title: 'Time to Drive',
      description: 'Your parents say it is time you learned to drive and got your licence.',
      category: 'family',
      conditions: { minAge: 16, maxAge: 21, eras: ['industrial', 'atomic', 'modern-day'], excludedFlags: ['has-licence'], oncePerLife: true },
      weight: 2,
      choices: [
        {
          id: 'learn',
          text: 'Promise to get your licence',
          effects: { stats: { happiness: 2 }, journal: 'You promised to get your driving licence.', result: 'They nod like the matter is settled.' },
        },
        {
          id: 'refuse',
          text: 'Put it off',
          effects: { stats: { happiness: -1 }, journal: 'You put off learning to drive.', result: 'They leave it, for now.' },
        },
      ]},

  // CRIME (caught runs through the crime engine)

  {
    id: 'crime-smuggle',
    title: 'Past the Watch',
    description: 'A cart of untaxed goods needs moving past the watch in {place}, and the man with the cart is not particular.',
    category: 'peril',
    conditions: { minAge: 16, maxAge: 50, eras: ['age-of-sail', 'industrial'], oncePerLife: false, maxPerLife: 3 },
    weight: 1,
    choices: [
      {
        id: 'do-it',
        text: 'Take the cart past',
        effects: { journal: 'You took the cart past the watch.', result: 'The wheels creak in the dark.' },
      },
      {
        id: 'walk-away',
        text: 'Leave it',
        effects: { stats: { happiness: 1 }, journal: 'You left the smuggler to his own devices.', result: 'The watch does not sleep, and neither do you.' },
      },
    ],
  },

  {
    id: 'crime-duel',
    title: 'The Insult',
    description: 'Somebody in {place} said something about your mother that cannot be allowed to stand, and the only answer they will take is steel.',
    category: 'peril',
    conditions: { minAge: 18, maxAge: 45, oncePerLife: false, maxPerLife: 3 },
    weight: 0.8,
    choices: [
      {
        id: 'do-it',
        text: 'Call them out',
        effects: { journal: 'You called them out over the insult.', result: 'Steel answers steel.' },
      },
      {
        id: 'walk-away',
        text: 'Swallow it',
        effects: { stats: { happiness: -2, reputation: 1 }, journal: 'You swallowed the insult.', result: 'Some things are not worth the blood.' },
      },
    ],
  },

];

