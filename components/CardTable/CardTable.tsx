"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
	ColumnDef,
	RowSelectionState,
	SortingState,
	createSortedRowModel,
	rowSelectionFeature,
	rowSortingFeature,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import {
	CARD_TABLE_COLUMN_WIDTHS,
	CARD_TABLE_HIDDEN_COLUMNS,
} from "@/constants";
import {
	getStoredCardTableExpanded,
	setStoredCardTableExpanded,
} from "@/lib/storage";
import { formatShortDate } from "@/lib/date";
import type { Card } from "@/types/types";
import { Button } from "@/components/Button/Button";
import { InputCheckbox } from "@/components/InputCheckbox/InputCheckbox";
import { Icon } from "@/components/Icons/Icons";
import cn from "classnames";

import styles from "./CardTable.module.scss";

interface CardTableProps {
	cards: Card[];
	portfolio: "investment" | "collection";
	rowSelection: RowSelectionState;
	onRowSelectionChange: (rowSelection: RowSelectionState) => void;
	onCreateSubmission: () => void;
	onCreatePurchasePackage: () => void;
	onMoveCard: (card: Card) => void;
	onEditCard: (card: Card) => void;
	onCopyCard: (card: Card) => void;
}
const features = tableFeatures({
	rowSelectionFeature,
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
});

function formatCurrency(value: number, showSign = true) {
	return `${showSign ? "$" : ""}${value.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}
function getColumnId(
	column: ColumnDef<typeof features, Card>,
): string | undefined {
	if ("id" in column && column.id) {
		return column.id;
	}
	if ("accessorKey" in column && typeof column.accessorKey === "string") {
		return column.accessorKey;
	}
	return undefined;
}

export function CardTable({
	cards,
	portfolio,
	rowSelection,
	onRowSelectionChange,
	onCreateSubmission,
	onCreatePurchasePackage,
	onMoveCard,
	onEditCard,
	onCopyCard,
}: CardTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [isExpanded, setIsExpanded] = useState(false);

	const headerTableRef = useRef<HTMLTableElement>(null);
	const bodyTableRef = useRef<HTMLTableElement>(null);
	const tableScrollRef = useRef<HTMLDivElement>(null);
	const headerScrollRef = useRef<HTMLDivElement>(null);

	const selectedCardCount = Object.values(rowSelection).filter(Boolean).length;
	const selectedCards = cards.filter((card) => rowSelection[String(card.id)]);
	const selectedCard = selectedCards.length === 1 ? selectedCards[0] : null;

	useEffect(() => {
		setIsExpanded(getStoredCardTableExpanded());
	}, []);

	const selectionColumn: ColumnDef<typeof features, Card> = {
		id: "select",
		enableSorting: false,

		header: ({ table }) => (
			<InputCheckbox
				checked={table.getIsAllRowsSelected()}
				onChange={table.getToggleAllRowsSelectedHandler()}
				ariaLabel='Select all cards'
				isHeader
				ref={(input) => {
					if (input) {
						input.indeterminate =
							table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
					}
				}}
			/>
		),

		cell: ({ row }) => (
			<InputCheckbox
				checked={row.getIsSelected()}
				onChange={row.getToggleSelectedHandler()}
				ariaLabel={`Select ${row.original.player}`}
			/>
		),
	};

	const allColumns: ColumnDef<typeof features, Card>[] = [
		selectionColumn,

		{
			accessorKey: "player",
			header: "Player",
		},

		{
			accessorKey: "category",
			header: "Category",
		},

		{
			accessorKey: "year",
			header: "Year",
		},

		{
			accessorKey: "setName",
			header: "Set",
		},

		{
			accessorKey: "info",
			header: "Info",
		},
		{
			accessorKey: "notes",
			header: "Notes",
		},
		{
			accessorKey: "purchaseDate",
			header: "Date",
			cell: ({ getValue }) => {
				const value = getValue() as string | null;
				return formatShortDate(value);
			},
		},

		{
			accessorKey: "effectiveStatus",
			header: "Status",
		},

		{
			accessorKey: "purchasedFrom",
			header: "Seller",
		},

		{
			accessorKey: "ebaySeller",
			header: "eBay Seller",

			cell: ({ row }) => {
				const card = row.original;

				if (card.purchasedFrom?.trim().toLowerCase() !== "ebay") {
					return "N/A";
				}

				return card.ebaySeller || "—";
			},
		},

		{
			accessorKey: "psaSubmissionNumbers",
			header: "PSA Sub",

			cell: ({ getValue }) => {
				const submissionNumbers = getValue() as string[];

				if (submissionNumbers.length === 0) {
					return "—";
				}

				return (
					<>
						{submissionNumbers.map((submissionNumber, index) => (
							<span key={submissionNumber}>
								{index > 0 && ", "}

								<Link href={`/psa-submissions/${submissionNumber}`}>
									{submissionNumber}
								</Link>
							</span>
						))}
					</>
				);
			},
		},

		{
			accessorKey: "price",
			header: "Cost ",

			cell: ({ getValue }) => {
				const value = getValue() as number | null;

				return value !== null ? formatCurrency(value) : "—";
			},
		},

		{
			accessorKey: "gradingCost",
			header: "Grading",

			cell: ({ getValue }) => {
				const value = getValue() as number;

				return value > 0 ? formatCurrency(value) : "—";
			},
		},

		{
			accessorKey: "totalCost",
			header: "Total Cost",

			cell: ({ getValue }) => {
				const value = getValue() as number | null;

				return value !== null ? formatCurrency(value) : "Unknown";
			},
		},

		{
			accessorKey: "soldPrice",
			header: "Sold Price",

			cell: ({ getValue }) => {
				const value = getValue() as string | null;

				return value !== null ? formatCurrency(Number(value)) : "—";
			},
		},
		{
			accessorKey: "soldDate",
			header: "Sold Date",
			cell: ({ getValue }) => {
				const value = getValue() as string | null;
				return formatShortDate(value);
			},
		},
		{
			accessorKey: "profit",
			header: "Profit",

			cell: ({ getValue }) => {
				const value = getValue() as number | null;

				if (value === null) {
					return "";
				}

				return (
					<span
						className={cn(styles.CardTable__value, {
							[styles["CardTable__value--positive"]]: value > 0,
							[styles["CardTable__value--negative"]]: value < 0,
						})}
					>
						<span>$</span>
						<span>{formatCurrency(value, false)}</span>
					</span>
				);
			},
		},
		{
			accessorKey: "roi",
			header: "ROI",

			cell: ({ getValue }) => {
				const value = getValue() as number | null;

				if (value === null) {
					return "";
				}

				return (
					<span
						className={cn(styles.CardTable__value, {
							[styles["CardTable__value--positive"]]: value > 0,
							[styles["CardTable__value--negative"]]: value < 0,
						})}
					>
						<span>%</span>
						<span>{value.toFixed(2)}</span>
					</span>
				);
			},
		},
		{
			accessorKey: "isShared",
			header: "Shared",

			cell: ({ getValue }) => {
				const value = getValue() as boolean;

				return value ? "Yes" : "No";
			},
		},
	];
	const hiddenColumns = new Set(CARD_TABLE_HIDDEN_COLUMNS[portfolio]);

	const columns = allColumns.filter((column) => {
		const columnId = getColumnId(column);
		return !columnId || !hiddenColumns.has(columnId);
	});
	const table = useTable({
		data: cards,
		columns,
		features,

		state: {
			rowSelection,
			sorting,
		},

		onSortingChange: (updater) => {
			const nextSorting =
				typeof updater === "function" ? updater(sorting) : updater;

			setSorting(nextSorting);
		},

		onRowSelectionChange: (updater) => {
			const nextSelection =
				typeof updater === "function" ? updater(rowSelection) : updater;

			onRowSelectionChange(nextSelection);
		},

		getRowId: (row) => String(row.id),
	});

	useEffect(() => {
		const headerTable = headerTableRef.current;
		const bodyTable = bodyTableRef.current;

		if (!headerTable || !bodyTable) {
			return;
		}

		const currentHeaderTable = headerTable;
		const currentBodyTable = bodyTable;

		function syncColumnWidths() {
			const bodyCells = currentBodyTable.querySelectorAll(
				"tbody tr:first-child td",
			);
			const headerCells = currentHeaderTable.querySelectorAll("thead th");

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
				headerCell.style.maxWidth = `${width}px`;
			});

			currentHeaderTable.style.width = `${currentBodyTable.getBoundingClientRect().width}px`;
		}

		syncColumnWidths();

		const resizeObserver = new ResizeObserver(syncColumnWidths);

		resizeObserver.observe(currentBodyTable);

		return () => {
			resizeObserver.disconnect();
		};
	}, [cards, isExpanded]);

	function getColumnProps(columnId: string) {
		if (isExpanded) {
			return {};
		}

		const width = CARD_TABLE_COLUMN_WIDTHS[columnId];

		if (!width) {
			return {};
		}

		return {
			className: styles["CardTable__column--capped"],
			style: {
				"--column-width": width,
			} as CSSProperties,
		};
	}

	function handleTableScroll() {
		const tableScroll = tableScrollRef.current;
		const headerScroll = headerScrollRef.current;

		if (!tableScroll || !headerScroll) return;

		headerScroll.scrollLeft = tableScroll.scrollLeft;
	}

	return (
		<div className={styles.CardTable}>
			<div className={styles.CardTable__top}>
				<div className={styles.CardTable__actions}>
					<div className={styles.CardTable__actions__group}>
						<Button
							type='icon'
							htmlType='button'
							leadingIcon='edit'
							tooltip='Edit Card'
							disabled={selectedCard === null}
							onClick={() => {
								if (!selectedCard) return;

								onEditCard(selectedCard);
							}}
						/>
						<Button
							type='icon'
							htmlType='button'
							leadingIcon='copy'
							tooltip='Copy Card'
							disabled={selectedCard === null}
							onClick={() => {
								if (!selectedCard) return;
								onCopyCard(selectedCard);
							}}
						/>
						<span className={styles.CardTable__actions__separator} />

						<Button
							type='icon'
							htmlType='button'
							leadingIcon='add-sub'
							tooltip='Add to sub'
							disabled={selectedCardCount === 0}
							onClick={onCreateSubmission}
						/>

						<Button
							type='icon'
							htmlType='button'
							leadingIcon='package'
							tooltip='Add to package'
							disabled={selectedCardCount === 0}
							onClick={onCreatePurchasePackage}
						/>
						<span className={styles.CardTable__actions__separator} />
						<Button
							type='icon'
							htmlType='button'
							leadingIcon={portfolio === "investment" ? "move-down" : "move-up"}
							tooltip={
								portfolio === "investment"
									? "Move to Collection"
									: "Move to Investment"
							}
							disabled={selectedCard === null}
							onClick={() => {
								if (!selectedCard) return;

								onMoveCard(selectedCard);
							}}
						/>
					</div>
					<div className={styles.CardTable__actions__group}>
						<Button
							type='icon'
							htmlType='button'
							leadingIcon={isExpanded ? "compress" : "expand"}
							tooltip={isExpanded ? "Compress columns" : "Expand columns"}
							onClick={() => {
								setIsExpanded((current) => {
									const next = !current;

									setStoredCardTableExpanded(next);

									return next;
								});
							}}
						/>
						<Button
							type='icon'
							htmlType='button'
							leadingIcon='font-size'
							tooltip='font Size'
							disabled={selectedCard === null}
							onClick={() => {
								if (!selectedCard) return;

								// Copy functionality to come
							}}
						/>
					</div>
				</div>
			</div>

			<div ref={headerScrollRef} className={styles.CardTable__header}>
				<table ref={headerTableRef}>
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th key={header.id} {...getColumnProps(header.column.id)}>
										{header.isPlaceholder ? null : header.column.id ===
										  "select" ? (
											<table.FlexRender header={header} />
										) : header.column.getCanSort() ? (
											<button
												type='button'
												onClick={header.column.getToggleSortingHandler()}
												aria-label={`Sort by ${header.column.id}`}
												className={styles["CardTable__header-btn"]}
											>
												<table.FlexRender header={header} />

												<Icon
													className={cn(styles["CardTable__header-icon"], {
														[styles["CardTable__header-icon--all"]]:
															header.column.getIsSorted() !== "asc" &&
															header.column.getIsSorted() !== "desc",
													})}
													icon={
														header.column.getIsSorted() === "asc"
															? "arrow-up"
															: header.column.getIsSorted() === "desc"
																? "arrow-down"
																: "arrow-up-down"
													}
												/>
											</button>
										) : (
											<table.FlexRender header={header} />
										)}
									</th>
								))}
							</tr>
						))}
					</thead>
				</table>
			</div>

			<div
				ref={tableScrollRef}
				className={styles.CardTable__table}
				onScroll={handleTableScroll}
			>
				<table ref={bodyTableRef}>
					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr key={row.id} data-selected={row.getIsSelected()}>
								{row.getAllCells().map((cell) => {
									const isSelectCell = cell.column.id === "select";
									const isPlayerCell = cell.column.id === "player";
									const columnProps = getColumnProps(cell.column.id);

									return (
										<td
											key={cell.id}
											{...columnProps}
											className={cn(
												columnProps.className,
												(isSelectCell || isPlayerCell) &&
													styles["CardTable__cell--selectable"],
											)}
											onClick={
												isSelectCell || isPlayerCell
													? (event) => {
															if (
																isSelectCell &&
																event.target instanceof HTMLElement &&
																event.target.closest("label")
															) {
																return;
															}

															row.toggleSelected();
														}
													: undefined
											}
										>
											<table.FlexRender cell={cell} />
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
