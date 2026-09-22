"use client";

import { CSSProperties, useLayoutEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatShortDate } from "@/lib/formatters";
import {
	getStoredCardTableFontSize,
	setStoredCardTableFontSize,
} from "@/lib/storage";
import type { PsaGemRateRow } from "@/db/queries/psaGemRate";
import { Button } from "@/components/Button/Button";
import { ButtonGroup } from "@/components/ButtonGroup/ButtonGroup";
import { InputText } from "@/components/InputText/InputText";
import { Table } from "@/components/Table/Table";
import type { TableColumn, TableSortDirection } from "@/components/Table/Table";
import cn from "classnames";

import styles from "./GemRateTable.module.scss";

interface GemRateTableProps {
	submissions: PsaGemRateRow[];
}

export function GemRateTable({ submissions }: GemRateTableProps) {
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [globalFilter, setGlobalFilter] = useState("");
	const [fontSize, setFontSize] = useState(12);
	const [isReady, setIsReady] = useState(false);
	const [sortColumn, setSortColumn] = useState<string>();
	const [sortDirection, setSortDirection] = useState<TableSortDirection>();

	useLayoutEffect(() => {
		setFontSize(getStoredCardTableFontSize());
		setIsReady(true);
	}, []);

	const columns: TableColumn<PsaGemRateRow>[] = [
		{
			id: "submissionNumber",
			label: "Sub #",
			sortable: true,
			className: styles["GemRateTable__cell--mono"],
			render: (submission) => (
				<Link
					className={styles.GemRateTable__link}
					href={`/psa-submissions/${submission.submissionNumber}`}
				>
					{submission.submissionNumber}
				</Link>
			),
		},
		{
			id: "receivedDate",
			label: "Received",
			className: styles["GemRateTable__cell--value"],
			sortable: true,
			render: (submission) => formatShortDate(submission.receivedDate),
		},
		{
			id: "totalCards",
			label: "Total Cards",
			sortable: true,
			className: styles["GemRateTable__cell--mono"],
			render: (submission) => submission.totalCards,
		},
		{
			id: "psa10",
			label: "PSA 10",
			sortable: true,
			className: styles["GemRateTable__cell--mono"],
			render: (submission) => submission.psa10,
		},
		{
			id: "psa9",
			label: "PSA 9",
			sortable: true,
			className: styles["GemRateTable__cell--mono"],
			render: (submission) => submission.psa9,
		},
		{
			id: "psa85",
			label: "PSA 8.5",
			sortable: true,
			className: styles["GemRateTable__cell--mono"],
			render: (submission) => submission.psa85,
		},
		{
			id: "psa8",
			label: "PSA 8",
			sortable: true,
			className: styles["GemRateTable__cell--mono"],
			render: (submission) => submission.psa8,
		},
		{
			id: "psa75OrLess",
			label: "PSA 7.5",
			sortable: true,
			className: styles["GemRateTable__cell--mono"],
			render: (submission) => submission.psa75OrLess,
		},
		{
			id: "noGrade",
			label: "No Grade",
			sortable: true,
			className: styles["GemRateTable__cell--mono"],
			render: (submission) => submission.noGrade,
		},
		{
			id: "nineOrBetter",
			label: "Mint Rate",
			sortable: true,
			className: styles["GemRateTable__cell--value"],
			render: (submission) => `${submission.nineOrBetter.toFixed(1)}%`,
		},
		{
			id: "gemRate",
			label: "Gem Rate",
			sortable: true,
			className: styles["GemRateTable__cell--value"],
			render: (submission) => `${submission.gemRate.toFixed(1)}%`,
		},
	];

	const filteredSubmissions = submissions.filter((submission) => {
		const filter = globalFilter.trim().toLowerCase();

		if (!filter) {
			return true;
		}

		return [
			submission.submissionNumber,
			formatShortDate(submission.receivedDate),
			submission.totalCards,
			submission.psa10,
			submission.psa9,
			submission.psa85,
			submission.psa8,
			submission.psa75OrLess,
			submission.noGrade,
			submission.nineOrBetter.toFixed(1),
			submission.gemRate.toFixed(1),
		].some((value) => String(value).toLowerCase().includes(filter));
	});

	const sortedSubmissions = useMemo(() => {
		if (!sortColumn || !sortDirection) {
			return filteredSubmissions;
		}

		return [...filteredSubmissions].sort((a, b) => {
			const aValue = a[sortColumn as keyof PsaGemRateRow];
			const bValue = b[sortColumn as keyof PsaGemRateRow];

			if (sortColumn === "receivedDate") {
				const aTime = a.receivedDate
					? new Date(a.receivedDate).getTime()
					: Number.POSITIVE_INFINITY;
				const bTime = b.receivedDate
					? new Date(b.receivedDate).getTime()
					: Number.POSITIVE_INFINITY;

				return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
			}

			if (aValue === null || aValue === undefined) {
				return 1;
			}

			if (bValue === null || bValue === undefined) {
				return -1;
			}

			if (typeof aValue === "number" && typeof bValue === "number") {
				return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
			}

			const comparison = String(aValue).localeCompare(
				String(bValue),
				undefined,
				{
					numeric: true,
				},
			);

			return sortDirection === "asc" ? comparison : -comparison;
		});
	}, [filteredSubmissions, sortColumn, sortDirection]);

	function handleSort(columnId: string) {
		if (sortColumn === columnId) {
			setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
			return;
		}

		setSortColumn(columnId);
		setSortDirection("asc");
	}

	const cssVariables = {
		"--table-font-size": `${fontSize / 16}rem`,
		visibility: isReady ? "visible" : "hidden",
	} as CSSProperties;

	return (
		<div className={styles.GemRateTable} style={cssVariables}>
			<Table
				columns={columns}
				rows={sortedSubmissions}
				getRowKey={(submission) => submission.id}
				sortColumn={sortColumn}
				sortDirection={sortDirection}
				onSort={handleSort}
				className={styles.GemRateTable__table}
				top={
					<div className={styles.GemRateTable__actions}>
						<div
							className={cn(styles.GemRateTable__actions__filter, {
								[styles["GemRateTable__actions__filter--open"]]: isSearchOpen,
							})}
						>
							<Button
								type='icon'
								htmlType='button'
								leadingIcon='filter'
								tooltip='Filter submissions'
								tooltipPosition='bottom'
								className={styles.GemRateTable__actions__filter__btn}
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
									name='submissionFilter'
									placeholder='Filter submissions...'
									value={globalFilter}
									autoFocus
									onChange={(event) => {
										setGlobalFilter(event.target.value);
									}}
									className={styles.GemRateTable__actions__input}
								/>
							)}
						</div>

						<span className={styles.GemRateTable__actions__separator} />

						<ButtonGroup
							leftIcon='arrow-down'
							rightIcon='arrow-up'
							middleIcon='font-size'
							tooltip='Font size'
							tooltipPosition='bottom'
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
					</div>
				}
			/>
		</div>
	);
}
