"use client";

import {
  Label as RACLabel,
  ListBox,
  ListBoxItem,
  Popover,
  Select as RACSelect,
  SelectValue,
  type SelectProps,
} from "react-aria-components";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/react-aria/button";

function Select<T extends object>({
  className,
  label,
  children,
  ...props
}: SelectProps<T> & { label: string }) {
  return (
    <RACSelect placeholder="" className={cn("flex flex-col gap-1.5", className)} {...props}>
      <RACLabel className="text-sm font-medium">{label}</RACLabel>
      <Button className="w-full justify-between">
        <SelectValue className="truncate data-placeholder:text-muted-foreground" />
        <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
      </Button>
      <Popover className="rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
        <ListBox className="max-h-60 outline-none">{children}</ListBox>
      </Popover>
    </RACSelect>
  );
}

function SelectItem({ className, ...props }: React.ComponentProps<typeof ListBoxItem>) {
  return (
    <ListBoxItem
      className={cn(
        "cursor-default rounded-md px-2 py-1.5 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Select, SelectItem };
