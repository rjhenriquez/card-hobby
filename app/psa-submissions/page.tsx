import { GemRateTable } from "@/components/GemRateTable/GemRateTable";
import { HighlightCard } from "@/components/HighlightCard/HighlightCard";
import { Tabs } from "@/components/Tabs/Tabs";
import { getPsaGemRateRows } from "@/db/queries/psaGemRate";
import { getPsaSubmissions } from "@/db/queries/psaSubmissions";
import { getOverallPsaStats } from "@/lib/stats";
import Link from "next/link";

import styles from "@/styles/page/Page.module.scss";

interface PsaSubmissionsPageProps {
	searchParams: Promise<{
		tab?: string;
	}>;
}

export default async function PsaSubmissionsPage({
	searchParams,
}: PsaSubmissionsPageProps) {
	const { tab } = await searchParams;

	const submissions = await getPsaSubmissions();
	const gemRateSubmissions = await getPsaGemRateRows();

	const { gemRate, totalCards } = getOverallPsaStats(gemRateSubmissions);

	return (
		<div className={styles.Page}>
			<div className={styles.Page__header}>
				<h1 className={styles.Page__heading}>PSA Submissions</h1>
			</div>

			<section className={styles.Page__section}>
				<Tabs
					activeTab={tab ?? "submissions"}
					tabs={[
						{
							label: "Submissions",
							value: "submissions",
							children:
								submissions.length === 0 ? (
									<p>No PSA submissions yet.</p>
								) : (
									<table>
										<thead>
											<tr>
												<th>Submission #</th>
												<th>Stage</th>
												<th>Sent</th>
												<th>Received</th>
												<th>Completed</th>
											</tr>
										</thead>

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
													<td>{submission.stage ?? "—"}</td>
													<td>{submission.sentDate ?? "—"}</td>
													<td>{submission.receivedDate ?? "—"}</td>
													<td>{submission.completedDate ?? "—"}</td>
												</tr>
											))}
										</tbody>
									</table>
								),
						},
						{
							label: "Gem Rate",
							value: "gem-rate",
							children: (
								<>
									<HighlightCard
										highlightLabel='Gem Rate'
										highlightValue={`${gemRate.toFixed(1)}%`}
										subLabel='Total Cards'
										icon='diamond'
										subValue={totalCards}
									/>

									<GemRateTable submissions={gemRateSubmissions} />
								</>
							),
						},
					]}
				/>
			</section>
		</div>
	);
}
