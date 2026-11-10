import { Suspense } from "react";
import { SearchBuilder } from "@/components/SearchBuilder/SearchBuilder";
import { getSearchTermsBySection } from "@/db/queries/searches";
import cn from "classnames";

import styles from "@/styles/page/Page.module.scss";

export default async function SearchPage() {
	const searchTerms = await getSearchTermsBySection();

	return (
		<div className={cn(styles.Page, styles["Page--search"])}>
			{/* SearchBuilder reads useSearchParams(), which needs a Suspense boundary to build. */}
			<Suspense>
				<SearchBuilder searchTerms={searchTerms} />
			</Suspense>
		</div>
	);
}
