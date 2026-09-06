import { notFound } from "next/navigation";
import { PsaSubmissionStats } from "@/components/PsaSubmissionStats/PsaSubmissionStats";
import { PsaSubmissionDetails } from "@/components/PsaSubmissionDetails/PsaSubmissionDetails";
import {
	getCardsForPsaSubmission,
	getPsaSubmissionByNumber,
} from "@/db/queries/psaSubmissionCards";

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
		<main>
			<h1>PSA Submission {submission.submissionNumber}</h1>

			<PsaSubmissionDetails
				submission={submission}
				cards={cards}
				sharedCost={sharedCost}
				totalSubmissionCost={totalSubmissionCost}
			/>
			<PsaSubmissionStats cards={cards} />
		</main>
	);
}
