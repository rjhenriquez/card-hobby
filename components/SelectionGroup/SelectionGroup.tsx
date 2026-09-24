"use client";

import { useState } from "react";
import { InputCheckbox } from "@/components/InputCheckbox/InputCheckbox";
import { Icon } from "@/components/Icons/Icons";

import styles from "./SelectionGroup.module.scss";

interface SelectionGroupProps {
	group: string;
	names: string[];
	isSingleSelect: boolean;
	selectedValues: string[];
	onChange: (value: string) => void;
	onChangeAll: (values: string[]) => void;
}

export function SelectionGroup({
	group,
	names,
	isSingleSelect,
	selectedValues,
	onChange,
	onChangeAll,
}: SelectionGroupProps) {
	const [isOpen, setIsOpen] = useState(false);

	const areAllSelected =
		names.length > 0 && names.every((name) => selectedValues.includes(name));

	function handleToggle() {
		setIsOpen((current) => !current);
	}

	function handleSelectAll() {
		onChangeAll(names);
	}

	return (
		<section className={styles.SelectionGroup}>
			<div className={styles.SelectionGroup__header}>
				<button
					className={`${styles.SelectionGroup__button} ${
						isOpen ? styles["SelectionGroup__button--open"] : ""
					}`}
					type='button'
					onClick={handleToggle}
				>
					<Icon icon='add' className={styles.SelectionGroup__button__icon} />

					<span className={styles.SelectionGroup__label}>{group}</span>
				</button>

				<InputCheckbox
					name={`${group}-all`}
					value={`${group}-all`}
					checked={areAllSelected}
					disabled={isSingleSelect}
					onChange={handleSelectAll}
					label='All'
				/>
			</div>

			<div
				className={`${styles.SelectionGroup__options} ${
					isOpen ? styles["SelectionGroup__options--open"] : ""
				}`}
			>
				<div className={styles.SelectionGroup__options__inner}>
					<ul>
						{names.map((name) => (
							<li key={name}>
								<InputCheckbox
									type='sidebar'
									name={isSingleSelect ? "selectedSearch" : name}
									value={name}
									label={name}
									checked={selectedValues.includes(name)}
									onChange={() => onChange(name)}
								/>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}
