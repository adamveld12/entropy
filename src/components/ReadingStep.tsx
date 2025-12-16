'use client';

import { memo, useState } from 'react';
import { encodeReading } from '@/lib/share';
import type { DrawnCard } from '@/lib/types';

interface ReadingStepProps {
  reading: string;
  cards: DrawnCard[];
  questions: string[];
  answers: string[];
  intention: string;
  onReset: () => void;
}

export default memo(function ReadingStep({
  reading,
  cards,
  questions,
  answers,
  intention,
  onReset,
}: ReadingStepProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const encoded = encodeReading(intention, questions, answers, cards, reading);
    const url = `${window.location.origin}/?r=${encoded}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-lg p-8 space-y-8">
      {/* Cards Section */}
      <section>
        <h2 className="text-amber-500 font-semibold text-lg mb-4">Cards Drawn</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((card, index) => (
            <div key={index} className="bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-slate-400 text-xs mb-1">{card.meaning}</p>
              <p className="text-amber-400 font-medium">{card.name}</p>
              {card.reversed && (
                <p className="text-slate-500 text-xs italic">Reversed</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Questions & Answers Section */}
      <section>
        <h2 className="text-amber-500 font-semibold text-lg mb-4">Your Reflections</h2>
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="bg-slate-800 rounded-lg p-4">
              <p className="text-amber-400 text-sm font-medium mb-2">{question}</p>
              <p className="text-slate-300 text-sm">{answers[index]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reading Section */}
      <section>
        <h2 className="text-amber-500 font-semibold text-lg mb-4">Your Reading</h2>
        <div className="prose prose-invert prose-amber max-w-none">
          <div className="text-slate-100 whitespace-pre-wrap leading-relaxed">
            {reading}
          </div>
        </div>
      </section>

      <div className="flex gap-4">
        <button
          onClick={handleShare}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold py-3 px-6 rounded transition-colors"
        >
          {copied ? 'Copied!' : 'Share Reading'}
        </button>
        <button
          onClick={onReset}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-6 rounded transition-colors"
        >
          New Reading
        </button>
      </div>
    </div>
  );
});
