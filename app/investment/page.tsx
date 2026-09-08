import { asc } from "drizzle-orm";
import { AddCard } from "@/components/AddCard/AddCard";
import { db } from "@/db";
import { cardStatuses } from "@/db/schema";
import { getCardsByPortfolio } from "@/db/queries/cards";
import { getPsaSubmissions } from "@/db/queries/psaSubmissions";
import { CardPortfolio } from "@/components/CardPortfolio/CardPortfolio";

import styles from "@/styles/page/Page.module.scss";

export default async function InvestmentPage() {
	const [cards, statuses, psaSubmissions] = await Promise.all([
		getCardsByPortfolio("investment"),
		db.select().from(cardStatuses).orderBy(asc(cardStatuses.name)),
		getPsaSubmissions(),
	]);
	console.log(cards);
	return (
		<div className={styles.Page}>
			<div className={styles.Page__header}>
				<h1 className={styles.Page__heading}>Card Investments</h1>
				<AddCard statuses={statuses} portfolio='investment' />
			</div>

			<section className={styles.Page__section}>
				{cards.length === 0 ? (
					<p>No investment cards yet.</p>
				) : (
					<CardPortfolio
						cards={cards}
						statuses={statuses}
						psaSubmissions={psaSubmissions}
						portfolio='investment'
					/>
				)}
			</section>
			<div />
		</div>
	);
}
