import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const DEFAULT_SUGGESTIONS = ["김태희", "김철수", "이영희", "박민수", "최수연", "apple"];

export type FocusStealComboboxProps = {
  /**
   * `broken` — focus first option after every `input` (aborts Hangul composition).
   * `fixed` — only steal focus when not composing.
   */
  mode?: "broken" | "fixed";
  suggestions?: string[];
  label?: string;
  /** Forwarded to the search input for IME logging / tests */
  inputRef?: React.Ref<HTMLInputElement>;
  onValueChange?: (value: string) => void;
};

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  (ref as React.MutableRefObject<T | null>).current = value;
}

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

  modeRef.current = mode;
  onValueChangeRef.current = onValueChange;

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 5);
    const matched = suggestions.filter((item) => item.toLowerCase().includes(q));
    // Keep a focus target even when the query is mid-composition jamo (ㄱ) with no match yet.
    return (matched.length > 0 ? matched : suggestions).slice(0, 5);
  }, [suggestions, value]);

  useEffect(() => {
    const node = localInputRef.current;
    if (!node) return;

    const stealFocusToFirstOption = () => {
      firstOptionRef.current?.focus();
    };

    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const next = target.value;
      setValue(next);
      onValueChangeRef.current?.(next);

      const composing = (event as InputEvent).isComposing === true;

      if (modeRef.current === "broken") {
        queueMicrotask(stealFocusToFirstOption);
        return;
      }

      if (!composing) {
        queueMicrotask(stealFocusToFirstOption);
      }
    };

    const onCompositionEnd = () => {
      if (modeRef.current === "fixed" && localInputRef.current?.value.trim()) {
        queueMicrotask(stealFocusToFirstOption);
      }
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
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            onValueChange?.(event.target.value);
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
              type="button"
              role="option"
              aria-selected={index === 0}
              className={cn(
                "flex w-full rounded-md px-2.5 py-1.5 text-left text-sm outline-none",
                "hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
              )}
              onClick={() => {
                setValue(item);
                onValueChange?.(item);
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
