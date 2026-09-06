"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.scss";

interface ModalProps {
	isOpen: boolean;
	title: string;
	children: ReactNode;
	onClose: () => void;
}

export function Modal({ isOpen, title, children, onClose }: ModalProps) {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				onClose();
			}
		}

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isMounted || !isOpen) {
		return null;
	}

	return createPortal(
		<div className={`${styles.Modal} DevModal`} onClick={onClose}>
			<div
				className='DevModal__dialog'
				role='dialog'
				aria-modal='true'
				aria-labelledby='modal-title'
				onClick={(event) => event.stopPropagation()}
			>
				<header className='DevModal__header'>
					<h2 id='modal-title'>{title}</h2>

					<button type='button' aria-label='Close' onClick={onClose}>
						×
					</button>
				</header>

				{children}
			</div>
		</div>,
		document.body,
	);
}
