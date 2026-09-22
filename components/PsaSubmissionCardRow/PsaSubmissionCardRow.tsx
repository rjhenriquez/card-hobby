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
import { PSA_GRADE_DEFINITIONS } from "@/constants";

import styles from "./PsaSubmissionCardRow.module.scss";
import modalStyles from "@/styles/components/ModalContent.module.scss";

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

const GRADE_OPTIONS = [
	{
		label: "Pending",
		value: "pending",
	},
	...Object.entries(PSA_GRADE_DEFINITIONS)
		.sort(([gradeA], [gradeB]) => Number(gradeB) - Number(gradeA))
		.map(([grade, definition]) => ({
			label: `${definition} ${grade}`,
			value: grade,
		})),
	{
		label: "No Grade",
		value: "no_grade",
	},
];

function getGradeValue(card: PsaSubmissionCard) {
	if (card.gradeStatus === "graded" && card.grade) {
		return card.grade;
	}

	return card.gradeStatus;
}

export function PsaSubmissionCardRow({
	card,
	submissionNumber,
	sharedCost,
	isCompleted,
	isEditing,
}: PsaSubmissionCardRowProps) {
	const [gradeValue, setGradeValue] = useState(getGradeValue(card));
	const [isSaving, startSavingTransition] = useTransition();
	const [isRemoving, startRemovingTransition] = useTransition();
	const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);

		if (gradeValue === "pending") {
			formData.set("gradeStatus", "pending");
			formData.set("grade", "");
		} else if (gradeValue === "no_grade") {
			formData.set("gradeStatus", "no_grade");
			formData.set("grade", "");
		} else {
			formData.set("gradeStatus", "graded");
			formData.set("grade", gradeValue);
		}

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
					<form
						className={styles.PsaSubmissionCardRow__truncate}
						id={formId}
						onSubmit={handleSubmit}
					>
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

				<td>${sharedCost.toFixed(2)}</td>

				<td>${totalGradingCost.toFixed(2)}</td>

				<td>
					{isEditing ? (
						<InputSelect
							form={formId}
							name='gradeSelection'
							value={gradeValue}
							options={GRADE_OPTIONS}
							variant='small'
							onChange={(event) => setGradeValue(event.target.value)}
						/>
					) : card.gradeStatus === "graded" ? (
						`PSA ${card.grade}`
					) : card.gradeStatus === "no_grade" ? (
						"No Grade"
					) : (
						"Pending"
					)}
				</td>

				<td>
					<div className={styles.PsaSubmissionCardRow__actions}>
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
					</div>
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

				<div className={modalStyles.ModalContent__actions}>
					<Button
						type='main'
						variant='delete'
						htmlType='button'
						disabled={isRemoving}
						onClick={handleRemove}
						label={isRemoving ? "Removing..." : "Remove"}
					/>
					<Button
						type='main'
						variant='cancel'
						htmlType='button'
						label='Cancel'
						disabled={isRemoving}
						onClick={() => setIsRemoveModalOpen(false)}
					/>
				</div>
			</Modal>
		</>
	);
}
