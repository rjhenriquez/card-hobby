"use client";

import { ReactNode, useEffect } from "react";

interface DrawerProps {
	isOpen: boolean;
	title: string;
	children: ReactNode;
	onClose: () => void;
}

export function Drawer({ isOpen, title, children, onClose }: DrawerProps) {
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) {
		return null;
	}

	return (
		<div className='DevDrawer' role='presentation' onMouseDown={onClose}>
			<div
				className='DevDrawer__dialog'
				role='dialog'
				aria-modal='true'
				aria-labelledby='card-drawer-title'
				onMouseDown={(event) => event.stopPropagation()}
			>
				<header className='DevDrawer__header'>
					<h2 id='card-drawer-title'>{title}</h2>

					<button type='button' onClick={onClose} aria-label='Close'>
						×
					</button>
				</header>

				{children}
			</div>
		</div>
	);
}
