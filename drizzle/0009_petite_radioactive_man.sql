CREATE TABLE "search_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_id" integer NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "search_categories_section_name_unique" UNIQUE("section_id","name")
);
--> statement-breakpoint
CREATE TABLE "search_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "search_sections_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "search_terms" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "search_terms_category_value_unique" UNIQUE("category_id","value")
);
--> statement-breakpoint
ALTER TABLE "search_categories" ADD CONSTRAINT "search_categories_section_id_search_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."search_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_terms" ADD CONSTRAINT "search_terms_category_id_search_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."search_categories"("id") ON DELETE cascade ON UPDATE no action;