"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cards, cardStatuses, psaSubmissionCards } from "@/db/schema";

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

	const [existingCard] = await db
		.select({
			statusId: cards.statusId,
			soldPrice: cards.soldPrice,
		})
		.from(cards)
		.where(eq(cards.id, id))
		.limit(1);

	if (!existingCard) {
		throw new Error("Card not found");
	}

	const statusIdValue = formData.get("statusId");
	const hasSale = existingCard.soldPrice !== null;

	const statusId = hasSale
		? existingCard.statusId
		: typeof statusIdValue === "string" && statusIdValue
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
export async function sellCard(formData: FormData) {
	const idValue = formData.get("id");
	const soldPriceValue = formData.get("soldPrice");

	const id = typeof idValue === "string" ? Number(idValue) : NaN;

	if (!Number.isInteger(id)) {
		throw new Error("Invalid card ID");
	}

	if (
		typeof soldPriceValue !== "string" ||
		!soldPriceValue.trim() ||
		Number.isNaN(Number(soldPriceValue)) ||
		Number(soldPriceValue) < 0
	) {
		throw new Error("Valid sold price is required");
	}

	const [card] = await db
		.select({
			portfolio: cards.portfolio,
		})
		.from(cards)
		.where(eq(cards.id, id))
		.limit(1);

	if (!card) {
		throw new Error("Card not found");
	}

	if (card.portfolio !== "investment") {
		throw new Error(
			"Collection cards must be moved to Investment before they can be sold",
		);
	}

	const isPaid = formData.get("isPaid") === "on";
	const statusName = isPaid ? "Sold" : "Pending Payment";

	const [saleStatus] = await db
		.select({
			id: cardStatuses.id,
		})
		.from(cardStatuses)
		.where(eq(cardStatuses.name, statusName))
		.limit(1);

	if (!saleStatus) {
		throw new Error(`Card status "${statusName}" does not exist`);
	}

	await db
		.update(cards)
		.set({
			statusId: saleStatus.id,
			soldVia: getOptionalString(formData, "soldVia"),
			soldDate: getOptionalString(formData, "soldDate"),
			soldPrice: soldPriceValue.trim(),
			isPaid,
			updatedAt: new Date(),
		})
		.where(eq(cards.id, id));

	revalidatePath("/");
	revalidatePath("/investment");
	revalidatePath("/collection");
}
export async function deleteCard(id: number) {
	if (!Number.isInteger(id)) {
		throw new Error("Invalid card ID");
	}

	const [card] = await db
		.select({
			id: cards.id,
		})
		.from(cards)
		.where(eq(cards.id, id))
		.limit(1);

	if (!card) {
		throw new Error("Card not found");
	}

	const [psaHistory] = await db
		.select({
			id: psaSubmissionCards.id,
		})
		.from(psaSubmissionCards)
		.where(eq(psaSubmissionCards.cardId, id))
		.limit(1);

	if (psaHistory) {
		throw new Error(
			"This card cannot be deleted because it has PSA submission history.",
		);
	}

	await db.delete(cards).where(eq(cards.id, id));

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
