import type { SortingState } from "@tanstack/react-table";

export const STORAGE_KEYS = {
	theme: "theme",
	sidebarOpen: "sidebar-open",
	cardTableExpanded: "card-table-expanded",
	cardTableFontSize: "card-table-font-size",
} as const;

export type Theme = "light" | "dark";

// ---------------------------------------------
// Theme
// ---------------------------------------------

export function getStoredTheme(): Theme {
	const storedTheme = localStorage.getItem(STORAGE_KEYS.theme);

	return storedTheme === "dark" ? "dark" : "light";
}

export function setStoredTheme(theme: Theme) {
	localStorage.setItem(STORAGE_KEYS.theme, theme);
}

// ---------------------------------------------
// Sidebar
// ---------------------------------------------

export function getStoredSidebarOpen(): boolean {
	if (typeof window === "undefined") {
		return false;
	}

	return window.localStorage.getItem(STORAGE_KEYS.sidebarOpen) === "true";
}

export function setStoredSidebarOpen(isOpen: boolean) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(STORAGE_KEYS.sidebarOpen, String(isOpen));
}

// ---------------------------------------------
// Card Table Expanded
// ---------------------------------------------

export function getStoredCardTableExpanded(): boolean {
	return localStorage.getItem(STORAGE_KEYS.cardTableExpanded) === "true";
}

export function setStoredCardTableExpanded(isExpanded: boolean) {
	localStorage.setItem(STORAGE_KEYS.cardTableExpanded, String(isExpanded));
}

// ---------------------------------------------
// Card Table Sorting
// ---------------------------------------------

function getCardTableSortingKey(portfolio: "investment" | "collection") {
	return `card-table-sorting-${portfolio}`;
}

export function getStoredCardTableSorting(
	portfolio: "investment" | "collection",
): SortingState {
	if (typeof window === "undefined") {
		return [];
	}

	const storedValue = window.localStorage.getItem(
		getCardTableSortingKey(portfolio),
	);

	if (!storedValue) {
		return [];
	}

	try {
		return JSON.parse(storedValue) as SortingState;
	} catch {
		return [];
	}
}

export function setStoredCardTableSorting(
	portfolio: "investment" | "collection",
	sorting: SortingState,
) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(
		getCardTableSortingKey(portfolio),
		JSON.stringify(sorting),
	);
}

// ---------------------------------------------
// Card Table Font Size
// ---------------------------------------------

export function getStoredCardTableFontSize() {
	if (typeof window === "undefined") {
		return 12;
	}

	const storedValue = window.localStorage.getItem(
		STORAGE_KEYS.cardTableFontSize,
	);

	const fontSize = Number(storedValue);

	if (!Number.isFinite(fontSize)) {
		return 12;
	}

	return Math.min(Math.max(fontSize, 10), 36);
}

export function setStoredCardTableFontSize(fontSize: number) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(STORAGE_KEYS.cardTableFontSize, String(fontSize));
}
