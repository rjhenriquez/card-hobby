---
name: new-component
description: Scaffold a new React component in components/ with its SCSS module and CSS variables, following this project's conventions. Use when the user asks to create, add, or build a new component.
---

# New component

Create a component named from `$ARGUMENTS` (or ask for a name if none was given). Names are PascalCase (`PriceBadge`, `ShipmentTimeline`). Read the "Styling conventions" section of CLAUDE.md before writing styles. It's the source of truth for SCSS rules.

## 1. Check first

- Confirm `components/<Name>/` doesn't already exist, and look for an existing component that already does the job or could take a new `type`/variant prop instead. If one fits, suggest that before creating a new component.
- Open one or two similar components to mirror their structure (e.g. `Toggle`, `TableInfo`, `HighlightCard`, `Tabs`).

## 2. Create `components/<Name>/<Name>.tsx`

```tsx
"use client"; // ONLY if it uses state, effects, event handlers, or next/navigation hooks

import { ReactNode } from "react";
import cn from "classnames";

import styles from "./<Name>.module.scss";

interface <Name>Props {
	children?: ReactNode;
	className?: string;
}

export function <Name>({ children, className }: <Name>Props) {
	return (
		<div className={cn(styles.<Name>, className)}>
			{children}
		</div>
	);
}
```

Rules:
- Named `export function` (no default export). Props interface named `<Name>Props`, not exported unless another file needs it.
- Imports order: React/Next, third-party (`classnames` as `cn`), `@/components/...`, `@/lib`/`@/types`/`@/constants`, then a blank line and the styles import last.
- Modifier classes: `cn(styles.<Name>__x, { [styles["<Name>__x--active"]]: isActive })`.
- Union-string props for variants (`type?: "main" | "icon"`), with defaults in the destructuring.
- Values that change at runtime go in as typed CSS custom properties (`type <Name>CSSProperties = CSSProperties & { "--<name>-foo": number }`), not inline property styles.
- JSX attributes use single quotes (`role='tab'`); Prettier handles the rest.
- No data fetching. Data comes in through props from a server page; mutations call server actions from `app/actions/`.

## 3. Create `components/<Name>/<Name>.module.scss`

```scss
@use "@/styles/utilities/all" as *;

.<Name> {
	display: flex;
	gap: var(--<name>-gap);
	&__element {
	}
	&--modifier {
	}
}
```

- Always create this file, even if it's nearly empty.
- BEM with the PascalCase block, everything nested with `&`. Mixins (`@include font-weight(...)`, `label-styles`, `text-box`, `transition(...)`, `panel`, …) come before plain properties.
- No raw colors, px sizes, or font-weight numbers. Use variables and mixins.

## 4. Add variables to `styles/utilities/_variables.scss`

Add a block inside the second `:root` ("FIXED VARIABLES"), before the closing `}` and after the last component group:

```scss
	// ------- <Name> -------
	--<name>-gap: 0.75rem; // 12px
	--<name>-padding: var(--padding-md);
```

- Kebab-case prefix matching the component (`PriceBadge` → `--price-badge-*`).
- rem/em values with a px comment; reference existing tokens (`--padding-md`, `--border-radius`, `--font-size-14`, `--icon-size`, …) where they fit instead of new numbers.
- Only add variables the module actually uses.
- A new themed color needs entries in both `.theme--light` and `.theme--dark` at the bottom of the file.

## 5. Wire it up and verify

- If the user said where it goes, import and render it there.
- Run `npx tsc --noEmit` and `npx eslint components/<Name>` and fix anything they report.
- Report the files created and the variables added, briefly.
