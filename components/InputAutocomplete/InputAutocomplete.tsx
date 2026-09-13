"use client";

import { useMemo, useState } from "react";

import styles from "./InputAutocomplete.module.scss";

interface InputAutocompleteProps {
	name: string;
	label: string;
	options?: string[];
	defaultValue?: string;
	width?: "full" | "half" | "third";
	required?: boolean;
}

export function InputAutocomplete({
	name,
	label,
	options = [],
	defaultValue = "",
	width = "full",
	required = false,
}: InputAutocompleteProps) {
	const [value, setValue] = useState(defaultValue);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);

	const filteredOptions = useMemo(() => {
		const search = value.trim().toLowerCase();

		if (!search) {
			return [];
		}

		return options
			.filter((option) => option.toLowerCase().includes(search))
			.slice(0, 8);
	}, [options, value]);

	function selectOption(option: string) {
		setValue(option);
		setIsOpen(false);
		setActiveIndex(-1);
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (!isOpen || filteredOptions.length === 0) {
			return;
		}

		if (event.key === "ArrowDown") {
			event.preventDefault();

			setActiveIndex((current) =>
				current >= filteredOptions.length - 1 ? 0 : current + 1,
			);

			return;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();

			setActiveIndex((current) =>
				current <= 0 ? filteredOptions.length - 1 : current - 1,
			);

			return;
		}

		if (event.key === "Tab") {
			event.preventDefault();

			if (event.shiftKey) {
				setActiveIndex((current) =>
					current <= 0 ? filteredOptions.length - 1 : current - 1,
				);
			} else {
				setActiveIndex((current) =>
					current >= filteredOptions.length - 1 ? 0 : current + 1,
				);
			}

			return;
		}

		if (event.key === "Enter" && activeIndex >= 0) {
			event.preventDefault();

			selectOption(filteredOptions[activeIndex]);

			return;
		}

		if (event.key === "Escape") {
			setIsOpen(false);
			setActiveIndex(-1);
		}
	}

	return (
		<label
			className={`${styles.InputAutocomplete} ${
				width !== "full" ? styles[`InputAutocomplete--${width}`] : ""
			}`}
		>
			<span className={styles.InputAutocomplete__label}>{label}</span>

			<div className={styles.InputAutocomplete__field}>
				<input
					type='text'
					name={name}
					value={value}
					required={required}
					autoComplete='off'
					onFocus={() => setIsOpen(true)}
					onChange={(event) => {
						setValue(event.target.value);
						setIsOpen(true);
						setActiveIndex(-1);
					}}
					onKeyDown={handleKeyDown}
					onBlur={() => {
						window.setTimeout(() => {
							setIsOpen(false);
							setActiveIndex(-1);
						}, 100);
					}}
				/>

				{isOpen && filteredOptions.length > 0 && (
					<div className={styles.InputAutocomplete__options}>
						{filteredOptions.map((option, index) => (
							<button
								key={option}
								type='button'
								className={`${styles.InputAutocomplete__option} ${
									index === activeIndex
										? styles["InputAutocomplete__option--active"]
										: ""
								}`}
								onMouseDown={(event) => {
									event.preventDefault();
								}}
								onMouseEnter={() => setActiveIndex(index)}
								onClick={() => selectOption(option)}
							>
								{option}
							</button>
						))}
					</div>
				)}
			</div>
		</label>
	);
}
