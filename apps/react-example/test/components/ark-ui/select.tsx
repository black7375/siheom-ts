"use client";

import { Select, createListCollection } from "@ark-ui/react/select";
import { ChevronDownIcon, CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function PlanSelect({
  label,
  name,
  items,
  value,
  onValueChange,
  required,
}: {
  label: string;
  name: string;
  items: readonly string[];
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
}) {
  const collection = createListCollection({
    items: items.map((item) => ({ label: item, value: item })),
  });

  return (
    <Select.Root
      collection={collection}
      value={value ? [value] : []}
      onValueChange={(details) => onValueChange(details.value[0] ?? "")}
      positioning={{ sameWidth: true }}
    >
      <Select.Label className="text-sm font-medium">{label}</Select.Label>
      <Select.Control>
        <Select.Trigger
          className={cn(
            "inline-flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
          )}
        >
          <Select.ValueText placeholder="" />
          <Select.Indicator>
            <ChevronDownIcon className="size-4 opacity-50" />
          </Select.Indicator>
        </Select.Trigger>
      </Select.Control>
      <Select.Positioner>
        <Select.Content className="z-50 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
          <Select.ItemGroup>
            {collection.items.map((item) => (
              <Select.Item
                key={item.value}
                item={item}
                className={cn(
                  "relative flex cursor-default items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                )}
              >
                <Select.ItemText>{item.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2">
                  <CheckIcon className="size-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.ItemGroup>
        </Select.Content>
      </Select.Positioner>
      <Select.HiddenSelect name={name} required={required} />
    </Select.Root>
  );
}

export { PlanSelect as Select };
