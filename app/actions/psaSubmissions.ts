"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { and, eq, inArray, isNull, ne } from "drizzle-orm";
import { psaSubmissionCards, psaSubmissions } from "@/db/schema";

export async function createPsaSubmission(
  submissionNumber: string,
  cardIds: number[],
) {
  const trimmedSubmissionNumber = submissionNumber.trim();

  if (!trimmedSubmissionNumber) {
    throw new Error("Submission number is required");
  }

  if (cardIds.length === 0) {
    throw new Error("At least one card is required");
  }

  await validateCardsAreNotInActiveSubmission(cardIds);

  const [submission] = await db
    .insert(psaSubmissions)
    .values({
      submissionNumber: trimmedSubmissionNumber,
    })
    .returning({
      id: psaSubmissions.id,
    });

  await db.insert(psaSubmissionCards).values(
    cardIds.map((cardId) => ({
      submissionId: submission.id,
      cardId,
    })),
  );

  revalidatePath("/investment");
  revalidatePath("/collection");
}

export async function addCardsToPsaSubmission(
  submissionId: number,
  cardIds: number[],
) {
  if (!Number.isInteger(submissionId)) {
    throw new Error("Invalid submission ID");
  }

  if (cardIds.length === 0) {
    throw new Error("At least one card is required");
  }

  await validateCardsAreNotInActiveSubmission(cardIds, submissionId);

  await db
    .insert(psaSubmissionCards)
    .values(
      cardIds.map((cardId) => ({
        submissionId,
        cardId,
      })),
    )
    .onConflictDoNothing();

  revalidatePath("/investment");
  revalidatePath("/collection");
}

export async function updatePsaSubmission(formData: FormData) {
  const idValue = formData.get("id");
  const id = typeof idValue === "string" ? Number(idValue) : NaN;

  if (!Number.isInteger(id)) {
    throw new Error("Invalid submission ID");
  }

  await db
    .update(psaSubmissions)
    .set({
      stage: getOptionalString(formData, "stage"),
      sentDate: getOptionalString(formData, "sentDate"),
      receivedDate: getOptionalString(formData, "receivedDate"),
      completedDate: getOptionalString(formData, "completedDate"),
      shippingCost: getOptionalString(formData, "shippingCost") ?? "0",
      insuranceCost: getOptionalString(formData, "insuranceCost") ?? "0",
      totalAmountCharged: getOptionalString(formData, "totalAmountCharged"),
      updatedAt: new Date(),
    })
    .where(eq(psaSubmissions.id, id));

  revalidatePath("/psa-submissions");
  revalidatePath(`/psa-submissions/${id}`);
  revalidatePath("/investment");
  revalidatePath("/collection");
}
export async function updatePsaSubmissionCard(formData: FormData) {
  const submissionCardIdValue = formData.get("submissionCardId");
  const submissionNumber = formData.get("submissionNumber");

  const submissionCardId =
    typeof submissionCardIdValue === "string"
      ? Number(submissionCardIdValue)
      : NaN;

  if (!Number.isInteger(submissionCardId)) {
    throw new Error("Invalid submission card ID");
  }

  if (typeof submissionNumber !== "string" || !submissionNumber.trim()) {
    throw new Error("Invalid submission number");
  }

  await db
    .update(psaSubmissionCards)
    .set({
      baseGradingFee: getOptionalString(formData, "baseGradingFee") ?? "0",
      gradingAdjustment:
        getOptionalString(formData, "gradingAdjustment") ?? "0",
      gradeStatus:
        formData.get("gradeStatus") === "graded"
          ? "graded"
          : formData.get("gradeStatus") === "no_grade"
            ? "no_grade"
            : "pending",
      grade:
        formData.get("gradeStatus") === "graded"
          ? getOptionalString(formData, "grade")
          : null,
    })
    .where(eq(psaSubmissionCards.id, submissionCardId));

  revalidatePath(`/psa-submissions/${submissionNumber}`);
}

function getOptionalString(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue || null;
}
async function validateCardsAreNotInActiveSubmission(
  cardIds: number[],
  excludeSubmissionId?: number,
) {
  if (cardIds.length === 0) {
    return;
  }

  const conditions = [
    inArray(psaSubmissionCards.cardId, cardIds),
    isNull(psaSubmissions.completedDate),
  ];

  if (excludeSubmissionId !== undefined) {
    conditions.push(ne(psaSubmissions.id, excludeSubmissionId));
  }

  const activeCards = await db
    .select({
      cardId: psaSubmissionCards.cardId,
      submissionNumber: psaSubmissions.submissionNumber,
    })
    .from(psaSubmissionCards)
    .innerJoin(
      psaSubmissions,
      eq(psaSubmissionCards.submissionId, psaSubmissions.id),
    )
    .where(and(...conditions));

  if (activeCards.length > 0) {
    const submissionNumbers = [
      ...new Set(activeCards.map((card) => card.submissionNumber)),
    ];

    throw new Error(
      `One or more cards are already in an active PSA submission: ${submissionNumbers.join(", ")}`,
    );
  }
}
