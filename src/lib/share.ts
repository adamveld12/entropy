import type { ShareableReading, DrawnCard } from './types';

export function encodeReading(
  intention: string,
  questions: string[],
  answers: string[],
  cards: DrawnCard[],
  reading: string
): string {
  const data: ShareableReading = {
    v: 1,
    i: intention,
    q: questions,
    a: answers,
    c: cards.map((card) => ({ n: card.name, r: card.reversed, m: card.meaning })),
    t: reading,
    d: Date.now(),
  };
  return btoa(encodeURIComponent(JSON.stringify(data)));
}

export function decodeReading(encoded: string): ShareableReading | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const data = JSON.parse(json);
    if (!data.v || !data.i || !Array.isArray(data.c) || !data.t) return null;
    return data;
  } catch {
    return null;
  }
}

export function sharedReadingToCards(reading: ShareableReading): DrawnCard[] {
  return reading.c.map((c, i) => ({
    id: `shared-${i}`,
    name: c.n,
    image: '',
    reversed: c.r,
    position: i,
    meaning: c.m,
  }));
}

export function formatReadingDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}
