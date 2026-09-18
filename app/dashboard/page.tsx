import { getCardsByPortfolio } from "@/db/queries/cards";
import {
	getInvestmentStatsByYear,
	getActiveInvestmentStats,
	getCollectionStatsByCategory,
	getCollectionStats,
	getGroupedCardStats,
} from "@/lib/stats";
import { HighlightCard } from "@/components/HighlightCard/HighlightCard";
import { HighlightCardTable } from "@/components/HighlightCardTable/HighlightCardTable";
import { HighlightCardMultiple } from "@/components/HighlightCardMultiple/HighlightCardMultiple";
import { CostHistoryChart } from "@/components/CostHistoryChart/CostHistoryChart";
import { Tabs } from "@/components/Tabs/Tabs";
import {
	getInvestedCapitalHistory,
	getCollectionCostHistory,
} from "@/lib/graphs";

import styles from "@/styles/page/Page.module.scss";

function getCategoryTabValue(category: string) {
	return category.trim().toLowerCase().replace(/\s+/g, "-");
}

interface HomeProps {
	searchParams: Promise<{
		tab?: string;
	}>;
}

export default async function Home({ searchParams }: HomeProps) {
	const { tab = "investments" } = await searchParams;

	const [investmentCards, collectionCards] = await Promise.all([
		getCardsByPortfolio("investment"),
		getCardsByPortfolio("collection"),
	]);

	const activeStats = getActiveInvestmentStats(investmentCards);

	const soldYears = Array.from(
		new Set(
			investmentCards
				.filter((card) => card.soldDate && card.isPaid)
				.map((card) => card.soldDate?.slice(0, 4))
				.filter((year): year is string => Boolean(year)),
		),
	).sort((a, b) => Number(b) - Number(a));

	const yearStats = soldYears.map((year) =>
		getInvestmentStatsByYear(investmentCards, year),
	);

	const collectionCategories = Array.from(
		new Set(
			collectionCards
				.map((card) => card.category?.trim())
				.filter((category): category is string => Boolean(category)),
		),
	).sort((a, b) => a.localeCompare(b));

	const collectionStats = collectionCategories.map((category) =>
		getCollectionStatsByCategory(collectionCards, category),
	);

	const collectionTotals = getCollectionStats(collectionCards);

	const tabs = [
		{
			label: "Investments",
			value: "investments",
			children: (
				<div className={styles.Page__section}>
					<div className={styles.Page__graphs}>
						<HighlightCard
							highlightLabel='Currently Invested'
							highlightValue={`$${activeStats.totalInvested.toLocaleString(
								"en-US",
								{
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								},
							)}`}
							subLabel='# Cards'
							subValue={activeStats.totalCards}
							link='/investment?tab=active'
							className={styles.Page__graphs__highlight}
							icon='investments'
						/>

						<CostHistoryChart
							data={getInvestedCapitalHistory(investmentCards)}
						/>
					</div>
					<HighlightCardMultiple
						icon='finance'
						items={yearStats.map((stats) => ({
							label: `${stats.year} Returns`,
							subValue: `${stats.roi.toFixed(2)}%`,
							value: `$${stats.totalProfit.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}`,
							link: `/?tab=${stats.year}`,
						}))}
					/>
					<div className={styles.Page__tables}>
						<HighlightCardTable
							title='Active Investments'
							rows={getGroupedCardStats(investmentCards, {
								groupBy: "player",
								valueBy: "totalCost",
								filter: (card) => !(card.soldDate && card.isPaid),
							})}
						/>

						<HighlightCardTable
							title='2026 Sold Investments'
							rows={getGroupedCardStats(investmentCards, {
								groupBy: "player",
								valueBy: "profit",
								filter: (card) =>
									Boolean(card.soldDate?.startsWith("2026") && card.isPaid),
							})}
						/>

						<HighlightCardTable
							title='Investments by eBay Seller'
							rows={getGroupedCardStats(investmentCards, {
								groupBy: "ebaySeller",
								valueBy: "totalCost",
							})}
						/>
					</div>
				</div>
			),
		},
		{
			label: "Collection",
			value: "collection",
			children: (
				<div className={styles.Page__section}>
					<div className={styles.Page__graphs}>
						<HighlightCard
							highlightLabel='Total Collection'
							highlightValue={`$${collectionTotals.totalCost.toLocaleString(
								"en-US",
								{
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								},
							)}`}
							subLabel='# Cards'
							subValue={collectionTotals.totalCards}
							link='/collection?tab=all'
							className={styles.Page__graphs__highlight}
							icon='collection'
						/>
						<CostHistoryChart
							data={getCollectionCostHistory(collectionCards)}
						/>
					</div>
					<HighlightCardMultiple
						icon='stacks'
						items={[...collectionStats]

							.sort((a, b) => b.totalCost - a.totalCost)
							.map((stats) => ({
								label: stats.category,
								value: `$${stats.totalCost.toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}`,
								subValue: `${stats.totalCards} ${
									stats.totalCards === 1 ? "card" : "cards"
								}`,
								link: `/collection?tab=${getCategoryTabValue(stats.category)}`,
							}))}
					/>
					<div className={styles.Page__tables}>
						<HighlightCardTable
							title='Baseball Collection'
							rows={getGroupedCardStats(collectionCards, {
								groupBy: "player",
								filter: (card) => card.category?.trim() === "Baseball",
							})}
						/>
						<HighlightCardTable
							title='Fortnite Collection'
							rows={getGroupedCardStats(collectionCards, {
								groupBy: "player",
								filter: (card) => card.category?.trim() === "Fortnite",
							})}
						/>
						<HighlightCardTable
							title='Soccer Collection'
							rows={getGroupedCardStats(collectionCards, {
								groupBy: "player",
								filter: (card) => card.category?.trim() === "Soccer",
							})}
						/>
					</div>
				</div>
			),
		},
		{
			label: "Grading",
			value: "grading",
			children: <div>Grading</div>,
		},
	];

	return (
		<div className={styles.Page}>
			<div className={styles.Page__header}>
				<h1 className={styles.Page__heading}>Dashboard</h1>
			</div>

			<section className={styles.Page__section}>
				<Tabs tabs={tabs} activeTab={tab} />
			</section>
		</div>
	);
}
