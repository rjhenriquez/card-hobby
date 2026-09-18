import { Accordion } from "@/components/Accordion/Accordion";
import cn from "classnames";
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
				<td className={styles.HighlightCardTable__value}>{row.count}</td>
				<td className={styles.HighlightCardTable__value}>
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

			<table
				className={cn(styles.HighlightCardTable__table, {
					[styles["HighlightCardTable__table--no-accordion"]]: !hasMoreRows,
				})}
			>
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
				<Accordion
					className={styles.HighlightCardTable__accordion}
					icon='arrow-down'
					triggerLocation='below'
					label={`Show ${hiddenRows.length} more`}
				>
					<table className={styles.HighlightCardTable__table}>
						<tbody>{renderRows(hiddenRows)}</tbody>
					</table>
				</Accordion>
			)}
		</div>
	);
}
