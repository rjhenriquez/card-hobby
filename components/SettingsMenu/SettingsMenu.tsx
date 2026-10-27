"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import cn from "classnames";

import { Button } from "@/components/Button/Button";
import { Icon } from "@/components/Icons/Icons";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";

import styles from "./SettingsMenu.module.scss";

const settingsItems = [
	{
		label: "Search Admin",
		href: "/search/admin",
		icon: "search-admin",
	},
];

export function SettingsMenu() {
	const pathname = usePathname();

	return (
		<div className={styles.SettingsMenu}>
			<Button
				type='icon'
				leadingIcon='settings'
				ariaLabel='Settings'
				className={styles.SettingsMenu__trigger}
			/>

			<ul className={styles.SettingsMenu__list}>
				{settingsItems.map((item) => {
					const isActive = pathname === item.href;

					const content = (
						<>
							<Icon className={styles.SettingsMenu__icon} icon={item.icon} />
							<span className={styles.SettingsMenu__label}>{item.label}</span>
						</>
					);

					return (
						<li key={item.href}>
							{isActive ? (
								<span
									className={cn(
										styles.SettingsMenu__link,
										styles["SettingsMenu__link--active"],
									)}
									aria-current='page'
								>
									{content}
								</span>
							) : (
								<Link href={item.href} className={styles.SettingsMenu__link}>
									{content}
								</Link>
							)}
						</li>
					);
				})}

				<li>
					<ThemeToggle
						layout='menu'
						className={styles.SettingsMenu__link}
						iconClassName={styles.SettingsMenu__icon}
						labelClassName={styles.SettingsMenu__label}
					/>
				</li>
			</ul>
		</div>
	);
}
