import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type DelayedControlledFieldProps = {
  /**
   * `broken` — defer setState one macrotask with a *leading* snapshot for that tick.
   * While a writeback is pending, later IME preedits advance the DOM; the stale
   * `value` prop then clobbers composition (async-batch / slow controlled-input bug).
   * `fixed` — sync setValue so React never writes an older string over IME preedit.
   */
  mode?: "broken" | "fixed";
  /** Extra delay (ms) for broken mode; default 0 (macrotask). */
  delayMs?: number;
  label?: string;
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

export function DelayedControlledField({
  mode = "broken",
  delayMs = 0,
  label = "이름",
  inputRef,
  onValueChange,
}: DelayedControlledFieldProps) {
  const [value, setValue] = useState("");
  const localInputRef = useRef<HTMLInputElement>(null);
  /** True while a deferred writeback is scheduled (broken mode). */
  const writebackPendingRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const inputId = "ime-delayed-controlled-input";

  useEffect(() => {
    const node = localInputRef.current;
    if (!node) return;

    const apply = (next: string) => {
      setValue(next);
      onValueChange?.(next);
    };

    const onInput = () => {
      const next = node.value;

      if (mode === "fixed") {
        for (const id of timersRef.current) clearTimeout(id);
        timersRef.current = [];
        writebackPendingRef.current = false;
        apply(next);
        return;
      }

      // broken: one deferred write per tick, capturing the *first* value in that window.
      // Later preedits must not cancel that timer — otherwise there is no stale race.
      if (writebackPendingRef.current) {
        return;
      }
      writebackPendingRef.current = true;
      const leadingSnapshot = next;
      const id = setTimeout(() => {
        writebackPendingRef.current = false;
        timersRef.current = timersRef.current.filter((t) => t !== id);
        // flushSync: stale `value` must hit the DOM before the next IME preedit
        // (plain setState commits too late for the race to show in the same tick).
        flushSync(() => {
          apply(leadingSnapshot);
        });
      }, delayMs);
      timersRef.current.push(id);
    };

    const onCompositionEnd = () => {
      for (const id of timersRef.current) clearTimeout(id);
      timersRef.current = [];
      writebackPendingRef.current = false;
      apply(node.value);
    };

    node.addEventListener("input", onInput);
    node.addEventListener("compositionend", onCompositionEnd);
    return () => {
      node.removeEventListener("input", onInput);
      node.removeEventListener("compositionend", onCompositionEnd);
      for (const id of timersRef.current) clearTimeout(id);
      timersRef.current = [];
    };
  }, [mode, delayMs, onValueChange]);

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
          value={value}
          onChange={(event) => {
            if (mode === "fixed") {
              setValue(event.target.value);
              onValueChange?.(event.target.value);
            }
          }}
          placeholder="한글을 빠르게 입력"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        React state:{" "}
        <span role="status" aria-label="React state 값" className="font-mono">
          {value || "(empty)"}
        </span>
        {" · "}
        mode: <code className="rounded bg-muted px-1">{mode}</code>
        {mode === "broken" ? ` · delay ${delayMs}ms` : null}
      </p>
    </div>
  );
}
