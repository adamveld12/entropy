import type { ReadingContext, DrawnCard } from '../types';

export interface LLMService {
  generateQuestions(intention: string, categories: string[]): Promise<string[]>;
  generateTitle(intention: string, cards: DrawnCard[]): Promise<string>;
  interpretSpread(context: ReadingContext): AsyncGenerator<string>;
}
