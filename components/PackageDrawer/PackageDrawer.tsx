"use client";

import { useEffect, useState } from "react";
import { Drawer } from "@/components/Drawer/Drawer";

import styles from "./PackageDrawer.module.scss";

export type PackageDrawerLocation = "investment" | "collection" | "packages";

export interface PackageDrawerCard {
	id: number;
	player: string;
	category?: string | null;
	year?: string | null;
	setName?: string | null;
	info?: string | null;
}

export interface PurchasePackageCard {
	purchasePackageId: number;
	cardId: number;
	player: string;
	category: string | null;
	year: string | null;
	setName: string | null;
	info: string | null;
	hammerPrice: string;
}

export interface PurchasePackage {
	id: number;
	itemsSubtotal: string;
	shippingTotal: string;
	taxesTotal: string;
	carrier: string | null;
	trackingNumber: string | null;
	estimatedDeliveryDate: string | null;
	isDelivered: boolean;
	createdAt: Date;
	cards: PurchasePackageCard[];
}

interface PackageDrawerProps {
	isOpen: boolean;
	mode: "create" | "edit";
	location: PackageDrawerLocation;
	purchasePackage?: PurchasePackage | null;
	selectedCards?: PackageDrawerCard[];
	isSaving: boolean;
	error?: string | null;
	onClose: () => void;
	onSubmit: (formData: FormData) => Promise<void>;
}

export function PackageDrawer({
	isOpen,
	mode,
	location,
	purchasePackage,
	selectedCards = [],
	isSaving,
	error,
	onClose,
	onSubmit,
}: PackageDrawerProps) {
	const [isExpanded, setIsExpanded] = useState(location !== "packages");

	const isEditing = mode === "edit";

	const cards = isEditing ? (purchasePackage?.cards ?? []) : selectedCards;

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		setIsExpanded(location !== "packages");
	}, [isOpen, location, purchasePackage?.id]);

	const title = isEditing
		? `Edit Purchase Package #${purchasePackage?.id ?? ""}`
		: "Create Purchase Package";

	return (
		<Drawer isOpen={isOpen} title={title} onClose={onClose}>
			<div className={styles.PackageDrawer}>
				<p>
					{cards.length} card
					{cards.length === 1 ? "" : "s"} selected.
				</p>

				{error && <p role='alert'>{error}</p>}

				<form action={onSubmit}>
					{isEditing && purchasePackage && (
						<input type='hidden' name='id' value={purchasePackage.id} />
					)}

					<label>
						Carrier
						<select
							name='carrier'
							defaultValue={purchasePackage?.carrier ?? ""}
						>
							<option value=''>Select carrier</option>
							<option value='USPS'>USPS</option>
							<option value='UPS'>UPS</option>
							<option value='FedEx'>FedEx</option>
							<option value='DHL'>DHL</option>
							<option value='Other'>Other</option>
						</select>
					</label>

					<label>
						Tracking Number
						<input
							type='text'
							name='trackingNumber'
							defaultValue={purchasePackage?.trackingNumber ?? ""}
						/>
					</label>

					<label>
						ETA
						<input
							type='date'
							name='estimatedDeliveryDate'
							defaultValue={purchasePackage?.estimatedDeliveryDate ?? ""}
						/>
					</label>

					{isEditing && (
						<label>
							<input
								type='checkbox'
								name='isDelivered'
								defaultChecked={purchasePackage?.isDelivered ?? false}
							/>
							Received
						</label>
					)}

					{location === "packages" && (
						<button
							type='button'
							onClick={() => setIsExpanded((current) => !current)}
						>
							{isExpanded ? "Collapse Financials" : "Edit Financials"}
						</button>
					)}

					{isExpanded ? (
						<>
							<label>
								Items Subtotal
								<input
									type='number'
									name='itemsSubtotal'
									min='0'
									step='0.01'
									defaultValue={purchasePackage?.itemsSubtotal ?? ""}
									required
								/>
							</label>

							<label>
								Shipping Total
								<input
									type='number'
									name='shippingTotal'
									min='0'
									step='0.01'
									defaultValue={purchasePackage?.shippingTotal ?? ""}
									required
								/>
							</label>

							<label>
								Taxes Total
								<input
									type='number'
									name='taxesTotal'
									min='0'
									step='0.01'
									defaultValue={purchasePackage?.taxesTotal ?? ""}
									required
								/>
							</label>

							<h3>Cards</h3>

							{isEditing
								? purchasePackage?.cards.map((card) => (
										<div key={card.cardId}>
											<strong>
												{card.player}
												{card.category && ` — ${card.category}`}
												{card.year && ` — ${card.year}`}
												{card.setName && ` ${card.setName}`}
												{card.info && ` — ${card.info}`}
											</strong>

											<label>
												Hammer Price
												<input
													type='number'
													name={`hammerPrice-${card.cardId}`}
													min='0'
													step='0.01'
													defaultValue={card.hammerPrice}
													required
												/>
											</label>
										</div>
									))
								: selectedCards.map((card) => (
										<div key={card.id}>
											<strong>
												{card.player}
												{card.category && ` — ${card.category}`}
												{card.year && ` — ${card.year}`}
												{card.setName && ` ${card.setName}`}
												{card.info && ` — ${card.info}`}
											</strong>

											<label>
												Hammer Price
												<input
													type='number'
													name={`hammerPrice-${card.id}`}
													min='0'
													step='0.01'
													required
												/>
											</label>
										</div>
									))}
						</>
					) : (
						isEditing &&
						purchasePackage && (
							<>
								<input
									type='hidden'
									name='itemsSubtotal'
									value={purchasePackage.itemsSubtotal}
								/>

								<input
									type='hidden'
									name='shippingTotal'
									value={purchasePackage.shippingTotal}
								/>

								<input
									type='hidden'
									name='taxesTotal'
									value={purchasePackage.taxesTotal}
								/>

								{purchasePackage.cards.map((card) => (
									<input
										key={card.cardId}
										type='hidden'
										name={`hammerPrice-${card.cardId}`}
										value={card.hammerPrice}
									/>
								))}
							</>
						)
					)}

					<button type='submit' disabled={isSaving}>
						{isSaving
							? "Saving..."
							: isEditing
								? "Save Purchase Package"
								: "Create Purchase Package"}
					</button>
				</form>

				<button type='button' onClick={onClose} disabled={isSaving}>
					Cancel
				</button>
			</div>
		</Drawer>
	);
}
