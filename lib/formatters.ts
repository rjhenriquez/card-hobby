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
		return "";
	}

	const parsedDate = DateTime.fromISO(date);

	if (!parsedDate.isValid) {
		return "";
	}

	return parsedDate.toFormat("LLL d, yyyy");
}
export function formatNumericDate(date?: string | null) {
	if (!date) {
		return "";
	}
	const parsedDate = DateTime.fromISO(date);
	if (!parsedDate.isValid) {
		return "";
	}
	return parsedDate.toFormat("MM/dd/yy");
}

interface FormatCurrencyOptions {
	showSign?: boolean;
	minimumFractionDigits?: number;
	maximumFractionDigits?: number;
}

export function formatCurrency(
	value: number,
	{
		showSign = true,
		minimumFractionDigits = 2,
		maximumFractionDigits = 2,
	}: FormatCurrencyOptions = {},
) {
	const sign = value < 0 ? "-" : "";
	const formattedValue = Math.abs(value).toLocaleString("en-US", {
		minimumFractionDigits,
		maximumFractionDigits,
	});
	return `${sign}${showSign ? "$" : ""}${formattedValue}`;
}
export function formatRangeDate1M(date?: string | null) {
	if (!date) {
		return "";
	}
	const parsedDate = DateTime.fromISO(date);
	if (!parsedDate.isValid) {
		return "";
	}
	return parsedDate.toFormat("dd");
}

export function formatRangeDateYTD(date?: string | null) {
	if (!date) {
		return "";
	}
	const parsedDate = DateTime.fromISO(date);
	if (!parsedDate.isValid) {
		return "";
	}
	return parsedDate.toFormat("MM/dd");
}

export function formatRangeDate1Y(date?: string | null) {
	if (!date) {
		return "";
	}
	const parsedDate = DateTime.fromISO(date);
	if (!parsedDate.isValid) {
		return "";
	}
	return parsedDate.toFormat("MM/dd");
}

export function formatRangeDateAll(date?: string | null) {
	if (!date) {
		return "";
	}
	const parsedDate = DateTime.fromISO(date);
	if (!parsedDate.isValid) {
		return "";
	}
	return parsedDate.toFormat("MM/yy");
}
