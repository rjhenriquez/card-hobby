"use client";

import { useState } from "react";
import { updateCard } from "@/app/actions/cards";

interface CardStatus {
	id: number;
	name: string;
}

interface CardRowCard {
	id: number;
	player: string;
	category: string | null;
	year: string | null;
	setName: string | null;
	info: string | null;
	notes: string | null;
	acquisitionType: "purchased" | "pulled";
	purchaseDate: string | null;
	purchasedFrom: string | null;
	ebaySeller: string | null;
	purchasePrice: string | null;
	status: string | null;
}

interface CardRowProps {
	card: CardRowCard;
	statuses: CardStatus[];
}

export function CardRow({ card, statuses }: CardRowProps) {
	const [isEditing, setIsEditing] = useState(false);
	async function handleUpdate(formData: FormData) {
		await updateCard(formData);
		setIsEditing(false);
	}

	if (isEditing) {
		return (
			<li>
				<form action={handleUpdate}>
					<input type='hidden' name='id' value={card.id} />

					<label>
						Player
						<input
							name='player'
							type='text'
							defaultValue={card.player}
							required
						/>
					</label>

					<label>
						Category
						<input
							name='category'
							type='text'
							defaultValue={card.category ?? ""}
						/>
					</label>

					<label>
						Year
						<input name='year' type='text' defaultValue={card.year ?? ""} />
					</label>

					<label>
						Set
						<input
							name='setName'
							type='text'
							defaultValue={card.setName ?? ""}
						/>
					</label>

					<label>
						Info
						<input name='info' type='text' defaultValue={card.info ?? ""} />
					</label>

					<label>
						Notes
						<textarea name='notes' defaultValue={card.notes ?? ""} />
					</label>

					<label>
						Acquisition Type
						<select name='acquisitionType' defaultValue={card.acquisitionType}>
							<option value='purchased'>Purchased</option>
							<option value='pulled'>Pulled</option>
						</select>
					</label>

					<label>
						Status
						<select
							name='statusId'
							defaultValue={
								statuses.find((status) => status.name === card.status)?.id ?? ""
							}
						>
							<option value=''>No status</option>

							{statuses.map((status) => (
								<option key={status.id} value={status.id}>
									{status.name}
								</option>
							))}
						</select>
					</label>

					<label>
						Purchase Date
						<input
							name='purchaseDate'
							type='date'
							defaultValue={card.purchaseDate ?? ""}
						/>
					</label>

					<label>
						Purchased From
						<input
							name='purchasedFrom'
							type='text'
							defaultValue={card.purchasedFrom ?? ""}
						/>
					</label>

					<label>
						eBay Seller
						<input
							name='ebaySeller'
							type='text'
							defaultValue={card.ebaySeller ?? ""}
						/>
					</label>

					<label>
						Purchase Price
						<input
							name='purchasePrice'
							type='number'
							min='0'
							step='0.01'
							defaultValue={card.purchasePrice ?? ""}
						/>
					</label>

					<div>
						<button type='submit'>Save</button>

						<button type='button' onClick={() => setIsEditing(false)}>
							Cancel
						</button>
					</div>
				</form>
			</li>
		);
	}

	return (
		<li>
			<strong>{card.player}</strong>
			{card.year && <> — {card.year}</>}
			{card.setName && <> {card.setName}</>}
			{card.info && <> — {card.info}</>}
			{" | "}
			{card.status ?? "No status"}
			{" | "}
			{card.purchasePrice ? `$${card.purchasePrice}` : "No purchase price"}{" "}
			<button type='button' onClick={() => setIsEditing(true)}>
				Edit
			</button>
		</li>
	);
}
