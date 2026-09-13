"use client";

import { useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";
import { CardTable } from "@/components/CardTable/CardTable";
import { Drawer } from "@/components/Drawer/Drawer";
import { Modal } from "@/components/Modal/Modal";
import { moveCardToPortfolio } from "@/app/actions/cards";
import {
	addCardsToPsaSubmission,
	createPsaSubmission,
} from "@/app/actions/psaSubmissions";
import { createPurchasePackage } from "@/app/actions/purchasePackages";
import { AddCard } from "@/components/AddCard/AddCard";
import { InputText } from "@/components/InputText/InputText";
import { Button } from "@/components/Button/Button";
import { PackageDrawer } from "../PackageDrawer/PackageDrawer";
import type { CardFormOptions } from "@/db/queries/cardFormOptions";
import type { Card } from "@/types/types";

import styles from "@/styles/components/DrawerContent.module.scss";

interface CardStatus {
	id: number;
	name: string;
}

interface PsaSubmission {
	id: number;
	submissionNumber: string;
	stage: string | null;
	sentDate: string | null;
	receivedDate: string | null;
	completedDate: string | null;
}

interface CardPortfolioProps {
	cards: Card[];
	statuses: CardStatus[];
	psaSubmissions: PsaSubmission[];
	portfolio: "investment" | "collection";
	options: CardFormOptions;
}

type SelectionMode = "submission" | "purchase-package" | null;

export function CardPortfolio({
	cards,
	statuses,
	psaSubmissions,
	portfolio,
	options,
}: CardPortfolioProps) {
	const [cardToMove, setCardToMove] = useState<Card | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);
	const [isPsaDrawerOpen, setIsPsaDrawerOpen] = useState(false);
	const [isPurchasePackageDrawerOpen, setIsPurchasePackageDrawerOpen] =
		useState(false);
	const [psaError, setPsaError] = useState<string | null>(null);
	const [purchasePackageError, setPurchasePackageError] = useState<
		string | null
	>(null);
	const [isSavingPurchasePackage, setIsSavingPurchasePackage] = useState(false);
	const [editingCard, setEditingCard] = useState<Card | null>(null);
	const [copyingCard, setCopyingCard] = useState<Card | null>(null);

	const destination = portfolio === "investment" ? "collection" : "investment";

	const selectedCardIds = Object.keys(rowSelection)
		.filter((id) => rowSelection[id])
		.map(Number);

	const selectedCards = cards.filter((card) =>
		selectedCardIds.includes(card.id),
	);

	async function handleMove() {
		if (!cardToMove) {
			return;
		}

		await moveCardToPortfolio(cardToMove.id, destination);

		setCardToMove(null);
	}

	function getSelectedCardIds() {
		return Object.keys(rowSelection)
			.filter((id) => rowSelection[id])
			.map(Number);
	}

	function clearSelection() {
		setRowSelection({});
		setSelectionMode(null);
	}

	async function handleCreatePsaSubmission(formData: FormData) {
		const submissionNumber = formData.get("submissionNumber");

		if (typeof submissionNumber !== "string") {
			return;
		}

		setPsaError(null);

		try {
			await createPsaSubmission(submissionNumber, getSelectedCardIds());

			setIsPsaDrawerOpen(false);
			clearSelection();
		} catch (error) {
			setPsaError(
				error instanceof Error
					? error.message
					: "Unable to create PSA submission.",
			);
		}
	}

	async function handleAddToPsaSubmission(submissionId: number) {
		setPsaError(null);

		try {
			await addCardsToPsaSubmission(submissionId, getSelectedCardIds());

			setIsPsaDrawerOpen(false);
			clearSelection();
		} catch (error) {
			setPsaError(
				error instanceof Error
					? error.message
					: "Unable to add cards to PSA submission.",
			);
		}
	}

	async function handleCreatePurchasePackage(formData: FormData) {
		setPurchasePackageError(null);
		setIsSavingPurchasePackage(true);

		try {
			await createPurchasePackage({
				itemsSubtotal: String(formData.get("itemsSubtotal") ?? ""),
				shippingTotal: String(formData.get("shippingTotal") ?? ""),
				taxesTotal: String(formData.get("taxesTotal") ?? ""),
				carrier: getOptionalFormValue(formData, "carrier"),
				trackingNumber: getOptionalFormValue(formData, "trackingNumber"),
				estimatedDeliveryDate: getOptionalFormValue(
					formData,
					"estimatedDeliveryDate",
				),
				cards: selectedCards.map((card) => ({
					cardId: card.id,
					hammerPrice: String(formData.get(`hammerPrice-${card.id}`) ?? ""),
				})),
			});

			setIsPurchasePackageDrawerOpen(false);
			clearSelection();
		} catch (error) {
			setPurchasePackageError(
				error instanceof Error
					? error.message
					: "Unable to create purchase package.",
			);
		} finally {
			setIsSavingPurchasePackage(false);
		}
	}

	function getOptionalFormValue(formData: FormData, name: string) {
		const value = formData.get(name);

		if (typeof value !== "string") {
			return null;
		}

		const trimmedValue = value.trim();

		return trimmedValue === "" ? null : trimmedValue;
	}

	function handleClosePsaDrawer() {
		setIsPsaDrawerOpen(false);
		setPsaError(null);
	}

	function handleClosePurchasePackageDrawer() {
		setIsPurchasePackageDrawerOpen(false);
		setPurchasePackageError(null);
	}

	return (
		<div className={styles.CardPortfolio}>
			<CardTable
				cards={cards}
				portfolio={portfolio}
				rowSelection={rowSelection}
				onRowSelectionChange={setRowSelection}
				onCreateSubmission={() => setIsPsaDrawerOpen(true)}
				onCreatePurchasePackage={() => setIsPurchasePackageDrawerOpen(true)}
				onMoveCard={setCardToMove}
				onEditCard={setEditingCard}
				onCopyCard={setCopyingCard}
			/>

			{editingCard && (
				<AddCard
					statuses={statuses}
					portfolio={portfolio}
					options={options}
					card={editingCard}
					onCloseEdit={() => setEditingCard(null)}
					editOnly
				/>
			)}

			{copyingCard && (
				<AddCard
					statuses={statuses}
					portfolio={portfolio}
					options={options}
					copyFrom={copyingCard}
					onCloseCopy={() => setCopyingCard(null)}
					copyOnly
				/>
			)}

			<Modal
				isOpen={cardToMove !== null}
				title={`Move to ${
					destination === "investment" ? "Investment" : "Collection"
				}`}
				onClose={() => setCardToMove(null)}
			>
				<p>
					Are you sure you want to move <strong>{cardToMove?.player}</strong> to{" "}
					{destination === "investment" ? "Investment" : "Collection"}?
				</p>

				<div>
					<button type='button' onClick={() => setCardToMove(null)}>
						Cancel
					</button>

					<button type='button' onClick={handleMove}>
						Move
					</button>
				</div>
			</Modal>

			<Drawer
				isOpen={isPsaDrawerOpen}
				title='Add to PSA Submission'
				onClose={handleClosePsaDrawer}
			>
				<div className={styles.DrawerInfo}>
					<div className={styles.DrawerInfo__section}>
						<h3 className={styles.DrawerInfo__count}>
							{selectedCardIds.length} card
							{selectedCardIds.length === 1 ? "" : "s"} selected
						</h3>
						{psaError && (
							<h3 className={styles.DrawerInfo__count} role='alert'>
								{psaError}
							</h3>
						)}
						{psaSubmissions.length >= 1 && (
							<>
								<div className={styles.DrawerInfo__section__header}>
									<h4 className={styles.DrawerInfo__section__heading}>
										Existing Submission
									</h4>
									<hr className={styles.DrawerInfo__section__hr} />
								</div>
								<ul className={styles.DrawerInfo__list}>
									{psaSubmissions.map((submission) => (
										<li
											key={submission.id}
											className={styles.DrawerInfo__list__item}
										>
											<span>Submission #</span>
											<Button
												type='number-add'
												htmlType='button'
												trailingIcon='plus-sign'
												label={submission.submissionNumber}
												onClick={() => handleAddToPsaSubmission(submission.id)}
											/>
										</li>
									))}
								</ul>
							</>
						)}
					</div>
				</div>

				<form className={styles.DrawerForm} action={handleCreatePsaSubmission}>
					<div className={styles.DrawerForm__section}>
						<div className={styles.DrawerForm__section__header}>
							<hr className={styles.DrawerForm__section__hr} />
							<h3 className={styles.DrawerForm__section__heading}>
								Create New Submission
							</h3>
						</div>
						<InputText
							label='Submission Number'
							name='submissionNumber'
							required
						/>
					</div>
					<div className={styles.DrawerForm__actions}>
						<Button
							type='main'
							variant='add'
							htmlType='submit'
							label='Create New Submission'
						/>
						<Button
							type='main'
							variant='cancel'
							htmlType='submit'
							label='Cancel'
							onClick={handleClosePsaDrawer}
						/>
					</div>
				</form>
			</Drawer>

			<PackageDrawer
				isOpen={isPurchasePackageDrawerOpen}
				mode='create'
				location={portfolio}
				selectedCards={selectedCards}
				isSaving={isSavingPurchasePackage}
				error={purchasePackageError}
				onClose={handleClosePurchasePackageDrawer}
				onSubmit={handleCreatePurchasePackage}
			/>
		</div>
	);
}
