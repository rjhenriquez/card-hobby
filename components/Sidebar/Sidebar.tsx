import Link from "next/link";
import styles from "./Sidebar.module.scss";

const navigation = [
	{
		label: "Dashboard",
		href: "/",
	},
	{
		label: "Investments",
		href: "/investment",
	},
	{
		label: "Collection",
		href: "/collection",
	},
	{
		label: "PSA Submissions",
		href: "/psa-submissions",
	},
	{
		label: "Packages",
		href: "/packages",
	},
];

export function Sidebar() {
	return (
		<aside className='DevSidebar'>
			<nav aria-label='Main navigation'>
				<ul>
					{navigation.map((item) => (
						<li key={item.href}>
							<Link href={item.href}>{item.label}</Link>
						</li>
					))}
				</ul>
			</nav>
		</aside>
	);
}
