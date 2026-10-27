"use client";

import { ReactNode, useEffect, useId, useRef, useState } from "react";
import cn from "classnames";

import { Icon } from "@/components/Icons/Icons";

import styles from "./Filter.module.scss";

interface FilterProps {
	label: string;
	// Highlights the button while this filter is narrowing the results.
	isActive?: boolean;
	// When given, the dropdown shows a Clear button.
	onClear?: () => void;
	children: ReactNode;
	className?: string;
}

export function Filter({
	label,
	isActive = false,
	onClear,
	children,
	className,
}: FilterProps) {
	const [isOpen, setIsOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const panelId = useId();

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
			<button
				type='button'
				className={styles.Filter__trigger}
				aria-expanded={isOpen}
				aria-controls={panelId}
				onClick={() => setIsOpen((current) => !current)}
			>
				<span className={styles.Filter__label}>{label}</span>
				<Icon icon='arrow-down' className={styles.Filter__icon} />
			</button>

			{isOpen && (
				<div id={panelId} className={styles.Filter__panel}>
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
