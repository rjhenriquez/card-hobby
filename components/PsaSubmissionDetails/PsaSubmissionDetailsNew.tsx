"use client";

import { PsaSubmissionFormNew } from "@/components/PsaSubmissionForm/PsaSubmissionFormNew";

interface PsaSubmission {
	id: number;
	submissionNumber: string;
	stage: string | null;
	sentDate: string | null;
	receivedDate: string | null;
	completedDate: string | null;
	outboundShippingCost: string;
	insuredReturnShippingCost: string;
}

interface PsaSubmissionDetailsNewProps {
	submission: PsaSubmission;
	totalSubmissionCost: number;
	isEditing: boolean;
	onEditingChange: (isEditing: boolean) => void;
}

export function PsaSubmissionDetailsNew({
	submission,
	totalSubmissionCost,
	isEditing,
	onEditingChange,
}: PsaSubmissionDetailsNewProps) {
	const isCompleted = submission.completedDate !== null;

	return (
		<div className='psaSubmissionNew'>
			<header className='psaSubmissionNew__header'>
				<div>
					<p className='psaSubmissionNew__eyebrow'>
						{isCompleted ? "Completed Submission" : "PSA Submission"}
					</p>

					<h2>Submission {submission.submissionNumber}</h2>

					<p>
						{isCompleted
							? "This submission has been completed."
							: "Track submission status, dates, and shipping costs."}
					</p>
				</div>

				{isCompleted && (
					<div className='psaSubmissionNew__actions'>
						<button type='button' onClick={() => onEditingChange(!isEditing)}>
							{isEditing ? "Cancel Editing" : "Edit Submission"}
						</button>
					</div>
				)}
			</header>

			<div className='psaSubmissionNew__summary'>
				<div>
					<p>Total Submission Cost</p>
					<strong>
						{`$${totalSubmissionCost.toLocaleString("en-US", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}`}
					</strong>
				</div>

				<div>
					<p>Stage</p>
					<strong>{submission.stage ?? "—"}</strong>
				</div>

				<div>
					<p>Status</p>
					<strong>{isCompleted ? "Completed" : "In Progress"}</strong>
				</div>
			</div>

			<div className='psaSubmissionNew__content'>
				<PsaSubmissionFormNew
					submission={submission}
					isEditing={isEditing}
					onSaved={() => {
						if (isCompleted) {
							onEditingChange(false);
						}
					}}
				/>
			</div>
		</div>
	);
}
