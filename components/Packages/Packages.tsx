"use client";

import { useState } from "react";
import { updatePurchasePackage } from "@/app/actions/purchasePackages";
import {
	PackageModal,
	PurchasePackage,
} from "@/components/PackageModal/PackageModal";

import styles from "./Packages.module.scss";

interface PackagesProps {
	purchasePackages: PurchasePackage[];
}

function formatCurrency(value: string | number) {
	return `$${Number(value).toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

export function Packages({ purchasePackages }: PackagesProps) {
	const [expandedPackageIds, setExpandedPackageIds] = useState<number[]>([]);
	const [editingPackage, setEditingPackage] = useState<PurchasePackage | null>(
		null,
	);
	const [isSavingPurchasePackage, setIsSavingPurchasePackage] = useState(false);
	const [purchasePackageError, setPurchasePackageError] = useState<
		string | null
	>(null);

	function toggleExpanded(packageId: number) {
		setExpandedPackageIds((currentIds) =>
			currentIds.includes(packageId)
				? currentIds.filter((id) => id !== packageId)
				: [...currentIds, packageId],
		);
	}

	function handleClosePurchasePackageModal() {
		if (isSavingPurchasePackage) {
			return;
		}

		setEditingPackage(null);
		setPurchasePackageError(null);
	}

	async function handleUpdatePurchasePackage(formData: FormData) {
		setPurchasePackageError(null);
		setIsSavingPurchasePackage(true);

		try {
			await updatePurchasePackage(formData);
			setEditingPackage(null);
		} catch (error) {
			setPurchasePackageError(
				error instanceof Error
					? error.message
					: "Unable to update purchase package.",
			);
		} finally {
			setIsSavingPurchasePackage(false);
		}
	}

	if (purchasePackages.length === 0) {
		return <p>No packages yet.</p>;
	}

	return (
		<>
			<div className={styles.Packages}>
				{purchasePackages.map((purchasePackage) => {
					const isExpanded = expandedPackageIds.includes(purchasePackage.id);

					const totalValue =
						Number(purchasePackage.itemsSubtotal) +
						Number(purchasePackage.shippingTotal) +
						Number(purchasePackage.taxesTotal);

					return (
						<section key={purchasePackage.id}>
							<header>
								<div>
									<h2>Package #{purchasePackage.id}</h2>

									<p>{formatCurrency(totalValue)}</p>
								</div>

								<div>
									<button
										type='button'
										onClick={() => toggleExpanded(purchasePackage.id)}
									>
										{isExpanded ? "Collapse" : "Expand"}
									</button>

									<button
										type='button'
										onClick={() => {
											setPurchasePackageError(null);
											setEditingPackage(purchasePackage);
										}}
									>
										Edit
									</button>
								</div>
							</header>

							<dl>
								<div>
									<dt>Carrier</dt>
									<dd>{purchasePackage.carrier ?? "—"}</dd>
								</div>

								<div>
									<dt>Tracking</dt>
									<dd>{purchasePackage.trackingNumber ?? "—"}</dd>
								</div>

								<div>
									<dt>ETA</dt>
									<dd>{purchasePackage.estimatedDeliveryDate ?? "—"}</dd>
								</div>

								<div>
									<dt>Status</dt>
									<dd>
										{purchasePackage.isDelivered ? "Received" : "In Transit"}
									</dd>
								</div>
							</dl>

							<h3>Cards</h3>

							<table>
								<thead>
									<tr>
										<th>Player</th>
										<th>Category</th>
										<th>Year</th>
										<th>Set</th>
										<th>Info</th>

										{isExpanded && <th>Hammer Price</th>}
									</tr>
								</thead>

								<tbody>
									{purchasePackage.cards.map((card) => (
										<tr key={card.cardId}>
											<td>{card.player}</td>
											<td>{card.category ?? "—"}</td>
											<td>{card.year ?? "—"}</td>
											<td>{card.setName ?? "—"}</td>
											<td>{card.info ?? "—"}</td>

											{isExpanded && (
												<td>{formatCurrency(card.hammerPrice)}</td>
											)}
										</tr>
									))}
								</tbody>
							</table>

							{isExpanded && (
								<div>
									<dl>
										<div>
											<dt>Items Subtotal</dt>
											<dd>{formatCurrency(purchasePackage.itemsSubtotal)}</dd>
										</div>

										<div>
											<dt>Shipping</dt>
											<dd>{formatCurrency(purchasePackage.shippingTotal)}</dd>
										</div>

										<div>
											<dt>Taxes</dt>
											<dd>{formatCurrency(purchasePackage.taxesTotal)}</dd>
										</div>
									</dl>
								</div>
							)}
						</section>
					);
				})}
			</div>

			<PackageModal
				isOpen={editingPackage !== null}
				mode='edit'
				location='packages'
				purchasePackage={editingPackage}
				isSaving={isSavingPurchasePackage}
				error={purchasePackageError}
				onClose={handleClosePurchasePackageModal}
				onSubmit={handleUpdatePurchasePackage}
			/>
		</>
	);
}
