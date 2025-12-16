import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { readingsAnonymous } from "@/lib/db/schema";
import type { ShareableReading } from "@/lib/types";

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

    await db.insert(readingsAnonymous).values({
      version: reading.v,
      intention: reading.i,
      questions: reading.q,
      answers: reading.a,
      cards: reading.c,
      readingText: reading.t,
      title: reading.title ?? null,
      createdAt: reading.d,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save reading to database:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
