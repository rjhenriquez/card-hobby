"use client";

import { ReactNode } from "react";
import styles from "./Toggle.module.scss";

interface ToggleOption {
	label: string;
	value: string;
	children?: ReactNode;
}

interface ToggleProps {
	options: readonly ToggleOption[];
	value: string;
	onChange: (value: string) => void;
}

export function Toggle({ options, value, onChange }: ToggleProps) {
	return (
		<div className={styles.Toggle} role='radiogroup'>
			{options.map((option) => (
				<button
					key={option.value}
					type='button'
					className={`${styles.Toggle__button} ${
						value === option.value ? styles["Toggle__button--active"] : ""
					}`}
					onClick={() => onChange(option.value)}
					aria-pressed={value === option.value}
					aria-label={option.label}
				>
					{option.children ?? option.label}
				</button>
			))}
		</div>
	);
}
