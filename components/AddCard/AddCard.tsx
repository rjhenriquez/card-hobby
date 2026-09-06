"use client";

import { useState } from "react";
import { CardForm } from "@/components/CardForm/CardForm";
import { Drawer } from "@/components/Drawer/Drawer";
import type { Card } from "@/types/types";

interface CardStatus {
	id: number;
	name: string;
}

interface AddCardProps {
	statuses: CardStatus[];
	portfolio: "investment" | "collection";
	card?: Card | null;
	onCloseEdit?: () => void;
	editOnly?: boolean;
}

export function AddCard({
	statuses,
	portfolio,
	card = null,
	onCloseEdit,
	editOnly = false,
}: AddCardProps) {
	const [isOpen, setIsOpen] = useState(false);

	const isEditing = card !== null;
	const drawerIsOpen = isEditing || isOpen;

	function handleClose() {
		if (isEditing) {
			onCloseEdit?.();
			return;
		}

		setIsOpen(false);
	}

	return (
		<>
			{!editOnly && !isEditing && (
				<button type='button' onClick={() => setIsOpen(true)}>
					Add Card
				</button>
			)}

			<Drawer
				isOpen={drawerIsOpen}
				title={isEditing ? `Edit ${card.player}` : "Add Card"}
				onClose={handleClose}
			>
				<CardForm
					statuses={statuses}
					portfolio={portfolio}
					card={card ?? undefined}
					onClose={handleClose}
				/>
			</Drawer>
		</>
	);
}
