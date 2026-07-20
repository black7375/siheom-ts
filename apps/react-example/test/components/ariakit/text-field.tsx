"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

function TextField({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: "text" | "email";
  required?: boolean;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input id={id} name={name} type={type} required={required} />
    </div>
  );
}

export { TextField };
