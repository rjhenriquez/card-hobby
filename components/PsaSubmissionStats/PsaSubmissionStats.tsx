import styles from "./PsaSubmissionStats.module.scss";
interface PsaSubmissionCard {
	grade: string | null;
	gradeStatus: "pending" | "graded" | "no_grade";
}

interface HistoricalPsaStats {
	totalCards: number | null;
	psa10: number | null;
	psa9: number | null;
	psa85: number | null;
	psa8: number | null;
	psa75OrLess: number | null;
	noGrade: number | null;
}

interface PsaSubmissionStatsProps {
	cards: PsaSubmissionCard[];
	isHistorical: boolean;
	historicalStats?: HistoricalPsaStats;
}

export function PsaSubmissionStats({
	cards,
	isHistorical,
	historicalStats,
}: PsaSubmissionStatsProps) {
	const gradedCards = cards.filter((card) => card.gradeStatus === "graded");

	const derivedPsa10 = gradedCards.filter(
		(card) => Number(card.grade) === 10,
	).length;

	const derivedPsa9 = gradedCards.filter(
		(card) => Number(card.grade) === 9,
	).length;

	const derivedPsa85 = gradedCards.filter(
		(card) => Number(card.grade) === 8.5,
	).length;

	const derivedPsa8 = gradedCards.filter(
		(card) => Number(card.grade) === 8,
	).length;

	const derivedPsa75OrLess = gradedCards.filter(
		(card) => Number(card.grade) <= 7.5,
	).length;

	const derivedNoGrade = cards.filter(
		(card) => card.gradeStatus === "no_grade",
	).length;

	const derivedTotalCards = cards.length;

	const totalCards = isHistorical
		? (historicalStats?.totalCards ?? 0)
		: derivedTotalCards;

	const psa10 = isHistorical ? (historicalStats?.psa10 ?? 0) : derivedPsa10;

	const psa9 = isHistorical ? (historicalStats?.psa9 ?? 0) : derivedPsa9;

	const psa85 = isHistorical ? (historicalStats?.psa85 ?? 0) : derivedPsa85;

	const psa8 = isHistorical ? (historicalStats?.psa8 ?? 0) : derivedPsa8;

	const psa75OrLess = isHistorical
		? (historicalStats?.psa75OrLess ?? 0)
		: derivedPsa75OrLess;

	const noGrade = isHistorical
		? (historicalStats?.noGrade ?? 0)
		: derivedNoGrade;

	const completedCards = psa10 + psa9 + psa85 + psa8 + psa75OrLess + noGrade;

	const gemRate = completedCards > 0 ? (psa10 / completedCards) * 100 : 0;

	const nineOrBetter =
		completedCards > 0 ? ((psa10 + psa9) / completedCards) * 100 : 0;

	return (
		<div className={styles.PsaSubmissionStats}>
			<h2 className={styles.PsaSubmissionStats__heading}>Grading Summary</h2>
			<dl className={styles["PsaSubmissionStats__description-list"]}>
				<div
					className={styles["PsaSubmissionStats__description-list__wrapper"]}
				>
					<dt>Total Cards</dt>
					<dd>{totalCards}</dd>
				</div>

				<div
					className={styles["PsaSubmissionStats__description-list__wrapper"]}
				>
					<dt>Completed</dt>
					<dd>{completedCards}</dd>
				</div>

				<div
					className={styles["PsaSubmissionStats__description-list__wrapper"]}
				>
					<dt>PSA 10</dt>
					<dd>{psa10}</dd>
				</div>

				<div
					className={styles["PsaSubmissionStats__description-list__wrapper"]}
				>
					<dt>PSA 9</dt>
					<dd>{psa9}</dd>
				</div>

				<div
					className={styles["PsaSubmissionStats__description-list__wrapper"]}
				>
					<dt>PSA 8.5</dt>
					<dd>{psa85}</dd>
				</div>

				<div
					className={styles["PsaSubmissionStats__description-list__wrapper"]}
				>
					<dt>PSA 8</dt>
					<dd>{psa8}</dd>
				</div>

				<div
					className={styles["PsaSubmissionStats__description-list__wrapper"]}
				>
					<dt>PSA 7.5 or Less</dt>
					<dd>{psa75OrLess}</dd>
				</div>

				<div
					className={styles["PsaSubmissionStats__description-list__wrapper"]}
				>
					<dt>No Grade</dt>
					<dd>{noGrade}</dd>
				</div>

				<div
					className={styles["PsaSubmissionStats__description-list__wrapper"]}
				>
					<dt>Mint Rate</dt>
					<dd>{nineOrBetter.toFixed(1)}%</dd>
				</div>
				<div
					className={styles["PsaSubmissionStats__description-list__wrapper"]}
				>
					<dt>Gem Rate</dt>
					<dd>{gemRate.toFixed(1)}%</dd>
				</div>
			</dl>
		</div>
	);
}
