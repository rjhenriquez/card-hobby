"use client";

import { CSSProperties, ReactNode, useState } from "react";
import { Icon } from "@/components/Icons/Icons";
import cn from "classnames";

import styles from "./Accordion.module.scss";

interface AccordionProps {
	icon: string;
	label: string;
	labelSize: "regular" | "large";
	children: ReactNode;
	defaultOpen?: boolean;
	labelJustify?: "flex-start" | "flex-end" | "space-between";
	className?: string;
}

export function Accordion({
	icon,
	label,
	labelSize,
	children,
	defaultOpen = false,
	labelJustify = "space-between",
	className,
}: AccordionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	const cssVariables = {
		"--accordion-label-justify": labelJustify,
	} as CSSProperties;

	return (
		<div
			className={cn(styles.Accordion, className, {
				[styles["Accordion--open"]]: isOpen,
			})}
		>
			<button
				type='button'
				className={cn("Accordion__trigger", styles.Accordion__trigger, {
					[styles["Accordion__trigger--open"]]: isOpen,
					[styles["Accordion__trigger--full"]]:
						labelJustify === "space-between",
					[styles["Accordion__trigger--end"]]: labelJustify === "flex-end",
				})}
				style={cssVariables}
				aria-expanded={isOpen}
				onClick={() => setIsOpen((current) => !current)}
			>
				<span
					className={cn(styles.Accordion__trigger__label, {
						[styles["Accordion__trigger__label--large"]]: labelSize === "large",
					})}
				>
					{label}
				</span>
				<span className={styles.Accordion__trigger__icon}>
					<Icon icon={icon} />
				</span>
			</button>

			<div className={styles.Accordion__content}>
				<div className={styles.Accordion__content__inner}>{children}</div>
			</div>
		</div>
	);
}
