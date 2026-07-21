import { Button } from "@/components/ui/button";

export type SlateCaptureTarget = "slate-placeholder" | "plain-control";

export function CaptureTargetToolbar({
  target,
  onTargetChange,
}: {
  target: SlateCaptureTarget;
  onTargetChange: (target: SlateCaptureTarget) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="캡처 대상">
      <Button
        type="button"
        size="sm"
        variant={target === "slate-placeholder" ? "default" : "outline"}
        aria-pressed={target === "slate-placeholder"}
        onClick={() => onTargetChange("slate-placeholder")}
      >
        Slate + placeholder
      </Button>
      <Button
        type="button"
        size="sm"
        variant={target === "plain-control" ? "default" : "outline"}
        aria-pressed={target === "plain-control"}
        onClick={() => onTargetChange("plain-control")}
      >
        plain control
      </Button>
    </div>
  );
}
