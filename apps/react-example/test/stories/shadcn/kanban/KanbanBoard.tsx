"use client";

import { useState } from "react";

type ColumnId = "in_progress" | "done";

type Card = {
  id: string;
  title: string;
  column: ColumnId;
};

const INITIAL_CARDS: Card[] = [{ id: "design", title: "디자인", column: "in_progress" }];

const COLUMN_LABELS: Record<ColumnId, string> = {
  in_progress: "진행 중",
  done: "완료",
};

export function KanbanBoard() {
  const [cards, setCards] = useState(INITIAL_CARDS);

  function moveCard(cardId: string, targetColumn: ColumnId) {
    setCards((prev) =>
      prev.map((card) => (card.id === cardId ? { ...card, column: targetColumn } : card)),
    );
  }

  const columns: ColumnId[] = ["in_progress", "done"];

  return (
    <section aria-label="칸반" className="mx-auto max-w-2xl p-4">
      <div className="grid grid-cols-2 gap-4">
        {columns.map((columnId) => (
          <ul
            key={columnId}
            aria-label={COLUMN_LABELS[columnId]}
            className="min-h-32 rounded-lg border bg-muted/30 p-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const cardId = event.dataTransfer.getData("text/plain");
              if (cardId) moveCard(cardId, columnId);
            }}
          >
            {cards
              .filter((card) => card.column === columnId)
              .map((card) => (
                <li
                  key={card.id}
                  aria-label={card.title}
                  draggable={true}
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", card.id);
                  }}
                  className="cursor-grab rounded-md border bg-background p-2 shadow-sm"
                >
                  {card.title}
                </li>
              ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
