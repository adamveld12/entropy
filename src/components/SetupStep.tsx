"use client";

import { memo } from "react";
import { Spinner } from "./Spinner";

interface SetupStepProps {
  intention: string;
  cardCount: number;
  positions: string[];
  loading?: boolean;
  onIntentionChange: (value: string) => void;
  onCardCountChange: (count: number) => void;
  onPositionsChange: (positions: string[]) => void;
  onSubmit: () => void;
}

export default memo(function SetupStep({
  intention,
  cardCount,
  positions,
  loading = false,
  onIntentionChange,
  onCardCountChange,
  onPositionsChange,
  onSubmit,
}: SetupStepProps) {
  const handlePositionChange = (index: number, value: string): void => {
    const newPositions = [...positions];
    newPositions[index] = value;
    onPositionsChange(newPositions);
  };

  const handleCardCountChange = (count: number): void => {
    onCardCountChange(count);
    const newPositions = Array.from(
      { length: count },
      (_, i) => positions[i] || "",
    );
    onPositionsChange(newPositions);
  };

  const isValid =
    intention.trim().length > 0 && positions.every((p) => p.trim().length > 0);

  return (
    <div className="bg-slate-900 rounded-lg p-8 space-y-6">
      <div>
        <label className="block text-amber-500 text-sm font-semibold mb-2">
          Your Intention
        </label>
        <textarea
          value={intention}
          onChange={(e) => onIntentionChange(e.target.value)}
          className="w-full bg-slate-800 text-slate-100 rounded px-4 py-3 min-h-32 focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="What guidance do you seek?"
          required
        />
      </div>

      <div>
        <label className="block text-amber-500 text-sm font-semibold mb-2">
          Number of Cards
        </label>
        <input
          type="number"
          min={3}
          max={10}
          value={cardCount}
          onChange={(e) => handleCardCountChange(parseInt(e.target.value) || 3)}
          className="w-full bg-slate-800 text-slate-100 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-amber-500 text-sm font-semibold mb-2">
          Position Meanings
        </label>
        <div className="space-y-3">
          {positions.map((position, index) => (
            <input
              key={index}
              type="text"
              value={position}
              onChange={(e) => handlePositionChange(index, e.target.value)}
              placeholder={`Position ${index + 1} meaning`}
              className="w-full bg-slate-800 text-slate-100 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          ))}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!isValid || loading}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold py-3 px-6 rounded transition-colors"
      >
        {loading ? (
          <>
            <Spinner className="text-slate-900 mr-2" />
            Contemplating Questions...
          </>
        ) : (
          "Question Me"
        )}
      </button>
    </div>
  );
});
