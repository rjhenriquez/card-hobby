# Card Hobby --- Architecture

## Overview

Card Hobby is a personal sports-card management system focused on
investment inventory, personal collection inventory, PSA grading
submissions, card sales/payment lifecycle, cost basis and profitability,
purchase-package allocation/tracking, and PSA grading analytics.

The application uses Next.js, TypeScript, PostgreSQL/Neon, Drizzle ORM,
TanStack Table v9, Sass, and SCSS Modules. The architecture separates
persistent data, application read models, server mutations,
server-rendered pages, client interaction boundaries, shared types, and
reusable UI components.

The application is built incrementally around real workflows rather than
reproducing the old Numbers spreadsheets directly.

## Technology Stack

-   Next.js App Router
-   TypeScript
-   React / React Compiler
-   PostgreSQL on Neon
-   Drizzle ORM / Drizzle Kit
-   TanStack Table v9
-   Sass / SCSS Modules

Each reusable component receives its own `*.module.scss` file when
created. Temporary development styling remains centralized in
`styles/temporary.scss` until final styling work begins.

## Application Structure

Primary layers:

1.  Server pages
2.  Database queries/read models
3.  Server actions
4.  Client interaction components
5.  Reusable presentation/workflow components
6.  Shared application types

Server pages load initial data. Database access stays out of client
components.

Current primary routes include:

-   `/`
-   `/investment`
-   `/collection`
-   `/psa-submissions`
-   `/psa-submissions/[submissionNumber]`
-   `/packages`

## Global Navigation

The root layout uses the reusable `Sidebar`. Major areas include
Dashboard, Investments, Collection, PSA Submissions, and Packages.

## Shared Application Types

Shared domain types live in `types/types.ts`. The `Card` application
type contains stored card properties plus query-derived values.

Important derived card values now include:

-   `effectiveStatus`
-   `psaSubmissionNumbers`
-   `gradingCost`
-   `price`
-   `totalCost`
-   `profit`
-   `roi`

`price` is the effective amount paid for the individual card. For a
standalone purchased card it comes from `cards.purchasePrice`. For a
card belonging to a purchase package it is derived from hammer price
plus allocated package tax and shipping. Pulled cards have unknown/null
Price.

## Database Access

The shared database connection is in `db/index.ts`; schema definitions
are in `db/schema.ts`; reusable reads live under `db/queries/`.

Current query areas include cards, PSA submissions, PSA submission
cards, and purchase packages.

## Card Read Model

`getCardsByPortfolio()` combines stored card records with PSA history
and purchase-package information.

### Effective Status

If a card belongs to an active PSA submission, its displayed status is
PSA-derived:

`PSA Grading - {stage}`

Otherwise the stored manual/workflow status is displayed.

Sale workflow states are also controlled by sale/payment actions rather
than ordinary manual status editing.

### PSA Submission History

Cards expose all historical PSA submission numbers through
`psaSubmissionNumbers`. Only an active submission controls
`effectiveStatus`.

### Grading Cost

`gradingCost` summarizes costs from finished PSA submissions only.
Active PSA costs are excluded from card financial totals.

### Price

For purchased cards:

-   If the card belongs to a purchase package, Price is derived from
    package data.
-   Otherwise Price uses the standalone `purchasePrice`.

Package formula:

`Price = Hammer Price + proportional allocated tax + equal allocated shipping`

More explicitly:

`Price = hammerPrice + (hammerPrice × taxesTotal ÷ itemsSubtotal) + (shippingTotal ÷ packageCardCount)`

The package card count is derived from the cards attached to the
package; it is not stored separately.

For pulled cards, Price remains unknown/null.

### Total Cost, Profit, ROI

`Total Cost = Price + finalized PSA Grading Cost`

Profit and ROI are derived only when the required values are known:

`Profit = Sold Price - Total Cost`

`ROI = Profit ÷ Total Cost × 100`

## Server Actions

Server actions live under `app/actions/`.

Current mutation areas include:

-   Card creation/editing/deletion
-   Moving cards between portfolios
-   Recording/editing sales and payment receipt
-   PSA submission creation/membership/editing/completion
-   Purchase-package creation/editing

Server actions enforce workflow rules and revalidate affected routes.

### Card Editing vs Sale Editing

`updateCard()` owns ordinary card metadata. It does not own sale fields
and preserves workflow-controlled status when a sale exists.

`sellCard()` owns sale fields and payment lifecycle:

-   Sold Via
-   Sold Date
-   Sold Price
-   Payment Received (`isPaid`)
-   Pending Payment / Sold workflow status

### Purchase Package Actions

`createPurchasePackage()` creates the package and its selected card
relationships.

`updatePurchasePackage()` updates package logistics/financial
information and per-card hammer prices.

Affected portfolio/package routes are revalidated so derived Price
values update immediately.

## Card and Portfolio Architecture

Investment and Collection use the same `cards` table. Portfolio movement
is an explicit operation on the same card, preserving acquisition
information, PSA history, sale history, and cost basis.

Collection cards cannot be sold directly; they must first move to
Investment. Selling does not move a card out of Investment.

## CardPortfolio

`CardPortfolio` is the client interaction boundary for Investment and
Collection.

It owns state for:

-   Card editing
-   Portfolio movement
-   Multi-row selection
-   PSA submission selection workflows
-   Purchase-package selection workflows

Selection mode distinguishes workflows such as:

-   `submission`
-   `purchase-package`

Successful bulk workflows clear row selection.

## CardTable

`CardTable` uses TanStack Table v9 and is responsible for displaying
card rows, sorting, selection, and row-level action triggers.

Current behavior includes:

-   Row selection keyed by database card ID
-   Client-side sorting with `rowSortingFeature` and
    `createSortedRowModel()`
-   Edit action
-   Move action
-   Price, Grading Cost, Total Cost
-   Investment sale values such as Sold Price, Profit, and ROI
-   PSA submission history links

Card editing is no longer inline. Editing uses the same card drawer/form
workflow used by Add Card.

## Card Creation and Editing

`CardForm` is used for both creating and editing cards inside a
right-side Drawer.

The current portfolio is passed explicitly during creation. Ordinary
editing does not modify portfolio.

For Investment cards, the same edit drawer contains a separate Sale
section. The normal card form and sale form use separate server actions
and are not nested forms.

Delete Card also lives in the Edit drawer and uses the reusable
confirmation `Modal`.

## Sale and Payment Lifecycle

The sale lifecycle distinguishes sale occurrence from payment receipt.

`cards.isPaid` records whether sale proceeds have actually been
received.

Lifecycle:

`Active/manual status → sale entered → Pending Payment → Payment Received → Sold`

-   `soldDate` is the actual sale date, not payment date.
-   No separate paid date is stored.
-   Payment Received can be corrected later.
-   Unchecking Payment Received returns the workflow status to Pending
    Payment.
-   Checking it sets status to Sold.
-   Pending Payment and Sold are workflow-controlled and are not
    ordinary manually selectable statuses.

## Drawer and Modal

`Drawer` is used for longer contextual workflows such as Add/Edit Card.

`Modal` is used for confirmations and focused workflows and renders
through a portal.

A reusable `PackageModal` is being introduced for purchase-package
creation/editing so package behavior and styling are not duplicated.

`PackageModal` is location-aware:

-   In Investment/Collection contexts, package creation/editing can
    expose the full package information.
-   On the Packages page, Edit initially exposes logistics/status fields
    such as carrier, tracking, ETA, and received/delivered state.
-   The modal includes an Expand control that exposes financial fields
    and per-card hammer prices when corrections are needed.

The package cards themselves remain visible even when the financial
section is collapsed.

## Purchase Package Architecture

Purchase packages model multiple cards purchased together, currently
focused on eBay-style combined packages.

Persistent entities:

-   `purchase_packages`
-   `purchase_package_cards`

The package stores shared purchase/logistics information. The
relationship stores each card's hammer price.

A package does not store item count; the number of attached package
cards is the item count.

Purchase-package data is intentionally named specifically even though
the UI route is the generic `/packages`, because future package/shipment
views may combine incoming purchases and outgoing/return PSA shipments.

## Packages Page

`/packages` is the generic package-management route.

For purchase packages, the collapsed package view is designed to show:

-   Package identifier
-   Total package value
-   Carrier
-   Tracking number
-   ETA
-   Received/In Transit status
-   Cards inside the package

Card rows show identification information such as:

-   Player
-   Category
-   Year
-   Set
-   Info

Financial details and hammer prices are hidden until Expand.

Edit uses `PackageModal` rather than a separate inline package form.

## PSA Architecture

PSA submissions are separate entities with many-to-many historical card
relationships through `psa_submission_cards`.

A card may have many historical submissions but only one active
submission at a time. An active submission has `completedDate === null`.

Active PSA stage controls displayed status without overwriting manual
card status.

Finishing a submission sets the completion date, releases status
control, preserves history, and makes its costs eligible for card
financial totals.

Finished submissions are read-only by default but can be explicitly
unlocked for corrections.

## PSA Costs and Statistics

Submission shared costs:

-   Outbound Shipping
-   Insured Return Shipping

Per-card costs:

-   Base Grading Fee
-   Grading Adjustment/Upcharge

Shared costs are allocated equally across submission cards.

Total Submission Cost is derived, not stored.

PSA result buckets:

-   PSA 10
-   PSA 9
-   PSA 8.5
-   PSA 8
-   PSA 7.5 or Less
-   No Grade

No Grade counts as a completed outcome and remains in Gem Rate and 9+
denominators. Pending cards are excluded.

## Import Architecture

Initial manual-only development has progressed to a controlled test-data
import.

A CSV importer was created for ordinary card data. A dry run validated
47 cards and the import successfully loaded those 47 test cards.

The first importer intentionally does not reconstruct PSA relationships
or sale-derived workflow data. PSA import remains a separate future
migration step.

The current importer does not implement duplicate protection and should
not be rerun blindly against the same data.

## Responsibility Boundaries

### Database

Stores canonical persistent values.

### Queries

Build application-level read models and derived values.

### Server Actions

Mutate data and enforce workflow rules.

### Server Pages

Load and compose data.

### Client Components

Own interactive state.

### Reusable Components

Own reusable UI/workflow behavior without taking responsibility for
unrelated application domains.

## Deferred Architecture

Still deferred or intentionally incomplete:

-   Portfolio-level financial summary definitions
-   Historical paid/Sold year tables
-   Collection `isShared`
-   PSA CSV/history import
-   Generic unified shipment model for purchase + PSA shipments
-   Automated carrier status/ETA APIs
-   Autocomplete
-   Advanced filtering/faceting
-   Final visual design
-   Sealed-product tracking
-   Portfolio movement history
-   Expanded PSA grade metadata
