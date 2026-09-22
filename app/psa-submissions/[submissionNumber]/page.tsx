import { notFound } from "next/navigation";
import { PsaSubmissionContent } from "@/components/PsaSubmissionContent/PsaSubmissionContent";
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

	const hasGradedCards = cards.some(
		(card) => card.gradeStatus === "graded" || card.gradeStatus === "no_grade",
	);

	const showStats = submission.isHistorical || hasGradedCards;

	return (
		<div className={styles.Page}>
			<div className={styles.Page__header}>
				<h1 className={styles.Page__heading}>PSA Submission</h1>
			</div>

			<section className={styles.Page__section}>
				<PsaSubmissionContent
					submission={submission}
					cards={cards}
					sharedCost={sharedCost}
					totalSubmissionCost={totalSubmissionCost}
					showStats={showStats}
				/>
			</section>
		</div>
	);
}
