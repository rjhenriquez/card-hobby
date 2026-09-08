"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
	cards,
	cardStatuses,
	purchasePackageCards,
	purchasePackages,
} from "@/db/schema";

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

function getOptionalFormValue(formData: FormData, name: string) {
	const value = formData.get(name);

	if (typeof value !== "string") {
		return null;
	}

	const trimmedValue = value.trim();

	return trimmedValue === "" ? null : trimmedValue;
}

export async function createPurchasePackage({
	itemsSubtotal,
	shippingTotal,
	taxesTotal,
	carrier,
	trackingNumber,
	estimatedDeliveryDate,
	cards: packageCards,
}: CreatePurchasePackageInput) {
	if (packageCards.length === 0) {
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

	for (const packageCard of packageCards) {
		const hammerPrice = Number(packageCard.hammerPrice);

		if (!Number.isFinite(hammerPrice) || hammerPrice < 0) {
			throw new Error("One or more hammer prices are invalid.");
		}
	}

	const cardIds = packageCards.map((card) => card.cardId);

	const selectedCards = await db
		.select({
			id: cards.id,
			purchasedFrom: cards.purchasedFrom,
			ebaySeller: cards.ebaySeller,
		})
		.from(cards)
		.where(inArray(cards.id, cardIds));

	if (selectedCards.length !== cardIds.length) {
		throw new Error("One or more selected cards could not be found.");
	}

	const sources = new Set(
		selectedCards
			.map((card) => card.purchasedFrom?.trim())
			.filter((value): value is string => Boolean(value)),
	);

	const sellers = new Set(
		selectedCards
			.map((card) => card.ebaySeller?.trim())
			.filter((value): value is string => Boolean(value)),
	);

	if (sources.size > 1) {
		throw new Error("Selected cards have different purchase sources.");
	}

	if (sellers.size > 1) {
		throw new Error("Selected cards have different eBay sellers.");
	}

	const seller = [...sellers][0] ?? null;

	const source = [...sources][0] ?? (seller ? "eBay" : null);

	const [purchasePackage] = await db
		.insert(purchasePackages)
		.values({
			itemsSubtotal,
			shippingTotal,
			taxesTotal,
			source,
			seller,
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
		packageCards.map((card) => ({
			purchasePackageId: purchasePackage.id,
			cardId: card.cardId,
			hammerPrice: card.hammerPrice,
		})),
	);

	revalidatePath("/packages");
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

	const isDelivered = formData.get("isDelivered") === "on";

	const [existingPackage] = await db
		.select({
			isDelivered: purchasePackages.isDelivered,
		})
		.from(purchasePackages)
		.where(eq(purchasePackages.id, id))
		.limit(1);

	if (!existingPackage) {
		throw new Error("Purchase package not found.");
	}

	await db
		.update(purchasePackages)
		.set({
			itemsSubtotal,
			shippingTotal,
			taxesTotal,
			carrier: getOptionalFormValue(formData, "carrier"),
			trackingNumber: getOptionalFormValue(formData, "trackingNumber"),
			estimatedDeliveryDate: getOptionalFormValue(
				formData,
				"estimatedDeliveryDate",
			),
			isDelivered,
			updatedAt: new Date(),
		})
		.where(eq(purchasePackages.id, id));

	const packageCards = await db
		.select({
			cardId: purchasePackageCards.cardId,
		})
		.from(purchasePackageCards)
		.where(eq(purchasePackageCards.purchasePackageId, id));

	for (const packageCard of packageCards) {
		const hammerPrice = String(
			formData.get(`hammerPrice-${packageCard.cardId}`) ?? "",
		);

		const parsedHammerPrice = Number(hammerPrice);

		if (!Number.isFinite(parsedHammerPrice) || parsedHammerPrice < 0) {
			throw new Error("One or more hammer prices are invalid.");
		}

		await db
			.update(purchasePackageCards)
			.set({
				hammerPrice,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(purchasePackageCards.purchasePackageId, id),
					eq(purchasePackageCards.cardId, packageCard.cardId),
				),
			);
	}

	const wasJustReceived = !existingPackage.isDelivered && isDelivered;

	if (wasJustReceived && packageCards.length > 0) {
		const [inTransitStatus] = await db
			.select({
				id: cardStatuses.id,
			})
			.from(cardStatuses)
			.where(eq(cardStatuses.name, "In Transit"))
			.limit(1);

		const [receivedStatus] = await db
			.select({
				id: cardStatuses.id,
			})
			.from(cardStatuses)
			.where(eq(cardStatuses.name, "Received"))
			.limit(1);

		if (!inTransitStatus || !receivedStatus) {
			throw new Error("Required card statuses do not exist.");
		}

		await db
			.update(cards)
			.set({
				statusId: receivedStatus.id,
				updatedAt: new Date(),
			})
			.where(
				and(
					inArray(
						cards.id,
						packageCards.map((card) => card.cardId),
					),
					eq(cards.statusId, inTransitStatus.id),
				),
			);
	}

	revalidatePath("/packages");
	revalidatePath("/investment");
	revalidatePath("/collection");
}

export async function markPurchasePackageReceived(id: number) {
	if (!Number.isInteger(id)) {
		throw new Error("Purchase package ID is invalid.");
	}

	const [purchasePackage] = await db
		.select({
			id: purchasePackages.id,
			isDelivered: purchasePackages.isDelivered,
		})
		.from(purchasePackages)
		.where(eq(purchasePackages.id, id))
		.limit(1);

	if (!purchasePackage) {
		throw new Error("Purchase package not found.");
	}

	if (purchasePackage.isDelivered) {
		return;
	}

	const packageCards = await db
		.select({
			cardId: purchasePackageCards.cardId,
		})
		.from(purchasePackageCards)
		.where(eq(purchasePackageCards.purchasePackageId, id));

	const [inTransitStatus] = await db
		.select({
			id: cardStatuses.id,
		})
		.from(cardStatuses)
		.where(eq(cardStatuses.name, "In Transit"))
		.limit(1);

	const [receivedStatus] = await db
		.select({
			id: cardStatuses.id,
		})
		.from(cardStatuses)
		.where(eq(cardStatuses.name, "Received"))
		.limit(1);

	if (!inTransitStatus || !receivedStatus) {
		throw new Error("Required card statuses do not exist.");
	}

	await db
		.update(purchasePackages)
		.set({
			isDelivered: true,
			updatedAt: new Date(),
		})
		.where(eq(purchasePackages.id, id));

	if (packageCards.length > 0) {
		await db
			.update(cards)
			.set({
				statusId: receivedStatus.id,
				updatedAt: new Date(),
			})
			.where(
				and(
					inArray(
						cards.id,
						packageCards.map((card) => card.cardId),
					),
					eq(cards.statusId, inTransitStatus.id),
				),
			);
	}

	revalidatePath("/packages");
	revalidatePath("/investment");
	revalidatePath("/collection");
}
