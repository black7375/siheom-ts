import { useMemo, useState, type MutableRefObject } from "react";
import { createEditor, type Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";

import "./slate-custom-types";

import { ImeCaptureShell } from "../../ime-logger/ImeCaptureShell";
import { CaptureInstructions, ModeToolbar } from "../shared/imeBugLoggerChrome";
import { CaptureTargetToolbar, type SlateCaptureTarget } from "./CaptureTargetToolbar";
import { SlateCompositionDebugPlugin } from "./SlateCompositionDebugPlugin";
import type { SlateCompositionDebugLog } from "./slateCompositionDebugLog";
import { useSlatePlaceholderCompositionFixEditableProps } from "./useSlatePlaceholderCompositionFixEditableProps";

const EMPTY_VALUE: Descendant[] = [{ type: "paragraph", children: [{ text: "" }] }];
const PLACEHOLDER_TEXT = "여기에 입력…";

const SCENARIO_IDS: Record<SlateCaptureTarget, string> = {
  "slate-placeholder": "slate-ac-first-hangul-placeholder",
  "plain-control": "slate-ac-plain-control",
};

export type SlateLoggerMode = "broken" | "fixed";

export type SlateLoggerProps = {
  /**
   * broken = upstream Slate (official placeholder).
   * fixed = reserved for mechanism patches that **keep** official placeholder
   * (decorative overlay was rejected — see DEBUG.md / research doc).
   */
  mode?: SlateLoggerMode;
  captureTarget?: SlateCaptureTarget;
  editorRef?: MutableRefObject<HTMLElement | null>;
  debugLog?: SlateCompositionDebugLog;
};

export function SlateLogger({
  mode: modeProp,
  captureTarget: captureTargetProp,
  editorRef,
  debugLog,
}: SlateLoggerProps = {}) {
  const [mode, setMode] = useState<SlateLoggerMode>(modeProp ?? "broken");
  const effectiveMode = modeProp ?? mode;
  const [captureTarget, setCaptureTarget] = useState<SlateCaptureTarget>("slate-placeholder");
  const effectiveTarget = captureTargetProp ?? captureTarget;
  const [, setValue] = useState<Descendant[]>(EMPTY_VALUE);
  const [slateEditable, setSlateEditable] = useState<HTMLElement | null>(null);
  const editor = useMemo(() => withReact(createEditor()), [effectiveTarget, effectiveMode]);
  const useFix =
    effectiveTarget === "slate-placeholder" && effectiveMode === "fixed";
  const fixEditableProps = useSlatePlaceholderCompositionFixEditableProps(
    useFix ? editor : undefined,
    slateEditable,
  );

  return (
    <ImeCaptureShell
      title="Slate placeholder Hangul first syllable"
      description="Android에서 Slate 공식 placeholder + 한글 조합(#5989)을 재현·캡처합니다. fixed는 placeholder를 유지한 채 메커니즘 패치를 시험합니다."
      scenarioId={
        effectiveTarget === "plain-control"
          ? SCENARIO_IDS["plain-control"]
          : effectiveMode === "fixed"
            ? "slate-ac-first-hangul-placeholder-fixed"
            : SCENARIO_IDS["slate-placeholder"]
      }
      listenerDeps={[effectiveTarget, effectiveMode]}
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
            <strong>Slate + 공식 placeholder</strong>: 빈 편집기에서 「가」/「가나다」. broken =
            upstream. fixed = placeholder API를 유지한 실험 패치(우회 제거).
          </li>
          <li>
            <strong>plain control</strong>: plain textarea baseline.
          </li>
          <li>
            장식 placeholder / 사후 rewrite는 기각·폭발로 기각 (DEBUG.md, research doc).
          </li>
          <li>Clear → 포커스 → 조합 → JSON 저장.</li>
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
            key={`${effectiveTarget}-${effectiveMode}`}
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
              placeholder={PLACEHOLDER_TEXT}
              {...fixEditableProps}
            />
            {debugLog ? (
              <SlateCompositionDebugPlugin
                log={debugLog}
                editable={slateEditable}
                label={effectiveMode}
              />
            ) : null}
          </Slate>
        )
      }
    </ImeCaptureShell>
  );
}
