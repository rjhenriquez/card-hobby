"use client";

import { useEffect, useState } from "react";
import { Drawer } from "@/components/Drawer/Drawer";
import { InputSelect } from "@/components/InputSelect/InputSelect";
import { InputCheckbox } from "@/components/InputCheckbox/InputCheckbox";
import { Accordion } from "@/components/Accordion/Accordion";
import { InputText } from "@/components/InputText/InputText";
import { Button } from "@/components/Button/Button";
import { InputDate } from "@/components/InputDate/InputDate";

import styles from "@/styles/components/DrawerContent.module.scss";

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
	source: string | null;
	seller: string | null;
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
				<div className={styles.DrawerInfo}>
					<div className={styles.DrawerInfo__section}>
						<h3 className={styles.DrawerInfo__count}>
							{cards.length} card
							{cards.length === 1 ? "" : "s"} selected
						</h3>

						{error && (
							<p className='alert' role='alert'>
								{error}
							</p>
						)}
					</div>
				</div>

				<form className={styles.DrawerForm} action={onSubmit}>
					{isEditing && purchasePackage && (
						<input type='hidden' name='id' value={purchasePackage.id} />
					)}
					<div className={styles.DrawerForm__section}>
						<InputSelect
							name='carrier'
							label='Carrier'
							defaultValue={purchasePackage?.carrier ?? ""}
							options={[
								{ value: "USPS", label: "USPS" },
								{ value: "UPS", label: "UPS" },
								{ value: "FedEx", label: "FedEx" },
								{ value: "DHL", label: "DHL" },
								{ value: "Other", label: "Other" },
							]}
							width='half'
						/>

						<InputText
							name='trackingNumber'
							label='Tracking Number'
							defaultValue={purchasePackage?.trackingNumber ?? ""}
							width='half'
						/>

						<InputDate
							name='estimatedDeliveryDate'
							label='ETA'
							width='half'
							defaultValue={purchasePackage?.estimatedDeliveryDate ?? ""}
						/>

						{isEditing && (
							<InputCheckbox
								name='isDelivered'
								label='Received'
								type='square'
								width='half'
								defaultChecked={purchasePackage?.isDelivered ?? false}
							/>
						)}

						<Accordion
							icon='arrow-down'
							label='Edit Financials'
							defaultOpen={location !== "packages"}
						>
							<div
								className={`${styles.DrawerForm__section} ${
									styles.DrawerForm__section__accordion
								}`}
							>
								<InputText
									name='itemsSubtotal'
									label='Items Subtotal'
									type='number'
									leadingIcon='dollar-sign'
									min={0}
									step={0.01}
									defaultValue={purchasePackage?.itemsSubtotal ?? ""}
								/>

								<InputText
									label='Shipping Total'
									name='shippingTotal'
									type='number'
									leadingIcon='dollar-sign'
									width='half'
									min={0}
									step={0.01}
									defaultValue={purchasePackage?.shippingTotal ?? ""}
									required
								/>

								<InputText
									label='Taxes Total'
									name='taxesTotal'
									type='number'
									leadingIcon='dollar-sign'
									width='half'
									min={0}
									step={0.01}
									defaultValue={purchasePackage?.taxesTotal ?? ""}
									required
								/>

								<h4 className={styles.DrawerForm__section__title}>Cards</h4>

								{isEditing
									? purchasePackage?.cards.map((card) => (
											<div
												key={card.cardId}
												className={styles.DrawerForm__section__card}
											>
												<p className={styles.DrawerForm__section__card__name}>
													{card.player}
													{card.year && ` ${card.year}`}
													{card.setName && ` ${card.setName}`}
													{card.info && ` ${card.info}`}
												</p>

												<InputText
													label='Hammer Price'
													type='number'
													name={`hammerPrice-${card.cardId}`}
													leadingIcon='dollar-sign'
													min={0}
													step={0.01}
													defaultValue={card.hammerPrice}
													required
													width='third'
												/>
											</div>
										))
									: selectedCards.map((card) => (
											<div
												key={card.id}
												className={styles.DrawerForm__section__card}
											>
												<p className={styles.DrawerForm__section__card__name}>
													{card.player}
													{card.category && ` ${card.category}`}
													{card.year && ` ${card.year}`}
													{card.setName && ` ${card.setName}`}
													{card.info && ` ${card.info}`}
												</p>

												<InputText
													label='Hammer Price'
													type='number'
													name={`hammerPrice-${card.id}`}
													leadingIcon='dollar-sign'
													min={0}
													step={0.01}
													required
													width='third'
												/>
											</div>
										))}
							</div>
						</Accordion>
					</div>
					<div className={styles.DrawerForm__actions}>
						<Button
							type='main'
							variant='cancel'
							htmlType='button'
							label='Cancel'
							onClick={onClose}
							disabled={isSaving}
						/>
						<Button
							type='main'
							variant='add'
							htmlType='submit'
							label={
								isSaving
									? "Saving..."
									: isEditing
										? "Save Package"
										: "Create Package"
							}
						/>
					</div>
				</form>
			</div>
		</Drawer>
	);
}
