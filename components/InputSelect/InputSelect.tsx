import { Icon } from "@/components/Icons/Icons";

import styles from "./InputSelect.module.scss";

interface InputSelectOption {
	label: string;
	value: string;
}

interface InputSelectProps {
	name: string;
	label: string;
	defaultValue?: string;
	options: InputSelectOption[];
	width?: "full" | "half";
}

export function InputSelect({
	name,
	label,
	defaultValue,
	options,
	width = "full",
}: InputSelectProps) {
	return (
		<label
			className={`${styles.InputSelect} ${
				width === "half" ? styles["InputSelect--half"] : ""
			}`}
		>
			<span className={styles.InputSelect__label}>{label}</span>

			<span className={styles.InputSelect__field}>
				<select name={name} defaultValue={defaultValue}>
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>

				<Icon icon='arrow-down' className={styles.InputSelect__icon} />
			</span>
		</label>
	);
}
