import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type BrokenFixed = "broken" | "fixed";

export function ModeToolbar({
  mode,
  onModeChange,
}: {
  mode: BrokenFixed;
  onModeChange: (mode: BrokenFixed) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="모드">
      <Button
        type="button"
        size="sm"
        variant={mode === "broken" ? "default" : "outline"}
        aria-pressed={mode === "broken"}
        onClick={() => onModeChange("broken")}
      >
        broken
      </Button>
      <Button
        type="button"
        size="sm"
        variant={mode === "fixed" ? "default" : "outline"}
        aria-pressed={mode === "fixed"}
        onClick={() => onModeChange("fixed")}
      >
        fixed
      </Button>
    </div>
  );
}

export function CaptureInstructions({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section
      className="rounded-lg border border-border bg-muted/30 p-3 text-sm"
      aria-label="캡처 지시"
    >
      <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">{children}</ol>
      {footer}
    </section>
  );
}

export function clearWithInputEvent(input: HTMLElement | null) {
  if (!(input instanceof HTMLInputElement)) return;
  input.value = "";
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
