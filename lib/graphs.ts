import type { Card } from "@/types/types";

export interface CostHistoryPoint {
	date: string;
	value: number;
	change: number;
}

interface InvestmentEvent {
	date: string;
	amount: number;
}

export function getInvestedCapitalHistory(cards: Card[]): CostHistoryPoint[] {
	const events: InvestmentEvent[] = [];

	for (const card of cards) {
		if (card.purchaseDate && card.totalCost !== null) {
			events.push({
				date: card.purchaseDate,
				amount: card.totalCost,
			});
		}

		if (card.soldDate && card.isPaid && card.totalCost !== null) {
			events.push({
				date: card.soldDate,
				amount: -card.totalCost,
			});
		}
	}

	events.sort((a, b) => a.date.localeCompare(b.date));

	const changesByDate = new Map<string, number>();

	for (const event of events) {
		changesByDate.set(
			event.date,
			(changesByDate.get(event.date) ?? 0) + event.amount,
		);
	}

	let runningTotal = 0;

	return Array.from(changesByDate.entries()).map(
		([date, change]): CostHistoryPoint => {
			runningTotal += change;

			return {
				date,
				change,
				value: runningTotal,
			};
		},
	);
}

export function getCollectionCostHistory(cards: Card[]): CostHistoryPoint[] {
	const changesByDate = new Map<string, number>();

	for (const card of cards) {
		if (card.purchaseDate && card.totalCost !== null) {
			changesByDate.set(
				card.purchaseDate,
				(changesByDate.get(card.purchaseDate) ?? 0) + card.totalCost,
			);
		}
	}

	const sortedChanges = Array.from(changesByDate.entries()).sort(
		([dateA], [dateB]) => dateA.localeCompare(dateB),
	);

	let runningTotal = 0;

	return sortedChanges.map(([date, change]): CostHistoryPoint => {
		runningTotal += change;

		return {
			date,
			change,
			value: runningTotal,
		};
	});
}
