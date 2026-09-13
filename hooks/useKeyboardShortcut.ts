"use client";

import { useEffect } from "react";

interface UseKeyboardShortcutOptions {
	disabled?: boolean;
	allowWhileTyping?: boolean;
}

export function useKeyboardShortcut(
	key: string,
	callback: () => void,
	options: UseKeyboardShortcutOptions = {},
) {
	const { disabled = false, allowWhileTyping = false } = options;

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (disabled) {
				return;
			}

			const target = event.target;

			const isTyping =
				target instanceof HTMLElement &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.tagName === "SELECT" ||
					target.isContentEditable);

			if (isTyping && !allowWhileTyping) {
				return;
			}

			if (event.key.toLowerCase() !== key.toLowerCase()) {
				return;
			}

			event.preventDefault();

			callback();
		}

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [key, callback, disabled, allowWhileTyping]);
}
