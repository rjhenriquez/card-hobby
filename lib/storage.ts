export const STORAGE_KEYS = {
	theme: "theme",
	cardTableExpanded: "card-table-expanded",
} as const;

export type Theme = "light" | "dark";

export function getStoredTheme(): Theme {
	const storedTheme = localStorage.getItem(STORAGE_KEYS.theme);

	return storedTheme === "dark" ? "dark" : "light";
}

export function setStoredTheme(theme: Theme) {
	localStorage.setItem(STORAGE_KEYS.theme, theme);
}

export function getStoredCardTableExpanded(): boolean {
	return localStorage.getItem(STORAGE_KEYS.cardTableExpanded) === "true";
}

export function setStoredCardTableExpanded(isExpanded: boolean) {
	localStorage.setItem(STORAGE_KEYS.cardTableExpanded, String(isExpanded));
}
