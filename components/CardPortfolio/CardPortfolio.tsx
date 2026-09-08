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
import { PackageDrawer } from "../PackageDrawer/PackageDrawer";
import type { Card } from "@/types/types";

import styles from "./CardPortfolio.module.scss";

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
}

type SelectionMode = "submission" | "purchase-package" | null;

export function CardPortfolio({
	cards,
	statuses,
	psaSubmissions,
	portfolio,
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
				selectionMode={selectionMode}
				onRowSelectionChange={setRowSelection}
				onSelectionModeChange={setSelectionMode}
				onCreateSubmission={() => setIsPsaDrawerOpen(true)}
				onCreatePurchasePackage={() => setIsPurchasePackageDrawerOpen(true)}
				onMoveCard={setCardToMove}
				onEditCard={setEditingCard}
			/>

			<AddCard
				statuses={statuses}
				portfolio={portfolio}
				card={editingCard}
				onCloseEdit={() => setEditingCard(null)}
				editOnly
			/>

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
				<p>
					{selectedCardIds.length} card
					{selectedCardIds.length === 1 ? "" : "s"} selected.
				</p>

				{psaError && <p role='alert'>{psaError}</p>}

				{psaSubmissions.length === 0 ? (
					<p>No PSA submissions yet.</p>
				) : (
					<>
						<h3>Existing Submission</h3>

						<ul>
							{psaSubmissions.map((submission) => (
								<li key={submission.id}>
									<strong>{submission.submissionNumber}</strong>
									{submission.stage && <> — {submission.stage}</>}{" "}
									<button
										type='button'
										onClick={() => handleAddToPsaSubmission(submission.id)}
									>
										Add
									</button>
								</li>
							))}
						</ul>
					</>
				)}

				<h3>Create New Submission</h3>

				<form action={handleCreatePsaSubmission}>
					<label>
						Submission Number
						<input type='text' name='submissionNumber' required />
					</label>

					<button type='submit'>Create New Submission</button>
				</form>

				<button type='button' onClick={handleClosePsaDrawer}>
					Cancel
				</button>
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
