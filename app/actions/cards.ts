"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cards } from "@/db/schema";

export async function createCard(formData: FormData) {
  const player = formData.get("player");

  if (typeof player !== "string" || !player.trim()) {
    throw new Error("Player is required");
  }

  const statusIdValue = formData.get("statusId");

  const statusId =
    typeof statusIdValue === "string" && statusIdValue
      ? Number(statusIdValue)
      : null;

  const portfolio =
    formData.get("portfolio") === "collection" ? "collection" : "investment";

  await db.insert(cards).values({
    player: player.trim(),
    category: getOptionalString(formData, "category"),
    year: getOptionalString(formData, "year"),
    setName: getOptionalString(formData, "setName"),
    info: getOptionalString(formData, "info"),
    notes: getOptionalString(formData, "notes"),

    portfolio,
    statusId,

    acquisitionType:
      formData.get("acquisitionType") === "pulled" ? "pulled" : "purchased",

    purchaseDate: getOptionalString(formData, "purchaseDate"),
    purchasedFrom: getOptionalString(formData, "purchasedFrom"),
    ebaySeller: getOptionalString(formData, "ebaySeller"),
    purchasePrice: getOptionalString(formData, "purchasePrice"),
  });

  revalidatePath("/");
  revalidatePath("/investment");
  revalidatePath("/collection");
}

export async function updateCard(formData: FormData) {
  const idValue = formData.get("id");
  const player = formData.get("player");

  const id = typeof idValue === "string" ? Number(idValue) : NaN;

  if (!Number.isInteger(id)) {
    throw new Error("Invalid card ID");
  }

  if (typeof player !== "string" || !player.trim()) {
    throw new Error("Player is required");
  }

  const statusIdValue = formData.get("statusId");

  const statusId =
    typeof statusIdValue === "string" && statusIdValue
      ? Number(statusIdValue)
      : null;

  await db
    .update(cards)
    .set({
      player: player.trim(),
      category: getOptionalString(formData, "category"),
      year: getOptionalString(formData, "year"),
      setName: getOptionalString(formData, "setName"),
      info: getOptionalString(formData, "info"),
      notes: getOptionalString(formData, "notes"),

      statusId,

      acquisitionType:
        formData.get("acquisitionType") === "pulled" ? "pulled" : "purchased",

      purchaseDate: getOptionalString(formData, "purchaseDate"),
      purchasedFrom: getOptionalString(formData, "purchasedFrom"),
      ebaySeller: getOptionalString(formData, "ebaySeller"),
      purchasePrice: getOptionalString(formData, "purchasePrice"),

      updatedAt: new Date(),
    })
    .where(eq(cards.id, id));

  revalidatePath("/");
  revalidatePath("/investment");
  revalidatePath("/collection");
}

function getOptionalString(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue || null;
}
export async function moveCardToPortfolio(
  cardId: number,
  portfolio: "investment" | "collection",
) {
  if (!Number.isInteger(cardId)) {
    throw new Error("Invalid card ID");
  }

  await db
    .update(cards)
    .set({
      portfolio,
      updatedAt: new Date(),
    })
    .where(eq(cards.id, cardId));

  revalidatePath("/");
  revalidatePath("/investment");
  revalidatePath("/collection");
}
