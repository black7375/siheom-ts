"use client";

import { useState } from "react";
import { LayoutGridIcon, ListIcon } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { VIEW_ITEMS, type ViewMode } from "./items.fixture";

export function ViewSwitcher() {
  const [view, setView] = useState<ViewMode>("list");

  return (
    <section aria-label="보기 전환" className="mx-auto max-w-md p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="view-switcher-title" className="text-lg font-semibold">
          보기 전환
        </h2>
        <ToggleGroup
          value={[view]}
          onValueChange={(value) => {
            const next = value.at(-1);
            if (next === "list" || next === "grid") {
              setView(next);
            }
          }}
          aria-label="보기 방식"
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="list" aria-label="목록">
            <ListIcon />
            목록
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="그리드">
            <LayoutGridIcon />
            그리드
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {view === "list" ? (
        <section aria-label="목록 보기">
          <ul className="flex flex-col gap-2">
            {VIEW_ITEMS.map((item) => (
              <li
                key={item.id}
                aria-label={item.title}
                className="rounded-lg border bg-card px-3 py-2 shadow-sm"
              >
                {item.title}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section aria-label="그리드 보기">
          <ul className="grid grid-cols-2 gap-2">
            {VIEW_ITEMS.map((item) => (
              <li
                key={item.id}
                aria-label={item.title}
                className="rounded-lg border bg-card px-3 py-4 text-center shadow-sm"
              >
                {item.title}
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
