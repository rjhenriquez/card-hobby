"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import cn from "classnames";

import styles from "./Tabs.module.scss";

interface Tab {
	label: string;
	value: string;
	children: ReactNode;
}

interface TabsProps {
	tabs: Tab[];
	activeTab: string;
}

export function Tabs({ tabs, activeTab }: TabsProps) {
	const router = useRouter();
	const pathname = usePathname();

	const selectedTab = tabs.find((tab) => tab.value === activeTab) ?? tabs[0];

	function handleTabChange(value: string) {
		router.push(`${pathname}?tab=${value}`);
	}

	return (
		<div className={styles.Tabs}>
			<div className={styles.Tabs__header} role='tablist'>
				{tabs.map((tab) => {
					const isActive = tab.value === selectedTab.value;

					return (
						<button
							key={tab.value}
							type='button'
							role='tab'
							aria-selected={isActive}
							className={cn(styles.Tabs__label, {
								[styles["Tabs__label--active"]]: isActive,
							})}
							onClick={() => handleTabChange(tab.value)}
						>
							{tab.label}
						</button>
					);
				})}
			</div>

			<div className={styles.Tabs__content} role='tabpanel'>
				{selectedTab.children}
			</div>
		</div>
	);
}
