import { Tabs } from "@/components/Tabs/Tabs";
import { PsaSubmission } from "@/components/PsaSubmission/PsaSubmission";
import { getCardsByPortfolio } from "@/db/queries/cards";
import { getPsaSubmissions } from "@/db/queries/psaSubmissions";
import {
	getCardsForPsaSubmission,
	getPsaSubmissionByNumber,
} from "@/db/queries/psaSubmissionCards";

import styles from "@/styles/page/Page.module.scss";

interface PsaSubmissionsPageProps {
	searchParams: Promise<{
		tab?: string;
	}>;
}

export default async function PsaSubmissionsPage({
	searchParams,
}: PsaSubmissionsPageProps) {
	const { tab } = await searchParams;

	const [submissions, investmentCards] = await Promise.all([
		getPsaSubmissions(),
		getCardsByPortfolio("investment"),
	]);

	const submissionsWithCards = await Promise.all(
		submissions.map(async (submission) => {
			const fullSubmission = await getPsaSubmissionByNumber(
				submission.submissionNumber,
			);

			if (!fullSubmission) {
				return null;
			}

			const cards = await getCardsForPsaSubmission(fullSubmission.id);

			const sharedCost =
				cards.length > 0
					? (Number(fullSubmission.outboundShippingCost) +
							Number(fullSubmission.insuredReturnShippingCost)) /
						cards.length
					: 0;

			const totalSubmissionCost =
				cards.reduce((total, card) => {
					return (
						total + Number(card.baseGradingFee) + Number(card.gradingAdjustment)
					);
				}, 0) +
				Number(fullSubmission.outboundShippingCost) +
				Number(fullSubmission.insuredReturnShippingCost);

			const submissionInvestmentCards = investmentCards.filter((card) =>
				card.psaSubmissionNumbers.includes(fullSubmission.submissionNumber),
			);

			const cardsInvestment = submissionInvestmentCards.reduce(
				(total, card) => total + (card.totalCost ?? 0),
				0,
			);

			const totalInvestment = cardsInvestment + totalSubmissionCost;

			const hasGradedCards = cards.some(
				(card) =>
					card.gradeStatus === "graded" || card.gradeStatus === "no_grade",
			);

			const showStats = fullSubmission.isHistorical || hasGradedCards;

			return {
				submission: fullSubmission,
				cards,
				sharedCost,
				totalSubmissionCost,
				totalInvestment,
				showStats,
			};
		}),
	);

	const validSubmissions = submissionsWithCards.filter(
		(submission) => submission !== null,
	);

	const activeSubmissions = validSubmissions.filter(
		({ submission }) => submission.completedDate === null,
	);

	const completedSubmissions = validSubmissions.filter(
		({ submission }) => submission.completedDate !== null,
	);

	function renderSubmissions(
		submissionsToRender: typeof validSubmissions,
		emptyMessage: string,
	) {
		if (submissionsToRender.length === 0) {
			return <p>{emptyMessage}</p>;
		}

		return (
			<div className={styles.Page__content}>
				{submissionsToRender.map(
					({
						submission,
						cards,
						sharedCost,
						totalSubmissionCost,
						totalInvestment,
						showStats,
					}) => (
						<PsaSubmission
							key={submission.id}
							submission={submission}
							cards={cards}
							sharedCost={sharedCost}
							totalSubmissionCost={totalSubmissionCost}
							totalInvestment={totalInvestment}
							showStats={showStats}
						/>
					),
				)}
			</div>
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
							),
						},
					]}
				/>
			</section>
		</div>
	);
}
