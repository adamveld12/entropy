'use client';

import { memo } from 'react';

interface QuestionsStepProps {
  questions: string[];
  answers: string[];
  onAnswersChange: (answers: string[]) => void;
  onSubmit: () => void;
  onRegenerateQuestion: (index: number) => Promise<void>;
  regeneratingIndex: number | null;
}

export default memo(function QuestionsStep({
  questions,
  answers,
  onAnswersChange,
  onSubmit,
  onRegenerateQuestion,
  regeneratingIndex,
}: QuestionsStepProps) {
  const handleAnswerChange = (index: number, value: string): void => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    onAnswersChange(newAnswers);
  };

  const isValid = answers.every(a => (a ?? '').trim().length > 0);

  return (
    <div className="bg-slate-900 rounded-lg p-8 space-y-6">
      {questions.map((question, index) => (
        <div key={index}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <label
              className={`text-amber-500 text-sm font-semibold flex-1 ${
                regeneratingIndex === index ? 'animate-pulse' : ''
              }`}
            >
              {question}
            </label>
            {!answers[index]?.trim() && (
              <button
                onClick={() => onRegenerateQuestion(index)}
                disabled={regeneratingIndex !== null}
                className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full text-amber-400 hover:text-amber-300 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Generate different question"
              >
                <span className={`text-2xl ${regeneratingIndex === index ? 'animate-spin' : ''}`}>
                  ↻
                </span>
              </button>
            )}
          </div>
          <textarea
            value={answers[index] || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="w-full bg-slate-800 text-slate-100 rounded px-4 py-3 min-h-32 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Share your thoughts..."
            required
          />
        </div>
      ))}

      <button
        onClick={onSubmit}
        disabled={!isValid || regeneratingIndex !== null}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold py-3 px-6 rounded transition-colors"
      >
        Draw Cards
      </button>
    </div>
  );
});
