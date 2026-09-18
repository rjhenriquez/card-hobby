import Link from "next/link";
import { CSSProperties } from "react";
import { Icon } from "@/components/Icons/Icons";
import cn from "classnames";

import styles from "./HighlightCardMultiple.module.scss";

interface HighlightCardMultipleItem {
	label: string;
	value: string | number;
	subValue: string | number;
	link: string;
}

interface HighlightCardMultipleProps {
	items: HighlightCardMultipleItem[];
	icon?: string;
	className?: string;
}

type HighlightCardMultipleCSSProperties = CSSProperties & {
	"--highlight-children-count": number;
};

export function HighlightCardMultiple({
	items,
	icon,
	className,
}: HighlightCardMultipleProps) {
	const cssVariables: HighlightCardMultipleCSSProperties = {
		"--highlight-children-count": items.length,
	};

	return (
		<div
			className={cn(styles.HighlightCardMultiple, className)}
			style={cssVariables}
		>
			{icon && (
				<Icon className={styles.HighlightCardMultiple__icon} icon={icon} />
			)}

			<div className={styles.HighlightCardMultiple__items}>
				{items.map(({ label, value, subValue, link }) => (
					<Link
						key={link}
						className={styles.HighlightCardMultiple__item}
						href={link}
					>
						<span className={styles.HighlightCardMultiple__item__label}>
							{label}
						</span>

						<span className={styles.HighlightCardMultiple__item__value}>
							{value}
						</span>

						<span className={styles.HighlightCardMultiple__item__subValue}>
							{subValue}
						</span>
					</Link>
				))}
			</div>
		</div>
	);
}
