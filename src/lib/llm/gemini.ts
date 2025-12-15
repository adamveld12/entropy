import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMService } from './interface';
import type { ReadingContext } from '../types';

export const CATEGORIES = [
  'Sensory (Smell, Sound, Texture)',
  'Nostalgia (Childhood, Memory, History)',
  'Abstract (Color, Geometry, Numbers)',
  'Environment (Weather, Lighting, Atmosphere)',
  'Psychological (Dreams, Fears, Hopes)',
];

export function pickCategories(): string[] {
  const shuffled = [...CATEGORIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export class GeminiService implements LLMService {
  private model;

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });
  }

  async generateQuestions(intention: string, categories: string[]): Promise<string[]> {
    const prompt = `Generate 3 abstract, mystical questions for a tarot reading with intention: "${intention}".
Use these categories: ${categories.join(', ')}.
Return only valid JSON array of strings, no markdown.`;

    const result = await this.model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
  }

  async *interpretSpread(context: ReadingContext): AsyncGenerator<string> {
    const prompt = `You are a mystical tarot reader. Provide a flowing interpretation for:
Intention: ${context.intention}
Reflections: ${context.answers.join(' | ')}
Cards: ${context.cards.map(c => `${c.meaning}: ${c.name} (${c.reversed ? 'Reversed' : 'Upright'})`).join(', ')}
Theme: ${context.deckTheme}

Write in a mystical, poetic style. Stream your interpretation naturally.`;

    const result = await this.model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  }
}
