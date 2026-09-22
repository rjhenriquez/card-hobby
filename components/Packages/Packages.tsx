"use client";

import { useState, Fragment } from "react";
import {
	markPurchasePackageReceived,
	updatePurchasePackage,
} from "@/app/actions/purchasePackages";
import { PackageDrawer, PurchasePackage } from "../PackageDrawer/PackageDrawer";
import { Accordion } from "@/components/Accordion/Accordion";
import { formatDayWithOrdinal } from "@/lib/formatters";
import { Icon } from "@/components/Icons/Icons";
import { Button } from "@/components/Button/Button";
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
				<p className='alert' role='alert'>
					{purchasePackageError}
				</p>
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
						<div className={styles.Package} key={purchasePackage.id}>
							<header className={styles.Package__header}>
								<h2 className={styles.Package__heading}>
									{purchasePackage.cards.length === 1
										? `${purchasePackage.cards[0].player} from ${purchasePackage.source ?? "Unknown"}.`
										: `${purchasePackage.cards.length} cards from ${purchasePackage.source ?? "Unknown"}.`}
									{purchasePackage.seller && (
										<span>Seller: {purchasePackage.seller}</span>
									)}
								</h2>
								<div className={styles.Package__header__actions}>
									<Button
										type='icon'
										htmlType='button'
										leadingIcon='edit'
										tooltip='Edit'
										onClick={() => {
											setPurchasePackageError(null);
											setEditingPackage(purchasePackage);
										}}
									/>

									<Button
										type='icon'
										htmlType='button'
										leadingIcon='received'
										tooltip='Mark as Received'
										onClick={() => handleMarkReceived(purchasePackage.id)}
										disabled={isReceiving}
									/>
								</div>
							</header>
							<div className={styles.Package__content}>
								<div className={styles.Package__content__top}>
									<div className={styles.Package__content__info}>
										<p className={styles.Package__content__label}>
											Package Value:
										</p>
										<p className={styles.Package__content__value}>
											<span>$</span>
											{formatCurrency(totalValue).replace("$", "")}
										</p>
									</div>
								</div>
								<dl className={styles["Package__description-list"]}>
									<div className={styles["Package__description-list__wrapper"]}>
										<dt>Carrier</dt>
										<dd>{purchasePackage.carrier ?? "—"}</dd>
									</div>

									<div className={styles["Package__description-list__wrapper"]}>
										<dt>ETA</dt>
										<dd>
											{formatDayWithOrdinal(
												purchasePackage.estimatedDeliveryDate,
											)}
										</dd>
									</div>

									<div className={styles["Package__description-list__wrapper"]}>
										<dt>Status</dt>
										<dd>
											{purchasePackage.isDelivered ? "Received" : "In Transit"}
										</dd>
									</div>
									<div className={styles["Package__description-list__wrapper"]}>
										<dt>Tracking</dt>
										<dd>
											{trackingUrl && (
												<>
													{" "}
													<a
														className={styles.Package__link}
														href={trackingUrl}
														target='_blank'
														rel='noreferrer'
													>
														<span>{purchasePackage.trackingNumber ?? "—"}</span>
														<Icon
															className={styles.Package__link__icon}
															icon='open'
														/>
													</a>
												</>
											)}
										</dd>
									</div>
								</dl>
								<Accordion
									icon='arrow-down'
									label='Package Details'
									className={styles.Package__accordion}
								>
									<div className={styles.Package__cards}>
										<table className={styles.Package__table}>
											<thead>
												<tr>
													<th>Card</th>
													<th>Price</th>
												</tr>
											</thead>

											<tbody>
												{purchasePackage.cards.map((card) => (
													<tr key={card.cardId}>
														<td>
															{[card.player, card.year, card.setName, card.info]
																.filter(Boolean)
																.join(" ")}
														</td>

														<td className={styles.Package__cards__number}>
															{formatCurrency(card.hammerPrice)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>

									<div className={styles.Package__financials}>
										<dl
											className={`${styles["Package__description-list"]} ${
												styles["Package__description-list--financials"]
											}`}
										>
											<div
												className={styles["Package__description-list__wrapper"]}
											>
												<dt>Items Subtotal</dt>
												<dd className={styles.Package__financials__number}>
													{formatCurrency(purchasePackage.itemsSubtotal)}
												</dd>
											</div>

											<div
												className={styles["Package__description-list__wrapper"]}
											>
												<dt>Shipping</dt>
												<dd className={styles.Package__financials__number}>
													{formatCurrency(purchasePackage.shippingTotal)}
												</dd>
											</div>

											<div
												className={styles["Package__description-list__wrapper"]}
											>
												<dt>Taxes</dt>
												<dd className={styles.Package__financials__number}>
													{formatCurrency(purchasePackage.taxesTotal)}
												</dd>
											</div>
										</dl>
									</div>
								</Accordion>
							</div>
						</div>
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
