import { useEffect, useRef, useState } from "react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { assignRef } from "../shared/assignRef";

export type ChatMessageFieldProps = {
  /**
   * `broken` — send on Enter when `!event.isComposing` (classic chat IME bug).
   * `fixed` — ignore composing / 229, and swallow the first Enter after compositionend.
   *
   * Conversion-type IME (Pinyin / Japanese / Hanja) uses Enter to confirm a candidate
   * or commit raw preedit without selecting — same key conflict as Hangul composition.
   */
  mode?: "broken" | "fixed";
  label?: string;
  inputRef?: React.Ref<HTMLTextAreaElement>;
  onSend?: (message: string) => void;
  onValueChange?: (value: string) => void;
};

export function ChatMessageField({
  mode = "broken",
  label = "메시지",
  inputRef,
  onSend,
  onValueChange,
}: ChatMessageFieldProps) {
  const [value, setValue] = useState("");
  const [sendCount, setSendCount] = useState(0);
  const [lastSent, setLastSent] = useState<string | null>(null);
  const localInputRef = useRef<HTMLTextAreaElement>(null);
  const ignoreNextEnterRef = useRef(false);
  const inputId = "ime-candidate-conversion-chat";

  useEffect(() => {
    const node = localInputRef.current;
    if (!node) return;

    const syncValue = () => {
      setValue(node.value);
      onValueChange?.(node.value);
    };

    const send = () => {
      const message = node.value;
      setSendCount((count) => count + 1);
      setLastSent(message);
      onSend?.(message);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (mode === "broken") {
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
          event.preventDefault();
          send();
        }
        return;
      }

      if (event.isComposing || event.keyCode === 229) {
        return;
      }
      if (event.key === "Enter" && !event.shiftKey) {
        if (ignoreNextEnterRef.current) {
          ignoreNextEnterRef.current = false;
          event.preventDefault();
          return;
        }
        event.preventDefault();
        send();
      }
    };

    const onCompositionEnd = () => {
      syncValue();
      ignoreNextEnterRef.current = true;
    };

    node.addEventListener("input", syncValue);
    node.addEventListener("keydown", onKeyDown);
    node.addEventListener("compositionend", onCompositionEnd);
    return () => {
      node.removeEventListener("input", syncValue);
      node.removeEventListener("keydown", onKeyDown);
      node.removeEventListener("compositionend", onCompositionEnd);
    };
  }, [mode, onSend, onValueChange]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={inputId}>{label}</Label>
        <Textarea
          ref={(element) => {
            localInputRef.current = element;
            assignRef(inputRef, element);
          }}
          id={inputId}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            onValueChange?.(event.target.value);
          }}
          placeholder="메시지 입력 후 Enter로 전송"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          rows={3}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        send 횟수:{" "}
        <span role="status" aria-label="send 횟수">
          {sendCount}
        </span>
        {lastSent !== null ? (
          <>
            {" · "}
            마지막 전송:{" "}
            <span role="status" aria-label="마지막 전송 메시지" className="font-mono">
              {lastSent || "(빈 문자열)"}
            </span>
          </>
        ) : null}
      </p>
    </div>
  );
}
