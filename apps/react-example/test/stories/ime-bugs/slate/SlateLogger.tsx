import { useMemo, useState, type MutableRefObject } from "react";
import { createEditor, Node, type Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";

import "./slate-custom-types";

import { ImeCaptureShell } from "../../ime-logger/ImeCaptureShell";
import { CaptureInstructions, ModeToolbar } from "../shared/imeBugLoggerChrome";
import { CaptureTargetToolbar, type SlateCaptureTarget } from "./CaptureTargetToolbar";
import { SlateCompositionDebugPlugin } from "./SlateCompositionDebugPlugin";
import { SlateDecorativePlaceholder } from "./SlateDecorativePlaceholder";
import type { SlateCompositionDebugLog } from "./slateCompositionDebugLog";

const EMPTY_VALUE: Descendant[] = [{ type: "paragraph", children: [{ text: "" }] }];
const PLACEHOLDER_TEXT = "여기에 입력…";

const SCENARIO_IDS: Record<SlateCaptureTarget, string> = {
  "slate-placeholder": "slate-ac-first-hangul-placeholder",
  "plain-control": "slate-ac-plain-control",
};

export type SlateLoggerMode = "broken" | "fixed";

export type SlateLoggerProps = {
  /** broken = Slate built-in placeholder leaf; fixed = decorative overlay (#5989). */
  mode?: SlateLoggerMode;
  /** Lock capture target (tests). Omit to show on-screen toggle. */
  captureTarget?: SlateCaptureTarget;
  /** Optional: receive mounted field (tests). */
  editorRef?: MutableRefObject<HTMLElement | null>;
  /** Optional: record DOM flow (tests / Storybook debugging). */
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
  const [value, setValue] = useState<Descendant[]>(EMPTY_VALUE);
  const [slateEditable, setSlateEditable] = useState<HTMLElement | null>(null);
  const editor = useMemo(() => withReact(createEditor()), [effectiveTarget, effectiveMode]);
  const docEmpty = value.map((node) => Node.string(node)).join("") === "";

  const useDecorativePlaceholder = effectiveMode === "fixed";

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
            <strong>Slate + placeholder</strong>: Android + Gboard → 빈 편집기에서 「가」/「가나다」.
            broken은 Slate 내장 placeholder leaf(#5989). fixed는 contenteditable 밖 장식 placeholder.
          </li>
          <li>
            <strong>plain control</strong>: 같은 기기에서 plain textarea로 「가」 — 정상 조합 baseline.
          </li>
          <li>
            사후 text rewrite는 IME와 싸워 깜빡임이 나서 쓰지 않습니다 (DEBUG.md).
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
            key={`${effectiveTarget}-${effectiveMode}`}
            editor={editor}
            initialValue={EMPTY_VALUE}
            onValueChange={setValue}
          >
            {useDecorativePlaceholder ? (
              <SlateDecorativePlaceholder text={PLACEHOLDER_TEXT} empty={docEmpty}>
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
                />
              </SlateDecorativePlaceholder>
            ) : (
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
              />
            )}
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
