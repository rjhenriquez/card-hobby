import styles from "./Tooltip.module.scss";

interface TooltipProps {
	tooltipContent: string;
	tooltipPosition?: "left" | "right" | "top" | "bottom";
}

export function Tooltip({
	tooltipContent,
	tooltipPosition = "top",
}: TooltipProps) {
	return (
		<span
			className={`Tooltip ${styles.Tooltip} ${styles[`Tooltip--${tooltipPosition}`]}`}
			role='tooltip'
		>
			{tooltipContent}
		</span>
	);
}
