CREATE TABLE "readings_anonymous" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "readings_anonymous_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"version" smallint DEFAULT 1 NOT NULL,
	"intention" text NOT NULL,
	"questions" text[] NOT NULL,
	"answers" text[] NOT NULL,
	"cards" jsonb NOT NULL,
	"reading_text" text NOT NULL,
	"title" text,
	"created_at" bigint NOT NULL
);
