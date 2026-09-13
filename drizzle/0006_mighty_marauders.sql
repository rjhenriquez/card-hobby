ALTER TABLE "cards" ADD COLUMN "is_shared" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "psa_submissions" ADD COLUMN "is_historical" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "psa_submissions" ADD COLUMN "historical_total_cards" integer;--> statement-breakpoint
ALTER TABLE "psa_submissions" ADD COLUMN "historical_psa_10" integer;--> statement-breakpoint
ALTER TABLE "psa_submissions" ADD COLUMN "historical_psa_9" integer;--> statement-breakpoint
ALTER TABLE "psa_submissions" ADD COLUMN "historical_psa_85" integer;--> statement-breakpoint
ALTER TABLE "psa_submissions" ADD COLUMN "historical_psa_8" integer;--> statement-breakpoint
ALTER TABLE "psa_submissions" ADD COLUMN "historical_psa_75_or_less" integer;--> statement-breakpoint
ALTER TABLE "psa_submissions" ADD COLUMN "historical_no_grade" integer;