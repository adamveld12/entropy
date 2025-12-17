import { useState } from 'react';
import type { WizardState, DrawnCard } from '@/lib/types';

const initialState: WizardState = {
  step: 'setup',
  intention: '',
  cardCount: 3,
  positions: ['Past', 'Present', 'Future'],
  questions: [],
  answers: [],
  drawnCards: [],
};

export function useWizard() {
  const [state, setState] = useState<WizardState>(initialState);

  const setIntention = (intention: string) => {
    setState((s) => ({ ...s, intention }));
  };

  const setCardCount = (count: number) => {
    setState((s) => ({
      ...s,
      cardCount: count,
      positions: Array.from({ length: count }, (_, i) => `Card ${i + 1}`),
    }));
  };

  const setPositions = (positions: string[]) => {
    setState((s) => ({ ...s, positions }));
  };

  const setQuestions = (questions: string[]) => {
    setState((s) => ({ ...s, questions, step: 'questions' }));
  };

  const setAnswers = (answers: string[]) => {
    setState((s) => ({ ...s, answers }));
  };

  const replaceQuestion = (index: number, newQuestion: string) => {
    setState((s) => ({
      ...s,
      questions: s.questions.map((q, i) => (i === index ? newQuestion : q)),
      answers: s.answers.map((a, i) => (i === index ? '' : a)),
    }));
  };

  const setDrawnCards = (cards: DrawnCard[]) => {
    setState((s) => ({ ...s, drawnCards: cards, step: 'draw' }));
  };

  const toReading = () => {
    setState((s) => ({ ...s, step: 'reading' }));
  };

  const reset = () => {
    setState(initialState);
  };

  return {
    state,
    setIntention,
    setCardCount,
    setPositions,
    setQuestions,
    setAnswers,
    replaceQuestion,
    setDrawnCards,
    toReading,
    reset,
  };
}
