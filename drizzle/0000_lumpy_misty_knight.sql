CREATE TYPE "public"."acquisition_type" AS ENUM('purchased', 'pulled');--> statement-breakpoint
CREATE TYPE "public"."grade_status" AS ENUM('pending', 'graded', 'no_grade');--> statement-breakpoint
CREATE TYPE "public"."portfolio" AS ENUM('investment', 'collection');--> statement-breakpoint
CREATE TABLE "card_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "card_statuses_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"player" text NOT NULL,
	"category" text,
	"year" text,
	"set_name" text,
	"info" text,
	"notes" text,
	"portfolio" "portfolio" NOT NULL,
	"status_id" integer,
	"acquisition_type" "acquisition_type" NOT NULL,
	"purchase_date" date,
	"purchased_from" text,
	"ebay_seller" text,
	"purchase_price" numeric(10, 2),
	"sold_via" text,
	"sold_date" date,
	"sold_price" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "psa_submission_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"card_id" integer NOT NULL,
	"base_grading_fee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"grading_adjustment" numeric(10, 2) DEFAULT '0' NOT NULL,
	"grade" numeric(3, 1),
	"grade_status" "grade_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "psa_submission_cards_submission_card_unique" UNIQUE("submission_id","card_id")
);
--> statement-breakpoint
CREATE TABLE "psa_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_number" text NOT NULL,
	"stage" text,
	"sent_date" date,
	"received_date" date,
	"completed_date" date,
	"shipping_cost" numeric(10, 2) DEFAULT '0' NOT NULL,
	"insurance_cost" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_amount_charged" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "psa_submissions_submission_number_unique" UNIQUE("submission_number")
);
--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_status_id_card_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."card_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psa_submission_cards" ADD CONSTRAINT "psa_submission_cards_submission_id_psa_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."psa_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psa_submission_cards" ADD CONSTRAINT "psa_submission_cards_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE restrict ON UPDATE no action;