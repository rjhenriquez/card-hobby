"use client";

import {
	CSSProperties,
	HTMLAttributes,
	ReactNode,
	useEffect,
	useRef,
} from "react";
import cn from "classnames";
import { Icon } from "@/components/Icons/Icons";

import styles from "./Table.module.scss";

export type TableSortDirection = "asc" | "desc";

export interface TableColumn<T> {
	id: string;
	label: ReactNode;
	render: (row: T) => ReactNode;
	sortable?: boolean;
	className?: string;
	headerClassName?: string;
	style?: CSSProperties;
}

interface TableProps<T> {
	columns: TableColumn<T>[];
	rows: T[];
	getRowKey: (row: T) => string | number;
	top?: ReactNode;
	footer?: ReactNode;
	sortColumn?: string;
	sortDirection?: TableSortDirection;
	onSort?: (columnId: string) => void;
	className?: string;
	columnClasses?: Record<string, string>;
	getRowProps?: (
		row: T,
	) => HTMLAttributes<HTMLTableRowElement> & Record<`data-${string}`, unknown>;
}

export function Table<T>({
	columns,
	rows,
	getRowProps,
	getRowKey,
	top,
	footer,
	sortColumn,
	sortDirection,
	onSort,
	className,
	columnClasses = {},
}: TableProps<T>) {
	const headerTableRef = useRef<HTMLTableElement>(null);
	const bodyTableRef = useRef<HTMLTableElement>(null);
	const tableScrollRef = useRef<HTMLDivElement>(null);
	const headerScrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function syncColumnWidths() {
			const headerTable = headerTableRef.current;
			const bodyTable = bodyTableRef.current;
			if (!headerTable || !bodyTable) {
				return;
			}
			const bodyCells = bodyTable.querySelectorAll("tbody tr:first-child td");
			const headerCells = headerTable.querySelectorAll("thead th");
			if (bodyCells.length === 0) {
				return;
			}
			bodyCells.forEach((bodyCell, index) => {
				const headerCell = headerCells[index];
				if (!(headerCell instanceof HTMLElement)) {
					return;
				}
				const width = bodyCell.getBoundingClientRect().width;
				headerCell.style.width = `${width}px`;
				headerCell.style.minWidth = `${width}px`;
				headerCell.style.maxWidth = `${width}px`;
			});
			headerTable.style.width = `${bodyTable.getBoundingClientRect().width}px`;
		}
		syncColumnWidths();
		const bodyTable = bodyTableRef.current;
		if (!bodyTable) {
			return;
		}
		const resizeObserver = new ResizeObserver(syncColumnWidths);
		resizeObserver.observe(bodyTable);
		return () => {
			resizeObserver.disconnect();
		};
	}, [columns, rows]);

	function handleTableScroll() {
		const tableScroll = tableScrollRef.current;
		const headerScroll = headerScrollRef.current;

		if (!tableScroll || !headerScroll) {
			return;
		}

		headerScroll.scrollLeft = tableScroll.scrollLeft;
	}
	const cssVariables = {
		...(top ? {} : { "--header-top-position": "0px" }),
	} as CSSProperties;
	return (
		<div className={cn(styles.Table, className)} style={cssVariables}>
			{top && <div className={styles.Table__top}>{top}</div>}

			<div ref={headerScrollRef} className={styles.Table__header}>
				<table ref={headerTableRef}>
					<thead>
						<tr>
							{columns.map((column) => {
								const isSorted = sortColumn === column.id;

								return (
									<th
										key={column.id}
										className={cn(
											columnClasses[column.id],
											column.headerClassName,
										)}
										style={column.style}
									>
										{column.sortable && onSort ? (
											<button
												type='button'
												className={styles["Table__header-btn"]}
												onClick={() => onSort(column.id)}
												aria-label={`Sort by ${column.id}`}
											>
												{column.label}

												<Icon
													className={cn(styles["Table__header-icon"], {
														[styles["Table__header-icon--all"]]: !isSorted,
													})}
													icon={
														isSorted && sortDirection === "asc"
															? "arrow-up"
															: isSorted && sortDirection === "desc"
																? "arrow-down"
																: "arrow-up-down"
													}
												/>
											</button>
										) : (
											column.label
										)}
									</th>
								);
							})}
						</tr>
					</thead>
				</table>
			</div>

			<div
				ref={tableScrollRef}
				className={styles.Table__table}
				onScroll={handleTableScroll}
			>
				<table ref={bodyTableRef}>
					<tbody>
						{rows.map((row) => (
							<tr key={getRowKey(row)} {...getRowProps?.(row)}>
								{columns.map((column) => (
									<td
										key={column.id}
										className={cn(columnClasses[column.id], column.className)}
										style={column.style}
									>
										{column.render(row)}
									</td>
								))}
							</tr>
						))}
					</tbody>
					{footer && <tfoot>{footer}</tfoot>}
				</table>
			</div>
		</div>
	);
}
