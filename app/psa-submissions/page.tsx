import { getPsaSubmissions } from "@/db/queries/psaSubmissions";
import Link from "next/link";

export default async function PsaSubmissionsPage() {
	const submissions = await getPsaSubmissions();

	return (
		<div className='content'>
			<h1>PSA Submissions</h1>

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
		</div>
	);
}
