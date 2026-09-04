import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  cards,
  cardStatuses,
  psaSubmissionCards,
  psaSubmissions,
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
      status: cardStatuses.name,
    })
    .from(cards)
    .leftJoin(cardStatuses, eq(cards.statusId, cardStatuses.id))
    .where(eq(cards.portfolio, portfolio))
    .orderBy(desc(cards.createdAt));

  if (cardRows.length === 0) {
    return [];
  }

  const cardIds = cardRows.map((card) => card.id);

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
        isNull(psaSubmissions.completedDate),
      ),
    );

  const activePsaByCardId = new Map(
    activePsaRows.map((row) => [
      row.cardId,
      {
        stage: row.stage,
        submissionNumber: row.submissionNumber,
      },
    ]),
  );

  return cardRows.map((card) => {
    const activePsaSubmission = activePsaByCardId.get(card.id);

    return {
      ...card,
      status: card.status,

      effectiveStatus: activePsaSubmission
        ? `PSA Grading${
            activePsaSubmission.stage ? ` - ${activePsaSubmission.stage}` : ""
          }`
        : card.status,

      activePsaSubmissionNumber: activePsaSubmission?.submissionNumber ?? null,
    };
  });
}
