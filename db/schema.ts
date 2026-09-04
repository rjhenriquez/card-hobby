import {
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

  shippingCost: numeric("shipping_cost", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0"),

  insuranceCost: numeric("insurance_cost", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0"),

  totalAmountCharged: numeric("total_amount_charged", {
    precision: 10,
    scale: 2,
  }),

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
