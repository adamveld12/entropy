import { GeminiService } from '@/lib/llm/gemini';
import type { ReadingContext } from '@/lib/types';

export async function POST(req: Request) {
  const context: ReadingContext = await req.json();
  const service = new GeminiService();

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of service.interpretSpread(context)) {
        controller.enqueue(new TextEncoder().encode(chunk));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
