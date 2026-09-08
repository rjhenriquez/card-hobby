"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/Button/Button";
import { getStoredTheme, setStoredTheme, type Theme } from "@/lib/storage";

import styles from "./ThemeToggle.module.scss";

export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>("light");

	useEffect(() => {
		const initialTheme = getStoredTheme();

		setTheme(initialTheme);

		document.documentElement.classList.remove("theme--light", "theme--dark");

		document.documentElement.classList.add(`theme--${initialTheme}`);
	}, []);

	function toggleTheme() {
		const nextTheme: Theme = theme === "light" ? "dark" : "light";

		setTheme(nextTheme);

		document.documentElement.classList.remove("theme--light", "theme--dark");

		document.documentElement.classList.add(`theme--${nextTheme}`);

		setStoredTheme(nextTheme);
	}

	return (
		<Button
			onClick={toggleTheme}
			icon={theme === "light" ? "dark" : "light"}
			tooltip={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
		/>
	);
}
