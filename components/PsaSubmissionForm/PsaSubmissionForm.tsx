"use client";

import { FormEvent, useEffect, useState } from "react";
import {
	finishPsaSubmission,
	updatePsaSubmission,
} from "@/app/actions/psaSubmissions";
import { Modal } from "@/components/Modal/Modal";

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
				<form onSubmit={handleSubmit}>
					<input type='hidden' name='id' value={submission.id} />

					<input
						type='hidden'
						name='submissionNumber'
						value={submission.submissionNumber}
					/>

					<label>
						Submission Number
						<input type='text' value={submission.submissionNumber} disabled />
					</label>

					<label>
						Stage
						<input
							type='text'
							name='stage'
							value={stage}
							onChange={(event) => setStage(event.target.value)}
						/>
					</label>

					<label>
						Sent Date
						<input
							type='date'
							name='sentDate'
							value={sentDate}
							onChange={(event) => setSentDate(event.target.value)}
						/>
					</label>

					<label>
						Received Date
						<input
							type='date'
							name='receivedDate'
							value={receivedDate}
							onChange={(event) => setReceivedDate(event.target.value)}
						/>
					</label>

					<label>
						Outbound Shipping
						<input
							type='number'
							name='outboundShippingCost'
							step='0.01'
							min='0'
							value={outboundShippingCost}
							onChange={(event) => setOutboundShippingCost(event.target.value)}
						/>
					</label>

					<label>
						Insured Return Shipping
						<input
							type='number'
							name='insuredReturnShippingCost'
							step='0.01'
							min='0'
							value={insuredReturnShippingCost}
							onChange={(event) =>
								setInsuredReturnShippingCost(event.target.value)
							}
						/>
					</label>

					<button type='submit' disabled={!hasChanges || isSaving}>
						{isSaving ? "Saving..." : "Save Submission"}
					</button>
				</form>
			) : (
				<dl className='DevPsaInfo'>
					<div>
						<dt>Submission Number</dt>
						<dd>{submission.submissionNumber}</dd>
					</div>

					<div>
						<dt>Stage</dt>
						<dd>{submission.stage ?? "—"}</dd>
					</div>

					<div>
						<dt>Sent Date</dt>
						<dd>{submission.sentDate ?? "—"}</dd>
					</div>

					<div>
						<dt>Received Date</dt>
						<dd>{submission.receivedDate ?? "—"}</dd>
					</div>

					<div>
						<dt>Completed Date</dt>
						<dd>{submission.completedDate ?? "—"}</dd>
					</div>

					<div>
						<dt>Outbound Shipping</dt>
						<dd>${Number(submission.outboundShippingCost).toFixed(2)}</dd>
					</div>

					<div>
						<dt>Insured Return Shipping</dt>
						<dd>${Number(submission.insuredReturnShippingCost).toFixed(2)}</dd>
					</div>
				</dl>
			)}

			{!isCompleted && (
				<button type='button' onClick={() => setIsFinishModalOpen(true)}>
					Finish Submission
				</button>
			)}

			<Modal
				isOpen={isFinishModalOpen}
				title='Finish PSA Submission'
				onClose={() => setIsFinishModalOpen(false)}
			>
				<p>
					Finish PSA Submission <strong>{submission.submissionNumber}</strong>?
				</p>

				<p>
					Finishing this submission will make its grading costs part of the
					cards&apos; financial totals and release the cards from their
					PSA-controlled status.
				</p>

				<div role='group'>
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
			</Modal>
		</>
	);
}
