# Card Hobby — Database

## Purpose

This document records the implemented database schema, relationships, constraints, derived values, and important data-lifecycle rules for Card Hobby.

The database uses PostgreSQL hosted by Neon and is accessed from the Next.js application using Drizzle ORM.

---

## Current Status

The initial database schema has been implemented and deployed.

- PostgreSQL: Neon
- ORM: Drizzle ORM
- Database connection: `DATABASE_URL`
- Drizzle schema: `db/schema.ts`
- Database client: `db/index.ts`
- Generated migrations: `drizzle/`
- Initial migration: `0000_lumpy_misty_knight.sql`
- Portfolio default migration: `0001_late_arachne.sql`

Current application tables:

- `cards`
- `card_statuses`
- `psa_submissions`
- `psa_submission_cards`

Additional tables should only be introduced when supported by an actual application requirement.

---

## Enums

### Portfolio

The `portfolio` PostgreSQL enum currently supports:

- `investment`
- `collection`

Cards default to `investment`.

### Acquisition Type

The `acquisition_type` PostgreSQL enum currently supports:

- `purchased`
- `pulled`

### Grade Status

The `grade_status` PostgreSQL enum currently supports:

- `pending`
- `graded`
- `no_grade`

---

## Cards

`cards` is the central card record.

Investment cards and Collection cards use the same underlying table. Moving a card between portfolios changes its current portfolio rather than creating a new card.

### Columns

Current `cards` columns:

| Column             | Description                                |
| ------------------ | ------------------------------------------ |
| `id`               | Auto-incrementing primary key              |
| `player`           | Player name                                |
| `category`         | Card/sport category                        |
| `year`             | Card year                                  |
| `set_name`         | Card set                                   |
| `info`             | Additional card identification/details     |
| `notes`            | Free-form notes                            |
| `portfolio`        | Current Investment or Collection portfolio |
| `status_id`        | Nullable reference to `card_statuses`      |
| `acquisition_type` | Purchased or pulled                        |
| `purchase_date`    | Date the card was acquired                 |
| `purchased_from`   | Acquisition source                         |
| `ebay_seller`      | eBay seller when applicable                |
| `purchase_price`   | Individual purchase price when known       |
| `sold_via`         | Sale channel                               |
| `sold_date`        | Sale date                                  |
| `sold_price`       | Sale price                                 |
| `created_at`       | Record creation timestamp                  |
| `updated_at`       | Record update timestamp                    |

### Portfolio

A card's current portfolio determines whether it belongs to:

- Investment
- Collection

New cards default to the `investment` portfolio at the database level.

The application explicitly assigns the current portfolio when creating a card from a portfolio-specific view. For example, a card created from the Collection page is created directly in Collection.

Changing portfolio:

- Does not create a duplicate card.
- Does not reset acquisition information.
- Does not destroy the original purchase price.
- Does not destroy PSA grading history.
- Does not change the card's identity.

This allows a card to move:

`Investment → Collection → Investment`

while retaining its original history and cost basis.

---

## Acquisition

Cards currently have one of two acquisition types:

- `purchased`
- `pulled`

`purchase_price` is nullable.

### Purchased Cards

A purchased card can have an individual purchase price recorded normally.

### Pulled Cards

A pulled card may have no meaningful individual purchase price because it came from a box or other sealed product.

The application does not invent an acquisition cost for pulled cards by automatically dividing a box cost among cards.

Pulled cards can still:

- Participate in PSA submissions.
- Accumulate PSA grading costs.
- Receive grades.
- Contribute to PSA grading statistics.
- Be sold.
- Participate in financial calculations using the costs that are actually known.

Future sealed-product tracking may associate pulled cards with boxes or other products, but that model is intentionally deferred.

---

## Card Statuses

Card statuses are stored in the `card_statuses` table rather than as a PostgreSQL enum.

This keeps statuses extensible.

### Columns

Current `card_statuses` columns:

| Column       | Description                   |
| ------------ | ----------------------------- |
| `id`         | Auto-incrementing primary key |
| `name`       | Unique status name            |
| `created_at` | Record creation timestamp     |
| `updated_at` | Record update timestamp       |

Known seeded statuses currently include:

- In Transit
- Lost In Transit
- Raw Pile
- DCSports Submission
- Sold

These are application data and are not intended to form a permanent fixed list.

### Manual Status

`cards.status_id` represents the card's stored/manual status.

Examples include:

- In Transit
- Raw Pile
- Sold

Sale channel is intentionally separate from status.

For example:

- Status: `Sold`
- Sold Via: `Dallas Card Show`

---

## Effective Card Status

The status displayed by the application may differ from the manually stored card status.

The application uses the concept of:

`effectiveStatus`

This is a derived application value and is **not stored in the database**.

Conceptually:

```text
if card belongs to an active PSA submission:
    effectiveStatus = PSA-derived status
else:
    effectiveStatus = manual card status
```

For example, a card whose manual status is:

`In Transit`

but which currently belongs to an active PSA submission at the Assembly stage displays:

`PSA Grading - Assembly`

The original `In Transit` status remains stored in the database.

PSA workflow therefore does not overwrite the card's manual status.

When the PSA submission is completed, it stops controlling `effectiveStatus`, and the card's stored manual status becomes effective again.

---

## PSA Submissions

PSA submissions are separate entities containing multiple cards.

### Columns

Current `psa_submissions` columns:

| Column                 | Description                            |
| ---------------------- | -------------------------------------- |
| `id`                   | Auto-incrementing internal primary key |
| `submission_number`    | Unique PSA submission number           |
| `stage`                | Current PSA workflow stage             |
| `sent_date`            | Date submission was sent               |
| `received_date`        | Date PSA received the submission       |
| `completed_date`       | Date the submission was completed      |
| `shipping_cost`        | Submission-level shipping cost         |
| `insurance_cost`       | Submission-level insurance cost        |
| `total_amount_charged` | Actual total amount charged by PSA     |
| `created_at`           | Record creation timestamp              |
| `updated_at`           | Record update timestamp                |

`submission_number` is required and unique.

PSA workflow stages remain flexible and are not implemented as a restrictive PostgreSQL enum.

Examples may include stages such as:

- Arrived
- Research & ID
- Grading
- Assembly
- Grades Ready
- Shipped

The application does not depend on a permanent hardcoded list of PSA stages.

### Internal ID vs Submission Number

`id` is used internally for database relationships.

`submission_number` is the human-facing identifier and is used in application URLs.

For example:

`/psa-submissions/15288930`

---

## Active PSA Submissions

A submission is currently considered active when:

```text
completed_date IS NULL
```

A submission is considered completed when:

```text
completed_date IS NOT NULL
```

### One Active Submission Per Card

A card may have unlimited historical PSA submissions over its lifetime.

However, a card may belong to only **one active PSA submission at a time**.

This rule is currently enforced at the application layer when:

- Creating a new PSA submission.
- Adding cards to an existing PSA submission.

Before creating the relationship, the application checks `psa_submission_cards` joined with `psa_submissions` for another relationship where:

```text
completed_date IS NULL
```

When adding cards to an existing submission, that submission is excluded from the conflict check.

This rule is currently not implemented as a database constraint.

### Historical Submissions

Completing a submission does not remove its card relationships.

The completed submission remains part of each card's grading history.

This allows the same card to later participate in another PSA submission for workflows such as:

- Crack and resubmit.
- Regrading.
- Review.

---

## PSA Submission Cards

`psa_submission_cards` represents the relationship between cards and PSA submissions.

This relationship table is necessary instead of storing a single PSA submission ID directly on `cards` because a card may be graded multiple times during its lifetime.

### Columns

Current `psa_submission_cards` columns:

| Column               | Description                           |
| -------------------- | ------------------------------------- |
| `id`                 | Auto-incrementing primary key         |
| `submission_id`      | Reference to `psa_submissions`        |
| `card_id`            | Reference to `cards`                  |
| `base_grading_fee`   | Base PSA grading fee for this card    |
| `grading_adjustment` | Card-specific PSA adjustment/upcharge |
| `grade`              | Nullable numeric PSA grade            |
| `grade_status`       | Pending, graded, or no_grade          |
| `created_at`         | Record creation timestamp             |
| `updated_at`         | Record update timestamp               |

The combination of:

`submission_id + card_id`

is unique.

Therefore, the same card cannot be added to the same PSA submission more than once.

The same card can appear in a different PSA submission later.

### Relationship Lifecycle

Deleting a PSA submission removes its associated `psa_submission_cards` relationships.

A card with existing PSA grading history cannot be deleted without first resolving that grading history.

---

## PSA Grading Results

Each card's result for a specific grading attempt belongs to its `psa_submission_cards` record.

### Grade Status

`grade_status` supports:

- `pending`
- `graded`
- `no_grade`

### Pending

A card that has not received a final result has:

```text
grade_status = pending
grade = null
```

Pending cards do not count as completed grading outcomes.

### Graded

A successfully graded card has:

```text
grade_status = graded
grade = numeric PSA grade
```

The current schema supports decimal grades such as:

- 8
- 8.5
- 9
- 10

### No Grade

A completed No Grade result has:

```text
grade_status = no_grade
grade = null
```

This distinguishes a completed No Grade result from a card whose grading result is still pending.

When a grading result is changed to either Pending or No Grade, the numeric `grade` should be cleared.

---

## PSA Grade Buckets

Current submission statistics group completed results into:

- PSA 10
- PSA 9
- PSA 8.5
- PSA 8
- PSA 7.5 or Less
- No Grade

PSA 7.5 is therefore included in the `7.5 or Less` bucket.

These counts are derived from `psa_submission_cards`.

They are not stored as columns on `psa_submissions`.

---

## PSA Submission Statistics

PSA submission statistics are derived from individual grading results rather than stored as duplicate values.

Current derived statistics include:

- Total cards
- Completed cards
- PSA 10 count
- PSA 9 count
- PSA 8.5 count
- PSA 8 count
- PSA 7.5 or Less count
- No Grade count
- Gem Rate
- Percentage PSA 9 or better

### Completed Grading Outcomes

Completed grading outcomes include:

- Cards with `grade_status = graded`
- Cards with `grade_status = no_grade`

Pending cards are excluded.

### Gem Rate

Gem Rate is calculated as:

```text
PSA 10 / completed grading outcomes
```

A No Grade result counts in the denominator.

Example:

- PSA 10
- PSA 10
- PSA 9
- No Grade

Completed outcomes:

`4`

Gem Rate:

`2 / 4 = 50%`

### PSA 9 or Better

Percentage graded PSA 9 or better is calculated as:

```text
(PSA 10 + PSA 9) / completed grading outcomes
```

Using the same example:

`3 / 4 = 75%`

No Grade counts in the denominator.

Pending cards do not count in the denominator.

---

## PSA Grading Costs

PSA grading costs consist of both card-specific and submission-level costs.

### Submission-Level Costs

Currently:

- Shipping
- Insurance

These costs are entered once on `psa_submissions`.

### Card-Specific Costs

Currently:

- Base grading fee
- Grading adjustment/upcharge

These are stored on `psa_submission_cards`.

### Shared Cost Allocation

Shared submission costs are currently divided equally among every card in the submission.

```text
shared cost per card =
(shipping_cost + insurance_cost) / number of cards
```

The allocated shared cost is derived and is **not stored** on `psa_submission_cards`.

### Total Grading Cost Per Card

```text
total grading cost =
base grading fee
+ allocated shared submission cost
+ grading adjustment
```

Example:

A two-card submission has:

- Card A base grading fee: $20
- Card B base grading fee: $20
- Shipping + insurance: $60

Shared cost:

```text
$60 / 2 = $30 per card
```

Card A grading cost:

```text
$20 + $30 = $50
```

If Card B receives a $55 PSA high-value adjustment:

```text
$20 + $30 + $55 = $105
```

The card-specific adjustment does not alter the shared-cost allocation for the other cards.

### Total Amount Charged

`psa_submissions.total_amount_charged` stores the actual total amount charged by PSA.

It is not used as a replacement for the individual grading-cost calculation.

Its purpose is to allow reconciliation between:

- Calculated card-level grading costs.
- Actual total amount charged by PSA.

---

## Cost Basis

A card's eventual investment cost basis should include its known acquisition cost and applicable PSA grading costs.

Conceptually:

```text
cost basis =
purchase price
+ applicable PSA grading costs
```

For purchased cards, `purchase_price` provides the original acquisition cost.

For pulled cards, `purchase_price` may be null.

Moving a card between Investment and Collection does not reset its cost basis.

For example:

1. Card purchased for $300.
2. Card moved from Investment to Collection.
3. Original $300 purchase price remains stored.
4. Card later moves back to Investment.
5. Card is eventually sold for $800.
6. Profit/ROI calculations still use the original $300 acquisition cost plus applicable PSA grading costs.

Exact sale profit and ROI calculations will be implemented when the financial workflow is built.

---

## Sale Data

Sale information is stored separately from card status.

Current sale fields on `cards` include:

- `sold_via`
- `sold_date`
- `sold_price`

A sold card may therefore conceptually contain:

```text
Status: Sold
Sold Via: Dallas Card Show
Sold Date: ...
Sold Price: ...
```

Profit and ROI should be derived from sale proceeds and known cost basis rather than stored as manually maintained values.

---

## Derived Card Query Values

Some values used by the application are deliberately not database columns.

Current examples include:

- `effectiveStatus`
- `activePsaSubmissionNumber`

### effectiveStatus

`effectiveStatus` is derived from:

- The card's stored manual status.
- Whether the card belongs to an active PSA submission.
- The active PSA submission's current stage.

Example:

```text
PSA Grading - Assembly
```

### activePsaSubmissionNumber

`activePsaSubmissionNumber` identifies the card's current active PSA submission when one exists.

It is derived from the relationship between:

- `cards`
- `psa_submission_cards`
- `psa_submissions`

It allows the application to link directly from a card to:

```text
/psa-submissions/[submissionNumber]
```

Neither `effectiveStatus` nor `activePsaSubmissionNumber` is stored on `cards`.

---

## Referential and Business Rules

Current important rules include:

- `card_statuses.name` must be unique.
- `psa_submissions.submission_number` must be unique.
- A card cannot appear twice within the same PSA submission.
- A card can appear in multiple PSA submissions over its lifetime.
- A card can belong to only one active PSA submission at a time.
- The one-active-submission rule is currently enforced by application validation.
- Completing a PSA submission does not remove its grading history.
- Completing a PSA submission releases its cards from PSA-controlled displayed status.
- PSA stage does not overwrite the card's manual status.
- Cards with PSA grading history cannot be deleted without resolving that history.
- Deleting a PSA submission removes its submission/card relationships.
- Moving a card between Investment and Collection preserves the same card record and history.
- Derived financial and grading statistics should not be stored when they can reliably be calculated from source data.

---

## Seed Data

Initial card statuses are seeded through:

`db/seed.ts`

Current seeded statuses:

- In Transit
- Lost In Transit
- Raw Pile
- DCSports Submission
- Sold

The seed uses conflict-safe insertion so existing statuses are not duplicated.

The current npm seed command is:

```bash
npm run db:seed
```

---

## Future Grade Metadata

The current schema stores the numeric PSA grade directly on `psa_submission_cards`.

Future grading support may add full PSA grade names or abbreviations, for example:

- `8.5 → NM-MT+`
- `9 → MINT`
- `10 → GEM MINT`

Future support may also include PSA qualifiers such as:

- `MK`

Qualifiers should remain separate from the numeric grade rather than being encoded into the grade value itself.

This functionality is intentionally deferred.

---

## Deferred Database Models

The following models/features are intentionally not being added yet:

### Sealed Products / Boxes

Future sealed-product tracking may record boxes or products from which cards were pulled.

The application currently does not allocate box cost to individual pulled cards.

### Generic Card Expenses

A generic `card_expenses` table is not currently planned.

Known costs are currently modeled explicitly through:

- Purchase price.
- PSA submission costs.
- PSA card-specific grading costs.

Additional expense modeling should only be added if a concrete requirement emerges.

### PSA Grade Metadata

Full grade names, qualifiers, and additional PSA result metadata are deferred until required.

### Portfolio Movement History

The current portfolio is stored on the card.

A future portfolio-history model could record movements between Investment and Collection if that historical information becomes useful.

This is not required for the current workflow.

---

## Decisions Still To Make

The initial schema and primary PSA workflow are now implemented.

Remaining database-related decisions should be made as their workflows are built rather than speculatively.

Current open areas include:

- Whether the one-active-PSA-submission-per-card rule should eventually receive additional database-level enforcement.
- Whether shared PSA costs will ever need allocation methods other than equal division.
- Exact financial profit and ROI formulas.
- Whether portfolio movement history should be persisted.
- Future sealed-product/box tracking.
- Future PSA grade names and qualifiers.
- Whether additional sale-related costs will eventually need to be modeled.
