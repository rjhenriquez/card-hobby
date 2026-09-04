# Card Hobby

A personal sports-card management application for tracking card investments, personal collection inventory, PSA grading submissions, sales, cost basis, profitability, and grading performance.

The application is designed to replace and improve workflows previously managed through Numbers spreadsheets while preserving the flexibility needed for sports-card collecting and investing.

## Overview

Card Hobby manages the lifecycle of individual sports cards across several related workflows:

- Investment inventory
- Personal collection
- Card acquisition and purchase costs
- Card statuses
- PSA grading submissions and results
- Grading costs and adjustments
- Card sales
- Cost basis, profit, and ROI
- PSA grading analytics

Investment and Collection cards share the same underlying card records. Cards can move between Investment and Collection without creating duplicates or losing their acquisition, grading, or financial history.

## Tech Stack

- **Application:** Next.js, App Router, React, TypeScript, React Compiler
- **Database:** PostgreSQL, Neon, Drizzle ORM, Drizzle Kit
- **UI:** TanStack Table v9, Sass, SCSS Modules
- **Deployment:** Vercel, Neon PostgreSQL

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application is available locally at `http://localhost:3000`.

## Environment Variables

The application requires a PostgreSQL connection through `DATABASE_URL`.

Local environment variables are stored in `.env.local`. Do not commit `.env.local` or database credentials to the repository.

## Database

The application uses PostgreSQL hosted by Neon. Drizzle ORM handles database access and Drizzle Kit handles schema migrations.

Key locations:

- `db/schema.ts` — database schema
- `db/index.ts` — shared database connection
- `db/queries/` — reusable database reads
- `drizzle/` — generated migrations

After schema changes, generate a migration with:

```bash
npx drizzle-kit generate
```

Database changes should also be reflected in [DATABASE.md](docs/DATABASE.md).

## Seed Data

Initial seed data is defined in `db/seed.ts`.

Run:

```bash
npm run db:seed
```

Current seed data includes the initial card statuses. Statuses are database records rather than PostgreSQL enums so they can evolve without schema migrations.

## Type Checking

Run TypeScript validation with:

```bash
npx tsc --noEmit
```

This should be run regularly while developing new workflows.

## Application Routes

Current primary routes:

- `/` — dashboard/home
- `/investment` — investment inventory
- `/collection` — personal collection
- `/psa-submissions` — PSA grading submissions

Planned PSA submission detail route:

- `/psa-submissions/[id]`

## Core Card Workflow

A typical card may move through a lifecycle such as:

```text
Acquire Card
    ↓
Investment or Collection
    ↓
PSA Submission
    ↓
Grading
    ↓
PSA Result
    ↓
Investment or Collection
    ↓
Sale
```

Cards may move between Investment and Collection without being recreated.

## Investment and Collection

Investment and Collection are different views over the same underlying `cards` records.

A card has a portfolio value of either `investment` or `collection`.

Moving a card changes its portfolio while preserving purchase information, acquisition type, PSA history, grading costs, sale information, and original cost basis.

Portfolio movement is intentionally separate from ordinary card editing.

## Card Acquisition

Cards currently support two acquisition types:

- `purchased`
- `pulled`

Purchased cards may have a purchase price. Pulled cards may have no direct acquisition cost. The application does not currently allocate sealed-box cost across individual pulled cards.

## Card Statuses

Statuses represent the operational state of a card. Initial examples include:

- In Transit
- Lost In Transit
- Raw Pile
- DCSports Submission
- Sold

Statuses are stored as database records and are intentionally extensible. Card status is separate from sale method; for example, a card may have a status of `Sold` and a Sold Via value of `Dallas Card Show`.

## PSA Submissions

PSA submissions are separate entities from cards. A submission can contain many cards, and the same card can participate in multiple PSA submissions over its lifetime, supporting workflows such as initial grading, crack and resubmit, review, and regrading.

Membership is stored through `psa_submission_cards` rather than a single submission ID on the card.

Cards can be selected from Investment or Collection and then:

- added to an existing PSA submission
- used to create a new PSA submission

After a successful PSA bulk action, the modal closes and table selection clears. Duplicate card/submission relationships are prevented by the database.

## PSA Costs

PSA costs are divided between submission-level and card-level values.

Submission-level shared costs include shipping and insurance. Card-level costs include the base grading fee and card-specific grading adjustments or upcharges.

Shared submission costs are intended to be distributed equally among cards in the submission:

```text
shared cost per card =
(shipping + insurance) / number of cards
```

Card grading cost is then:

```text
base grading fee
+ shared cost per card
+ grading adjustment
```

The submission also stores the actual total amount charged for reconciliation.

## Financial Calculations

Financial values should be derived whenever possible rather than redundantly stored.

```text
effective cost basis =
purchase price + applicable PSA grading costs

profit =
sale price - effective cost basis

ROI =
profit / effective cost basis
```

Profit, ROI, and similar calculated values should not be manually persisted unless a future requirement makes that necessary.

## Application Architecture

Server Components are used whenever possible.

Read flow:

```text
PostgreSQL / Neon
       ↓
Drizzle ORM
       ↓
db/queries
       ↓
Server Page
       ↓
Client Interaction Component
       ↓
Presentation Component
```

Mutation flow:

```text
User Interaction
       ↓
Client Component
       ↓
Server Action
       ↓
Drizzle ORM
       ↓
PostgreSQL / Neon
       ↓
revalidatePath()
       ↓
Updated Server Page Data
```

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed technical decisions.

## Component Architecture

Current major components include:

- `CardPortfolio`
- `CardTable`
- `CardForm`
- `AddCard`
- `Drawer`
- `Modal`

`CardPortfolio` owns portfolio-level interaction state such as selected cards, portfolio movement, PSA bulk workflows, and modal state.

`CardTable` focuses on card presentation, row selection, inline editing, and row-level actions.

## Styling

The application uses SCSS Modules. Every component should have its own sibling `*.module.scss` file when created, even if the stylesheet is initially empty.

During early development, temporary styling is centralized in `app/dev.scss`. Temporary styles should remain there until the application's real visual design is implemented, at which point they can be moved into the appropriate component modules.

## Development Strategy

Development is workflow-first rather than design-first. Core workflows are being implemented and manually tested before importing the existing Numbers spreadsheet data.

The intended validation sequence is:

1. Create card
2. Edit card
3. Change card status
4. Move card between Investment and Collection
5. Select multiple cards
6. Create PSA submission
7. Add cards to an existing PSA submission
8. View submission and its cards
9. Update PSA submission stages
10. Enter individual grading results
11. Complete a submission
12. Calculate Gem Rate
13. Return cards to independent statuses
14. Sell cards
15. Calculate cost basis, profit, and ROI

Real spreadsheet data should be imported only after the core workflows are proven.

## Documentation

Application documentation is divided into five primary files:

| Document                                | Purpose                                                         |
| --------------------------------------- | --------------------------------------------------------------- |
| [REQUIREMENTS.md](docs/REQUIREMENTS.md) | Business rules and application requirements                     |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical architecture and implementation decisions             |
| [DATABASE.md](docs/DATABASE.md)         | Database schema, relationships, constraints, and derived values |
| [PROGRESS.md](docs/PROGRESS.md)         | Current implementation status and next development steps        |
| [BACKLOG.md](docs/BACKLOG.md)           | Future features, workflow improvements, and ideas to explore    |

### Documentation Responsibilities

The four documentation files have intentionally different responsibilities. Avoid duplicating every detail across all four files.

#### `REQUIREMENTS.md`

Canonical business and workflow requirements.

Answers:

- What should the application do?
- What business rules must be preserved?
- What workflows must be supported?

When a business decision changes, this is generally the first document that should be updated.

#### `ARCHITECTURE.md`

Technical application design and implementation decisions.

Answers:

- How is the application structured?
- Where should logic and state live?
- How do server pages, client components, queries, and actions interact?
- What technical patterns are being followed?

#### `DATABASE.md`

Database implementation details.

Answers:

- What tables and columns exist?
- What are the relationships and constraints?
- Which values are stored versus derived?
- How do records behave throughout their lifecycle?

Database documentation should remain synchronized with `db/schema.ts`.

#### `PROGRESS.md`

Current implementation status and development handoff.

Answers:

- What currently works?
- What was recently completed?
- What are we currently working on?
- What is the next development step?

This file should be updated regularly as meaningful milestones are completed.

In short:

```text
REQUIREMENTS.md
    ↓
What should the application do?

ARCHITECTURE.md
    ↓
How are we building it?

DATABASE.md
    ↓
How is the data represented?

PROGRESS.md
    ↓
Where are we right now?
```

## Current Status

The application is under active development.

Core card management currently includes:

- persistent PostgreSQL card records
- Investment and Collection views
- card creation
- inline card editing
- database-backed statuses
- Investment ↔ Collection movement
- TanStack Table integration
- multi-row card selection
- PSA submission creation
- adding selected cards to existing PSA submissions
- initial PSA Submissions listing

The current development focus is the PSA submission workflow, beginning with submission detail views and progressing toward grading stages, grading results, costs, and Gem Rate analytics.
