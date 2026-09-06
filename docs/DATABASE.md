# Card Hobby --- Database

## Purpose

This document records the implemented PostgreSQL/Neon schema,
relationships, derived values, and important lifecycle rules.

Drizzle schema: `db/schema.ts`

Database client: `db/index.ts`

Generated migrations: `drizzle/`

## Current Tables

-   `cards`
-   `card_statuses`
-   `psa_submissions`
-   `psa_submission_cards`
-   `purchase_packages`
-   `purchase_package_cards`

## Enums

### Portfolio

-   `investment`
-   `collection`

### Acquisition Type

-   `purchased`
-   `pulled`

### Grade Status

-   `pending`
-   `graded`
-   `no_grade`

## Cards

The `cards` table is the central card record shared by Investment and
Collection.

Important columns include:

  Column               Description
  -------------------- -------------------------------------------
  `id`                 Primary key
  `player`             Player
  `category`           Sport/card category
  `year`               Card year
  `set_name`           Set
  `info`               Identification/details
  `notes`              Notes
  `portfolio`          Investment or Collection
  `status_id`          Manual/workflow status reference
  `acquisition_type`   Purchased or pulled
  `purchase_date`      Acquisition date
  `purchased_from`     Acquisition source
  `ebay_seller`        eBay seller
  `purchase_price`     Standalone purchase value when applicable
  `sold_via`           Sale channel
  `sold_date`          Actual sale date
  `sold_price`         Sale price
  `is_paid`            Whether sale proceeds have been received
  `created_at`         Created timestamp
  `updated_at`         Updated timestamp

`purchase_price` remains the canonical standalone purchase value.
Package-derived Price is not written back into this field.

## Card Statuses

Statuses remain database records rather than a PostgreSQL enum.

Known seeded statuses include:

-   In Transit
-   Lost In Transit
-   Raw Pile
-   DCSports Submission
-   Pending Payment
-   Sold

`Pending Payment` and `Sold` are workflow-controlled sale states and
should not be treated as ordinary manually selectable statuses.

## Sale and Payment Lifecycle

Sale occurrence and payment receipt are separate.

When a sale is entered:

-   `sold_price` is required.
-   `sold_via` and `sold_date` may be optional.
-   `is_paid = false` produces `Pending Payment`.
-   `is_paid = true` produces `Sold`.

`is_paid` can be corrected later. Unchecking it returns the workflow
status to Pending Payment; checking it sets Sold.

`sold_date` records when the sale occurred. There is no separate
paid-date column.

Collection cards cannot be sold directly; the application requires
moving them to Investment first.

## PSA Submissions

Important columns:

-   `id`
-   `submission_number`
-   `stage`
-   `sent_date`
-   `received_date`
-   `completed_date`
-   `outbound_shipping_cost`
-   `insured_return_shipping_cost`
-   timestamps

A submission is active when `completed_date IS NULL`.

The database does not store Total Submission Cost.

## PSA Submission Cards

Relationship fields include:

-   `submission_id`
-   `card_id`
-   `base_grading_fee`
-   `grading_adjustment`
-   `grade`
-   `grade_status`
-   timestamps

`submission_id + card_id` is unique.

A card can participate in multiple historical submissions but only one
active submission at a time; the active rule is currently enforced by
application validation.

## PSA Costs

Shared cost per card:

`(outbound_shipping_cost + insured_return_shipping_cost) ÷ number of cards`

Per-card submission grading cost:

`base_grading_fee + grading_adjustment + allocated shared cost`

Total Submission Cost:

`sum(base grading fees) + sum(grading adjustments) + outbound shipping + insured return shipping`

Only finished submissions contribute to the card-level `gradingCost`
read-model value.

## Purchase Packages

`purchase_packages` stores shared purchase and logistics information for
multiple cards bought together.

Current schema:

``` ts
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
```

There is intentionally no stored `item_count`. The item count is the
number of cards attached to the package.

There are also intentionally no shipped/delivered date fields at this
stage.

## Purchase Package Cards

`purchase_package_cards` joins cards to purchase packages and stores the
individual hammer price.

``` ts
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
```

The current uniqueness rule prevents the same card from appearing twice
in one package. Stronger cross-package uniqueness is a possible future
integrity improvement.

## Package-Derived Price

For a card in a purchase package:

`allocatedTax = hammerPrice × taxesTotal ÷ itemsSubtotal`

`allocatedShipping = shippingTotal ÷ packageCardCount`

`Price = hammerPrice + allocatedTax + allocatedShipping`

Tax is allocated proportionally by hammer price. Shipping is allocated
equally.

The query guards against division by zero.

For a standalone purchased card:

`Price = purchasePrice`

For a pulled card:

`Price = null / Unknown`

`Price` is an application read-model value and is not a `cards` column.

## Derived Card Financial Values

Current query-derived values include:

-   `effectiveStatus`
-   `psaSubmissionNumbers`
-   `gradingCost`
-   `price`
-   `totalCost`
-   `profit`
-   `roi`

For known purchased-card cost:

`Total Cost = Price + finalized PSA Grading Cost`

For a sold card with known Total Cost:

`Profit = Sold Price - Total Cost`

`ROI = Profit ÷ Total Cost × 100`

If Total Cost is unknown, Profit and ROI remain unknown. ROI is also
null when Total Cost is zero or less.

## Portfolio Rules

Moving Investment ↔ Collection changes the existing card's `portfolio`;
it does not duplicate the card.

Movement preserves:

-   Original acquisition information
-   Standalone purchase price
-   Purchase-package relationships
-   PSA history
-   Sale history
-   Cost basis

## Referential and Business Rules

-   `card_statuses.name` unique.
-   `psa_submissions.submission_number` unique.
-   Same card cannot appear twice in one PSA submission.
-   Same card may have multiple historical PSA submissions.
-   Only one active PSA submission per card, application-enforced.
-   Completed PSA relationships remain historical.
-   Active PSA costs excluded from card financial totals.
-   Finished PSA costs included.
-   Same card cannot appear twice in one purchase package.
-   Purchase-package item count is derived from relationships.
-   Package Price is derived and does not overwrite
    `cards.purchase_price`.
-   Collection cards cannot be sold directly.
-   Pending Payment/Sold status is controlled by sale/payment state.
-   Derived financial/statistical values should not be redundantly
    stored when reliably calculable.

## Test Data Import

A CSV importer has successfully imported 47 ordinary test cards after a
dry run reported:

-   CSV rows: 53
-   Card rows: 47
-   Unsold rows: 47
-   Valid cards: 47
-   Invalid cards: 0

The importer intentionally did not create PSA submission history. It
currently lacks duplicate protection and should not be rerun against the
same records without safeguards.

## Deferred Database Work

-   Stronger one-purchase-package-per-card enforcement
-   PSA historical import
-   Collection `isShared`
-   Generic shipment/package model spanning purchases and PSA logistics
-   Automated carrier tracking data
-   Sealed products
-   Portfolio movement history
-   Expanded PSA grade metadata
-   Additional sale expenses if a real requirement emerges
