"use client";

import { memo } from "react";
import { formatReadingDate, sharedReadingToCards } from "@/lib/share";
import type { ShareableReading } from "@/lib/types";

interface ReadingHistoryProps {
  readings: ShareableReading[];
  onSelect: (reading: ShareableReading) => void;
  onDelete: (timestamp: number) => void;
}

export default memo(function ReadingHistory({
  readings,
  onSelect,
  onDelete,
}: ReadingHistoryProps) {
  if (readings.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-amber-500 font-semibold text-lg mb-4">
          Your Readings
        </h2>
        <div className="bg-slate-900 rounded-lg p-8 text-center">
          <p className="text-slate-400">Your readings will show up here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-amber-500 font-semibold text-lg mb-4">
        Your Readings
      </h2>
      <div className="space-y-4">
        {readings.map((reading) => {
          const cards = sharedReadingToCards(reading);
          return (
            <div
              key={reading.d}
              className="bg-slate-900 rounded-lg p-4 cursor-pointer hover:bg-slate-800 transition-colors relative"
              onClick={() => onSelect(reading)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(reading.d);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-400 text-sm"
                aria-label="Delete reading"
              >
                ✕
              </button>
              <p className="text-slate-400 text-sm mb-1">
                {formatReadingDate(reading.d)}
              </p>
              <h3 className="text-amber-400 font-semibold mb-3">
                {reading.title || "Untitled Reading"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {cards.map((card, index) => (
                  <img
                    key={index}
                    src={card.image}
                    alt={card.name}
                    className={`w-10 h-14 object-cover rounded border border-amber-500/30 ${card.reversed ? "rotate-180" : ""}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
