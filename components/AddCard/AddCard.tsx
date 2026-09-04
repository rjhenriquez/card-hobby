"use client";

import { useState } from "react";
import { CardForm } from "@/components/CardForm/CardForm";
import { Drawer } from "@/components/Drawer/Drawer";

interface CardStatus {
  id: number;
  name: string;
}

interface AddCardProps {
  statuses: CardStatus[];
  portfolio: "investment" | "collection";
}

export function AddCard({ statuses, portfolio }: AddCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Add Card
      </button>

      <Drawer isOpen={isOpen} title="Add Card" onClose={() => setIsOpen(false)}>
        <CardForm statuses={statuses} portfolio={portfolio} />
      </Drawer>
    </>
  );
}
