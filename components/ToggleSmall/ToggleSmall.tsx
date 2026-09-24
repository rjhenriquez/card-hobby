"use client";

import { ReactNode } from "react";
import styles from "./ToggleSmall.module.scss";

interface ToggleSmallProps {
	id: string;
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	children?: ReactNode;
}

export function ToggleSmall({
	id,
	label,
	checked,
	onChange,
	children,
}: ToggleSmallProps) {
	return (
		<div className={styles.ToggleSmall}>
			<input
				id={id}
				type='checkbox'
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
			/>

			<label htmlFor={id}>
				<span>{children ?? label}</span>
			</label>
		</div>
	);
}
