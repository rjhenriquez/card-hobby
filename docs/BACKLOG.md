# Card Hobby --- Backlog

## Purpose

This document captures future features and unresolved workflow
improvements. Implemented behavior belongs in the requirements,
architecture, database, and progress documents rather than remaining
here.

## Portfolio Financial Summaries

Define and implement portfolio-level financial reporting after the exact
accounting semantics are agreed upon.

Potential Investment metrics:

-   Total Invested
-   Current Inventory Cost
-   Total Sales
-   Realized Profit
-   Realized ROI

Open definitions include:

-   Whether Total Invested means all historical spending or only capital
    currently tied up.
-   Whether Total Sales and Realized Profit include only payments
    actually received.
-   How unknown-cost pulled cards affect aggregate profit and ROI.
-   Whether active PSA costs appear in a separate pending-cost metric.
-   Separate Collection cost summary.

Realized ROI should be an aggregate calculation, not an average of
individual card ROI percentages.

## Historical Investment Tables

The Investment page should eventually separate current/unpaid inventory
from historical paid/Sold cards.

Planned direction:

-   Current table contains investment cards whose sale proceeds have not
    yet been received, including Pending Payment.
-   Paid/Sold cards move into historical year-based tables.
-   Historical year grouping should use `soldDate`.

This is deferred until imported test data and current workflows are
stable.

## PSA Resubmission / Crack and Resubmit

A completed card may later participate in another PSA submission. Each
attempt creates a new `psa_submission_cards` relationship and preserves
all previous grading history.

Future work is primarily UX/presentation of multiple grading attempts.

## PSA Data Import

The first CSV card importer intentionally imported ordinary card data
only.

A separate PSA importer should eventually reconstruct:

-   PSA submissions
-   Submission/card relationships
-   Grades/results
-   Relevant historical submission information

Do not infer active PSA state merely from old spreadsheet columns
without defining the migration mapping.

## Collection Shared / Posted State

Collection cards should eventually support a persistent `isShared`-style
property for tracking whether a card has been posted/shared publicly.

This remains deferred until current financial/package workflows are
complete.

## Packages and Shipment Tracking

The `/packages` route is now the umbrella UI for package tracking.

Current purchase-package support includes:

-   Multiple selected cards
-   Shared subtotal, tax, and shipping
-   Per-card hammer price
-   Carrier
-   Tracking number
-   ETA
-   Received/delivered state

Future package/shipment work should extend the generic page to include
PSA-related shipments and other package types.

Potential future sources:

-   Incoming marketplace purchases
-   PSA outbound shipment
-   PSA return shipment
-   Other incoming/outgoing card packages

The generic shipment architecture should avoid assuming one package
equals one card.

### Automated Carrier Tracking

Future integration may retrieve carrier status and ETA automatically
from external carrier/tracking APIs.

Until then:

-   Carrier is entered explicitly.
-   Tracking number is stored.
-   ETA is entered manually.
-   Delivery/receipt is marked manually.

Quick carrier tracking links can be added before full API integration.

## Purchase Package Integrity

Consider stronger enforcement that a card cannot belong to more than one
purchase package.

The current relationship uniqueness prevents duplicate membership within
the same package but may still allow the same card to be attached to
different purchase packages.

Define the desired correction/migration behavior before adding a
stricter constraint.

## Purchase Package Validation

Consider requiring `itemsSubtotal > 0` when package tax allocation is
used. The current derived-price query safely avoids division by zero,
but the desired business validation should be explicit.

## Unpaid eBay Purchases

The old spreadsheet contained `UNPAID` rows representing cards purchased
on eBay but intentionally awaiting payment while accumulating purchases.

This is a distinct workflow and should not be mapped to `In Transit`.

Define this acquisition/payment-before-shipment workflow separately when
needed.

## Autocomplete

Suggest previously used values while allowing new values.

Candidates:

-   Player
-   Category
-   Set
-   Purchased From
-   eBay Seller
-   Sold Via

## Table Improvements

Sorting is now implemented.

Remaining table improvements may include:

-   Filtering
-   Search
-   Faceted filters
-   Column visibility
-   Specialized portfolio filters
-   Pagination if data volume requires it

## Investment Analytics

Potential future analytics:

-   Total invested
-   Active inventory cost
-   Collection cost
-   Total sales
-   Profit over time
-   ROI by player
-   ROI by set
-   Amount invested over time
-   Average holding time

## PSA Analytics

Potential analytics beyond individual submissions:

-   Overall Gem Rate
-   Gem Rate by player
-   Gem Rate by year
-   Gem Rate by set
-   Gem Rate by category
-   Gem Rate over time
-   Grade distribution
-   Average grade

## Sealed Products / Pulled Cards

Future sealed-product tracking may record boxes, packs, breaks, purchase
price/source/date, and cards pulled.

Do not automatically allocate sealed-product cost to individual pulled
cards until an explicit method is defined.

## Portfolio Movement History

A future history model could record Investment ↔ Collection moves with
previous portfolio, new portfolio, date, and optional reason.

## PSA Grade Metadata

Future support may include full PSA grade names/abbreviations and
qualifiers while keeping numeric grade separate.

## Explicit PSA Reopen Workflow

Completed submissions can currently be temporarily edited for
corrections. If a true lifecycle-level "reopen" operation becomes
necessary, define it separately rather than treating ordinary historical
corrections as reopening.
