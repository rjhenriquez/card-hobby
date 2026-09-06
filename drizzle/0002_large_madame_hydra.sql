ALTER TABLE "psa_submissions" RENAME COLUMN "shipping_cost" TO "outbound_shipping_cost";--> statement-breakpoint
ALTER TABLE "psa_submissions" RENAME COLUMN "insurance_cost" TO "insured_return_shipping_cost";--> statement-breakpoint
ALTER TABLE "psa_submissions" DROP COLUMN "total_amount_charged";