import styles from "./Input.module.scss";

type ChoiceInputProps = {
	type: "radio" | "checkbox";
	name: string;
	value: string;
	label: string;
	checked: boolean;
	disabled?: boolean;
	onChange: () => void;
	isHeader?: boolean;
};

type TextInputProps = {
	type: "text";
	name: string;
	value?: string;
	label?: string;
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;
	onChange?: (value: string) => void;
	isHeader?: boolean;
	ref?: React.Ref<HTMLInputElement>;
};

type InputProps = ChoiceInputProps | TextInputProps;

export function Input(props: InputProps) {
	const { type, name, value, disabled = false, isHeader = false } = props;

	if (type === "text") {
		return (
			<label
				className={`${styles.Input} ${styles["Input--text"]} ${
					isHeader ? styles["Input--header"] : ""
				} ${disabled ? styles["Input--disabled"] : ""}`}
			>
				{props.label && <span>{props.label}</span>}

				<input
					ref={props.ref}
					type='text'
					name={name}
					value={props.value}
					placeholder={props.placeholder}
					disabled={disabled}
					required={props.required}
					onChange={
						props.onChange
							? (event) => props.onChange?.(event.target.value)
							: undefined
					}
				/>
			</label>
		);
	}

	return (
		<label
			className={`${styles.Input} ${
				props.checked ? styles["Input--checked"] : ""
			} ${disabled ? styles["Input--disabled"] : ""} ${
				isHeader ? styles["Input--header"] : ""
			}`}
		>
			<input
				type={type}
				name={name}
				value={value}
				checked={props.checked}
				disabled={disabled}
				onChange={props.onChange}
			/>

			<span>{props.label}</span>
		</label>
	);
}
