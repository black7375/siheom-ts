"use client";

import { CheckboxButton, CheckboxField, type CheckboxFieldProps } from "react-aria-components";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  children,
  ...props
}: CheckboxFieldProps & { children: React.ReactNode }) {
  return (
    <CheckboxField className={cn("flex flex-col gap-1", className)} {...props}>
      <CheckboxButton className="group/checkbox flex items-start gap-2">
        {({ isSelected, isIndeterminate }) => (
          <>
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-focus-visible/checkbox:border-ring group-focus-visible/checkbox:ring-3 group-focus-visible/checkbox:ring-ring/50 group-disabled/checkbox:cursor-not-allowed group-disabled/checkbox:opacity-50 group-selected/checkbox:border-primary group-selected/checkbox:bg-primary group-selected/checkbox:text-primary-foreground dark:bg-input/30",
                (isSelected || isIndeterminate) &&
                  "border-primary bg-primary text-primary-foreground",
              )}
            >
              {isSelected && !isIndeterminate ? <CheckIcon className="size-3.5" /> : null}
            </span>
            <span className="text-sm font-medium">{children}</span>
          </>
        )}
      </CheckboxButton>
    </CheckboxField>
  );
}

export { Checkbox };
