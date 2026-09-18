"use client";

import {
	CSSProperties,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import Link from "next/link";
import {
	ColumnDef,
	RowSelectionState,
	SortingState,
	columnFilteringFeature,
	createFilteredRowModel,
	createSortedRowModel,
	filterFn_includesString,
	globalFilteringFeature,
	rowSelectionFeature,
	rowSortingFeature,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import {
	CARD_TABLE_COLUMN_WIDTHS,
	CARD_TABLE_HIDDEN_COLUMNS,
	CARD_TABLE_VALUE_COLUMNS,
} from "@/constants";
import {
	getStoredCardTableExpanded,
	getStoredCardTableFontSize,
	getStoredCardTableSorting,
	setStoredCardTableExpanded,
	setStoredCardTableFontSize,
	setStoredCardTableSorting,
} from "@/lib/storage";
import { formatCurrency } from "@/lib/formatters";
import { formatShortDate } from "@/lib/formatters";
import type { Card } from "@/types/types";
import { Button } from "@/components/Button/Button";
import { ButtonGroup } from "@/components/ButtonGroup/ButtonGroup";
import { InputCheckbox } from "@/components/InputCheckbox/InputCheckbox";
import { InputText } from "@/components/InputText/InputText";
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
	columnFilteringFeature,
	globalFilteringFeature,
	sortedRowModel: createSortedRowModel(),
	filteredRowModel: createFilteredRowModel(),
	filterFns: {
		includesString: filterFn_includesString,
	},
});

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
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [globalFilter, setGlobalFilter] = useState("");
	const [fontSize, setFontSize] = useState(12);
	const [isReady, setIsReady] = useState(false);
	const [isTopSticky, setIsTopSticky] = useState(false);

	const headerTableRef = useRef<HTMLTableElement>(null);
	const bodyTableRef = useRef<HTMLTableElement>(null);
	const tableScrollRef = useRef<HTMLDivElement>(null);
	const headerScrollRef = useRef<HTMLDivElement>(null);
	const topSentinelRef = useRef<HTMLDivElement>(null);

	const selectedCardCount = Object.values(rowSelection).filter(Boolean).length;
	const selectedCards = cards.filter((card) => rowSelection[String(card.id)]);
	const selectedCard = selectedCards.length === 1 ? selectedCards[0] : null;

	useEffect(() => {
		const sentinel = topSentinelRef.current;

		if (!sentinel) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsTopSticky(!entry.isIntersecting);
			},
			{
				threshold: 0,
			},
		);

		observer.observe(sentinel);

		return () => {
			observer.disconnect();
		};
	}, []);

	useLayoutEffect(() => {
		setFontSize(getStoredCardTableFontSize());
		setIsReady(true);
	}, []);

	useEffect(() => {
		setIsExpanded(getStoredCardTableExpanded());
		setSorting(getStoredCardTableSorting(portfolio));
	}, [portfolio]);

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
					return <span className={styles["CardTable__cell--muted"]}>N/A</span>;
				}

				return card.ebaySeller || "—";
			},
		},

		{
			id: "psaSubmissionNumbers",

			accessorFn: (card) => card.psaSubmissionNumbers.join(" "),

			header: "PSA Sub",

			cell: ({ row }) => {
				const submissionNumbers = row.original.psaSubmissionNumbers;

				if (submissionNumbers.length === 0) {
					return "";
				}

				return (
					<>
						{submissionNumbers.map((submissionNumber, index) => (
							<span key={submissionNumber}>
								{index > 0 && ", "}

								<Link
									className={styles.CardTable__link}
									href={`/psa-submissions/${submissionNumber}`}
								>
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
			header: "Cost",

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
			id: "soldPrice",

			accessorFn: (card) =>
				card.soldPrice !== null ? Number(card.soldPrice) : null,

			header: "Sold Price",

			cell: ({ getValue }) => {
				const value = getValue() as number | null;

				return value !== null ? formatCurrency(value) : "—";
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
						className={cn({
							[styles["CardTable__cell--value--positive"]]: value > 0,
							[styles["CardTable__cell--value--negative"]]: value < 0,
						})}
					>
						{formatCurrency(value)}
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
						className={cn({
							[styles["CardTable__cell--value--positive"]]: value > 0,
							[styles["CardTable__cell--value--negative"]]: value < 0,
						})}
					>
						{value < 0 ? "-" : ""}%{Math.abs(value).toFixed(2)}
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
			globalFilter,
		},

		onSortingChange: (updater) => {
			const nextSorting =
				typeof updater === "function" ? updater(sorting) : updater;

			setSorting(nextSorting);
			setStoredCardTableSorting(portfolio, nextSorting);
		},

		onGlobalFilterChange: (updater) => {
			const nextFilter =
				typeof updater === "function" ? updater(globalFilter) : updater;

			setGlobalFilter(nextFilter);
		},

		onRowSelectionChange: (updater) => {
			const nextSelection =
				typeof updater === "function" ? updater(rowSelection) : updater;

			onRowSelectionChange(nextSelection);
		},

		getRowId: (row) => String(row.id),
	});

	const visibleCards = table.getRowModel().rows.map((row) => row.original);

	const tableTotals = visibleCards.reduce(
		(totals, card) => {
			totals.price += card.price ?? 0;
			totals.gradingCost += card.gradingCost ?? 0;
			totals.totalCost += card.totalCost ?? 0;
			totals.soldPrice += Number(card.soldPrice ?? 0);
			totals.profit += card.profit ?? 0;

			return totals;
		},
		{
			price: 0,
			gradingCost: 0,
			totalCost: 0,
			soldPrice: 0,
			profit: 0,
		},
	);

	const totalRoi =
		tableTotals.totalCost > 0
			? (tableTotals.profit / tableTotals.totalCost) * 100
			: 0;

	function getFooterValue(columnId: string) {
		switch (columnId) {
			case "price":
				return formatCurrency(tableTotals.price);

			case "gradingCost":
				return formatCurrency(tableTotals.gradingCost);

			case "totalCost":
				return formatCurrency(tableTotals.totalCost);

			case "soldPrice":
				return formatCurrency(tableTotals.soldPrice);

			case "profit":
				return (
					<span
						className={cn({
							[styles["CardTable__cell--value--positive"]]:
								tableTotals.profit > 0,
							[styles["CardTable__cell--value--negative"]]:
								tableTotals.profit < 0,
						})}
					>
						{formatCurrency(tableTotals.profit)}
					</span>
				);

			case "roi":
				return (
					<span
						className={cn({
							[styles["CardTable__cell--value--positive"]]: totalRoi > 0,
							[styles["CardTable__cell--value--negative"]]: totalRoi < 0,
						})}
					>
						{totalRoi < 0 ? "-" : ""}%{Math.abs(totalRoi).toFixed(2)}
					</span>
				);

			default:
				return null;
		}
	}

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
	}, [cards, isExpanded, globalFilter]);

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

		if (!tableScroll || !headerScroll) {
			return;
		}

		headerScroll.scrollLeft = tableScroll.scrollLeft;
	}

	const cssVariables = {
		"--table-font-size": `${fontSize / 16}rem`,
		visibility: isReady ? "visible" : "hidden",
	} as CSSProperties;

	return (
		<div className={styles.CardTable} style={cssVariables}>
			<div ref={topSentinelRef} aria-hidden='true' />

			<div className={styles.CardTable__top}>
				<div className={styles.CardTable__actions}>
					<div className={styles.CardTable__actions__group}>
						<Button
							type='icon'
							htmlType='button'
							leadingIcon='edit'
							tooltip='Edit Card'
							tooltipPosition={isTopSticky ? "bottom" : "top"}
							disabled={selectedCard === null}
							onClick={() => {
								if (!selectedCard) {
									return;
								}

								onEditCard(selectedCard);
							}}
						/>

						<Button
							type='icon'
							htmlType='button'
							leadingIcon='copy'
							tooltip='Copy Card'
							tooltipPosition={isTopSticky ? "bottom" : "top"}
							disabled={selectedCard === null}
							onClick={() => {
								if (!selectedCard) {
									return;
								}

								onCopyCard(selectedCard);
							}}
						/>

						<span className={styles.CardTable__actions__separator} />

						<Button
							type='icon'
							htmlType='button'
							leadingIcon='add-sub'
							tooltip='Add to sub'
							tooltipPosition={isTopSticky ? "bottom" : "top"}
							disabled={selectedCardCount === 0}
							onClick={onCreateSubmission}
						/>

						<Button
							type='icon'
							htmlType='button'
							leadingIcon='package'
							tooltip='Add to package'
							tooltipPosition={isTopSticky ? "bottom" : "top"}
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
							tooltipPosition={isTopSticky ? "bottom" : "top"}
							disabled={selectedCard === null}
							onClick={() => {
								if (!selectedCard) {
									return;
								}

								onMoveCard(selectedCard);
							}}
						/>
					</div>

					<div className={styles.CardTable__actions__group}>
						<div
							className={cn(styles.CardTable__actions__filter, {
								[styles["CardTable__actions__filter--open"]]: isSearchOpen,
							})}
						>
							<Button
								type='icon'
								htmlType='button'
								leadingIcon='filter'
								tooltip='Filter cards'
								tooltipPosition={isTopSticky ? "bottom" : "top"}
								className={styles.CardTable__actions__filter__btn}
								onClick={() => {
									setIsSearchOpen((current) => {
										if (current) {
											setGlobalFilter("");
										}

										return !current;
									});
								}}
							/>

							{isSearchOpen && (
								<InputText
									type='search'
									name='cardFilter'
									placeholder='Filter cards...'
									value={globalFilter}
									autoFocus
									onChange={(event) => {
										setGlobalFilter(event.target.value);
									}}
									className={styles.CardTable__actions__input}
								/>
							)}
						</div>

						<span className={styles.CardTable__actions__separator} />

						<ButtonGroup
							leftIcon='arrow-down'
							rightIcon='arrow-up'
							middleIcon='font-size'
							tooltip='Font size'
							tooltipPosition={isTopSticky ? "bottom" : "top"}
							leftDisabled={fontSize <= 10}
							rightDisabled={fontSize >= 36}
							onClickLeft={() => {
								setFontSize((current) => {
									const next = Math.max(current - 2, 10);

									setStoredCardTableFontSize(next);

									return next;
								});
							}}
							onClickRight={() => {
								setFontSize((current) => {
									const next = Math.min(current + 2, 36);

									setStoredCardTableFontSize(next);

									return next;
								});
							}}
						/>

						<span className={styles.CardTable__actions__separator} />

						<Button
							type='icon'
							htmlType='button'
							leadingIcon={isExpanded ? "compress" : "expand"}
							tooltip={isExpanded ? "Compress columns" : "Expand columns"}
							tooltipPosition='left'
							onClick={() => {
								setIsExpanded((current) => {
									const next = !current;

									setStoredCardTableExpanded(next);

									return next;
								});
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
												className={styles["CardTable__header-btn"]}
												onClick={header.column.getToggleSortingHandler()}
												aria-label={`Sort by ${header.column.id}`}
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
									const isValueCell = CARD_TABLE_VALUE_COLUMNS.includes(
										cell.column.id as (typeof CARD_TABLE_VALUE_COLUMNS)[number],
									);

									const isSelectCell = cell.column.id === "select";
									const isPlayerCell = cell.column.id === "player";

									const isPsaSubCell =
										cell.column.id === "psaSubmissionNumbers";

									const columnProps = getColumnProps(cell.column.id);

									return (
										<td
											key={cell.id}
											{...columnProps}
											className={cn(
												columnProps.className,
												(isSelectCell || isPlayerCell) &&
													styles["CardTable__cell--selectable"],
												isValueCell && styles["CardTable__cell--value"],
												isPsaSubCell && styles["CardTable__cell--psa-sub"],
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

					<tfoot>
						<tr>
							{columns.map((column) => {
								const columnId = getColumnId(column);

								if (!columnId) {
									return null;
								}

								const isValueCell = CARD_TABLE_VALUE_COLUMNS.includes(
									columnId as (typeof CARD_TABLE_VALUE_COLUMNS)[number],
								);

								const columnProps = getColumnProps(columnId);

								return (
									<td
										key={columnId}
										{...columnProps}
										className={cn(
											columnProps.className,
											isValueCell && styles["CardTable__cell--value"],
										)}
									>
										{getFooterValue(columnId)}
									</td>
								);
							})}
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
}
