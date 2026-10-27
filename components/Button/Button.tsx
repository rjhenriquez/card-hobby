import React from "react";
import { Icon } from "@/components/Icons/Icons";
import { Tooltip } from "@/components/Tooltip/Tooltip";
import cn from "classnames";

import styles from "./Button.module.scss";

export interface ButtonProps {
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	type?:
		| "icon"
		| "main"
		| "main-sm"
		| "number-add"
		| "main-lg"
		| "icon-sm"
		| "panel";
	variant?: "primary" | "delete";
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
	ref?: React.Ref<HTMLButtonElement>;
	// For buttons that open a menu or panel.
	ariaExpanded?: boolean;
	ariaControls?: string;
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
	ref,
	ariaExpanded,
	ariaControls,
}: ButtonProps) => {
	return (
		<button
			ref={ref}
			type={htmlType}
			onClick={onClick}
			className={`Button ${styles.Button} ${styles[`Button--${type}`]} ${
				styles[`Button--${variant}`]
			} ${className}`.trim()}
			disabled={disabled}
			form={form}
			aria-label={tooltip || ariaLabel}
			aria-expanded={ariaExpanded}
			aria-controls={ariaControls}
		>
			{leadingIcon && (
				<Icon
					icon={leadingIcon}
					className={cn("Button__icon", styles.Button__icon, {
						[styles["Button__icon--loading"]]: trailingIcon === "loading",
					})}
				/>
			)}

			{label && <span className={styles.Button__label}>{label}</span>}

			{trailingIcon && (
				<Icon
					icon={trailingIcon}
					className={cn("Button__icon", styles.Button__icon, {
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
