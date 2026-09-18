"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import { Button } from "@/components/Button/Button";
import { useSidebar } from "@/components/Sidebar/SidebarContext";
import cn from "classnames";

import styles from "./Header.module.scss";

const navigation = [
	{
		label: "Cards",
		href: "/",
	},
	{
		label: "Search",
		href: "/search",
	},
];

export function Header() {
	const pathname = usePathname();
	const { isOpen, toggleSidebar } = useSidebar();

	const isCardsActive =
		pathname === "/" ||
		pathname.startsWith("/investment") ||
		pathname.startsWith("/collection") ||
		pathname.startsWith("/psa") ||
		pathname.startsWith("/packages");

	return (
		<header className={styles.Header}>
			<div className={styles.Header__inner}>
				<Button
					className={cn(styles.Header__sidebarToggle, {
						[styles["Header__sidebarToggle--open"]]: isOpen,
					})}
					onClick={toggleSidebar}
					aria-expanded={isOpen}
					aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
					leadingIcon='hamburger'
					type='icon'
					variant='header'
				/>

				<nav className={styles.Header__nav} aria-label='Main navigation'>
					<ul className={styles.Header__list}>
						{navigation.map((item) => {
							const isActive =
								item.href === "/"
									? isCardsActive
									: pathname === item.href ||
										pathname.startsWith(`${item.href}/`);

							return (
								<li key={item.href}>
									<Link
										href={item.href}
										className={`${styles.Header__link} ${
											isActive ? styles["Header__link--active"] : ""
										}`}
									>
										{item.label}
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>

				<ThemeToggle />
			</div>
		</header>
	);
}
