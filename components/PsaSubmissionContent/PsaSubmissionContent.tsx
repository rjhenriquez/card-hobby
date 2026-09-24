"use client";

import { useState } from "react";
import { PsaSubmissionDetailsNew } from "@/components/PsaSubmissionDetails/PsaSubmissionDetailsNew";
import { PsaSubmissionStats } from "@/components/PsaSubmissionStats/PsaSubmissionStats";
import { PsaSubmissionCardRow } from "@/components/PsaSubmissionCardRow/PsaSubmissionCardRow";
import { TableInfo } from "@/components/TableInfo/TableInfo";
import { Accordion } from "@/components/Accordion/Accordion";

import styles from "./PsaSubmissionContent.module.scss";

interface PsaSubmission {
	id: number;
	submissionNumber: string;
	stage: string | null;
	sentDate: string | null;
	receivedDate: string | null;
	completedDate: string | null;
	outboundShippingCost: string;
	insuredReturnShippingCost: string;
	isHistorical: boolean;
	historicalTotalCards: number | null;
	historicalPsa10: number | null;
	historicalPsa9: number | null;
	historicalPsa85: number | null;
	historicalPsa8: number | null;
	historicalPsa75OrLess: number | null;
	historicalNoGrade: number | null;
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

interface PsaSubmissionContentProps {
	submission: PsaSubmission;
	cards: PsaSubmissionCard[];
	sharedCost: number;
	totalSubmissionCost: number;
	showStats: boolean;
}

export function PsaSubmissionContent({
	submission,
	cards,
	sharedCost,
	totalSubmissionCost,
	showStats,
}: PsaSubmissionContentProps) {
	const isCompleted = submission.completedDate !== null;
	const [isEditing, setIsEditing] = useState(!isCompleted);

	return (
		<div className={styles.PsaSubmissionContent}>
			<PsaSubmissionDetailsNew
				submission={submission}
				totalSubmissionCost={totalSubmissionCost}
				isEditing={isEditing}
				onEditingChange={setIsEditing}
			/>
			{showStats && (
				<PsaSubmissionStats
					cards={cards}
					isHistorical={submission.isHistorical}
					historicalStats={{
						totalCards: submission.historicalTotalCards,
						psa10: submission.historicalPsa10,
						psa9: submission.historicalPsa9,
						psa85: submission.historicalPsa85,
						psa8: submission.historicalPsa8,
						psa75OrLess: submission.historicalPsa75OrLess,
						noGrade: submission.historicalNoGrade,
					}}
				/>
			)}
			{cards.length === 0 ? (
				<p>No cards in this submission.</p>
			) : (
				<Accordion
					icon='arrow-down'
					label='Show Cards'
					defaultOpen={true}
					className={styles.PsaSubmissionContent__accordion}
				>
					<TableInfo
						headers={[
							"Card",
							"Base Fee",
							"Adjustment",
							"Shared Cost",
							"Grading Cost",
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
		</div>
	);
}
