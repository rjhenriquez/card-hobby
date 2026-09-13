import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
	cards,
	cardStatuses,
	psaSubmissionCards,
	psaSubmissions,
} from "@/db/schema";

export async function getPsaSubmissionByNumber(submissionNumber: string) {
	const [submission] = await db
		.select({
			id: psaSubmissions.id,
			submissionNumber: psaSubmissions.submissionNumber,
			stage: psaSubmissions.stage,
			sentDate: psaSubmissions.sentDate,
			receivedDate: psaSubmissions.receivedDate,
			completedDate: psaSubmissions.completedDate,
			outboundShippingCost: psaSubmissions.outboundShippingCost,
			insuredReturnShippingCost: psaSubmissions.insuredReturnShippingCost,
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
		.where(eq(psaSubmissions.submissionNumber, submissionNumber));

	return submission ?? null;
}

export async function getCardsForPsaSubmission(submissionId: number) {
	return db
		.select({
			submissionCardId: psaSubmissionCards.id,
			cardId: cards.id,
			player: cards.player,
			category: cards.category,
			year: cards.year,
			setName: cards.setName,
			info: cards.info,
			status: cardStatuses.name,
			baseGradingFee: psaSubmissionCards.baseGradingFee,
			gradingAdjustment: psaSubmissionCards.gradingAdjustment,
			grade: psaSubmissionCards.grade,
			gradeStatus: psaSubmissionCards.gradeStatus,
		})
		.from(psaSubmissionCards)
		.innerJoin(cards, eq(psaSubmissionCards.cardId, cards.id))
		.leftJoin(cardStatuses, eq(cards.statusId, cardStatuses.id))
		.where(eq(psaSubmissionCards.submissionId, submissionId));
}
