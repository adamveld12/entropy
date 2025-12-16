export type Card = {
  id: string;
  name: string;
  image: string;
};

export type Deck = {
  id: string;
  name: string;
  themePrompt: string;
  cards: Card[];
};

export type DrawnCard = Card & {
  reversed: boolean;
  position: number;
  meaning: string;
};

export type ReadingContext = {
  intention: string;
  answers: string[];
  cards: DrawnCard[];
  deckTheme: string;
};

export type WizardState = {
  step: 'setup' | 'questions' | 'draw' | 'reading';
  intention: string;
  cardCount: number;
  positions: string[];
  questions: string[];
  answers: string[];
  drawnCards: DrawnCard[];
};

export type ShareableReading = {
  v: 1;
  i: string;
  q: string[];
  a: string[];
  c: Array<{ n: string; r: boolean; m: string }>;
  t: string;
  title?: string;
  d: number;  // timestamp
  shared?: boolean;  // true = from another user, false/undefined = self-generated
};
