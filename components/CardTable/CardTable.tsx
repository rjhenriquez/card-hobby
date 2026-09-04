"use client";

import { useState } from "react";
import Link from "next/link";
import {
  rowSelectionFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
import { moveCardToPortfolio, updateCard } from "@/app/actions/cards";
import type { Card } from "@/types/types";

interface CardStatus {
  id: number;
  name: string;
}

interface CardTableProps {
  cards: Card[];
  statuses: CardStatus[];
  portfolio: "investment" | "collection";
  rowSelection: RowSelectionState;
  onRowSelectionChange: (rowSelection: RowSelectionState) => void;
  onMoveCard: (card: Card) => void;
}

const features = tableFeatures({
  rowSelectionFeature,
});

export function CardTable({
  cards,
  statuses,
  portfolio,
  rowSelection,
  onRowSelectionChange,
  onMoveCard,
}: CardTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);

  async function handleUpdate(formData: FormData) {
    await updateCard(formData);
    setEditingId(null);
  }

  async function handleMove(cardId: number) {
    const destination =
      portfolio === "investment" ? "collection" : "investment";

    const confirmed = window.confirm(
      `Move this card to ${
        destination === "investment" ? "Investment" : "Collection"
      }?`,
    );

    if (!confirmed) {
      return;
    }

    await moveCardToPortfolio(cardId, destination);
  }

  const columns: ColumnDef<typeof features, Card>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          ref={(input) => {
            if (input) {
              input.indeterminate =
                table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
            }
          }}
          onChange={table.getToggleAllRowsSelectedHandler()}
          aria-label="Select all cards"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          aria-label={`Select ${row.original.player}`}
        />
      ),
    },
    {
      accessorKey: "player",
      header: "Player",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "year",
      header: "Year",
    },
    {
      accessorKey: "setName",
      header: "Set",
    },
    {
      accessorKey: "info",
      header: "Info",
    },
    {
      accessorKey: "effectiveStatus",
      header: "Status",
    },
    {
      accessorKey: "activePsaSubmissionNumber",
      header: "PSA Submission",
      cell: ({ getValue }) => {
        const submissionNumber = getValue() as
          | Card["activePsaSubmissionNumber"]
          | undefined;
        if (!submissionNumber) {
          return "—";
        }
        return (
          <Link href={`/psa-submissions/${submissionNumber}`}>
            {submissionNumber}
          </Link>
        );
      },
    },
    {
      accessorKey: "purchasePrice",
      header: "Price",
      cell: ({ getValue }) => {
        const value = getValue();

        return value ? `$${value}` : "—";
      },
    },
    {
      id: "actions",
      header: "",
    },
  ];

  const table = useTable({
    data: cards,
    columns,
    features,
    state: {
      rowSelection,
    },
    onRowSelectionChange: (updater) => {
      const nextSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;

      onRowSelectionChange(nextSelection);
    },
    getRowId: (row) => String(row.id),
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder ? null : (
                  <table.FlexRender header={header} />
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody>
        {table.getRowModel().rows.map((row) => {
          const card = row.original;
          const isEditing = editingId === card.id;

          if (isEditing) {
            return (
              <tr key={row.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                    aria-label={`Select ${card.player}`}
                  />
                </td>

                <td>
                  <form id={`edit-card-${card.id}`} action={handleUpdate}>
                    <input type="hidden" name="id" value={card.id} />

                    <input
                      name="player"
                      type="text"
                      defaultValue={card.player}
                      required
                    />
                  </form>
                </td>

                <td>
                  <input
                    form={`edit-card-${card.id}`}
                    name="category"
                    type="text"
                    defaultValue={card.category ?? ""}
                  />
                </td>

                <td>
                  <input
                    form={`edit-card-${card.id}`}
                    name="year"
                    type="text"
                    defaultValue={card.year ?? ""}
                  />
                </td>

                <td>
                  <input
                    form={`edit-card-${card.id}`}
                    name="setName"
                    type="text"
                    defaultValue={card.setName ?? ""}
                  />
                </td>

                <td>
                  <input
                    form={`edit-card-${card.id}`}
                    name="info"
                    type="text"
                    defaultValue={card.info ?? ""}
                  />
                </td>

                <td>
                  {card.effectiveStatus !== card.status ? (
                    card.effectiveStatus
                  ) : (
                    <select
                      form={`edit-card-${card.id}`}
                      name="statusId"
                      defaultValue={
                        statuses.find((status) => status.name === card.status)
                          ?.id ?? ""
                      }
                    >
                      <option value="">No status</option>

                      {statuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  )}
                </td>

                <td>
                  {card.activePsaSubmissionNumber ? (
                    <Link
                      href={`/psa-submissions/${card.activePsaSubmissionNumber}`}
                    >
                      {card.activePsaSubmissionNumber}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>

                <td>
                  <input
                    form={`edit-card-${card.id}`}
                    name="purchasePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={card.purchasePrice ?? ""}
                  />

                  <input
                    form={`edit-card-${card.id}`}
                    type="hidden"
                    name="acquisitionType"
                    value={card.acquisitionType}
                  />

                  <input
                    form={`edit-card-${card.id}`}
                    type="hidden"
                    name="purchaseDate"
                    value={card.purchaseDate ?? ""}
                  />

                  <input
                    form={`edit-card-${card.id}`}
                    type="hidden"
                    name="purchasedFrom"
                    value={card.purchasedFrom ?? ""}
                  />

                  <input
                    form={`edit-card-${card.id}`}
                    type="hidden"
                    name="ebaySeller"
                    value={card.ebaySeller ?? ""}
                  />

                  <input
                    form={`edit-card-${card.id}`}
                    type="hidden"
                    name="notes"
                    value={card.notes ?? ""}
                  />
                </td>

                <td>
                  <button type="submit" form={`edit-card-${card.id}`}>
                    Save
                  </button>

                  <button type="button" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </td>
              </tr>
            );
          }

          return (
            <tr key={row.id}>
              {row.getAllCells().map((cell) => {
                if (cell.column.id === "actions") {
                  return (
                    <td key={cell.id}>
                      <button
                        type="button"
                        onClick={() => setEditingId(card.id)}
                      >
                        Edit
                      </button>

                      <button type="button" onClick={() => onMoveCard(card)}>
                        {portfolio === "investment"
                          ? "Move to Collection"
                          : "Move to Investment"}
                      </button>
                    </td>
                  );
                }

                return (
                  <td key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
