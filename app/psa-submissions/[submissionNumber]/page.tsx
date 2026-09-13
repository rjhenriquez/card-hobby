import { notFound } from "next/navigation";
import { PsaSubmissionStats } from "@/components/PsaSubmissionStats/PsaSubmissionStats";
import { PsaSubmissionDetails } from "@/components/PsaSubmissionDetails/PsaSubmissionDetails";
import {
	getCardsForPsaSubmission,
	getPsaSubmissionByNumber,
} from "@/db/queries/psaSubmissionCards";

import styles from "@/styles/page/Page.module.scss";
interface PsaSubmissionPageProps {
	params: Promise<{
		submissionNumber: string;
	}>;
}

export default async function PsaSubmissionPage({
	params,
}: PsaSubmissionPageProps) {
	const { submissionNumber } = await params;

	const submission = await getPsaSubmissionByNumber(submissionNumber);

	if (!submission) {
		notFound();
	}

	const cards = await getCardsForPsaSubmission(submission.id);
	const isCompleted = submission.completedDate !== null;

	const sharedCost =
		cards.length > 0
			? (Number(submission.outboundShippingCost) +
					Number(submission.insuredReturnShippingCost)) /
				cards.length
			: 0;
	const totalSubmissionCost =
		cards.reduce((total, card) => {
			return (
				total + Number(card.baseGradingFee) + Number(card.gradingAdjustment)
			);
		}, 0) +
		Number(submission.outboundShippingCost) +
		Number(submission.insuredReturnShippingCost);
	return (
		<div className={styles.Page}>
			<div className={styles.Page__header}>
				<h1 className={styles.Page__heading}>
					PSA Submission {submission.submissionNumber}
				</h1>
			</div>
			<section className={styles.Page__section}>
				<PsaSubmissionDetails
					submission={submission}
					cards={cards}
					sharedCost={sharedCost}
					totalSubmissionCost={totalSubmissionCost}
				/>
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
			</section>
		</div>
	);
}
