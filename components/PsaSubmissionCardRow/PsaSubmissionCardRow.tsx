"use client";

import { FormEvent, useState, useTransition } from "react";
import { Modal } from "@/components/Modal/Modal";
import { InputText } from "@/components/InputText/InputText";
import { Button } from "@/components/Button/Button";
import { InputSelect } from "@/components/InputSelect/InputSelect";
import {
	removeCardFromPsaSubmission,
	updatePsaSubmissionCard,
} from "@/app/actions/psaSubmissions";
import styles from "./PsaSubmissionCardRow.module.scss";

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

						{[card.player, card.year, card.setName, card.info]
							.filter(Boolean)
							.join(" ")}
					</form>
				</td>

				<td>
					{isEditing ? (
						<InputText
							className={styles.PsaSubmissionCardRow__input}
							name='baseGradingFee'
							type='number'
							variant='small'
							leadingIcon='dollar-sign'
							width='half'
							min={0}
							step={0.01}
							defaultValue={card.baseGradingFee}
						/>
					) : (
						`$${Number(card.baseGradingFee).toFixed(2)}`
					)}
				</td>

				<td>${sharedCost.toFixed(2)}</td>

				<td>
					{isEditing ? (
						<InputText
							className={styles.PsaSubmissionCardRow__input}
							type='number'
							variant='small'
							name='gradingAdjustment'
							leadingIcon='dollar-sign'
							min={0}
							step={0.01}
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
							<InputSelect
								form={formId}
								name='gradeStatus'
								value={gradeStatus}
								options={[
									{
										label: "Pending",
										value: "pending",
									},
									{
										label: "Graded",
										value: "graded",
									},
									{
										label: "No Grade",
										value: "no_grade",
									},
								]}
								onChange={(event) => {
									const value = event.target.value as
										"pending" | "graded" | "no_grade";

									setGradeStatus(value);

									if (value !== "graded") {
										setGrade("");
									}
								}}
							/>

							<InputText
								form={formId}
								className={styles.PsaSubmissionCardRow__input}
								type='number'
								name='grade'
								label='Grade'
								step={0.5}
								min={1}
								max={10}
								value={grade}
								variant='small'
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
						<Button
							type='icon'
							htmlType='submit'
							variant='add'
							form={formId}
							disabled={isSaving || isRemoving}
							tooltip='Save'
							trailingIcon='save'
						/>
					)}

					{!isCompleted && isEditing && (
						<Button
							type='icon'
							variant='delete'
							disabled={isSaving || isRemoving}
							onClick={() => setIsRemoveModalOpen(true)}
							tooltip='Remove'
							trailingIcon='delete'
						/>
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
