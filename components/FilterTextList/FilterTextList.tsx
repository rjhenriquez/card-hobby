"use client";

import { useState } from "react";

import { Icon } from "@/components/Icons/Icons";
import { Button } from "@/components/Button/Button";
import { InputAutocomplete } from "@/components/InputAutocomplete/InputAutocomplete";

import styles from "./FilterTextList.module.scss";

interface FilterTextListProps {
	name: string;
	// Label for the first field; extra fields are labelled "Or".
	label: string;
	// Lowercase noun for the add button, e.g. "player" → "Add player".
	itemLabel: string;
	// Autocomplete suggestions.
	options?: string[];
	// Applied (non-blank) values. A row matches if it contains any of them.
	values: string[];
	onChange: (values: string[]) => void;
}

function isSameList(a: string[], b: string[]) {
	return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * A stack of autocomplete fields for filtering one text column by several
 * values at once. Lives inside a <Filter> panel.
 */
export function FilterTextList({
	name,
	label,
	itemLabel,
	options = [],
	values,
	onChange,
}: FilterTextListProps) {
	// Rows include blanks the user just added, which aren't applied yet.
	const [rows, setRows] = useState<string[]>(values.length ? values : [""]);
	const [focusIndex, setFocusIndex] = useState<number | null>(null);

	const appliedRows = rows.filter((row) => row.trim());

	// The values changed from outside (tag removed, Clear all): start over from them.
	if (!isSameList(appliedRows, values)) {
		setRows(values.length ? values : [""]);
	}

	function updateRows(nextRows: string[]) {
		setRows(nextRows);
		onChange(nextRows.filter((row) => row.trim()));
	}

	const canAdd = rows.every((row) => row.trim());

	return (
		<div className={styles.FilterTextList}>
			{rows.map((row, index) => (
				<div key={index} className={styles.FilterTextList__row}>
					<InputAutocomplete
						name={`${name}-${index}`}
						label={index === 0 ? label : "Or"}
						placeholder='Start typing...'
						options={options}
						value={row}
						autoFocus={index === focusIndex}
						onChange={(value) =>
							updateRows(
								rows.map((current, i) => (i === index ? value : current)),
							)
						}
					/>

					{rows.length > 1 && (
						// <button
						// 	type='button'
						// 	className={styles.FilterTextList__remove}
						// 	aria-label={`Remove ${row || itemLabel}`}
						// 	onClick={() => {
						// 		setFocusIndex(null);
						// 		updateRows(rows.filter((_, i) => i !== index));
						// 	}}
						// >
						// 	<Icon icon='close' className={styles.FilterTextList__icon} />
						// </button>

						<Button
							aria-label={`Remove ${row || itemLabel}`}
							type='icon'
							leadingIcon='close'
							htmlType='button'
							tooltip={`Remove ${row || itemLabel}`}
							onClick={() => {
								setFocusIndex(null);
								updateRows(rows.filter((_, i) => i !== index));
							}}
						/>
					)}
				</div>
			))}
			<button
				type='button'
				className={styles.FilterTextList__add}
				disabled={!canAdd}
				onClick={() => {
					setFocusIndex(rows.length);
					setRows([...rows, ""]);
				}}
			>
				<Icon icon='plus-sign' className={styles.FilterTextList__icon} />
				<span className={styles.FilterTextList__add__label}>
					Add {itemLabel}
				</span>
			</button>
		</div>
	);
}
