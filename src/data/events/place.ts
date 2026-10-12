import type { LifeEvent } from '../../types';

/**
 * Events tied to one birthplace, gated on `places`.
 */
export const PLACE_EVENTS: LifeEvent[] = [
  
  {
    id: 'gen-london-bus-rain',
      title: 'Downpour in London',
      description: 'Waiting at the bus stop in {place}, the clouds unleash a torrential shower.',
      category: 'random',
      conditions: { minAge: 14, maxAge: 85, places: ['uk-london'], oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'pub',
          text: 'Duck into a dry, warm pub nearby',
          effects: { money: -2, stats: { happiness: 5 }, journal: 'You waited out a downpour inside a warm pub in {place}.', result: 'A warm fire and a friendly drink make the rain irrelevant.' },
        },
        {
          id: 'run',
          text: 'Run for the next stop and arrive soaked',
          effects: { stats: { health: 4, happiness: 3 }, journal: 'You ran for the next stop in the rain in {place}.', result: 'You are wet through and unreasonably pleased about it.' },
        },
      ]},


  {
    id: 'gen-brooklyn-bodega',
      title: 'The Bodega',
      description: 'The bodega on the corner in {place} is the only place open, and the man behind the counter knows your order.',
      category: 'social',
      conditions: { minAge: 14, maxAge: 85, places: ['usa-brooklyn'], oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        {
          id: 'chat',
          text: 'Ask what he thinks and stay a while',
          effects: { stats: { happiness: 5 }, meet: { kind: 'friend', status: 'behind the counter' }, chance: 0.5, journal: 'You stayed a while talking in the bodega in {place}.', result: 'He tells you three things you did not know about your own street.' },
        },
        {
          id: 'grab',
          text: 'Grab what you need and get out',
          effects: { stats: { happiness: 2 }, journal: 'You grabbed what you needed from the bodega in {place}.', result: 'He nods. You are both very busy.' },
        },
      ]},


  {
    id: 'gen-bengaluru-monsoon',
      title: 'The Monsoon Comes Back',
      description: 'The rain in {place} has not stopped for four hours and half the city is standing in it.',
      category: 'random',
      conditions: { minAge: 12, maxAge: 75, places: ['india-bengaluru'], oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'brave',
          text: 'Walk into it anyway',
          effects: { stats: { health: 3, happiness: 5 }, journal: 'You walked into the monsoon in {place}.', result: 'Within a minute you are soaked and completely unbothered.' },
        },
        {
          id: 'wait',
          text: 'Wait under the awning for it to pass',
          effects: { stats: { happiness: 3, smarts: 2 }, journal: 'You waited out the monsoon under an awning in {place}.', result: 'It does not pass. You watch the whole city do what you are doing.' },
        },
      ]},


  {
    id: 'gen-tokyo-platform',
      title: 'Nine Platforms',
      description: 'The station in {place} is nine deep with people and the train has not arrived for six minutes.',
      category: 'random',
      conditions: { minAge: 12, maxAge: 80, places: ['japan-tokyo'], oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'push',
          text: 'Push forward with everybody else',
          effects: { stats: { health: -2, happiness: 2 }, journal: 'You pushed forward for the train in {place}.', result: 'You get on. You do not get to choose where.' },
        },
        {
          id: 'wait',
          text: 'Let it empty first and board calmly',
          effects: { stats: { happiness: 3, smarts: 2 }, journal: 'You waited for the platform to empty before boarding in {place}.', result: 'The second train is nearly empty, and it costs you two minutes.' },
        },
      ]},


  {
    id: 'gen-lagos-traffic',
      title: 'The Traffic',
      description: 'The road out of {place} is solid traffic and the danfo driver says this is normal.',
      category: 'random',
      conditions: { minAge: 12, maxAge: 80, places: ['nigeria-lagos'], oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        {
          id: 'horn',
          text: 'Lean out and join the argument',
          effects: { stats: { happiness: 4, looks: 4 }, journal: 'You leaned out into the traffic in {place} and joined the argument.', result: 'Four hundred people agree with you immediately.' },
        },
        {
          id: 'patience',
          text: 'Sit back and accept it',
          effects: { stats: { happiness: 2, smarts: 3 }, journal: 'You sat back and accepted the traffic in {place}.', result: 'You get there eventually, and you have had a strange calm afternoon.' },
        },
      ]},


  {
    id: 'gen-saopaulo-gym',
      title: 'The Gym',
      description: 'There is a gym in {place} with a view of nothing but other people running on treadmills.',
      category: 'work',
      conditions: { minAge: 18, maxAge: 70, places: ['brazil-saopaulo'], oncePerLife: false, maxPerLife: 3 },
      weight: 2.4,
      choices: [
        { id: 'train', text: 'Train properly, all year, without stopping', effects: { money: -2, stats: { health: 8, looks: 5, happiness: -2 }, journal: 'You trained properly at the gym in {place}.', result: 'It works. It works slowly and it works anyway.' } },
        { id: 'quit', text: 'Pay for a month and stop going', effects: { money: -1, stats: { happiness: 3 }, journal: 'You stopped going to the gym in {place}.', result: 'The membership keeps charging for four months.' } },
      ]},


  {
    id: 'gen-saopaulo-coffee',
      title: 'The Coffee',
      description: 'The counter in {place} makes it exactly one way and you have been going in for years.',
      category: 'social',
      conditions: { minAge: 14, maxAge: 90, places: ['brazil-saopaulo'], oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'counter', text: 'Sit at the counter and let it take five minutes', effects: { money: -1, stats: { happiness: 5, smarts: 2 }, meet: { kind: 'friend', status: 'behind the coffee counter' }, chance: 0.5, journal: 'Sat at the counter over coffee in {place}.', result: 'You hear the entire street, and nothing that happens in it is yours.' } },
        { id: 'takeaway', text: 'Take it and go', effects: { money: -1, stats: { happiness: 2 }, journal: 'Took coffee away in {place}.', result: 'It is exactly the same coffee and none of the point.' } },
      ]},


  {
    id: 'gen-saopaulo-music',
      title: 'The Street Band',
      description: 'Somebody is playing drums two streets away at an hour that should be illegal.',
      category: 'social',
      conditions: { minAge: 12, maxAge: 80, places: ['brazil-saopaulo'], oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'find', text: 'Go and find out where that is coming from', effects: { stats: { happiness: 6 }, meet: { kind: 'friend', status: 'in the band you found' }, chance: 0.5, journal: 'You went to find the drumming in {place}.', result: 'It is eight people in a garage and they let you in.' } },
        { id: 'complain', text: 'Sleep through it and complain tomorrow', effects: { stats: { happiness: -2, health: -2 }, journal: 'You lost sleep to the drumming in {place} and complained about it.', result: 'Nobody is apologising, and the next night is worse.' } },
      ]},


  {
    id: 'gen-lagos-jollof',
      title: 'The Pot',
      description: 'Somebody in {place} is cooking jollof rice in a quantity that is clearly not for one person.',
      category: 'social',
      conditions: { minAge: 8, maxAge: 85, places: ['nigeria-lagos'], oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'asked', text: 'Ask, and be fed', effects: { stats: { happiness: 7 }, meet: { kind: 'friend', status: 'feeds you constantly' }, chance: 0.5, journal: 'You were fed in {place} for asking.', result: 'There is food in your hands and a chair you have been given.' } },
        { id: 'buy', text: 'Buy some and take it home', effects: { money: -1, stats: { happiness: 4 }, journal: 'You bought food in {place} and took it home.', result: 'It is excellent and you eat it in front of the television.' } },
      ]},


  {
    id: 'gen-lagos-aptop',
      title: 'Danfo',
      description: 'The bus in {place} is going where you need to go, in a way that is more of a suggestion.',
      category: 'random',
      conditions: { minAge: 10, maxAge: 80, places: ['nigeria-lagos'], oncePerLife: false, maxPerLife: 3 },
      weight: 2.4,
      choices: [
        { id: 'on', text: 'Get on and sort it out in motion', effects: { stats: { happiness: 5, health: -2 }, journal: 'You got on a bus in {place} and sorted it out in motion.', result: 'You are forty minutes late and you have been to three neighbourhoods.' } },
        { id: 'ride', text: 'Hire a bike instead', effects: { money: -1, stats: { health: 5, happiness: 2 }, journal: 'You hired a bike across {place} to avoid the traffic.', result: 'You arrive early and in a better mood than the bus would have allowed.' } },
      ]},


  {
    id: 'gen-melbourne-flat-white',
      title: 'The Usual',
      description: 'You have had the same coffee in {place} every morning for long enough that they do not ask any more.',
      category: 'social',
      conditions: { minAge: 12, maxAge: 90, places: ['australia-melbourne'], oncePerLife: false, maxPerLife: 3 },
      weight: 2.4,
      choices: [
        { id: 'usual', text: 'Order the usual and say nothing', effects: { money: -1, stats: { happiness: 4 }, journal: 'You ordered the usual coffee in {place}.', result: 'It is made before you have finished ordering it.' } },
        { id: 'change', text: 'Order something else and see what happens', effects: { money: -1, stats: { happiness: 3, smarts: 2 }, journal: 'You ordered something different in {place}.', result: 'It is worse, and you know exactly what you did.' } },
      ]},


  {
    id: 'gen-melbourne-weather',
      title: 'Four Seasons in One Day',
      description: 'The sky in {place} has gone through four kinds of weather since breakfast and there is a fourth coming.',
      category: 'random',
      conditions: { minAge: 6, maxAge: 90, places: ['australia-melbourne'], oncePerLife: false, maxPerLife: 3 },
      weight: 2,
      choices: [
        { id: 'layers', text: 'Carry a coat for the worst of it', effects: { stats: { happiness: 3, health: 3 }, journal: 'You carried a coat for the weather in {place}.', result: 'You use it twice before dinner.' } },
        { id: 'suffer', text: 'Dress for what it was when you left home', effects: { stats: { health: -3, happiness: 2 }, journal: 'You went out in {place} dressed for the wrong weather.', result: 'You spend the afternoon soaked and cold and oddly cheerful.' } },
      ]},


  {
    id: 'gen-tokyo-convenience',
      title: 'The Convenience Store',
      description: 'There is a store open in {place} at every hour, and the man behind the counter is on his hundredth shift.',
      category: 'social',
      conditions: { minAge: 12, maxAge: 90, places: ['japan-tokyo'], oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'chat', text: 'Ask him what is good tonight', effects: { stats: { happiness: 5 }, meet: { kind: 'friend', status: 'behind the counter at night' }, chance: 0.5, journal: 'You asked the night clerk in {place} what was good.', result: 'He tells you about three places and is entirely serious about it.' } },
        { id: 'buy', text: 'Buy what you came for and go', effects: { money: -1, stats: { happiness: 2 }, journal: 'You bought what you came for in {place}.', result: 'You are out again in nine seconds flat.' } },
      ]},


  {
    id: 'gen-tokyo-raincoat',
      title: 'Umbrella Economy',
      description: 'There is a stand of umbrellas outside the station in {place}, and half of them are spoken for.',
      category: 'random',
      conditions: { minAge: 6, maxAge: 90, places: ['japan-tokyo'], oncePerLife: false, maxPerLife: 3 },
      weight: 2.2,
      choices: [
        { id: 'buy', text: 'Buy one you will lose by the end of the week', effects: { money: -1, stats: { happiness: 3 }, journal: 'You bought an umbrella in {place}.', result: 'You have lost it by Thursday, as expected.' } },
        { id: 'run', text: 'Run, and accept the consequences for your bag', effects: { stats: { health: -2, happiness: 3 }, journal: 'You ran for the train in the rain in {place}.', result: 'You make it. The bag does not entirely make it.' } },
      ]},


  {
    id: 'gen-brooklyn-basketball',
      title: 'The Nets',
      description: 'There are hoops in {place} with nobody else around, and the light is exactly right.',
      category: 'social',
      conditions: { minAge: 10, maxAge: 60, places: ['usa-brooklyn'], oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'play', text: 'Play until somebody shows up', effects: { stats: { health: 7, happiness: 6, looks: 3 }, meet: { kind: 'friend', status: 'plays basketball with you' }, journal: 'You played basketball in {place} until somebody joined.', result: 'You are sweating and you have made a friend for the price of an hour.' } },
        { id: 'watch', text: 'Watch and talk to whoever came out', effects: { stats: { happiness: 4 }, meet: { kind: 'friend', status: 'watching the courts with you' }, chance: 0.5, journal: 'You watched the basketball in {place} and talked about it.', result: 'You learn the entire local argument without playing a minute of it.' } },
      ]},


  {
    id: 'gen-brooklyn-deli',
      title: 'The Deli Argument',
      description: 'There is a queue in {place} and somebody is at the front of it having a long argument about a sandwich.',
      category: 'social',
      conditions: { minAge: 10, maxAge: 90, places: ['usa-brooklyn'], oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'wait', text: 'Wait, and enjoy the argument', effects: { stats: { happiness: 6 }, meet: { kind: 'friend', status: 'in the queue with you' }, chance: 0.5, journal: 'You waited in a deli queue in {place} to hear the argument.', result: 'It resolves itself. It always resolves itself.' } },
        { id: 'leave', text: 'Go somewhere that does not have a queue', effects: { stats: { happiness: 2 }, journal: 'You left the deli queue in {place}.', result: 'You spend more money and have a worse sandwich.' } },
      ]},


  {
    id: 'gen-london-pub-quiz',
      title: 'The Quiz',
      description: 'There is a quiz night at the pub in {place} and a team that needs exactly one more person.',
      category: 'social',
      conditions: { minAge: 18, maxAge: 80, places: ['uk-london'], oncePerLife: false, maxPerLife: 3 },
      weight: 1,
      choices: [
        { id: 'join', text: 'Join the team and guess wildly', effects: { money: -2, stats: { happiness: 7 }, meet: { kind: 'friend', status: 'on your quiz team' }, chance: 0.5, journal: 'You played on a pub quiz team in {place}.', result: 'You get one question right by accident and the whole table celebrates it.' } },
        { id: 'answer', text: 'Answer from the back without joining', effects: { stats: { smarts: 4, happiness: 3 }, journal: 'You answered a pub quiz question from the back in {place}.', result: 'You are right, and nobody turns round.' } },
      ]},

];

