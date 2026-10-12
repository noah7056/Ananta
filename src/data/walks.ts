import type { ChoiceEffect, EraId } from '../types';

/**
 * Walks.
 *
 * To extend: add a duration, add a destination (gated by `eras` and
 * `places`), add an event listing the destinations it can happen at.
 */

export interface WalkDuration {
  id: string;
  /** how long you are out, e.g. "All afternoon" */
  text: string;
  /** multiplies the walk's stat gain */
  scale: number;
  /** extra wear on the habit, on top of the usual */
  wear: number;
  /** odds something happens along the way */
  eventChance: number;
  /** energy a long walk takes out of you */
  energyCost?: number;
  /** journal line when nothing happens */
  journal: string;
  /** popup line for a quiet walk */
  notice: string;
}

export interface WalkPlace {
  id: string;
  /** where it is, e.g. "The market" */
  text: string;
  /** extra odds something happens here */
  eventBias?: number;
  minAge?: number;
  /** gate to a period; omit for everywhere */
  eras?: EraId[];
  /** gate to a birthplace; omit for all of them */
  places?: string[];
  /** only on offer while serving; never otherwise */
  atWar?: boolean;
  /** journal line when nothing happens here */
  journal: string;
}

export interface WalkChoice {
  id: string;
  text: string;
  effects: ChoiceEffect;
}

export interface WalkEvent {
  id: string;
  /** destination ids this can happen at */
  at: string[];
  title: string;
  /** supports {name} and {place} */
  description: string;
  choices: WalkChoice[];
  eras?: EraId[];
  minAge?: number;
  maxAge?: number;
  /** gate to a birthplace */
  places?: string[];
  requiredFlags?: string[];
  excludedFlags?: string[];
  /** likeliness when several fit; 1 is normal */
  weight?: number;
}

export const WALK_DURATIONS: WalkDuration[] = [
  {
    id: 'short',
    text: 'A short walk',
    scale: 0.6,
    wear: -0.2,
    eventChance: 0.16,
    journal: 'You went a short way out and back.',
    notice: 'You are back before the afternoon has got going.',
  },
  {
    id: 'proper',
    text: 'A proper walk',
    scale: 1,
    wear: 0,
    eventChance: 0.3,
    journal: 'You walked out and back in an afternoon.',
    notice: 'The hours move and you come back the better for them.',
  },
  {
    id: 'long',
    text: 'A long walk',
    scale: 1.5,
    wear: 0.4,
    eventChance: 0.42,
    energyCost: 2,
    journal: 'You walked further than you meant to.',
    notice: 'Your feet have opinions now.',
  },
  {
    id: 'afternoon',
    text: 'All afternoon',
    scale: 2,
    wear: 1,
    eventChance: 0.55,
    energyCost: 4,
    journal: 'You were out until the light went.',
    notice: 'You come back late and pleased about it.',
  },
];

export const WALK_PLACES: WalkPlace[] = [
  // anywhere, any time
  {
    id: 'streets',
    text: 'Your neighbourhood',
    journal: 'You walked the streets of {place}.',
  },
  {
    id: 'park',
    text: 'The park',
    journal: 'You walked round the park in {place}.',
  },
  {
    id: 'market',
    text: 'The market',
    eventBias: 0.08,
    journal: 'You walked through the market in {place}.',
  },

  // ancient world
  {
    id: 'forum',
    text: 'The forum',
    eras: ['ancient-world'],
    eventBias: 0.1,
    journal: 'You walked the forum in {place}.',
  },
  {
    id: 'harbour',
    text: 'The harbour',
    eras: ['ancient-world'],
    eventBias: 0.06,
    journal: 'You walked the harbour at {place}.',
  },
  {
    id: 'forum-romanum',
    text: 'The Forum Romanum',
    eras: ['ancient-world'],
    places: ['roman-rome'],
    eventBias: 0.12,
    journal: 'You walked the length of the Forum Romanum.',
  },

  // middle ages
  {
    id: 'church',
    text: 'The church',
    eras: ['medieval'],
    journal: 'You walked as far as the church in {place}.',
  },
  {
    id: 'fair',
    text: 'The fairground',
    eras: ['medieval'],
    eventBias: 0.12,
    journal: 'You walked out to the fair at {place}.',
  },

  // age of sail
  {
    id: 'docks',
    text: 'The docks',
    eras: ['age-of-sail'],
    eventBias: 0.08,
    journal: 'You walked the docks at {place}.',
  },
  {
    id: 'coffee-house',
    text: 'The coffee house',
    eras: ['age-of-sail'],
    eventBias: 0.06,
    journal: 'You walked to the coffee house in {place}.',
  },
  {
    id: 'canals',
    text: 'The canals',
    eras: ['age-of-sail'],
    places: ['netherlands-amsterdam'],
    journal: 'You walked the canal ring in {place}.',
  },
  {
    id: 'osaka-water',
    text: 'The canal district',
    eras: ['age-of-sail'],
    places: ['japan-osaka'],
    eventBias: 0.08,
    journal: 'You walked the canals of {place}.',
  },

  // industrial
  {
    id: 'station',
    text: 'The railway station',
    eras: ['industrial'],
    eventBias: 0.06,
    journal: 'You walked as far as the station in {place}.',
  },
  {
    id: 'works',
    text: 'The factory district',
    eras: ['industrial'],
    journal: 'You walked out past the works in {place}.',
  },

  // atomic
  {
    id: 'cinema',
    text: 'The cinema',
    eras: ['atomic'],
    eventBias: 0.08,
    journal: 'You walked to the cinema in {place}.',
  },
  {
    id: 'dance-hall',
    text: 'The dance hall',
    eras: ['atomic'],
    minAge: 14,
    eventBias: 0.08,
    journal: 'You walked to the dance hall in {place}.',
  },

  // modern day
  {
    id: 'mall',
    text: 'The shopping centre',
    eras: ['modern-day'],
    eventBias: 0.08,
    journal: 'You walked to the shopping centre in {place}.',
  },
  {
    id: 'riverside',
    text: 'The river path',
    eras: ['modern-day'],
    journal: 'You walked the river path in {place}.',
  },

  // at war, in any period
  {
    id: 'camp',
    text: 'The camp',
    atWar: true,
    journal: 'You walked the camp and back.',
  },
  {
    id: 'front-line',
    text: 'The front line',
    atWar: true,
    journal: 'You walked out to the wire and back.',
  },
];

/** Every destination id — general events can happen anywhere. */
const ALL_WALK_PLACES = WALK_PLACES.filter((p) => !p.atWar).map((p) => p.id);

export const WALK_EVENTS: WalkEvent[] = [
  {
    id: 'walk-stray',
    at: ALL_WALK_PLACES,
    title: 'A stray',
    description: 'A thin dog falls in beside you and shows no sign of wanting to be elsewhere.',
    choices: [
      {
        id: 'keep',
        text: 'Take it in',
        effects: {
          stats: { happiness: 3 },
          meet: { kind: 'pet', status: 'a stray that followed you home' },
          result: 'It comes in out of the road and will not be moved.',
          journal: 'You took a stray dog home.',
        },
      },
      {
        id: 'feed',
        text: 'Give it something to eat',
        effects: {
          stats: { happiness: 2 },
          result: 'It eats what you have and then goes about its business.',
          journal: 'You fed a stray dog.',
        },
      },
      {
        id: 'walk-on',
        text: 'Walk on',
        effects: {
          stats: { happiness: -1 },
          result: 'It stops at the corner and watches you go.',
          journal: 'You left a stray dog to the street.',
        },
      },
    ],
  },
  {
    id: 'walk-coin',
    at: ALL_WALK_PLACES,
    title: 'A coin in the road',
    description: 'There is a coin in the dirt, plainly dropped by somebody who was in a hurry.',
    choices: [
      {
        id: 'pocket',
        text: 'Pocket it',
        effects: {
          money: 1,
          stats: { happiness: 1 },
          result: 'Nobody comes looking for it.',
          journal: 'You pocketed a coin you found in the road.',
        },
      },
      {
        id: 'find-owner',
        text: 'Ask around for the owner',
        effects: {
          stats: { happiness: 2 },
          result: 'It takes half an hour, but you find the man who lost it.',
          journal: 'You spent an hour finding who dropped a coin.',
        },
      },
      {
        id: 'ignore',
        text: 'Leave it where it is',
        effects: {
          result: 'Somebody else will have a decision to make shortly.',
          journal: 'You left a coin in the road.',
        },
      },
    ],
  },
  {
    id: 'walk-rain',
    at: ALL_WALK_PLACES,
    title: 'The sky turns',
    description: 'It goes dark and then comes down all at once, the way it does here.',
    choices: [
      {
        id: 'run',
        text: 'Run for it',
        effects: {
          stats: { energy: -2, happiness: -1 },
          result: 'You get in half soaked and out of temper.',
          journal: 'You ran home through the rain.',
        },
      },
      {
        id: 'through',
        text: 'Walk on through it',
        effects: {
          stats: { energy: -3, happiness: 3 },
          result: 'You are drenched and absurdly glad of it.',
          journal: 'You walked home in the rain on purpose.',
        },
      },
    ],
  },
  {
    id: 'walk-busker',
    at: ALL_WALK_PLACES,
    title: 'Somebody is playing',
    description: 'A crowd has stopped to listen to someone playing in the middle of everything.',
    choices: [
      {
        id: 'tip',
        text: 'Listen and pay them',
        effects: {
          money: -1,
          stats: { happiness: 3 },
          result: 'They catch your eye and play something better for it.',
          journal: 'You paid a street player.',
        },
      },
      {
        id: 'listen',
        text: 'Listen and move on',
        effects: {
          stats: { happiness: 1 },
          result: 'You get one song and then the crowd takes you.',
          journal: 'You stopped to hear someone play in the street.',
        },
      },
      {
        id: 'join',
        text: 'Take a turn yourself',
        effects: {
          stats: { happiness: 2, reputation: 1, energy: -1 },
          result: 'You are not good, and it goes better than that suggests.',
          journal: 'You sang in the street for a small crowd.',
        },
      },
    ],
  },
  {
    id: 'walk-child-ball',
    at: ALL_WALK_PLACES,
    title: 'A stuck ball',
    description: 'A child is wailing over a ball wedged where no small arm can reach.',
    choices: [
      {
        id: 'help',
        text: 'Fish it out',
        effects: {
          stats: { happiness: 3, reputation: 1 },
          result: 'You get it out and are handed it as if you had made it yourself.',
          journal: 'You freed a child’s ball.',
        },
      },
      {
        id: 'watch',
        text: 'Watch a moment',
        effects: {
          stats: { happiness: 1 },
          result: 'A neighbour gets it in the end.',
          journal: 'You watched a neighbour free a child’s ball.',
        },
      },
      {
        id: 'walk-past',
        text: 'Walk on',
        effects: {
          stats: { happiness: -1, reputation: -1 },
          result: 'The crying follows you some way.',
          journal: 'You walked past a child crying over a stuck ball.',
        },
      },
    ],
  },
  {
    id: 'walk-quarrel',
    at: ALL_WALK_PLACES,
    title: 'A quarrel in the way',
    description:
      'Two people are shouting at each other across the road, and one of them is plainly in the wrong.',
    choices: [
      {
        id: 'between',
        text: 'Step between them',
        effects: {
          stats: { energy: -2, happiness: 2, reputation: 1 },
          result: 'It takes a while, and the wrongness is sorted out.',
          journal: 'You stepped between two people who were quarrelling.',
        },
      },
      {
        id: 'take-side',
        text: 'Back the one in the right',
        effects: {
          stats: { happiness: 1, health: -2 },
          result: 'You are right, and you are also outnumbered and sore.',
          journal: 'You put yourself into somebody else’s quarrel.',
        },
      },
      {
        id: 'keep-walking',
        text: 'Keep walking',
        effects: {
          stats: { happiness: -1 },
          result: 'It is still going on behind you.',
          journal: 'You left two people to quarrel it out.',
        },
      },
    ],
  },
  {
    id: 'walk-marbles',
    at: ['streets', 'park', 'fair'],
    title: 'Playing for keeps',
    minAge: 4,
    maxAge: 13,
    description: 'Some children are shooting marbles for keeps and there is room in the game.',
    choices: [
      {
        id: 'play',
        text: 'Play',
        effects: {
          money: 1,
          stats: { happiness: 3 },
          result: 'You win four and lose one and call that a good afternoon.',
          journal: 'You played marbles for keeps in the street.',
        },
      },
      {
        id: 'watch',
        text: 'Watch',
        effects: {
          stats: { happiness: 1 },
          result: 'Somebody else wins most of it.',
          journal: 'You watched the others play marbles.',
        },
      },
    ],
  },
  {
    id: 'walk-forum-debate',
    at: ['forum', 'forum-romanum'],
    title: 'Someone is holding forth',
    description:
      'A man in the forum is telling everyone within earshot exactly how the province ought to be governed.',
    eras: ['ancient-world'],
    choices: [
      {
        id: 'argue',
        text: 'Argue with him',
        effects: {
          stats: { smarts: 2, happiness: 1 },
          result: 'You lose, but you learn where the argument fails.',
          journal: 'You argued with a speaker in the forum.',
        },
      },
      {
        id: 'listen',
        text: 'Listen and take note',
        effects: {
          stats: { smarts: 2 },
          result: 'You go home knowing more about tax law than you did.',
          journal: 'You listened to a speaker in the forum.',
        },
      },
      {
        id: 'move-on',
        text: 'Move on',
        effects: {
          result: 'He is still going as you turn the corner.',
          journal: 'You left a speaker holding forth in the forum.',
        },
      },
    ],
  },
  {
    id: 'walk-harbour-sailor',
    at: ['harbour', 'docks'],
    title: 'Something from the ship',
    description: 'A sailor on the quay has something in a cloth and is willing to show anybody who asks.',
    eras: ['ancient-world', 'age-of-sail'],
    choices: [
      {
        id: 'aboard',
        text: 'Go aboard and see it',
        effects: {
          stats: { happiness: 3, health: -1 },
          result: 'It is worth the climb and the smell.',
          journal: 'You went aboard to see something off a ship.',
        },
      },
      {
        id: 'ask-out',
        text: 'Ask him to bring it out',
        effects: {
          stats: { smarts: 1, happiness: 1 },
          result: 'He unwraps it on the quay and tells you more than you wanted to know.',
          journal: 'You asked a sailor about something off his ship.',
        },
      },
      {
        id: 'decline',
        text: 'Decline',
        effects: {
          result: 'He shrugs and finds somebody else.',
          journal: 'You passed up a look at something off a ship.',
        },
      },
    ],
  },
  {
    id: 'walk-church-bells',
    at: ALL_WALK_PLACES,
    title: 'The bells',
    description: 'The bells are going and nobody in the lane is quite sure what for.',
    eras: ['medieval'],
    choices: [
      {
        id: 'go-see',
        text: 'Go and see',
        effects: {
          stats: { happiness: 1, smarts: 1 },
          result: 'A wedding, or something close enough to one.',
          journal: 'You went to see what the bells were for.',
        },
      },
      {
        id: 'ask',
        text: 'Ask a neighbour',
        effects: {
          stats: { smarts: 1 },
          result: 'They know, and most of the story with it.',
          journal: 'You asked a neighbour what the bells were for.',
        },
      },
      {
        id: 'stay',
        text: 'Stay home',
        effects: {
          result: 'They go on ringing anyway.',
          journal: 'You stayed home while the bells rang.',
        },
      },
    ],
  },
  {
    id: 'walk-fair-thief',
    at: ALL_WALK_PLACES,
    title: 'A hand in the crowd',
    description: 'The crowd is thick and something at your belt is being very carefully undone.',
    eras: ['medieval', 'age-of-sail'],
    choices: [
      {
        id: 'catch',
        text: 'Catch the hand',
        effects: {
          money: 1,
          stats: { happiness: 3 },
          result: 'You come out of it the richer and the centre of attention.',
          journal: 'You caught a thief in the crowd at the fair.',
        },
      },
      {
        id: 'alarm',
        text: 'Raise the alarm',
        effects: {
          stats: { happiness: 2, health: -1 },
          result: 'The whole fair turns out for it and the hand lets go.',
          journal: 'You raised the alarm over a thief at the fair.',
        },
      },
      {
        id: 'step-away',
        text: 'Step away quietly',
        effects: {
          money: -1,
          result: 'You keep what is left of the afternoon and not much else.',
          journal: 'You slipped away from a thief in the crowd.',
        },
      },
    ],
  },
  {
    id: 'walk-pamphlet',
    at: ALL_WALK_PLACES,
    title: 'Pamphlets',
    description: 'A man by the door is handing out pamphlets to anyone who will take one.',
    eras: ['age-of-sail'],
    choices: [
      {
        id: 'read-aloud',
        text: 'Read a page out to the room',
        effects: {
          stats: { smarts: 2, happiness: 1 },
          result: 'Half the room agrees with you and half of them are wrong.',
          journal: 'You read a pamphlet out loud to a coffee house.',
        },
      },
      {
        id: 'take',
        text: 'Take one and read it later',
        effects: {
          stats: { smarts: 1 },
          result: 'It turns out to be better than the man handing it out.',
          journal: 'You took a pamphlet home to read.',
        },
      },
      {
        id: 'refuse',
        text: 'Refuse',
        effects: {
          result: 'He gives yours to the next man in.',
          journal: 'You refused a pamphlet.',
        },
      },
    ],
  },
  {
    id: 'walk-ship-going-out',
    at: ALL_WALK_PLACES,
    title: 'Going out on the tide',
    description: 'A ship is being taken out and everybody on the quay has stopped to watch.',
    eras: ['age-of-sail'],
    choices: [
      {
        id: 'watch',
        text: 'Watch her go',
        effects: {
          stats: { happiness: 2 },
          result: 'She clears the bar and the whole quay exhales.',
          journal: 'You watched a ship leave on the tide.',
        },
      },
      {
        id: 'sailor',
        text: 'Speak to one of the crew',
        effects: {
          stats: { smarts: 1, happiness: 1 },
          result: 'He tells you where she is going and how long it takes, both of them wrong.',
          journal: 'You spoke to a sailor on his way out.',
        },
      },
      {
        id: 'home',
        text: 'Head home',
        effects: {
          result: 'You hear the guns after she is gone.',
          journal: 'You heard a ship leave without seeing her go.',
        },
      },
    ],
  },
  {
    id: 'walk-works-smoke',
    at: ALL_WALK_PLACES,
    title: 'Smoke on the wind',
    description:
      'The wind has brought the works right into the street, and everything here is quiet in a way that is not peaceful.',
    eras: ['industrial'],
    choices: [
      {
        id: 'lend-hand',
        text: 'Lend a hand for an hour',
        effects: {
          money: 2,
          stats: { energy: -3 },
          result: 'They pay you and they need the hand.',
          journal: 'You worked an hour at the works for the pay.',
        },
      },
      {
        id: 'press-on',
        text: 'Hold on and press through',
        effects: {
          stats: { health: -1 },
          result: 'It is in your chest for the rest of the walk.',
          journal: 'You walked through the smoke off the works.',
        },
      },
      {
        id: 'turn-back',
        text: 'Turn back',
        effects: {
          result: 'You take the long way home instead.',
          journal: 'You turned back rather than walk through the smoke.',
        },
      },
    ],
  },
  {
    id: 'walk-cinema-queue',
    at: ALL_WALK_PLACES,
    title: 'The queue',
    description: 'The queue for the picture goes round the block and nobody in it is going anywhere.',
    eras: ['atomic'],
    choices: [
      {
        id: 'buy',
        text: 'Buy a ticket',
        effects: {
          money: -2,
          stats: { happiness: 4 },
          result: 'Two hours of somebody else’s trouble, and worth it.',
          journal: 'You saw a picture at the cinema.',
        },
      },
      {
        id: 'sneak',
        text: 'Go in the side door',
        effects: {
          stats: { happiness: 3 },
          addFlags: ['sneaky'],
          result: 'Nobody looks twice at you and the film is the same film.',
          journal: 'You got into the cinema without paying.',
        },
      },
      {
        id: 'read-poster',
        text: 'Read the poster and go home',
        effects: {
          stats: { smarts: 1 },
          result: 'The poster is more interesting than you expected.',
          journal: 'You read a cinema poster and went home.',
        },
      },
    ],
  },
  {
    id: 'walk-window-shopping',
    at: ALL_WALK_PLACES,
    title: 'Full of things',
    description: 'The windows are full of things you had not thought about until about now.',
    eras: ['modern-day'],
    choices: [
      {
        id: 'buy',
        text: 'Buy something foolish',
        effects: {
          money: -2,
          stats: { happiness: 3, looks: 1 },
          result: 'You have no use for it and you are not sorry.',
          journal: 'You bought something foolish on a walk.',
        },
      },
      {
        id: 'look',
        text: 'Just look',
        effects: {
          stats: { happiness: 1 },
          result: 'You come home with names of things you could not afford.',
          journal: 'You window-shopped on a walk.',
        },
      },
      {
        id: 'long-way',
        text: 'Take the long way round',
        effects: {
          stats: { health: 1, happiness: 1 },
          result: 'It adds an hour and it does you good.',
          journal: 'You took the long way round on a walk.',
        },
      },
    ],
  },
  {
    id: 'walk-canal-boat',
    at: ['canals'],
    title: 'Room for one more',
    description: 'A woman letting out her boat says she has room for one more and the afternoon free.',
    eras: ['age-of-sail'],
    places: ['netherlands-amsterdam'],
    choices: [
      {
        id: 'go-out',
        text: 'Go out on the water',
        effects: {
          money: -2,
          stats: { happiness: 4 },
          result: 'The whole city looks better from below the bridges.',
          journal: 'You went out on the canals in a hired boat.',
        },
      },
      {
        id: 'bridges',
        text: 'Walk the bridges instead',
        effects: {
          stats: { happiness: 2, health: 1 },
          result: 'You see the same water from fourteen heights.',
          journal: 'You walked the bridges along the canals.',
        },
      },
      {
        id: 'decline',
        text: 'Decline politely',
        effects: {
          result: 'She finds somebody before you reach the corner.',
          journal: 'You passed up a boat on the canals.',
        },
      },
    ],
  },
  {
    id: 'walk-osaka-seller',
    at: ['osaka-water', 'market'],
    title: 'Something off a bundle',
    description: 'A man on the bridge has a bundle open and a crowd that is not thin around it.',
    eras: ['age-of-sail'],
    places: ['japan-osaka'],
    choices: [
      {
        id: 'buy',
        text: 'Buy one',
        effects: {
          money: -1,
          stats: { happiness: 2 },
          result: 'It is not what he said it was, and you like it.',
          journal: 'You bought something off a bundle on the bridge.',
        },
      },
      {
        id: 'watch',
        text: 'Watch him work the crowd',
        effects: {
          stats: { smarts: 1 },
          result: 'You learn how it is done, which is most of it.',
          journal: 'You watched a seller work the crowd.',
        },
      },
      {
        id: 'move-on',
        text: 'Move on',
        effects: {
          result: 'The crowd is still there behind you.',
          journal: 'You left a seller and his crowd.',
        },
      },
    ],
  },
  {
    id: 'walk-beggar',
    at: ALL_WALK_PLACES,
    title: 'A hand held out',
    description: 'Someone is sitting against a wall with their hand out and their eyes on you.',
    choices: [
      {
        id: 'give',
        text: 'Give them something',
        effects: {
          money: -1,
          stats: { happiness: 2, reputation: 1 },
          result: 'They say your name as you go, or something like it.',
          journal: 'You gave something to someone who asked for it.',
        },
      },
      {
        id: 'work',
        text: 'Offer to find them work',
        effects: {
          stats: { happiness: 1, energy: -1 },
          result: 'They look at you like you have said something in a foreign language.',
          journal: 'You offered to find work for someone who asked for it.',
        },
      },
      {
        id: 'walk-past',
        text: 'Walk past',
        effects: {
          stats: { happiness: -1, reputation: -1 },
          result: 'The hand goes back to the wall.',
          journal: 'You walked past someone asking for help.',
        },
      },
    ],
  },
  {
    id: 'walk-dog-walker',
    at: ALL_WALK_PLACES,
    title: 'Out of control',
    description: 'A dog is pulling its owner sideways and the owner is losing the argument.',
    choices: [
      {
        id: 'help',
        text: 'Help catch it',
        effects: {
          stats: { happiness: 2, energy: -2, reputation: 1 },
          result: 'You get a hold of the lead and the owner looks at you like you are made of money.',
          journal: 'You helped catch someone’s dog.',
        },
      },
      {
        id: 'watch',
        text: 'Watch the struggle',
        effects: {
          stats: { happiness: 1 },
          result: 'It ends with the dog winning, as usual.',
          journal: 'You watched a dog pull its owner down the street.',
        },
      },
      {
        id: 'cross-road',
        text: 'Cross the road',
        effects: {
          stats: { happiness: -1 },
          result: 'It is still going on behind you.',
          journal: 'You crossed the road to avoid a dog.',
        },
      },
    ],
  },
  {
    id: 'walk-romance',
    at: ALL_WALK_PLACES,
    title: 'A second glance',
    description: 'Someone on the other side of the street looks at you for a moment longer than the street requires.',
    minAge: 14,
    choices: [
      {
        id: 'smile',
        text: 'Smile at them',
        effects: {
          stats: { happiness: 3 },
          result: 'They smile back and the day improves.',
          journal: 'You exchanged a smile with someone on the street.',
        },
      },
      {
        id: 'approach',
        text: 'Cross and speak to them',
        effects: {
          stats: { happiness: 4, reputation: 1 },
          result: 'You talk for ten minutes and neither of you knows the other’s name yet.',
          journal: 'You crossed the street to speak to a stranger.',
        },
      },
      {
        id: 'keep-going',
        text: 'Keep going',
        effects: {
          stats: { happiness: -1 },
          result: 'You look back once and they are already gone.',
          journal: 'You walked past someone who had looked at you twice.',
        },
      },
    ],
  },
];

/** Times a walk event may happen in one life, like every repeatable event. */
export const WALK_EVENT_MAX = 6;
