"use client";

import { useState } from "react";
import { CardForm } from "@/components/CardForm/CardForm";
import { Drawer } from "@/components/Drawer/Drawer";
import { Button } from "@/components/Button/Button";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import type { CardFormOptions } from "@/db/queries/cardFormOptions";
import type { Card } from "@/types/types";

interface CardStatus {
	id: number;
	name: string;
}

interface AddCardProps {
	statuses: CardStatus[];
	portfolio: "investment" | "collection";
	options: CardFormOptions;
	card?: Card | null;
	copyFrom?: Card | null;
	onCloseEdit?: () => void;
	onCloseCopy?: () => void;
	editOnly?: boolean;
	copyOnly?: boolean;
}

export function AddCard({
	statuses,
	portfolio,
	options,
	card = null,
	copyFrom = null,
	onCloseEdit,
	onCloseCopy,
	editOnly = false,
	copyOnly = false,
}: AddCardProps) {
	const [isOpen, setIsOpen] = useState(false);

	const isEditing = card !== null;
	const isCopying = copyFrom !== null;

	const drawerIsOpen = isEditing || isCopying || isOpen;

	useKeyboardShortcut(
		"a",
		() => {
			setIsOpen(true);
		},
		{
			disabled: editOnly || isEditing,
		},
	);

	function handleClose() {
		if (isEditing) {
			onCloseEdit?.();
			return;
		}

		if (isCopying) {
			onCloseCopy?.();
			return;
		}

		setIsOpen(false);
	}

	return (
		<>
			{!editOnly && !copyOnly && !isEditing && !isCopying && (
				<Button
					type='main'
					variant='add'
					htmlType='button'
					leadingIcon='add-card'
					label='Add Card'
					onClick={() => setIsOpen(true)}
				/>
			)}

			<Drawer
				isOpen={drawerIsOpen}
				title={
					isEditing
						? `Edit ${card.player}`
						: isCopying
							? `Copy ${copyFrom.player}`
							: "Add Card"
				}
				onClose={handleClose}
			>
				<CardForm
					statuses={statuses}
					portfolio={portfolio}
					options={options}
					card={card ?? undefined}
					copyFrom={copyFrom ?? undefined}
					onClose={handleClose}
				/>
			</Drawer>
		</>
	);
}
