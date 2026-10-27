// Days from the sent date to the received date (or today if not received yet).
// Returns null when the submission hasn't been sent.
export function getSubmissionDays(
	sentDate: string | null,
	receivedDate: string | null,
): number | null {
	if (!sentDate) return null;

	const startDate = new Date(`${sentDate}T00:00:00`);
	const endDate = receivedDate
		? new Date(`${receivedDate}T00:00:00`)
		: new Date();
	const start = Date.UTC(
		startDate.getFullYear(),
		startDate.getMonth(),
		startDate.getDate(),
	);
	const end = Date.UTC(
		endDate.getFullYear(),
		endDate.getMonth(),
		endDate.getDate(),
	);

	return Math.max(0, Math.round((end - start) / 86400000));
}
