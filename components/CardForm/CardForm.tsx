"use client";

import { useState } from "react";
import {
	createCard,
	deleteCard,
	sellCard,
	updateCard,
} from "@/app/actions/cards";
import { Modal } from "@/components/Modal/Modal";
import type { Card } from "@/types/types";

interface CardStatus {
	id: number;
	name: string;
}

interface CardFormProps {
	statuses: CardStatus[];
	portfolio: "investment" | "collection";
	card?: Card;
	onClose?: () => void;
}

export function CardForm({
	statuses,
	portfolio,
	card,
	onClose,
}: CardFormProps) {
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const isEditing = card !== undefined;
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
			<form action={handleCardSubmit}>
				<input type='hidden' name='portfolio' value={portfolio} />

				{card && <input type='hidden' name='id' value={card.id} />}

				<label>
					Player
					<input
						name='player'
						type='text'
						defaultValue={card?.player ?? ""}
						required
					/>
				</label>

				<label>
					Category
					<input
						name='category'
						type='text'
						defaultValue={card?.category ?? ""}
					/>
				</label>

				<label>
					Year
					<input name='year' type='text' defaultValue={card?.year ?? ""} />
				</label>

				<label>
					Set
					<input
						name='setName'
						type='text'
						defaultValue={card?.setName ?? ""}
					/>
				</label>

				<label>
					Info
					<input name='info' type='text' defaultValue={card?.info ?? ""} />
				</label>

				<label>
					Notes
					<textarea name='notes' defaultValue={card?.notes ?? ""} />
				</label>

				<label>
					Acquisition Type
					<select
						name='acquisitionType'
						defaultValue={card?.acquisitionType ?? "purchased"}
					>
						<option value='purchased'>Purchased</option>
						<option value='pulled'>Pulled</option>
					</select>
				</label>

				{card?.soldPrice !== null && card?.soldPrice !== undefined ? (
					<p>
						<strong>Status:</strong>{" "}
						{card.effectiveStatus ?? card.status ?? "—"}
					</p>
				) : (
					<label>
						Status
						<select
							name='statusId'
							defaultValue={
								statuses.find((status) => status.name === card?.status)?.id ??
								""
							}
						>
							<option value=''>No status</option>

							{statuses
								.filter(
									(status) =>
										status.name !== "Sold" && status.name !== "Pending Payment",
								)
								.map((status) => (
									<option key={status.id} value={status.id}>
										{status.name}
									</option>
								))}
						</select>
					</label>
				)}

				<label>
					Purchase Date
					<input
						name='purchaseDate'
						type='date'
						defaultValue={card?.purchaseDate ?? ""}
					/>
				</label>

				<label>
					Purchased From
					<input
						name='purchasedFrom'
						type='text'
						defaultValue={card?.purchasedFrom ?? ""}
					/>
				</label>

				<label>
					eBay Seller
					<input
						name='ebaySeller'
						type='text'
						defaultValue={card?.ebaySeller ?? ""}
					/>
				</label>

				<label>
					Purchase Price
					<input
						name='purchasePrice'
						type='number'
						min='0'
						step='0.01'
						defaultValue={card?.purchasePrice ?? ""}
					/>
				</label>

				<button type='submit'>{isEditing ? "Save Changes" : "Add Card"}</button>

				{card && (
					<button
						type='button'
						onClick={() => {
							setDeleteError(null);
							setIsDeleteModalOpen(true);
						}}
					>
						Delete Card
					</button>
				)}
			</form>
			{card && portfolio === "investment" && (
				<section>
					<h3>Sale</h3>

					<form action={handleSale}>
						<input type='hidden' name='id' value={card.id} />

						<p>
							<strong>Total Cost:</strong>{" "}
							{card.totalCost !== null
								? `$${card.totalCost.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}`
								: "Unknown"}
						</p>

						<label>
							Sold Via
							<input
								type='text'
								name='soldVia'
								defaultValue={card.soldVia ?? ""}
							/>
						</label>

						<label>
							Sold Date
							<input
								type='date'
								name='soldDate'
								defaultValue={card.soldDate ?? ""}
							/>
						</label>

						<label>
							Sold Price
							<input
								type='number'
								name='soldPrice'
								min='0'
								step='0.01'
								defaultValue={card.soldPrice ?? ""}
								required
							/>
						</label>

						<label>
							<input
								type='checkbox'
								name='isPaid'
								defaultChecked={card.isPaid}
							/>
							Payment Received
						</label>

						{saleError && <p role='alert'>{saleError}</p>}

						<button type='submit' disabled={isSavingSale}>
							{isSavingSale
								? "Saving..."
								: card.soldPrice !== null
									? "Save Sale Changes"
									: "Sell Card"}
						</button>
					</form>
				</section>
			)}
			<Modal
				isOpen={isDeleteModalOpen}
				title='Delete Card'
				onClose={() => setIsDeleteModalOpen(false)}
			>
				<p>
					Are you sure you want to permanently delete{" "}
					<strong>{card?.player}</strong>?
				</p>

				<p>This action cannot be undone.</p>

				{deleteError && <p role='alert'>{deleteError}</p>}

				<div>
					<button
						type='button'
						onClick={() => setIsDeleteModalOpen(false)}
						disabled={isDeleting}
					>
						Cancel
					</button>

					<button type='button' onClick={handleDelete} disabled={isDeleting}>
						{isDeleting ? "Deleting..." : "Delete Card"}
					</button>
				</div>
			</Modal>
		</>
	);
}
