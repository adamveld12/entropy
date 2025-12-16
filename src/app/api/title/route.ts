import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/llm/gemini';
import type { DrawnCard } from '@/lib/types';

export async function POST(req: NextRequest) {
  const { intention, cards }: { intention: string; cards: DrawnCard[] } = await req.json();

  const service = new GeminiService();
  const title = await service.generateTitle(intention, cards);

  return NextResponse.json({ title });
}
