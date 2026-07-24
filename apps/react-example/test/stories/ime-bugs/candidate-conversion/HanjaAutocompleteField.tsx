import { useEffect, useMemo, useRef, useState } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { assignRef } from "../shared/assignRef";

/** Hangul + Hanja name suggestions — combobox competes with IME candidate keys. */
const DEFAULT_SUGGESTIONS = ["김태희", "김철수", "金泰熙", "金秀賢", "이영희"];

export const HANJA_NAME_TARGET = "金泰熙";

const HANGUL_SYLLABLE = /^[\uAC00-\uD7A3]+$/;
const HANJA = /^[\u4E00-\u9FFF]+$/;

/**
 * macOS Chrome Hanja conversion commits Hangul then starts a new composition that
 * *appends* Hanja (김 → 김金) because Chromium ignores IME replacementRange.
 * Strip the just-committed Hangul that sits immediately before the Hanja.
 */
export function stripHangulBeforeHanja(
  value: string,
  lastHangul: string,
  hanja: string,
): string | null {
  if (!HANGUL_SYLLABLE.test(lastHangul) || !HANJA.test(hanja)) return null;
  if (!value.endsWith(lastHangul + hanja)) return null;
  return value.slice(0, -lastHangul.length - hanja.length) + hanja;
}

export type HanjaAutocompleteFieldProps = {
  /**
   * `broken` — combobox steals Arrow/Enter/digit during IME; no Hangul-append correction.
   * `fixed` — defer combobox keys while composing, and correct macOS Chrome’s 김金 append
   * by removing the Hangul left behind when Hanja composition *commits* (compositionend only —
   * never on Option+Enter start, or the candidate window aborts).
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
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [pickCount, setPickCount] = useState(0);
  const [lastPicked, setLastPicked] = useState<string | null>(null);
  const localInputRef = useRef<HTMLInputElement>(null);
  const modeRef = useRef(mode);
  const isComposingRef = useRef(false);
  /** Last Hangul syllable committed via compositionend — candidate for Chrome append strip. */
  const lastHangulCommitRef = useRef<string | null>(null);
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

  useEffect(() => {
    modeRef.current = mode;
    onValueChangeRef.current = onValueChange;
    filteredRef.current = filtered;
    highlightRef.current = clampedHighlight;
  });

  useEffect(() => {
    setHighlightIndex(0);
  }, [filtered.length, query]);

  useEffect(() => {
    const node = localInputRef.current;
    if (!node) return;

    const syncQuery = (next: string) => {
      setQuery(next);
      onValueChangeRef.current?.(next);
    };

    /** Apply 김金 → 金 correction; returns corrected value or null if no change. */
    const tryStripAppendedHangul = (value: string, hanja: string): string | null => {
      if (modeRef.current !== "fixed") return null;
      const hangul = lastHangulCommitRef.current;
      if (!hangul) return null;
      return stripHangulBeforeHanja(value, hangul, hanja);
    };

    const pickSuggestion = (index: number) => {
      const item = filteredRef.current[index];
      if (!item) return;
      lastHangulCommitRef.current = null;
      node.value = item;
      syncQuery(item);
      setPickCount((count) => count + 1);
      setLastPicked(item);
    };

    const shouldDeferToIme = (event: KeyboardEvent) =>
      modeRef.current === "fixed" &&
      (isComposingRef.current || event.isComposing || event.keyCode === 229 || event.altKey);

    const onCompositionStart = () => {
      isComposingRef.current = true;
    };

    const onCompositionEnd = (event: CompositionEvent) => {
      isComposingRef.current = false;
      const data = event.data ?? "";
      let value = node.value;

      const stripped = tryStripAppendedHangul(value, data);
      if (stripped !== null) {
        node.value = stripped;
        value = stripped;
        lastHangulCommitRef.current = null;
      } else if (HANGUL_SYLLABLE.test(data)) {
        lastHangulCommitRef.current = data;
      } else {
        lastHangulCommitRef.current = null;
      }

      syncQuery(value);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || event.keyCode === 229) {
        isComposingRef.current = true;
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

    const onInput = (event: Event) => {
      const inputEvent = event as InputEvent;
      const composing =
        isComposingRef.current ||
        inputEvent.isComposing ||
        inputEvent.inputType === "insertCompositionText";

      if (composing) {
        isComposingRef.current = true;
        // Do NOT strip mid-composition — Option+Enter only *starts* Hanja conversion;
        // touching value here aborts the candidate window.
        return;
      }

      isComposingRef.current = false;
      syncQuery(node.value);
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={inputId}>{label}</Label>
        <input
          ref={(element) => {
            localInputRef.current = element;
            assignRef(inputRef, element);
          }}
          id={inputId}
          className={cn(
            "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base",
            "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          )}
          role="combobox"
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
                const node = localInputRef.current;
                if (!node) return;
                lastHangulCommitRef.current = null;
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
