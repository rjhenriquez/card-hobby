"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import cn from "classnames";

import { Logo } from "@/components/Logos/Logos";

import styles from "./Tabs.module.scss";

interface Tab {
	label?: string;
	logo?: string;
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

			<div className={styles.Tabs__content} role='tabpanel'>
				{selectedTab.children}
			</div>
		</div>
	);
}
