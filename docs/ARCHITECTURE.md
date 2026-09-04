# Card Hobby — Architecture

## Overview

Card Hobby is a personal sports-card management system focused on:

- Investment inventory
- Personal collection inventory
- PSA grading submissions
- Card sales
- Cost basis and profitability
- PSA grading analytics

The application is built with Next.js, TypeScript, PostgreSQL, Drizzle ORM, TanStack Table, and SCSS Modules.

The architecture intentionally separates:

- Business requirements
- Database structure
- Data access
- Server mutations
- Server-rendered pages
- Client-side interaction state
- Shared application types
- Reusable UI components

The application is being built incrementally around real workflows rather than attempting to reproduce the previous Numbers spreadsheets directly.

---

## Technology Stack

### Application

- Next.js
- App Router
- TypeScript
- React
- React Compiler

### Database

- PostgreSQL
- Neon
- Drizzle ORM
- Drizzle Kit

### Tables

- TanStack Table v9

TanStack Table is used as a headless table engine.

It manages table behavior such as:

- Row rendering
- Row selection
- Future sorting
- Future filtering
- Future faceting
- Future pagination

TanStack Table does not manage database persistence.

### Styling

- Sass
- SCSS Modules

Each reusable component has its own `*.module.scss` file.

During early development, temporary styles are centralized in:

`app/dev.scss`

This allows application workflows and component architecture to be developed before committing to the final visual design.

Temporary development styles should eventually be removed or migrated into the appropriate component SCSS Modules.

---

# Application Structure

The application follows the Next.js App Router architecture.

The primary layers are:

1. Server pages
2. Database queries
3. Server actions
4. Client interaction components
5. Reusable presentation components
6. Shared application types

Server-rendered pages are responsible for loading initial application data.

Client components are introduced only where interactive state is required.

---

# Server Pages

Pages should remain server components whenever possible.

Server pages are responsible for:

- Loading database data
- Composing major application sections
- Passing initial data into client interaction boundaries

Current primary routes include:

- `/investment`
- `/collection`
- `/psa-submissions`
- `/psa-submissions/[submissionNumber]`

The Investment and Collection pages fetch data such as:

- Cards
- Card statuses
- PSA submissions

These values are then passed to client components responsible for interactive workflows.

PSA submission detail pages load:

- Submission metadata
- Cards belonging to the submission
- Card-specific grading information

Database queries should not be moved into client components.

---

# Shared Application Types

Shared application/domain types are stored in:

`types/types.ts`

Types representing the same application entity should not be independently recreated inside multiple components.

For example, the shared:

`Card`

type is used by components such as:

- `CardPortfolio`
- `CardTable`

The shared Card type can contain both database-backed card properties and query-derived application properties.

Current derived properties include:

- `effectiveStatus`
- `activePsaSubmissionNumber`

These are part of the application representation of a card but are not columns on the `cards` database table.

Centralizing these types reduces duplication and prevents component representations of the same entity from drifting apart.

---

# Database Access

Database access is handled through Drizzle ORM.

The shared database connection is located in:

`db/index.ts`

Database schema definitions are located in:

`db/schema.ts`

Reusable read operations live under:

`db/queries/`

Current examples include:

- `db/queries/cards.ts`
- `db/queries/psaSubmissions.ts`
- `db/queries/psaSubmissionCards.ts`

Queries should describe application-level reads rather than embedding database logic throughout page components.

For example:

`getCardsByPortfolio("investment")`

is preferred over recreating the same Drizzle query directly inside multiple pages.

---

# Card Query Model

Portfolio card queries return both stored card data and information derived from active PSA submissions.

`getCardsByPortfolio()` first retrieves the cards belonging to the requested portfolio.

It then retrieves active PSA submission information for those card IDs.

The results are combined into the application Card model.

Current derived properties include:

- `effectiveStatus`
- `activePsaSubmissionNumber`

This avoids storing PSA workflow information redundantly on the `cards` table.

### Effective Status

If a card belongs to an active PSA submission:

```text
effectiveStatus = PSA Grading - {stage}
```

when a stage exists.

For example:

`PSA Grading - Assembly`

If no active PSA submission exists:

```text
effectiveStatus = manual card status
```

### Active PSA Submission Number

If a card belongs to an active PSA submission:

`activePsaSubmissionNumber`

contains the human-facing PSA submission number.

This allows card views to link directly to:

`/psa-submissions/[submissionNumber]`

If no active PSA submission exists, the value is null.

---

# Server Actions

Database mutations are implemented as server actions.

Server actions live under:

`app/actions/`

Current examples include:

- `app/actions/cards.ts`
- `app/actions/psaSubmissions.ts`

Server actions are responsible for operations such as:

- Creating cards
- Updating cards
- Moving cards between portfolios
- Creating PSA submissions
- Attaching cards to PSA submissions
- Updating PSA submission metadata
- Updating individual PSA submission card information
- Updating grading results
- Future card sales

After mutations, affected routes are revalidated using Next.js `revalidatePath()` where appropriate.

Client components call server actions rather than directly accessing the database.

---

# Card Architecture

Investment cards and Collection cards use the same underlying `cards` database table.

They are not separate card entities.

A card's current location is determined by its `portfolio` value:

- `investment`
- `collection`

This allows a card to move between portfolios without:

- Creating a duplicate card
- Losing purchase information
- Losing PSA history
- Losing sale history
- Resetting cost basis

Portfolio movement is therefore a business action on an existing card rather than creation of a new card.

---

# Investment and Collection Views

Investment and Collection are separate views over the same card data.

Routes:

`/investment`

`/collection`

The server page queries only cards belonging to the appropriate portfolio.

Cards created from the Investment page are explicitly created with:

`portfolio = investment`

Cards created from the Collection page are explicitly created with:

`portfolio = collection`

The database also defaults new cards to `investment` as a defensive default.

Normal card editing does not modify the portfolio.

Moving a card between portfolios is an explicit operation handled separately.

---

# Portfolio Interaction Architecture

The Investment and Collection pages remain server components.

Portfolio-level client interaction is owned by:

`CardPortfolio`

`CardPortfolio` acts as the client-side interaction boundary between server-rendered portfolio data and interactive card workflows.

It currently owns state for:

- Selected cards
- Portfolio movement modal
- PSA submission modal

Future portfolio-level bulk actions should generally live at this layer rather than inside the table.

---

# CardTable

`CardTable` is responsible for displaying and interacting with individual card rows.

It uses TanStack Table v9.

Current responsibilities include:

- Displaying card data
- Displaying effective card status
- Displaying active PSA submission information
- Linking to active PSA submissions
- Row selection
- Inline editing
- Triggering row-level actions

It does not own portfolio-level workflow state.

For example, when the user chooses to move a card, `CardTable` reports the selected card to `CardPortfolio`.

`CardPortfolio` then controls the modal and executes the portfolio-level workflow.

This keeps `CardTable` reusable and prevents it from becoming responsible for unrelated application workflows.

---

# CardTable PSA Behavior

The Status column displays:

`effectiveStatus`

rather than directly displaying the stored manual card status.

When a card belongs to an active PSA submission:

- The PSA-derived status is displayed.
- The current PSA stage may be included in the status.
- Manual status editing is not exposed while PSA controls the displayed status.
- The stored manual status remains unchanged.

When no active PSA submission exists:

- The stored manual status becomes the effective status.
- Manual status editing is available normally.

The table also includes a PSA Submission column.

When an active submission exists, the submission number links to:

`/psa-submissions/[submissionNumber]`

Cards without an active PSA submission display no active submission link.

---

# TanStack Table

The application currently uses TanStack Table v9.

The configured table features include row selection.

Row selection is keyed using the database card ID:

```ts
getRowId: (row) => String(row.id);
```

This is important because selection represents real card records rather than temporary table indexes.

The resulting selection state can therefore be converted directly into database card IDs for bulk server actions.

Selection state is owned by `CardPortfolio` and passed into `CardTable`.

This allows other portfolio-level components to react to the same selection.

---

# Row Selection

Table row selection supports multi-card workflows.

Selection does not imply multi-editing.

Inline editing remains a single-card workflow.

Multi-selection is intended for operations such as:

- Adding cards to a PSA submission
- Creating a PSA submission
- Future bulk actions where appropriate

Selecting cards does not automatically trigger an action.

Instead, selecting one or more cards exposes the available bulk-action controls.

---

# Inline Card Editing

Existing cards can be edited directly within their table row.

Only one card is edited at a time.

The editing state is owned by `CardTable`.

Editable fields currently include:

- Player
- Category
- Year
- Set
- Info
- Manual status when not PSA-controlled
- Purchase price

Additional card values that are not currently displayed as editable columns are preserved during the update.

Saving calls the `updateCard` server action.

After a successful save, editing mode closes.

Portfolio is intentionally excluded from ordinary card editing.

If an active PSA submission currently controls a card's effective status, the PSA-derived status is displayed instead of the manual status control.

---

# Card Creation

Card creation is handled through a reusable `CardForm`.

The Add Card workflow is opened using a right-side Drawer.

The current portfolio is passed into the form so cards are created directly in the correct portfolio.

This means:

- Add Card from Investment creates an Investment card.
- Add Card from Collection creates a Collection card.

The form should not infer the portfolio from browser state or URLs when the parent already knows the correct portfolio.

---

# Drawer

`Drawer` is a reusable client-side UI component.

It is intended for workflows where maintaining visual context with the underlying page is useful.

Current usage:

- Add Card

Drawer behavior includes:

- Right-side presentation
- Backdrop
- Close button
- Escape-key closing

The current appearance is temporary and styled through `app/dev.scss`.

---

# Modal

`Modal` is a reusable client-side UI component.

It is intended for:

- Confirmations
- Focused short workflows
- Decisions that should temporarily interrupt the current interaction

Current usages include:

- Moving a card between Investment and Collection
- Adding selected cards to PSA submissions
- Creating a PSA submission from selected cards

Modal behavior includes:

- Centered dialog
- Backdrop
- Close button
- Escape-key closing

The current appearance is temporary and styled through `app/dev.scss`.

---

# Drawer vs Modal

Use Drawer when the user benefits from maintaining context with the current page while entering or reviewing information.

Use Modal for shorter focused actions or confirmations.

Examples:

### Drawer

- Add Card
- Potentially detailed card editing in the future

### Modal

- Confirm portfolio movement
- Choose PSA submission
- Create a PSA submission from selected cards
- Short confirmation workflows

---

# PSA Submission Architecture

PSA submissions are separate entities from cards.

A submission can contain many cards.

A card can participate in multiple PSA submissions over its lifetime.

Examples include:

- Initial grading
- Crack and resubmit
- Review
- Regrading

For this reason, PSA membership is modeled using:

`psa_submission_cards`

rather than storing a single PSA submission ID directly on `cards`.

The relationship also stores grading information specific to that particular card and grading attempt.

---

# PSA Submission Creation

The portfolio table supports selecting multiple cards.

When cards are selected, a bulk action becomes available:

`Add to PSA Submission`

The workflow allows selected cards to:

- Create a new PSA submission
- Be added to an existing PSA submission

Creating a new submission creates:

1. The `psa_submissions` record.
2. The corresponding `psa_submission_cards` relationships.

Adding cards to an existing submission creates the required relationship records.

The database prevents the same card from appearing more than once in the same submission.

The application additionally prevents a card from being assigned to more than one active PSA submission at a time.

After a successful PSA operation:

- The modal closes.
- Row selection clears.

---

# Active PSA Submission Validation

A card may have multiple historical PSA submissions.

However, it may belong to only one active PSA submission at a time.

A submission is considered active when:

```text
completed_date IS NULL
```

Before creating a PSA submission or adding cards to an existing submission, the application checks whether any selected card already belongs to another active submission.

Validation queries:

`psa_submission_cards`

joined with:

`psa_submissions`

and checks for relationships belonging to submissions whose `completed_date` is null.

When adding cards to an existing submission, that submission is excluded from the conflict check.

This rule is currently enforced at the application/server-action layer rather than through a database constraint.

Historical PSA relationships remain intact after completion.

---

# PSA Submission Views

The PSA submission list route is:

`/psa-submissions`

It provides access to existing PSA submissions.

Submission information includes:

- Submission number
- Stage
- Sent date
- Received date
- Completed date

Individual submissions use the human-facing PSA submission number in the URL:

`/psa-submissions/[submissionNumber]`

Example:

`/psa-submissions/15288930`

The URL intentionally does not expose the internal database primary key as the primary user-facing identifier.

The submission is resolved using:

`getPsaSubmissionByNumber()`

The internal submission ID continues to be used for database relationships and mutations.

---

# PSA Submission Detail

The PSA submission detail page provides access to:

- Submission metadata
- Cards belonging to the submission
- Base grading fees
- Shared grading costs
- Individual grading adjustments
- Total grading cost per card
- Individual grading results
- Derived submission statistics

Submission metadata can currently be edited directly from the detail page.

Editable submission-level fields include:

- Stage
- Sent date
- Received date
- Completed date
- Shipping cost
- Insurance cost
- Total amount charged

---

# PSA Submission Components

The PSA submission workflow currently uses several focused components.

## PsaSubmissionForm

`PsaSubmissionForm` manages submission-level metadata.

Current fields include:

- Stage
- Sent date
- Received date
- Completed date
- Shipping cost
- Insurance cost
- Total amount charged

Updates are persisted through the PSA submission server actions.

## PsaSubmissionCardRow

`PsaSubmissionCardRow` manages grading information for an individual card within a submission.

Current editable values include:

- Base grading fee
- Grading adjustment/upcharge
- Grade status
- Numeric grade

The component maintains local client state for grading-result controls so the UI remains synchronized after saving.

Grade status supports:

- Pending
- Graded
- No Grade

When the result is Pending or No Grade, the numeric grade is cleared.

## PsaSubmissionStats

`PsaSubmissionStats` displays grading statistics derived from the cards in the submission.

Current statistics include:

- Total cards
- Completed cards
- PSA 10
- PSA 9
- PSA 8.5
- PSA 8
- PSA 7.5 or Less
- No Grade
- Gem Rate
- PSA 9 or Better

These statistics are derived from grading results rather than stored independently.

---

# PSA Grading Status

A card's manual status and its PSA submission stage are separate concepts.

The card stores its normal/manual status.

The PSA submission stores its current stage.

The application derives the displayed card status when the card belongs to an active PSA submission.

For example:

`PSA Grading - Assembly`

The PSA stage is not copied into the card's stored status.

Conceptually:

```text
if active PSA submission exists:
    effectiveStatus = PSA-derived submission status
else:
    effectiveStatus = manual card status
```

This preserves the card's previous manual status throughout grading.

---

# PSA Submission Completion

Completing a PSA submission is represented by setting:

`completed_date`

Once `completed_date` has a value:

- The submission is no longer active.
- It stops controlling the cards' effective statuses.
- Each card returns to its stored manual status.
- The submission/card relationships remain intact.
- Grading results remain part of the card's history.
- Cards become eligible to participate in another active PSA submission.

Completing a submission therefore changes its operational role without deleting its historical data.

---

# PSA Grading Results

Grading results belong to the relationship between a card and a PSA submission.

Current grade statuses are:

- `pending`
- `graded`
- `no_grade`

A graded result contains a numeric grade.

A Pending or No Grade result has a null numeric grade.

Current statistical grade buckets are:

- PSA 10
- PSA 9
- PSA 8.5
- PSA 8
- PSA 7.5 or Less
- No Grade

These buckets are derived rather than stored.

---

# PSA Submission Statistics

PSA grading statistics are calculated from completed grading outcomes.

Completed outcomes include:

- Graded cards
- No Grade cards

Pending cards are excluded until resolved.

## Gem Rate

```text
Gem Rate =
PSA 10 / completed grading outcomes
```

No Grade counts in the denominator.

## PSA 9 or Better

```text
PSA 9 or Better =
(PSA 10 + PSA 9) / completed grading outcomes
```

No Grade counts in the denominator.

For example:

```text
PSA 10
PSA 10
PSA 9
No Grade
```

produces:

```text
Gem Rate = 50%
PSA 9 or Better = 75%
```

---

# PSA Costs

PSA grading costs are modeled using both submission-level and card-level values.

Submission-level shared costs include:

- Shipping
- Insurance

Card-level costs include:

- Base grading fee
- Grading adjustment/upcharge

Shared costs are currently allocated equally among cards in the submission.

Conceptually:

```text
shared cost per card =
(shipping + insurance) / number of cards
```

Then:

```text
grading cost per card =
base grading fee
+ shared cost per card
+ grading adjustment
```

The allocated shared amount is derived rather than redundantly stored on every card relationship.

The submission also stores:

`total_amount_charged`

This represents the actual total charged by PSA and allows reconciliation against calculated grading costs.

---

# Cost Basis

Card financial values should be derived wherever possible.

Primary stored financial values include:

- Purchase price
- PSA grading costs
- Sale price

Conceptually:

```text
effective cost basis =
purchase price + applicable PSA grading costs
```

Profit:

```text
profit =
sale price - effective cost basis
```

ROI:

```text
ROI =
profit / effective cost basis
```

Derived financial values should not be stored unless a future requirement makes persistence necessary.

Moving a card between Investment and Collection does not reset its original cost basis.

---

# Pulled Cards

Cards may be acquired either by direct purchase or by being pulled from sealed product.

Current acquisition types are:

- `purchased`
- `pulled`

Pulled cards may have no purchase price.

The application does not currently attempt to allocate the cost of a box or sealed product across individual pulled cards.

Pulled cards can still:

- Participate in PSA submissions
- Accumulate grading costs
- Receive grading results
- Contribute to Gem Rate and other PSA statistics
- Be sold

Sealed-product tracking may be introduced later as a separate feature.

---

# Card Statuses

Card statuses are database records rather than a PostgreSQL enum.

This allows statuses to evolve without schema migrations.

Current seeded examples include:

- In Transit
- Lost In Transit
- Raw Pile
- DCSports Submission
- Sold

These are initial values, not a permanent restricted list.

Status represents the card's operational/manual state.

It is separate from sale method.

For example:

```text
Status: Sold
Sold Via: Dallas Card Show
```

---

# Autocomplete Strategy

Autocomplete values should primarily be derived from existing card records.

Potential autocomplete fields include:

- Player
- Category
- Set
- Purchased from
- eBay seller
- Sold via

Autocomplete should suggest existing values while still allowing new values.

Separate lookup tables should not be created solely to support autocomplete unless a future requirement requires managed canonical values.

---

# Component Architecture

Reusable application concepts should be implemented as components from the beginning.

Current major components include:

- `CardPortfolio`
- `CardTable`
- `CardForm`
- `AddCard`
- `Drawer`
- `Modal`
- `PsaSubmissionForm`
- `PsaSubmissionCardRow`
- `PsaSubmissionStats`

Components should own only the state and behavior appropriate to their responsibility.

Avoid turning page components into large client-side components merely to support a small interactive workflow.

Likewise, avoid placing unrelated workflow state inside reusable presentation components.

---

# Component Styling

Every component should have a sibling SCSS Module when it is created.

Current structure includes concepts such as:

```text
components/
├── AddCard/
│   ├── AddCard.tsx
│   └── AddCard.module.scss
├── CardForm/
│   ├── CardForm.tsx
│   └── CardForm.module.scss
├── CardPortfolio/
│   ├── CardPortfolio.tsx
│   └── CardPortfolio.module.scss
├── CardTable/
│   ├── CardTable.tsx
│   └── CardTable.module.scss
├── Drawer/
│   ├── Drawer.tsx
│   └── Drawer.module.scss
├── Modal/
│   ├── Modal.tsx
│   └── Modal.module.scss
├── PsaSubmissionCardRow/
│   ├── PsaSubmissionCardRow.tsx
│   └── PsaSubmissionCardRow.module.scss
├── PsaSubmissionForm/
│   ├── PsaSubmissionForm.tsx
│   └── PsaSubmissionForm.module.scss
└── PsaSubmissionStats/
    ├── PsaSubmissionStats.tsx
    └── PsaSubmissionStats.module.scss
```

A component's SCSS Module may initially be empty.

Temporary development styling should remain in:

`app/dev.scss`

until the application reaches the stage where real component styling is being implemented.

Temporary styling should not be prematurely moved into component modules merely because the module exists.

---

# Data and UI Responsibility Boundaries

The current architecture follows several important responsibility boundaries.

## Database

Stores source-of-truth persistent data.

Examples:

- Manual card status
- Purchase price
- Portfolio
- PSA submission stage
- Grading result
- Grading fees

## Queries

Combine persistent data into application-level read models.

Examples:

- Cards by portfolio
- Effective card status
- Active PSA submission number

## Server Actions

Implement mutations and enforce workflow rules.

Examples:

- Move card between portfolios
- Prevent multiple active PSA submissions
- Update grading result

## Server Pages

Load and compose application data.

## Client Components

Own interactive UI state.

Examples:

- Selected table rows
- Open/closed Drawer
- Open/closed Modal
- Inline editing state
- Controlled grading form state

## Presentation Components

Render focused reusable UI concepts without becoming responsible for unrelated workflows.

This separation should continue as additional financial, grading, filtering, and analytics features are introduced.

---

# Deferred Architecture

Several areas are intentionally deferred until their workflows are required.

These include:

- Final visual design
- Sorting/filtering/faceting implementation
- Pagination strategy
- Card autocomplete implementation
- Sale workflow UI
- Profit and ROI presentation
- Portfolio movement history
- Sealed-product tracking
- PSA grade qualifiers and expanded grade metadata
- Advanced PSA analytics
- Alternative shared-cost allocation methods

These should be introduced based on concrete application requirements rather than speculative architecture.
