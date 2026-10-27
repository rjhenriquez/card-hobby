"use client";

import { ReactNode, useEffect, useId, useRef, useState } from "react";
import cn from "classnames";

import { Button } from "@/components/Button/Button";
import { BROWSER_WIDTH_RANGES } from "@/constants";
import { useDimensions } from "@/hooks/useDimensions";

import styles from "./Filter.module.scss";

interface FilterProps {
	// Names the filter; used for the default tooltip, and shown on the button if there's no icon.
	label: string;
	// Icon name for the button (see ICONS in components/Icons).
	icon?: string;
	// Hover text for the button. Defaults to "Filter <label>".
	tooltip?: string;
	// Highlights the button while this filter is narrowing the results.
	isActive?: boolean;
	// When given, the dropdown shows a Clear button.
	onClear?: () => void;
	children: ReactNode;
	className?: string;
}

export function Filter({
	label,
	icon,
	tooltip = `Filter ${label}`,
	isActive = false,
	onClear,
	children,
	className,
}: FilterProps) {
	const [isOpen, setIsOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const panelId = useId();
	// Tooltips are only needed on smaller screens.
	const showTooltip = useDimensions() <= BROWSER_WIDTH_RANGES.medium.max;

	// Close on outside click or Escape.
	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function handlePointerDown(event: PointerEvent) {
			if (
				rootRef.current &&
				event.target instanceof Node &&
				!rootRef.current.contains(event.target)
			) {
				setIsOpen(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen]);

	return (
		<div
			ref={rootRef}
			className={cn(
				styles.Filter,
				{
					[styles["Filter--open"]]: isOpen,
					[styles["Filter--active"]]: isActive,
				},
				className,
			)}
		>
			<Button
				ref={triggerRef}
				type='main-sm'
				className={styles.Filter__trigger}
				leadingIcon={icon}
				label={label}
				tooltip={showTooltip ? tooltip : undefined}
				ariaExpanded={isOpen}
				ariaControls={panelId}
				onClick={() => setIsOpen((current) => !current)}
			/>

			{isOpen && (
				<div
					id={panelId}
					className={styles.Filter__panel}
					// Filters apply as you type, so Enter in any input just closes the panel.
					onKeyDown={(event) => {
						if (
							event.key === "Enter" &&
							event.target instanceof HTMLInputElement
						) {
							event.preventDefault();
							setIsOpen(false);
							triggerRef.current?.focus();
						}
					}}
				>
					{children}

					{onClear && (
						<button
							type='button'
							className={styles.Filter__clear}
							disabled={!isActive}
							onClick={onClear}
						>
							Clear
						</button>
					)}
				</div>
			)}
		</div>
	);
}
