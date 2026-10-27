"use client";

import { useState } from "react";
import {
	createCard,
	deleteCard,
	sellCard,
	updateCard,
	updateCards,
} from "@/app/actions/cards";
import { Modal } from "@/components/Modal/Modal";
import { Button } from "@/components/Button/Button";
import { InputText } from "@/components/InputText/InputText";
import { InputDate } from "@/components/InputDate/InputDate";
import { InputCheckbox } from "@/components/InputCheckbox/InputCheckbox";
import { InputSelect } from "@/components/InputSelect/InputSelect";
import { InputAutocomplete } from "@/components/InputAutocomplete/InputAutocomplete";
import type { CardFormOptions } from "@/db/queries/cardFormOptions";
import type { Card } from "@/types/types";

import styles from "@/styles/components/DrawerContent.module.scss";
import modalStyles from "@/styles/components/ModalContent.module.scss";

interface CardStatus {
	id: number;
	name: string;
}

interface CardFormProps {
	statuses: CardStatus[];
	portfolio: "investment" | "collection";
	options: CardFormOptions;
	card?: Card;
	copyFrom?: Card;
	// Bulk edit: two or more cards edited together.
	bulkCards?: Card[];
	onClose?: () => void;
}

// Select value shown when the selected cards don't share a value.
const MIXED = "__mixed";
const MIXED_PLACEHOLDER = "Multiple values";

// Text fields compared against their starting value on bulk save.
const BULK_TEXT_FIELDS = [
	"player",
	"category",
	"year",
	"setName",
	"info",
	"notes",
	"purchaseDate",
	"purchasedFrom",
	"ebaySeller",
	"purchasePrice",
	"grade",
] as const;

type BulkTextField = (typeof BULK_TEXT_FIELDS)[number];

function toFieldValue(value: string | number | null | undefined) {
	return value === null || value === undefined ? "" : String(value);
}

// The value every card shares, or null when they differ.
function getSharedValue(
	cards: Card[],
	getValue: (card: Card) => string,
): string | null {
	const first = getValue(cards[0]);
	return cards.every((card) => getValue(card) === first) ? first : null;
}

export function CardForm({
	statuses,
	portfolio,
	options,
	card,
	onClose,
	copyFrom,
	bulkCards,
}: CardFormProps) {
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const isBulk = bulkCards !== undefined && bulkCards.length > 1;
	const isEditing = card !== undefined || isBulk;
	const initialCard = card ?? copyFrom;
	const [isSavingSale, setIsSavingSale] = useState(false);
	const [saleError, setSaleError] = useState<string | null>(null);
	const [isSharedTouched, setIsSharedTouched] = useState(false);
	const [bulkError, setBulkError] = useState<string | null>(null);

	// Starting value for each text field: shared value in bulk, else the card's.
	function getTextDefault(field: BulkTextField): string {
		if (isBulk) {
			return getSharedValue(bulkCards, (c) => toFieldValue(c[field])) ?? "";
		}

		return toFieldValue(initialCard?.[field]);
	}

	function getTextPlaceholder(field: BulkTextField) {
		if (!isBulk) return undefined;

		const shared = getSharedValue(bulkCards, (c) => toFieldValue(c[field]));
		return shared === null ? MIXED_PLACEHOLDER : undefined;
	}

	function getStatusIdForName(name: string | null) {
		return (
			statuses.find((status) => status.name === name)?.id?.toString() ?? ""
		);
	}

	const acquisitionTypeDefault = isBulk
		? (getSharedValue(bulkCards, (c) => c.acquisitionType) ?? MIXED)
		: (initialCard?.acquisitionType ?? "purchased");

	const statusDefault = isBulk
		? (getSharedValue(bulkCards, (c) => getStatusIdForName(c.status)) ?? MIXED)
		: getStatusIdForName(card?.status ?? null);

	const sharedIsShared = isBulk
		? getSharedValue(bulkCards, (c) => String(c.isShared))
		: null;

	const isSharedDefault = isBulk
		? sharedIsShared === "true"
		: (card?.isShared ?? false);

	// Sends only the fields that differ from their starting value.
	async function handleBulkSubmit(formData: FormData) {
		if (!bulkCards) return;

		const changes = new FormData();

		for (const bulkCard of bulkCards) {
			changes.append("ids", String(bulkCard.id));
		}

		for (const field of BULK_TEXT_FIELDS) {
			const value = formData.get(field);

			if (typeof value === "string" && value.trim() !== getTextDefault(field)) {
				changes.set(field, value);
			}
		}

		const acquisitionType = formData.get("acquisitionType");

		if (
			typeof acquisitionType === "string" &&
			acquisitionType !== MIXED &&
			acquisitionType !== acquisitionTypeDefault
		) {
			changes.set("acquisitionType", acquisitionType);
		}

		const statusId = formData.get("statusId");

		if (
			typeof statusId === "string" &&
			statusId !== MIXED &&
			statusId !== statusDefault
		) {
			changes.set("statusId", statusId);
		}

		if (isSharedTouched) {
			changes.set("isShared", String(formData.get("isShared") === "on"));
		}

		setBulkError(null);

		try {
			await updateCards(changes);
			onClose?.();
		} catch (error) {
			setBulkError(
				error instanceof Error ? error.message : "Unable to update cards.",
			);
		}
	}

	async function handleDelete() {
		if (!card) return;

		setIsDeleting(true);
		setDeleteError(null);

		try {
			await deleteCard(card.id);

			setIsDeleteModalOpen(false);
			onClose?.();
		} catch (error) {
			setDeleteError(
				error instanceof Error ? error.message : "Unable to delete this card.",
			);
		} finally {
			setIsDeleting(false);
		}
	}
	async function handleSale(formData: FormData) {
		if (!card) return;

		setIsSavingSale(true);
		setSaleError(null);

		try {
			await sellCard(formData);
			onClose?.();
		} catch (error) {
			setSaleError(
				error instanceof Error ? error.message : "Unable to save sale.",
			);
		} finally {
			setIsSavingSale(false);
		}
	}
	async function handleCardSubmit(formData: FormData) {
		if (isEditing) {
			await updateCard(formData);
		} else {
			await createCard(formData);
		}
		onClose?.();
	}
	return (
		<>
			<form
				className={styles.DrawerForm}
				action={isBulk ? handleBulkSubmit : handleCardSubmit}
			>
				<div className={styles.DrawerForm__section}>
					<input type='hidden' name='portfolio' value={portfolio} />
					{card && <input type='hidden' name='id' value={card.id} />}
					<InputAutocomplete
						name='player'
						label='Player'
						defaultValue={getTextDefault("player")}
						placeholder={getTextPlaceholder("player")}
						options={options.players}
						required={!isBulk}
					/>

					<InputAutocomplete
						name='category'
						label='Category'
						defaultValue={getTextDefault("category")}
						placeholder={getTextPlaceholder("category")}
						options={options.categories}
					/>

					<InputText
						name='year'
						label='Year'
						defaultValue={getTextDefault("year")}
						placeholder={getTextPlaceholder("year")}
					/>

					<InputText
						name='setName'
						label='Set'
						defaultValue={getTextDefault("setName")}
						placeholder={getTextPlaceholder("setName")}
					/>

					<InputText
						name='info'
						label='Info'
						defaultValue={getTextDefault("info")}
						placeholder={getTextPlaceholder("info")}
					/>

					<InputText
						name='notes'
						label='Notes'
						defaultValue={getTextDefault("notes")}
						placeholder={getTextPlaceholder("notes")}
					/>
				</div>
				<div className={styles.DrawerForm__section__header}>
					<hr className={styles.DrawerForm__section__hr} />
					<h3 className={styles.DrawerForm__section__heading}>Acquisition</h3>
				</div>
				<div className={styles.DrawerForm__section}>
					<InputSelect
						name='acquisitionType'
						label='Acquisition Type'
						defaultValue={acquisitionTypeDefault}
						options={[
							...(acquisitionTypeDefault === MIXED
								? [{ label: MIXED_PLACEHOLDER, value: MIXED }]
								: []),
							{
								label: "Purchased",
								value: "purchased",
							},
							{
								label: "Pulled",
								value: "pulled",
							},
						]}
					/>
					<InputDate
						name='purchaseDate'
						label='Purchase Date'
						width='half'
						defaultValue={getTextDefault("purchaseDate")}
					/>
					<InputText
						name='purchasedFrom'
						label='Purchased From'
						defaultValue={getTextDefault("purchasedFrom")}
						placeholder={getTextPlaceholder("purchasedFrom")}
					/>
					<InputText
						name='ebaySeller'
						label='eBay Seller'
						defaultValue={getTextDefault("ebaySeller")}
						placeholder={getTextPlaceholder("ebaySeller")}
					/>
					{card?.soldPrice !== null && card?.soldPrice !== undefined ? (
						<p
							className={`${styles.DrawerForm__info__stacked} ${styles["CardForm__info__stacked--half"]}`}
						>
							<span className={styles.DrawerForm__info__stacked__label}>
								Status
							</span>
							<span className={styles.DrawerForm__info__stacked__value}>
								{card.effectiveStatus ?? card.status ?? "—"}
							</span>
						</p>
					) : (
						<InputSelect
							name='statusId'
							label='Status'
							defaultValue={statusDefault}
							options={[
								...(statusDefault === MIXED
									? [{ label: MIXED_PLACEHOLDER, value: MIXED }]
									: []),
								{ label: "No status", value: "" },
								...statuses
									.filter(
										(status) =>
											status.name !== "Sold" &&
											status.name !== "Pending Payment",
									)
									.sort((a, b) => a.name.localeCompare(b.name))
									.map((status) => ({
										label: status.name,
										value: status.id.toString(),
									})),
							]}
						/>
					)}
					<InputText
						name='grade'
						label='Grade'
						type='number'
						min={1}
						step={0.5}
						defaultValue={getTextDefault("grade")}
						placeholder={getTextPlaceholder("grade")}
					/>
					<InputText
						name='purchasePrice'
						label='Purchase Price'
						type='number'
						leadingIcon='dollar-sign'

						min={0}
						step={0.01}
						defaultValue={getTextDefault("purchasePrice")}
						placeholder={getTextPlaceholder("purchasePrice")}
					/>
					<InputCheckbox
						name='isShared'
						label='Shared on IG'
						type='square'
						defaultChecked={isSharedDefault}
						onChange={() => setIsSharedTouched(true)}
						// Mixed and untouched shows as a dash, not checked or unchecked.
						ref={(input) => {
							if (input) {
								input.indeterminate =
									isBulk && sharedIsShared === null && !isSharedTouched;
							}
						}}
					/>
					{bulkError && (
						<p className='alert' role='alert'>
							{bulkError}
						</p>
					)}
				</div>
				<div className={styles.DrawerForm__actions}>
					{card && (
						<Button
							type='main-lg'
							variant='delete'
							htmlType='button'
							leadingIcon='delete'
							onClick={() => {
								setDeleteError(null);
								setIsDeleteModalOpen(true);
							}}
							label='Delete Card'
						/>
					)}
					<Button
						className={styles["DrawerForm__action--right"]}
						type='main-lg'
						variant='primary'
						htmlType='submit'
						leadingIcon='add-card'
						label={
							isBulk
								? `Save ${bulkCards.length} Cards`
								: isEditing
									? "Save Changes"
									: "Add Card"
						}
					/>
				</div>
			</form>
			{card && portfolio === "investment" && (
				<form action={handleSale}>
					<div className={styles.DrawerForm__section__header}>
						<hr className={styles.DrawerForm__section__hr} />
						<h3 className={styles.DrawerForm__section__heading}>Sale</h3>
					</div>
					<p className={styles.DrawerForm__info}>
						<span className={styles.DrawerForm__info__label}>Total Cost:</span>
						<span className={styles.DrawerForm__info__value}>
							{card.totalCost !== null
								? `$${card.totalCost.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}`
								: "Unknown"}
						</span>
					</p>
					<div className={styles.DrawerForm__section}>
						<input type='hidden' name='id' value={card.id} />

						<InputText
							name='soldVia'
							label='Sold Via'
							defaultValue={card.soldVia ?? ""}
						/>

						<InputDate
							name='soldDate'
							label='Sold Date'

							defaultValue={card.soldDate ?? ""}
						/>
						<InputText
							name='soldPrice'
							label='Sold Price'
							type='number'
							leadingIcon='dollar-sign'
							min={0}
							step={0.01}
							defaultValue={card.soldPrice ?? ""}
							required
						/>

						<InputCheckbox
							name='isPaid'
							label='Payment Received'
							type='square'
							defaultChecked={card.isPaid}
						/>

						{saleError && (
							<p className='alert' role='alert'>
								{saleError}
							</p>
						)}
					</div>
					<div className={styles.DrawerForm__actions}>
						<Button
							className={styles["DrawerForm__action--right"]}
							type='main-lg'
							variant='primary'
							leadingIcon='investments'
							htmlType='submit'
							disabled={isSavingSale}
							label={
								isSavingSale
									? "Saving..."
									: card.soldPrice !== null
										? "Save Changes"
										: "Sell Card"
							}
							trailingIcon={isSavingSale ? "loading" : undefined}
						/>
					</div>
				</form>
			)}
			<Modal
				isOpen={isDeleteModalOpen}
				title='Delete Card'
				onClose={() => setIsDeleteModalOpen(false)}
			>
				<p>
					Are you sure you want to permanently delete{" "}
					<strong>{card?.player}</strong>? <br />
				</p>
				<p className={modalStyles.ModalContent__small}>
					This action cannot be undone.
				</p>

				{deleteError && (
					<p className='alert' role='alert'>
						{deleteError}
					</p>
				)}
				<div className={modalStyles.ModalContent__actions}>
					<Button
						className={modalStyles.ModalContent__button}
						type='main'
						variant='primary'
						label='Cancel'
						onClick={() => setIsDeleteModalOpen(false)}
						disabled={isDeleting}
					/>
					<Button
						className={modalStyles.ModalContent__button}
						type='main'
						variant='delete'
						htmlType='button'
						onClick={handleDelete}
						disabled={isDeleting}
						label={isDeleting ? "Deleting..." : "Delete Card"}
					/>
				</div>
			</Modal>
		</>
	);
}
