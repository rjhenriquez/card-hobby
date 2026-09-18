import React from "react";
import { Icon } from "@/components/Icons/Icons";
import { Tooltip } from "@/components/Tooltip/Tooltip";
import cn from "classnames";

import styles from "./Button.module.scss";

export interface ButtonProps {
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	type?: "icon" | "main" | "number-add";
	variant?: "default" | "add" | "continue" | "delete" | "cancel" | "header";
	htmlType?: "button" | "submit" | "reset";
	className?: string;
	leadingIcon?: string;
	trailingIcon?: string;
	form?: string;
	label?: string;
	disabled?: boolean;
	ariaLabel?: string;
	tooltip?: string;
	tooltipPosition?: "left" | "right" | "top" | "bottom";
}

export const Button = ({
	onClick,
	type = "icon",
	variant,
	htmlType = "button",
	className = "",
	leadingIcon,
	trailingIcon,
	label,
	disabled = false,
	ariaLabel,
	tooltip,
	form,
	tooltipPosition = "top",
}: ButtonProps) => {
	return (
		<button
			type={htmlType}
			onClick={onClick}
			className={`Button ${styles.Button} ${styles[`Button--${type}`]} ${
				styles[`Button--${variant}`]
			} ${className}`.trim()}
			disabled={disabled}
			form={form}
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

			{tooltip && (
				<Tooltip tooltipContent={tooltip} tooltipPosition={tooltipPosition} />
			)}
		</button>
	);
};
