"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

function TextField({
  label,
  id,
  ...props
}: React.ComponentProps<typeof Input> & { label: string; id: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input id={id} {...props} />
    </div>
  );
}

export { TextField };
