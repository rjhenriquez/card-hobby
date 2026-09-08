"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import cn from "classnames";
import { Icon } from "@/components/Icons/Icons";
import styles from "./Sidebar.module.scss";

const navigation = [
	{
		label: "Dashboard",
		href: "/",
		icon: "dashboard",
	},
	{
		label: "Investments",
		href: "/investment",
		icon: "investments",
	},
	{
		label: "Collection",
		href: "/collection",
		icon: "collection",
	},
	{
		label: "PSA Submissions",
		href: "/psa-submissions",
		icon: "submissions",
	},
	{
		label: "Packages",
		href: "/packages",
		icon: "shipping",
	},
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<aside className={styles.Sidebar}>
			<nav aria-label='Sidebar navigation'>
				<ul className={styles.Sidebar__list}>
					{navigation.map((item) => {
						const isActive =
							item.href === "/"
								? pathname === "/"
								: pathname === item.href ||
									pathname.startsWith(`${item.href}/`);

						const content = (
							<>
								<Icon className={styles.Sidebar__icon} icon={item.icon} />
								<span>{item.label}</span>
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
		</aside>
	);
}
