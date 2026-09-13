import { Icon } from "@/components/Icons/Icons";

import styles from "./InputDate.module.scss";

interface InputDateProps {
	defaultValue?: string;
	name: string;
	label: string;
	width?: "full" | "half";
}

export function InputDate({
	defaultValue,
	name,
	label,
	width = "full",
}: InputDateProps) {
	return (
		<label
			className={`${styles.InputDate} ${
				width === "half" ? styles["InputDate--half"] : ""
			}`}
		>
			<span className={styles.InputDate__label}>{label}</span>

			<span className={styles.InputDate__field}>
				<input type='date' name={name} defaultValue={defaultValue} />
				<Icon icon='calendar' className={styles.InputDate__icon} />
			</span>
		</label>
	);
}
