import { ChangeEvent } from "react";
import { Icon } from "@/components/Icons/Icons";
import cn from "classnames";
import styles from "./InputDate.module.scss";

interface InputDateProps {
	defaultValue?: string;
	value?: string;
	name: string;
	label: string;
	width?: "full" | "half" | "third";
	onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
	className?: string;
}

export function InputDate({
	defaultValue,
	value,
	name,
	label,
	width = "full",
	onChange,
	className,
}: InputDateProps) {
	return (
		<label
			className={cn(
				styles.InputDate,
				width && styles[`InputDate--${width}`],
				className,
			)}
		>
			<span className={styles.InputDate__label}>{label}</span>

			<span className={styles.InputDate__field}>
				<input
					type='date'
					name={name}
					defaultValue={defaultValue}
					value={value}
					onChange={onChange}
				/>

				<Icon icon='calendar' className={styles.InputDate__icon} />
			</span>
		</label>
	);
}
