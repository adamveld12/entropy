ALTER TABLE "readings_anonymous" ADD COLUMN "share_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "readings_anonymous" ADD CONSTRAINT "readings_anonymous_share_id_unique" UNIQUE("share_id");