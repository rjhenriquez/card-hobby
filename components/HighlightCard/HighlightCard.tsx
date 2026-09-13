import styles from "./HighlightCard.module.scss";

interface HighlightCardProps {
	highlightLabel: string;
	highlightValue: string | number;
	subLabel: string;
	subValue: string | number;
	link?: string;
}

export function HighlightCard({
	highlightLabel,
	highlightValue,
	subLabel,
	subValue,
	link,
}: HighlightCardProps) {
	return (
		<div className={styles.HighlightCard}>
			<div className={styles.HighlightCard__highlight}>
				<span className={styles.HighlightCard__highlight__label}>
					{highlightLabel}
				</span>

				<span className={styles.HighlightCard__highlight__value}>
					{highlightValue}
				</span>
			</div>

			<div className={styles.HighlightCard__sub}>
				<span className={styles.HighlightCard__sub__label}>{subLabel}</span>

				<span className={styles.HighlightCard__sub__value}>{subValue}</span>
			</div>
		</div>
	);
}
