"use client";

import { useId } from "react";
import { Select, SelectItem, SelectPopover, SelectProvider, useSelectStore } from "@ariakit/react";

import { cn } from "@/lib/utils";

function PlanSelect({
  label,
  name,
  required,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const id = useId();
  const select = useSelectStore({ defaultValue: "" });
  const value = select.useState("value");

  return (
    <SelectProvider store={select}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <Select
          id={id}
          className={cn(
            "inline-flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 dark:bg-input/30",
          )}
        />
        <SelectPopover className="z-50 overflow-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
          {children}
        </SelectPopover>
        <input type="hidden" name={name} value={value} required={required} />
      </div>
    </SelectProvider>
  );
}

function PlanSelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <SelectItem
      value={value}
      className={cn(
        "cursor-default rounded-md px-2 py-1.5 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50",
      )}
    >
      {children}
    </SelectItem>
  );
}

export { PlanSelect as Select, PlanSelectItem as SelectItem };
