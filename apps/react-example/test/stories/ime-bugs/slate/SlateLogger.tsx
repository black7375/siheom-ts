import { useMemo, useState, type MutableRefObject } from "react";
import { createEditor, type Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";

import "./slate-custom-types";

import { ImeCaptureShell } from "../../ime-logger/ImeCaptureShell";
import { CaptureInstructions, ModeToolbar } from "../shared/imeBugLoggerChrome";
import { CaptureTargetToolbar, type SlateCaptureTarget } from "./CaptureTargetToolbar";
import {
  createSlateCompositionDebugLog,
  type SlateCompositionDebugLog,
} from "./slateCompositionDebugLog";
import {
  clearSlatePlaceholderCompositionFixDebug,
  useSlatePlaceholderCompositionFixEditableProps,
} from "./useSlatePlaceholderCompositionFixEditableProps";

const EMPTY_VALUE: Descendant[] = [{ type: "paragraph", children: [{ text: "" }] }];
const PLACEHOLDER_TEXT = "여기에 입력…";

const SCENARIO_IDS: Record<SlateCaptureTarget, string> = {
  "slate-placeholder": "slate-ac-first-hangul-placeholder",
  "plain-control": "slate-ac-plain-control",
};

export type SlateLoggerMode = "broken" | "fixed";

export type SlateLoggerProps = {
  mode?: SlateLoggerMode;
  captureTarget?: SlateCaptureTarget;
  editorRef?: MutableRefObject<HTMLElement | null>;
  /** Override auto device debug log (slate-placeholder only). */
  debugLog?: SlateCompositionDebugLog;
  /** Set false to omit slateDebug from downloaded JSON. */
  captureSlateDebug?: boolean;
};

export function SlateLogger({
  mode: modeProp,
  captureTarget: captureTargetProp,
  editorRef,
  debugLog: debugLogProp,
  captureSlateDebug = true,
}: SlateLoggerProps = {}) {
  const [mode, setMode] = useState<SlateLoggerMode>(modeProp ?? "broken");
  const effectiveMode = modeProp ?? mode;
  const [captureTarget, setCaptureTarget] = useState<SlateCaptureTarget>("slate-placeholder");
  const effectiveTarget = captureTargetProp ?? captureTarget;
  const [, setValue] = useState<Descendant[]>(EMPTY_VALUE);
  const [slateEditable, setSlateEditable] = useState<HTMLElement | null>(null);
  const editor = useMemo(() => withReact(createEditor()), [effectiveTarget, effectiveMode]);

  const slateDebugEnabled = effectiveTarget === "slate-placeholder" && captureSlateDebug;
  const internalDebugLog = useMemo(
    () => (slateDebugEnabled ? createSlateCompositionDebugLog() : null),
    [slateDebugEnabled, effectiveTarget, effectiveMode],
  );
  const debugLog = debugLogProp ?? internalDebugLog;

  const useFix = effectiveTarget === "slate-placeholder" && effectiveMode === "fixed";
  const fixEditableProps = useSlatePlaceholderCompositionFixEditableProps({
    editor: useFix ? editor : undefined,
    editable: slateEditable,
    debugLog: useFix ? (debugLog ?? undefined) : undefined,
    debugLabel: effectiveMode,
  });

  return (
    <ImeCaptureShell
      title="Slate placeholder Hangul first syllable"
      description="Android에서 Slate 공식 placeholder + 한글 조합(#5989)을 재현·캡처합니다. JSON: events(DOM) + slateDebug.fixTrace(fixed 패치만)."
      scenarioId={
        effectiveTarget === "plain-control"
          ? SCENARIO_IDS["plain-control"]
          : effectiveMode === "fixed"
            ? "slate-ac-first-hangul-placeholder-fixed"
            : SCENARIO_IDS["slate-placeholder"]
      }
      listenerDeps={[effectiveTarget, effectiveMode]}
      traceExtra={
        slateDebugEnabled && debugLog
          ? ({ events }) => ({
              slateDebug: debugLog.toExport(editor, {
                editable: slateEditable,
                imeEventCount: events.length,
              }),
            })
          : undefined
      }
      clearField={(node: HTMLElement | null) => {
        if (node instanceof HTMLTextAreaElement) {
          node.value = "";
          return;
        }
        if (node?.isContentEditable) {
          node.textContent = "";
        }
        clearSlatePlaceholderCompositionFixDebug(editor);
        debugLog?.clear();
      }}
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
            <strong>Slate + 공식 placeholder</strong>: 「가」/「가나다」. broken = upstream. fixed =
            mechanism patch.
          </li>
          <li>
            <strong>JSON</strong>: <code>events</code>(DOM) + <code>slateDebug.fixTrace</code>
            (fixed 패치만) + <code>slateDebug.final</code>(다운로드 시점).
          </li>
          <li>Clear → 포커스 → 조합 → JSON 저장 ( MTP / Download ).</li>
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
          </Slate>
        )
      }
    </ImeCaptureShell>
  );
}
