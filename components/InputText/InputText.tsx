import { Icon } from "@/components/Icons/Icons";

import styles from "./InputText.module.scss";

interface InputTextProps {
	defaultValue?: string | number;
	name: string;
	label: string;
	required?: boolean;
	leadingIcon?: string;
	width?: "full" | "half" | "third";
	type?: "text" | "number";
	min?: number;
	step?: number;
}

export function InputText({
	defaultValue,
	name,
	label,
	leadingIcon,
	width = "full",
	type = "text",
	required,
	min,
	step,
}: InputTextProps) {
	return (
		<label
			className={`${styles.InputText} ${
				width ? styles[`InputText--${width}`] : ""
			}`}
		>
			<span className={styles.InputText__label}>{label}</span>
			<span
				className={`${styles.InputText__field} ${
					leadingIcon ? styles["InputText__field--icon"] : ""
				}`}
			>
				<input
					type={type}
					name={name}
					defaultValue={defaultValue}
					min={min}
					step={step}
					required={required}
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
