"use client";

import { createCard } from "@/app/actions/cards";

interface CardStatus {
  id: number;
  name: string;
}

interface CardFormProps {
  statuses: CardStatus[];
  portfolio: "investment" | "collection";
}

export function CardForm({ statuses, portfolio }: CardFormProps) {
  return (
    <form action={createCard}>
      <input type="hidden" name="portfolio" value={portfolio} />
      <label>
        Player
        <input name="player" type="text" required />
      </label>

      <label>
        Category
        <input name="category" type="text" />
      </label>

      <label>
        Year
        <input name="year" type="text" />
      </label>

      <label>
        Set
        <input name="setName" type="text" />
      </label>

      <label>
        Info
        <input name="info" type="text" />
      </label>

      <label>
        Notes
        <textarea name="notes" />
      </label>

      <label>
        Acquisition Type
        <select name="acquisitionType" defaultValue="purchased">
          <option value="purchased">Purchased</option>
          <option value="pulled">Pulled</option>
        </select>
      </label>

      <label>
        Status
        <select name="statusId" defaultValue="">
          <option value="">No status</option>

          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Purchase Date
        <input name="purchaseDate" type="date" />
      </label>

      <label>
        Purchased From
        <input name="purchasedFrom" type="text" />
      </label>

      <label>
        eBay Seller
        <input name="ebaySeller" type="text" />
      </label>

      <label>
        Purchase Price
        <input name="purchasePrice" type="number" min="0" step="0.01" />
      </label>

      <button type="submit">Add Card</button>
    </form>
  );
}
