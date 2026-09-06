# Card Hobby --- Requirements

## Purpose

Build a personal application for managing sports-card investments,
personal collection cards, PSA grading submissions, grading performance,
sales/payment receipt, purchase packages, cost basis, and future
analytics.

The application replaces disconnected spreadsheet workflows with one
connected source of truth.

Initial development began with manually created records. A controlled
CSV test import has now successfully loaded ordinary card data; PSA
historical migration remains separate/deferred.

## 1. Cards

Cards are the central records and are shared between Investment and
Collection.

Typical information includes:

-   Player
-   Category
-   Year
-   Set
-   Info
-   Notes
-   Acquisition type
-   Purchase Date
-   Purchased From
-   eBay Seller
-   Standalone Purchase Price
-   Effective Price
-   Current/effective Status
-   PSA history
-   Sale/payment information

## 2. Portfolios

A card belongs to either Investment or Collection and must move between
them without duplication or loss of history/cost basis.

Investment → Collection removes it from active investment totals and
makes it part of Collection.

Collection → Investment restores it to Investment while preserving
original financial/history data.

Collection cards cannot be sold directly. They must first move to
Investment.

## 3. Card Status

Statuses are extensible database records, not a fixed enum.

Known examples include:

-   In Transit
-   Lost In Transit
-   Raw Pile
-   DCSports Submission
-   Pending Payment
-   Sold

Pending Payment and Sold are workflow-controlled sale/payment states and
should not be manually selected through ordinary card editing.

Active PSA submissions can temporarily override displayed status without
overwriting the stored manual status.

## 4. Card Creation, Editing, and Deletion

Cards must support Add, Edit, Delete, status changes, portfolio
movement, PSA workflows, purchase-package workflows, and sale entry.

Add/Edit Card uses the same reusable drawer/form workflow.

Delete Card is available from Edit Card and requires reusable Modal
confirmation.

Ordinary card editing must not silently change portfolio or sale
lifecycle state.

## 5. PSA Submissions

PSA submissions are separate records containing multiple cards.

Requirements include:

-   Select multiple cards.
-   Create a new submission.
-   Add to an existing active submission.
-   View submission detail.
-   Edit submission metadata/costs/results.
-   Remove accidentally added cards from active submissions.
-   Finish a submission.
-   Preserve completed relationships/history.
-   Allow multiple historical grading attempts.
-   Allow only one active submission per card.

An active submission has no Completed Date.

## 6. PSA Status

While a submission is active, its stage controls the cards' displayed
PSA status:

`PSA Grading - {stage}`

The PSA stage is not copied into each card's stored status.

When the submission finishes, each card returns to its independently
controlled manual/workflow status.

## 7. PSA Results and Analytics

Relationship-level grade statuses:

-   Pending
-   Graded
-   No Grade

Statistical buckets:

-   PSA 10
-   PSA 9
-   PSA 8.5
-   PSA 8
-   PSA 7.5 or lower
-   No Grade

Completed outcomes include Graded and No Grade. Pending is excluded.

`Gem Rate = PSA 10s ÷ Completed Outcomes`

`9 or Better = (PSA 10s + PSA 9s) ÷ Completed Outcomes`

No Grade counts in both denominators.

## 8. PSA Costs

Submission shared costs:

-   Outbound Shipping
-   Insured Return Shipping

Per-card costs:

-   Base Grading Fee
-   Grading Adjustment / Upcharge

Shared cost allocation is equal across all cards in the submission.

`Shared Cost Per Card = (Outbound Shipping + Insured Return Shipping) ÷ N`

`Card Submission Grading Cost = Base Fee + Adjustment + Shared Cost`

`Total Submission Cost = Sum Base Fees + Sum Adjustments + Outbound Shipping + Insured Return Shipping`

Total Submission Cost is derived, not stored.

Only finished PSA submissions contribute to card financial totals.

## 9. Finished PSA Submissions

Finish Submission automatically assigns completion date.

Finishing:

-   Ends active status control.
-   Preserves relationships/history.
-   Makes costs eligible for card financial totals.
-   Allows cards to enter future submissions.

Finished submissions are read-only by default but can be explicitly
unlocked for corrections.

Completed relationships are not normally removable.

## 10. Purchase Packages

The application must support multiple cards purchased together in one
package, initially targeting eBay-style combined purchases.

A package is created by selecting exactly the cards that belong to it.

Package information includes:

-   Items Subtotal
-   Shipping Total
-   Taxes Total
-   Carrier
-   Tracking Number
-   Estimated Delivery Date
-   Received/Delivered state

Each selected card has its own Hammer Price.

There is no manually entered/stored Number of Items. Item count is
derived from attached cards.

## 11. Package Price Allocation

For a package containing `N` cards:

`Allocated Tax = Hammer Price × Taxes Total ÷ Items Subtotal`

`Allocated Shipping = Shipping Total ÷ N`

`Price = Hammer Price + Allocated Tax + Allocated Shipping`

Tax is proportional to hammer price. Shipping is equal per card.

The derived package amount is the card's **Price**.

Do not introduce a separate visible "Acquisition Cost" concept for this
calculation.

For standalone purchased cards, Price comes from the card's standalone
Purchase Price.

For package cards, package-derived Price takes precedence in the read
model without overwriting the stored standalone `purchase_price`.

For pulled cards, Price remains unknown.

## 12. Packages Page

The application has a generic:

`/packages`

route.

Although current persistence is purchase-package-specific, the route
should eventually support all relevant incoming/outgoing packages,
including PSA logistics.

For each purchase package, the default/collapsed view should show:

-   Package identifier
-   Total package value
-   Carrier
-   Tracking number
-   ETA
-   Current received/in-transit state
-   Cards inside the package

Cards must remain visible even when the package is not expanded.

Collapsed card information should include:

-   Player
-   Category
-   Year
-   Set
-   Info

Hammer prices and detailed financial breakdown should be hidden until
expanded.

## 13. Package Editing

Package workflows should use a reusable `PackageModal` so behavior and
styling are centralized.

The modal must accept context/location.

When opened from Investment or Collection package workflows, the full
package information can be available.

When Edit is opened from the Packages page, the initial edit view should
focus on logistics/status:

-   Carrier
-   Tracking Number
-   ETA
-   Mark Received/Delivered

The modal must include an Expand control that allows financial
corrections when needed, including:

-   Items Subtotal
-   Shipping Total
-   Taxes Total
-   Per-card Hammer Price

Cards should remain visible even before expansion.

## 14. Sale and Payment Lifecycle

Sale information is separate from normal card metadata.

Stored sale fields include:

-   Sold Via
-   Sold Date
-   Sold Price
-   Payment Received (`isPaid`)

`soldDate` means the date the sale occurred, not the payment date.

No separate paid date is currently required.

Lifecycle:

`Active/manual status → Sale Entered → Pending Payment → Payment Received → Sold`

When a sale exists but payment has not been received:

-   `isPaid = false`
-   Status = Pending Payment

When payment is received:

-   `isPaid = true`
-   Status = Sold

Payment receipt must remain reversible for corrections.

Normal status editing must not manually select Pending Payment or Sold.

## 15. Sale UI

Sale fields live inside the same Edit Card drawer as card details but
use a separate Sale form/action.

Normal card metadata is saved independently from sale information.

The Sale section should show Total Cost and allow:

-   Sold Via
-   Sold Date
-   Sold Price
-   Payment Received

Existing sales can be corrected using the same section.

## 16. Financial Tracking

Core derived values:

-   Price
-   Finalized PSA Grading Cost
-   Total Cost
-   Sold Price
-   Profit
-   ROI

`Total Cost = Price + Finalized PSA Grading Cost`

`Profit = Sold Price - Total Cost`

`ROI = Profit ÷ Total Cost × 100`

Profit/ROI are unknown when Total Cost is unknown.

For pulled cards, Price/Total Cost remain unknown until a future
acquisition-cost model exists.

## 17. Portfolio-Level Financial Reporting

Portfolio summary metrics are required eventually but definitions must
be agreed before implementation.

Candidates:

-   Total Invested
-   Current Inventory Cost
-   Total Sales
-   Realized Profit
-   Realized ROI

Likely reporting should distinguish current/unpaid inventory from paid
historical sales.

Paid/Sold historical cards may eventually be grouped into year tables
based on `soldDate`.

## 18. Data Import

Existing spreadsheet data is a migration source, not the ongoing source
of truth.

A first CSV importer has successfully imported 47 ordinary card test
records.

The first importer intentionally excludes PSA historical relationships.

Future import work should be separated by domain rather than forcing old
spreadsheet columns directly into the new model.

Duplicate protection must be added before an importer is considered safe
to rerun.

## 19. Sorting, Filtering, and Selection

TanStack Table v9 is the table engine.

Current requirements implemented:

-   Row selection
-   Database-ID selection keys
-   Sorting

Selection must support multiple explicit modes/workflows such as:

-   Add cards to PSA submission
-   Add cards to purchase package

Future table improvements include filtering, search, faceting, and
column visibility.

## 20. Autocomplete

Previously used values should become suggestions while still allowing
new values.

Candidates include:

-   Player
-   Category
-   Set
-   Purchased From
-   eBay Seller
-   Sold Via

## 21. Pulled Cards

Acquisition types:

-   Purchased
-   Pulled

Pulled cards may have unknown individual acquisition cost.

They can still be graded, sold, and included in grading analytics, but
the application must not imply a complete cost basis when acquisition
cost is unknown.

Sealed-product cost allocation is deferred.

## 22. Future Shipment Tracking

The generic Packages area should eventually support more than incoming
purchase packages.

Potential package/shipment types include:

-   Incoming marketplace purchases
-   PSA outbound shipments
-   PSA return shipments
-   Other incoming/outgoing card packages

Carrier status and ETA are manual initially. Automated carrier
integration can be added later.

## 23. General Design Principles

-   One connected source of truth.
-   Preserve card identity/history across workflows.
-   Derive totals/statistics when possible.
-   Do not copy PSA stage into card status.
-   Do not overwrite standalone purchase price with package allocation.
-   Do not duplicate cards when moving portfolios.
-   Do not destroy historical PSA relationships.
-   Do not treat active PSA costs as finalized card costs.
-   Do not treat sale occurrence and payment receipt as the same event.
-   Reuse UI concepts/components such as Drawer, Modal, and
    PackageModal.
-   Keep reusable component styling centralized in each component's SCSS
    Module when final styling begins.
-   Keep workflows flexible enough to evolve without unnecessary
    restrictive enums.
