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
	ColumnFiltersState,
	RowSelectionState,
	SortingState,
	columnFilteringFeature,
	createFilteredRowModel,
	createSortedRowModel,
	filterFn_inDateRange,
	filterFn_inNumberRange,
	filterFn_includesString,
	globalFilteringFeature,
	rowSelectionFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import {
	CARD_TABLE_COLUMN_WIDTHS,
	CARD_TABLE_HIDDEN_COLUMNS,
	CARD_TABLE_VALUE_COLUMNS,
	FILTER_COST_RANGES,
	PSA_GRADE_DEFINITIONS,
	STATUS_CLASSES,
} from "@/constants";
import {
	getStoredCardTableExpanded,
	getStoredCardTableFontSize,
	getStoredCardTableSorting,
	setStoredCardTableExpanded,
	setStoredCardTableFontSize,
	setStoredCardTableSorting,
} from "@/lib/storage";
import { formatCurrency, formatShortDate } from "@/lib/formatters";
import type { Card } from "@/types/types";
import { Button } from "@/components/Button/Button";
import { Filter } from "@/components/Filter/Filter";
import { ButtonGroup } from "@/components/ButtonGroup/ButtonGroup";
import { InputCheckbox } from "@/components/InputCheckbox/InputCheckbox";
import { Icon } from "@/components/Icons/Icons";
import { InputText } from "@/components/InputText/InputText";
import { InputDate } from "@/components/InputDate/InputDate";
import { FilterTextList } from "@/components/FilterTextList/FilterTextList";
import { FilterSelectList } from "@/components/FilterSelectList/FilterSelectList";
import type { CardFormOptions } from "@/db/queries/cardFormOptions";
import {
	filterFn_equalsAnyString,
	filterFn_hasAnyWord,
	filterFn_includesAnyString,
} from "@/lib/filterFns";
import { Table } from "@/components/Table/Table";
import { BROWSER_WIDTH_RANGES } from "@/constants";
import { useDimensions } from "@/hooks/useDimensions";
import type { TableColumn, TableSortDirection } from "@/components/Table/Table";
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
	onEditCards: (cards: Card[]) => void;
	onCopyCard: (card: Card) => void;
	// Every player / seller name in the database, for the filters' autocomplete.
	filterOptions: CardFormOptions;
}

// [min, max] as typed; an empty side means no limit.
type FilterRange = [string, string];

// "A – B", or "From A" / "Up to B" (or "A+" with `openMinSuffix`) when only one side is set.
function formatRangeLabel(
	[min, max]: FilterRange,
	format: (value: string) => string,
	{ openMinSuffix = false } = {},
) {
	if (min && max) {
		return `${format(min)} – ${format(max)}`;
	}

	if (min) {
		return openMinSuffix ? `${format(min)} +` : `From ${format(min)}`;
	}

	return `Up to ${format(max)}`;
}

function formatCostRangeLabel(range: FilterRange) {
	return formatRangeLabel(
		range,
		(value) =>
			formatCurrency(Number(value), {
				minimumFractionDigits: 0,
				maximumFractionDigits: 2,
			}),
		{ openMinSuffix: true },
	);
}

function formatDateRangeLabel(range: FilterRange) {
	return formatRangeLabel(range, formatShortDate);
}

const features = tableFeatures({
	rowSelectionFeature,
	rowSortingFeature,
	columnFilteringFeature,
	globalFilteringFeature,
	sortedRowModel: createSortedRowModel(),
	filteredRowModel: createFilteredRowModel(),
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
	},
	filterFns: {
		includesString: filterFn_includesString,
		inNumberRange: filterFn_inNumberRange,
		inDateRange: filterFn_inDateRange,
		includesAnyString: filterFn_includesAnyString,
		equalsAnyString: filterFn_equalsAnyString,
		hasAnyWord: filterFn_hasAnyWord,
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
	onEditCards,
	onCopyCard,
	filterOptions,
}: CardTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [isExpanded, setIsExpanded] = useState(false);
	const [globalFilter, setGlobalFilter] = useState("");
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [fontSize, setFontSize] = useState(12);
	const [isReady, setIsReady] = useState(false);
	const [isTopSticky, setIsTopSticky] = useState(false);

	const topSentinelRef = useRef<HTMLDivElement>(null);
	const showTooltip = useDimensions() <= BROWSER_WIDTH_RANGES.medium.max;
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
			filterFn: "includesAnyString",
		},
		{
			accessorKey: "category",
			header: "Category",
			filterFn: "equalsAnyString",
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
			filterFn: "inDateRange",
			cell: ({ getValue }) => {
				const value = getValue() as string | null;

				return formatShortDate(value);
			},
		},
		{
			accessorKey: "effectiveStatus",
			header: "Status",
			cell: ({ getValue }) => {
				const value = getValue() as string | null;
				if (!value) {
					return "—";
				}
				const statusClass = STATUS_CLASSES.find(({ term }) =>
					value.toLowerCase().includes(term.toLowerCase()),
				)?.className;
				return (
					<span
						className={cn(
							styles.CardTable__status,
							statusClass && styles[`CardTable__${statusClass}`],
						)}
					>
						{value}
					</span>
				);
			},
		},
		{
			accessorKey: "purchasedFrom",
			header: "Seller",
			filterFn: "equalsAnyString",
			cell: ({ row }) => {
				const card = row.original;
				if (card.acquisitionType === "pulled") {
					return "Pulled";
				}
				if (!card.purchasedFrom?.trim()) {
					return <span className={styles["CardTable__cell--muted"]}>N/A</span>;
				}
				return card.purchasedFrom;
			},
		},
		{
			accessorKey: "ebaySeller",
			header: "eBay Seller",
			filterFn: "includesAnyString",
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
			filterFn: "hasAnyWord",
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
			accessorKey: "grade",
			header: "Grade",
			cell: ({ getValue }) => {
				const value = getValue() as number | null;
				if (value === null && portfolio === "collection") {
					return <span className={styles["CardTable__cell--muted"]}>RAW</span>;
				}
				if (value === null) {
					return;
				}
				const definition =
					PSA_GRADE_DEFINITIONS[value as keyof typeof PSA_GRADE_DEFINITIONS];
				return definition ? `${definition} ${value}` : value;
			},
		},
		{
			accessorKey: "price",
			header: "Cost",
			cell: ({ getValue }) => {
				const value = getValue() as number | null;

				return value !== null ? (
					formatCurrency(value)
				) : (
					<span className={styles["CardTable__cell--muted"]}>—</span>
				);
			},
		},
		{
			accessorKey: "gradingCost",
			header: "Grading",
			cell: ({ getValue }) => {
				const value = getValue() as number;

				return value > 0 ? (
					formatCurrency(value)
				) : (
					<span className={styles["CardTable__cell--muted"]}>—</span>
				);
			},
		},
		{
			accessorKey: "totalCost",
			header: "Total Cost",
			filterFn: "inNumberRange",
			cell: ({ getValue }) => {
				const value = getValue() as number | null;

				return value !== null ? (
					formatCurrency(value)
				) : (
					<span className={styles["CardTable__cell--muted"]}>Unknown</span>
				);
			},
		},
		{
			id: "soldPrice",
			accessorFn: (card) =>
				card.soldPrice !== null ? Number(card.soldPrice) : null,
			header: "Sold Price",
			cell: ({ getValue }) => {
				const value = getValue() as number | null;

				return value !== null ? formatCurrency(value) : "";
			},
		},
		{
			accessorKey: "soldDate",
			header: "Sold Date",
			filterFn: "inDateRange",
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
						{value < 0 ? "-" : ""}
						{Math.abs(value).toFixed(2)}%
					</span>
				);
			},
		},
		{
			accessorKey: "isShared",
			header: "Shared",
			cell: ({ getValue }) => {
				const value = getValue() as boolean;

				return value ? (
					<span
						className={`${styles.CardTable__label} ${styles["CardTable__label--yes"]}`}
					>
						<Icon icon='circle-check' />
						Yes
					</span>
				) : (
					<span
						className={`${styles.CardTable__label} ${styles["CardTable__label--no"]}`}
					>
						<Icon icon='circle-close' />
						No
					</span>
				);
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
			columnFilters,
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
		onColumnFiltersChange: (updater) => {
			setColumnFilters((current) =>
				typeof updater === "function" ? updater(current) : updater,
			);
		},
		onRowSelectionChange: (updater) => {
			const nextSelection =
				typeof updater === "function" ? updater(rowSelection) : updater;

			onRowSelectionChange(nextSelection);
		},
		getRowId: (row) => String(row.id),
	});

	// [min, max] as typed; an empty side means no limit.
	function getRangeFilter(columnId: string): FilterRange {
		return (
			(columnFilters.find((filter) => filter.id === columnId)?.value as
				FilterRange | undefined) ?? ["", ""]
		);
	}

	function setRangeFilter(columnId: string, nextRange: FilterRange | null) {
		setColumnFilters((current) => {
			const others = current.filter((filter) => filter.id !== columnId);
			const isEmpty = !nextRange || (!nextRange[0] && !nextRange[1]);

			return isEmpty ? others : [...others, { id: columnId, value: nextRange }];
		});
	}

	function hasRange([min, max]: FilterRange) {
		return Boolean(min || max);
	}

	const costRange = getRangeFilter("totalCost");
	const setCostRange = (nextRange: FilterRange | null) =>
		setRangeFilter("totalCost", nextRange);

	const purchaseDateRange = getRangeFilter("purchaseDate");
	const soldDateRange = getRangeFilter("soldDate");

	// Filters only show for columns this portfolio displays (e.g. no Sold Date in Collection).
	function isColumnShown(columnId: string) {
		return !CARD_TABLE_HIDDEN_COLUMNS[portfolio].includes(columnId);
	}

	const showSoldDateFilter = isColumnShown("soldDate");

	// Multi-value text filters: a row matches if it contains any of the values.
	function getListFilter(columnId: string): string[] {
		return (
			(columnFilters.find((filter) => filter.id === columnId)?.value as
				string[] | undefined) ?? []
		);
	}

	function setListFilter(columnId: string, nextValues: string[]) {
		setColumnFilters((current) => {
			const others = current.filter((filter) => filter.id !== columnId);
			const values = nextValues.filter((value) => value.trim());

			return values.length
				? [...others, { id: columnId, value: values }]
				: others;
		});
	}

	// Dropdown options come from the cards in this view, so there are no dead choices.
	const sellerOptions = Array.from(
		new Set(
			cards
				.map((card) => card.purchasedFrom?.trim())
				.filter((seller): seller is string => Boolean(seller)),
		),
	).sort((a, b) => a.localeCompare(b));

	const categoryOptions = Array.from(
		new Set(
			cards
				.map((card) => card.category?.trim())
				.filter((category): category is string => Boolean(category)),
		),
	).sort((a, b) => a.localeCompare(b));

	const psaSubmissionOptions = Array.from(
		new Set(cards.flatMap((card) => card.psaSubmissionNumbers)),
	).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

	// Multi-value filters. To add one, set the column's filterFn and add an entry:
	// - input "text": autocomplete fields, filterFn "includesAnyString" (contains any value)
	// - input "select": dropdown of fixed options, filterFn "equalsAnyString"
	//   (or "hasAnyWord" for space-separated lists like PSA Sub)
	const listFilters: {
		columnId: string;
		label: string;
		itemLabel: string;
		tagPrefix: string;
		icon: string;
		input: "text" | "select";
		options: string[];
	}[] = [
		{
			columnId: "player",
			icon: "player",
			label: "Player",
			itemLabel: "player",
			tagPrefix: "",
			input: "text",
			options: filterOptions.players,
		},
		{
			columnId: "category",
			icon: "trophy",
			label: "Category",
			itemLabel: "category",
			tagPrefix: "Category: ",
			input: "select",
			options: categoryOptions,
		},
		{
			columnId: "purchasedFrom",
			icon: "sell",
			label: "Seller",
			itemLabel: "seller",
			tagPrefix: "From: ",
			input: "select",
			options: sellerOptions,
		},
		{
			columnId: "ebaySeller",
			icon: "ebay",
			label: "eBay Seller",
			itemLabel: "seller",
			tagPrefix: "eBay: ",
			input: "text",
			options: filterOptions.ebaySellers,
		},
		{
			columnId: "psaSubmissionNumbers",
			icon: "psa",
			label: "PSA Sub",
			itemLabel: "submission",
			tagPrefix: "PSA #",
			input: "select",
			options: psaSubmissionOptions,
		},
	];

	const visibleListFilters = listFilters
		.filter((filter) => isColumnShown(filter.columnId))
		.map((filter) => ({ ...filter, values: getListFilter(filter.columnId) }));

	// One removable tag per applied filter, shown next to the filter buttons.
	const activeFilterTags: {
		id: string;
		label: string;
		onRemove: () => void;
	}[] = [];

	for (const filter of visibleListFilters) {
		filter.values.forEach((value, index) => {
			activeFilterTags.push({
				id: `${filter.columnId}:${index}`,
				label: `${filter.tagPrefix}${value.trim()}`,
				onRemove: () =>
					setListFilter(
						filter.columnId,
						filter.values.filter((_, i) => i !== index),
					),
			});
		});
	}

	if (hasRange(purchaseDateRange)) {
		activeFilterTags.push({
			id: "purchaseDate",
			label: `Date: ${formatDateRangeLabel(purchaseDateRange)}`,
			onRemove: () => setRangeFilter("purchaseDate", null),
		});
	}

	if (showSoldDateFilter && hasRange(soldDateRange)) {
		activeFilterTags.push({
			id: "soldDate",
			label: `Sold: ${formatDateRangeLabel(soldDateRange)}`,
			onRemove: () => setRangeFilter("soldDate", null),
		});
	}

	if (hasRange(costRange)) {
		activeFilterTags.push({
			id: "totalCost",
			label: formatCostRangeLabel(costRange),
			onRemove: () => setCostRange(null),
		});
	}

	const tableRows = table.getRowModel().rows;
	const visibleCards = tableRows.map((row) => row.original);

	function getCardRow(card: Card) {
		return tableRows.find((row) => row.original.id === card.id);
	}

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
			case "player":
				return `${visibleCards.length} ${visibleCards.length === 1 ? "card" : "cards"}`;
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
						{totalRoi < 0 ? "-" : ""}
						{Math.abs(totalRoi).toFixed(2)}%
					</span>
				);

			default:
				return null;
		}
	}

	function getColumnClassName(columnId: string) {
		return cn(
			columnId === "select" && styles["CardTable__column--select"],
			columnId === "player" && styles["CardTable__column--player"],
			!isExpanded &&
				CARD_TABLE_COLUMN_WIDTHS[columnId] &&
				styles["CardTable__column--capped"],
			CARD_TABLE_VALUE_COLUMNS.includes(
				columnId as (typeof CARD_TABLE_VALUE_COLUMNS)[number],
			) && styles["CardTable__cell--value"],
			columnId === "psaSubmissionNumbers" && styles["CardTable__cell--psa-sub"],
			(columnId === "select" || columnId === "player") &&
				styles["CardTable__cell--selectable"],
		);
	}

	const tableColumns: TableColumn<Card>[] = table
		.getHeaderGroups()[0]
		.headers.map((header) => {
			const columnId = header.column.id;
			const columnWidth = CARD_TABLE_COLUMN_WIDTHS[columnId];
			return {
				id: columnId,
				label: header.isPlaceholder ? null : (
					<table.FlexRender header={header} />
				),
				sortable: columnId !== "select" && header.column.getCanSort(),
				className: getColumnClassName(columnId),
				headerClassName: getColumnClassName(columnId),
				style:
					!isExpanded && columnWidth
						? ({
								"--column-width": columnWidth,
							} as CSSProperties)
						: undefined,
				render: (card) => {
					const row = getCardRow(card);

					if (!row) {
						return null;
					}

					const cell = row
						.getAllCells()
						.find((currentCell) => currentCell.column.id === columnId);

					if (!cell) {
						return null;
					}

					const isSelectCell = columnId === "select";
					const isPlayerCell = columnId === "player";

					if (isSelectCell || isPlayerCell) {
						return (
							<div
								onClick={(event) => {
									if (
										isSelectCell &&
										event.target instanceof HTMLElement &&
										event.target.closest("label")
									) {
										return;
									}

									row.toggleSelected();
								}}
							>
								<table.FlexRender cell={cell} />
							</div>
						);
					}

					return <table.FlexRender cell={cell} />;
				},
			};
		});

	const activeSort = sorting[0];

	const sortDirection: TableSortDirection | undefined =
		activeSort?.desc === undefined
			? undefined
			: activeSort.desc
				? "desc"
				: "asc";

	function handleSort(columnId: string) {
		const column = table
			.getHeaderGroups()[0]
			.headers.find((header) => header.column.id === columnId)?.column;

		if (!column) {
			return;
		}

		const currentSort = column.getIsSorted();

		column.toggleSorting(currentSort === "asc");
	}

	const columnClasses = Object.fromEntries(
		tableColumns.map((column) => [column.id, getColumnClassName(column.id)]),
	);

	const cssVariables = {
		"--table-font-size": `${fontSize / 16}rem`,
		visibility: isReady ? "visible" : "hidden",
	} as CSSProperties;

	return (
		<div className={styles.CardTable} style={cssVariables}>
			<div ref={topSentinelRef} aria-hidden='true' />

			<Table
				columns={tableColumns}
				rows={visibleCards}
				getRowKey={(card) => card.id}
				getRowProps={(card) => ({
					"data-selected": getCardRow(card)?.getIsSelected(),
				})}
				sortColumn={activeSort?.id}
				sortDirection={sortDirection}
				onSort={handleSort}
				columnClasses={columnClasses}
				className={styles.CardTable__table}
				top={
					<div className={styles.CardTable__actions}>
						<div className={styles.CardTable__actions__group}>
							{visibleListFilters.map((filter) => {
								const listProps = {
									name: `${filter.columnId}Filter`,
									label: filter.label,
									itemLabel: filter.itemLabel,
									options: filter.options,
									values: filter.values,
									onChange: (values: string[]) =>
										setListFilter(filter.columnId, values),
								};

								return (
									<Filter
										key={filter.columnId}
										label={filter.label}
										icon={filter.icon}
										isActive={filter.values.length > 0}
										onClear={() => setListFilter(filter.columnId, [])}
									>
										{filter.input === "select" ? (
											<FilterSelectList {...listProps} />
										) : (
											<FilterTextList {...listProps} />
										)}
									</Filter>
								);
							})}

							<Filter
								label='Date'
								icon='calendar'
								isActive={hasRange(purchaseDateRange)}
								onClear={() => setRangeFilter("purchaseDate", null)}
							>
								<div
									className={cn(
										styles.CardTable__filter__range,
										styles["CardTable__filter__range--dates"],
									)}
								>
									<InputDate
										name='purchaseDateMin'
										label='From'
										value={purchaseDateRange[0]}
										onChange={(event) =>
											setRangeFilter("purchaseDate", [
												event.target.value,
												purchaseDateRange[1],
											])
										}
									/>
									<InputDate
										name='purchaseDateMax'
										label='To'
										value={purchaseDateRange[1]}
										onChange={(event) =>
											setRangeFilter("purchaseDate", [
												purchaseDateRange[0],
												event.target.value,
											])
										}
									/>
								</div>
							</Filter>

							{showSoldDateFilter && (
								<Filter
									label='Sold Date'
									icon='calendar-sold'
									isActive={hasRange(soldDateRange)}
									onClear={() => setRangeFilter("soldDate", null)}
								>
									<div
										className={cn(
											styles.CardTable__filter__range,
											styles["CardTable__filter__range--dates"],
										)}
									>
										<InputDate
											name='soldDateMin'
											label='From'
											value={soldDateRange[0]}
											onChange={(event) =>
												setRangeFilter("soldDate", [
													event.target.value,
													soldDateRange[1],
												])
											}
										/>
										<InputDate
											name='soldDateMax'
											label='To'
											value={soldDateRange[1]}
											onChange={(event) =>
												setRangeFilter("soldDate", [
													soldDateRange[0],
													event.target.value,
												])
											}
										/>
									</div>
								</Filter>
							)}

							<Filter
								label='Cost'
								icon='investments'
								isActive={hasRange(costRange)}
								onClear={() => setCostRange(null)}
							>
								<div className={styles.CardTable__filter__range}>
									<InputText
										type='number'
										name='costMin'
										label='Min Cost'
										leadingIcon='dollar-sign'
										min={0}
										step={0.01}
										value={costRange[0]}
										onChange={(event) =>
											setCostRange([event.target.value, costRange[1]])
										}
									/>
									<InputText
										type='number'
										name='costMax'
										label='Max Cost'
										leadingIcon='dollar-sign'
										min={0}
										step={0.01}
										value={costRange[1]}
										onChange={(event) =>
											setCostRange([costRange[0], event.target.value])
										}
									/>
								</div>

								<div className={styles.CardTable__filter__presets}>
									{FILTER_COST_RANGES.map(({ min, max }) => {
										// A null end becomes "" (no limit), same as an empty input.
										const presetRange: FilterRange = [
											min === null ? "" : String(min),
											max === null ? "" : String(max),
										];
										const isSelected =
											costRange[0] === presetRange[0] &&
											costRange[1] === presetRange[1];
										const rangeLabel = formatCostRangeLabel(presetRange);

										return (
											<button
												key={presetRange.join("-")}
												type='button'
												className={cn(styles.CardTable__filter__preset, {
													[styles["CardTable__filter__preset--active"]]:
														isSelected,
												})}
												aria-pressed={isSelected}
												onClick={() =>
													setCostRange(isSelected ? null : presetRange)
												}
											>
												{rangeLabel}
											</button>
										);
									})}
								</div>
							</Filter>
						</div>

						<div className={styles.CardTable__actions__group}>
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
						{activeFilterTags.length > 0 && (
							<div className={styles["CardTable__actions__group--large"]}>
								<div className={styles.CardTable__filter__tags}>
									{activeFilterTags.map((tag) => (
										<span
											key={tag.id}
											className={styles.CardTable__filter__tag}
										>
											<span className={styles.CardTable__filter__tag__label}>
												{tag.label}
											</span>
											<button
												type='button'
												className={styles.CardTable__filter__tag__remove}
												aria-label={`Remove ${tag.label} filter`}
												onClick={tag.onRemove}
											>
												<Icon
													icon='close'
													className={styles.CardTable__filter__tag__icon}
												/>
											</button>
										</span>
									))}

									{activeFilterTags.length > 1 && (
										<button
											type='button'
											className={styles.CardTable__filter__clearAll}
											onClick={() => setColumnFilters([])}
										>
											Clear all
										</button>
									)}
								</div>
							</div>
						)}
					</div>
				}
				footer={
					<tr>
						{tableColumns.map((column) => (
							<td key={column.id} className={getColumnClassName(column.id)}>
								{getFooterValue(column.id)}
							</td>
						))}
					</tr>
				}
			/>

			<div
				className={cn(styles.CardTable__selectionActions, {
					[styles["CardTable__selectionActions--visible"]]:
						selectedCardCount > 0,
				})}
				inert={selectedCardCount === 0}
			>
				<Button
					type='main-sm'
					htmlType='button'
					leadingIcon='edit'
					label={selectedCardCount > 1 ? "Edit Cards" : "Edit Card"}
					tooltip={
						showTooltip
							? selectedCardCount > 1
								? "Edit Cards"
								: "Edit Card"
							: undefined
					}
					tooltipPosition='top'
					disabled={selectedCards.length === 0}
					onClick={() => onEditCards(selectedCards)}
				/>

				<Button
					type='main-sm'
					htmlType='button'
					leadingIcon='copy'
					tooltipPosition='top'
					label='Copy Card'
					tooltip={showTooltip ? "Copy Card" : undefined}
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
					type='main-sm'
					htmlType='button'
					leadingIcon='add-sub'
					label='Add to sub'
					tooltip={showTooltip ? "Add to sub" : undefined}
					disabled={selectedCardCount === 0}
					onClick={onCreateSubmission}
				/>

				<Button
					type='main-sm'
					htmlType='button'
					leadingIcon='package'
					label='Add to package'
					tooltip={showTooltip ? "Add to package" : undefined}
					disabled={selectedCardCount === 0}
					onClick={onCreatePurchasePackage}
				/>

				<span className={styles.CardTable__actions__separator} />

				<Button
					type='main-sm'
					htmlType='button'
					leadingIcon={portfolio === "investment" ? "move-down" : "move-up"}

					label={
						portfolio === "investment"
							? "Move to Collection"
							: "Move to Investment"
					}
					tooltip={
						showTooltip
							? portfolio === "investment"
								? "Move to Collection"
								: "Move to Investment"
							: undefined
					}

					tooltipPosition='top'
					disabled={selectedCard === null}
					onClick={() => {
						if (!selectedCard) {
							return;
						}

						onMoveCard(selectedCard);
					}}
				/>
			</div>
		</div>
	);
}
