import { Icon } from "@/components/Icons/Icons";

import styles from "./InputCheckbox.module.scss";

interface InputCheckboxProps {
	name?: string;
	value?: string;
	label?: string;
	ariaLabel?: string;
	checked?: boolean;
	defaultChecked?: boolean;
	disabled?: boolean;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	isHeader?: boolean;
	type?: "circle" | "square" | "sidebar";
	width?: "full" | "half";
	ref?: React.Ref<HTMLInputElement>;
}

export function InputCheckbox({
	name,
	value,
	label,
	ariaLabel,
	checked,
	defaultChecked,
	disabled = false,
	onChange,
	isHeader = false,
	type = "circle",
	width = "full",
	ref,
}: InputCheckboxProps) {
	return (
		<label
			className={`input ${styles.InputCheckbox} ${
				styles[`InputCheckbox--${type}`]
			} ${width === "half" ? styles["InputCheckbox--half"] : ""} ${
				disabled ? styles["InputCheckbox--disabled"] : ""
			} ${isHeader ? styles["InputCheckbox--header"] : ""}`}
		>
			<input
				ref={ref}
				type='checkbox'
				name={name}
				value={value}
				checked={checked}
				defaultChecked={defaultChecked}
				disabled={disabled}
				aria-label={ariaLabel}
				onChange={onChange}
			/>

			<span className={styles.InputCheckbox__indicator}>
				{type === "square" && (
					<Icon icon='checkmark' className={styles.InputCheckbox__icon} />
				)}
			</span>

			{label && <span className={styles.InputCheckbox__label}>{label}</span>}
		</label>
	);
}
