'use client';

import { useState } from 'react';
import { useWizard } from '@/hooks/useWizard';
import SetupStep from '@/components/SetupStep';
import QuestionsStep from '@/components/QuestionsStep';
import DrawStep from '@/components/DrawStep';
import ReadingStep from '@/components/ReadingStep';
import { createSeededRNG, drawCards } from '@/lib/entropy';
import { STANDARD_DECK } from '@/lib/deck';
import type { ReadingContext } from '@/lib/types';

export default function Home() {
  const wizard = useWizard();
  const [reading, setReading] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const handleSetupSubmit = async () => {
    try {
      setLoadingQuestions(true);
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intention: wizard.state.intention }),
      });
      if (!res.ok) throw new Error('Failed to generate questions');
      const { questions } = await res.json();
      wizard.setQuestions(questions);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleQuestionsSubmit = async () => {
    const rng = await createSeededRNG(wizard.state.answers);
    const cards = drawCards(
      STANDARD_DECK.cards,
      wizard.state.cardCount,
      wizard.state.positions,
      rng
    );
    wizard.setDrawnCards(cards);
  };

  const handleGetReading = async () => {
    setStreaming(true);
    setReading('');

    const context: ReadingContext = {
      intention: wizard.state.intention,
      answers: wizard.state.answers,
      cards: wizard.state.drawnCards,
      deckTheme: STANDARD_DECK.themePrompt,
    };

    const res = await fetch('/api/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setReading((prev) => prev + chunk);
      }
    }

    wizard.toReading();
    setStreaming(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-400 tracking-wide">Entropy</h1>
          <p className="text-slate-400 mt-2">A Tarot Reading Experience</p>
        </div>

        {wizard.state.step === 'setup' && (
          <SetupStep
            intention={wizard.state.intention}
            cardCount={wizard.state.cardCount}
            positions={wizard.state.positions}
            onIntentionChange={wizard.setIntention}
            onCardCountChange={wizard.setCardCount}
            onPositionsChange={wizard.setPositions}
            onSubmit={handleSetupSubmit}
            loading={loadingQuestions}
          />
        )}

        {wizard.state.step === 'questions' && (
          <QuestionsStep
            questions={wizard.state.questions}
            answers={wizard.state.answers}
            onAnswersChange={wizard.setAnswers}
            onSubmit={handleQuestionsSubmit}
          />
        )}

        {wizard.state.step === 'draw' && (
          <DrawStep
            cards={wizard.state.drawnCards}
            onGetReading={handleGetReading}
            streaming={streaming}
          />
        )}

        {wizard.state.step === 'reading' && (
          <ReadingStep reading={reading} onReset={wizard.reset} />
        )}
      </div>
    </div>
  );
}
