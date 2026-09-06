import { Packages } from "@/components/Packages/Packages";
import { getPurchasePackages } from "@/db/queries/purchasePackages";

export default async function PackagesPage() {
	const purchasePackages = await getPurchasePackages();

	return (
		<main>
			<h1>Packages</h1>

			<Packages purchasePackages={purchasePackages} />
		</main>
	);
}
