import { PackagesNew } from "@/components/Packages/PackagesNew";
import { Tabs } from "@/components/Tabs/Tabs";
import {
	getCardsWithoutPurchasePackage,
	getPurchasePackages,
} from "@/db/queries/purchasePackages";

import styles from "@/styles/page/Page.module.scss";

interface PackagesPageProps {
	searchParams: Promise<{
		tab?: string;
	}>;
}

export default async function PackagesPage({
	searchParams,
}: PackagesPageProps) {
	const { tab } = await searchParams;

	const [purchasePackages, availableCards] = await Promise.all([
		getPurchasePackages(),
		getCardsWithoutPurchasePackage(),
	]);

	const activePackages = purchasePackages.filter(
		(purchasePackage) => !purchasePackage.isDelivered,
	);

	const receivedPackages = purchasePackages.filter(
		(purchasePackage) => purchasePackage.isDelivered,
	);

	return (
		<div className={styles.Page}>
			<div className={styles.Page__header}>
				<h1 className={styles.Page__heading}>Packages</h1>
			</div>

			<section className={styles.Page__section}>
				<Tabs
					activeTab={tab ?? "active"}
					tabs={[
						{
							label: "Active",
							value: "active",
							children: (
								<PackagesNew
									purchasePackages={activePackages}
									availableCards={availableCards}
								/>
							),
						},
						{
							label: "Received",
							value: "received",
							children: (
								<PackagesNew
									purchasePackages={receivedPackages}
									availableCards={availableCards}
								/>
							),
						},
					]}
				/>
			</section>
		</div>
	);
}
