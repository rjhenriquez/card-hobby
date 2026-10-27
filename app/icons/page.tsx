import { Icon, ICONS } from "@/components/Icons/Icons";

import iconStyles from "@/styles/components/Icons.module.scss";
import styles from "@/styles/page/Page.module.scss";

export default async function Search() {
	const iconKeys = Object.keys(ICONS).sort();

	return (
		<div className={styles.Page}>
			<div className={styles.Page__header}>
				<h1 className={styles.Page__heading}>Icons</h1>
			</div>

			<section className={styles.Page__section}>
				<div className={iconStyles.Icons}>
					{iconKeys.map((iconKey) => (
						<div className={iconStyles.Icon} key={iconKey}>
							<div className={iconStyles.Icon__wrapper}>
								<Icon className={iconStyles.Icon__icon} icon={iconKey} />
							</div>
							<p className={iconStyles.Icon__label}>icon="{iconKey}"</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
