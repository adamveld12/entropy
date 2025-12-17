import { NextResponse } from 'next/server';
import { GeminiService, pickCategories } from '@/lib/llm/gemini';

export async function POST(req: Request) {
  const { intention, count = 3, existingQuestions = [] } = await req.json();
  const service = new GeminiService();
  const categories = pickCategories();
  const questions = await service.generateQuestions(intention, categories, count, existingQuestions);
  return NextResponse.json({ questions });
}
