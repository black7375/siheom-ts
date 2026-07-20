import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type SearchFieldProps = {
  /**
   * `broken` — submit on Enter when `!event.isComposing` (Safari confirm-Enter bug).
   * `fixed` — also ignore keyCode 229 and Enter right after compositionend.
   */
  mode?: "broken" | "fixed";
  label?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  onSubmit?: (query: string) => void;
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

export function SearchField({
  mode = "broken",
  label = "검색",
  inputRef,
  onSubmit,
  onValueChange,
}: SearchFieldProps) {
  const [value, setValue] = useState("");
  const [submitCount, setSubmitCount] = useState(0);
  const [lastSubmitted, setLastSubmitted] = useState<string | null>(null);
  const localInputRef = useRef<HTMLInputElement>(null);
  const justEndedCompositionRef = useRef(false);
  const inputId = "ime-enter-submit-search";

  useEffect(() => {
    const node = localInputRef.current;
    if (!node) return;

    const syncValue = () => {
      setValue(node.value);
      onValueChange?.(node.value);
    };

    const submit = () => {
      const query = node.value;
      setSubmitCount((count) => count + 1);
      setLastSubmitted(query);
      onSubmit?.(query);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.keyCode !== 13 && event.keyCode !== 229) {
        return;
      }

      const isEnterLike =
        event.key === "Enter" || event.keyCode === 13 || event.keyCode === 229;

      if (!isEnterLike) return;

      if (mode === "broken") {
        // Classic bug: treat any non-composing Enter as submit (Safari confirm looks like this)
        if (event.key === "Enter" && !event.isComposing) {
          event.preventDefault();
          submit();
        }
        return;
      }

      // fixed: MDN-style guard + Safari post-compositionend Enter
      if (event.isComposing || event.keyCode === 229 || justEndedCompositionRef.current) {
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        submit();
      }
    };

    const onCompositionEnd = () => {
      syncValue();
      justEndedCompositionRef.current = true;
      // Safari fires confirm Enter after compositionend in the same turn / soon after
      queueMicrotask(() => {
        justEndedCompositionRef.current = false;
      });
    };

    node.addEventListener("input", syncValue);
    node.addEventListener("keydown", onKeyDown);
    node.addEventListener("compositionend", onCompositionEnd);
    return () => {
      node.removeEventListener("input", syncValue);
      node.removeEventListener("keydown", onKeyDown);
      node.removeEventListener("compositionend", onCompositionEnd);
    };
  }, [mode, onSubmit, onValueChange]);

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
          type="search"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            onValueChange?.(event.target.value);
          }}
          placeholder="검색어 입력 후 Enter"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        submit 횟수:{" "}
        <span role="status" aria-label="submit 횟수">
          {submitCount}
        </span>
        {lastSubmitted !== null ? (
          <>
            {" · "}
            마지막 검색:{" "}
            <span role="status" aria-label="마지막 검색어" className="font-mono">
              {lastSubmitted || "(빈 문자열)"}
            </span>
          </>
        ) : null}
      </p>
    </div>
  );
}
