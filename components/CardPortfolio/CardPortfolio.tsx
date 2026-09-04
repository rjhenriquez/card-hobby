"use client";

import { useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";
import { CardTable } from "@/components/CardTable/CardTable";
import { Modal } from "@/components/Modal/Modal";
import { moveCardToPortfolio } from "@/app/actions/cards";
import {
  addCardsToPsaSubmission,
  createPsaSubmission,
} from "@/app/actions/psaSubmissions";
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

export function CardPortfolio({
  cards,
  statuses,
  psaSubmissions,
  portfolio,
}: CardPortfolioProps) {
  const [cardToMove, setCardToMove] = useState<Card | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isPsaModalOpen, setIsPsaModalOpen] = useState(false);
  const destination = portfolio === "investment" ? "collection" : "investment";

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
  async function handleCreatePsaSubmission(formData: FormData) {
    const submissionNumber = formData.get("submissionNumber");

    if (typeof submissionNumber !== "string") {
      return;
    }

    await createPsaSubmission(submissionNumber, getSelectedCardIds());

    setIsPsaModalOpen(false);
    setRowSelection({});
  }
  async function handleAddToPsaSubmission(submissionId: number) {
    await addCardsToPsaSubmission(submissionId, getSelectedCardIds());

    setIsPsaModalOpen(false);
    setRowSelection({});
  }

  return (
    <div className={styles.CardPortfolio}>
      {Object.keys(rowSelection).length > 0 && (
        <div className="DevBulkActions">
          <strong>{Object.keys(rowSelection).length} selected</strong>
          <button type="button" onClick={() => setIsPsaModalOpen(true)}>
            Add to PSA Submission
          </button>
        </div>
      )}
      <CardTable
        cards={cards}
        statuses={statuses}
        portfolio={portfolio}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onMoveCard={setCardToMove}
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
          <button type="button" onClick={() => setCardToMove(null)}>
            Cancel
          </button>

          <button type="button" onClick={handleMove}>
            Move
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={isPsaModalOpen}
        title="Add to PSA Submission"
        onClose={() => setIsPsaModalOpen(false)}
      >
        <p>
          {Object.keys(rowSelection).length} card
          {Object.keys(rowSelection).length === 1 ? "" : "s"} selected.
        </p>

        {psaSubmissions.length === 0 ? (
          <p>No PSA submissions yet.</p>
        ) : (
          <ul>
            {psaSubmissions.map((submission) => (
              <li key={submission.id}>
                <strong>{submission.submissionNumber}</strong>
                {submission.stage && <> — {submission.stage}</>}{" "}
                <button
                  type="button"
                  onClick={() => handleAddToPsaSubmission(submission.id)}
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}

        <form action={handleCreatePsaSubmission}>
          <label>
            Submission Number
            <input type="text" name="submissionNumber" required />
          </label>

          <button type="submit">Create New Submission</button>
        </form>

        <button type="button" onClick={() => setIsPsaModalOpen(false)}>
          Cancel
        </button>
      </Modal>
    </div>
  );
}
