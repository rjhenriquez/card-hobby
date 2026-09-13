import { getPsaSubmissions } from "@/db/queries/psaSubmissions";
import Link from "next/link";

import styles from "@/styles/page/Page.module.scss";

export default async function PsaSubmissionsPage() {
	const submissions = await getPsaSubmissions();

	return (
		<div className={styles.Page}>
			<div className={styles.Page__header}>
				<h1 className={styles.Page__heading}>PSA Submissions</h1>
			</div>
			<section className={styles.Page__section}>
				{submissions.length === 0 ? (
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
				)}
			</section>
		</div>
	);
}
