"use client";

import { Checkbox as ArkCheckbox } from "@ark-ui/react/checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  id,
  name,
  children,
  required,
}: {
  id: string;
  name: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <ArkCheckbox.Root id={id} name={name} required={required} className="flex items-start gap-2">
      <ArkCheckbox.Control
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30",
        )}
      >
        <ArkCheckbox.Indicator>
          <CheckIcon className="size-3.5" />
        </ArkCheckbox.Indicator>
      </ArkCheckbox.Control>
      <ArkCheckbox.Label className="text-sm font-medium">{children}</ArkCheckbox.Label>
      <ArkCheckbox.HiddenInput />
    </ArkCheckbox.Root>
  );
}

export { Checkbox };
