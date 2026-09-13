import { asc } from "drizzle-orm";
import { db } from "@/db";
import { psaSubmissionCards, psaSubmissions } from "@/db/schema";

export interface PsaGemRateRow {
	id: number;
	submissionNumber: string;
	receivedDate: string | null;
	totalCards: number;
	psa10: number;
	psa9: number;
	psa85: number;
	psa8: number;
	psa75OrLess: number;
	noGrade: number;
	gemRate: number;
	nineOrBetter: number;
	isHistorical: boolean;
}

export async function getPsaGemRateRows(): Promise<PsaGemRateRow[]> {
	const submissions = await db
		.select({
			id: psaSubmissions.id,
			submissionNumber: psaSubmissions.submissionNumber,
			receivedDate: psaSubmissions.receivedDate,

			isHistorical: psaSubmissions.isHistorical,

			historicalTotalCards: psaSubmissions.historicalTotalCards,
			historicalPsa10: psaSubmissions.historicalPsa10,
			historicalPsa9: psaSubmissions.historicalPsa9,
			historicalPsa85: psaSubmissions.historicalPsa85,
			historicalPsa8: psaSubmissions.historicalPsa8,
			historicalPsa75OrLess: psaSubmissions.historicalPsa75OrLess,
			historicalNoGrade: psaSubmissions.historicalNoGrade,
		})
		.from(psaSubmissions)
		.orderBy(
			asc(psaSubmissions.receivedDate),
			asc(psaSubmissions.submissionNumber),
		);

	const submissionCards = await db
		.select({
			submissionId: psaSubmissionCards.submissionId,
			grade: psaSubmissionCards.grade,
			gradeStatus: psaSubmissionCards.gradeStatus,
		})
		.from(psaSubmissionCards);

	return submissions.map((submission) => {
		const cards = submissionCards.filter(
			(card) => card.submissionId === submission.id,
		);

		let totalCards = 0;
		let psa10 = 0;
		let psa9 = 0;
		let psa85 = 0;
		let psa8 = 0;
		let psa75OrLess = 0;
		let noGrade = 0;

		if (submission.isHistorical) {
			totalCards = submission.historicalTotalCards ?? 0;
			psa10 = submission.historicalPsa10 ?? 0;
			psa9 = submission.historicalPsa9 ?? 0;
			psa85 = submission.historicalPsa85 ?? 0;
			psa8 = submission.historicalPsa8 ?? 0;
			psa75OrLess = submission.historicalPsa75OrLess ?? 0;
			noGrade = submission.historicalNoGrade ?? 0;
		} else {
			const gradedCards = cards.filter((card) => card.gradeStatus === "graded");

			totalCards = cards.length;

			psa10 = gradedCards.filter((card) => Number(card.grade) === 10).length;

			psa9 = gradedCards.filter((card) => Number(card.grade) === 9).length;

			psa85 = gradedCards.filter((card) => Number(card.grade) === 8.5).length;

			psa8 = gradedCards.filter((card) => Number(card.grade) === 8).length;

			psa75OrLess = gradedCards.filter(
				(card) => Number(card.grade) <= 7.5,
			).length;

			noGrade = cards.filter((card) => card.gradeStatus === "no_grade").length;
		}

		const gradedTotal = psa10 + psa9 + psa85 + psa8 + psa75OrLess;

		const gemRate = gradedTotal > 0 ? (psa10 / gradedTotal) * 100 : 0;

		const nineOrBetter =
			gradedTotal > 0 ? ((psa10 + psa9) / gradedTotal) * 100 : 0;

		return {
			id: submission.id,
			submissionNumber: submission.submissionNumber,
			receivedDate: submission.receivedDate,

			totalCards,
			psa10,
			psa9,
			psa85,
			psa8,
			psa75OrLess,
			noGrade,

			gemRate,
			nineOrBetter,

			isHistorical: submission.isHistorical,
		};
	});
}
