"use client";

import * as LabelPrimitive from "@radix-ui/react-label";

import { Input } from "@/components/ui/input";

function TextField({
  label,
  id,
  ...props
}: React.ComponentProps<typeof Input> & { label: string; id: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <LabelPrimitive.Root htmlFor={id} className="text-sm font-medium">
        {label}
      </LabelPrimitive.Root>
      <Input id={id} {...props} />
    </div>
  );
}

export { TextField };
