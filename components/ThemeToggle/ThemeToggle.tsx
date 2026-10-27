"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/Button/Button";
import { Icon } from "@/components/Icons/Icons";
import { getStoredTheme, setStoredTheme, type Theme } from "@/lib/storage";

import styles from "./ThemeToggle.module.scss";

interface ThemeToggleProps {
	layout?: "icon" | "menu";
	className?: string;
	iconClassName?: string;
	labelClassName?: string;
}

export function ThemeToggle({
	layout = "icon",
	className,
	iconClassName,
	labelClassName,
}: ThemeToggleProps) {
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

	const nextThemeLabel = theme === "light" ? "Dark" : "Light";

	if (layout === "menu") {
		return (
			<button type='button' onClick={toggleTheme} className={className}>
				<Icon
					className={iconClassName}
					icon={nextThemeLabel === "Dark" ? "moon" : "sun"}
				/>
				<span className={labelClassName}>{nextThemeLabel} theme</span>
			</button>
		);
	}

	return (
		<Button
			type='icon'
			onClick={toggleTheme}
			leadingIcon={theme === "light" ? "dark" : "light"}
			tooltipPosition='left'
			className={styles.ThemeToggle}
		/>
	);
}
