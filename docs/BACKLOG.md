# Card Hobby — Backlog

## Purpose

This document captures features, workflow improvements, and ideas discovered while building and using Card Hobby.

Items in this document are intended features or problems to solve, but their exact implementation has not necessarily been finalized.

Once a feature's behavior is clearly defined, its requirements should be moved or expanded into `REQUIREMENTS.md`.

Architecture and database documentation should only be updated once the implementation approach has been decided.

---

# PSA Submission Improvements

## Remove Card From PSA Submission

There is currently no way to remove a card from a PSA submission after it has been added.

A card should be removable from an active PSA submission when it was added by mistake.

Potential workflow:

- Open PSA submission detail page.
- Remove a card from the submission.
- Require confirmation before removal.
- Remove the corresponding `psa_submission_cards` relationship.
- Preserve the underlying card record.
- The card should immediately stop receiving PSA-derived status from that submission.
- The card should become eligible to be added to another active PSA submission.

Removal from an active submission should be treated differently from deleting historical grading information.

Once a submission has been completed and contains grading history, removing the relationship should likely be restricted or require a separate correction workflow.

Exact rules still need to be defined.

---

## PSA Resubmission / Crack and Resubmit

A card that has completed one PSA submission may later be submitted again.

Examples:

- Crack and resubmit
- Review
- Regrading

This should create a new `psa_submission_cards` relationship for the new submission.

The previous submission relationship and grading result must remain intact as historical grading data.

A resubmission should therefore not "move" the old PSA relationship to the new submission.

Conceptually:

`Card → PSA Submission #1 → completed grade`

then later:

`Card → PSA Submission #2 → new grading attempt`

Both grading attempts remain in the card's history.

---

# Shipment Tracking

## Shipment Tracking Page

Add a dedicated page for tracking cards and PSA shipments that are currently in transit.

The goal is to replace the small external shipment-tracking table currently used to keep track of incoming purchases.

Possible route:

`/shipments`

The same shipment view should support multiple shipment sources and purposes.

Examples include:

- Card purchased on eBay and being shipped to me.
- Card purchased from another marketplace or seller.
- PSA submission being returned from PSA.
- Potentially a PSA submission being shipped from me to PSA.
- Other card-related shipments in the future.

---

## Purchase Shipment Example

Typical workflow:

1. Buy a card on eBay.
2. Add the card to Card Hobby.
3. Card appears in the Investment portfolio.
4. Seller ships the card.
5. Add shipment/tracking information.
6. Shipment appears on the Shipments page.
7. Track the card until delivery.
8. Once delivered, the shipment can be marked completed/delivered while the card remains in the normal card inventory.

Potential shipment information includes:

- Carrier
- Tracking number
- Tracking URL
- Shipment source
- Ship date
- Expected delivery date
- Delivered date
- Shipment status
- Notes
- Associated card or cards

Exact fields still need to be decided.

---

## PSA Return Shipment Example

When PSA completes a submission and ships the graded cards back, the return shipment should appear in the same Shipments page used for incoming card purchases.

Example:

`PSA Submission #15288930`

could have a return shipment containing:

- Carrier
- Tracking number
- Tracking URL
- Ship date
- Expected delivery date
- Delivered date
- Current shipment status

The shipment should be associated with the PSA submission so the application knows which cards are included.

A PSA return shipment may contain multiple cards.

This means shipment tracking should not assume that every shipment belongs to exactly one card.

---

## Unified Shipment Model

Shipment tracking should eventually use one general shipment concept rather than separate systems for:

- eBay purchases
- PSA returns
- other purchases
- future outbound shipments

The Shipments page should provide one place to answer:

- What cards are currently coming to me?
- What PSA orders are currently coming back?
- What is the tracking number?
- When should the package arrive?
- Has it been delivered?
- What cards are inside that shipment?

The exact database model should be designed when this feature is implemented.
