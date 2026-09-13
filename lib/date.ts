import { DateTime } from "luxon";

function getOrdinalSuffix(day: number) {
	if (day >= 11 && day <= 13) {
		return "th";
	}

	switch (day % 10) {
		case 1:
			return "st";
		case 2:
			return "nd";
		case 3:
			return "rd";
		default:
			return "th";
	}
}

export function formatDayWithOrdinal(date?: string | null) {
	if (!date) {
		return "—";
	}

	const parsedDate = DateTime.fromISO(date);

	if (!parsedDate.isValid) {
		return "—";
	}

	return `${parsedDate.toFormat("ccc")} ${parsedDate.day}${getOrdinalSuffix(
		parsedDate.day,
	)}`;
}

export function formatShortDate(date?: string | null) {
	if (!date) {
		return "—";
	}

	const parsedDate = DateTime.fromISO(date);

	if (!parsedDate.isValid) {
		return "—";
	}

	return parsedDate.toFormat("LLL d, yyyy");
}
