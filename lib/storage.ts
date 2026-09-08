export const STORAGE_KEYS = {
	theme: "theme",
} as const;

export type Theme = "light" | "dark";

export function getStoredTheme(): Theme {
	const storedTheme = localStorage.getItem(STORAGE_KEYS.theme);

	return storedTheme === "dark" ? "dark" : "light";
}

export function setStoredTheme(theme: Theme) {
	localStorage.setItem(STORAGE_KEYS.theme, theme);
}
