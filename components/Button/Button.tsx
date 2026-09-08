import React from "react";
import { Icon } from "@/components/Icons/Icons";

import styles from "./Button.module.scss";

export interface ButtonProps {
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	type?: "icon" | "icon-label";
	htmlType?: "button" | "submit" | "reset";
	className?: string;
	tooltip?: string;
	icon?: string;
	label?: string;
	disabled?: boolean;
	ariaLabel?: string;
}

export const Button = ({
	onClick,
	type = "icon",
	htmlType = "button",
	className = "",
	tooltip,
	icon,
	label,
	disabled = false,
	ariaLabel,
}: ButtonProps) => {
	return (
		<button
			type={htmlType}
			onClick={onClick}
			className={`${styles.Button} ${styles[`Button--${type}`]} ${className}`.trim()}
			disabled={disabled}
			aria-label={tooltip || ariaLabel}
		>
			{icon && <Icon icon={icon} />}

			{label && <span className={styles.Button__label}>{label}</span>}

			{tooltip && <span className={styles.Button__tooltip}>{tooltip}</span>}
		</button>
	);
};
