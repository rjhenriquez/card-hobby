"use client";

import { useState } from "react";

import {
	addCardToPurchasePackage,
	markPurchasePackageReceived,
	removeCardFromPurchasePackage,
	updatePurchasePackage,
} from "@/app/actions/purchasePackages";
import {
	PackageDrawer,
	PurchasePackage,
	AvailableCard,
} from "../PackageDrawer/PackageDrawer";
import { formatDayWithOrdinal } from "@/lib/formatters";

interface PackagesNewProps {
	purchasePackages: PurchasePackage[];
	availableCards: AvailableCard[];
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

export function PackagesNew({
	purchasePackages,
	availableCards,
}: PackagesNewProps) {
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

	const [addingToPackageId, setAddingToPackageId] = useState<number | null>(
		null,
	);
	const [selectedCardId, setSelectedCardId] = useState("");
	const [hammerPrice, setHammerPrice] = useState("");
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

	async function handleRemoveCard(packageId: number, cardId: number) {
		setPurchasePackageError(null);
		try {
			await removeCardFromPurchasePackage(packageId, cardId);
		} catch (error) {
			setPurchasePackageError(
				error instanceof Error
					? error.message
					: "Unable to remove card from package.",
			);
		}
	}

	if (purchasePackages.length === 0) {
		return <p>No packages yet.</p>;
	}

	async function handleAddCard(packageId: number) {
		const cardId = Number(selectedCardId);

		if (!Number.isInteger(cardId) || hammerPrice.trim() === "") {
			setPurchasePackageError("Select a card and enter its hammer price.");
			return;
		}

		setPurchasePackageError(null);

		try {
			await addCardToPurchasePackage(packageId, cardId, hammerPrice);
			setAddingToPackageId(null);
			setSelectedCardId("");
			setHammerPrice("");
		} catch (error) {
			setPurchasePackageError(
				error instanceof Error
					? error.message
					: "Unable to add card to package.",
			);
		}
	}

	return (
		<>
			{purchasePackageError && !editingPackage && (
				<p className='alert' role='alert'>
					{purchasePackageError}
				</p>
			)}

			<div className='packagesNew'>
				{purchasePackages.map((purchasePackage) => {
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
						<article className='packagesNew__package' key={purchasePackage.id}>
							<header className='packagesNew__header'>
								<div>
									<p className='packagesNew__eyebrow'>
										{purchasePackage.isDelivered
											? "Received Package"
											: "Incoming Package"}
									</p>

									<h2>
										{purchasePackage.cards.length === 1
											? `${purchasePackage.cards[0].player} from ${purchasePackage.source ?? "Unknown"}`
											: `${purchasePackage.cards.length} cards from ${purchasePackage.source ?? "Unknown"}`}
									</h2>

									{purchasePackage.seller && (
										<p>Seller: {purchasePackage.seller}</p>
									)}
								</div>

								<div className='packagesNew__actions'>
									<button
										type='button'
										onClick={() => {
											setPurchasePackageError(null);
											setEditingPackage(purchasePackage);
										}}
									>
										Edit
									</button>

									<button
										type='button'
										onClick={() => handleMarkReceived(purchasePackage.id)}
										disabled={isReceiving}
									>
										{isReceiving ? "Receiving..." : "Mark Received"}
									</button>
								</div>
							</header>

							<div className='packagesNew__summary'>
								<div>
									<p>Package Value</p>
									<strong>{formatCurrency(totalValue)}</strong>
								</div>

								<div>
									<p>Carrier</p>
									<strong>{purchasePackage.carrier ?? "—"}</strong>
								</div>

								<div>
									<p>ETA</p>
									<strong>
										{formatDayWithOrdinal(
											purchasePackage.estimatedDeliveryDate,
										)}
									</strong>
								</div>

								<div>
									<p>Status</p>
									<strong>
										{purchasePackage.isDelivered ? "Received" : "In Transit"}
									</strong>
								</div>

								<div>
									<p>Tracking</p>

									{trackingUrl ? (
										<a href={trackingUrl} target='_blank' rel='noreferrer'>
											{purchasePackage.trackingNumber}
										</a>
									) : (
										<strong>—</strong>
									)}
								</div>
							</div>

							<div className='packagesNew__details'>
								<div>
									<p className='packagesNew__eyebrow'>Cards</p>
									<h3>Package Contents</h3>
								</div>

								<table className='packagesNew__table'>
									<thead>
										<tr>
											<th>Card</th>
											<th>Price</th>
											<th></th>
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
												<td>{formatCurrency(card.hammerPrice)}</td>
												<td className='packagesNew__table-action'>
													<button
														type='button'
														className='packagesNew__remove'
														onClick={() =>
															handleRemoveCard(purchasePackage.id, card.cardId)
														}
													>
														Remove
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
								<div className='packagesNew__add-card'>
									{addingToPackageId === purchasePackage.id ? (
										<div className='packagesNew__add-card-form'>
											<select
												value={selectedCardId}
												onChange={(event) =>
													setSelectedCardId(event.target.value)
												}
											>
												<option value=''>Select card</option>

												{availableCards.map((card) => (
													<option key={card.id} value={card.id}>
														{[card.player, card.year, card.setName, card.info]
															.filter(Boolean)
															.join(" ")}
													</option>
												))}
											</select>

											<input
												type='number'
												min='0'
												step='0.01'
												placeholder='Hammer price'
												value={hammerPrice}
												onChange={(event) => setHammerPrice(event.target.value)}
											/>

											<button
												type='button'
												onClick={() => handleAddCard(purchasePackage.id)}
											>
												Add
											</button>

											<button
												type='button'
												onClick={() => {
													setAddingToPackageId(null);
													setSelectedCardId("");
													setHammerPrice("");
												}}
											>
												Cancel
											</button>
										</div>
									) : (
										<button
											type='button'
											className='packagesNew__add-card-button'
											onClick={() => {
												setPurchasePackageError(null);
												setAddingToPackageId(purchasePackage.id);
											}}
											disabled={availableCards.length === 0}
										>
											+ Add Card
										</button>
									)}
								</div>

								<dl className='packagesNew__financials'>
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

									<div>
										<dt>Total</dt>
										<dd>{formatCurrency(totalValue)}</dd>
									</div>
								</dl>
							</div>
						</article>
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
