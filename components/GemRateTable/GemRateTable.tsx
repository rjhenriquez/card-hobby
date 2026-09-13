"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { formatShortDate } from "@/lib/date";
import type { PsaGemRateRow } from "@/db/queries/psaGemRate";

import styles from "./GemRateTable.module.scss";

interface GemRateTableProps {
	submissions: PsaGemRateRow[];
}

export function GemRateTable({ submissions }: GemRateTableProps) {
	const tableScrollRef = useRef<HTMLDivElement>(null);
	const headerScrollRef = useRef<HTMLDivElement>(null);

	function handleTableScroll() {
		const tableScroll = tableScrollRef.current;
		const headerScroll = headerScrollRef.current;

		if (!tableScroll || !headerScroll) {
			return;
		}

		headerScroll.scrollLeft = tableScroll.scrollLeft;
	}

	return (
		<div className={styles.GemRateTable}>
			<div ref={headerScrollRef} className={styles.GemRateTable__header}>
				<table>
					<thead>
						<tr>
							<th>Submission #</th>
							<th>Received</th>
							<th>Total Cards</th>
							<th>PSA 10</th>
							<th>PSA 9</th>
							<th>PSA 8.5</th>
							<th>PSA 8</th>
							<th>PSA 7.5</th>
							<th>No Grade</th>
							<th>9 or Better</th>
							<th>Gem Rate</th>
						</tr>
					</thead>
				</table>
			</div>

			<div
				ref={tableScrollRef}
				className={styles.GemRateTable__table}
				onScroll={handleTableScroll}
			>
				<table>
					<tbody>
						{submissions.map((submission) => (
							<tr key={submission.id}>
								<td>
									<Link
										href={`/psa-submissions/${submission.submissionNumber}`}
									>
										{submission.submissionNumber}
									</Link>
								</td>
								<td>{formatShortDate(submission.receivedDate)}</td>
								<td>{submission.totalCards}</td>
								<td>{submission.psa10}</td>
								<td>{submission.psa9}</td>
								<td>{submission.psa85}</td>
								<td>{submission.psa8}</td>
								<td>{submission.psa75OrLess}</td>
								<td>{submission.noGrade}</td>
								<td>{submission.nineOrBetter.toFixed(1)}%</td>
								<td>{submission.gemRate.toFixed(1)}%</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
