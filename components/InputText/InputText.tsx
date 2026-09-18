import { ChangeEvent } from "react";
import { Icon } from "@/components/Icons/Icons";
import cn from "classnames";

import styles from "./InputText.module.scss";

interface InputTextProps {
	defaultValue?: string | number;
	value?: string | number;
	name: string;
	label?: string;
	required?: boolean;
	disabled?: boolean;
	leadingIcon?: string;
	width?: "full" | "half" | "third";
	variant?: "small";
	type?: "text" | "number" | "search";
	min?: number;
	max?: number;
	step?: number;
	form?: string;
	placeholder?: string;
	autoFocus?: boolean;
	onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
	className?: string;
}

export function InputText({
	defaultValue,
	value,
	name,
	label,
	required,
	disabled,
	leadingIcon,
	width = "full",
	type = "text",
	min,
	max,
	step,
	form,
	placeholder,
	autoFocus,
	variant,
	onChange,
	className,
}: InputTextProps) {
	return (
		<label
			className={cn(
				styles.InputText,
				width && styles[`InputText--${width}`],
				variant && styles[`InputText--${variant}`],
				className,
			)}
		>
			{label && <span className={styles.InputText__label}>{label}</span>}

			<span
				className={cn(styles.InputText__field, {
					[styles["InputText__field--icon"]]: leadingIcon,
				})}
			>
				<input
					form={form}
					type={type}
					name={name}
					defaultValue={defaultValue}
					value={value}
					min={min}
					max={max}
					step={step}
					required={required}
					disabled={disabled}
					placeholder={placeholder}
					autoFocus={autoFocus}
					onChange={onChange}
				/>

				{leadingIcon && (
					<span className={styles.InputText__icon__wrapper}>
						<Icon icon={leadingIcon} className={styles.InputText__icon} />
					</span>
				)}
			</span>
		</label>
	);
}
