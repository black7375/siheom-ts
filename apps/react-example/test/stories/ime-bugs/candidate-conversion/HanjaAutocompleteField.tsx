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
   * Syncs React state on every `input` (re-renders during composition can disturb Hanja replacement).
   * `fixed` — defer combobox keys while composing / 229 / Option; sync React state only between
   * composition sessions so macOS Hanja conversion can replace the syllable instead of appending.
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
  /** Committed string for combobox filtering — lags DOM during IME in fixed mode. */
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [pickCount, setPickCount] = useState(0);
  const [lastPicked, setLastPicked] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const localInputRef = useRef<HTMLInputElement>(null);
  const modeRef = useRef(mode);
  const isComposingRef = useRef(false);
  const onValueChangeRef = useRef(onValueChange);
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
  isComposingRef.current = isComposing;
  onValueChangeRef.current = onValueChange;
  filteredRef.current = filtered;
  highlightRef.current = clampedHighlight;

  useEffect(() => {
    if (mode === "fixed" && isComposing) return;
    setHighlightIndex(0);
  }, [filtered.length, query, mode, isComposing]);

  useEffect(() => {
    const node = localInputRef.current;
    if (!node) return;

    const syncCommitted = (next: string) => {
      setQuery(next);
      onValueChangeRef.current?.(next);
    };

    const pickSuggestion = (index: number) => {
      const item = filteredRef.current[index];
      if (!item) return;
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
      setIsComposing(true);
    };

    const onCompositionEnd = (event: Event) => {
      isComposingRef.current = false;
      setIsComposing(false);
      syncCommitted((event.target as HTMLInputElement).value);
    };

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
      const next = (event.target as HTMLInputElement).value;
      if (modeRef.current === "fixed" && isComposingRef.current) {
        return;
      }
      syncCommitted(next);
    };

    node.addEventListener("compositionstart", onCompositionStart);
    node.addEventListener("compositionend", onCompositionEnd);
    node.addEventListener("keydown", onKeyDown);
    node.addEventListener("input", onInput);
    return () => {
      node.removeEventListener("compositionstart", onCompositionStart);
      node.removeEventListener("compositionend", onCompositionEnd);
      node.removeEventListener("keydown", onKeyDown);
      node.removeEventListener("input", onInput);
    };
  }, []);

  const showComboboxHighlight = mode === "broken" || !isComposing;

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
          aria-expanded={filtered.length > 0 && showComboboxHighlight}
          aria-activedescendant={
            showComboboxHighlight && filtered[clampedHighlight]
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
        {mode === "fixed" && isComposing ? (
          <>
            {" · "}
            <span className="text-xs">조합 중 — query/combobox 키 보류</span>
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
              aria-selected={showComboboxHighlight && index === clampedHighlight}
              tabIndex={-1}
              className={cn(
                "flex w-full rounded-md px-2.5 py-1.5 text-left text-sm outline-none",
                showComboboxHighlight && index === clampedHighlight && "bg-muted/80",
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (mode === "fixed" && isComposingRef.current) return;
                const node = localInputRef.current;
                if (!node) return;
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
