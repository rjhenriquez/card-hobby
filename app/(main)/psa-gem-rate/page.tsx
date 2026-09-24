import { GemRateTable } from "@/components/GemRateTable/GemRateTable";
import { HighlightCard } from "@/components/HighlightCard/HighlightCard";
import { getPsaGemRateRows } from "@/db/queries/psaGemRate";
import { getOverallPsaStats } from "@/lib/stats";

import styles from "@/styles/page/Page.module.scss";

export default async function PsaGemRatePage() {
	const submissions = await getPsaGemRateRows();

	const { gemRate, totalCards } = getOverallPsaStats(submissions);

	return (
		<div className={styles.Page}>
			<div className={styles.Page__header}>
				<h1 className={styles.Page__heading}>PSA Gem Rate</h1>
			</div>

			<section className={styles.Page__section}>
				<HighlightCard
					highlightLabel='Gem Rate'
					highlightValue={`${gemRate.toFixed(1)}%`}
					subLabel='Total Cards'
					icon='diamond'
					subValue={totalCards}
				/>

				<GemRateTable submissions={submissions} />
			</section>
		</div>
	);
}
