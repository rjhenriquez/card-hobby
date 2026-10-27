import { asc } from "drizzle-orm";
import { AddCard } from "@/components/AddCard/AddCard";
import { CardPortfolio } from "@/components/CardPortfolio/CardPortfolio";
import { Tabs } from "@/components/Tabs/Tabs";
import { db } from "@/db";
import { cardStatuses } from "@/db/schema";
import { getCardsByPortfolio } from "@/db/queries/cards";
import { getPsaSubmissions } from "@/db/queries/psaSubmissions";
import { getCardFormOptions } from "@/db/queries/cardFormOptions";

import styles from "@/styles/page/Page.module.scss";

interface InvestmentPageProps {
	searchParams: Promise<{
		tab?: string;
	}>;
}

export default async function InvestmentPage({
	searchParams,
}: InvestmentPageProps) {
	const { tab } = await searchParams;

	const [cards, statuses, psaSubmissions, cardFormOptions] = await Promise.all([
		getCardsByPortfolio("investment"),
		db.select().from(cardStatuses).orderBy(asc(cardStatuses.name)),
		getPsaSubmissions(),
		getCardFormOptions(),
	]);

	const playerOptions = Array.from(
		new Set(cards.map((card) => card.player)),
	).sort((a, b) => a.localeCompare(b));

	const activeCards = cards.filter((card) => !(card.soldDate && card.isPaid));

	const soldCards = cards.filter((card) => card.soldDate && card.isPaid);

	const years = Array.from(
		new Set(
			soldCards
				.map((card) => card.soldDate?.slice(0, 4))
				.filter((year): year is string => Boolean(year)),
		),
	).sort((a, b) => Number(b) - Number(a));

	const tabs = [
		{
			label: "Active",
			value: "active",
			children: (
				<CardPortfolio
					cards={activeCards}
					statuses={statuses}
					psaSubmissions={psaSubmissions}
					portfolio='investment'
					options={cardFormOptions}
				/>
			),
		},

		...years.map((year) => ({
			label: year,
			value: year,
			children: (
				<CardPortfolio
					cards={soldCards.filter((card) => card.soldDate?.startsWith(year))}
					statuses={statuses}
					psaSubmissions={psaSubmissions}
					portfolio='investment'
					options={cardFormOptions}
				/>
			),
		})),
	];

	const activeTab = tabs.some((item) => item.value === tab) ? tab! : "active";

	return (
		<div className={styles.Page}>
			<div className={styles.Page__header}>
				<h1 className={styles.Page__heading}>Card Investments</h1>

				<AddCard
					statuses={statuses}
					portfolio='investment'
					options={cardFormOptions}
				/>
			</div>

			<section className={styles.Page__section}>
				{cards.length === 0 ? (
					<p>No investment cards yet.</p>
				) : (
					<Tabs tabs={tabs} activeTab={activeTab} />
				)}
			</section>
		</div>
	);
}
