"use client";

import { memo } from "react";
import { Spinner } from "./Spinner";

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
      <div className="flex content-around">
        {cards.map((card, index) => (
          <div key={index} className="bg-slate-800 rounded-lg p-4 space-y-2">
            <div
              className={`aspect-[2/3] bg-gradient-to-br from-amber-900/50 to-slate-900 rounded flex items-center justify-center border border-amber-500/30 ${card.reversed ? "rotate-180" : ""} transition-transform`}
            >
              <span className="text-amber-500/70 text-xs text-center px-2 font-serif">
                {card.name}
              </span>
            </div>
            <div className="text-center">
              <p className="text-amber-500 font-semibold text-sm">
                {card.name}
              </p>
              {card.reversed && (
                <p className="text-slate-400 text-xs italic">Reversed</p>
              )}
              <p className="text-slate-300 text-xs mt-1">{card.meaning}</p>
            </div>
          </div>
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
