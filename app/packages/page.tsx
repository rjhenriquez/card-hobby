import { Packages } from "@/components/Packages/Packages";
import { getPurchasePackages } from "@/db/queries/purchasePackages";

import styles from "@/styles/page/Page.module.scss";

export default async function PackagesPage() {
	const purchasePackages = await getPurchasePackages();

	return (
		<div className={styles.Page}>
			<div className={styles.Page__header}>
				<h1 className={styles.Page__heading}>Packages</h1>
			</div>
			<section className={styles.Page__section}>
				<Packages purchasePackages={purchasePackages} />
			</section>
		</div>
	);
}
