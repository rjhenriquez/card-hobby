"use client";

import { useState } from "react";
import {
	createCard,
	deleteCard,
	sellCard,
	updateCard,
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
	onClose?: () => void;
}

export function CardForm({
	statuses,
	portfolio,
	options,
	card,
	onClose,
	copyFrom,
}: CardFormProps) {
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const isEditing = card !== undefined;
	const initialCard = card ?? copyFrom;
	const [isSavingSale, setIsSavingSale] = useState(false);
	const [saleError, setSaleError] = useState<string | null>(null);

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
			<form className={styles.DrawerForm} action={handleCardSubmit}>
				<div className={styles.DrawerForm__section}>
					<input type='hidden' name='portfolio' value={portfolio} />
					{card && <input type='hidden' name='id' value={card.id} />}
					<InputAutocomplete
						name='player'
						label='Player'
						defaultValue={initialCard?.player ?? ""}
						options={options.players}
						width='half'
						required
					/>

					<InputAutocomplete
						name='category'
						label='Category'
						defaultValue={initialCard?.category ?? ""}
						options={options.categories}
						width='half'
					/>

					<InputText
						name='year'
						width='half'
						label='Year'
						defaultValue={initialCard?.year ?? ""}
					/>

					<InputText
						name='setName'
						label='Set'
						defaultValue={initialCard?.setName ?? ""}
						width='half'
					/>

					<InputText
						name='info'
						label='Info'
						defaultValue={initialCard?.info ?? ""}
						width='half'
					/>

					<InputText
						name='notes'
						label='Notes'
						defaultValue={initialCard?.notes ?? ""}
						width='half'
					/>
				</div>
				<div className={styles.DrawerForm__section}>
					<div className={styles.DrawerForm__section__header}>
						<hr className={styles.DrawerForm__section__hr} />
						<h3 className={styles.DrawerForm__section__heading}>Acquisition</h3>
					</div>

					<InputSelect
						name='acquisitionType'
						label='Acquisition Type'
						defaultValue={initialCard?.acquisitionType ?? "purchased"}
						options={[
							{
								label: "Purchased",
								value: "purchased",
							},
							{
								label: "Pulled",
								value: "pulled",
							},
						]}
						width='half'
					/>

					<InputDate
						name='purchaseDate'
						label='Purchase Date'
						width='half'
						defaultValue={initialCard?.purchaseDate ?? ""}
					/>

					<InputText
						name='purchasedFrom'
						label='Purchased From'
						defaultValue={initialCard?.purchasedFrom ?? ""}
						width='half'
					/>

					<InputText
						name='ebaySeller'
						label='eBay Seller'
						defaultValue={initialCard?.ebaySeller ?? ""}
						width='half'
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
							defaultValue={
								statuses
									.find((status) => status.name === card?.status)
									?.id?.toString() ?? ""
							}
							options={[
								{ label: "No status", value: "" },
								...statuses
									.filter(
										(status) =>
											status.name !== "Sold" &&
											status.name !== "Pending Payment",
									)
									.map((status) => ({
										label: status.name,
										value: status.id.toString(),
									})),
							]}
							width='half'
						/>
					)}
					<InputText
						name='grade'
						label='Grade'
						type='number'
						width='half'
						min={1}
						step={0.5}
						defaultValue={initialCard?.grade ?? ""}
					/>
					<InputText
						name='purchasePrice'
						label='Purchase Price'
						type='number'
						leadingIcon='dollar-sign'
						width='half'
						min={0}
						step={0.01}
						defaultValue={initialCard?.purchasePrice ?? ""}
					/>
				</div>
				<div className={styles.DrawerForm__section}>
					<InputCheckbox
						name='isShared'
						label='Shared on IG'
						type='square'
						defaultChecked={card?.isShared ?? false}
					/>
				</div>
				<div className={styles.DrawerForm__actions}>
					<Button
						type='main'
						variant='add'
						htmlType='submit'
						label={isEditing ? "Save Changes" : "Add Card"}
					/>
					{card && (
						<Button
							type='main'
							variant='delete'
							htmlType='button'
							onClick={() => {
								setDeleteError(null);
								setIsDeleteModalOpen(true);
							}}
							label='Delete Card'
						/>
					)}
				</div>
			</form>
			{card && portfolio === "investment" && (
				<form action={handleSale}>
					<div className={styles.DrawerForm__section}>
						<div className={styles.DrawerForm__section__header}>
							<hr className={styles.DrawerForm__section__hr} />
							<h3 className={styles.DrawerForm__section__heading}>Sale</h3>
						</div>

						<input type='hidden' name='id' value={card.id} />

						<p className={styles.DrawerForm__info}>
							<span className={styles.DrawerForm__info__label}>
								Total Cost:
							</span>
							<span className={styles.DrawerForm__info__value}>
								{card.totalCost !== null
									? `$${card.totalCost.toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}`
									: "Unknown"}
							</span>
						</p>
						<InputText
							name='soldVia'
							label='Sold Via'
							defaultValue={card.soldVia ?? ""}
							width='half'
						/>

						<InputDate
							name='soldDate'
							label='		Sold Date'
							width='half'
							defaultValue={card.soldDate ?? ""}
						/>
						<InputText
							name='soldPrice'
							label='Sold Price'
							type='number'
							leadingIcon='dollar-sign'
							width='half'
							min={0}
							step={0.01}
							defaultValue={card.soldPrice ?? ""}
							required
						/>

						<InputCheckbox
							name='isPaid'
							label='Payment Received'
							type='square'
							width='half'
							defaultChecked={card.isPaid}
						/>

						{saleError && (
							<p className='alert' role='alert'>
								{saleError}
							</p>
						)}
						<div className={styles.DrawerForm__actions}>
							<Button
								type='main'
								variant='add'
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
					This action cannot be undone.
				</p>

				{deleteError && (
					<p className='alert' role='alert'>
						{deleteError}
					</p>
				)}
				<div className={modalStyles.ModalContent__actions}>
					<Button
						type='main'
						variant='delete'
						htmlType='button'
						onClick={handleDelete}
						disabled={isDeleting}
						label={isDeleting ? "Deleting..." : "Delete Card"}
					/>
					<Button
						type='main'
						variant='cancel'
						label='Cancel'
						onClick={() => setIsDeleteModalOpen(false)}
						disabled={isDeleting}
					/>
				</div>
			</Modal>
		</>
	);
}
