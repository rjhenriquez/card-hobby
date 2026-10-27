# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal sports-card management app ("Card Hobby"): investment inventory, personal collection, PSA grading submissions, purchase packages, sales/payment tracking, cost basis/profit/ROI, and PSA gem-rate analytics. Replaces an older Numbers-spreadsheet workflow.

Stack: Next.js 16 App Router + React 19 (React Compiler enabled in `next.config.ts`), TypeScript, PostgreSQL on Neon via Drizzle ORM (`drizzle-orm/neon-http`), TanStack Table v9, Recharts, Sass/SCSS Modules. Deployed on Vercel.

## Commands

```bash
npm run dev                 # dev server at http://localhost:3000
npm run build
npm run lint                # eslint (next core-web-vitals + typescript)
npx tsc --noEmit            # type check (no test suite exists)

npx drizzle-kit generate    # generate a migration in drizzle/ after editing db/schema.ts
npx drizzle-kit migrate     # apply migrations to the DATABASE_URL database
npm run db:seed             # seed card statuses (db/seed.ts)
npm run backup:db           # pg_dump to backups/<timestamp>/ (requires pg_dump)

# CSV import scripts: dry run by default, writes only with --import
npx tsx scripts/import-cards.ts cards_sold.csv [--import]
npx tsx scripts/import-collection.ts collection.csv [--import]
```

`DATABASE_URL` lives in `.env.local` (loaded by drizzle.config.ts, seed, and scripts). There is one database — it holds real data, so take a backup before destructive migrations or imports. The importers have no duplicate protection; don't rerun them against the same data.

Formatting: Prettier with tabs, double quotes, single quotes in JSX, trailing commas (format-on-save in `.vscode/settings.json`).

## Architecture

**Data flow.** Server pages (`app/(main)/**/page.tsx`) load data from `db/queries/*` (often in `Promise.all`) and pass it to client interaction components. Mutations go through server actions in `app/actions/*` (`"use server"`, take `FormData`, validate, write via Drizzle, then `revalidatePath()` the affected routes). Database access never happens in client components.

**Route groups.**
- `app/(main)` — the card app with `Sidebar` + `Header`. `/` is the **Investments** page (there is no `/investment` route despite older docs/revalidate calls); also `/collection`, `/dashboard`, `/psa-submissions`, `/psa-submissions/[submissionNumber]`, `/packages`, `/psa-gem-rate`. Nav items are defined in `SIDEBAR_NAVIGATION` in `constants.ts`.
- `app/(tools)` — a separate search-URL builder tool (`/search`, `/search/admin`) with its own `SearchSidebar`/`SearchContext`, backed by `search_sections` / `search_categories` / `search_terms` tables and `lib/searchUrls.ts`.

**Card read model (`db/queries/cards.ts`, `getCardsByPortfolio`).** Investment and Collection are the same `cards` table filtered by `portfolio`. The query joins PSA history and purchase-package data and derives values that are *not stored*: `effectiveStatus`, `psaSubmissionNumbers`, `gradingCost`, `price`, `totalCost`, `profit`, `roi` (types in `types/types.ts`). Key rules:
- A card in an active PSA submission (`completed_date IS NULL`) displays `PSA Grading - {stage}` as its status without overwriting its stored status. Only one active submission per card (enforced in app code, not DB).
- `gradingCost` counts **finished** submissions only. Per-card cost = base fee + adjustment + equal share of the submission's outbound + insured return shipping.
- `price`: package cards = `hammerPrice + hammerPrice × taxesTotal / itemsSubtotal + shippingTotal / packageCardCount`; standalone purchased = `purchasePrice`; pulled = null. Package price is never written back to `cards.purchase_price`; package item count is never stored.
- `totalCost = price + gradingCost`; profit/ROI are null when cost is unknown.

**Workflow-controlled state.**
- `updateCard()` owns ordinary metadata; `sellCard()` owns sale fields. Entering a sale sets status to `Pending Payment` (`is_paid=false`) or `Sold` (`is_paid=true`) — these statuses aren't manually selectable. Collection cards must move to Investment before being sold.
- Statuses are rows in `card_statuses`, not a PG enum, so they can change without migrations.
- Moving portfolios is a separate explicit action that preserves all history.

**Client components.** `CardPortfolio` is the interaction boundary for a portfolio view (selection, selection mode `submission` vs `purchase-package`, drawers/modals); `CardTable` handles TanStack rendering, sorting, and row actions. `CardForm` in a `Drawer` handles both add and edit; `Modal` renders via portal for confirmations. UI preferences (theme, sidebar, table sorting/font size) persist via `lib/storage.ts` (localStorage).

Path alias `@/*` maps to the repo root.

## Styling conventions

Match the existing style closely when writing or editing SCSS.

**Files.** Every component is `components/<Name>/<Name>.tsx` + a sibling `<Name>.module.scss` (create it even if empty). Each module starts with `@use "@/styles/utilities/all" as *;`. Shared, non-component modules live in `styles/`: `styles/page/Page.module.scss` (page layout: `Page__header`, `Page__heading`, `Page__section`…), and `styles/components/*` for content reused across components (e.g. `DrawerContent.module.scss`, `ModalContent.module.scss`, imported as `styles` / `modalStyles`). Global element styles are in `styles/base/`.

**Class naming — BEM with PascalCase block, all nested via `&`:**
```scss
.Sidebar {
	@include font-weight(regular);   // mixins first
	display: flex;                    // then properties
	&--closed { … }                   // modifier
	&__link {                         // element
		&:hover { … }
		&--active { … }               // element modifier
	}
	&__icon {
		&__wrapper { … }              // chained elements are fine: .Sidebar__icon__wrapper
	}
	&--closed {
		.Sidebar {                    // parent modifier restyles children by re-nesting the block
			&__label { opacity: 0; }
		}
	}
}
```
Numbers/money get a `__number` (or `__value`) element styled with `@include font-family(mono)`. Avoid bare element selectors except for things inside a component (`input`, `p`, `svg`, `dd/dt`, `th/td`). Use `:global(...)` only to reach third-party markup (e.g. `.recharts-*`).

**Values come from CSS custom properties, not literals.** Sizes, spacing, colors, borders, and radii are `var(--…)`. New component values get a component-prefixed variable (`--tabs-gap`, `--modal-padding`) added to `styles/utilities/_variables.scss` under a `// ------- ComponentName -------` header, in rem/em with a `// 16px`-style comment. Reuse the generic tokens where they fit: `--font-size-12/14/18/20/26`, `--spacing-*`, `--padding-md/sm`, `--border-radius`, `--icon-size(-sm)`, `--border-line-main`, `--input-border-line`, `--button-border-line`. Calculations are done with `calc()` on variables (`calc(var(--drawer-form-space) * 2)`).

**Color and theming.** Only use theme-aware variables for colors: `--bg-color`, `--bg-color-02/03`, `--bg-color-inverted`, `--text-color`, `--header-color`, `--border-color(-main)`, plus accents `--main` / `--color-main`, `--red`, `--green`, `--color-yellow`, `--color-blue`. Light/dark values are set in `.theme--light` / `.theme--dark` at the bottom of `_variables.scss`; a new themed color needs an entry in both. Tints, hovers and borders are derived with `color-mix(in srgb, <color> X%, var(--bg-color-inverted|--bg-color|transparent))`, often using `var(--color-mix-percentage)`.

**Use the shared mixins** (`styles/utilities/_helpers.scss`, `_mixin-fonts.scss`, `_mixin-media-queries.scss`) rather than re-writing their CSS:
- Typography: `font-weight(light|regular|medium|semibold|bold)` (never raw `font-weight` numbers), `font-family(sans|mono)`, `heading(h1|h2|h3|h4)`, `label-styles` / `label-styles("small")` for uppercase labels, `text-box` for cap-height trimming on labels/values.
- Motion: `transition(color, background-color, border-color)` / `transition-expressive(...)` — not hand-written `transition` values.
- Patterns: `panel`, `input-styles`, `status-color($color)`, `table-tag`, `button-hover($color)`, `description-list($n)`, `table-small`, `external-link`, `trigger-styles($block)`, `panel-header(-sm)`, `panel-sub-header`.
- Breakpoints: `@include media-query(small-only|medium-up|large-up|…)`. The app is desktop-first; media queries are rare.

**Layout** is flex and grid (`display: grid` with `grid-template-areas`, `repeat(auto-fit, minmax(var(--…-min-width), 1fr))`, `gap`); `width: fit-content` / `min-width: 0` are common.

**In TSX**, apply module classes with `classnames` imported as `cn`:
```tsx
className={cn(styles.Tabs__label, { [styles["Tabs__label--active"]]: isActive })}
```
Dynamic values are passed as inline custom properties and consumed in the module, rather than inline styling individual properties. Type them with an extended `CSSProperties` (see `HighlightCardMultiple`, `CostHistoryChart`):
```tsx
type HighlightCardMultipleCSSProperties = CSSProperties & { "--highlight-children-count": number };
const cssVariables: HighlightCardMultipleCSSProperties = { "--highlight-children-count": items.length };
```

Formatting follows Prettier: tabs, double quotes in SCSS, no blank lines required between nested rules.

## Docs

`docs/` holds the project's living documentation — `REQUIREMENTS.md` (business rules), `ARCHITECTURE.md`, `DATABASE.md` (keep in sync with `db/schema.ts`), `PROGRESS.md` (current status/next steps), `BACKLOG.md`. Check them for business rules before changing workflows, and update them when those rules or the schema change. Some details in them are stale (e.g. `/investment` route, `styles/temporary.scss`); trust the code.
