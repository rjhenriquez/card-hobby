"use client";

import { useState } from "react";
import { PsaSubmissionForm } from "@/components/PsaSubmissionForm/PsaSubmissionForm";
import { PsaSubmissionCardRow } from "@/components/PsaSubmissionCardRow/PsaSubmissionCardRow";
import styles from "./PsaSubmissionDetails.module.scss";
import { TableInfo } from "@/components/TableInfo/TableInfo";
import { Accordion } from "@/components/Accordion/Accordion";
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

interface PsaSubmissionCard {
	submissionCardId: number;
	player: string;
	year: string | null;
	setName: string | null;
	info: string | null;
	baseGradingFee: string;
	gradingAdjustment: string;
	grade: string | null;
	gradeStatus: "pending" | "graded" | "no_grade";
}

interface PsaSubmissionDetailsProps {
	submission: PsaSubmission;
	cards: PsaSubmissionCard[];
	sharedCost: number;
	totalSubmissionCost: number;
}

export function PsaSubmissionDetails({
	submission,
	cards,
	sharedCost,
	totalSubmissionCost,
}: PsaSubmissionDetailsProps) {
	const isCompleted = submission.completedDate !== null;
	const [isEditing, setIsEditing] = useState(!isCompleted);

	return (
		<>
			{isCompleted && (
				<button
					type='button'
					onClick={() => setIsEditing((current) => !current)}
				>
					{isEditing ? "Cancel Editing" : "Edit Submission"}
				</button>
			)}

			<PsaSubmissionForm
				submission={submission}
				isEditing={isEditing}
				onSaved={() => {
					if (isCompleted) {
						setIsEditing(false);
					}
				}}
			/>

			<p className={styles.PsaSubmissionDetails__info}>
				<strong>Total Submission Cost:</strong>{" "}
				{`$${totalSubmissionCost.toLocaleString("en-US", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				})}`}
			</p>

			<section className={styles.PsaSubmissionDetails}>
				<h2>Cards</h2>

				{cards.length === 0 ? (
					<p>No cards in this submission.</p>
				) : (
					<Accordion icon='arrow-down' label='Show Cards' defaultOpen={true}>
						<TableInfo
							headers={[
								"Card",
								"Base Fee",
								"Shared Cost",
								"Adjustment",
								"Total Grading Cost",
								"Grade",
								"",
							]}
						>
							{cards.map((card) => (
								<PsaSubmissionCardRow
									key={card.submissionCardId}
									card={card}
									submissionNumber={submission.submissionNumber}
									sharedCost={sharedCost}
									isCompleted={isCompleted}
									isEditing={isEditing}
								/>
							))}
						</TableInfo>
					</Accordion>
				)}
			</section>
		</>
	);
}
