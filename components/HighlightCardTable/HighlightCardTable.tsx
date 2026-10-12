"use client";

import { useState } from "react";
import cn from "classnames";
import { Icon } from "@/components/Icons/Icons";

import styles from "./HighlightCardTable.module.scss";

export interface HighlightCardTableRow {
	label: string;
	count: number;
	value: number;
}

interface HighlightCardTableProps {
	title?: string;
	eyebrow?: string;
	rows: HighlightCardTableRow[];
	rowNumber?: number;
	headers?: [string, string, string];
}

export function HighlightCardTable({
	title,
	rows,
	eyebrow,
	rowNumber = 5,
	headers = ["Player", "Cards", "Total Cost"],
}: HighlightCardTableProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const visibleRows = rows.slice(0, rowNumber);
	const hiddenRows = rows.slice(rowNumber);
	const hasMoreRows = hiddenRows.length > 0;

	function renderRows(rowsToRender: HighlightCardTableRow[]) {
		return rowsToRender.map((row) => (
			<tr key={row.label}>
				<td>{row.label}</td>
				<td className={styles.HighlightCardTable__table__number}>
					{row.count}
				</td>
				<td className={styles.HighlightCardTable__table__number}>
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
			<header className={styles.HighlightCardTable__header}>
				{eyebrow && (
					<p className={styles.HighlightCardTable__eyebrow}>{eyebrow}</p>
				)}

				{title && <h3 className={styles.HighlightCardTable__title}>{title}</h3>}

				{hasMoreRows && (
					<button
						className={cn(styles.HighlightCardTable__trigger, {
							[styles["HighlightCardTable__trigger--expanded"]]: isExpanded,
						})}
						onClick={() => setIsExpanded((current) => !current)}
					>
						<span className={styles.HighlightCardTable__trigger__label}>
							{isExpanded ? "Show less" : `Show ${hiddenRows.length} more`}
						</span>
						<span className={styles.HighlightCardTable__trigger__icon}>
							<Icon icon='arrow-left' />
						</span>
					</button>
				)}
			</header>

			<div
				className={cn(styles.HighlightCardTable__body, {
					[styles["HighlightCardTable__body--expanded"]]: isExpanded,
				})}
			>
				<table
					className={cn(styles.HighlightCardTable__table, {
						[styles["HighlightCardTable__table--no-accordion"]]: !hasMoreRows,
					})}
				>
					<thead>
						<tr>
							{headers.map((header) => (
								<th key={header}>{header}</th>
							))}
						</tr>
					</thead>

					<tbody>{renderRows(visibleRows)}</tbody>
				</table>

				{hasMoreRows && (
					<div
						className={cn(styles.HighlightCardTable__expandable, {
							[styles["HighlightCardTable__expandable--expanded"]]: isExpanded,
						})}
					>
						<div className={styles.HighlightCardTable__expandable__inner}>
							<table className={styles.HighlightCardTable__table}>
								<tbody>{renderRows(hiddenRows)}</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
