"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import cn from "classnames";

import { Button } from "@/components/Button/Button";
import { Logo } from "@/components/Logos/Logos";

import styles from "./Tabs.module.scss";

interface Tab {
	label?: string;
	logo?: string;
	value: string;
	children: ReactNode;
}

export interface TabSortOption {
	label: string;
	value: string;
}

interface TabsProps {
	tabs: Tab[];
	activeTab: string;
	sortOptions?: TabSortOption[];
	activeSort?: string;
}

export function Tabs({ tabs, activeTab, sortOptions, activeSort }: TabsProps) {
	const router = useRouter();
	const pathname = usePathname();

	const selectedTab = tabs.find((tab) => tab.value === activeTab) ?? tabs[0];

	// Read the current URL at click time so tab and sort params keep each other.
	function updateParam(key: string, value: string | null) {
		const params = new URLSearchParams(window.location.search);

		if (value === null) {
			params.delete(key);
		} else {
			params.set(key, value);
		}

		const query = params.toString();
		router.push(query ? `${pathname}?${query}` : pathname);
	}

	function handleTabChange(value: string) {
		updateParam("tab", value);
	}

	function handleSortChange(value: string) {
		// Clicking the active option clears the sort.
		updateParam("sort", value === activeSort ? null : value);
	}

	return (
		<div className={styles.Tabs}>
			<div className={styles.Tabs__container}>
				<div className={styles.Tabs__header} role='tablist'>
					{tabs.map((tab) => {
						const isActive = tab.value === selectedTab.value;

						return (
							<button
								key={tab.value}
								type='button'
								role='tab'
								aria-selected={isActive}
								aria-label={tab.label ?? tab.value}
								className={cn(styles.Tabs__label, {
									[styles["Tabs__label--active"]]: isActive,
								})}
								onClick={() => handleTabChange(tab.value)}
							>
								{tab.logo ? (
									<Logo className={styles.Tabs__logo} logo={tab.logo} />
								) : (
									tab.label
								)}
							</button>
						);
					})}
				</div>
				{sortOptions && sortOptions.length > 0 && (
					<div className={styles.Tabs__sort}>
						<Button
							type='icon'
							leadingIcon='sort'
							ariaLabel='Sort'
							className={cn(styles.Tabs__sort__trigger, {
								[styles["Tabs__sort__trigger--active"]]: Boolean(activeSort),
							})}
						/>

						<ul className={styles.Tabs__sort__list}>
							{sortOptions.map((option) => {
								const isActive = option.value === activeSort;

								return (
									<li key={option.value}>
										<button
											type='button'
											aria-pressed={isActive}
											className={cn(styles.Tabs__sort__option, {
												[styles["Tabs__sort__option--active"]]: isActive,
											})}
											onClick={() => handleSortChange(option.value)}
										>
											{option.label}
										</button>
									</li>
								);
							})}
						</ul>
					</div>
				)}
			</div>

			<div className={styles.Tabs__content} role='tabpanel'>
				{selectedTab.children}
			</div>
		</div>
	);
}
