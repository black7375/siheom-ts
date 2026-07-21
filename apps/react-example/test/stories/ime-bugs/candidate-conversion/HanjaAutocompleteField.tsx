import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { assignRef } from "../shared/assignRef";

/** Hangul + Hanja name suggestions — combobox competes with IME candidate keys. */
const DEFAULT_SUGGESTIONS = ["김태희", "김철수", "金泰熙", "金秀賢", "이영희"];

export const HANJA_NAME_TARGET = "金泰熙";

export type HanjaAutocompleteFieldProps = {
  /**
   * `broken` — Arrow/Enter/number keys always move or pick combobox options (no `isComposing` guard).
   * Syncs React state on every `input` (re-renders during composition can disturb Hanja replacement).
   * `fixed` — never setState while IME is composing (detect via InputEvent.isComposing / 229 /
   * composition* — compositionstart alone is unreliable on some Apple Chrome paths). Defer
   * combobox keys the same way so macOS Hanja can replace the syllable (김→金) instead of appending.
   */
  mode?: "broken" | "fixed";
  suggestions?: string[];
  label?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  onValueChange?: (value: string) => void;
};

function isImeComposingEvent(event: Event): boolean {
  if (event.type === "compositionstart" || event.type === "compositionupdate") return true;
  if (event.type === "compositionend") return false;
  if ("isComposing" in event && (event as InputEvent | KeyboardEvent).isComposing) return true;
  if (event instanceof KeyboardEvent && event.keyCode === 229) return true;
  if (
    event instanceof InputEvent &&
    (event.inputType === "insertCompositionText" || event.inputType === "deleteCompositionText")
  ) {
    return true;
  }
  return false;
}

export function HanjaAutocompleteField({
  mode = "broken",
  suggestions = DEFAULT_SUGGESTIONS,
  label = "이름",
  inputRef,
  onValueChange,
}: HanjaAutocompleteFieldProps) {
  /** Committed string for combobox filtering — lags DOM during IME in fixed mode. */
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [pickCount, setPickCount] = useState(0);
  const [lastPicked, setLastPicked] = useState<string | null>(null);
  const localInputRef = useRef<HTMLInputElement>(null);
  const modeRef = useRef(mode);
  const isComposingRef = useRef(false);
  const onValueChangeRef = useRef(onValueChange);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputId = "hanja-autocomplete-input";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 5);
    const matched = suggestions.filter((item) => item.toLowerCase().includes(q));
    return (matched.length > 0 ? matched : suggestions).slice(0, 5);
  }, [suggestions, query]);

  const clampedHighlight = Math.min(highlightIndex, Math.max(0, filtered.length - 1));
  const filteredRef = useRef(filtered);
  const highlightRef = useRef(clampedHighlight);

  modeRef.current = mode;
  onValueChangeRef.current = onValueChange;
  filteredRef.current = filtered;
  highlightRef.current = clampedHighlight;

  useEffect(() => {
    setHighlightIndex(0);
  }, [filtered.length, query]);

  const setInputRef = useCallback(
    (element: HTMLInputElement | null) => {
      localInputRef.current = element;
      assignRef(inputRef, element);
    },
    [inputRef],
  );

  useEffect(() => {
    const node = localInputRef.current;
    if (!node) return;

    const clearSettle = () => {
      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    };

    const syncCommitted = (next: string) => {
      setQuery(next);
      onValueChangeRef.current?.(next);
    };

    /** Defer React sync so a Hangul compositionend → Hanja compositionstart pair stays silent. */
    const scheduleSettle = (next: string) => {
      clearSettle();
      settleTimerRef.current = setTimeout(() => {
        settleTimerRef.current = null;
        if (isComposingRef.current) return;
        syncCommitted(next);
      }, 0);
    };

    const pickSuggestion = (index: number) => {
      const item = filteredRef.current[index];
      if (!item) return;
      clearSettle();
      isComposingRef.current = false;
      node.value = item;
      syncCommitted(item);
      setPickCount((count) => count + 1);
      setLastPicked(item);
    };

    const shouldDeferToIme = (event: KeyboardEvent) => {
      if (modeRef.current !== "fixed") return false;
      return (
        isComposingRef.current ||
        event.isComposing ||
        event.keyCode === 229 ||
        event.altKey
      );
    };

    const onCompositionStart = () => {
      isComposingRef.current = true;
      clearSettle();
    };

    const onCompositionUpdate = () => {
      isComposingRef.current = true;
      clearSettle();
    };

    const onCompositionEnd = (event: Event) => {
      isComposingRef.current = false;
      if (modeRef.current === "fixed") {
        scheduleSettle((event.target as HTMLInputElement).value);
        return;
      }
      syncCommitted((event.target as HTMLInputElement).value);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isImeComposingEvent(event)) {
        isComposingRef.current = true;
        clearSettle();
      }
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

    const onKeyUp = (event: KeyboardEvent) => {
      if (modeRef.current !== "fixed") return;
      // Some Apple Chrome paths omit compositionend; isComposing:false ends the session.
      if (!event.isComposing && event.keyCode !== 229 && isComposingRef.current) {
        isComposingRef.current = false;
        scheduleSettle(node.value);
      }
    };

    const onBeforeInput = (event: Event) => {
      if (isImeComposingEvent(event)) {
        isComposingRef.current = true;
        clearSettle();
      }
    };

    const onInput = (event: Event) => {
      const next = (event.target as HTMLInputElement).value;
      const composing = isImeComposingEvent(event) || isComposingRef.current;

      if (composing) {
        isComposingRef.current = true;
        clearSettle();
      }

      if (modeRef.current === "fixed" && composing) {
        return;
      }

      if (modeRef.current === "fixed") {
        isComposingRef.current = false;
        scheduleSettle(next);
        return;
      }

      isComposingRef.current = false;
      syncCommitted(next);
    };

    node.addEventListener("compositionstart", onCompositionStart);
    node.addEventListener("compositionupdate", onCompositionUpdate);
    node.addEventListener("compositionend", onCompositionEnd);
    node.addEventListener("keydown", onKeyDown);
    node.addEventListener("keyup", onKeyUp);
    node.addEventListener("beforeinput", onBeforeInput);
    node.addEventListener("input", onInput);
    return () => {
      clearSettle();
      node.removeEventListener("compositionstart", onCompositionStart);
      node.removeEventListener("compositionupdate", onCompositionUpdate);
      node.removeEventListener("compositionend", onCompositionEnd);
      node.removeEventListener("keydown", onKeyDown);
      node.removeEventListener("keyup", onKeyUp);
      node.removeEventListener("beforeinput", onBeforeInput);
      node.removeEventListener("input", onInput);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={inputId}>{label}</Label>
        {/* Native input: avoid Base UI re-render side effects on IME composition range. */}
        <input
          ref={setInputRef}
          id={inputId}
          className={cn(
            "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base",
            "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          )}
          aria-autocomplete="list"
          aria-controls="hanja-autocomplete-listbox"
          aria-expanded={filtered.length > 0}
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
        combobox query:{" "}
        <span role="status" aria-label="combobox query" className="font-mono">
          {query || "(empty)"}
        </span>
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
                if (mode === "fixed" && isComposingRef.current) return;
                const node = localInputRef.current;
                if (!node) return;
                isComposingRef.current = false;
                node.value = item;
                setQuery(item);
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
