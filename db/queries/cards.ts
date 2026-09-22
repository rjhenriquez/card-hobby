import { and, desc, eq, inArray, isNotNull, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import {
	cards,
	cardStatuses,
	psaSubmissionCards,
	psaSubmissions,
	purchasePackageCards,
	purchasePackages,
} from "@/db/schema";

export type CardPortfolio = "investment" | "collection";

export async function getCardsByPortfolio(portfolio: CardPortfolio) {
	const cardRows = await db
		.select({
			id: cards.id,
			player: cards.player,
			category: cards.category,
			year: cards.year,
			setName: cards.setName,
			info: cards.info,
			notes: cards.notes,
			portfolio: cards.portfolio,
			acquisitionType: cards.acquisitionType,
			purchaseDate: cards.purchaseDate,
			purchasedFrom: cards.purchasedFrom,
			ebaySeller: cards.ebaySeller,
			purchasePrice: cards.purchasePrice,
			historicalGradingCost: cards.historicalGradingCost,
			grade: cards.grade,
			soldVia: cards.soldVia,
			soldDate: cards.soldDate,
			soldPrice: cards.soldPrice,
			isPaid: cards.isPaid,
			status: cardStatuses.name,
			isShared: cards.isShared,
		})
		.from(cards)
		.leftJoin(cardStatuses, eq(cards.statusId, cardStatuses.id))
		.where(eq(cards.portfolio, portfolio))
		.orderBy(desc(cards.createdAt));

	if (cardRows.length === 0) {
		return [];
	}

	const cardIds = cardRows.map((card) => card.id);

	// ---------------------------------------------
	// Purchase Packages
	// ---------------------------------------------
	// Package cards derive their acquisition cost from:
	//
	// hammer price
	// + proportional tax
	// + equal share of shipping.

	const purchasePackageRows = await db
		.select({
			cardId: purchasePackageCards.cardId,
			purchasePackageId: purchasePackageCards.purchasePackageId,
			hammerPrice: purchasePackageCards.hammerPrice,
			itemsSubtotal: purchasePackages.itemsSubtotal,
			shippingTotal: purchasePackages.shippingTotal,
			taxesTotal: purchasePackages.taxesTotal,
		})
		.from(purchasePackageCards)
		.innerJoin(
			purchasePackages,
			eq(purchasePackages.id, purchasePackageCards.purchasePackageId),
		)
		.where(inArray(purchasePackageCards.cardId, cardIds));

	// ---------------------------------------------
	// Purchase Package Card Counts
	// ---------------------------------------------
	// Shipping is distributed evenly across every
	// card attached to the package.

	const purchasePackageIds = [
		...new Set(purchasePackageRows.map((row) => row.purchasePackageId)),
	];

	const purchasePackageCardCounts = new Map<number, number>();

	if (purchasePackageIds.length > 0) {
		const packageCardRows = await db
			.select({
				purchasePackageId: purchasePackageCards.purchasePackageId,
			})
			.from(purchasePackageCards)
			.where(
				inArray(purchasePackageCards.purchasePackageId, purchasePackageIds),
			);

		for (const row of packageCardRows) {
			purchasePackageCardCounts.set(
				row.purchasePackageId,
				(purchasePackageCardCounts.get(row.purchasePackageId) ?? 0) + 1,
			);
		}
	}

	// ---------------------------------------------
	// Acquisition Cost Per Package Card
	// ---------------------------------------------

	const acquisitionCostByCardId = new Map<number, number>();

	for (const row of purchasePackageRows) {
		const itemCount = purchasePackageCardCounts.get(row.purchasePackageId) ?? 0;

		const hammerPrice = Number(row.hammerPrice);
		const itemsSubtotal = Number(row.itemsSubtotal);
		const shippingTotal = Number(row.shippingTotal);
		const taxesTotal = Number(row.taxesTotal);

		const allocatedTax =
			itemsSubtotal > 0 ? (hammerPrice * taxesTotal) / itemsSubtotal : 0;

		const allocatedShipping = itemCount > 0 ? shippingTotal / itemCount : 0;

		const acquisitionCost = hammerPrice + allocatedTax + allocatedShipping;

		acquisitionCostByCardId.set(row.cardId, acquisitionCost);
	}

	// ---------------------------------------------
	// Active PSA Submissions
	// ---------------------------------------------
	// Only non-historical, incomplete submissions
	// control the card's effective status.

	const activePsaRows = await db
		.select({
			cardId: psaSubmissionCards.cardId,
			stage: psaSubmissions.stage,
			submissionNumber: psaSubmissions.submissionNumber,
		})
		.from(psaSubmissionCards)
		.innerJoin(
			psaSubmissions,
			eq(psaSubmissions.id, psaSubmissionCards.submissionId),
		)
		.where(
			and(
				inArray(psaSubmissionCards.cardId, cardIds),
				eq(psaSubmissions.isHistorical, false),
				isNull(psaSubmissions.completedDate),
			),
		);

	// ---------------------------------------------
	// PSA Submission History
	// ---------------------------------------------
	// Includes both active and completed submissions,
	// including historical submissions.

	const psaHistoryRows = await db
		.select({
			cardId: psaSubmissionCards.cardId,
			submissionNumber: psaSubmissions.submissionNumber,
			grade: psaSubmissionCards.grade,
			gradeStatus: psaSubmissionCards.gradeStatus,
			completedDate: psaSubmissions.completedDate,
		})
		.from(psaSubmissionCards)
		.innerJoin(
			psaSubmissions,
			eq(psaSubmissions.id, psaSubmissionCards.submissionId),
		)
		.where(inArray(psaSubmissionCards.cardId, cardIds));

	// ---------------------------------------------
	// Finalized PSA Grading Costs
	// ---------------------------------------------
	// Normal submissions contribute once completed.
	// Historical submissions always contribute because
	// their imported card-level grading data is finalized.

	const gradingRows = await db
		.select({
			cardId: psaSubmissionCards.cardId,
			submissionId: psaSubmissionCards.submissionId,
			baseGradingFee: psaSubmissionCards.baseGradingFee,
			gradingAdjustment: psaSubmissionCards.gradingAdjustment,
			outboundShippingCost: psaSubmissions.outboundShippingCost,
			insuredReturnShippingCost: psaSubmissions.insuredReturnShippingCost,
			isHistorical: psaSubmissions.isHistorical,
		})
		.from(psaSubmissionCards)
		.innerJoin(
			psaSubmissions,
			eq(psaSubmissions.id, psaSubmissionCards.submissionId),
		)
		.where(
			and(
				inArray(psaSubmissionCards.cardId, cardIds),
				or(
					isNotNull(psaSubmissions.completedDate),
					eq(psaSubmissions.isHistorical, true),
				),
			),
		);

	// ---------------------------------------------
	// Submission Card Counts
	// ---------------------------------------------
	// Needed to distribute shared submission costs
	// evenly across every card in a normal submission.
	//
	// Historical submissions may have incomplete card
	// membership, so shared costs are not distributed
	// from those imported relationships.

	const submissionIds = [
		...new Set(
			gradingRows
				.filter((row) => !row.isHistorical)
				.map((row) => row.submissionId),
		),
	];

	const submissionCardCounts = new Map<number, number>();

	if (submissionIds.length > 0) {
		const submissionCardRows = await db
			.select({
				submissionId: psaSubmissionCards.submissionId,
			})
			.from(psaSubmissionCards)
			.where(inArray(psaSubmissionCards.submissionId, submissionIds));

		for (const row of submissionCardRows) {
			submissionCardCounts.set(
				row.submissionId,
				(submissionCardCounts.get(row.submissionId) ?? 0) + 1,
			);
		}
	}

	// ---------------------------------------------
	// Grading Cost Per Card
	// ---------------------------------------------

	const gradingCostByCardId = new Map<number, number>();

	for (const row of gradingRows) {
		const cardCount = submissionCardCounts.get(row.submissionId) ?? 0;

		const sharedCost =
			!row.isHistorical && cardCount > 0
				? (Number(row.outboundShippingCost) +
						Number(row.insuredReturnShippingCost)) /
					cardCount
				: 0;

		const gradingCost =
			Number(row.baseGradingFee) + Number(row.gradingAdjustment) + sharedCost;

		gradingCostByCardId.set(
			row.cardId,
			(gradingCostByCardId.get(row.cardId) ?? 0) + gradingCost,
		);
	}

	// ---------------------------------------------
	// Active PSA Submission By Card
	// ---------------------------------------------

	const activePsaByCardId = new Map(
		activePsaRows.map((row) => [
			row.cardId,
			{
				stage: row.stage,
				submissionNumber: row.submissionNumber,
			},
		]),
	);

	// ---------------------------------------------
	// PSA Submission History By Card
	// ---------------------------------------------

	const psaSubmissionNumbersByCardId = new Map<number, string[]>();

	for (const row of psaHistoryRows) {
		const existing = psaSubmissionNumbersByCardId.get(row.cardId) ?? [];

		psaSubmissionNumbersByCardId.set(row.cardId, [
			...existing,
			row.submissionNumber,
		]);
	}
	// ---------------------------------------------

	// PSA Grade By Card

	// ---------------------------------------------

	const psaGradeByCardId = new Map<number, number>();

	for (const row of psaHistoryRows) {
		if (row.gradeStatus !== "graded" || row.grade === null) {
			continue;
		}
		psaGradeByCardId.set(row.cardId, Number(row.grade));
	}
	// ---------------------------------------------
	// Final Card Read Model
	// ---------------------------------------------

	return cardRows.map((card) => {
		const activePsaSubmission = activePsaByCardId.get(card.id);
		const effectiveGrade =
			psaGradeByCardId.get(card.id) ??
			(card.grade !== null ? Number(card.grade) : null);
		const gradingCost =
			gradingCostByCardId.get(card.id) ??
			Number(card.historicalGradingCost ?? 0);

		const packageAcquisitionCost = acquisitionCostByCardId.get(card.id);

		// Purchased cards can get their acquisition cost
		// from either a purchase package or their ordinary
		// individual purchase price.
		//
		// Pulled cards intentionally remain unknown.

		const price =
			card.acquisitionType === "purchased"
				? (packageAcquisitionCost ??
					(card.purchasePrice !== null ? Number(card.purchasePrice) : null))
				: null;

		const totalCost = price !== null ? price + gradingCost : null;

		const soldPrice = card.soldPrice !== null ? Number(card.soldPrice) : null;

		const profit =
			soldPrice !== null && totalCost !== null ? soldPrice - totalCost : null;

		const roi =
			profit !== null && totalCost !== null && totalCost > 0
				? (profit / totalCost) * 100
				: null;

		return {
			...card,

			effectiveStatus: activePsaSubmission
				? `PSA Grading${
						activePsaSubmission.stage ? ` - ${activePsaSubmission.stage}` : ""
					}`
				: card.status,
			psaSubmissionNumbers: psaSubmissionNumbersByCardId.get(card.id) ?? [],
			grade: effectiveGrade,
			price,
			gradingCost,
			totalCost,
			profit,
			roi,
		};
	});
}
