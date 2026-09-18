import { ChangeEvent } from "react";
import { Icon } from "@/components/Icons/Icons";
import cn from "classnames";

import styles from "./InputSelect.module.scss";

interface InputSelectOption {
	label: string;
	value: string;
}

interface InputSelectProps {
	name: string;
	label?: string;
	defaultValue?: string;
	value?: string;
	options: InputSelectOption[];
	width?: "full" | "half";
	form?: string;
	onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
	className?: string;
}

export function InputSelect({
	name,
	label,
	defaultValue,
	value,
	options,
	width = "full",
	form,
	onChange,
	className,
}: InputSelectProps) {
	return (
		<label
			className={cn(
				styles.InputSelect,
				width && styles[`InputSelect--${width}`],
				className,
			)}
		>
			{label && <span className={styles.InputSelect__label}>{label}</span>}

			<span className={styles.InputSelect__field}>
				<select
					form={form}
					name={name}
					defaultValue={defaultValue}
					value={value}
					onChange={onChange}
				>
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
