"use client";

import { useState } from "react";
import {
	markPurchasePackageReceived,
	updatePurchasePackage,
} from "@/app/actions/purchasePackages";
import { PackageDrawer, PurchasePackage } from "../PackageDrawer/PackageDrawer";

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

function getTrackingUrl(carrier: string | null, trackingNumber: string | null) {
	if (!carrier || !trackingNumber) {
		return null;
	}

	const encodedTrackingNumber = encodeURIComponent(trackingNumber);

	switch (carrier) {
		case "USPS":
			return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodedTrackingNumber}`;

		case "UPS":
			return `https://www.ups.com/track?tracknum=${encodedTrackingNumber}`;

		case "FedEx":
			return `https://www.fedex.com/fedextrack/?trknbr=${encodedTrackingNumber}`;

		case "DHL":
			return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${encodedTrackingNumber}`;

		default:
			return null;
	}
}

export function Packages({ purchasePackages }: PackagesProps) {
	const [expandedPackageIds, setExpandedPackageIds] = useState<number[]>([]);
	const [editingPackage, setEditingPackage] = useState<PurchasePackage | null>(
		null,
	);
	const [isSavingPurchasePackage, setIsSavingPurchasePackage] = useState(false);
	const [receivingPackageId, setReceivingPackageId] = useState<number | null>(
		null,
	);
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

	function handleClosePurchasePackageDrawer() {
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

	async function handleMarkReceived(packageId: number) {
		setPurchasePackageError(null);
		setReceivingPackageId(packageId);

		try {
			await markPurchasePackageReceived(packageId);
		} catch (error) {
			setPurchasePackageError(
				error instanceof Error
					? error.message
					: "Unable to mark package as received.",
			);
		} finally {
			setReceivingPackageId(null);
		}
	}

	if (purchasePackages.length === 0) {
		return <p>No packages yet.</p>;
	}

	return (
		<>
			{purchasePackageError && !editingPackage && (
				<p role='alert'>{purchasePackageError}</p>
			)}

			<div className={styles.Packages}>
				{purchasePackages.map((purchasePackage) => {
					const isExpanded = expandedPackageIds.includes(purchasePackage.id);

					const totalValue =
						Number(purchasePackage.itemsSubtotal) +
						Number(purchasePackage.shippingTotal) +
						Number(purchasePackage.taxesTotal);

					const trackingUrl = getTrackingUrl(
						purchasePackage.carrier,
						purchasePackage.trackingNumber,
					);

					const isReceiving = receivingPackageId === purchasePackage.id;

					return (
						<section key={purchasePackage.id}>
							<header>
								<div>
									<h2>
										{purchasePackage.source
											? `${purchasePackage.source} Package #${purchasePackage.id}`
											: `Package #${purchasePackage.id}`}
									</h2>

									{purchasePackage.seller && (
										<p>Seller: {purchasePackage.seller}</p>
									)}
									<p>{formatCurrency(totalValue)}</p>
								</div>

								<div>
									{!purchasePackage.isDelivered && (
										<button
											type='button'
											disabled={isReceiving}
											onClick={() => handleMarkReceived(purchasePackage.id)}
										>
											{isReceiving ? "Receiving..." : "Mark Received"}
										</button>
									)}

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
									<dd>
										{purchasePackage.trackingNumber ?? "—"}

										{trackingUrl && (
											<>
												{" "}
												<a href={trackingUrl} target='_blank' rel='noreferrer'>
													Track Package
												</a>
											</>
										)}
									</dd>
								</div>

								<div>
									<dt>ETA</dt>
									<dd>{purchasePackage.estimatedDeliveryDate ?? "—"}</dd>
								</div>

								<div>
									<dt>Status</dt>
									<dd>
										<strong>
											{purchasePackage.isDelivered ? "Received" : "In Transit"}
										</strong>
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

			<PackageDrawer
				isOpen={editingPackage !== null}
				mode='edit'
				location='packages'
				purchasePackage={editingPackage}
				isSaving={isSavingPurchasePackage}
				error={purchasePackageError}
				onClose={handleClosePurchasePackageDrawer}
				onSubmit={handleUpdatePurchasePackage}
			/>
		</>
	);
}
