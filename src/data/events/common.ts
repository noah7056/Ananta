import type { LifeEvent } from '../../types';

/**
 * Everything that can happen anywhere: illness, and the ages of a life.
 */
export const COMMON_EVENTS: LifeEvent[] = [

  // INFANCY & EARLY CHILDHOOD

  {
    id: 'baby-teething',
      title: 'Teething Pains',
      description: 'Your gums ache relentlessly as your first baby teeth push through. You sit in your cradle whimpering.',
      category: 'childhood',
      conditions: { minAge: 0, maxAge: 1, oncePerLife: true },
      weight: 2,
      choices: [
        {
          id: 'cry',
          text: 'Wail at the top of your lungs',
          effects: { stats: { happiness: -4 }, journal: 'You wailed loudly through your teething pains.', result: 'Your household rushes to soothe you with cool rags.' },
        },
        {
          id: 'chew',
          text: 'Gnaw on a wooden rattle',
          effects: { stats: { health: 3 }, journal: 'You chewed through teething pains on a wooden rattle.', result: 'Gnawing brings steady relief to your tender gums.' },
        },
      ]},


  {
    id: 'baby-first-steps',
      title: 'First Steps',
      description: 'Pulling yourself up against a wooden chair, you let go and take your first tentative steps across the rug.',
      category: 'childhood',
      conditions: { minAge: 1, maxAge: 2, oncePerLife: true },
      weight: 2.5,
      choices: [
        {
          id: 'wobble',
          text: 'Wobble forward with determination',
          effects: { stats: { happiness: 6 }, journal: 'You took your first steps without falling.', result: 'You cross the entire room before landing softly on your rear, beaming.' },
        },
        {
          id: 'crawl',
          text: 'Drop safely to your hands and knees',
          effects: { stats: { smarts: 3 }, journal: 'You decided crawling was much safer than walking.', result: 'Speed over pride: you scurry across the room like lightning.' },
        },
      ]},


  {
    id: 'baby-first-words',
      title: 'First Words',
      description: 'Your family leans over your crib, repeating simple words in the hopes you will speak.',
      category: 'childhood',
      conditions: { minAge: 1, maxAge: 2, oncePerLife: true },
      weight: 2.5,
      choices: [
        {
          id: 'mama',
          text: 'Say your family’s name',
          effects: { stats: { happiness: 7 }, journal: 'You spoke your first word clearly.', result: 'The entire household gasps and erupts into cheers.' },
        },
        {
          id: 'babble',
          text: 'Blow raspberries instead',
          effects: { journal: 'You blew raspberries instead of speaking your first word.', result: 'A spray of drool elicits helpless laughter from everyone.' },
        },
      ]},


  {
    id: 'baby-messy-food',
      title: 'A Bowl of Mash',
      description: 'A warm bowl of pureed mash is set in front of you. A spoon approaches your lips.',
      category: 'childhood',
      conditions: { minAge: 1, maxAge: 3, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'spit',
          text: 'Flap your arms and fling the bowl',
          effects: { stats: { happiness: 5 }, journal: 'You threw your bowl of food across the room.', result: 'Warm mash splatters against the wall. A memorable spectacle.' },
        },
        {
          id: 'eat',
          text: 'Eat quietly and smack your lips',
          effects: { stats: { health: 4 }, journal: 'You finished your porridge politely.', result: 'You clean the spoon and rub your tummy contentedly.' },
        },
      ]},


  {
    id: 'toddler-tantrum',
      title: 'Afternoon Nap',
      description: 'You are carried toward your bed for an afternoon nap, but you are not tired in the slightest.',
      category: 'childhood',
      conditions: { minAge: 2, maxAge: 4, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'tantrum',
          text: 'Throw an epic tantrum on the floor',
          effects: { stats: { happiness: -4 }, journal: 'You threw an almighty tantrum to avoid a nap.', result: 'You kick and roll until you wear yourself out completely.' },
        },
        {
          id: 'sleep',
          text: 'Surrender to your heavy eyelids',
          effects: { stats: { health: 4 }, journal: 'You drifted off to sleep for an afternoon nap.', result: 'You wake an hour later feeling fully refreshed and cheerful.' },
        },
      ]},


  {
    id: 'toddler-blocks',
      title: 'Building Blocks',
      description: 'On the floor of your home in {place}, you have a pile of assorted wooden scraps and toys.',
      category: 'childhood',
      conditions: { minAge: 2, maxAge: 4, oncePerLife: true },
      weight: 2,
      choices: [
        {
          id: 'tower',
          text: 'Stack them into a high tower',
          effects: { stats: { smarts: 5 }, journal: 'You built a remarkably tall toy tower.', result: 'Carefully balancing each piece, your creation stands tall.' },
        },
        {
          id: 'smash',
          text: 'Knock them across the rug',
          effects: { stats: { happiness: 5 }, journal: 'You gleefully smashed a pile of toy blocks.', result: 'The clatter echoes delightfully through the house.' },
        },
      ]}
,

  // CHILDHOOD

  {
    id: 'flu-season',
      title: 'The Seasonal Flu',
      description: 'Half of {place} is coughing into sleeves, and now your throat burns too. A fever is setting in fast.',
      category: 'illness',
      conditions: { minAge: 5, oncePerLife: false, maxPerLife: 3 },
      weight: 0.3,
      effects: { stats: { health: -3 }, addAilments: ['flu'], journal: 'You came down with the seasonal flu.' },
      choices: []},


  {
    id: 'spoiled-meal',
      title: 'A Doubtful Meal',
      description: 'The food served to you in {place} smells questionable. Hunger urges you to eat, but your stomach quickly revolts.',
      category: 'illness',
      conditions: { minAge: 8, oncePerLife: false, maxPerLife: 3 },
      weight: 0.3,
      effects: { stats: { health: -4 }, addAilments: ['stomach'], journal: 'You took sick from a bad meal.' },
      choices: []},


  {
    id: 'toddler-garden-wander',
      title: 'An Open Gate',
      description: 'The latch on the garden fence is unfastened. Beyond lies a patch of damp earth and buzzing bees.',
      category: 'childhood',
      conditions: { minAge: 3, maxAge: 5, oncePerLife: true },
      weight: 2,
      choices: [
        {
          id: 'explore',
          text: 'Trot into the garden to inspect the mud',
          effects: { stats: { happiness: 6 }, journal: 'You snuck into the garden and dug in the dirt.', result: 'You cover yourself head to toe in rich, squelchy mud.' },
        },
        {
          id: 'stay',
          text: 'Stay on the stone porch',
          effects: { stats: { smarts: 3 }, journal: 'You wisely avoided wandering off into the mud.', result: 'You watch the bees from safety, keeping clean and dry.' },
        },
      ]},


  {
    id: 'toddler-bedtime-tale',
      title: 'A Bedtime Tale',
      description: 'Curled under your blankets, someone in the house whispers an old folk story to help you sleep.',
      category: 'childhood',
      conditions: { minAge: 3, maxAge: 5, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'listen',
          text: 'Listen with wide, sparkling eyes',
          effects: { journal: 'You listened intently to an ancient bedtime tale.', result: 'Fanciful visions of heroes and beasts fill your dreams.' },
        },
        {
          id: 'yawn',
          text: 'Fall fast asleep mid-sentence',
          effects: { stats: { health: 3 }, journal: 'You fell asleep peacefully during a bedtime story.', result: 'Deep, uninterrupted sleep carries you to the morning.' },
        },
      ]},


  {
    id: 'child-lost-tooth',
      title: 'A Wobbly Tooth',
      description: 'Your front baby tooth has been wiggling for days. At breakfast, it finally comes completely loose.',
      category: 'childhood',
      conditions: { minAge: 6, maxAge: 9, oncePerLife: true },
      weight: 2,
      choices: [
        {
          id: 'pull',
          text: 'Give it one brave yank',
          effects: { stats: { looks: 4 }, journal: 'You pulled your own loose tooth out bravely.', result: 'Out it pops with barely a speck of blood. A gap-toothed grin!' },
        },
        {
          id: 'wait',
          text: 'Leave it until it falls into your soup',
          effects: { stats: { happiness: -3 }, journal: 'You accidentally swallowed a loose tooth during supper.', result: 'A sudden crunch, a bewildered gulp, and the tooth is gone.' },
        },
      ]},


  {
    id: 'child-playground-game',
      title: 'A Game of Tag',
      description: 'Children in the street or schoolyard are screaming and sprinting in an unruly game of tag.',
      category: 'social',
      conditions: { minAge: 6, maxAge: 11, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'sprint',
          text: 'Run until your lungs burn',
          effects: { stats: { health: 5 }, journal: 'You won a frantic game of tag with neighborhood children.', result: 'Nobody can catch you. You dodge every outstretched hand.' },
        },
        {
          id: 'hide',
          text: 'Hide behind the tool shed',
          effects: { stats: { smarts: 3 }, journal: 'You found an unbeatable hiding spot during tag.', result: 'You watch the chaos unfold while comfortably tucked away.' },
        },
      ]},


  {
    id: 'child-tree-climb',
      title: 'The Great Oak',
      description: 'A cluster of kids dares you to climb the gnarled oak tree towering over the yard in {place}.',
      category: 'childhood',
      conditions: { minAge: 7, maxAge: 11, oncePerLife: true },
      weight: 2,
      choices: [
        {
          id: 'climb',
          text: 'Scramble up to the high branches',
          effects: { stats: { happiness: 6 }, journal: 'You climbed to the very top of a great tree.', result: 'From high up, you can see all over the rooftops of {place}.' },
        },
        {
          id: 'slip',
          text: 'Slip on a wet branch and tumble',
          effects: { stats: { health: -5 }, journal: 'You fell from a tree branch and bruised your ribs.', result: 'You hit the dirt hard with the wind knocked out of you.' },
        },
        {
          id: 'refuse',
          text: 'Refuse the foolish dare',
          effects: { stats: { smarts: 3 }, journal: 'You refused a dangerous dare to climb a tree.', result: 'They tease you for five minutes, but you walk away unbroken.' },
        },
      ]},


  {
    id: 'child-chores',
      title: 'Household Chores',
      description: 'There are floors to scrub, wood to carry, and water to haul before supper is served.',
      category: 'family',
      conditions: { minAge: 7, maxAge: 11, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'work',
          text: 'Finish your chores without complaining',
          effects: { journal: 'You completed your household chores diligently.', result: 'Your household is genuinely impressed by your reliable work ethic.' },
        },
        {
          id: 'slack',
          text: 'Hide behind the woodpile until someone else does it',
          effects: { stats: { happiness: -3 }, journal: 'You got scolded for shirking your chores.', result: 'You are caught red-handed and given double the work.' },
        },
      ]},


  {
    id: 'child-mud-puddle',
      title: 'A Giant Puddle',
      description: 'A heavy downpour has left a colossal mud puddle right in the center of your walking path.',
      category: 'childhood',
      conditions: { minAge: 5, maxAge: 9, oncePerLife: false, maxPerLife: 3 },
      weight: 1.5,
      choices: [
        {
          id: 'jump',
          text: 'Stomp right into the middle of it',
          effects: { stats: { happiness: 6 }, journal: 'You stomped joyfully in a giant mud puddle.', result: 'A magnificent splash covers your shoes and stockings.' },
        },
        {
          id: 'skirt',
          text: 'Walk delicately around the rim',
          effects: { stats: { looks: 3 }, journal: 'You carefully kept your clothes clean around a mud puddle.', result: 'Your clothes stay immaculate while others get thoroughly drenched.' },
        },
      ]},


  {
    id: 'child-bookworm',
      title: 'A Dusty Volume',
      description: 'In an old cupboard, you uncover a thick book filled with curious diagrams and adventurous tales.',
      category: 'childhood',
      conditions: { minAge: 7, maxAge: 11, oncePerLife: true },
      weight: 2,
      choices: [
        {
          id: 'read',
          text: 'Read it by the hearth until late',
          effects: { stats: { smarts: 6 }, journal: 'You read an entire antique book from cover to cover.', result: 'Your mind races with vivid tales of distant lands and inventions.' },
        },
        {
          id: 'pictures',
          text: 'Flip through just to look at the drawings',
          effects: { stats: { happiness: 3 }, journal: 'You enjoyed looking at the drawings in an old book.', result: 'The sketches of strange creatures give you a pleasant afternoon.' },
        },
      ]},


  {
    id: 'kid-bug-jar',
      title: 'The Jar',
      description: 'You have caught something in a jar under the stairs, and you would like to keep it there.',
      category: 'childhood',
      conditions: { minAge: 5, maxAge: 12, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        { id: 'keep', text: 'Keep it in the jar', effects: { stats: { happiness: 4 }, meet: { kind: 'pet', status: 'in a jar on the stairs' }, chance: 0.4, journal: 'You kept something small in a jar under the stairs.', result: 'You check on it every day for a month.' } },
        { id: 'out', text: 'Take it outside and let it go', effects: { stats: { happiness: 2, smarts: 1 }, journal: 'You took the thing from the jar and let it go outside.', result: 'It is gone in a second, and you feel oddly flat about it.' } },
      ]},


  {
    id: 'kid-fort',
      title: 'The Fort',
      description: 'There are enough chairs and blankets in {place} to build something that is structurally, more or less, a fort.',
      category: 'childhood',
      conditions: { minAge: 5, maxAge: 11, oncePerLife: false, maxPerLife: 3 },
      weight: 2.2,
      choices: [
        { id: 'build', text: 'Build it properly and defend it', effects: { stats: { happiness: 6 }, journal: 'You built a fort out of chairs and blankets.', result: 'It is ridiculous and it is the safest place in the house.' } },
        { id: 'abandon', text: 'Start it and immediately lose interest', effects: { stats: { happiness: -2, smarts: 2 }, journal: 'You abandoned a fort half-built.', result: 'It stands there for a fortnight, then slowly falls over.' } },
      ]},


  {
    id: 'kid-swim',
      title: 'Deep End',
      description: 'The water is colder than expected and deeper than your feet will find the bottom of.',
      category: 'childhood',
      conditions: { minAge: 7, maxAge: 14, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        { id: 'jump', text: 'Jump in without testing it', effects: { stats: { happiness: 7, health: -3 }, journal: 'You jumped into the deep end without checking.', result: 'You surface spluttering and grinning like an idiot.' } },
        { id: 'wade', text: 'Test it first, then go in properly', effects: { stats: { health: 5, happiness: 3 }, journal: 'You tested the water before swimming.', result: 'You swim properly, and stay in twice as long.' } },
      ]},


  {
    id: 'kid-book',
      title: 'One More Chapter',
      description: 'It is well past the hour the lamp goes out and there is a chapter left.',
      category: 'childhood',
      conditions: { minAge: 6, maxAge: 13, oncePerLife: false, maxPerLife: 3 },
      weight: 2.2,
      choices: [
        { id: 'read', text: 'Read it by candle-stub', effects: { stats: { smarts: 6, health: -2 }, journal: 'You read past bedtime by a stub of candle.', result: 'You are asleep on the open book at some point in the small hours.' } },
        { id: 'sleep', text: 'Close it and go to sleep', effects: { stats: { health: 5, happiness: 1 }, journal: 'You closed the book and went to sleep.', result: 'You are rested, and you remember none of the ending.' } },
      ]},


  {
    id: 'kid-shoplift',
      title: 'The Sweet',
      description: 'You have money for exactly one of the things on the counter, and your hand has already started moving.',
      category: 'childhood',
      conditions: { minAge: 8, maxAge: 14, oncePerLife: false, maxPerLife: 3 },
      weight: 1.4,
      choices: [
        { id: 'pay', text: 'Pay for the one you can afford', effects: { money: -1, stats: { happiness: 2 }, journal: 'You bought the sweet you could afford.', result: 'It is not the best one, and it is fine.' } },
        { id: 'take', text: 'Walk out with it', effects: { stats: { happiness: 5, smarts: -3 }, journal: 'You walked out of the shop with something you did not pay for.', result: 'You get two streets away before your hands start shaking.' } },
      ]},


  {
    id: 'kid-lost',
      title: 'Lost',
      description: 'You cannot find your family, and the street you are on has four ways off it.',
      category: 'childhood',
      conditions: { minAge: 4, maxAge: 10, oncePerLife: false, maxPerLife: 3 },
      weight: 1.8,
      choices: [
        { id: 'stand', text: 'Stand still and wait where you are', effects: { stats: { smarts: 3, happiness: -3 }, journal: 'You stood still in the street until someone found you.', result: 'It works. Everyone is very glad, and also very annoyed.' } },
        { id: 'find', text: 'Go and find someone you recognise', effects: { stats: { happiness: 4, smarts: 2 }, journal: 'You found an adult you knew in an unfamiliar street.', result: 'You arrive slightly out of breath with a story they will tell for years.' } },
      ]},


  {
    id: 'kid-pet-ask',
      title: 'The Request',
      description: 'There is an animal you have been watching for a month, and you have decided you are going to ask.',
      category: 'childhood',
      conditions: { minAge: 6, maxAge: 13, oncePerLife: false, maxPerLife: 3 },
      weight: 1.6,
      choices: [
        { id: 'ask', text: 'Ask, and have prepared a whole speech', effects: { stats: { happiness: 4 }, meet: { kind: 'pet', status: 'asked for and got' }, chance: 0.35, journal: 'You asked for the animal at home and kept asking.', result: 'They give in eventually, which they always do.' } },
        { id: 'secret', text: 'Keep feeding it and say nothing to anyone', effects: { stats: { happiness: 5, smarts: -2 }, meet: { kind: 'pet', status: 'arrived without being asked for' }, chance: 0.2, journal: 'You fed an animal behind the shed without telling anyone.', result: 'It moves in. Nobody says anything, which is how you know it worked.' } },
      ]},


  {
    id: 'kid-game-again',
      title: 'Rematch',
      description: 'The same game, the same rules, the same four children, for the fourth afternoon running.',
      category: 'social',
      conditions: { minAge: 6, maxAge: 12, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        { id: 'again', text: 'Play again, and try something different this time', effects: { stats: { happiness: 5, smarts: 2 }, journal: 'You played the same game and tried a new way to play it.', result: 'It turns into a completely different game by half-time.' } },
        { id: 'quit', text: 'Decline and go and do your own thing', effects: { stats: { happiness: 3 }, journal: 'You stopped playing and went off to do your own thing.', result: 'They find another game in about ninety seconds.' } },
      ]},


  {
    id: 'kid-late-bedsheet',
      title: 'The Bedsheet',
      description: 'There is a bedsheet over the two chairs, and it is clear that this is now a private establishment.',
      category: 'childhood',
      conditions: { minAge: 5, maxAge: 12, oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'charge', text: 'Charge the public admission', effects: { stats: { happiness: 6, smarts: 3 }, money: 1, journal: 'You charged admission to the fort under the bedsheet.', result: 'Two older children pay you a penny and are allowed in.' } },
        { id: 'join', text: 'Knock and ask to join in', effects: { stats: { happiness: 5 }, meet: { kind: 'friend', status: 'in the fort with you' }, chance: 0.5, journal: 'You knocked on the fort and were let in.', result: 'You are immediately given the worst job in it.' } },
      ]},


  {
    id: 'kid-burn',
      title: 'The Fire',
      description: 'You have found a sheet of paper and something to write with, and also matches. There is one rule about matches.',
      category: 'peril',
      conditions: { minAge: 7, maxAge: 14, oncePerLife: false, maxPerLife: 2 },
      weight: 1.2,
      choices: [
        { id: 'play', text: 'Play with it', effects: { stats: { health: -12, happiness: 6 }, addAilments: ['cough'], journal: 'You played with matches and set fire to something.', result: 'It is out before anyone shouts, and you are not in any trouble.' } },
        { id: 'pocket', text: 'Put them back, exactly where they were', effects: { stats: { smarts: 3 }, journal: 'You put the matches back exactly where you found them.', result: 'Nobody ever finds out, and you feel oddly proud about it.' } },
      ]},


  {
    id: 'kid-snow',
      title: 'Snow',
      description: 'It has snowed properly, and the whole of {place} has agreed to go outside and stand in it.',
      category: 'childhood',
      conditions: { minAge: 5, maxAge: 14, oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'fight', text: 'Start a snow fight that will not end today', effects: { stats: { happiness: 7, health: -2 }, meet: { kind: 'friend', status: 'in the snow with you' }, chance: 0.5, journal: 'You started a snow fight in {place} that lasted all afternoon.', result: 'By evening there are two factions and a treaty nobody honours.' } },
        { id: 'track', text: 'Walk somewhere and leave tracks', effects: { stats: { happiness: 4, smarts: 3 }, journal: 'You walked out into the snow and left tracks behind you.', result: 'You find your own footprints waiting for you an hour later.' } },
      ]},


  {
    id: 'kid-argue',
      title: 'The Argument',
      description: 'You and someone in your household have been having the same argument in different words for three days.',
      category: 'family',
      conditions: { minAge: 8, maxAge: 16, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        { id: 'stand', text: 'Say the last word, loudly', effects: { stats: { happiness: 3 }, journal: 'You won an argument at home by refusing to back down.', result: 'You are satisfied. The other person is not.' } },
        { id: 'give', text: 'Say they are right and stop', effects: { stats: { happiness: -2, looks: 3 }, journal: 'You gave up an argument at home to keep the peace.', result: 'It ends immediately, and you feel strangely hollow about winning it.' } },
      ]},


  {
    id: 'kid-music',
      title: 'The Instrument',
      description: 'There is something in the house that makes a noise, and nobody has told you that you may not touch it.',
      category: 'childhood',
      conditions: { minAge: 7, maxAge: 15, oncePerLife: false, maxPerLife: 3 },
      weight: 1.6,
      choices: [
        { id: 'learn', text: 'Work out how to make it sing', effects: { stats: { smarts: 5, happiness: 4 }, journal: 'You taught yourself to play something in the house.', result: 'It is badly out of tune and completely worth it.' } },
        { id: 'break', text: 'Find out what happens if you are careless with it', effects: { stats: { happiness: 3, health: -2 }, money: -1, journal: 'You damaged an instrument in the house.', result: 'Nobody shouts, which somehow makes it worse.' } },
      ]},


  {
    id: 'teen-carnival',
      title: 'The Fair',
      description: 'A fair has come to {place} and it has brought lights, noise, and prizes nobody wins.',
      category: 'social',
      conditions: { minAge: 8, maxAge: 20, oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'spend', text: 'Spend everything on the rides with a stranger', effects: { money: -3, stats: { happiness: 8, health: -2 }, meet: { kind: 'friend', status: 'you went to the fair with' }, chance: 0.5, journal: 'You spent your money on the fair in {place}.', result: 'You are sick at the side of the road at midnight and glad about it.' } },
        { id: 'watch', text: 'Watch it and judge the rigging', effects: { stats: { smarts: 4, happiness: 2 }, journal: 'You watched the fair in {place} without betting on it.', result: 'You have strong opinions about the ring toss and you keep them to yourself.' } },
      ]}
,

  // ADOLESCENCE

  {
    id: 'teen-acne',
      title: 'A Sudden Breakout',
      description: 'You wake up, look into a polished mirror or tin basin, and find your forehead covered in angry red blemishes.',
      category: 'youth',
      conditions: { minAge: 12, maxAge: 16, oncePerLife: true },
      weight: 2,
      choices: [
        {
          id: 'squeeze',
          text: 'Squeeze and pick at them frantically',
          effects: { stats: { looks: -5 }, journal: 'You gave yourself red blemishes by picking at your skin.', result: 'Your face ends up red, raw, and considerably more noticeable.' },
        },
        {
          id: 'wash',
          text: 'Wash thoroughly and wait it out',
          effects: { stats: { looks: 3 }, journal: 'You washed your face patiently to clear a skin breakout.', result: 'With patience and clean water, your skin gradually settles down.' },
        },
      ]},


  {
    id: 'teen-first-crush',
      title: 'Classroom Distraction',
      description: 'During a lesson in {place}, you catch yourself staring at a peer across the room. They suddenly turn and smile.',
      category: 'youth',
      conditions: { minAge: 12, maxAge: 16, oncePerLife: true },
      weight: 1,
      choices: [
        {
          id: 'note',
          text: 'Pass them a folded note',
          effects: { stats: { happiness: 7 }, meet: { kind: 'friend', status: 'in your class' }, chance: 0.5, journal: 'You slipped a friendly note to your classroom crush.', result: 'They unfold it under their desk and smile warmly back at you.' },
        },
        {
          id: 'lookaway',
          text: 'Look down at your desk and blush furiously',
          effects: { journal: 'You blushed and looked away when your crush smiled.', result: 'Your cheeks burn with embarrassment as you stare at the floor.' },
        },
      ]},


  {
    id: 'teen-school-dance',
      title: 'The Annual Dance',
      description: 'Music echoes through the hall as young people gather in their best attire for the community dance in {place}.',
      category: 'social',
      conditions: { minAge: 14, maxAge: 17, oncePerLife: true },
      weight: 1,
      choices: [
        {
          id: 'dance',
          text: 'Find a partner and dance with gusto',
          effects: { stats: { happiness: 8 }, meet: { kind: 'friend', status: 'a dancing partner' }, chance: 0.5, journal: 'You danced energetically at the community dance.', result: 'You dance until your shoes are scuffed and your spirits are high.' },
        },
        {
          id: 'wallflower',
          text: 'Stay on the wall and watch the dancers',
          effects: { journal: 'You observed the dancers quietly from the sidelines.', result: 'A calm, reflective evening watching the merriment from afar.' },
        },
      ]},


  {
    id: 'teen-sneaking-out',
      title: 'Tapping on the Shutter',
      description: 'Past midnight, pebbles rattle against your window. Friends are whispering below, urging you to slip out.',
      category: 'youth',
      conditions: { minAge: 14, maxAge: 17, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'sneak',
          text: 'Climb down and join them in the dark',
          effects: { stats: { happiness: 7 }, journal: 'You snuck out into the night with neighborhood friends.', result: 'Running through empty streets beneath the stars is an unforgettable thrill.' },
        },
        {
          id: 'stay',
          text: 'Close the shutter and stay in bed',
          effects: { stats: { smarts: 4 }, journal: 'You resisted the temptation to sneak out at night.', result: 'You avoid the risk of being caught by night watchmen or parents.' },
        },
      ]},


  {
    id: 'teen-bicycle-cart',
      title: 'A Steep Hill',
      description: 'At the crest of a steep dirt hill in {place}, you stand with a borrowed bicycle, ready to coast down at reckless speed.',
      category: 'youth',
      conditions: { minAge: 12, maxAge: 16, eras: ['industrial', 'atomic', 'modern-day'], oncePerLife: true },
      weight: 2,
      choices: [
        {
          id: 'bomb',
          text: 'Carefully steer straight down without braking',
          effects: { stats: { happiness: 7 }, journal: 'You sped down a steep hill without touching the brakes.', result: 'Wind roars in your ears as you reach the bottom in pure exhilaration.' },
        },
        {
          id: 'crash',
          text: 'Lose control and tumble into the briars',
          effects: { stats: { health: -5 }, journal: 'You crashed into brambles while speeding down a hill.', result: 'Scraped shins and torn sleeves remind you of gravity’s stern rules.' },
        },
        {
          id: 'walkdown',
          text: 'Walk down cautiously instead',
          effects: { stats: { smarts: 3 }, journal: 'You walked down a steep slope safely.', result: 'Safe, sensible, and completely free of gravel in your knees.' },
        },
      ]},


  {
    id: 'teen-part-time-errand',
      title: 'Odd Errands',
      description: 'A local merchant in {place} needs someone young and swift to deliver parcels across the neighborhood.',
      category: 'work',
      conditions: { minAge: 13, maxAge: 17, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'work',
          text: 'Take the deliveries for pocket money',
          effects: { money: 3, journal: 'You earned pocket money running errands for a merchant.', result: 'A tiring afternoon of running, but coin clinks in your pocket.' },
        },
        {
          id: 'refuse',
          text: 'Keep your afternoon free for leisure',
          effects: { stats: { happiness: 4 }, journal: 'You spent your afternoon relaxing instead of working.', result: 'You lounge around carefree while the sun shines bright.' },
        },
      ]},


  {
    id: 'teen-exam-cram',
      title: 'Crucial Examination',
      description: 'Tomorrow morning is a major test that will determine your academic or vocational placement.',
      category: 'school',
      conditions: { minAge: 13, maxAge: 18, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'cram',
          text: 'Study through the night by candlelight',
          effects: { stats: { smarts: 6 }, journal: 'You studied through the night and passed your exam with flying colors.', result: 'Your eyes sting with fatigue, but your test score is stellar.' },
        },
        {
          id: 'sleep',
          text: 'Get eight hours of rest and trust your wits',
          effects: { stats: { health: 4 }, journal: 'You prioritized rest before a big academic examination.', result: 'You awake alert and steady, completing the exam with ease.' },
        },
      ]},


  {
    id: 'teen-notebook',
      title: 'The Notebook',
      description: 'You have started writing things down, and now you cannot stop noticing how much there is to say.',
      category: 'youth',
      conditions: { minAge: 12, maxAge: 20, oncePerLife: false, maxPerLife: 3 },
      weight: 2.2,
      choices: [
        { id: 'write', text: 'Keep at it, badly, every night', effects: { stats: { smarts: 7, happiness: 2 }, journal: 'You kept a notebook of everything that happened.', result: 'It is mostly shopping lists and one genuinely good page.' } },
        { id: 'burn', text: 'Burn it and pretend it did not happen', effects: { stats: { happiness: -2 }, journal: 'You burned the notebook you had started.', result: 'It is out of sight in under a minute.' } },
      ]},


  {
    id: 'teen-confession',
      title: 'Telling Someone',
      description: 'There is something you have been carrying around, and one person in {place} would not be shocked by it.',
      category: 'youth',
      conditions: { minAge: 13, maxAge: 20, oncePerLife: false, maxPerLife: 2 },
      weight: 1,
      choices: [
        { id: 'tell', text: 'Tell them', effects: { stats: { happiness: 7, smarts: 2 }, meet: { kind: 'friend', status: 'knows the worst of it' }, chance: 0.5, journal: 'You told someone the thing you had been carrying.', result: 'They do not make a fuss. That is somehow the best part.' } },
        { id: 'keep', text: 'Keep carrying it', effects: { stats: { happiness: -3, health: -2 }, journal: 'You kept carrying the thing you had not told anyone.', result: 'It gets heavier in a very specific way.' } },
      ]},


  {
    id: 'teen-busker',
      title: 'The Pitch',
      description: 'There is a corner in {place} where people slow down, and a case at your feet with what you can manage.',
      category: 'youth',
      conditions: { minAge: 14, maxAge: 22, oncePerLife: false, maxPerLife: 3 },
      weight: 1.8,
      choices: [
        { id: 'play', text: 'Play until someone drops something in', effects: { money: 2, stats: { looks: 3, happiness: 3 }, journal: 'You played on the street in {place} until someone paid you.', result: 'It takes four hours to earn the price of a meal.' } },
        { id: 'watch', text: 'Watch the street and learn who is walking where', effects: { stats: { smarts: 4 }, journal: 'You spent an afternoon watching who walks where in {place}.', result: 'You know this town better than you did this morning.' } },
      ]},


  {
    id: 'teen-trespass',
      title: 'The Sign',
      description: 'There is a building in {place} with a sign, and the sign is on a gate that does not lock properly.',
      category: 'youth',
      conditions: { minAge: 13, maxAge: 20, oncePerLife: false, maxPerLife: 3 },
      weight: 1.8,
      choices: [
        { id: 'in', text: 'Go in and look around', effects: { stats: { happiness: 6, smarts: 2, health: -2 }, journal: 'You got into a building you had no business in.', result: 'You get out, eventually, with an entire room still unexamined.' } },
        { id: 'walk', text: 'Walk past like you meant to be there', effects: { stats: { smarts: 3 }, journal: 'You walked past the sign and pretended you had somewhere to be.', result: 'You think about it again for the rest of the week.' } },
      ]},


  {
    id: 'teen-first-love',
      title: 'The Note',
      description: 'Somebody has asked you a question you have no technique for answering.',
      category: 'youth',
      conditions: { minAge: 13, maxAge: 19, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        { id: 'yes', text: 'Say the answer they wanted', effects: { stats: { happiness: 9 }, meet: { kind: 'partner', status: 'going steady with you' }, chance: 0.5, journal: 'You said yes when somebody asked you.', result: 'It is terrifying for about a week and then it is the best thing.' } },
        { id: 'no', text: 'Say what you actually think', effects: { stats: { happiness: 4, smarts: 2 }, journal: 'You turned somebody down honestly.', result: 'You feel better about it than you expected to.' } },
      ]},


  {
    id: 'teen-brawl',
      title: 'After',
      description: 'It happened outside a building in {place} and you are on the wrong side of it, and it is over now.',
      category: 'peril',
      conditions: { minAge: 13, maxAge: 24, oncePerLife: false, maxPerLife: 3 },
      weight: 1.5,
      choices: [
        { id: 'own', text: 'Own it', effects: { stats: { health: -6, happiness: -3, looks: -4 }, journal: 'You were in a fight outside {place} and admitted it.', result: 'Your face makes it obvious for a fortnight.' } },
        { id: 'blame', text: 'Give them the story that works', effects: { stats: { happiness: -4, smarts: -2 }, journal: 'You gave a different account of the fight in {place}.', result: 'It holds together for about two weeks.' } },
      ]},


  {
    id: 'teen-exam-night',
      title: 'The Night Before',
      description: 'It is tomorrow, and you have done less than you would have liked to have done.',
      category: 'school',
      conditions: { minAge: 14, maxAge: 19, oncePerLife: false, maxPerLife: 3 },
      weight: 2.4,
      choices: [
        { id: 'allnight', text: 'All of it, and hope for the best', effects: { stats: { smarts: 7, health: -6 }, journal: 'You studied all night before the exam.', result: 'You get through it on fumes and instinct.' } },
        { id: 'sleep', text: 'Sleep, and go in rested', effects: { stats: { health: 6, smarts: 2 }, journal: 'You slept properly before the exam.', result: 'You are clear-headed, and you can actually read the questions.' } },
      ]},


  {
    id: 'teen-rain',
      title: 'The Downpour',
      description: 'It has been raining for four hours and there is one dry doorway in {place} that everybody in the street has found.',
      category: 'youth',
      conditions: { minAge: 12, maxAge: 24, oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'talk', text: 'Talk to whoever else is sheltering there', effects: { stats: { happiness: 5 }, meet: { kind: 'friend', status: 'sheltering from the rain with you' }, chance: 0.5, journal: 'You talked to strangers in a doorway to escape the rain.', result: 'You end up twenty minutes late and do not mind.' } },
        { id: 'run', text: 'Run for it and get soaked anyway', effects: { stats: { health: -2, happiness: 3 }, journal: 'You ran through the rain and arrived soaked.', result: 'You are dripping on the floor and it was worth the run.' } },
      ]},


  {
    id: 'teen-late-letter',
      title: 'The Letter',
      description: 'Someone you have not heard from in a long time has written to you.',
      category: 'social',
      conditions: { minAge: 14, maxAge: 40, oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'reply', text: 'Write back properly, all of it', effects: { stats: { happiness: 6, smarts: 2 }, meet: { kind: 'friend', status: 'wrote to you after years' }, chance: 0.5, journal: 'You wrote back to someone you had lost touch with.', result: 'Four pages, and you post it before you can think better of it.' } },
        { id: 'short', text: 'Write two lines and post it', effects: { stats: { happiness: 2 }, journal: 'You sent a short letter to an old acquaintance.', result: 'It arrives, and it is enough to restart something.' } },
      ]},


  {
    id: 'adult-dog',
      title: 'The Dog on the Road',
      description: 'There is a dog on the road that is not going to move for anybody.',
      category: 'social',
      conditions: { minAge: 16, maxAge: 80, oncePerLife: false, maxPerLife: 3 },
      weight: 1.6,
      choices: [
        { id: 'take', text: 'Stop and try to catch it', effects: { stats: { happiness: 5, health: -2 }, meet: { kind: 'pet', status: 'you caught it on the road' }, chance: 0.45, journal: 'You caught a stray dog in {place}.', result: 'It comes home with you and refuses to leave again.' } },
        { id: 'call', text: 'Ring somebody and report it', effects: { money: 0, stats: { happiness: 3 }, journal: 'You reported a stray dog in {place}.', result: 'Someone comes for it within the hour. You watch the whole thing.' } },
      ]}
,

  // EARLY ADULTHOOD

  {
    id: 'young-roommate-dispute',
      title: 'Dirty Dishes',
      description: 'Your lodgings in {place} are shared with a housemate whose dirty pots have piled up in the basin for a week.',
      category: 'social',
      conditions: { minAge: 19, maxAge: 28, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'confront',
          text: 'Confront them directly about sharing the chore',
          effects: { journal: 'You stood up to your messy roommate over household chores.', result: 'After a tense conversation, they grumble and wash their pots.' },
        },
        {
          id: 'fume',
          text: 'Scrub them yourself while quietly fuming',
          effects: { stats: { happiness: -4 }, journal: 'You washed your roommate’s dirty dishes in silent resentment.', result: 'The dishes are clean, but your annoyance simmers for days.' },
        },
      ]},


  {
    id: 'young-dinner-date',
      title: 'An Evening Date',
      description: 'Someone you find charming invites you to share an evening meal at a quaint tavern or bistro in {place}.',
      category: 'social',
      conditions: { minAge: 18, maxAge: 29, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'charming',
          text: 'Wear your finest clothes and share laughter',
          effects: { stats: { happiness: 8 }, money: -2, journal: 'You had a wonderful romantic dinner date.', result: 'Conversation flows effortlessly, and you part with warm smiles.' },
        },
        {
          id: 'fumble',
          text: 'Spill drink down your front in nervousness',
          effects: { stats: { looks: -3 }, journal: 'You clumsily spilled your drink on an evening date.', result: 'You spend the rest of the meal trying to dab away the wet stain.' },
        },
      ]},


  {
    id: 'young-late-night-tavern',
      title: 'A Wild Night Out',
      description: 'After a grueling work week, acquaintances drag you into a rowdy public house alive with fiddle music and flowing ale.',
      category: 'social',
      conditions: { minAge: 18, maxAge: 28, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'party',
          text: 'Drink, sing, and dance until the small hours',
          effects: { stats: { happiness: 7 }, money: -3, journal: 'You celebrated late into the night at a bustling tavern.', result: 'A night of uproarious laughter, even if your head pounds the next morning.' },
        },
        {
          id: 'early',
          text: 'Have one glass and excuse yourself early',
          effects: { stats: { health: 4 }, journal: 'You turned in early while friends kept partying.', result: 'You wake up clear-headed and healthy the following morning.' },
        },
      ]},


  {
    id: 'young-marriage-proposal',
      title: 'A Question of the Heart',
      description: 'Your long-term companion pulls you aside in a quiet garden, holding out a silver ring and asking for your hand.',
      category: 'family',
      conditions: { minAge: 20, maxAge: 32, oncePerLife: true },
      weight: 1.5,
      choices: [
        {
          id: 'accept',
          text: 'Say yes with tears of joy in your eyes',
          effects: { stats: { happiness: 10 }, meet: { kind: 'partner', status: 'your spouse' }, journal: 'You happily accepted a proposal of marriage.', result: 'Embracing tightly, you begin planning a shared life together.' },
        },
        {
          id: 'hesitate',
          text: 'Admit gently that you are not ready',
          effects: { journal: 'You turned down a marriage proposal to remain independent.', result: 'It is a painful moment, but you remain true to your own path.' },
        },
      ]},


  {
    id: 'young-fitness-routine',
      title: 'A Personal Regimen',
      description: 'Feeling sluggish from sedentary work, you decide to start a rigorous routine of morning calisthenics.',
      category: 'youth',
      conditions: { minAge: 18, maxAge: 35, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'train',
          text: 'Stick to morning sprints and heavy lifting',
          effects: { stats: { health: 6 }, journal: 'You dedicated yourself to a rigorous fitness routine.', result: 'Your endurance sharpens and your posture improves noticeably.' },
        },
        {
          id: 'quit',
          text: 'Give up after the second sore morning',
          effects: { stats: { happiness: -2 }, journal: 'You abandoned a fitness regimen after two days.', result: 'Your muscles ache and your resolve melts away back into bed.' },
        },
      ]},


  {
    id: 'adult-boss-overtime',
      title: 'Heavy Backlog',
      description: '{boss} says the backlog has to move tonight, and looks at you when they say it.',
      category: 'work',
      conditions: { minAge: 20, maxAge: 58, requiresBoss: true, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'grind',
          text: 'Put in the nights',
          effects: { stats: { health: -6 }, journal: 'You worked nights because {boss} asked.', result: 'You get it done, and feel every hour of it.' },
        },
        {
          id: 'rest',
          text: 'Refuse and go home on time',
          effects: { performance: -8, journal: 'You turned down the extra nights.', result: 'Your standing slips a little. {boss} notices.' },
        },
      ]},


  {
    id: 'adult-charity-drive',
      title: 'Local Relief Fund',
      description: 'A harsh season has left poorer families in {place} struggling for sustenance. A relief collection is underway.',
      category: 'social',
      conditions: { minAge: 28, maxAge: 65, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'donate',
          text: 'Give a generous portion of your coin',
          effects: { money: -3, journal: 'You gave generously to a local relief fund.', result: 'Your contribution brings warm soup and blankets to those in need.' },
        },
        {
          id: 'keep',
          text: 'Save your funds for your own household',
          effects: { stats: { smarts: 2 }, journal: 'You hoarded your savings during a charity appeal.', result: 'You keep your funds secure, prioritizing personal prudence.' },
        },
      ]},


  {
    id: 'adult-flat',
      title: 'The Deposit',
      description: 'The flat in {place} is exactly what you can afford, which is the problem.',
      category: 'adult',
      conditions: { minAge: 19, maxAge: 45, oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'take', text: 'Take it and move in', effects: { money: -5, stats: { happiness: 6, smarts: 2 }, journal: 'You moved into a small flat in {place}.', result: 'One room, a window, and no one to ask you anything.' } },
        { id: 'room', text: 'Take a room instead, with people in it', effects: { money: -2, stats: { happiness: 3 }, meet: { kind: 'friend', status: 'a housemate in {place}' }, chance: 0.5, journal: 'You took a shared room in {place}.', result: 'It is louder than you expected and you end up liking it.' } },
      ]},


  {
    id: 'adult-presentation',
      title: 'The Presentation',
      description: 'You have to stand up and explain your work to a room of people who get paid to interrupt.',
      category: 'work',
      conditions: { minAge: 22, maxAge: 55, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        { id: 'steady', text: 'Take it slowly, and finish on time', effects: { stats: { smarts: 6, happiness: -2 }, journal: 'You gave a presentation at work in {place}.', result: 'You are not the best speaker, but you finish, which counts.' } },
        { id: 'fast', text: 'Go in fast and get it behind you', effects: { stats: { happiness: 4, looks: 3, smarts: 1 }, journal: 'You rushed a presentation at work.', result: 'It is over in half the time and nobody minds.' } },
      ]},


  {
    id: 'adult-apprentice-boss',
      title: 'The Master',
      description: 'The person you learned from wants a word, and wants it privately.',
      category: 'work',
      conditions: { minAge: 20, maxAge: 60, oncePerLife: false, maxPerLife: 2 },
      weight: 1.6,
      choices: [
        { id: 'listen', text: 'Listen to the criticism', effects: { stats: { smarts: 6, happiness: -2 }, journal: 'You took serious criticism from someone you work for.', result: 'It is accurate and it stings for a week.' } },
        { id: 'defend', text: 'Defend your own way of working', effects: { stats: { happiness: 4, smarts: -1 }, journal: 'You pushed back on criticism from your master.', result: 'They back down. You are not sure that was a good outcome.' } },
      ]},


  {
    id: 'adult-confession-desk',
      title: 'The Conversation',
      description: 'Somebody at work has asked you to talk properly, and has already found the door.',
      category: 'social',
      conditions: { minAge: 20, maxAge: 60, oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'open', text: 'Actually talk', effects: { stats: { happiness: 6, smarts: 3 }, meet: { kind: 'friend', status: 'a friend from work' }, chance: 0.5, journal: 'You talked honestly with somebody at work.', result: 'It turns out both of you had the same problem.' } },
        { id: 'deflect', text: 'Keep it professional and change the subject', effects: { stats: { happiness: -2 }, journal: 'You changed the subject when a colleague wanted to talk.', result: 'You think about it on the walk home.' } },
      ]},


  {
    id: 'adult-new-neighbourhood',
      title: 'The Street',
      description: 'You have moved to a part of {place} where nobody has met you and nobody expects to.',
      category: 'adult',
      conditions: { minAge: 20, maxAge: 70, oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'knock', text: 'Knock on doors until somebody answers', effects: { stats: { happiness: 5 }, meet: { kind: 'friend', status: 'a neighbour in {place}' }, chance: 0.6, journal: 'You knocked on doors to introduce yourself in {place}.', result: 'The fourth door takes forever to open, and then it is lovely.' } },
        { id: 'wait', text: 'Give it a year', effects: { stats: { happiness: -2, smarts: 2 }, journal: 'You gave a new street in {place} a year to know you.', result: 'By spring there are two people who wave.' } },
      ]},


  {
    id: 'adult-illegal-offer',
      title: 'The Offer on the Side',
      description: 'Somebody has money for something you know well and should not sell.',
      category: 'peril',
      conditions: { minAge: 19, maxAge: 60, oncePerLife: false, maxPerLife: 2 },
      weight: 1.4,
      choices: [
        { id: 'refuse', text: 'Say no and keep your name clean', effects: { money: -1, stats: { happiness: 2, smarts: 2 }, journal: 'You turned down money for something you should not have sold.', result: 'You are poorer by a small amount and easier to sleep at night.' } },
        { id: 'take', text: 'Take it', effects: { money: 8, stats: { happiness: 5, smarts: -3 }, journal: 'You sold something you should not have sold.', result: 'The money is real and so is the fact that you did it.' } },
      ]},


  {
    id: 'adult-neighbour-noise',
      title: 'The Noise',
      description: 'The neighbours in {place} have been working a drill at unreasonable hours and you have counted every one.',
      category: 'peril',
      conditions: { minAge: 20, maxAge: 85, oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'talk', text: 'Go and say something face to face', effects: { stats: { happiness: 3 }, meet: { kind: 'friend', status: 'a neighbour in {place}' }, chance: 0.5, journal: 'You had it out with the neighbours in {place}.', result: 'They apologise, and are a bit strange about it for a week.' } },
        { id: 'endure', text: 'Put something through the wall', effects: { stats: { happiness: -2, health: -2 }, journal: 'You fought the neighbours in {place} through the wall.', result: 'It escalates for about a month and then stops.' } },
      ]},


  {
    id: 'adult-night-shift',
      title: 'The Night Shift',
      description: 'There is overtime going, and the money is the kind that makes you think about it on the bus home.',
      category: 'work',
      conditions: { minAge: 20, maxAge: 58, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        { id: 'work', text: 'Work the whole thing', effects: { money: 5, stats: { health: -7, happiness: -4 }, journal: 'You worked a run of night shifts.', result: 'You earn well for about a month and then everything hurts.' } },
        { id: 'decline', text: 'Give it to somebody who needs it', effects: { stats: { happiness: 4, smarts: 2 }, journal: 'You gave the night shift to somebody else.', result: 'They are delighted. You sleep properly.' } },
      ]},


  {
    id: 'adult-old-friend-lost',
      title: 'The Address',
      description: 'You have an old address for somebody you have not spoken to in years, and it is a piece of paper.',
      category: 'social',
      conditions: { minAge: 24, maxAge: 70, oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'write', text: 'Write, with no expectation of an answer', effects: { stats: { happiness: 4, smarts: 2 }, meet: { kind: 'friend', status: 'you wrote to them after years' }, journal: 'You wrote to an old friend at an old address.', result: 'A reply comes back three weeks later, out of nowhere.' } },
        { id: 'bin', text: 'Bin the piece of paper', effects: { stats: { happiness: -2 }, journal: 'You threw away an old address instead of writing.', result: 'It occurs to you occasionally, and then you stop thinking about it.' } },
      ]},


  {
    id: 'adult-gambling',
      title: 'The Game on the Corner',
      description: 'There is a table on the corner of {place} and somebody at it knows your name.',
      category: 'peril',
      conditions: { minAge: 19, maxAge: 65, oncePerLife: false, maxPerLife: 3 },
      weight: 1.8,
      choices: [
        { id: 'play', text: 'Play once, and only once', effects: { money: -3, stats: { happiness: 4, smarts: 1 }, journal: 'You played at a table on the corner of {place}.', result: 'You lose exactly what you said you would and then some.' } },
        { id: 'walk', text: 'Keep walking', effects: { stats: { smarts: 3 }, journal: 'You kept walking past the table on the corner.', result: 'Somebody calls after you. You do not stop.' } },
      ]},


  {
    id: 'adult-neighbour-bake',
      title: 'The Tin',
      description: 'Something has been left on your step in {place} wrapped in foil, still warm.',
      category: 'social',
      conditions: { minAge: 20, maxAge: 85, oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'return', text: 'Knock and give it back', effects: { stats: { happiness: 6 }, meet: { kind: 'friend', status: 'a neighbour in {place}' }, journal: 'You returned the tin left on your step in {place}.', result: 'It turns into a standing arrangement within a month.' } },
        { id: 'eat', text: 'Keep it and say nothing', effects: { money: -1, stats: { happiness: 3 }, journal: 'You kept the tin left on your step.', result: 'It is gone by morning. Nobody ever says a word about it.' } },
      ]},


  {
    id: 'mid-old-friend-wedding',
      title: 'The Invitation',
      description: 'Somebody from years ago is getting married, and has put you on the list.',
      category: 'social',
      conditions: { minAge: 25, maxAge: 75, oncePerLife: false, maxPerLife: 3 },
      weight: 1.8,
      choices: [
        { id: 'attend', text: 'Go, and dance, and be seen', effects: { money: -3, stats: { happiness: 7, looks: 3 }, journal: 'You went to a wedding in {place}.', result: 'You are introduced to four people who will matter later.' } },
        { id: 'decline', text: 'Send a card and an excuse', effects: { money: -1, stats: { happiness: 1 }, journal: 'You sent your regrets to a wedding in {place}.', result: 'You find out about it from a photograph.' } },
      ]}
,

  // ADULTHOOD

  {
    id: 'winter-cough',
      title: 'The Cough That Lingers',
      description: 'Weeks after a winter chill, you still cough through conversations in {place}. It refuses to clear.',
      category: 'illness',
      conditions: { minAge: 30, maxAge: 85, oncePerLife: false, maxPerLife: 3 },
      weight: 0.3,
      effects: { stats: { health: -2 }, addAilments: ['cough'], journal: 'Your cold settled into a lingering cough.' },
      choices: []},


  {
    id: 'stiff-joints',
      title: 'Stiff Joints',
      description: 'Mornings in {place} have started painfully: your knees and knuckles ache until midday. Age is filing its claim.',
      category: 'illness',
      conditions: { minAge: 50, maxAge: 95, oncePerLife: false, maxPerLife: 3 },
      weight: 0.3,
      effects: { stats: { health: -2 }, addAilments: ['joints'], journal: 'Your joints stiffened with age.' },
      choices: []},


  {
    id: 'adult-roof-leak',
      title: 'A Leaking Roof',
      description: 'Heavy autumn rain exposes a rotting patch on your ceiling in {place}. Water steadily drips into a metal pot.',
      category: 'adult',
      conditions: { minAge: 30, maxAge: 58, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'hire',
          text: 'Pay a master carpenter to replace the shingles',
          effects: { money: -4, stats: { happiness: 4 }, journal: 'You paid a carpenter to repair your leaking roof.', result: 'The timber is secured, and your home is dry and warm once more.' },
        },
        {
          id: 'climb',
          text: 'Climb up in the rain to patch it with tar yourself',
          effects: { stats: { smarts: 4 }, journal: 'You climbed onto your roof and patched a leak yourself.', result: 'Your hands are sticky with tar, but the water stops coming through.' },
        },
      ]},


  {
    id: 'adult-midlife-crisis',
      title: 'The Passing Years',
      description: 'Catching your reflection in {place}, you realize youth has quietly slipped into mature adulthood.',
      category: 'adult',
      conditions: { minAge: 40, maxAge: 55, oncePerLife: true },
      weight: 2,
      choices: [
        {
          id: 'hobby',
          text: 'Take up a vibrant, youthful new hobby',
          effects: { stats: { happiness: 7 }, journal: 'You revitalized your spirit with a colorful new hobby.', result: 'Engaging your curiosity brings a surge of youthful excitement.' },
        },
        {
          id: 'grace',
          text: 'Accept the passing of decades with peace',
          effects: { journal: 'You embraced middle age with calm dignity.', result: 'Experience and wisdom bring a comfort that youth never possessed.' },
        },
      ]},


  {
    id: 'adult-neighbor-fence',
      title: 'Property Dispute',
      description: 'Your neighbor has built a timber fence encroaching noticeably across your property line in {place}.',
      category: 'adult',
      conditions: { minAge: 30, maxAge: 62, oncePerLife: true },
      weight: 1.5,
      choices: [
        {
          id: 'survey',
          text: 'Bring the town deed and demand they move it',
          effects: { stats: { smarts: 5 }, journal: 'You successfully defended your property boundaries in a dispute.', result: 'Presented with clear deeds, the neighbor begrudgingly shifts the fence.' },
        },
        {
          id: 'peace',
          text: 'Let it go to maintain a peaceful neighborhood',
          effects: { journal: 'You let a small property dispute slide for neighborly peace.', result: 'A few inches of soil are lost, but cordial greetings continue.' },
        },
      ]},


  {
    id: 'adult-reunion-friend',
      title: 'An Old Friend Visits',
      description: 'A close companion from your childhood passes through {place} and unexpectedly knocks on your door.',
      category: 'social',
      conditions: { minAge: 32, maxAge: 65, oncePerLife: true },
      weight: 1,
      choices: [
        {
          id: 'feast',
          text: 'Cook a feast and reminisce for hours',
          effects: { stats: { happiness: 9 }, money: -2, meet: { kind: 'friend', status: 'an old friend from childhood' }, journal: 'You hosted a delightful reunion with a childhood friend.', result: 'Laughing over old memories makes decades melt away in an evening.' },
        },
        {
          id: 'brief',
          text: 'Exchange brief polite words at the threshold',
          effects: { journal: 'You kept an encounter with an old friend brief and distant.', result: 'Time has built an invisible wall between you both.' },
        },
      ]},


  {
    id: 'adult-back-spasm',
      title: 'A Jolt in the Spine',
      description: 'Lifting a heavy timber chest in your home, a sudden sharp shock spasms down your lower back.',
      category: 'peril',
      conditions: { minAge: 40, maxAge: 65, oncePerLife: false, maxPerLife: 3 },
      weight: 1.5,
      choices: [
        {
          id: 'rest',
          text: 'Lie flat on the floor and apply warm cloths',
          effects: { stats: { health: 3 }, journal: 'You rested your back carefully after a sudden spasm.', result: 'The muscles slowly relax, easing the intense ache.' },
        },
        {
          id: 'push',
          text: 'Keep carrying the load anyway',
          effects: { stats: { health: -5 }, journal: 'You worsened a back injury by pushing through the pain.', result: 'A sickening twinge leaves you unable to bend without groaning.' },
        },
      ]},


  {
    id: 'elder-grandchildren',
      title: 'Young Visitors',
      description: 'Young children in your extended family come tumbling through your home in {place}, clamoring for attention.',
      category: 'family',
      conditions: { minAge: 58, maxAge: 85, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'treats',
          text: 'Bake honey treats and tell dramatic stories',
          effects: { stats: { happiness: 9 }, journal: 'You entertained younger relatives with treats and stories.', result: 'Wide-eyed children hang on your every word with adoration.' },
        },
        {
          id: 'quiet',
          text: 'Grumble about the shouting and seek quiet',
          effects: { stats: { happiness: -2 }, journal: 'You complained about the noisy energy of young visitors.', result: 'The youngsters quiet down, looking slightly disappointed.' },
        },
      ]},


  {
    id: 'mid-back-ache',
      title: 'The Back',
      description: 'Something you have done for thirty years has stopped being a thing your body does for free.',
      category: 'adult',
      conditions: { minAge: 38, maxAge: 80, oncePerLife: false, maxPerLife: 3 },
      weight: 2.2,
      choices: [
        { id: 'rest', text: 'Rest it properly for a month', effects: { money: -2, stats: { health: 8, happiness: -2 }, journal: 'You rested an old injury for a month.', result: 'You come back to it in better shape than you had before.' } },
        { id: 'push', text: 'Carry on as if nothing has happened', effects: { stats: { health: -7 }, journal: 'You carried on working through a bad injury.', result: 'It becomes the kind of pain you plan your week around.' } },
      ]},


  {
    id: 'mid-old-school',
      title: 'The Reunion',
      description: 'Somebody from long ago is in {place}, and has suggested that everyone get together.',
      category: 'social',
      conditions: { minAge: 40, maxAge: 80, oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'go', text: 'Go, and enjoy being looked at', effects: { money: -2, stats: { happiness: 6 }, meet: { kind: 'friend', status: 'from the old days' }, chance: 0.5, journal: 'You went to a reunion in {place}.', result: 'Everybody has aged differently and none of it is bad.' } },
        { id: 'skip', text: 'Stay at home and regret nothing', effects: { stats: { happiness: -2, smarts: 2 }, journal: 'You skipped a reunion.', result: 'You find out how it went about six months later.' } },
      ]},


  {
    id: 'mid-mentor',
      title: 'The Younger One',
      description: 'There is somebody at work in {place} who keeps asking you how things are done here.',
      category: 'work',
      conditions: { minAge: 40, maxAge: 68, oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'teach', text: 'Show them properly', effects: { stats: { happiness: 6, smarts: 3 }, meet: { kind: 'friend', status: 'someone you trained' }, chance: 0.5, journal: 'You trained somebody at work in {place}.', result: 'They are better at the job than you were at that age.' } },
        { id: 'hoard', text: 'Keep it to yourself', effects: { stats: { happiness: -2 }, journal: 'You kept your methods to yourself at work.', result: 'You are indispensable, and never asked about anything.' } },
      ]},


  {
    id: 'mid-grief',
      title: 'The Anniversary',
      description: 'It is the date, and the whole house has quietly agreed not to mention it.',
      category: 'family',
      conditions: { minAge: 35, maxAge: 90, oncePerLife: false, maxPerLife: 3 },
      weight: 1.6,
      choices: [
        { id: 'name', text: 'Say their name out loud', effects: { stats: { happiness: -4, looks: 3 }, journal: 'You said their name out loud on the anniversary.', result: 'It is very hard, and afterwards the house is lighter.' } },
        { id: 'silent', text: 'Let the day pass without speaking of it', effects: { stats: { happiness: -2, health: -3 }, journal: 'You let the anniversary pass in silence.', result: 'Nobody says anything all day, and everybody is thinking about it.' } },
      ]},


  {
    id: 'mid-walk-daily',
      title: 'The Same Route',
      description: 'You have walked the same road out of {place} for years, and today you notice you still do.',
      category: 'adult',
      conditions: { minAge: 40, maxAge: 90, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        { id: 'new', text: 'Turn off down a street you have never taken', effects: { stats: { happiness: 6, smarts: 2 }, journal: 'You walked a road you had never taken in {place}.', result: 'There is a whole street of things you had no idea was there.' } },
        { id: 'same', text: 'Walk it again, the way you always do', effects: { stats: { health: 5, happiness: 2 }, journal: 'You walked the same route out of {place} again.', result: 'You know exactly how long it takes and what the light does at the corner.' } },
      ]},


  {
    id: 'mid-teeth',
      title: 'The Dentist',
      description: 'A tooth has been making its opinion known for about six months.',
      category: 'illness',
      conditions: { minAge: 30, maxAge: 95, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        { id: 'fix', text: 'Have it seen to properly', effects: { money: -3, stats: { health: 7, looks: 3 }, journal: 'You had troublesome teeth properly treated.', result: 'Two appointments and an amount of money you would rather not count.' } },
        { id: 'wait', text: 'Put it off another year', effects: { stats: { health: -5, happiness: -3 }, journal: 'You put off having a bad tooth seen to.', result: 'You stop eating on that side without deciding to.' } },
      ]},


  {
    id: 'mid-volunteer',
      title: 'The Ask',
      description: 'A cause in {place} is short of hands and would like yours, for free, indefinitely.',
      category: 'adult',
      conditions: { minAge: 30, maxAge: 85, oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'join', text: 'Join them one afternoon a week', effects: { stats: { happiness: 7, health: 2 }, meet: { kind: 'friend', status: 'volunteering with you' }, chance: 0.5, journal: 'You started volunteering in {place}.', result: 'It is more work than you agreed to and you keep doing it.' } },
        { id: 'decline', text: 'Say no', effects: { stats: { happiness: -2 }, journal: 'You turned down volunteering in {place}.', result: 'They thank you anyway, which is somehow worse.' } },
      ]},


  {
    id: 'mid-cat-nap',
      title: 'The Chair',
      description: 'The chair in {place} is warm and it is mid-afternoon and nobody is expecting you anywhere.',
      category: 'adult',
      conditions: { minAge: 45, maxAge: 95, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        { id: 'sleep', text: 'Give in to it', effects: { stats: { health: 6, happiness: 4 }, journal: 'You slept in the afternoon in {place}.', result: 'You wake up an hour later feeling like a different man.' } },
        { id: 'push', text: 'Get through the afternoon on coffee', effects: { stats: { health: -4, smarts: 3 }, journal: 'You got through the afternoon on coffee.', result: 'You finish the day and then do not sleep until two.' } },
      ]}
,

  // LATER LIFE

  {
    id: 'stroke-scare',
      title: 'A Seizing Pain',
      description: 'Mid-sentence, your arm goes numb and your vision blurs. In {place}, everyone knows what this can mean.',
      category: 'illness',
      conditions: { minAge: 60, maxAge: 95, oncePerLife: true },
      weight: 0.3,
      effects: { stats: { health: -8 }, addAilments: ['frailty'], journal: 'You suffered a sudden seizure.' },
      choices: []},


  {
    id: 'elder-retirement',
      title: 'Stepping Down',
      description: 'After decades of labor, the time has arrived to hand your tools and duties over to younger hands.',
      category: 'adult',
      conditions: { minAge: 60, maxAge: 72, oncePerLife: true },
      weight: 2.5,
      choices: [
        {
          id: 'retire',
          text: 'Retire with pride and enjoy your free days',
          effects: { stats: { happiness: 8 }, journal: 'You formally retired from your lifelong trade.', result: 'A sense of immense relief washes over you. Your time is finally your own.' },
        },
        {
          id: 'tinker',
          text: 'Keep doing small odd jobs to stay active',
          effects: { journal: 'You continued taking small odd jobs in your senior years.', result: 'Staying busy keeps your hands agile and your mind alert.' },
        },
      ]},


  {
    id: 'elder-tending-garden',
      title: 'Morning in the Garden',
      description: 'The morning sun warms your shoulders as you tend to a quiet vegetable and flower plot behind your house.',
      category: 'adult',
      conditions: { minAge: 60, maxAge: 90, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'weed',
          text: 'Prune the rose bushes and pull wild weeds',
          effects: { journal: 'You spent a peaceful morning gardening.', result: 'Working with the soil brings deep serenity to your heart.' },
        },
        {
          id: 'sit',
          text: 'Sit on a bench with a cup of tea',
          effects: { stats: { health: 3 }, journal: 'You rested peacefully in your sunlit garden.', result: 'A gentle breeze and warm sunshine soothe your joints.' },
        },
      ]},


  {
    id: 'elder-scam-letter',
      title: 'A Questionable Offer',
      description: 'A stranger delivers a letter promising that a wealthy estate in a distant province has named you sole heir — for a small upfront fee.',
      category: 'random',
      conditions: { minAge: 62, maxAge: 90, oncePerLife: true },
      weight: 1.5,
      choices: [
        {
          id: 'burn',
          text: 'Toss the obvious swindle into the hearth fire',
          effects: { stats: { smarts: 5 }, journal: 'You exposed and burned a fraudulent swindler’s letter.', result: 'You scoff at the foolish attempt to dupe a veteran of life.' },
        },
        {
          id: 'pay',
          text: 'Send coins in hopes of sudden fortune',
          effects: { money: -6, stats: { happiness: -6 }, journal: 'You fell victim to a deceptive inheritance scam.', result: 'Your coins vanish into thin air, leaving you foolish and poorer.' },
        },
      ]},


  {
    id: 'elder-memoirs',
      title: 'Chronicle of a Life',
      description: 'Sitting at your table in {place}, you place ink and parchment before you to write down the history of your days.',
      category: 'adult',
      conditions: { minAge: 65, maxAge: 95, oncePerLife: true },
      weight: 2,
      choices: [
        {
          id: 'write',
          text: 'Pen your memoirs for future generations',
          effects: { stats: { smarts: 6 }, journal: 'You completed writing your personal memoirs.', result: 'A lifetime of hard lessons and joy is bound neatly on the page.' },
        },
        {
          id: 'ponder',
          text: 'Reflect privately on all that you have seen',
          effects: { journal: 'You quietly contemplated the tapestry of your life.', result: 'Content with the journey, you set the pen down peacefully.' },
        },
      ]},


  {
    id: 'elder-old-tunes',
      title: 'A Song from Youth',
      description: 'A busker or flutist in the square of {place} plays a melody you have not heard in half a century.',
      category: 'social',
      conditions: { minAge: 60, maxAge: 95, oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'hum',
          text: 'Hum along softly as tears well up',
          effects: { journal: 'You listened with emotion to a tune from your youth.', result: 'Every note carries echoes of faces and laughter long departed.' },
        },
        {
          id: 'coin',
          text: 'Drop a coin into the musician’s hat',
          effects: { money: -1, stats: { happiness: 5 }, journal: 'You tipped a street musician playing an old song.', result: 'The minstrel bows warmly as the nostalgic melody concludes.' },
        },
      ]},


  {
    id: 'crime-pickpocket',
    title: 'An Easy Mark',
    description: 'A stranger in the crowd at {place} is close enough that the purse at their belt is practically asking for it.',
    category: 'peril',
    conditions: { minAge: 12, maxAge: 60, oncePerLife: false, maxPerLife: 3 },
    weight: 1.2,
    choices: [
      {
        id: 'do-it',
        text: 'Lift the purse',
        effects: { journal: 'You went for the purse.', result: 'Your hand moves before your mind does.' },
      },
      {
        id: 'walk-away',
        text: 'Walk away',
        effects: { stats: { happiness: 1 }, journal: 'You walked away from an easy mark.', result: 'Your pockets stay light and your name stays clean.' },
      },
    ],
  },

  {
    id: 'crime-burglary',
    title: 'The Empty House',
    description: 'A house on the edge of {place} stands empty at this hour, and the lock is the kind that opens to patience.',
    category: 'peril',
    conditions: { minAge: 14, maxAge: 55, oncePerLife: false, maxPerLife: 3 },
    weight: 1,
    choices: [
      {
        id: 'do-it',
        text: 'Force the lock',
        effects: { journal: 'You forced the lock on an empty house.', result: 'The door gives with a crack.' },
      },
      {
        id: 'walk-away',
        text: 'Leave it',
        effects: { stats: { happiness: 1 }, journal: 'You left the empty house alone.', result: 'Some houses keep their own counsel.' },
      },
    ],
  },

];

