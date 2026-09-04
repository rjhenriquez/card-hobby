"use client";

import { FormEvent, useState, useTransition } from "react";
import { updatePsaSubmissionCard } from "@/app/actions/psaSubmissions";

interface PsaSubmissionCard {
  submissionCardId: number;
  player: string;
  year: string | null;
  setName: string | null;
  info: string | null;
  baseGradingFee: string;
  gradingAdjustment: string;
  grade: string | null;
  gradeStatus: "pending" | "graded" | "no_grade";
}

interface PsaSubmissionCardRowProps {
  card: PsaSubmissionCard;
  submissionNumber: string;
  sharedCost: number;
}

export function PsaSubmissionCardRow({
  card,
  submissionNumber,
  sharedCost,
}: PsaSubmissionCardRowProps) {
  const [gradeStatus, setGradeStatus] = useState(card.gradeStatus);

  const [grade, setGrade] = useState(card.grade ?? "");

  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await updatePsaSubmissionCard(formData);
    });
  }

  const formId = `psa-card-${card.submissionCardId}`;

  const totalGradingCost =
    Number(card.baseGradingFee) + sharedCost + Number(card.gradingAdjustment);

  return (
    <tr>
      <td>
        <form id={formId} onSubmit={handleSubmit}>
          <input
            type="hidden"
            name="submissionCardId"
            value={card.submissionCardId}
          />

          <input
            type="hidden"
            name="submissionNumber"
            value={submissionNumber}
          />

          {card.player}
        </form>
      </td>

      <td>{card.year ?? "—"}</td>

      <td>{card.setName ?? "—"}</td>

      <td>{card.info ?? "—"}</td>

      <td>
        <input
          form={formId}
          type="number"
          name="baseGradingFee"
          step="0.01"
          min="0"
          defaultValue={card.baseGradingFee}
        />
      </td>

      <td>${sharedCost.toFixed(2)}</td>

      <td>
        <input
          form={formId}
          type="number"
          name="gradingAdjustment"
          step="0.01"
          min="0"
          defaultValue={card.gradingAdjustment}
        />
      </td>

      <td>${totalGradingCost.toFixed(2)}</td>

      <td>
        <select
          form={formId}
          name="gradeStatus"
          value={gradeStatus}
          onChange={(event) => {
            const value = event.target.value as
              | "pending"
              | "graded"
              | "no_grade";

            setGradeStatus(value);

            if (value !== "graded") {
              setGrade("");
            }
          }}
        >
          <option value="pending">Pending</option>
          <option value="graded">Graded</option>
          <option value="no_grade">No Grade</option>
        </select>

        <input
          form={formId}
          type="number"
          name="grade"
          step="0.5"
          min="1"
          max="10"
          value={grade}
          disabled={gradeStatus !== "graded"}
          onChange={(event) => setGrade(event.target.value)}
        />
      </td>
      <td>
        <button form={formId} type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </button>
      </td>
    </tr>
  );
}
