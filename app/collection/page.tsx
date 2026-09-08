import { asc } from "drizzle-orm";
import { AddCard } from "@/components/AddCard/AddCard";
import { db } from "@/db";
import { cardStatuses } from "@/db/schema";
import { getCardsByPortfolio } from "@/db/queries/cards";
import { getPsaSubmissions } from "@/db/queries/psaSubmissions";
import { CardPortfolio } from "@/components/CardPortfolio/CardPortfolio";

export default async function CollectionPage() {
	const [cards, statuses, psaSubmissions] = await Promise.all([
		getCardsByPortfolio("collection"),
		db.select().from(cardStatuses).orderBy(asc(cardStatuses.name)),
		getPsaSubmissions(),
	]);

	return (
		<div className='content'>
			<h1>Collection</h1>

			<AddCard statuses={statuses} portfolio='collection' />

			<section>
				<h2>Collection Cards</h2>

				{cards.length === 0 ? (
					<p>No collection cards yet.</p>
				) : (
					<CardPortfolio
						cards={cards}
						statuses={statuses}
						psaSubmissions={psaSubmissions}
						portfolio='collection'
					/>
				)}
			</section>
		</div>
	);
}
