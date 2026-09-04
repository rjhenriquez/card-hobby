# Card Hobby — Requirements

## Purpose

Build a personal application for managing sports-card investments, PSA grading submissions, grading performance, sales, and a personal card collection.

The application will eventually replace several separate Apple Numbers files with one connected system.

Existing Numbers data will **not** be imported during initial development. The application will first be built and tested using records created manually through the application. Existing data will be imported later after the workflows and data model are stable.

---

## 1. Cards

Cards are the central records in the application.

Investment cards and personal collection cards should use the same underlying card model rather than being completely separate types of records.

### Typical card information

- Player
- Category
- Year
- Set
- Info
- Notes
- Purchase Date
- Purchased From
- eBay Seller
- Purchase Price / Cost
- Current Status
- Grading information
- Sale information

### Existing Investment Spreadsheet

The existing investment spreadsheet currently contains:

- Player
- Category
- Status
- Year
- Set
- Info
- Notes
- Purchase Date
- Purchased From
- eBay Seller
- Price
- Grading
- PSA Sub #
- Grading Result
- Total
- Sold
- Sold Date
- Profit
- Percentage

These existing columns are reference material only. The new application's data model does not need to match the spreadsheet exactly.

---

## 2. Card Portfolios

A card can primarily belong to one of two areas:

- Investment
- Collection

Investment and Collection are different views/usages of the same underlying card records.

Cards must be movable between Investment and Collection without creating a duplicate card or losing the card's existing information/history.

---

## 3. Investment → Collection

If an investment card is moved into the personal collection:

- The card's original purchase information is preserved.
- Its cost is removed from investment totals.
- Its cost becomes part of collection costs.
- It is no longer counted as active investment inventory.

---

## 4. Collection → Investment

A collection card can later be moved back into Investments.

Its original cost basis should remain available.

### Example

A card is originally purchased for **$300**.

The card moves:

`Investment → Collection`

Three years later it moves:

`Collection → Investment`

The card then sells for **$800**.

The original **$300 cost basis** should still be used when calculating the eventual investment profit/ROI, along with any other applicable expenses.

---

## 5. Personal Collection

The current Collection Numbers file contains:

- Player
- Year
- Set
- Info
- Notes
- State
- Purchase Date
- Cost

The new Collection view does not need to preserve these exact columns.

Collection cards should use the shared Card model, and the Collection table can simply display the fields that are relevant to collection management.

---

## 6. Card Status

Card status represents where an individual card currently is in its lifecycle.

Existing examples include:

- In Transit
- Lost In Transit
- Raw Pile
- DCSports Submission
- Sold

These are examples, **not a permanent fixed list**.

The application should not be designed around a restrictive list of statuses because additional statuses/workflows may be needed later.

Before grading, individual card statuses are generally manually controlled.

---

## 7. Status vs. Sale Method

Card status and how/where a card was sold are separate concepts.

For example, `Dallas Card Show` should **not** be the card status.

Instead:

- **Status:** Sold
- **Sold Via:** Dallas Card Show

Other examples:

- **Status:** Sold
- **Sold Via:** eBay

or:

- **Status:** Sold
- **Sold Via:** DC Sports

Sale-related information should therefore be stored separately from card status.

Expected sale information includes things such as:

- Sold status
- Sold Via / Sale Channel
- Sold Date
- Sold Price

Profit and ROI/percentage should be calculated from the underlying financial information rather than manually maintained values whenever possible.

---

## 8. PSA Submissions

PSA submissions are separate records from cards.

A PSA submission contains multiple cards.

The workflow should allow:

- Selecting multiple cards.
- Adding the selected cards to an existing PSA submission.
- Creating a new PSA submission from selected cards.
- Viewing all cards belonging to a submission.
- Updating the submission as it moves through PSA.

A card's PSA submission should remain part of its grading history after the submission is completed.

---

## 9. Multiple PSA Submissions / Grading History

The data model should allow a card to potentially participate in more than one PSA submission during its lifetime.

This allows future workflows such as:

- Crack and resubmit
- Regrading
- Review
- Other future grading scenarios

A new submission should not destroy the card's previous grading history.

---

## 10. PSA Grouped Status

Cards behave differently while they are being prepared for grading or are actively being graded.

During this part of the lifecycle, cards can share/inherit status information from their PSA submission.

Instead of manually changing every card in a submission, the submission should be updated once and all cards belonging to the active submission should reflect that change.

### Example

A submission has:

**PSA Stage:** Assembly

Cards in that submission could display:

**PSA Grading - Assembly**

If the submission later changes to another PSA stage, all cards in that active submission should automatically reflect the new stage.

The exact PSA stages will be defined later.

The important requirement is that the **PSA submission controls the shared grading status while the submission is active**.

The application should not need to copy the PSA stage into every individual card record.

---

## 11. Status After PSA Grading

Once grading is completed, the PSA submission should **stop controlling the current status of the individual cards**.

Each graded card must once again have an independently controllable/manual status.

This is important because cards from the same completed submission may immediately follow very different paths.

For example:

- One card may be held.
- One may be listed on eBay.
- One may be sent to a consignor.
- One may be sold at a card show.
- One may move into the personal collection.
- Another may follow a completely different workflow.

The completed PSA submission and grading result remain part of the card's history, but they no longer dictate its current status.

---

## 12. PSA Grading Results

Individual cards within a PSA submission need their own grading results.

Examples include:

- PSA 10
- PSA 9
- PSA 8.5
- PSA 8
- PSA 7 or lower
- No Grade

Exact grading-result handling can be refined later.

The grading result belongs to the card's participation in a particular PSA submission so that historical grading results can be preserved if a card is ever submitted more than once.

---

## 13. PSA Gem Rate / Grading Analytics

A separate Numbers file is currently used to track grading performance.

Its current columns are:

- Received Date
- Submission #
- Total Cards
- Gem Mint 10
- Mint 9
- Near Mint+ 8.5
- Near Mint 8
- 7 or less
- No Grade
- Gem Rate
- 9 or better

In the new application, this information should **not** need to be manually maintained as an independent dataset.

Once a PSA submission is completed and individual card grades are known, the application should derive these statistics automatically from the submission's cards.

Examples:

- Total cards
- Number of PSA 10s
- Number of PSA 9s
- Number of PSA 8.5s
- Number of PSA 8s
- Number graded 7 or lower
- Number receiving no grade
- Gem Rate
- Percentage graded 9 or better

Completed PSA submissions should therefore be usable as a grading-performance/Gem Rate table.

---

## 14. Future Grading Analytics

Because grading results are connected to individual cards, the application should eventually be capable of analyzing grading performance beyond individual submissions.

Possible views include:

- Overall Gem Rate
- Gem Rate by submission
- Gem Rate by player
- Gem Rate by year
- Gem Rate by set
- Gem Rate by category
- Gem Rate over time
- Grade distribution
- Average grade

These do not all need to be implemented initially.

---

## 15. Card Data Entry

Cards should be addable manually through the application.

During initial development, this will be the primary way test data is created.

The application should support normal card-management operations such as:

- Add
- Edit
- Delete
- Change status
- Move between Investment and Collection
- Add to PSA submission
- Enter grading results
- Enter sale information

---

## 16. Autocomplete

Data entry should become faster as more records are added.

Previously entered values should be available as autocomplete suggestions where appropriate.

### Example

The first Lionel Messi card requires manually entering:

`Lionel Messi`

When another Messi card is added later, typing part of the name should suggest:

`Lionel Messi`

Users must always be able to enter a completely new value if the desired value does not already exist.

Autocomplete may eventually apply to reusable fields such as:

- Player
- Category
- Set
- Purchased From
- eBay Seller
- Sold Via / Sale Channel

A separate manually maintained player list should not be required solely for autocomplete. Suggestions can be derived from existing application data where appropriate.

The exact fields can be determined as the forms are built.

---

## 17. Financial Tracking

The application should eventually calculate investment performance from the underlying card data.

Important concepts include:

- Purchase cost
- Other applicable expenses
- Sale price
- Profit
- ROI / Percentage
- Active investment cost
- Collection cost

Calculated values such as Profit and ROI should preferably be **derived rather than stored as manually maintained values**.

Moving a card between Investment and Collection should change which portfolio totals include its cost without destroying its original cost basis.

---

## Pulled Cards / Unknown Acquisition Cost

Some cards enter the system because they were pulled from a box or other sealed product rather than purchased individually.

In those cases, assigning an exact purchase price to the individual card may be impractical or misleading.

The application should therefore support at least two acquisition types:

- Purchased
- Pulled

For purchased cards:

- Purchase Price can be recorded normally.

For pulled cards:

- Purchase Price may be left blank / unknown.
- The card can still be added to PSA submissions.
- The card can still receive grading costs.
- The card can still contribute to Gem Rate and grading analytics.
- The card can still be sold and tracked normally.

The application should not automatically divide the cost of a box across individual pulled cards unless a future allocation method is explicitly defined.

For a pulled card, the system may know direct costs such as PSA grading costs while the original acquisition cost remains unallocated.

Financial reporting should avoid presenting an incomplete known cost basis as if it were the card's true all-in economic cost.

Tracking sealed-product purchases or linking cards to specific boxes may be added later if that becomes a useful workflow.

## 18. Tables, Filters and Views

The application should provide useful table views for the different parts of the card hobby.

Primary areas currently expected:

- Investments
- Collection
- PSA Submissions
- Completed PSA / Gem Rate

Tables should eventually support useful behaviors such as:

- Sorting
- Filtering
- Searching
- Row selection
- Selecting multiple cards
- Column visibility where useful
- Other specialized views as requirements become clearer

TanStack Table is the currently planned table solution because it provides table behavior while allowing the application's markup and styling to remain custom.

---

## 19. Analytics / Dashboards

The application should eventually make it possible to create views and graphs that are difficult or inconvenient to maintain in Numbers.

Potential investment analytics include:

- Total invested
- Active inventory cost
- Collection cost
- Total sales
- Profit
- ROI
- Profit over time
- ROI by player
- ROI by set
- Amount invested over time
- Cards currently at PSA
- Average holding time

Exact dashboards and charts will be decided later.

---

## 20. Existing Numbers Files / Data Migration

Existing Numbers files are **not being imported during the initial build**.

Development should use test records created through the application's actual workflows.

This allows the application's data model and behavior to be designed around the desired workflow rather than being constrained by the structure of the old spreadsheets.

After the application and workflows are stable:

`Numbers files → export/import → application database`

The existing data will then be mapped into the new model.

The Numbers files are a migration source, not the application's ongoing source of truth.

---

## 21. General Design Principles

The application should have one connected source of truth rather than maintaining independent copies of related information.

Examples:

- A PSA submission's status should not need to be manually copied onto every card.
- Gem Rate statistics should be calculated from grading results rather than maintained separately.
- Moving a card between Investment and Collection should not duplicate the card.
- Profit and ROI should be calculated from financial data rather than independently maintained.
- A card's history should be preserved as it moves through different workflows.
- Original financial information such as cost basis should not be lost when a card changes portfolios.
- Historical PSA grading information should not be destroyed by a later PSA submission.

The system should remain flexible because card-investing workflows can change and new statuses, sale methods, grading scenarios, and reporting needs may appear later.

---

# Current High-Level Application Areas

```text
Cards
├── Investments
└── Collection

PSA
├── Active Submissions
├── Completed Submissions
└── Gem Rate / Grading Analytics

Analytics
├── Investment Performance
├── Sales / Profit
└── Grading Performance
```
