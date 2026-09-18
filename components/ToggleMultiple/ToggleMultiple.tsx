import cn from "classnames";

import styles from "./ToggleMultiple.module.scss";

interface ToggleMultipleOption<T extends string> {
	label: string;
	value: T;
}

interface ToggleMultipleProps<T extends string> {
	options: ToggleMultipleOption<T>[];
	value: T;
	onChange: (value: T) => void;
	className?: string;
}

export function ToggleMultiple<T extends string>({
	options,
	value,
	onChange,
	className,
}: ToggleMultipleProps<T>) {
	return (
		<div className={cn(styles.ToggleMultiple, className)}>
			{options.map((option) => {
				const isActive = option.value === value;

				return (
					<button
						key={option.value}
						className={cn(styles.ToggleMultiple__button, {
							[styles["ToggleMultiple__button--active"]]: isActive,
						})}
						type='button'
						aria-pressed={isActive}
						onClick={() => onChange(option.value)}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
