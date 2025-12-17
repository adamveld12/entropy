import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMService } from './interface';
import type { ReadingContext, DrawnCard } from '../types';
import fs from 'fs';
import path from 'path';

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
  private flashModel;
  private questionsPrompt: string;
  private titlePrompt: string;
  private interpretationPrompt: string;

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });
    this.flashModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const promptsDir = path.join(process.cwd(), 'prompts', 'gemini');
    this.questionsPrompt = fs.readFileSync(path.join(promptsDir, 'questions.md'), 'utf-8');
    this.titlePrompt = fs.readFileSync(path.join(promptsDir, 'title.md'), 'utf-8');
    this.interpretationPrompt = fs.readFileSync(path.join(promptsDir, 'interpretation.md'), 'utf-8');
  }

  async generateQuestions(
    intention: string,
    categories: string[],
    count: number = 3,
    existingQuestions: string[] = []
  ): Promise<string[]> {
    const prompt = this.questionsPrompt
      .replace('{{intention}}', intention)
      .replace('{{categories}}', categories.join(', '))
      .replace('{{count}}', count.toString())
      .replace('{{existingQuestions}}', existingQuestions.join(', '));

    const result = await this.flashModel.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
  }

  async generateTitle(intention: string, cards: DrawnCard[]): Promise<string> {
    const prompt = this.titlePrompt
      .replace('{{intention}}', intention)
      .replace('{{cards}}', cards.map(c => `${c.name} (${c.reversed ? 'Reversed' : 'Upright'})`).join(', '));

    const result = await this.flashModel.generateContent(prompt);
    return result.response.text().trim();
  }

  async *interpretSpread(context: ReadingContext): AsyncGenerator<string> {
    const reflections = context.questions.map((q, i) => {
      const answer = context.answers[i]?.trim();
      return `<reflection>
<question>${q}</question>
<answer>${answer || 'No Response given'}</answer>
</reflection>`;
    }).join('\n\n');

    const prompt = this.interpretationPrompt
      .replace('{{intention}}', context.intention)
      .replace('{{reflections}}', reflections)
      .replace('{{cards}}', context.cards.map(c => `${c.meaning}: ${c.name} (${c.reversed ? 'Reversed' : 'Upright'})`).join(', '))
      .replace('{{deckTheme}}', context.deckTheme);

    const result = await this.model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  }
}
