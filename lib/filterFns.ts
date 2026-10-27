import { constructFilterFn } from "@tanstack/react-table";

/**
 * Keeps rows whose column value contains ANY of the filter terms
 * (case-insensitive). Used by multi-value text filters like Player.
 * Blank terms are ignored; an empty list removes the filter.
 */
export const filterFn_includesAnyString = constructFilterFn({
	filter: (dataValue: string | undefined, filterValue: string[]) =>
		dataValue !== undefined &&
		filterValue.some((term) => dataValue.includes(term)),
	resolveFilterValue: (value: string[]) =>
		value.map((term) => term.trim().toLowerCase()).filter(Boolean),
	resolveDataValue: (value: unknown) =>
		value == null ? undefined : String(value).toLowerCase(),
	autoRemove: (value: string[] | undefined) =>
		!value || value.every((term) => !term.trim()),
});

/**
 * Keeps rows whose column value exactly matches ANY of the selected options
 * (case-insensitive). Used by multi-select dropdown filters like Seller.
 */
export const filterFn_equalsAnyString = constructFilterFn({
	...filterFn_includesAnyString,
	filter: (dataValue: string | undefined, filterValue: string[]) =>
		dataValue !== undefined && filterValue.includes(dataValue.trim()),
});

/**
 * Like `equalsAnyString`, but for columns holding several space-separated
 * values (e.g. PSA submission numbers): matches if any of them is selected.
 */
export const filterFn_hasAnyWord = constructFilterFn({
	...filterFn_includesAnyString,
	filter: (dataValue: string | undefined, filterValue: string[]) =>
		dataValue !== undefined &&
		dataValue.split(/\s+/).some((word) => filterValue.includes(word)),
});
