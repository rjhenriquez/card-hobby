"use client";

import { PsaSubmissionForm } from "@/components/PsaSubmissionForm/PsaSubmissionForm";
import { Button } from "@/components/Button/Button";

import styles from "./PsaSubmissionDetails.module.scss";

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

interface PsaSubmissionDetailsProps {
	submission: PsaSubmission;
	totalSubmissionCost: number;
	isEditing: boolean;
	onEditingChange: (isEditing: boolean) => void;
}

export function PsaSubmissionDetails({
	submission,
	totalSubmissionCost,
	isEditing,
	onEditingChange,
}: PsaSubmissionDetailsProps) {
	const isCompleted = submission.completedDate !== null;

	return (
		<div className={styles.PsaSubmissionDetails}>
			<div className={styles.PsaSubmissionDetails__top}>
				{isCompleted && (
					<Button
						type='main'
						variant='cancel'
						htmlType='button'
						leadingIcon='edit'
						className={styles["PsaSubmissionDetails__edit-btn"]}
						label={isEditing ? "Cancel Editing" : "Edit Submission"}
						onClick={() => onEditingChange(!isEditing)}
					/>
				)}

				<PsaSubmissionForm
					submission={submission}
					isEditing={isEditing}
					onSaved={() => {
						if (isCompleted) {
							onEditingChange(false);
						}
					}}
				/>

				<div className={styles.PsaSubmissionDetails__info}>
					<p className={styles.PsaSubmissionDetails__info__label}>
						Total Submission Cost:
					</p>
					<p className={styles.PsaSubmissionDetails__info__value}>
						{`$${totalSubmissionCost.toLocaleString("en-US", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}`}
					</p>
				</div>
			</div>
		</div>
	);
}
