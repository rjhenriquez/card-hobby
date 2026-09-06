import {
	boolean,
	date,
	integer,
	numeric,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

// ---------------------------------------------
// Enums
// ---------------------------------------------

export const portfolioEnum = pgEnum("portfolio", ["investment", "collection"]);

export const acquisitionTypeEnum = pgEnum("acquisition_type", [
	"purchased",
	"pulled",
]);

export const gradeStatusEnum = pgEnum("grade_status", [
	"pending",
	"graded",
	"no_grade",
]);

// ---------------------------------------------
// Card Statuses
// ---------------------------------------------

export const cardStatuses = pgTable("card_statuses", {
	id: serial("id").primaryKey(),

	name: text("name").notNull().unique(),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------
// Cards
// ---------------------------------------------

export const cards = pgTable("cards", {
	id: serial("id").primaryKey(),

	player: text("player").notNull(),
	category: text("category"),
	year: text("year"),
	setName: text("set_name"),
	info: text("info"),
	notes: text("notes"),

	portfolio: portfolioEnum("portfolio").notNull().default("investment"),
	statusId: integer("status_id").references(() => cardStatuses.id),

	acquisitionType: acquisitionTypeEnum("acquisition_type").notNull(),

	purchaseDate: date("purchase_date"),
	purchasedFrom: text("purchased_from"),
	ebaySeller: text("ebay_seller"),
	purchasePrice: numeric("purchase_price", {
		precision: 10,
		scale: 2,
	}),

	soldVia: text("sold_via"),
	soldDate: date("sold_date"),
	soldPrice: numeric("sold_price", {
		precision: 10,
		scale: 2,
	}),
	isPaid: boolean("is_paid").notNull().default(false),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------
// PSA Submissions
// ---------------------------------------------

export const psaSubmissions = pgTable("psa_submissions", {
	id: serial("id").primaryKey(),

	submissionNumber: text("submission_number").notNull().unique(),

	stage: text("stage"),

	sentDate: date("sent_date"),
	receivedDate: date("received_date"),
	completedDate: date("completed_date"),

	outboundShippingCost: numeric("outbound_shipping_cost", {
		precision: 10,
		scale: 2,
	})
		.notNull()
		.default("0"),

	insuredReturnShippingCost: numeric("insured_return_shipping_cost", {
		precision: 10,
		scale: 2,
	})
		.notNull()
		.default("0"),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------
// PSA Submission Cards
// ---------------------------------------------

export const psaSubmissionCards = pgTable(
	"psa_submission_cards",
	{
		id: serial("id").primaryKey(),

		submissionId: integer("submission_id")
			.notNull()
			.references(() => psaSubmissions.id, {
				onDelete: "cascade",
			}),

		cardId: integer("card_id")
			.notNull()
			.references(() => cards.id, {
				onDelete: "restrict",
			}),

		baseGradingFee: numeric("base_grading_fee", {
			precision: 10,
			scale: 2,
		})
			.notNull()
			.default("0"),

		gradingAdjustment: numeric("grading_adjustment", {
			precision: 10,
			scale: 2,
		})
			.notNull()
			.default("0"),

		grade: numeric("grade", {
			precision: 3,
			scale: 1,
		}),

		gradeStatus: gradeStatusEnum("grade_status").notNull().default("pending"),

		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		unique("psa_submission_cards_submission_card_unique").on(
			table.submissionId,
			table.cardId,
		),
	],
);

export const purchasePackages = pgTable("purchase_packages", {
	id: serial("id").primaryKey(),
	itemsSubtotal: numeric("items_subtotal", {
		precision: 10,
		scale: 2,
	}).notNull(),
	shippingTotal: numeric("shipping_total", {
		precision: 10,
		scale: 2,
	}).notNull(),
	taxesTotal: numeric("taxes_total", {
		precision: 10,
		scale: 2,
	}).notNull(),
	carrier: text("carrier"),
	trackingNumber: text("tracking_number"),
	estimatedDeliveryDate: date("estimated_delivery_date"),
	isDelivered: boolean("is_delivered").notNull().default(false),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const purchasePackageCards = pgTable(
	"purchase_package_cards",
	{
		id: serial("id").primaryKey(),
		purchasePackageId: integer("purchase_package_id")
			.notNull()
			.references(() => purchasePackages.id, {
				onDelete: "cascade",
			}),
		cardId: integer("card_id")
			.notNull()
			.references(() => cards.id, {
				onDelete: "restrict",
			}),
		hammerPrice: numeric("hammer_price", {
			precision: 10,
			scale: 2,
		}).notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		unique("purchase_package_cards_package_card_unique").on(
			table.purchasePackageId,
			table.cardId,
		),
	],
);
