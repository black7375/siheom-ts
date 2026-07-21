import { useMemo, useState, type MutableRefObject } from "react";
import { createEditor, type Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";

import "./slate-custom-types";

import { ImeCaptureShell } from "../../ime-logger/ImeCaptureShell";
import { CaptureInstructions } from "../shared/imeBugLoggerChrome";
import { CaptureTargetToolbar, type SlateCaptureTarget } from "./CaptureTargetToolbar";
import { SlateModeToolbar } from "./SlateModeToolbar";
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

export type SlateLoggerMode = "broken" | "minimal" | "fixed";

function scenarioIdForMode(mode: SlateLoggerMode, target: SlateCaptureTarget): string {
  if (target === "plain-control") {
    return SCENARIO_IDS["plain-control"];
  }
  if (mode === "fixed") {
    return "slate-ac-first-hangul-placeholder-fixed";
  }
  if (mode === "minimal") {
    return "slate-ac-first-hangul-placeholder-minimal";
  }
  return SCENARIO_IDS["slate-placeholder"];
}

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

  const useFix = effectiveTarget === "slate-placeholder" && effectiveMode !== "broken";
  const fixLevel = effectiveMode === "minimal" ? "minimal" : "full";
  const fixEditableProps = useSlatePlaceholderCompositionFixEditableProps({
    editor: useFix ? editor : undefined,
    editable: slateEditable,
    debugLog: useFix ? (debugLog ?? undefined) : undefined,
    debugLabel: effectiveMode,
    fixLevel: useFix ? fixLevel : undefined,
  });

  return (
    <ImeCaptureShell
      title="Slate placeholder Hangul first syllable"
      description="Android Slate #5989 — broken / minimal(guard only) / fixed(full). JSON: events + slateDebug.fixTrace."
      scenarioId={scenarioIdForMode(effectiveMode, effectiveTarget)}
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
                  <SlateModeToolbar mode={mode} onModeChange={setMode} />
                ) : null}
              </div>
            ) : null
          }
        >
          <li>
            <strong>broken</strong> — upstream. <strong>minimal</strong> — placeholder hide +
            force-render guard. <strong>fixed</strong> — + preedit drive.
          </li>
          <li>
            Device compare: Clear → 각 모드로 <code>가나다</code> → JSON 저장 (파일명에 scenarioId
            포함).
          </li>
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
