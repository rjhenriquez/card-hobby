"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import cn from "classnames";
import { Icon } from "@/components/Icons/Icons";
import { SIDEBAR_NAVIGATION } from "@/constants";
import { Button } from "@/components/Button/Button";
import { useSidebar } from "./SidebarContext";

import styles from "./Sidebar.module.scss";

export function Sidebar() {
	const pathname = usePathname();
	const { isOpen, toggleSidebar } = useSidebar();
	const sidebarClass = `Sidebar ${styles.Sidebar} ${
		!isOpen ? `Sidebar--closed ${styles["Sidebar--closed"]}` : ""
	}`.trim();

	return (
		<aside className={sidebarClass}>
			<div className={styles.Sidebar__top}>
				{isOpen && (
					<Link href='/' className={styles.Sidebar__logo}>
						CH
					</Link>
				)}
				<Button
					className={cn(styles.Sidebar__sidebarToggle, {
						[styles["Sidebar__sidebarToggle--open"]]: isOpen,
					})}
					onClick={toggleSidebar}
					aria-expanded={isOpen}
					aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
					leadingIcon='hamburger'
					type='icon'
				/>
			</div>

			<div className={styles.Sidebar__bottom}>
				<nav
					className={styles.Sidebar__navigation}
					aria-label='Sidebar navigation'
				>
					<ul className={styles.Sidebar__list}>
						{SIDEBAR_NAVIGATION.map((item) => {
							const isActive = pathname === item.href;

							const content = (
								<>
									<Icon className={styles.Sidebar__icon} icon={item.icon} />
									<span className={styles.Sidebar__label}> {item.label}</span>
								</>
							);

							return (
								<li className={styles.Sidebar__item} key={item.href}>
									{isActive ? (
										<span
											className={cn(
												styles.Sidebar__link,
												styles["Sidebar__link--active"],
											)}
											aria-current='page'
										>
											{content}
										</span>
									) : (
										<Link className={styles.Sidebar__link} href={item.href}>
											{content}
										</Link>
									)}
								</li>
							);
						})}
					</ul>
				</nav>
			</div>
		</aside>
	);
}
