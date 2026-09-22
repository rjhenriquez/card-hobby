"use client";

import { FormEvent, useEffect, useState } from "react";
import {
	finishPsaSubmission,
	updatePsaSubmission,
} from "@/app/actions/psaSubmissions";
import { Button } from "@/components/Button/Button";
import { InputText } from "@/components/InputText/InputText";
import { InputDate } from "@/components/InputDate/InputDate";
import { Modal } from "@/components/Modal/Modal";

import styles from "./PsaSubmissionForm.module.scss";

interface PsaSubmission {
	id: number;
	submissionNumber: string;
	stage: string | null;
	sentDate: string | null;
	receivedDate: string | null;
	completedDate: string | null;
	outboundShippingCost: string;
	insuredReturnShippingCost: string;
}

interface PsaSubmissionFormProps {
	submission: PsaSubmission;
	isEditing: boolean;
	onSaved?: () => void;
}

export function PsaSubmissionForm({
	submission,
	isEditing,
	onSaved,
}: PsaSubmissionFormProps) {
	const [stage, setStage] = useState(submission.stage ?? "");
	const [sentDate, setSentDate] = useState(submission.sentDate ?? "");
	const [receivedDate, setReceivedDate] = useState(
		submission.receivedDate ?? "",
	);
	const [outboundShippingCost, setOutboundShippingCost] = useState(
		submission.outboundShippingCost,
	);
	const [insuredReturnShippingCost, setInsuredReturnShippingCost] = useState(
		submission.insuredReturnShippingCost,
	);

	const [isSaving, setIsSaving] = useState(false);
	const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
	const [isFinishing, setIsFinishing] = useState(false);

	const isCompleted = submission.completedDate !== null;

	const hasChanges =
		stage !== (submission.stage ?? "") ||
		sentDate !== (submission.sentDate ?? "") ||
		receivedDate !== (submission.receivedDate ?? "") ||
		outboundShippingCost !== submission.outboundShippingCost ||
		insuredReturnShippingCost !== submission.insuredReturnShippingCost;

	useEffect(() => {
		if (isEditing) return;

		setStage(submission.stage ?? "");
		setSentDate(submission.sentDate ?? "");
		setReceivedDate(submission.receivedDate ?? "");
		setOutboundShippingCost(submission.outboundShippingCost);
		setInsuredReturnShippingCost(submission.insuredReturnShippingCost);
	}, [isEditing, submission]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!hasChanges) return;

		setIsSaving(true);

		try {
			const formData = new FormData(event.currentTarget);

			await updatePsaSubmission(formData);

			onSaved?.();
		} finally {
			setIsSaving(false);
		}
	}

	async function handleFinish() {
		setIsFinishing(true);

		try {
			await finishPsaSubmission(submission.id, submission.submissionNumber);

			setIsFinishModalOpen(false);
		} finally {
			setIsFinishing(false);
		}
	}

	return (
		<div className={styles.PsaSubmissionForm}>
			{isEditing ? (
				<form
					className={styles.PsaSubmissionForm__form}
					onSubmit={handleSubmit}
				>
					<input type='hidden' name='id' value={submission.id} />
					<input
						type='hidden'
						name='submissionNumber'
						value={submission.submissionNumber}
					/>
					<h2 className={styles.PsaSubmissionForm__heading}>
						Submission Number: <span>{submission.submissionNumber}</span>
					</h2>

					<InputText
						className={styles.PsaSubmissionForm__input}
						name='stage'
						label='Stage'
						value={stage}
						width='third'
						onChange={(event) => setStage(event.target.value)}
					/>
					<InputDate
						className={styles.PsaSubmissionForm__input}
						name='sentDate'
						label='Sent Date'
						width='third'
						value={sentDate}
						onChange={(event) => setSentDate(event.target.value)}
					/>
					<InputDate
						className={styles.PsaSubmissionForm__input}
						name='receivedDate'
						width='third'
						label='Received Date'
						value={receivedDate}
						onChange={(event) => setReceivedDate(event.target.value)}
					/>

					<InputText
						className={styles.PsaSubmissionForm__input}
						type='number'
						name='outboundShippingCost'
						label='Outbound Shipping'
						leadingIcon='dollar-sign'
						step={0.01}
						min={0}
						width='half'
						value={outboundShippingCost}
						onChange={(event) => setOutboundShippingCost(event.target.value)}
					/>
					<InputText
						className={styles.PsaSubmissionForm__input}
						type='number'
						name='insuredReturnShippingCost'
						label='Insured Return Shipping'
						leadingIcon='dollar-sign'
						width='half'
						step={0.01}
						min={0}
						value={insuredReturnShippingCost}
						onChange={(event) =>
							setInsuredReturnShippingCost(event.target.value)
						}
					/>

					<div className={styles.PsaSubmissionForm__actions}>
						{!isCompleted && (
							<Button
								type='main'
								variant='delete'
								onClick={() => setIsFinishModalOpen(true)}
								label='Finish Submission'
								trailingIcon={isSaving ? "loading" : undefined}
							/>
						)}
						<Button
							type='main'
							variant='add'
							htmlType='submit'
							label={isSaving ? "Saving..." : "Save Submission"}
							trailingIcon={isSaving ? "loading" : undefined}
						/>
					</div>
				</form>
			) : (
				<dl className={styles.PsaSubmissionForm__dl}>
					<h2 className={styles.PsaSubmissionForm__heading}>
						Submission Number: <span>{submission.submissionNumber}</span>
					</h2>

					<div className={styles.PsaSubmissionForm__dl__wrapper}>
						<dt>Stage</dt>
						<dd>{submission.stage ?? "—"}</dd>
					</div>

					<div className={styles.PsaSubmissionForm__dl__wrapper}>
						<dt>Sent Date</dt>
						<dd>{submission.sentDate ?? "—"}</dd>
					</div>

					<div className={styles.PsaSubmissionForm__dl__wrapper}>
						<dt>Received Date</dt>
						<dd>{submission.receivedDate ?? "—"}</dd>
					</div>

					<div className={styles.PsaSubmissionForm__dl__wrapper}>
						<dt>Outbound Shipping</dt>
						<dd>${Number(submission.outboundShippingCost).toFixed(2)}</dd>
					</div>

					<div className={styles.PsaSubmissionForm__dl__wrapper}>
						<dt>Insured Return Shipping</dt>
						<dd>${Number(submission.insuredReturnShippingCost).toFixed(2)}</dd>
					</div>
				</dl>
			)}

			<Modal
				isOpen={isFinishModalOpen}
				title='PSA Submission'
				onClose={() => setIsFinishModalOpen(false)}
			>
				<h4 className={styles.PsaSubmissionForm__modal__heading}>
					Finish PSA Submission <strong>{submission.submissionNumber}</strong>?
				</h4>

				<p>
					Finishing this submission will make its grading costs part of the
					cards&apos; financial totals and release the cards from their
					PSA-controlled status.
				</p>

				<div role='group' className={styles.PsaSubmissionForm__modal__actions}>
					<Button
						type='main'
						variant='cancel'
						label='Cancel'
						disabled={isFinishing}
						onClick={() => setIsFinishModalOpen(false)}
					/>
					<Button
						type='main'
						variant='add'
						disabled={isFinishing}
						label={isFinishing ? "Finishing..." : "Finish Submission"}
						trailingIcon={isFinishing ? "loading" : undefined}
						onClick={handleFinish}
					/>
				</div>
			</Modal>
		</div>
	);
}
