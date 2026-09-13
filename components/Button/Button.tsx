import React from "react";
import { Icon } from "@/components/Icons/Icons";
import cn from "classnames";

import styles from "./Button.module.scss";

export interface ButtonProps {
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	type?: "icon" | "main" | "number-add";
	variant?: "default" | "add" | "continue" | "delete" | "cancel";
	htmlType?: "button" | "submit" | "reset";
	className?: string;
	tooltip?: string;
	leadingIcon?: string;
	trailingIcon?: string;
	label?: string;
	disabled?: boolean;
	ariaLabel?: string;
}

export const Button = ({
	onClick,
	type = "icon",
	variant,
	htmlType = "button",
	className = "",
	tooltip,
	leadingIcon,
	trailingIcon,
	label,
	disabled = false,
	ariaLabel,
}: ButtonProps) => {
	return (
		<button
			type={htmlType}
			onClick={onClick}
			className={`${styles.Button} ${styles[`Button--${type}`]} ${
				styles[`Button--${variant}`]
			} ${className}`.trim()}
			disabled={disabled}
			aria-label={tooltip || ariaLabel}
		>
			{leadingIcon && (
				<Icon
					icon={leadingIcon}
					className={cn(styles.Button__icon, {
						[styles["Button__icon--loading"]]: leadingIcon === "loading",
					})}
				/>
			)}

			{label && <span className={styles.Button__label}>{label}</span>}

			{trailingIcon && (
				<Icon
					icon={trailingIcon}
					className={cn(styles.Button__icon, {
						[styles["Button__icon--loading"]]: trailingIcon === "loading",
					})}
				/>
			)}

			{tooltip && <span className={styles.Button__tooltip}>{tooltip}</span>}
		</button>
	);
};
