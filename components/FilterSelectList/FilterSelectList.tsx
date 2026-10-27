"use client";

import { Icon } from "@/components/Icons/Icons";
import { InputSelect } from "@/components/InputSelect/InputSelect";

import styles from "./FilterSelectList.module.scss";

interface FilterSelectListProps {
	name: string;
	label: string;
	// Lowercase noun for the placeholder, e.g. "seller" → "Add seller...".
	itemLabel: string;
	// Every value that can be picked.
	options: string[];
	// Picked values. A row matches if it has any of them.
	values: string[];
	onChange: (values: string[]) => void;
}

/**
 * A dropdown for filtering by several fixed options at once. Each pick is
 * listed underneath with a remove button and dropped from the dropdown.
 * Lives inside a <Filter> panel.
 */
export function FilterSelectList({
	name,
	label,
	itemLabel,
	options,
	values,
	onChange,
}: FilterSelectListProps) {
	const remainingOptions = options.filter((option) => !values.includes(option));

	const selectOptions = [
		{
			label: remainingOptions.length
				? `Add ${itemLabel}...`
				: `All ${itemLabel}s selected`,
			value: "",
		},
		...remainingOptions.map((option) => ({ label: option, value: option })),
	];

	return (
		<div className={styles.FilterSelectList}>
			<InputSelect
				name={name}
				label={label}
				value=''
				options={selectOptions}
				onChange={(event) => {
					if (event.target.value) {
						onChange([...values, event.target.value]);
					}
				}}
			/>

			{values.length > 0 && (
				<ul className={styles.FilterSelectList__values}>
					{values.map((value) => (
						<li key={value} className={styles.FilterSelectList__value}>
							<span className={styles.FilterSelectList__value__label}>
								{value}
							</span>
							<button
								type='button'
								className={styles.FilterSelectList__remove}
								aria-label={`Remove ${value}`}
								onClick={() =>
									onChange(values.filter((current) => current !== value))
								}
							>
								<Icon icon='close' className={styles.FilterSelectList__icon} />
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
