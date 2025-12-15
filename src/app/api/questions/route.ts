import { NextResponse } from 'next/server';
import { GeminiService, pickCategories } from '@/lib/llm/gemini';

export async function POST(req: Request) {
  const { intention } = await req.json();
  const service = new GeminiService();
  const categories = pickCategories();
  const questions = await service.generateQuestions(intention, categories);
  return NextResponse.json({ questions });
}
