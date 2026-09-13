import type { Card } from "@/types/types";
import type { PsaGemRateRow } from "@/db/queries/psaGemRate";

export function getOverallPsaStats(submissions: PsaGemRateRow[]) {
	const totalCards = submissions.reduce(
		(total, submission) => total + submission.totalCards,
		0,
	);

	const totalPsa10 = submissions.reduce(
		(total, submission) => total + submission.psa10,
		0,
	);

	const totalNoGrade = submissions.reduce(
		(total, submission) => total + submission.noGrade,
		0,
	);

	const totalGradedCards = totalCards - totalNoGrade;

	const gemRate =
		totalGradedCards > 0 ? (totalPsa10 / totalGradedCards) * 100 : 0;

	return {
		totalCards,
		totalPsa10,
		totalNoGrade,
		totalGradedCards,
		gemRate,
	};
}

export function getInvestmentStatsByYear(cards: Card[], year: string) {
	const yearCards = cards.filter(
		(card) => card.isPaid && card.soldDate?.startsWith(year),
	);

	const totalSold = yearCards.reduce(
		(total, card) => total + Number(card.soldPrice ?? 0),
		0,
	);

	const totalCost = yearCards.reduce(
		(total, card) => total + (card.totalCost ?? 0),
		0,
	);

	const totalProfit = totalSold - totalCost;

	const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

	return {
		year,
		totalCards: yearCards.length,
		totalSold,
		totalCost,
		totalProfit,
		roi,
	};
}

export function getActiveInvestmentStats(cards: Card[]) {
	const activeCards = cards.filter((card) => !(card.soldDate && card.isPaid));

	const totalInvested = activeCards.reduce(
		(total, card) => total + (card.totalCost ?? 0),
		0,
	);

	return {
		totalInvested,
		totalCards: activeCards.length,
	};
}

export function getCollectionStatsByCategory(cards: Card[], category: string) {
	const categoryCards = cards.filter(
		(card) => card.category?.trim() === category,
	);

	const totalCost = categoryCards.reduce(
		(total, card) => total + (card.totalCost ?? 0),
		0,
	);

	return {
		category,
		totalCost,
		totalCards: categoryCards.length,
	};
}

export function getCollectionStats(cards: Card[]) {
	const totalCost = cards.reduce(
		(total, card) => total + (card.totalCost ?? 0),
		0,
	);

	return {
		totalCost,
		totalCards: cards.length,
	};
}

export function getCollectionPlayerStats(cards: Card[], category?: string) {
	const filteredCards = category
		? cards.filter((card) => card.category?.trim() === category)
		: cards;

	const playerMap = new Map<
		string,
		{
			count: number;
			totalCost: number;
		}
	>();

	for (const card of filteredCards) {
		const player = card.player.trim();

		const current = playerMap.get(player) ?? {
			count: 0,
			totalCost: 0,
		};

		current.count += 1;
		current.totalCost += card.totalCost ?? 0;

		playerMap.set(player, current);
	}

	return Array.from(playerMap.entries())
		.map(([player, stats]) => ({
			label: player,
			count: stats.count,
			value: stats.totalCost,
		}))
		.sort((a, b) => b.value - a.value);
}

export function getActiveInvestmentPlayerStats(
	cards: Card[],
	category?: string,
) {
	const filteredCards = cards.filter((card) => {
		const isActive = !(card.soldDate && card.isPaid);

		const matchesCategory = category
			? card.category?.trim() === category
			: true;

		return isActive && matchesCategory;
	});

	const playerMap = new Map<
		string,
		{
			count: number;
			totalCost: number;
		}
	>();

	for (const card of filteredCards) {
		const player = card.player.trim();

		const current = playerMap.get(player) ?? {
			count: 0,
			totalCost: 0,
		};

		current.count += 1;
		current.totalCost += card.totalCost ?? 0;

		playerMap.set(player, current);
	}

	return Array.from(playerMap.entries())
		.map(([player, stats]) => ({
			label: player,
			count: stats.count,
			value: stats.totalCost,
		}))
		.sort((a, b) => b.value - a.value);
}

export function getSoldInvestmentPlayerStats(cards: Card[], year?: string) {
	const filteredCards = cards.filter((card) => {
		const isSold = Boolean(card.soldDate && card.isPaid);

		const matchesYear = year ? card.soldDate?.startsWith(year) : true;

		return isSold && matchesYear;
	});

	const playerMap = new Map<
		string,
		{
			count: number;
			totalProfit: number;
		}
	>();

	for (const card of filteredCards) {
		const player = card.player.trim();

		const current = playerMap.get(player) ?? {
			count: 0,
			totalProfit: 0,
		};

		current.count += 1;
		current.totalProfit += card.profit ?? 0;

		playerMap.set(player, current);
	}

	return Array.from(playerMap.entries())
		.map(([player, stats]) => ({
			label: player,
			count: stats.count,
			value: stats.totalProfit,
		}))
		.sort((a, b) => b.value - a.value);
}

// ---------------------------------------------
// Generic Grouped Card Stats
// ---------------------------------------------

export type CardGroupBy =
	"player" | "category" | "soldVia" | "ebaySeller" | "purchasedFrom";

export type CardValueBy = "totalCost" | "profit" | "soldPrice";

interface GetGroupedCardStatsOptions {
	groupBy: CardGroupBy;
	valueBy?: CardValueBy;
	filter?: (card: Card) => boolean;
}

export function getGroupedCardStats(
	cards: Card[],
	{ groupBy, valueBy = "totalCost", filter }: GetGroupedCardStatsOptions,
) {
	const filteredCards = filter ? cards.filter(filter) : cards;

	const groups = new Map<
		string,
		{
			count: number;
			value: number;
		}
	>();

	for (const card of filteredCards) {
		const groupValue = card[groupBy];

		if (!groupValue) {
			continue;
		}

		const label = String(groupValue).trim();

		if (!label) {
			continue;
		}

		const current = groups.get(label) ?? {
			count: 0,
			value: 0,
		};

		current.count += 1;

		switch (valueBy) {
			case "profit":
				current.value += card.profit ?? 0;
				break;

			case "soldPrice":
				current.value += Number(card.soldPrice ?? 0);
				break;

			case "totalCost":
			default:
				current.value += card.totalCost ?? 0;
				break;
		}

		groups.set(label, current);
	}

	return Array.from(groups.entries())
		.map(([label, stats]) => ({
			label,
			count: stats.count,
			value: stats.value,
		}))
		.sort((a, b) => b.value - a.value);
}
