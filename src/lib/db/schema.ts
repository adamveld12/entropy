import { pgTable, text, smallint, bigint, jsonb } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const readingsAnonymous = pgTable("readings_anonymous", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  shareId: text("share_id").notNull().unique().$defaultFn(() => nanoid(12)),
  version: smallint("version").notNull().default(1),
  intention: text("intention").notNull(),
  questions: text("questions").array().notNull(),
  answers: text("answers").array().notNull(),
  cards: jsonb("cards").notNull(), // Array<{n: string, r: boolean, m: string}>
  readingText: text("reading_text").notNull(),
  title: text("title"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(), // JS timestamp
});
