"use client";

import { FormEvent, useEffect, useState } from "react";

import {
	finishPsaSubmission,
	updatePsaSubmission,
} from "@/app/actions/psaSubmissions";
import { Modal } from "@/components/Modal/Modal";
import { InputText } from "@/components/InputText/InputText";
import { Button } from "@/components/Button/Button";
import { InputDate } from "@/components/InputDate/InputDate";
import styles from "./PsaSubmission.module.scss";

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
		<>
			{isEditing ? (
				<form className={styles.PsaSubmissionForm} onSubmit={handleSubmit}>
					<input type='hidden' name='id' value={submission.id} />

					<input
						type='hidden'
						name='submissionNumber'
						value={submission.submissionNumber}
					/>

					<div className={styles.PsaSubmissionForm__fields}>
						<InputText
							name='stage'
							label='Stage'
							value={stage}
							onChange={(event) => setStage(event.target.value)}
						/>

						<InputDate
							name='sentDate'
							label='Sent Date'
							value={sentDate}
							onChange={(event) => setSentDate(event.target.value)}
						/>

						<InputDate
							name='receivedDate'
							label='Received Date'
							value={receivedDate}
							onChange={(event) => setReceivedDate(event.target.value)}
						/>

						<InputText
							name='outboundShippingCost'
							label='Outbound Shipping'
							type='number'
							step={0.01}
							min={0}
							leadingIcon='dollar-sign'
							value={outboundShippingCost}
							onChange={(event) => setOutboundShippingCost(event.target.value)}
						/>

						<InputText
							name='insuredReturnShippingCost'
							label='Return Shipping'
							type='number'
							step={0.01}
							min={0}
							leadingIcon='dollar-sign'
							value={insuredReturnShippingCost}
							onChange={(event) =>
								setInsuredReturnShippingCost(event.target.value)
							}
						/>
						<div className={styles.PsaSubmissionForm__actions}>
							<Button
								type='main'
								variant='primary'
								htmlType='submit'
								label={isSaving ? "Saving..." : "Save"}
								disabled={!hasChanges || isSaving}
							/>
							{!isCompleted && (
								<Button
									type='main'
									variant='delete'
									htmlType='button'
									label='Finish'
									onClick={() => setIsFinishModalOpen(true)}
								/>
							)}
						</div>
					</div>
				</form>
			) : (
				<dl className={styles.PsaSubmissionDetails}>
					<div className={styles.PsaSubmissionDetails__wrapper}>
						<dt>Stage</dt>
						<dd>{submission.stage ?? "—"}</dd>
					</div>

					<div className={styles.PsaSubmissionDetails__wrapper}>
						<dt>Sent Date</dt>
						<dd>{submission.sentDate ?? "—"}</dd>
					</div>

					<div className={styles.PsaSubmissionDetails__wrapper}>
						<dt>Received Date</dt>
						<dd>{submission.receivedDate ?? "—"}</dd>
					</div>

					<div className={styles.PsaSubmissionDetails__wrapper}>
						<dt>Outbound Shipping</dt>
						<dd>${Number(submission.outboundShippingCost).toFixed(2)}</dd>
					</div>

					<div className={styles.PsaSubmissionDetails__wrapper}>
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
				<div className='psaSubmissionNew__modal'>
					<h4>
						Finish PSA Submission <strong>{submission.submissionNumber}</strong>
						?
					</h4>

					<p>
						Finishing this submission will make its grading costs part of the
						cards&apos; financial totals and release the cards from their
						PSA-controlled status.
					</p>

					<div>
						<button
							type='button'
							disabled={isFinishing}
							onClick={() => setIsFinishModalOpen(false)}
						>
							Cancel
						</button>

						<button type='button' disabled={isFinishing} onClick={handleFinish}>
							{isFinishing ? "Finishing..." : "Finish Submission"}
						</button>
					</div>
				</div>
			</Modal>
		</>
	);
}
