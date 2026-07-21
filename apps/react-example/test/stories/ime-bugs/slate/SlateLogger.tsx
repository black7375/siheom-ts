import { useMemo, useState, type MutableRefObject } from "react";
import { createEditor, type Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";

import "./slate-custom-types";

import { ImeCaptureShell } from "../../ime-logger/ImeCaptureShell";
import { CaptureInstructions, ModeToolbar } from "../shared/imeBugLoggerChrome";
import { CaptureTargetToolbar, type SlateCaptureTarget } from "./CaptureTargetToolbar";
import { SlatePlaceholderHangulFixPlugin } from "./SlatePlaceholderHangulFixPlugin";

const EMPTY_VALUE: Descendant[] = [{ type: "paragraph", children: [{ text: "" }] }];

const SCENARIO_IDS: Record<SlateCaptureTarget, string> = {
  "slate-placeholder": "slate-ac-first-hangul-placeholder",
  "plain-control": "slate-ac-plain-control",
};

export type SlateLoggerMode = "broken" | "fixed";

export type SlateLoggerProps = {
  /** broken = upstream Slate; fixed = #5989 placeholder Hangul correction. */
  mode?: SlateLoggerMode;
  /** Lock capture target (tests). Omit to show on-screen toggle. */
  captureTarget?: SlateCaptureTarget;
  /** Optional: receive mounted field (tests). */
  editorRef?: MutableRefObject<HTMLElement | null>;
};

export function SlateLogger({
  mode: modeProp,
  captureTarget: captureTargetProp,
  editorRef,
}: SlateLoggerProps = {}) {
  const [mode, setMode] = useState<SlateLoggerMode>(modeProp ?? "broken");
  const effectiveMode = modeProp ?? mode;
  const [captureTarget, setCaptureTarget] = useState<SlateCaptureTarget>("slate-placeholder");
  const effectiveTarget = captureTargetProp ?? captureTarget;
  const [, setValue] = useState<Descendant[]>(EMPTY_VALUE);
  const [slateEditable, setSlateEditable] = useState<HTMLElement | null>(null);
  const editor = useMemo(() => withReact(createEditor()), [effectiveTarget]);

  return (
    <ImeCaptureShell
      title="Slate placeholder Hangul first syllable"
      description="Android Chrome에서 Slate #5989(placeholder + 첫 음절 조합 깨짐)을 재현하고, plain input control과 비교 캡처합니다."
      scenarioId={
        effectiveTarget === "plain-control"
          ? SCENARIO_IDS["plain-control"]
          : effectiveMode === "fixed"
            ? "slate-ac-first-hangul-placeholder-fixed"
            : SCENARIO_IDS["slate-placeholder"]
      }
      listenerDeps={[effectiveTarget]}
      beforeField={() => (
        <CaptureInstructions
          footer={
            captureTargetProp === undefined ? (
              <div className="mt-3 space-y-3">
                <CaptureTargetToolbar target={captureTarget} onTargetChange={setCaptureTarget} />
                {effectiveTarget === "slate-placeholder" && modeProp === undefined ? (
                  <ModeToolbar mode={mode} onModeChange={setMode} />
                ) : null}
              </div>
            ) : null
          }
        >
          <li>
            <strong>Slate + placeholder</strong>: Android Chrome + Gboard → 빈 Slate 편집기(placeholder
            보임)에서 「가」 조합. #5989 재현(예: ㄱㄱㅏ). fixed는 composition data 기준 음절 보정.
          </li>
          <li>
            <strong>plain control</strong>: 같은 기기에서 plain textarea로 「가」 — 정상 조합 baseline.
          </li>
          <li>
            Slate placeholder off는 Android에서 IME 입력 자체가 막히는 별도 버그(#4693)라 control로
            쓰지 않습니다.
          </li>
          <li>캡처 대상을 바꾼 뒤 Clear → 포커스 → 조합 → JSON 저장.</li>
        </CaptureInstructions>
      )}
    >
      {({ attachInputRef }) =>
        effectiveTarget === "plain-control" ? (
          <textarea
            ref={(node) => {
              attachInputRef(node);
              if (editorRef) {
                editorRef.current = node;
              }
            }}
            className="min-h-[8rem] w-full rounded-md border border-input bg-background px-3 py-2"
            aria-label="Plain control input"
          />
        ) : (
          <Slate
            key={effectiveTarget}
            editor={editor}
            initialValue={EMPTY_VALUE}
            onValueChange={setValue}
          >
            <Editable
              ref={(node) => {
                attachInputRef(node);
                setSlateEditable(node);
                if (editorRef) {
                  editorRef.current = node;
                }
              }}
              className="min-h-[8rem] rounded-md border border-input bg-background px-3 py-2"
              aria-label="Slate editor"
              role="textbox"
              placeholder="여기에 입력…"
            />
            {effectiveMode === "fixed" ? (
              <SlatePlaceholderHangulFixPlugin enabled editable={slateEditable} />
            ) : null}
          </Slate>
        )
      }
    </ImeCaptureShell>
  );
}
