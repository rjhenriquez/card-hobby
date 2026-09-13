import { asc } from "drizzle-orm";
import { db } from "@/db";
import { cards } from "@/db/schema";

export interface CardFormOptions {
	players: string[];
	categories: string[];
}

export async function getCardFormOptions(): Promise<CardFormOptions> {
	const [playerRows, categoryRows] = await Promise.all([
		db
			.selectDistinct({
				value: cards.player,
			})
			.from(cards)
			.orderBy(asc(cards.player)),

		db
			.selectDistinct({
				value: cards.category,
			})
			.from(cards)
			.orderBy(asc(cards.category)),
	]);

	return {
		players: playerRows
			.map((row) => row.value)
			.filter((value): value is string => Boolean(value)),

		categories: categoryRows
			.map((row) => row.value)
			.filter((value): value is string => Boolean(value)),
	};
}
