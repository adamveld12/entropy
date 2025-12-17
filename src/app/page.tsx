"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useWizard } from "@/hooks/useWizard";
import SetupStep from "@/components/SetupStep";
import QuestionsStep from "@/components/QuestionsStep";
import DrawStep from "@/components/DrawStep";
import ReadingStep from "@/components/ReadingStep";
import ReadingHistory from "@/components/ReadingHistory";
import { createSeededRNG, drawCards } from "@/lib/entropy";
import { STANDARD_DECK } from "@/lib/deck";
import {
  decodeReading,
  sharedReadingToCards,
  formatReadingDate,
} from "@/lib/share";
import type { ReadingContext, ShareableReading, DrawnCard } from "@/lib/types";
import { readingStore } from "@/lib/db";
import { AnimatePresence } from "motion/react";
import { AnimatedStep } from "@/components/AnimatedStep";

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
  const [savedReadings, setSavedReadings] = useState<ShareableReading[]>([]);
  const [viewingHistory, setViewingHistory] = useState<ShareableReading | null>(
    null,
  );
  const [shareId, setShareId] = useState<string | null>(null);

  // Load saved readings from localStorage on mount
  useEffect(() => {
    const loadReadings = async () => {
      const readings = await readingStore.getAll();
      setSavedReadings(readings);
    };
    loadReadings();
  }, []);

  useEffect(() => {
    const encoded = searchParams.get("r");
    if (encoded) {
      // Check if it's a NanoID (short, URL-safe alphanumeric) or legacy base64
      if (encoded.length <= 21 && /^[A-Za-z0-9_-]+$/.test(encoded)) {
        // NanoID - fetch from API
        fetch(`/api/readings?id=${encoded}`)
          .then((res) => {
            if (res.ok) {
              return res.json();
            }
            throw new Error("Reading not found");
          })
          .then((reading: ShareableReading) => {
            setSharedReading(reading);
            setShareId(encoded);
          })
          .catch(() => {
            setShareError(true);
          });
      } else {
        // Legacy base64 - decode directly
        const decoded = decodeReading(encoded);
        if (decoded) {
          setSharedReading(decoded);
        } else {
          setShareError(true);
        }
      }
    }
  }, [searchParams]);

  // Handle shared readings: generate title if needed, then save
  useEffect(() => {
    if (!sharedReading) return;

    const handleSharedReading = async () => {
      let readingTitle = sharedReading.title;

      if (!readingTitle) {
        readingTitle = await generateReadingTitle(
          sharedReading.i,
          sharedReadingToCards(sharedReading),
        );
        setTitle(readingTitle ?? '');
      }

      await saveReadingToHistory({
        ...sharedReading,
        title: readingTitle,
        shared: true,
      });
    };

    handleSharedReading();
  }, [sharedReading]);

  const saveReadingToHistory = async (reading: ShareableReading) => {
    const existing = await readingStore.getAll();
    const alreadySaved = existing.some((r) => r.d === reading.d);
    if (!alreadySaved) {
      await readingStore.save(reading);
      const readings = await readingStore.getAll();
      setSavedReadings(readings);

      // Save generated readings to backend and capture shareId
      if (!reading.shared) {
        fetch("/api/readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reading),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to save reading");
            return res.json();
          })
          .then((data) => {
            if (data.shareId) {
              setShareId(data.shareId);
              // Update localStorage with shareId
              readingStore.save({ ...reading, shareId: data.shareId });
            }
          })
          .catch((error) => {
            console.error("Failed to save reading to backend:", error);
          });
      }
    }
  };

  const generateReadingTitle = async (
    intention: string,
    cards: DrawnCard[],
  ) => {
    const res = await fetch("/api/title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intention, cards }),
    });
    const { title } = await res.json();
    return title;
  };

  const handleReset = () => {
    setSharedReading(null);
    setShareError(false);
    setViewingHistory(null);
    setShareId(null);
    wizard.reset();
    window.history.pushState({}, "", "/");
  };

  const handleLoadHistory = (reading: ShareableReading) => {
    setViewingHistory(reading);
    setShareId(reading.shareId ?? null);
    wizard.toReading();
  };

  const handleBackToSetup = () => {
    setViewingHistory(null);
    wizard.reset();
  };

  const handleDeleteReading = async (timestamp: number) => {
    await readingStore.delete(timestamp);
    const readings = await readingStore.getAll();
    setSavedReadings(readings);
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
    const generatedTitle = await generateReadingTitle(
      wizard.state.intention,
      wizard.state.drawnCards,
    );
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
      let fullReading = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullReading += chunk;
        setReading(fullReading);
      }

      // Save reading to localStorage when complete
      await saveReadingToHistory({
        v: 1,
        i: wizard.state.intention,
        q: wizard.state.questions,
        a: wizard.state.answers,
        c: wizard.state.drawnCards.map((card) => ({
          n: card.name,
          r: card.reversed,
          m: card.meaning,
        })),
        t: fullReading,
        title: generatedTitle,
        d: readingDate,
        shared: false,
      });
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

        <AnimatePresence mode="wait">
          {!sharedReading && !viewingHistory && wizard.state.step === "setup" && (
            <AnimatedStep key="setup">
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
              <ReadingHistory
                readings={savedReadings}
                onSelect={handleLoadHistory}
                onDelete={handleDeleteReading}
              />
            </AnimatedStep>
          )}

          {!sharedReading && wizard.state.step === "questions" && (
            <AnimatedStep key="questions">
              <QuestionsStep
                questions={wizard.state.questions}
                answers={wizard.state.answers}
                onAnswersChange={wizard.setAnswers}
                onSubmit={handleQuestionsSubmit}
              />
            </AnimatedStep>
          )}

          {!sharedReading && wizard.state.step === "draw" && (
            <AnimatedStep key="draw">
              <DrawStep
                cards={wizard.state.drawnCards}
                onGetReading={handleGetReading}
                streaming={streaming}
              />
            </AnimatedStep>
          )}

          {(wizard.state.step === "reading" || sharedReading || viewingHistory) && (
            <AnimatedStep key="reading">
              <ReadingStep
                reading={
                  viewingHistory?.t ?? sharedReading?.t ?? reading
                }
                title={
                  viewingHistory?.title ?? sharedReading?.title ?? title
                }
                readingDate={
                  viewingHistory?.d ?? sharedReading?.d ?? readingDate
                }
                streaming={streaming}
                cards={
                  viewingHistory
                    ? sharedReadingToCards(viewingHistory)
                    : sharedReading
                      ? sharedReadingToCards(sharedReading)
                      : wizard.state.drawnCards
                }
                questions={
                  viewingHistory?.q ?? sharedReading?.q ?? wizard.state.questions
                }
                answers={
                  viewingHistory?.a ?? sharedReading?.a ?? wizard.state.answers
                }
                intention={
                  viewingHistory?.i ?? sharedReading?.i ?? wizard.state.intention
                }
                shareId={shareId ?? undefined}
                onReset={handleReset}
                onBack={viewingHistory ? handleBackToSetup : undefined}
              />
            </AnimatedStep>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
