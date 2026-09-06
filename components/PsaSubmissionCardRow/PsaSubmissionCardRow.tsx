"use client";

import { FormEvent, useState, useTransition } from "react";
import { Modal } from "@/components/Modal/Modal";
import {
	removeCardFromPsaSubmission,
	updatePsaSubmissionCard,
} from "@/app/actions/psaSubmissions";

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
	isCompleted: boolean;
	isEditing: boolean;
}

export function PsaSubmissionCardRow({
	card,
	submissionNumber,
	sharedCost,
	isCompleted,
	isEditing,
}: PsaSubmissionCardRowProps) {
	const [gradeStatus, setGradeStatus] = useState(card.gradeStatus);
	const [grade, setGrade] = useState(card.grade ?? "");
	const [isSaving, startSavingTransition] = useTransition();
	const [isRemoving, startRemovingTransition] = useTransition();
	const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);

		startSavingTransition(async () => {
			await updatePsaSubmissionCard(formData);
		});
	}

	function handleRemove() {
		startRemovingTransition(async () => {
			await removeCardFromPsaSubmission(
				card.submissionCardId,
				submissionNumber,
			);

			setIsRemoveModalOpen(false);
		});
	}

	const formId = `psa-card-${card.submissionCardId}`;

	const totalGradingCost =
		Number(card.baseGradingFee) + sharedCost + Number(card.gradingAdjustment);

	return (
		<>
			<tr>
				<td>
					<form id={formId} onSubmit={handleSubmit}>
						<input
							type='hidden'
							name='submissionCardId'
							value={card.submissionCardId}
						/>

						<input
							type='hidden'
							name='submissionNumber'
							value={submissionNumber}
						/>

						{card.player}
					</form>
				</td>

				<td>{card.year ?? "—"}</td>

				<td>{card.setName ?? "—"}</td>

				<td>{card.info ?? "—"}</td>

				<td>
					{isEditing ? (
						<input
							form={formId}
							type='number'
							name='baseGradingFee'
							step='0.01'
							min='0'
							defaultValue={card.baseGradingFee}
						/>
					) : (
						`$${Number(card.baseGradingFee).toFixed(2)}`
					)}
				</td>

				<td>${sharedCost.toFixed(2)}</td>

				<td>
					{isEditing ? (
						<input
							form={formId}
							type='number'
							name='gradingAdjustment'
							step='0.01'
							min='0'
							defaultValue={card.gradingAdjustment}
						/>
					) : (
						`$${Number(card.gradingAdjustment).toFixed(2)}`
					)}
				</td>

				<td>${totalGradingCost.toFixed(2)}</td>

				<td>
					{isEditing ? (
						<>
							<select
								form={formId}
								name='gradeStatus'
								value={gradeStatus}
								onChange={(event) => {
									const value = event.target.value as
										"pending" | "graded" | "no_grade";

									setGradeStatus(value);

									if (value !== "graded") {
										setGrade("");
									}
								}}
							>
								<option value='pending'>Pending</option>
								<option value='graded'>Graded</option>
								<option value='no_grade'>No Grade</option>
							</select>

							<input
								form={formId}
								type='number'
								name='grade'
								step='0.5'
								min='1'
								max='10'
								value={grade}
								disabled={gradeStatus !== "graded"}
								onChange={(event) => setGrade(event.target.value)}
							/>
						</>
					) : card.gradeStatus === "graded" ? (
						`PSA ${card.grade}`
					) : card.gradeStatus === "no_grade" ? (
						"No Grade"
					) : (
						"Pending"
					)}
				</td>

				<td>
					{isEditing && (
						<button
							form={formId}
							type='submit'
							disabled={isSaving || isRemoving}
						>
							{isSaving ? "Saving..." : "Save"}
						</button>
					)}

					{!isCompleted && isEditing && (
						<button
							type='button'
							disabled={isSaving || isRemoving}
							onClick={() => setIsRemoveModalOpen(true)}
						>
							Remove
						</button>
					)}
				</td>
			</tr>

			<Modal
				isOpen={isRemoveModalOpen}
				title='Remove from PSA Submission'
				onClose={() => setIsRemoveModalOpen(false)}
			>
				<p>
					Are you sure you want to remove <strong>{card.player}</strong> from
					PSA submission <strong>{submissionNumber}</strong>?
				</p>

				<div>
					<button
						type='button'
						disabled={isRemoving}
						onClick={() => setIsRemoveModalOpen(false)}
					>
						Cancel
					</button>

					<button type='button' disabled={isRemoving} onClick={handleRemove}>
						{isRemoving ? "Removing..." : "Remove"}
					</button>
				</div>
			</Modal>
		</>
	);
}
