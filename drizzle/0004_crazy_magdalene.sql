CREATE TABLE "purchase_package_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_package_id" integer NOT NULL,
	"card_id" integer NOT NULL,
	"hammer_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_package_cards_package_card_unique" UNIQUE("purchase_package_id","card_id")
);
--> statement-breakpoint
CREATE TABLE "purchase_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"items_subtotal" numeric(10, 2) NOT NULL,
	"shipping_total" numeric(10, 2) NOT NULL,
	"taxes_total" numeric(10, 2) NOT NULL,
	"carrier" text,
	"tracking_number" text,
	"estimated_delivery_date" date,
	"is_delivered" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "purchase_package_cards" ADD CONSTRAINT "purchase_package_cards_purchase_package_id_purchase_packages_id_fk" FOREIGN KEY ("purchase_package_id") REFERENCES "public"."purchase_packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_package_cards" ADD CONSTRAINT "purchase_package_cards_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE restrict ON UPDATE no action;