/**
 * Interview questions for applying to a job. One absurd answer is
 * always spliced into the four options and fails the interview; the
 * other three get you hired, and are recorded in the journal so the
 * type of answer matters in the life record.
 */

export interface InterviewAnswer {
  id: string;
  /** the button text */
  text: string;
  /** the absurd option — fails the interview */
  absurd?: boolean;
  /** short journal sentence describing how you came across */
  journal: string;
  /** one-line outcome shown in the popup */
  result: string;
}

export interface InterviewQuestion {
  id: string;
  /** the question asked, supports {place} */
  question: string;
  /** three sane answers; the absurd one is spliced in at random */
  answers: [InterviewAnswer, InterviewAnswer, InterviewAnswer];
  /** the absurd answer, spliced in at random */
  absurd: InterviewAnswer;
}

export const INTERVIEWS: InterviewQuestion[] = [
  {
    id: 'why-you',
    question:
      'Why do you want this position, and what do you bring to it?',
    answers: [
      {
        id: 'why-honest',
        text: 'Answer plainly, and mention what you actually know',
        journal:
          'You answered plainly in the interview, and named the work you already knew.',
        result:
          'They nod slowly — plain answers from someone who knows the work are worth more than polish.',
      },
      {
        id: 'why-effort',
        text: 'Talk about how hard you are willing to work',
        journal: 'You promised hard work in your interview.',
        result:
          'Willingness to work hard is the one currency everyone accepts.',
      },
      {
        id: 'why-examples',
        text: 'Give a concrete example of a problem you solved',
        journal:
          'You backed up your answer in the interview with a real problem you had solved.',
        result:
          'A real example settles the matter faster than any certificate.',
      },
    ],
    absurd: {
      id: 'why-absurd',
      text: 'Say you would work there for the smell of the place',
      journal: 'You gave a strange answer in your interview and it did not go over well.',
      result:
        'The room goes quiet. They thank you for your time and you can tell how that went.',
    },
  },
  {
    id: 'salary',
    question: 'What are you expecting to be paid?',
    answers: [
      {
        id: 'pay-fair',
        text: 'Name a fair figure and say you can grow into it',
        journal: 'You asked for fair pay in your interview and offered to grow into it.',
        result:
          'Naming a number without flinching reads as confidence.',
      },
      {
        id: 'pay-whatever',
        text: 'Say you will take whatever they offer',
        journal: 'You said you would take whatever you were offered in your interview.',
        result:
          'Eagerness is fine in small doses. They note it and move on.',
      },
      {
        id: 'pay-questions',
        text: 'Ask what the role involves before answering',
        journal: 'You turned the salary question back on them in your interview.',
        result:
          'Asking about the work before the money is a sharp instinct, and they respect it.',
      },
    ],
    absurd: {
      id: 'pay-absurd',
      text: 'Ask whether the job comes with food',
      journal: 'You asked about the food during your interview.',
      result:
        'You are not sure they understood the question. The interview ends early.',
    },
  },
  {
    id: 'weakness',
    question: 'What is your greatest weakness?',
    answers: [
      {
        id: 'weak-honest',
        text: 'Admit one, and say what you do about it',
        journal: 'You admitted a weakness in your interview and said what you do about it.',
        result:
          'Naming it plainly, with a plan attached, reads as honesty under pressure.',
      },
      {
        id: 'weak-work',
        text: 'Say you work too hard and it costs you sleep',
        journal: 'You told the interview you work too hard.',
        result:
          'A stock answer, but a safe one. Nobody argues with it.',
      },
      {
        id: 'weak-ask',
        text: 'Turn it around and ask about theirs',
        journal: 'You turned the weakness question back on the interview panel.',
        result:
          'Bold, and it works more often than it has any right to.',
      },
    ],
    absurd: {
      id: 'weak-absurd',
      text: 'Say your weakness is that you are too charming',
      journal: 'You claimed to be too charming in your interview.',
      result:
        'The panel exchanges glances. The interview concludes without an offer.',
    },
  },
  {
    id: 'hours',
    question: 'The hours are long. Are you available for them?',
    answers: [
      {
        id: 'hours-yes',
        text: 'Say yes, without conditions',
        journal: 'You accepted the long hours in your interview without conditions.',
        result: 'Straight answers about hours are always the shortest interview.',
      },
      {
        id: 'hours-plan',
        text: 'Say yes, and say how you would manage the rest',
        journal: 'You agreed to the long hours and said how you would manage the rest.',
        result:
          'They like an answer that comes with a plan attached.',
      },
      {
        id: 'hours-range',
        text: 'Ask which days they actually need you',
        journal: 'You asked in your interview which days they really needed you.',
        result:
          'Knowing exactly where you stand is worth more than blind enthusiasm.',
      },
    ],
    absurd: {
      id: 'hours-absurd',
      text: 'Ask whether you can be paid in sleeping',
      journal: 'You tried to negotiate your hours in sleeping during your interview.',
      result:
        'That one ends the interview. They suggest you come back when you are serious.',
    },
  },
  {
    id: 'first-day',
    question: 'Walk us through your first day on the job.',
    answers: [
      {
        id: 'first-early',
        text: 'Say you would arrive early and watch how things are done',
        journal: 'You said in your interview that you would arrive early and watch how the work is done.',
        result:
          'Arriving early to watch is the answer every decent boss wants to hear.',
      },
      {
        id: 'first-ready',
        text: 'Say you would ask what is needed first',
        journal: 'You said in your interview that you would ask what is needed first.',
        result: 'Asking first is a careful answer, and it lands carefully well.',
      },
      {
        id: 'first-nerves',
        text: 'Say you would be nervous and ask where to start',
        journal: 'You admitted in your interview that you would be nervous on your first day.',
        result:
          'Honesty about nerves reads as self-awareness, not weakness.',
      },
    ],
    absurd: {
      id: 'first-absurd',
      text: 'Say you would start by taking the day off',
      journal: 'You said in your interview that you would start your first day by taking it off.',
      result:
        'The interview ends there. You walk out knowing you blew it.',
    },
  },
];
