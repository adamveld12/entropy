'use client';

import { memo } from 'react';

interface QuestionsStepProps {
  questions: string[];
  answers: string[];
  onAnswersChange: (answers: string[]) => void;
  onSubmit: () => void;
}

export default memo(function QuestionsStep({
  questions,
  answers,
  onAnswersChange,
  onSubmit,
}: QuestionsStepProps) {
  const handleAnswerChange = (index: number, value: string): void => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    onAnswersChange(newAnswers);
  };

  const isValid = answers.every(a => a.trim().length > 0);

  return (
    <div className="bg-slate-900 rounded-lg p-8 space-y-6">
      {questions.map((question, index) => (
        <div key={index}>
          <label className="block text-amber-500 text-sm font-semibold mb-2">
            {question}
          </label>
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
        disabled={!isValid}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold py-3 px-6 rounded transition-colors"
      >
        Draw Cards
      </button>
    </div>
  );
});
