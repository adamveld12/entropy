import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { readingsAnonymous } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ShareableReading } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("id");

    if (!shareId) {
      return NextResponse.json(
        { error: "Missing shareId parameter" },
        { status: 400 }
      );
    }

    const results = await db
      .select()
      .from(readingsAnonymous)
      .where(eq(readingsAnonymous.shareId, shareId))
      .limit(1);

    if (!results.length) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
    }

    const reading = results[0];
    const shareable: ShareableReading = {
      v: 1,
      i: reading.intention,
      q: reading.questions,
      a: reading.answers,
      c: reading.cards as Array<{ n: string; r: boolean; m: string }>,
      t: reading.readingText,
      title: reading.title ?? undefined,
      d: reading.createdAt,
      shared: true,
    };

    return NextResponse.json(shareable);
  } catch (error) {
    console.error("Failed to fetch reading:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const reading: ShareableReading = await request.json();

    // Only save generated readings (not shared)
    if (reading.shared) {
      return NextResponse.json(
        { error: "Shared readings not saved to backend" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(readingsAnonymous)
      .values({
        version: reading.v,
        intention: reading.i,
        questions: reading.q,
        answers: reading.a,
        cards: reading.c,
        readingText: reading.t,
        title: reading.title ?? null,
        createdAt: reading.d,
      })
      .returning({ shareId: readingsAnonymous.shareId });

    return NextResponse.json({ success: true, shareId: result[0].shareId });
  } catch (error) {
    console.error("Failed to save reading to database:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
