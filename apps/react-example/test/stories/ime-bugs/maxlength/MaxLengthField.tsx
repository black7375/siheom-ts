import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { assignRef } from "../shared/assignRef";

export type MaxLengthFieldProps = {
  /**
   * `broken` — native `maxLength` only. During IME composition the value can exceed
   * the limit (browser default); truncation may happen on blur.
   * `fixed` — clamp on every input so length never exceeds `maxLength` during composition.
   */
  mode?: "broken" | "fixed";
  maxLength?: number;
  label?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  onValueChange?: (value: string) => void;
};

function clampToMaxLength(node: HTMLInputElement) {
  const limit = node.maxLength;
  if (limit < 0 || node.value.length <= limit) return;
  node.value = node.value.slice(0, limit);
  const caret = Math.min(node.selectionStart ?? limit, limit);
  node.setSelectionRange(caret, caret);
}

export function MaxLengthField({
  mode = "broken",
  maxLength = 6,
  label = "닉네임",
  inputRef,
  onValueChange,
}: MaxLengthFieldProps) {
  const [value, setValue] = useState("");
  const localInputRef = useRef<HTMLInputElement>(null);
  const inputId = "ime-maxlength-field";

  useEffect(() => {
    const node = localInputRef.current;
    if (!node) return;

    const syncValue = () => {
      if (mode === "fixed") {
        clampToMaxLength(node);
      }
      setValue(node.value);
      onValueChange?.(node.value);
    };

    node.addEventListener("input", syncValue);
    node.addEventListener("compositionend", syncValue);
    return () => {
      node.removeEventListener("input", syncValue);
      node.removeEventListener("compositionend", syncValue);
    };
  }, [mode, onValueChange]);

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
          type="text"
          value={value}
          maxLength={maxLength}
          onChange={(event) => {
            const node = event.target;
            if (mode === "fixed") {
              clampToMaxLength(node);
            }
            setValue(node.value);
            onValueChange?.(node.value);
          }}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        글자 수:{" "}
        <span role="status" aria-label="글자 수">
          {value.length}
        </span>
        {" / "}
        <span aria-label="최대 글자 수">{maxLength}</span>
      </p>
    </div>
  );
}
