"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useWizard } from "@/hooks/useWizard";
import SetupStep from "@/components/SetupStep";
import QuestionsStep from "@/components/QuestionsStep";
import DrawStep from "@/components/DrawStep";
import ReadingStep from "@/components/ReadingStep";
import { createSeededRNG, drawCards } from "@/lib/entropy";
import { STANDARD_DECK } from "@/lib/deck";
import {
  decodeReading,
  sharedReadingToCards,
  formatReadingDate,
} from "@/lib/share";
import type { ReadingContext, ShareableReading } from "@/lib/types";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const wizard = useWizard();
  const searchParams = useSearchParams();
  const [reading, setReading] = useState("");
  const [title, setTitle] = useState("");
  const [readingDate, setReadingDate] = useState(Date.now());
  const [streaming, setStreaming] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [sharedReading, setSharedReading] = useState<ShareableReading | null>(
    null,
  );
  const [shareError, setShareError] = useState(false);

  useEffect(() => {
    const encoded = searchParams.get("r");
    if (encoded) {
      const decoded = decodeReading(encoded);
      if (decoded) {
        setSharedReading(decoded);
      } else {
        setShareError(true);
      }
    }
  }, [searchParams]);

  // Generate title for shared readings that don't have one
  useEffect(() => {
    if (sharedReading && !sharedReading.title && !title) {
      const generateTitle = async () => {
        const res = await fetch("/api/title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intention: sharedReading.i,
            cards: sharedReadingToCards(sharedReading),
          }),
        });
        const { title: generatedTitle } = await res.json();
        setTitle(generatedTitle);
      };
      generateTitle();
    }
  }, [sharedReading, title]);

  const handleReset = () => {
    setSharedReading(null);
    setShareError(false);
    wizard.reset();
    window.history.pushState({}, "", "/");
  };

  const handleSetupSubmit = async () => {
    try {
      setLoadingQuestions(true);
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intention: wizard.state.intention }),
      });
      if (!res.ok) throw new Error("Failed to generate questions");
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
      rng,
    );
    wizard.setDrawnCards(cards);
  };

  const handleGetReading = async () => {
    setStreaming(true);
    setReading("");
    setTitle("");
    setReadingDate(Date.now());
    wizard.toReading();

    // Generate title first
    const titleRes = await fetch("/api/title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        intention: wizard.state.intention,
        cards: wizard.state.drawnCards,
      }),
    });
    const { title: generatedTitle } = await titleRes.json();
    setTitle(generatedTitle);

    // Then stream the reading
    const context: ReadingContext = {
      intention: wizard.state.intention,
      answers: wizard.state.answers,
      cards: wizard.state.drawnCards,
      deckTheme: STANDARD_DECK.themePrompt,
    };

    const res = await fetch("/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

    setStreaming(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-400 tracking-wide">
            Entropy
          </h1>
          <p className="text-slate-400 mt-2">A Tarot Reading Experience</p>
        </div>

        {shareError && !sharedReading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-center">
            <p className="text-red-400 text-sm">
              There was something wrong with the reading you tried to see. Ask
              the person to share it again.
            </p>
          </div>
        )}

        {!sharedReading && wizard.state.step === "setup" && (
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

        {!sharedReading && wizard.state.step === "questions" && (
          <QuestionsStep
            questions={wizard.state.questions}
            answers={wizard.state.answers}
            onAnswersChange={wizard.setAnswers}
            onSubmit={handleQuestionsSubmit}
          />
        )}

        {!sharedReading && wizard.state.step === "draw" && (
          <DrawStep
            cards={wizard.state.drawnCards}
            onGetReading={handleGetReading}
            streaming={streaming}
          />
        )}

        {(wizard.state.step === "reading" || sharedReading) && (
          <ReadingStep
            reading={sharedReading?.t ?? reading}
            title={sharedReading?.title ?? title}
            readingDate={sharedReading?.d ?? readingDate}
            streaming={streaming}
            cards={
              sharedReading
                ? sharedReadingToCards(sharedReading)
                : wizard.state.drawnCards
            }
            questions={sharedReading?.q ?? wizard.state.questions}
            answers={sharedReading?.a ?? wizard.state.answers}
            intention={sharedReading?.i ?? wizard.state.intention}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
