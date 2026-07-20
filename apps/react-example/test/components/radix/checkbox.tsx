"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as LabelPrimitive from "@radix-ui/react-label";
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
    <div className="flex items-start gap-2">
      <CheckboxPrimitive.Root
        id={id}
        name={name}
        required={required}
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30",
        )}
      >
        <CheckboxPrimitive.Indicator>
          <CheckIcon className="size-3.5" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <LabelPrimitive.Root htmlFor={id} className="text-sm font-medium">
        {children}
      </LabelPrimitive.Root>
    </div>
  );
}

export { Checkbox };
