import { Tabs, type TabSortOption } from "@/components/Tabs/Tabs";
import { PsaSubmission } from "@/components/PsaSubmission/PsaSubmission";
import { getCardsByPortfolio } from "@/db/queries/cards";
import { getPsaSubmissions } from "@/db/queries/psaSubmissions";
import {
	getCardsForPsaSubmission,
	getPsaSubmissionByNumber,
} from "@/db/queries/psaSubmissionCards";
import { getSubmissionDays } from "@/lib/psaSubmissions";

import styles from "@/styles/page/Page.module.scss";

const SORT_OPTIONS: TabSortOption[] = [
	{ label: "Most cards", value: "cards-desc" },
	{ label: "Fewest cards", value: "cards-asc" },
	{ label: "Most days", value: "days-desc" },
	{ label: "Fewest days", value: "days-asc" },
	{ label: "Highest acquisition costs", value: "cost-desc" },
	{ label: "Lowest acquisition costs", value: "cost-asc" },
];

interface PsaSubmissionsPageProps {
	searchParams: Promise<{
		tab?: string;
		sort?: string;
	}>;
}

export default async function PsaSubmissionsPage({
	searchParams,
}: PsaSubmissionsPageProps) {
	const { tab, sort } = await searchParams;
	const activeSort = SORT_OPTIONS.some((option) => option.value === sort)
		? sort
		: undefined;

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

	// No sort keeps the default order from getPsaSubmissions().
	if (activeSort) {
		const [field, direction] = activeSort.split("-");

		const getSortValue = (item: (typeof validSubmissions)[number]) => {
			if (field === "cards") return item.cards.length;
			if (field === "cost") return item.totalInvestment;
			return getSubmissionDays(
				item.submission.sentDate,
				item.submission.receivedDate,
			);
		};

		validSubmissions.sort((a, b) => {
			const aValue = getSortValue(a);
			const bValue = getSortValue(b);

			// Unsent submissions have no day count; keep them last either way.
			if (aValue === null) return bValue === null ? 0 : 1;
			if (bValue === null) return -1;

			return direction === "desc" ? bValue - aValue : aValue - bValue;
		});
	}

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
					(
						{
							submission,
							cards,
							sharedCost,
							totalSubmissionCost,
							totalInvestment,
							showStats,
						},
						index,
					) => {
						return (
							<PsaSubmission
								key={submission.id}
								submission={submission}
								cards={cards}
								sharedCost={sharedCost}
								totalSubmissionCost={totalSubmissionCost}
								totalInvestment={totalInvestment}
								showStats={showStats}
							/>
						);
					},
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
					sortOptions={SORT_OPTIONS}
					activeSort={activeSort}
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
