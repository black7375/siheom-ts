import { Button } from "@/components/ui/button";

import type { SlateLoggerMode } from "./SlateLogger";

export function SlateModeToolbar({
  mode,
  onModeChange,
}: {
  mode: SlateLoggerMode;
  onModeChange: (mode: SlateLoggerMode) => void;
}) {
  const modes: SlateLoggerMode[] = ["broken", "minimal", "end-only", "fixed"];

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Slate fix 모드">
      {modes.map((option) => (
        <Button
          key={option}
          type="button"
          size="sm"
          variant={mode === option ? "default" : "outline"}
          aria-pressed={mode === option}
          onClick={() => onModeChange(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
