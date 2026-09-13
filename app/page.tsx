import Link from "next/link";
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

import styles from "@/styles/page/Page.module.scss";

function getCategoryTabValue(category: string) {
	return category.trim().toLowerCase().replace(/\s+/g, "-");
}

export default async function Home() {
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

	return (
		<div className={styles.Page}>
			<div className={styles.Page__header}>
				<h1 className={styles.Page__heading}>Dashboard</h1>
			</div>

			<section className={styles["Page__section--dashboard"]}>
				<div style={{ border: "1px solid red", padding: "1rem" }}>
					<h2>Investments</h2>

					<HighlightCard
						highlightLabel='Currently Invested'
						highlightValue={`$${activeStats.totalInvested.toLocaleString(
							"en-US",
							{
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							},
						)}`}
						subLabel='Number of Cards'
						subValue={activeStats.totalCards}
						link='/investment?tab=active'
					/>

					{yearStats.map((stats) => (
						<HighlightCard
							key={stats.year}
							highlightLabel={`${stats.year} ROI`}
							highlightValue={`${stats.roi.toFixed(2)}%`}
							subLabel='Total Profit'
							subValue={`$${stats.totalProfit.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}`}
							link={`/investment?tab=${stats.year}`}
						/>
					))}

					<Link href='/investment?tab=active'>Active Investments</Link>

					{soldYears.map((year) => (
						<Link key={year} href={`/investment?tab=${year}`}>
							{year} Investments
						</Link>
					))}

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

				<div style={{ border: "1px solid red", padding: "1rem" }}>
					<h2>Collection</h2>
					<HighlightCard
						highlightLabel='Total Collection'
						highlightValue={`$${collectionTotals.totalCost.toLocaleString(
							"en-US",
							{
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							},
						)}`}
						subLabel='Number of Cards'
						subValue={collectionTotals.totalCards}
						link='/collection?tab=all'
					/>
					{collectionStats.map((stats) => (
						<HighlightCard
							key={stats.category}
							highlightLabel={stats.category}
							highlightValue={`$${stats.totalCost.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}`}
							subLabel='Number of Cards'
							subValue={stats.totalCards}
							link={`/collection?tab=${getCategoryTabValue(stats.category)}`}
						/>
					))}
					<HighlightCardTable
						title='Baseball Collection'
						rows={getGroupedCardStats(collectionCards, {
							groupBy: "player",
							filter: (card) => card.category?.trim() === "Baseball",
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
			</section>
		</div>
	);
}
