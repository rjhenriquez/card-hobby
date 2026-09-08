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
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { Icon } from "@/components/Icons/Icons";

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
	onRowSelectionChange,
	onCreateSubmission,
	onCreatePurchasePackage,
	onMoveCard,
	onEditCard,
}: CardTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const selectedCardCount = Object.values(rowSelection).filter(Boolean).length;

	const selectedCards = cards.filter((card) => rowSelection[String(card.id)]);

	const selectedCard = selectedCards.length === 1 ? selectedCards[0] : null;

	const selectionColumn: ColumnDef<typeof features, Card> = {
		id: "select",
		enableSorting: false,

		header: ({ table }) => (
			<Input
				type='checkbox'
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
			<Input
				type='checkbox'
				checked={row.getIsSelected()}
				onChange={row.getToggleSelectedHandler()}
				ariaLabel={`Select ${row.original.player}`}
			/>
		),
	};

	const columns: ColumnDef<typeof features, Card>[] = [
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
		<div className={styles.CardTable}>
			<div className={styles.CardTable__top}>
				<h3>
					{portfolio === "investment" ? "Active Investments" : "Collection"}
				</h3>

				<div className={styles.CardTable__top__actions}>
					<Button
						type='icon'
						htmlType='button'
						icon='copy'
						tooltip='Copy Card'
						disabled={selectedCard === null}
						onClick={() => {
							if (!selectedCard) return;

							// Copy functionality to come
						}}
					/>

					<Button
						type='icon'
						htmlType='button'
						icon='edit'
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
						icon={portfolio === "investment" ? "move-down" : "move-up"}
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

					<Button
						type='icon'
						htmlType='button'
						icon='add-sub'
						tooltip='Add to sub'
						disabled={selectedCardCount === 0}
						onClick={onCreateSubmission}
					/>

					<Button
						type='icon'
						htmlType='button'
						icon='package'
						tooltip='Add to package'
						disabled={selectedCardCount === 0}
						onClick={onCreatePurchasePackage}
					/>
				</div>
			</div>

			<div className={styles.CardTable__table}>
				<table>
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th key={header.id}>
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

					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr
								key={row.id}
								onClick={row.getToggleSelectedHandler()}
								data-selected={row.getIsSelected()}
							>
								{row.getAllCells().map((cell) => (
									<td
										key={cell.id}
										onClick={
											cell.column.id === "select"
												? (event) => event.stopPropagation()
												: undefined
										}
									>
										<table.FlexRender cell={cell} />
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
