import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cards, purchasePackageCards, purchasePackages } from "@/db/schema";

export async function getPurchasePackages() {
	const packageRows = await db
		.select({
			id: purchasePackages.id,
			itemsSubtotal: purchasePackages.itemsSubtotal,
			shippingTotal: purchasePackages.shippingTotal,
			taxesTotal: purchasePackages.taxesTotal,
			carrier: purchasePackages.carrier,
			trackingNumber: purchasePackages.trackingNumber,
			estimatedDeliveryDate: purchasePackages.estimatedDeliveryDate,
			isDelivered: purchasePackages.isDelivered,
			createdAt: purchasePackages.createdAt,
		})
		.from(purchasePackages)
		.orderBy(desc(purchasePackages.createdAt));

	if (packageRows.length === 0) {
		return [];
	}

	const packageCardRows = await db
		.select({
			purchasePackageId: purchasePackageCards.purchasePackageId,
			cardId: cards.id,
			player: cards.player,
			category: cards.category,
			year: cards.year,
			setName: cards.setName,
			info: cards.info,
			hammerPrice: purchasePackageCards.hammerPrice,
		})
		.from(purchasePackageCards)
		.innerJoin(cards, eq(cards.id, purchasePackageCards.cardId));

	return packageRows.map((purchasePackage) => ({
		...purchasePackage,
		cards: packageCardRows.filter(
			(card) => card.purchasePackageId === purchasePackage.id,
		),
	}));
}
