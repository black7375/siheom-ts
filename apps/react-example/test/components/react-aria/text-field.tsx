"use client";

import {
  FieldError as RACFieldError,
  Input as RACInput,
  Label as RACLabel,
  TextField as RACTextField,
  type TextFieldProps,
} from "react-aria-components";

import { cn } from "@/lib/utils";

function TextField({ className, label, ...props }: TextFieldProps & { label: string }) {
  return (
    <RACTextField className={cn("flex flex-col gap-1.5", className)} {...props}>
      <RACLabel className="text-sm font-medium">{label}</RACLabel>
      <RACInput
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30",
        )}
      />
      <RACFieldError className="text-sm text-destructive" />
    </RACTextField>
  );
}

export { TextField };
