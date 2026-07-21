import { Button } from "@/components/ui/button";

import type { SlateLoggerFixMode } from "./slatePlaceholderAlternatives";

const MODES: { id: SlateLoggerFixMode; label: string; title: string }[] = [
  { id: "broken", label: "broken", title: "Upstream Slate" },
  { id: "alt-a", label: "alt-a", title: "Composition anchor" },
  { id: "alt-b", label: "alt-b", title: "Trust Android IM (guard)" },
  { id: "alt-c", label: "alt-c", title: "Upstream-style (A+B)" },
];

export function SlateFixModeToolbar({
  mode,
  onModeChange,
}: {
  mode: SlateLoggerFixMode;
  onModeChange: (mode: SlateLoggerFixMode) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Slate fix 모드">
      {MODES.map(({ id, label, title }) => (
        <Button
          key={id}
          type="button"
          size="sm"
          variant={mode === id ? "default" : "outline"}
          aria-pressed={mode === id}
          title={title}
          onClick={() => onModeChange(id)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
