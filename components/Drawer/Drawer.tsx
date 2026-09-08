"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DrawerProps {
	isOpen: boolean;
	title: string;
	children: ReactNode;
	onClose: () => void;
}

export function Drawer({ isOpen, title, children, onClose }: DrawerProps) {
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
		<div className='DevDrawer' role='presentation' onMouseDown={onClose}>
			<div
				className='DevDrawer__dialog'
				role='dialog'
				aria-modal='true'
				aria-labelledby='drawer-title'
				onMouseDown={(event) => event.stopPropagation()}
			>
				<header className='DevDrawer__header'>
					<h2 id='drawer-title'>{title}</h2>

					<button type='button' onClick={onClose} aria-label='Close'>
						×
					</button>
				</header>

				{children}
			</div>
		</div>,
		document.body,
	);
}
