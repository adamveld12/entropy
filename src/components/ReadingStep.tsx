'use client';

import { memo } from 'react';

interface ReadingStepProps {
  reading: string;
  onReset: () => void;
}

export default memo(function ReadingStep({
  reading,
  onReset,
}: ReadingStepProps) {
  return (
    <div className="bg-slate-900 rounded-lg p-8 space-y-6">
      <div className="prose prose-invert prose-amber max-w-none">
        <div className="text-slate-100 whitespace-pre-wrap leading-relaxed">
          {reading}
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-6 rounded transition-colors"
      >
        New Reading
      </button>
    </div>
  );
});
