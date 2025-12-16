"use client";

import { memo, useState } from "react";
import { Streamdown } from "streamdown";
import { encodeReading, formatReadingDate } from "@/lib/share";
import type { DrawnCard } from "@/lib/types";

interface ReadingStepProps {
  reading: string;
  title?: string;
  readingDate: number;
  streaming?: boolean;
  cards: DrawnCard[];
  questions: string[];
  answers: string[];
  intention: string;
  onReset: () => void;
  onBack?: () => void;
}

export default memo(function ReadingStep({
  reading,
  title,
  readingDate,
  streaming = false,
  cards,
  questions,
  answers,
  intention,
  onReset,
  onBack,
}: ReadingStepProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const encoded = encodeReading(
      intention,
      questions,
      answers,
      cards,
      reading,
      title,
    );
    const url = `${window.location.origin}/?r=${encoded}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-lg p-8 space-y-8">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-2"
        >
          ← Another Reading Awaits
        </button>
      )}

      {/* Title and Date */}
      <header className="text-center space-y-2">
        <p className="text-slate-400 text-sm">
          {formatReadingDate(readingDate)}
        </p>
        <h2 className="text-2xl font-bold text-amber-400">
          {title || "Loading title..."}
        </h2>
      </header>

      {/* Cards Section */}
      <section>
        <h2 className="text-amber-500 font-semibold text-lg mb-4">
          Cards Drawn
        </h2>
        <div className="flex justify-evenly gap-4">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-slate-800 rounded-lg p-4 space-y-2 w-48"
            >
              <img
                src={card.image}
                alt={card.name}
                className={`w-full aspect-[2/3] rounded border border-amber-500/30 object-cover ${card.reversed ? "rotate-180" : ""} transition-transform`}
              />
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
      </section>

      {/* Intention Section */}
      <section>
        <h2 className="text-amber-500 font-semibold text-lg mb-4">
          Your Intention
        </h2>
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-slate-300 text-sm">{intention}</p>
        </div>
      </section>

      {/* Questions & Answers Section */}
      <section>
        <h2 className="text-amber-500 font-semibold text-lg mb-4">
          Your Reflections
        </h2>
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="bg-slate-800 rounded-lg p-4">
              <p className="text-amber-400 text-sm font-medium mb-2">
                {question}
              </p>
              <p className="text-slate-300 text-sm">{answers[index]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reading Section */}
      <section>
        <h2 className="text-amber-500 font-semibold text-lg mb-4">
          Your Reading
        </h2>
        <div className="prose prose-invert prose-amber max-w-none">
          {streaming && !reading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <Streamdown controls={true}>{reading}</Streamdown>
          )}
        </div>
      </section>

      <div className="flex gap-4">
        <button
          onClick={handleShare}
          disabled={streaming}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold py-3 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? "Copied!" : "Share Reading"}
        </button>
        <button
          onClick={onReset}
          disabled={streaming}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Another Reading Awaits
        </button>
      </div>
    </div>
  );
});
