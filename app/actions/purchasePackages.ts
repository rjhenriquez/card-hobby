"use server";

import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { purchasePackageCards, purchasePackages } from "@/db/schema";

interface PurchasePackageCardInput {
	cardId: number;
	hammerPrice: string;
}

interface CreatePurchasePackageInput {
	itemsSubtotal: string;
	shippingTotal: string;
	taxesTotal: string;
	carrier: string | null;
	trackingNumber: string | null;
	estimatedDeliveryDate: string | null;
	cards: PurchasePackageCardInput[];
}

export async function createPurchasePackage({
	itemsSubtotal,
	shippingTotal,
	taxesTotal,
	carrier,
	trackingNumber,
	estimatedDeliveryDate,
	cards,
}: CreatePurchasePackageInput) {
	if (cards.length === 0) {
		throw new Error("At least one card is required.");
	}

	const parsedItemsSubtotal = Number(itemsSubtotal);
	const parsedShippingTotal = Number(shippingTotal);
	const parsedTaxesTotal = Number(taxesTotal);

	if (
		!Number.isFinite(parsedItemsSubtotal) ||
		parsedItemsSubtotal < 0 ||
		!Number.isFinite(parsedShippingTotal) ||
		parsedShippingTotal < 0 ||
		!Number.isFinite(parsedTaxesTotal) ||
		parsedTaxesTotal < 0
	) {
		throw new Error("Package totals are invalid.");
	}

	for (const card of cards) {
		const hammerPrice = Number(card.hammerPrice);

		if (!Number.isFinite(hammerPrice) || hammerPrice < 0) {
			throw new Error("One or more hammer prices are invalid.");
		}
	}

	const [purchasePackage] = await db
		.insert(purchasePackages)
		.values({
			itemsSubtotal,
			shippingTotal,
			taxesTotal,
			carrier,
			trackingNumber,
			estimatedDeliveryDate,
		})
		.returning({
			id: purchasePackages.id,
		});

	if (!purchasePackage) {
		throw new Error("Unable to create purchase package.");
	}

	await db.insert(purchasePackageCards).values(
		cards.map((card) => ({
			purchasePackageId: purchasePackage.id,
			cardId: card.cardId,
			hammerPrice: card.hammerPrice,
		})),
	);
	revalidatePath("/investment");
	revalidatePath("/collection");

	return purchasePackage;
}
export async function updatePurchasePackage(formData: FormData) {
	const idValue = formData.get("id");

	if (typeof idValue !== "string") {
		throw new Error("Purchase package ID is required.");
	}

	const id = Number(idValue);

	if (!Number.isInteger(id)) {
		throw new Error("Purchase package ID is invalid.");
	}

	const itemsSubtotal = String(formData.get("itemsSubtotal") ?? "");
	const shippingTotal = String(formData.get("shippingTotal") ?? "");
	const taxesTotal = String(formData.get("taxesTotal") ?? "");

	const parsedItemsSubtotal = Number(itemsSubtotal);
	const parsedShippingTotal = Number(shippingTotal);
	const parsedTaxesTotal = Number(taxesTotal);

	if (
		!Number.isFinite(parsedItemsSubtotal) ||
		parsedItemsSubtotal < 0 ||
		!Number.isFinite(parsedShippingTotal) ||
		parsedShippingTotal < 0 ||
		!Number.isFinite(parsedTaxesTotal) ||
		parsedTaxesTotal < 0
	) {
		throw new Error("Package totals are invalid.");
	}

	const getOptionalString = (name: string) => {
		const value = formData.get(name);

		if (typeof value !== "string") {
			return null;
		}

		const trimmedValue = value.trim();

		return trimmedValue === "" ? null : trimmedValue;
	};

	await db
		.update(purchasePackages)
		.set({
			itemsSubtotal,
			shippingTotal,
			taxesTotal,
			carrier: getOptionalString("carrier"),
			trackingNumber: getOptionalString("trackingNumber"),
			estimatedDeliveryDate: getOptionalString("estimatedDeliveryDate"),
			isDelivered: formData.get("isDelivered") === "on",
			updatedAt: new Date(),
		})
		.where(eq(purchasePackages.id, id));

	const packageCards = await db
		.select({
			cardId: purchasePackageCards.cardId,
		})
		.from(purchasePackageCards)
		.where(eq(purchasePackageCards.purchasePackageId, id));

	for (const card of packageCards) {
		const hammerPriceValue = formData.get(`hammerPrice-${card.cardId}`);

		if (typeof hammerPriceValue !== "string") {
			continue;
		}

		const hammerPrice = Number(hammerPriceValue);

		if (!Number.isFinite(hammerPrice) || hammerPrice < 0) {
			throw new Error("One or more hammer prices are invalid.");
		}

		await db
			.update(purchasePackageCards)
			.set({
				hammerPrice: hammerPriceValue,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(purchasePackageCards.purchasePackageId, id),
					eq(purchasePackageCards.cardId, card.cardId),
				),
			);
	}

	revalidatePath("/purchase-packages");
	revalidatePath("/investment");
	revalidatePath("/collection");
}
