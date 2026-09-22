import { Tabs } from "@/components/Tabs/Tabs";
import { getPsaSubmissions } from "@/db/queries/psaSubmissions";
import Link from "next/link";

import styles from "@/styles/page/Page.module.scss";
import psaSubTableStyles from "@/styles/components/PSASubTable.module.scss";

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

	const activeSubmissions = submissions.filter(
		(submission) => submission.completedDate === null,
	);

	const completedSubmissions = submissions.filter(
		(submission) => submission.completedDate !== null,
	);

	function renderSubmissions(
		submissionsToRender: typeof submissions,
		emptyMessage: string,
		isCompleted = false,
	) {
		if (submissionsToRender.length === 0) {
			return <p>{emptyMessage}</p>;
		}

		return (
			<table className={psaSubTableStyles.PSASubsTable}>
				<thead>
					<tr>
						<th>Submission #</th>
						<th>Stage</th>
						<th>Sent</th>
						<th>Received</th>
					</tr>
				</thead>

				<tbody>
					{submissionsToRender.map((submission) => (
						<tr key={submission.id}>
							<td>
								<Link
									href={`/psa-submissions/${submission.submissionNumber}`}
									className={psaSubTableStyles.PSASubsTable__link}
								>
									{submission.submissionNumber}
								</Link>
							</td>
							<td>{isCompleted ? "Completed" : (submission.stage ?? "—")}</td>
							<td>{submission.sentDate ?? "—"}</td>
							<td>{submission.receivedDate ?? "—"}</td>
						</tr>
					))}
				</tbody>
			</table>
		);
	}

	return (
		<div className={styles.Page}>
			<div className={styles.Page__header}>
				<h1 className={styles.Page__heading}>PSA Submissions</h1>
			</div>

			<section className={styles.Page__section}>
				<Tabs
					activeTab={tab ?? "active"}
					tabs={[
						{
							label: "Active",
							value: "active",
							children: renderSubmissions(
								activeSubmissions,
								"No active PSA submissions.",
							),
						},
						{
							label: "Completed",
							value: "completed",
							children: renderSubmissions(
								completedSubmissions,
								"No completed PSA submissions.",
								true,
							),
						},
					]}
				/>
			</section>
		</div>
	);
}
