import { Icon } from "@/components/Icons/Icons";
import cn from "classnames";

import styles from "./HighlightCard.module.scss";

interface HighlightCardProps {
	highlightLabel: string;
	highlightValue: string | number;
	subLabel: string;
	subValue: string | number;
	link?: string;
	className?: string;
	icon?: string;
}

export function HighlightCard({
	highlightLabel,
	highlightValue,
	subLabel,
	subValue,
	link,
	className,
	icon,
}: HighlightCardProps) {
	return (
		<div className={cn(styles.HighlightCard, className)}>
			{icon && <Icon className={styles.HighlightCard__icon} icon={icon} />}
			<span className={styles.HighlightCard__highlight__label}>
				{highlightLabel}
			</span>
			<span className={styles.HighlightCard__highlight__value}>
				{highlightValue}
			</span>
			<span className={styles.HighlightCard__sub__label}>{subLabel}</span>
			<span className={styles.HighlightCard__sub__value}>{subValue}</span>
		</div>
	);
}
