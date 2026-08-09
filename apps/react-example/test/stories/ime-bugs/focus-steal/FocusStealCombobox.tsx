import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { assignRef } from "../shared/assignRef";

const DEFAULT_SUGGESTIONS = ["김태희", "김철수", "이영희", "박민수", "최수연", "apple"];

export type FocusStealComboboxProps = {
  /**
   * `broken` — after every `input`, briefly focus the first option then return to the input
   * (aborts Hangul composition on blur; Latin is unaffected).
   * `fixed` — never move DOM focus; highlight via aria-selected / aria-activedescendant only.
   * (Bouncing on `compositionend` still breaks Hangul because syllable boundaries fire end.)
   */
  mode?: "broken" | "fixed";
  suggestions?: string[];
  label?: string;
  /** Forwarded to the search input for IME logging / tests */
  inputRef?: React.Ref<HTMLInputElement>;
  onValueChange?: (value: string) => void;
};

export function FocusStealCombobox({
  mode = "broken",
  suggestions = DEFAULT_SUGGESTIONS,
  label = "검색",
  inputRef,
  onValueChange,
}: FocusStealComboboxProps) {
  const [value, setValue] = useState("");
  const firstOptionRef = useRef<HTMLButtonElement>(null);
  const localInputRef = useRef<HTMLInputElement>(null);
  const modeRef = useRef(mode);
  const onValueChangeRef = useRef(onValueChange);
  const inputId = "focus-steal-combobox-input";

  useEffect(() => {
    modeRef.current = mode;
    onValueChangeRef.current = onValueChange;
  });

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 5);
    const matched = suggestions.filter((item) => item.toLowerCase().includes(q));
    // Keep a highlight target even when the query is mid-composition jamo with no match yet.
    return (matched.length > 0 ? matched : suggestions).slice(0, 5);
  }, [suggestions, value]);

  const activeOption = filtered[0];

  useEffect(() => {
    const node = localInputRef.current;
    if (!node) return;

    const bounceFocusThroughFirstOption = () => {
      const option = firstOptionRef.current;
      const input = localInputRef.current;
      if (!option || !input) return;
      option.focus();
      input.focus();
    };

    const syncValue = (next: string) => {
      setValue(next);
      onValueChangeRef.current?.(next);
    };

    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const next = target.value;
      syncValue(next);

      if (modeRef.current === "broken") {
        queueMicrotask(bounceFocusThroughFirstOption);
      }
      // fixed: never DOM-focus options — virtual highlight via aria-selected only
    };

    const onCompositionEnd = (event: Event) => {
      const target = event.target as HTMLInputElement;
      syncValue(target.value);
      // Do NOT bounce on compositionend — Hangul fires this at every syllable boundary.
    };

    node.addEventListener("input", onInput);
    node.addEventListener("compositionend", onCompositionEnd);
    return () => {
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
          aria-controls="focus-steal-combobox-listbox"
          aria-expanded={filtered.length > 0}
          aria-activedescendant={
            mode === "fixed" && activeOption ? `focus-steal-option-${activeOption}` : undefined
          }
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            setValue(next);
            onValueChange?.(next);
          }}
          placeholder="검색어 입력"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      <ul
        id="focus-steal-combobox-listbox"
        role="listbox"
        aria-label="검색 제안"
        className="rounded-lg border border-border bg-muted/20 p-1"
      >
        {filtered.map((item, index) => (
          <li key={item} role="presentation">
            <button
              ref={index === 0 ? firstOptionRef : undefined}
              id={`focus-steal-option-${item}`}
              type="button"
              role="option"
              aria-selected={index === 0}
              tabIndex={mode === "fixed" ? -1 : 0}
              className={cn(
                "flex w-full rounded-md px-2.5 py-1.5 text-left text-sm outline-none",
                "hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                index === 0 && "bg-muted/80",
              )}
              onClick={() => {
                setValue(item);
                onValueChange?.(item);
                localInputRef.current?.focus();
              }}
            >
              {item}
            </button>
          </li>
        ))}
        {filtered.length === 0 ? (
          <li className="px-2.5 py-1.5 text-sm text-muted-foreground" role="presentation">
            제안 없음
          </li>
        ) : null}
      </ul>
    </div>
  );
}
