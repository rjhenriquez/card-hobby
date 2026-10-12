"use client";

import { useState } from "react";
import { PsaSubmissionStats } from "./PsaSubmissionStats";
import { PsaSubmissionFormRow } from "./PsaSubmissionFormRow";
import { PsaSubmissionForm } from "./PsaSubmissionForm";
import { TableInfo } from "@/components/TableInfo/TableInfo";
import { Button } from "@/components/Button/Button";
import cn from "classnames";

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
	isHistorical: boolean;
	historicalTotalCards: number | null;
	historicalPsa10: number | null;
	historicalPsa9: number | null;
	historicalPsa85: number | null;
	historicalPsa8: number | null;
	historicalPsa75OrLess: number | null;
	historicalNoGrade: number | null;
}

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
	totalCost: number;
}

interface PsaSubmissionProps {
	submission: PsaSubmission;
	cards: PsaSubmissionCard[];
	sharedCost: number;
	totalSubmissionCost: number;
	totalInvestment: number;
	showStats: boolean;
	alwaysOpen?: boolean;
}

export function PsaSubmission({
	submission,
	cards,
	sharedCost,
	totalSubmissionCost,
	totalInvestment,
	showStats,
	alwaysOpen = false,
}: PsaSubmissionProps) {
	const isCompleted = submission.completedDate !== null;
	const [isEditing, setIsEditing] = useState(!isCompleted);
	const [isOpen, setIsOpen] = useState(false);

	const isContentOpen = alwaysOpen || isOpen;
	const cardsInvestment = cards.reduce((total, card) => {
		const cost = Number(card.totalCost);
		return total + (Number.isFinite(cost) ? cost : 0);
	}, 0);

	const formattedTotalInvestment = totalInvestment.toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
	});

	const submissionSummary = (location: "top" | "bottom") => (
		<dl
			className={`${styles.PsaSubmission__summary} ${
				styles[`PsaSubmission__summary--${location}`]
			}`}
		>
			<div className={styles.PsaSubmission__summary__wrapper}>
				<dt>Total Submission Cost</dt>
				<dd className={styles.PsaSubmission__summary__number}>
					{`$${totalSubmissionCost.toLocaleString("en-US", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}`}
				</dd>
			</div>

			<div className={styles.PsaSubmission__summary__wrapper}>
				<dt>Stage</dt>
				<dd>{submission.stage ?? "—"}</dd>
			</div>

			<div className={styles.PsaSubmission__summary__wrapper}>
				<dt>Status</dt>
				<dd>In Progress</dd>
			</div>
		</dl>
	);

	return (
		<div className={styles.PsaSubmission}>
			<header className={styles.PsaSubmission__header}>
				<div className={styles.PsaSubmission__heading}>
					<p className={styles.PsaSubmission__eyebrow}>
						{isCompleted
							? "Completed"
							: `In Progress - ${cards.length} ${cards.length === 1 ? "card" : "cards"}`}
					</p>
					<h2 className={styles.PsaSubmission__title}>
						<span>Submission</span>{" "}
						<span className={styles.PsaSubmission__title__number}>
							{submission.submissionNumber}
						</span>
					</h2>

					<p className={styles.PsaSubmission__subhead}>
						<span>Total Costs: </span>
						<span className={styles.PsaSubmission__subhead__number}>
							{formattedTotalInvestment}
						</span>
					</p>
				</div>

				{!alwaysOpen && (
					<div className={styles.PsaSubmission__actions}>
						<Button
							className={cn(styles.PsaSubmission__trigger, {
								[styles["PsaSubmission__trigger--open"]]: isOpen,
							})}
							type='icon'
							variant='primary'
							htmlType='button'
							leadingIcon='arrow-left'
							tooltip={isOpen ? "Hide Contents" : "Show Contents"}
							onClick={() => setIsOpen((current) => !current)}
						/>
					</div>
				)}
			</header>

			<div
				className={cn(styles.PsaSubmission__content, {
					[styles["PsaSubmission__content--open"]]: isContentOpen,
				})}
			>
				<div className={styles.PsaSubmission__content__inner}>
					{isCompleted && showStats ? (
						<PsaSubmissionStats
							cards={cards}
							isHistorical={submission.isHistorical}
							historicalStats={{
								totalCards: submission.historicalTotalCards,
								psa10: submission.historicalPsa10,
								psa9: submission.historicalPsa9,
								psa85: submission.historicalPsa85,
								psa8: submission.historicalPsa8,
								psa75OrLess: submission.historicalPsa75OrLess,
								noGrade: submission.historicalNoGrade,
							}}
						/>
					) : (
						submissionSummary("top")
					)}

					<div className={styles.PsaSubmission__summary__wrapper}>
						<PsaSubmissionForm
							submission={submission}
							isEditing={isEditing}
							onSaved={() => {
								if (isCompleted) {
									setIsEditing(false);
								}
							}}
						/>
					</div>

					<div className={styles.PsaSubmission__content__wrapper}>
						{cards.length === 0 ? (
							<p>No cards in this submission.</p>
						) : (
							<TableInfo
								headers={[
									"Card",
									"Base Fee",
									"Adjustment",
									"Shared Cost",
									"Grading Cost",
									"Grade",
									"",
								]}
							>
								{cards.map((card) => (
									<PsaSubmissionFormRow
										key={card.submissionCardId}
										card={card}
										submissionNumber={submission.submissionNumber}
										sharedCost={sharedCost}
										isCompleted={isCompleted}
										isEditing={isEditing}
									/>
								))}
							</TableInfo>
						)}
					</div>

					{isCompleted && submissionSummary("bottom")}
				</div>
			</div>
		</div>
	);
}
