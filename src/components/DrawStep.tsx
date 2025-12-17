"use client";

import { memo } from "react";
import { Spinner } from "./Spinner";
import { TarotCard } from "./TarotCard";

import type { DrawnCard } from "@/lib/types";

interface DrawStepProps {
  cards: DrawnCard[];
  onGetReading: () => void;
  streaming?: boolean;
}

export default memo(function DrawStep({
  cards,
  onGetReading,
  streaming,
}: DrawStepProps) {
  return (
    <div className="bg-slate-900 rounded-lg p-8 space-y-6 flex-col">
      <div className="flex justify-evenly gap-4">
        {cards.map((card, index) => (
          <TarotCard key={index} card={card} />
        ))}
      </div>

      <button
        onClick={onGetReading}
        disabled={streaming}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-slate-900 font-bold py-3 px-6 rounded transition-colors"
      >
        {streaming ? (
          <>
            <Spinner className="text-slate-900 mr-2" />
            Reading the cards...
          </>
        ) : (
          "Get Your Reading"
        )}
      </button>
    </div>
  );
});
