import { Accordion } from "@/components/Accordion/Accordion";

import styles from "./HighlightCardTable.module.scss";

export interface HighlightCardTableRow {
	label: string;
	count: number;
	value: number;
}

interface HighlightCardTableProps {
	title?: string;
	rows: HighlightCardTableRow[];
	rowNumber?: number;
}

export function HighlightCardTable({
	title,
	rows,
	rowNumber = 5,
}: HighlightCardTableProps) {
	const visibleRows = rows.slice(0, rowNumber);
	const hiddenRows = rows.slice(rowNumber);
	const hasMoreRows = hiddenRows.length > 0;

	function renderRows(rowsToRender: HighlightCardTableRow[]) {
		return rowsToRender.map((row) => (
			<tr key={row.label}>
				<td>{row.label}</td>
				<td>{row.count}</td>
				<td>
					{row.value.toLocaleString("en-US", {
						style: "currency",
						currency: "USD",
					})}
				</td>
			</tr>
		));
	}

	return (
		<div className={styles.HighlightCardTable}>
			{title && <h3 className={styles.HighlightCardTable__title}>{title}</h3>}

			<table className={styles.HighlightCardTable__table}>
				<thead>
					<tr>
						<th>Player</th>
						<th>Cards</th>
						<th>Total Cost</th>
					</tr>
				</thead>

				<tbody>{renderRows(visibleRows)}</tbody>
			</table>

			{hasMoreRows && (
				<Accordion icon='arrow-down' label={`Show ${hiddenRows.length} more`}>
					<table className={styles.HighlightCardTable__table}>
						<tbody>{renderRows(hiddenRows)}</tbody>
					</table>
				</Accordion>
			)}
		</div>
	);
}
