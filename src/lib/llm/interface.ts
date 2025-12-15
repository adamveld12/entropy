import type { ReadingContext } from '../types';

export interface LLMService {
  generateQuestions(intention: string, categories: string[]): Promise<string[]>;
  interpretSpread(context: ReadingContext): AsyncGenerator<string>;
}
