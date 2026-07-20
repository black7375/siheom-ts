"use client";

import {
  Checkbox as RACCheckbox,
  Label as RACLabel,
  type CheckboxProps,
} from "react-aria-components";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  children,
  ...props
}: CheckboxProps & { children: React.ReactNode }) {
  return (
    <RACCheckbox
      className={cn("group/checkbox flex items-start gap-2", className)}
      {...props}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-focus-visible/checkbox:border-ring group-focus-visible/checkbox:ring-3 group-focus-visible/checkbox:ring-ring/50 group-disabled/checkbox:cursor-not-allowed group-disabled/checkbox:opacity-50 group-selected/checkbox:border-primary group-selected/checkbox:bg-primary group-selected/checkbox:text-primary-foreground dark:bg-input/30",
        )}
      >
        <CheckIcon className="hidden size-3.5 group-selected/checkbox:block" />
      </span>
      <RACLabel className="text-sm font-medium">{children}</RACLabel>
    </RACCheckbox>
  );
}

export { Checkbox };
