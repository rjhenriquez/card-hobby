"use client";

import { useState } from "react";
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
import type { Card } from "@/types/types";

import styles from "./CardTable.module.scss";

interface CardTableProps {
	cards: Card[];
	portfolio: "investment" | "collection";
	rowSelection: RowSelectionState;
	selectionMode: "submission" | "purchase-package" | null;
	onRowSelectionChange: (rowSelection: RowSelectionState) => void;
	onSelectionModeChange: (
		mode: "submission" | "purchase-package" | null,
	) => void;
	onCreateSubmission: () => void;
	onCreatePurchasePackage: () => void;
	onMoveCard: (card: Card) => void;
	onEditCard: (card: Card) => void;
}

const features = tableFeatures({
	rowSelectionFeature,
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
});

function formatCurrency(value: number) {
	return `$${value.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

export function CardTable({
	cards,
	portfolio,
	rowSelection,
	selectionMode,
	onRowSelectionChange,
	onSelectionModeChange,
	onCreateSubmission,
	onCreatePurchasePackage,
	onMoveCard,
	onEditCard,
}: CardTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const selectedCardCount = Object.values(rowSelection).filter(Boolean).length;

	function startSelection(mode: "submission" | "purchase-package") {
		onRowSelectionChange({});
		onSelectionModeChange(mode);
	}

	function cancelSelection() {
		onRowSelectionChange({});
		onSelectionModeChange(null);
	}

	const selectionColumn: ColumnDef<typeof features, Card> = {
		id: "select",
		enableSorting: false,
		header: ({ table }) => (
			<input
				type='checkbox'
				checked={table.getIsAllRowsSelected()}
				ref={(input) => {
					if (input) {
						input.indeterminate =
							table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
					}
				}}
				onChange={table.getToggleAllRowsSelectedHandler()}
				aria-label='Select all cards'
			/>
		),
		cell: ({ row }) => (
			<input
				type='checkbox'
				checked={row.getIsSelected()}
				onChange={row.getToggleSelectedHandler()}
				aria-label={`Select ${row.original.player}`}
			/>
		),
	};

	const columns: ColumnDef<typeof features, Card>[] = [
		...(selectionMode !== null ? [selectionColumn] : []),
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
			accessorKey: "effectiveStatus",
			header: "Status",
		},
		{
			accessorKey: "purchasedFrom",
			header: "Purchased From",
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
			header: "PSA Submission",
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
			header: "Price",
			cell: ({ getValue }) => {
				const value = getValue() as number | null;
				return value !== null ? formatCurrency(value) : "—";
			},
		},
		{
			accessorKey: "gradingCost",
			header: "Grading Cost",
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

		...(portfolio === "investment"
			? ([
					{
						accessorKey: "soldPrice",
						header: "Sold Price",
						cell: ({ getValue }) => {
							const value = getValue() as string | null;

							return value !== null ? formatCurrency(Number(value)) : "—";
						},
					},
					{
						accessorKey: "profit",
						header: "Profit",
						cell: ({ getValue }) => {
							const value = getValue() as number | null;

							return value !== null ? formatCurrency(value) : "—";
						},
					},
					{
						accessorKey: "roi",
						header: "ROI",
						cell: ({ getValue }) => {
							const value = getValue() as number | null;

							return value !== null ? `${value.toFixed(2)}%` : "—";
						},
					},
				] as ColumnDef<typeof features, Card>[])
			: []),

		{
			id: "actions",
			header: "",
			enableSorting: false,
		},
	];

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

	return (
		<>
			<div>
				{selectionMode === null ? (
					<>
						<button type='button' onClick={() => startSelection("submission")}>
							Add cards to submission
						</button>

						<button
							type='button'
							onClick={() => startSelection("purchase-package")}
						>
							Add cards to purchase package
						</button>
					</>
				) : (
					<>
						<button type='button' onClick={cancelSelection}>
							Cancel
						</button>

						<button
							type='button'
							disabled={selectedCardCount === 0}
							onClick={
								selectionMode === "submission"
									? onCreateSubmission
									: onCreatePurchasePackage
							}
						>
							{selectionMode === "submission"
								? `Create submission (${selectedCardCount})`
								: `Create purchase package (${selectedCardCount})`}
						</button>
					</>
				)}
			</div>

			<table>
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th key={header.id}>
									{header.isPlaceholder ? null : (
										<span>
											<table.FlexRender header={header} />

											{header.column.getCanSort() && (
												<button
													type='button'
													onClick={header.column.getToggleSortingHandler()}
													aria-label={`Sort by ${header.column.id}`}
												>
													{header.column.getIsSorted() === "asc"
														? "↑"
														: header.column.getIsSorted() === "desc"
															? "↓"
															: "↕"}
												</button>
											)}
										</span>
									)}
								</th>
							))}
						</tr>
					))}
				</thead>

				<tbody>
					{table.getRowModel().rows.map((row) => {
						const card = row.original;

						return (
							<tr key={row.id}>
								{row.getAllCells().map((cell) => {
									if (cell.column.id === "actions") {
										return (
											<td key={cell.id}>
												<button type='button' onClick={() => onEditCard(card)}>
													Edit
												</button>

												<button type='button' onClick={() => onMoveCard(card)}>
													{portfolio === "investment"
														? "Move to Collection"
														: "Move to Investment"}
												</button>
											</td>
										);
									}

									return (
										<td key={cell.id}>
											<table.FlexRender cell={cell} />
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
		</>
	);
}
