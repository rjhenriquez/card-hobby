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

interface PsaSubmissionFormNewProps {
	submission: PsaSubmission;
	isEditing: boolean;
	onSaved?: () => void;
}

export function PsaSubmissionFormNew({
	submission,
	isEditing,
	onSaved,
}: PsaSubmissionFormNewProps) {
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
				<form className='psaSubmissionNew__form' onSubmit={handleSubmit}>
					<input type='hidden' name='id' value={submission.id} />

					<input
						type='hidden'
						name='submissionNumber'
						value={submission.submissionNumber}
					/>

					<div className='psaSubmissionNew__fields'>
						<label>
							<span>Stage</span>
							<input
								type='text'
								name='stage'
								value={stage}
								onChange={(event) => setStage(event.target.value)}
							/>
						</label>

						<label>
							<span>Sent Date</span>
							<input
								type='date'
								name='sentDate'
								value={sentDate}
								onChange={(event) => setSentDate(event.target.value)}
							/>
						</label>

						<label>
							<span>Received Date</span>
							<input
								type='date'
								name='receivedDate'
								value={receivedDate}
								onChange={(event) => setReceivedDate(event.target.value)}
							/>
						</label>

						<label>
							<span>Outbound Shipping</span>
							<input
								type='number'
								name='outboundShippingCost'
								step={0.01}
								min={0}
								value={outboundShippingCost}
								onChange={(event) =>
									setOutboundShippingCost(event.target.value)
								}
							/>
						</label>

						<label>
							<span>Insured Return Shipping</span>
							<input
								type='number'
								name='insuredReturnShippingCost'
								step={0.01}
								min={0}
								value={insuredReturnShippingCost}
								onChange={(event) =>
									setInsuredReturnShippingCost(event.target.value)
								}
							/>
						</label>
					</div>

					<div className='psaSubmissionNew__form-actions'>
						{!isCompleted && (
							<button
								type='button'
								className='psaSubmissionNew__danger'
								onClick={() => setIsFinishModalOpen(true)}
							>
								Finish Submission
							</button>
						)}

						<button type='submit' disabled={!hasChanges || isSaving}>
							{isSaving ? "Saving..." : "Save Submission"}
						</button>
					</div>
				</form>
			) : (
				<dl className='psaSubmissionNew__details'>
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
						<dt>Outbound Shipping</dt>
						<dd>${Number(submission.outboundShippingCost).toFixed(2)}</dd>
					</div>

					<div>
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
