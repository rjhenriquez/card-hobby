import { Icon } from "@/components/Icons/Icons";
import { Tooltip } from "@/components/Tooltip/Tooltip";
import styles from "./ButtonGroup.module.scss";

interface ButtonGroupProps {
	onClickLeft: () => void;
	onClickRight: () => void;
	leftIcon: string;
	rightIcon: string;
	middleIcon: string;
	disabled?: boolean;
	leftDisabled?: boolean;
	rightDisabled?: boolean;
	tooltip?: string;
	tooltipPosition?: "left" | "right" | "top" | "bottom";
}

export function ButtonGroup({
	onClickLeft,
	onClickRight,
	leftIcon,
	rightIcon,
	middleIcon,
	disabled = false,
	leftDisabled = false,
	rightDisabled = false,
	tooltip,
	tooltipPosition = "top",
}: ButtonGroupProps) {
	return (
		<div className={`${styles.ButtonGroup} ButtonGroup`}>
			<button
				type='button'
				className={`${styles.ButtonGroup__button} ${styles["ButtonGroup__button--left"]}`}
				onClick={onClickLeft}
				disabled={disabled || leftDisabled}
				aria-label={`${tooltip} decrease`}
			>
				<Icon className={styles.ButtonGroup__icon} icon={leftIcon} />
			</button>

			<div className={styles.ButtonGroup__middle} title={tooltip}>
				<Icon className={styles.ButtonGroup__icon} icon={middleIcon} />
			</div>

			<button
				type='button'
				className={`${styles.ButtonGroup__button} ${styles["ButtonGroup__button--right"]}`}
				onClick={onClickRight}
				disabled={disabled || rightDisabled}
				aria-label={`${tooltip} increase`}
			>
				<Icon className={styles.ButtonGroup__icon} icon={rightIcon} />
			</button>
			{tooltip && (
				<Tooltip tooltipContent={tooltip} tooltipPosition={tooltipPosition} />
			)}
		</div>
	);
}
