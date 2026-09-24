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

interface CollectionPageProps {
	searchParams: Promise<{
		tab?: string;
	}>;
}

function getCategoryTabValue(category: string) {
	return category.trim().toLowerCase().replace(/\s+/g, "-");
}

export default async function CollectionPage({
	searchParams,
}: CollectionPageProps) {
	const { tab } = await searchParams;

	const [cards, statuses, psaSubmissions, options] = await Promise.all([
		getCardsByPortfolio("collection"),
		db.select().from(cardStatuses).orderBy(asc(cardStatuses.name)),
		getPsaSubmissions(),
		getCardFormOptions(),
	]);

	const categories = Array.from(
		new Set(
			cards
				.map((card) => card.category?.trim())
				.filter((category): category is string => Boolean(category)),
		),
	).sort((a, b) => a.localeCompare(b));

	const tabs = [
		{
			label: "All",
			value: "all",
			children: (
				<CardPortfolio
					cards={cards}
					statuses={statuses}
					psaSubmissions={psaSubmissions}
					portfolio='collection'
					options={options}
				/>
			),
		},

		...categories.map((category) => ({
			label: category,
			value: getCategoryTabValue(category),
			children: (
				<CardPortfolio
					cards={cards.filter((card) => card.category?.trim() === category)}
					statuses={statuses}
					psaSubmissions={psaSubmissions}
					portfolio='collection'
					options={options}
				/>
			),
		})),
	];

	const activeTab = tabs.some((item) => item.value === tab) ? tab! : "all";

	return (
		<div className={styles.Page}>
			<div className={styles.Page__header}>
				<h1 className={styles.Page__heading}>Collection</h1>

				<AddCard statuses={statuses} portfolio='collection' options={options} />
			</div>

			<section className={styles.Page__section}>
				{cards.length === 0 ? (
					<p>No collection cards yet.</p>
				) : (
					<Tabs tabs={tabs} activeTab={activeTab} />
				)}
			</section>
		</div>
	);
}
