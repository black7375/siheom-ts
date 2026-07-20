"use client";

import {
  Checkbox,
  CheckboxCheck,
  CheckboxProvider,
  useCheckboxStore,
} from "@ariakit/react";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function TermsCheckbox({
  name,
  children,
  required,
}: {
  name: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  const checkbox = useCheckboxStore({ defaultValue: false });
  const checked = checkbox.useState("value");

  return (
    <CheckboxProvider store={checkbox}>
      <label className="flex items-start gap-2">
        <Checkbox
          render={
            <button
              type="button"
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:bg-input/30",
              )}
            />
          }
        >
          <CheckboxCheck className="text-current">
            <CheckIcon className="size-3.5" />
          </CheckboxCheck>
        </Checkbox>
        <span className="text-sm font-medium">{children}</span>
      </label>
      <input type="hidden" name={name} value={checked ? "on" : "off"} required={required && !checked} />
    </CheckboxProvider>
  );
}

export { TermsCheckbox as Checkbox };
