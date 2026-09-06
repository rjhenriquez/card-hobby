# Card Hobby --- Progress

## Current State

The primary card lifecycle is functional across card creation/editing,
Investment/Collection movement, PSA grading, finalized cost basis,
sale/payment tracking, CSV test-data import, sorting, and multi-card
purchase packages.

Card editing has moved away from inline table editing. Add and Edit use
the same right-side card drawer/form. Delete Card lives inside the Edit
drawer and uses the reusable confirmation Modal.

Sale information also lives in the Edit Card drawer as a separate Sale
section with its own server action. The old standalone SellCard
modal/component workflow has been removed.

The sale lifecycle now distinguishes a sale from receipt of payment:

`Active/manual status → sale entered → Pending Payment → Payment Received → Sold`

The `isPaid` field records whether proceeds have actually arrived.
Payment receipt can be corrected later in either direction.

The card read model now derives Price, finalized Grading Cost, Total
Cost, Profit, and ROI.

A controlled CSV import successfully loaded 47 ordinary test cards.

TanStack Table v9 sorting is implemented.

Multi-row selection now supports both PSA submission workflows and
purchase-package creation.

Purchase packages are implemented for multiple cards purchased together.
Shared tax and shipping are allocated into each card's effective Price,
while each relationship stores its hammer price.

A generic `/packages` page now lists purchase packages and is being
refined around a reusable `PackageModal`.

## Completed

### Application Foundation

-   Neon/PostgreSQL + Drizzle deployed.
-   Investment and Collection views.
-   Shared card model.
-   Add Card.
-   Edit Card through reusable drawer.
-   Delete Card from Edit drawer with confirmation Modal.
-   Explicit Investment ↔ Collection movement.
-   Sidebar navigation.
-   Shared domain types.
-   SCSS Modules per component.
-   Temporary styling centralized in `styles/temporary.scss`.
-   Prettier configuration and format-on-save established.

### TanStack Table

-   TanStack Table v9.
-   Database-ID row selection.
-   Controlled selection owned by `CardPortfolio`.
-   Client-side sorting using `rowSortingFeature`.
-   `createSortedRowModel()` configured.
-   Selection modes support different bulk workflows.

### PSA Submission Workflow

-   Create PSA submission from selected cards.
-   Add selected cards to existing submission.
-   One active submission per card validation.
-   Historical multiple submissions supported.
-   Human-readable submission-number routes.
-   Submission detail pages.
-   Submission metadata/cost editing.
-   Per-card grading fee/upcharge/result editing.
-   Active relationship removal.
-   Finished relationship protection.
-   Finish Submission workflow.
-   Finished submission read-only mode with explicit Edit Submission.
-   Derived Total Submission Cost.
-   Derived PSA grading statistics.
-   Active PSA status override without overwriting manual status.
-   Historical PSA submission links on cards.
-   Finished PSA costs included in card financials; active costs
    excluded.

### Card Financial Read Model

Derived fields now include:

-   `gradingCost`
-   `price`
-   `totalCost`
-   `profit`
-   `roi`

For standalone purchased cards, Price uses `purchasePrice`.

For purchase-package cards, Price is derived from hammer price plus
allocated tax and shipping.

For pulled cards, Price and Total Cost remain unknown.

`Total Cost = Price + finalized PSA Grading Cost`

`Profit = Sold Price - Total Cost`

`ROI = Profit ÷ Total Cost × 100`

### Sale and Payment Workflow

-   Sale fields are edited inside the Card drawer.
-   Normal card metadata and sale data use separate actions/forms.
-   `sellCard()` owns sale fields.
-   Collection cards cannot be sold directly.
-   Sale does not change portfolio.
-   `isPaid` added.
-   `Pending Payment` status added.
-   Sale without received payment → Pending Payment.
-   Payment received → Sold.
-   Payment Received checkbox can be reversed for corrections.
-   `soldDate` remains the actual sale date.
-   No paid-date field.
-   Pending Payment and Sold are excluded from normal manual status
    choices.
-   Profit and ROI remain derived.

### CSV Test Import

-   Built initial CSV card importer.
-   Dry run successfully validated 47 card records.
-   Imported all 47 test cards.
-   Initial importer intentionally excludes PSA relationship
    reconstruction.
-   Duplicate protection is not yet implemented; do not blindly rerun
    the same import.
-   Old spreadsheet `UNPAID` concept was intentionally not mapped to In
    Transit.

### Purchase Packages

Implemented database entities:

-   `purchase_packages`
-   `purchase_package_cards`

Package fields include:

-   Items Subtotal
-   Shipping Total
-   Taxes Total
-   Carrier
-   Tracking Number
-   Estimated Delivery Date
-   Received/Delivered boolean

Per-card relationship stores:

-   Hammer Price

There is no Number of Items field. Package card count is derived from
selected relationships.

### Purchase Package Creation

`CardPortfolio` selection mode now supports:

-   PSA submission
-   Purchase package

The purchase-package creation workflow:

1.  Select exactly the cards in the package.
2.  Enter package subtotal, shipping, tax, logistics information.
3.  Enter hammer price for each selected card.
4.  Save package and relationships.
5.  Clear selection.
6.  Revalidate Investment/Collection so derived Price updates.

The package formula is:

`Price = hammerPrice + (hammerPrice × taxesTotal ÷ itemsSubtotal) + (shippingTotal ÷ packageCardCount)`

Tax is proportional; shipping is equal.

The package-derived amount is the card's visible **Price**, not a second
"Acquisition Cost" field.

`cards.purchasePrice` remains the standalone underlying purchase value
and is not overwritten by package calculations.

### Packages Page

Added generic route:

`/packages`

Current purchase-package list includes package logistics/status and the
cards inside each package.

Desired collapsed package presentation:

-   Package \#
-   Total Value
-   Carrier
-   Tracking
-   ETA
-   Status
-   Cards inside package

Cards remain visible while collapsed using identifying card information:

-   Player
-   Category
-   Year
-   Set
-   Info

Hammer prices and detailed financial breakdown belong to the expanded
state.

### Package Editing / PackageModal

A reusable `PackageModal` is being introduced so package
editing/creation behavior and styling are not duplicated.

The modal accepts context/location so behavior can differ by where it is
opened.

Planned/current direction:

-   Investment/Collection context can expose full package information.
-   Packages-page Edit initially exposes tracking/logistics/status
    fields.
-   An Expand button inside the modal reveals financial fields and
    per-card hammer prices for corrections.
-   Package cards remain visible even before expansion.

The Packages page itself also supports an Expand/Collapse presentation
for detailed financial information.

## Current Lifecycle

``` text
Create/import card
→ Investment or Collection
→ Move between portfolios when needed
→ Optional purchase package allocation
→ Add to PSA Submission
→ PSA-controlled displayed status
→ Enter PSA costs/results
→ Finish Submission
→ Finalized grading cost enters card financials
→ Optional sale entered
→ Pending Payment
→ Payment Received
→ Sold
→ Profit/ROI derived
→ Preserve card, sale, package, and PSA history
```

## Important Recent Decisions

-   Card editing is drawer-based, not inline.
-   Sale fields live in the same Edit Card drawer but use a separate
    sale action.
-   Delete Card lives in Edit drawer with reusable confirmation Modal.
-   Sold is not merely "sale exists"; payment receipt controls
    transition to Sold.
-   `isPaid` is the factual payment-received flag.
-   Pending Payment and Sold are workflow-controlled statuses.
-   Payment receipt is reversible for correction.
-   No `paidDate`.
-   Current/historical Investment tables are deferred until test data is
    stable.
-   Sorting is implemented.
-   Bulk selection has explicit workflow modes.
-   Purchase-package item count is derived from selected cards.
-   Package-derived Price replaces standalone purchase price in the read
    model when a package relationship exists.
-   Package Price does not overwrite `cards.purchasePrice`.
-   Total Cost continues to mean Price + finalized PSA grading cost.
-   `/packages` is a generic UI route even though current
    DB/query/action entities remain purchase-specific.
-   Carrier, tracking, ETA, and received state are manual for now.
-   No shipped/delivered date fields are required yet.
-   Package cards should always be visible on the package page; hammer
    prices/details require expansion.
-   Reusable `PackageModal` should centralize package workflow/styling
    and adapt by location.
-   Portfolio-level financial summaries remain intentionally paused
    until metric definitions are agreed upon.

## Next Step

Continue the package UI refinement, especially the reusable
`PackageModal` and Packages-page editing behavior.

After package UI is stable, likely next work includes either:

-   defining portfolio-level financial summaries, or
-   extending package/shipment tracking toward PSA outbound/return
    shipments.

Historical year-based paid/Sold Investment tables remain planned but
deferred until the imported data and lifecycle behavior are stable.
