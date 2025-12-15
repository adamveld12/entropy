import seedrandom from 'seedrandom';
import type { Card, DrawnCard } from './types';

async function hashAnswers(answers: string[]): Promise<string> {
  const combined = answers.join('|');
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createSeededRNG(answers: string[]): Promise<() => number> {
  const seed = await hashAnswers(answers);
  return seedrandom(seed);
}

export function shuffleDeck<T>(items: T[], rng: () => number): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawCards(
  deck: Card[],
  count: number,
  positions: string[],
  rng: () => number
): DrawnCard[] {
  const shuffled = shuffleDeck(deck, rng);
  return shuffled.slice(0, count).map((card, index) => ({
    ...card,
    reversed: rng() > 0.5,
    position: index,
    meaning: positions[index] || `Position ${index + 1}`,
  }));
}
