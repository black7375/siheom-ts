import { Button } from "@/components/ui/button";

export function PlaceholderToolbar({
  showPlaceholder,
  onShowPlaceholderChange,
}: {
  showPlaceholder: boolean;
  onShowPlaceholderChange: (show: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="placeholder">
      <Button
        type="button"
        size="sm"
        variant={showPlaceholder ? "default" : "outline"}
        aria-pressed={showPlaceholder}
        onClick={() => onShowPlaceholderChange(true)}
      >
        placeholder on
      </Button>
      <Button
        type="button"
        size="sm"
        variant={!showPlaceholder ? "default" : "outline"}
        aria-pressed={!showPlaceholder}
        onClick={() => onShowPlaceholderChange(false)}
      >
        placeholder off
      </Button>
    </div>
  );
}
