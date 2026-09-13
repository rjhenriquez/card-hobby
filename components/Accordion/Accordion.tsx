"use client";

import { ReactNode, useState } from "react";
import { Icon } from "@/components/Icons/Icons";
import cn from "classnames";

import styles from "./Accordion.module.scss";

interface AccordionProps {
	icon: string;
	label: string;
	children: ReactNode;
	defaultOpen?: boolean;
}

export function Accordion({
	icon,
	label,
	children,
	defaultOpen = false,
}: AccordionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div
			className={cn(Accordion, styles.Accordion, {
				[styles["Accordion--open"]]: isOpen,
			})}
		>
			<button
				type='button'
				className={cn(styles.Accordion__trigger, {
					[styles["Accordion__trigger--open"]]: isOpen,
				})}
				aria-expanded={isOpen}
				onClick={() => setIsOpen((current) => !current)}
			>
				<span className={styles.Accordion__label}>{label}</span>
				<Icon icon={icon} />
			</button>

			<div className={styles.Accordion__content}>
				<div className={styles.Accordion__content__inner}>{children}</div>
			</div>
		</div>
	);
}
