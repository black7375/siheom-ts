import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { assignRef } from "../shared/assignRef";

/** Hangul + Hanja name suggestions — combobox competes with IME candidate keys. */
const DEFAULT_SUGGESTIONS = ["김태희", "김철수", "金泰熙", "金秀賢", "이영희"];

export const HANJA_NAME_TARGET = "金泰熙";

export type HanjaAutocompleteFieldProps = {
  /**
   * `broken` — Arrow/Enter/number keys always move or pick combobox options (no `isComposing` guard).
   * Steals keys meant for Hanja IME candidate window (Option+Enter conversion).
   * `fixed` — skip combobox keyboard handling while composing or on keyCode 229.
   */
  mode?: "broken" | "fixed";
  suggestions?: string[];
  label?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  onValueChange?: (value: string) => void;
};

export function HanjaAutocompleteField({
  mode = "broken",
  suggestions = DEFAULT_SUGGESTIONS,
  label = "이름",
  inputRef,
  onValueChange,
}: HanjaAutocompleteFieldProps) {
  const [value, setValue] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [pickCount, setPickCount] = useState(0);
  const [lastPicked, setLastPicked] = useState<string | null>(null);
  const localInputRef = useRef<HTMLInputElement>(null);
  const modeRef = useRef(mode);
  const onValueChangeRef = useRef(onValueChange);
  const inputId = "hanja-autocomplete-input";

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 5);
    const matched = suggestions.filter((item) => item.toLowerCase().includes(q));
    return (matched.length > 0 ? matched : suggestions).slice(0, 5);
  }, [suggestions, value]);

  const clampedHighlight = Math.min(highlightIndex, Math.max(0, filtered.length - 1));
  const filteredRef = useRef(filtered);
  const highlightRef = useRef(clampedHighlight);

  modeRef.current = mode;
  onValueChangeRef.current = onValueChange;
  filteredRef.current = filtered;
  highlightRef.current = clampedHighlight;

  useEffect(() => {
    setHighlightIndex(0);
  }, [filtered.length, value]);

  useEffect(() => {
    const node = localInputRef.current;
    if (!node) return;

    const syncValue = (next: string) => {
      setValue(next);
      onValueChangeRef.current?.(next);
    };

    const pickSuggestion = (index: number) => {
      const item = filteredRef.current[index];
      if (!item) return;
      node.value = item;
      syncValue(item);
      setPickCount((count) => count + 1);
      setLastPicked(item);
    };

    const shouldDeferToIme = (event: KeyboardEvent) =>
      modeRef.current === "fixed" && (event.isComposing || event.keyCode === 229);

    const onKeyDown = (event: KeyboardEvent) => {
      if (shouldDeferToIme(event)) return;

      const items = filteredRef.current;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightIndex((index) => Math.min(index + 1, items.length - 1));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightIndex((index) => Math.max(index - 1, 0));
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        pickSuggestion(highlightRef.current);
        return;
      }
      const digit = Number(event.key);
      if (digit >= 1 && digit <= 9 && digit <= items.length) {
        event.preventDefault();
        pickSuggestion(digit - 1);
      }
    };

    const onInput = (event: Event) => {
      syncValue((event.target as HTMLInputElement).value);
    };

    const onCompositionEnd = (event: Event) => {
      syncValue((event.target as HTMLInputElement).value);
    };

    node.addEventListener("keydown", onKeyDown);
    node.addEventListener("input", onInput);
    node.addEventListener("compositionend", onCompositionEnd);
    return () => {
      node.removeEventListener("keydown", onKeyDown);
      node.removeEventListener("input", onInput);
      node.removeEventListener("compositionend", onCompositionEnd);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={inputId}>{label}</Label>
        <Input
          ref={(element) => {
            localInputRef.current = element;
            assignRef(inputRef, element);
          }}
          id={inputId}
          aria-autocomplete="list"
          aria-controls="hanja-autocomplete-listbox"
          aria-expanded={filtered.length > 0}
          aria-activedescendant={
            filtered[clampedHighlight]
              ? `hanja-autocomplete-option-${filtered[clampedHighlight]}`
              : undefined
          }
          defaultValue=""
          placeholder="김태희 → 金泰熙 (한 글자씩 한자 변환)"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        목표: <span className="font-mono">{HANJA_NAME_TARGET}</span>
        {" · "}
        combobox 선택:{" "}
        <span role="status" aria-label="combobox 선택 횟수">
          {pickCount}
        </span>
        {lastPicked !== null ? (
          <>
            {" · "}
            마지막 선택:{" "}
            <span role="status" aria-label="마지막 combobox 선택" className="font-mono">
              {lastPicked}
            </span>
          </>
        ) : null}
      </p>

      <ul
        id="hanja-autocomplete-listbox"
        role="listbox"
        aria-label="이름 제안"
        className="rounded-lg border border-border bg-muted/20 p-1"
      >
        {filtered.map((item, index) => (
          <li key={item} role="presentation">
            <button
              id={`hanja-autocomplete-option-${item}`}
              type="button"
              role="option"
              aria-selected={index === clampedHighlight}
              tabIndex={-1}
              className={cn(
                "flex w-full rounded-md px-2.5 py-1.5 text-left text-sm outline-none",
                index === clampedHighlight && "bg-muted/80",
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                const node = localInputRef.current;
                if (!node) return;
                node.value = item;
                setValue(item);
                onValueChange?.(item);
                setPickCount((count) => count + 1);
                setLastPicked(item);
                node.focus();
              }}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
