"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/Button/Button";
import cn from "classnames";

import styles from "./Drawer.module.scss";

interface DrawerProps {
	isOpen: boolean;
	title: string;
	children: ReactNode;
	onClose: () => void;
}

export function Drawer({ isOpen, title, children, onClose }: DrawerProps) {
	const [isMounted, setIsMounted] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const [isAnimatingOpen, setIsAnimatingOpen] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);

			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setIsAnimatingOpen(true);
				});
			});
		} else {
			setIsAnimatingOpen(false);
		}
	}, [isOpen]);

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

	if (!isMounted || !isVisible) {
		return null;
	}

	return createPortal(
		<div
			className={cn(styles.Drawer, {
				[styles["Drawer--open"]]: isAnimatingOpen,
			})}
			role='presentation'
			onMouseDown={onClose}
			onTransitionEnd={(event) => {
				if (!isOpen && event.target === event.currentTarget) {
					setIsVisible(false);
				}
			}}
		>
			<div
				className={styles.Drawer__dialog}
				role='dialog'
				aria-modal='true'
				aria-labelledby='drawer-title'
				onMouseDown={(event) => event.stopPropagation()}
			>
				<header className={styles.Drawer__header}>
					<h2 className={styles.Drawer__heading} id='drawer-title'>
						{title}
					</h2>

					<Button
						type='icon'
						htmlType='button'
						leadingIcon='close'
						onClick={onClose}
						ariaLabel='Close'
					/>
				</header>

				{children}
			</div>
		</div>,
		document.body,
	);
}
