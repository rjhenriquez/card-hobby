## Current State

The initial PostgreSQL schema is deployed to Neon and the application can create, retrieve, update, and move card records through Drizzle ORM.

Separate Investment and Collection views are working, with cards created directly into the appropriate portfolio. Cards can be moved between Investment and Collection without recreating the card or losing their original acquisition data or cost basis.

Card records are displayed using TanStack Table v9. Existing cards can be edited inline directly within their table row, including player, category, year, set, info, status, and purchase price.

Table rows support multi-selection using TanStack Table row selection keyed by database card ID. Selected cards expose portfolio-level bulk actions.

A reusable right-side Drawer is used for creating new cards. A reusable Modal component is used for focused workflows such as portfolio movement and PSA submission actions.

Selected cards can be added to a new PSA submission or an existing PSA submission. Creating a submission also creates the corresponding `psa_submission_cards` relationships.

PSA submissions have individual detail pages using the human-readable submission number in the URL:

`/psa-submissions/[submissionNumber]`

Each submission detail page displays its cards and allows submission metadata, grading costs, and individual grading results to be managed.

PSA submission metadata can be edited, including stage, sent date, received date, completed date, shipping cost, insurance cost, and total amount charged.

Individual cards within a PSA submission can have a base grading fee, grading adjustment/upcharge, and grading result. Shared submission costs are allocated equally across the cards in the submission.

Submission statistics are derived from individual grading results, including grade distribution, Gem Rate, and percentage graded PSA 9 or better.

Cards may have multiple historical PSA submissions over their lifetime, but a card may belong to only one active PSA submission at a time.

An active PSA submission controls the card's displayed status without replacing its stored manual status. For example, a card in a submission at the Assembly stage displays `PSA Grading - Assembly`.

When the PSA submission is completed, it stops controlling the card's current displayed status and the card returns to its independently managed manual status.

The card table displays the active PSA submission number and links directly to the corresponding submission detail page.

Shared application types have begun moving into `types/types.ts` to avoid duplicating domain interfaces such as `Card` across components.

Temporary development styles remain in `app/dev.scss` while core workflows are being built and tested.

## Completed

- Added PSA submission detail pages.
- Changed PSA submission detail routes to use the human-readable submission number rather than the internal database ID.
- Added `getPsaSubmissionByNumber()` database query.
- Added retrieval of all cards belonging to an individual PSA submission.
- Added reusable `PsaSubmissionForm` component.
- Added editing of PSA submission stage.
- Added editing of PSA sent date.
- Added editing of PSA received date.
- Added editing of PSA completed date.
- Added editing of submission shipping cost.
- Added editing of submission insurance cost.
- Added editing of total amount charged by PSA.
- Added reusable `PsaSubmissionCardRow` component.
- Added per-card base grading fee.
- Added per-card grading adjustment/upcharge.
- Added equal allocation of shared shipping and insurance costs across submission cards.
- Added derived total grading cost for each card.
- Added individual PSA grading-result editing.
- Added grading-result states:
  - Pending
  - Graded
  - No Grade
- Numeric grades are cleared when a grading result is changed to Pending or No Grade.
- Fixed PSA grading-result forms so saved grading state remains synchronized in the UI without requiring a manual page refresh.
- Added reusable `PsaSubmissionStats` component.
- Added derived PSA grade buckets:
  - PSA 10
  - PSA 9
  - PSA 8.5
  - PSA 8
  - PSA 7.5 or Less
  - No Grade
- Added derived completed-card count for PSA statistics.
- Added derived Gem Rate.
- Added derived percentage graded PSA 9 or better.
- Defined No Grade as a completed negative grading outcome that counts in the denominator for Gem Rate and PSA 9-or-better calculations.
- Pending cards are excluded from grading-statistic denominators until resolved.
- Added validation preventing a card from belonging to more than one active PSA submission at the same time.
- Added active-submission validation when creating a new PSA submission.
- Added active-submission validation when adding cards to an existing PSA submission.
- Preserved support for the same card appearing in multiple historical PSA submissions over its lifetime.
- Defined an active PSA submission as a submission whose `completedDate` is null.
- Added derived card `effectiveStatus`.
- Active PSA submissions override the displayed card status without modifying the stored manual card status.
- Active PSA stage is included in the derived status when available, for example `PSA Grading - Assembly`.
- Completed PSA submissions stop controlling the card's displayed status.
- Updated CardTable to display `effectiveStatus` rather than the underlying manual status.
- Prevented manual status editing while an active PSA submission is controlling the card's displayed status.
- Fixed the Collection page so it correctly queries and operates on Collection cards rather than Investment cards.
- Added active PSA submission information to card queries.
- Added `activePsaSubmissionNumber` to the card application model.
- Added a PSA Submission column to CardTable.
- Active PSA submission numbers link directly to `/psa-submissions/[submissionNumber]`.
- Added a shared root-level `types/types.ts` file.
- Moved the shared `Card` interface into `types/types.ts`.
- Removed duplicated Card interfaces from `CardTable` and `CardPortfolio`.
- Updated TanStack Table column typing to use the shared `Card` interface.
- TypeScript validation passes cleanly after the shared Card type refactor.

## Current Work

Finishing integration of active PSA submission information into the main Investment and Collection card tables.

The card table now displays both the PSA-derived effective status and the active PSA submission number, with the submission number linking directly to its PSA submission detail page.

The remaining workflow should be tested end-to-end before moving on to additional features.

## Important Recent Decisions

- A card may have unlimited historical PSA submissions over its lifetime.
- A card may belong to only one active PSA submission at a time.
- A PSA submission is considered active while `completedDate` is null.
- Completing a PSA submission releases its cards from submission-controlled status.
- PSA submission stage is not copied into the card's stored status.
- `status` represents the card's stored/manual status.
- `effectiveStatus` represents the status currently displayed by the application.
- When a card belongs to an active PSA submission, `effectiveStatus` is derived from that submission.
- PSA-derived status should include the current submission stage when available, such as `PSA Grading - Assembly`.
- Manual card status remains preserved while PSA controls the displayed status.
- Cards controlled by an active PSA submission should not expose manual status editing until the submission is completed.
- The active PSA submission number should be visible directly from the card table and link to the submission detail page.
- PSA submission URLs use the human-readable submission number rather than the internal database ID.
- PSA grading results distinguish between Pending, Graded, and No Grade.
- PSA 8.5 is tracked as its own grade bucket.
- Grades of PSA 7.5 or lower are grouped into the `7.5 or Less` bucket for current submission statistics.
- No Grade counts as a completed grading outcome.
- No Grade counts in the denominator when calculating Gem Rate.
- No Grade counts in the denominator when calculating percentage PSA 9 or better.
- Pending cards do not count in grading-statistic denominators.
- Gem Rate is calculated as:

  `PSA 10 / completed grading outcomes`

- Percentage PSA 9 or better is calculated as:

  `(PSA 10 + PSA 9) / completed grading outcomes`

- Shared PSA shipping and insurance costs are divided equally among cards in the submission.
- Per-card grading cost is calculated as:

  `base grading fee + allocated shared submission cost + grading adjustment`

- `total_amount_charged` remains stored at the PSA submission level for reconciliation.
- Shared domain interfaces should live in `types/types.ts` rather than being duplicated across components.

## Next Step

Test the complete PSA workflow end-to-end:

1. Create cards.
2. Select multiple cards.
3. Create a new PSA submission from the selected cards.
4. Confirm those cards display the PSA-derived status.
5. Confirm the active PSA submission number appears in the card table.
6. Confirm the submission number links to the correct PSA submission detail page.
7. Update the PSA submission through multiple grading stages.
8. Confirm card `effectiveStatus` follows the current submission stage.
9. Enter individual grading costs and adjustments.
10. Enter individual grading results, including graded and No Grade outcomes.
11. Verify grade buckets, Gem Rate, and PSA 9-or-better calculations.
12. Complete the PSA submission.
13. Confirm the submission no longer controls the cards' displayed statuses.
14. Confirm the cards retain their original manual statuses.
15. Confirm the completed PSA submission remains available as grading history.
16. Confirm those cards can later be added to another PSA submission.
