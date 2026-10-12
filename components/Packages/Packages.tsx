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
import { Button } from "@/components/Button/Button";
import { Modal } from "@/components/Modal/Modal";
import { Icon } from "@/components/Icons/Icons";
import { InputSelect } from "@/components/InputSelect/InputSelect";
import { InputText } from "@/components/InputText/InputText";
import { formatDayWithOrdinal } from "@/lib/formatters";
import cn from "classnames";

import modalStyles from "@/styles/components/ModalContent.module.scss";
import styles from "./Packages.module.scss";

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

export function Packages({
	purchasePackages,
	availableCards,
}: PackagesNewProps) {
	const [openPackageIds, setOpenPackageIds] = useState<number[]>([]);

	function togglePackage(packageId: number) {
		setOpenPackageIds((current) =>
			current.includes(packageId)
				? current.filter((id) => id !== packageId)
				: [...current, packageId],
		);
	}
	const [editingPackage, setEditingPackage] = useState<PurchasePackage | null>(
		null,
	);
	const [isSavingPurchasePackage, setIsSavingPurchasePackage] = useState(false);
	const [receivingPackageId, setReceivingPackageId] = useState<number | null>(
		null,
	);
	const [cardToRemove, setCardToRemove] = useState<{
		packageId: number;
		cardId: number;
		cardName: string;
	} | null>(null);

	const [isRemovingCard, setIsRemovingCard] = useState(false);
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

	async function handleRemoveCard() {
		if (!cardToRemove) {
			return;
		}
		setPurchasePackageError(null);
		setIsRemovingCard(true);
		try {
			await removeCardFromPurchasePackage(
				cardToRemove.packageId,
				cardToRemove.cardId,
			);
			setCardToRemove(null);
		} catch (error) {
			setPurchasePackageError(
				error instanceof Error
					? error.message
					: "Unable to remove card from package.",
			);
		} finally {
			setIsRemovingCard(false);
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

			<div className={styles.Packages}>
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
					const isOpen = openPackageIds.includes(purchasePackage.id);

					return (
						<article className={styles.Package} key={purchasePackage.id}>
							<header className={styles.Package__header}>
								<div className={styles.Package__heading}>
									<p className={styles.Package__eyebrow}>
										Seller: {purchasePackage.seller}
									</p>

									<h2 className={styles.Package__title}>
										{purchasePackage.cards.length === 1
											? `${purchasePackage.cards[0].player} from ${purchasePackage.source ?? "Unknown"}`
											: `${purchasePackage.cards.length} cards from ${purchasePackage.source ?? "Unknown"}`}
									</h2>

									{purchasePackage.seller && (
										<p className={styles.Package__subhead}>
											<span>Package Value: </span>
											<span className={styles.Package__subhead__number}>
												{formatCurrency(totalValue)}
											</span>
										</p>
									)}
								</div>

								<div className={styles.Package__actions}>
									<div className={styles.Package__actions__section}>
										<Button
											type='main'
											variant='primary'
											htmlType='button'
											leadingIcon='edit'
											label='Edit'
											onClick={() => {
												setPurchasePackageError(null);
												setEditingPackage(purchasePackage);
											}}
										/>

										<Button
											type='main'
											variant='primary'
											htmlType='button'
											leadingIcon='received'
											label={isReceiving ? "Receiving..." : "Mark Received"}
											onClick={() => handleMarkReceived(purchasePackage.id)}
											disabled={isReceiving}
										/>
									</div>
									<span className={styles.Package__actions__divider} />
									<Button
										className={cn(styles.Package__trigger, {
											[styles["Package__trigger--open"]]: isOpen,
										})}
										type='icon'
										variant='primary'
										htmlType='button'
										leadingIcon='arrow-left'
										tooltip={isOpen ? "Hide Contents" : "Show Contents"}
										onClick={() => togglePackage(purchasePackage.id)}
									/>
								</div>
							</header>

							<div
								className={cn(styles.Package__content, {
									[styles["Package__content--open"]]: isOpen,
								})}
							>
								<div className={styles.Package__content__inner}>
									<dl className={styles.Package__summary}>
										<div className={styles.Package__summary__wrapper}>
											<dt>Carrier</dt>
											<dd>{purchasePackage.carrier ?? "—"}</dd>
										</div>

										<div className={styles.Package__summary__wrapper}>
											<dt>ETA</dt>
											<dd>
												{formatDayWithOrdinal(
													purchasePackage.estimatedDeliveryDate,
												)}
											</dd>
										</div>

										<div className={styles.Package__summary__wrapper}>
											<dt>Status</dt>
											<dd>
												{purchasePackage.isDelivered
													? "Received"
													: "In Transit"}
											</dd>
										</div>

										<div className={styles.Package__summary__wrapper}>
											<dt>Tracking</dt>
											<dd>
												{trackingUrl ? (
													<a
														className={styles.Package__link}
														href={trackingUrl}
														target='_blank'
														rel='noreferrer'
													>
														{purchasePackage.trackingNumber}

														<Icon
															icon='open'
															className={styles.Package__link__icon}
														/>
													</a>
												) : (
													"—"
												)}
											</dd>
										</div>
									</dl>
									<div className={styles.Package__content__wrapper}>
										<table className={styles.Package__table}>
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

														<td className={styles.Package__table__number}>
															{formatCurrency(card.hammerPrice)}
														</td>

														<td>
															<Button
																type='icon-sm'
																variant='delete'
																htmlType='button'
																leadingIcon='delete'
																tooltip='Remove'
																tooltipPosition='left'
																onClick={() =>
																	setCardToRemove({
																		packageId: purchasePackage.id,
																		cardId: card.cardId,
																		cardName: [
																			card.player,
																			card.year,
																			card.setName,
																			card.info,
																		]
																			.filter(Boolean)
																			.join(" "),
																	})
																}
															/>
														</td>
													</tr>
												))}
											</tbody>
										</table>
										<div className={styles["Package__add-card"]}>
											{addingToPackageId === purchasePackage.id ? (
												<div className={styles["Package__add-card__form"]}>
													<InputSelect
														name='cardId'
														value={selectedCardId}
														onChange={(event) =>
															setSelectedCardId(event.target.value)
														}
														options={[
															{
																label: "Select card",
																value: "",
															},
															...availableCards.map((card) => ({
																label: [
																	card.player,
																	card.year,
																	card.setName,
																	card.info,
																]
																	.filter(Boolean)
																	.join(" "),
																value: card.id.toString(),
															})),
														]}
													/>

													<InputText
														name='hammerPrice'
														type='number'
														min={0}
														step={0.01}
														placeholder='Hammer price'
														leadingIcon='dollar-sign'
														value={hammerPrice}
														onChange={(event) =>
															setHammerPrice(event.target.value)
														}
													/>

													<Button
														type='main'
														variant='primary'
														htmlType='button'
														label='Add'
														onClick={() => handleAddCard(purchasePackage.id)}
													/>

													<Button
														type='main'
														variant='delete'
														htmlType='button'
														label='Cancel'
														onClick={() => {
															setAddingToPackageId(null);
															setSelectedCardId("");
															setHammerPrice("");
														}}
													/>
												</div>
											) : (
												<Button
													type='main'
													variant='primary'
													htmlType='button'
													leadingIcon='add-card'
													label='Add Card'
													className={styles["Package__add-card__main"]}
													onClick={() => {
														setPurchasePackageError(null);
														setAddingToPackageId(purchasePackage.id);
													}}
													disabled={availableCards.length === 0}
												/>
											)}
										</div>
									</div>
									<dl className={styles.Package__financials}>
										<div className={styles.Package__financials__wrapper}>
											<dt>Items Subtotal</dt>
											<dd>{formatCurrency(purchasePackage.itemsSubtotal)}</dd>
										</div>

										<div className={styles.Package__financials__wrapper}>
											<dt>Shipping</dt>
											<dd>{formatCurrency(purchasePackage.shippingTotal)}</dd>
										</div>

										<div className={styles.Package__financials__wrapper}>
											<dt>Taxes</dt>
											<dd>{formatCurrency(purchasePackage.taxesTotal)}</dd>
										</div>

										<div
											className={`${styles.Package__financials__wrapper} ${
												styles["Package__financials__wrapper--highlight"]
											}`}
										>
											<dt>Total</dt>
											<dd>{formatCurrency(totalValue)}</dd>
										</div>
									</dl>
								</div>
							</div>
						</article>
					);
				})}
			</div>
			<Modal
				isOpen={cardToRemove !== null}
				title='Remove Card'
				onClose={() => {
					if (!isRemovingCard) {
						setCardToRemove(null);
					}
				}}
			>
				<p>
					Are you sure you want to remove{" "}
					<strong>{cardToRemove?.cardName}</strong> from this package?
				</p>
				{purchasePackageError && cardToRemove && (
					<p className='alert' role='alert'>
						{purchasePackageError}
					</p>
				)}
				<div className={modalStyles.ModalContent__actions}>
					<Button
						type='main'
						htmlType='button'
						onClick={handleRemoveCard}
						disabled={isRemovingCard}
						label={isRemovingCard ? "Removing..." : "Remove Card"}
					/>
					<Button
						type='main'
						htmlType='button'
						label='Cancel'
						onClick={() => setCardToRemove(null)}
						disabled={isRemovingCard}
					/>
				</div>
			</Modal>
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
