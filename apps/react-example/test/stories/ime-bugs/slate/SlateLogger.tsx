import { useMemo, useState, type MutableRefObject } from "react";
import { createEditor, type Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";

import "./slate-custom-types";

import { ImeCaptureShell } from "../../ime-logger/ImeCaptureShell";
import { CaptureInstructions } from "../shared/imeBugLoggerChrome";
import { CaptureTargetToolbar, type SlateCaptureTarget } from "./CaptureTargetToolbar";
import { SlateFixModeToolbar } from "./SlateFixModeToolbar";
import {
  createSlateCompositionDebugLog,
  type SlateCompositionDebugLog,
} from "./slateCompositionDebugLog";
import {
  scenarioIdForFixMode,
  type SlateLoggerFixMode,
} from "./slatePlaceholderAlternatives";
import { clearSlateFixDebugState } from "./slateFixDebugState";
import { useSlatePlaceholderAlternativeEditableProps } from "./useSlatePlaceholderAlternativeEditableProps";

const EMPTY_VALUE: Descendant[] = [{ type: "paragraph", children: [{ text: "" }] }];
const PLACEHOLDER_TEXT = "여기에 입력…";

const SCENARIO_IDS: Record<SlateCaptureTarget, string> = {
  "slate-placeholder": "slate-ac-first-hangul-placeholder",
  "plain-control": "slate-ac-plain-control",
};

export type { SlateLoggerFixMode };

export type SlateLoggerProps = {
  fixMode?: SlateLoggerFixMode;
  captureTarget?: SlateCaptureTarget;
  editorRef?: MutableRefObject<HTMLElement | null>;
  debugLog?: SlateCompositionDebugLog;
  captureSlateDebug?: boolean;
};

function scenarioId(fixMode: SlateLoggerFixMode, target: SlateCaptureTarget): string {
  if (target === "plain-control") {
    return SCENARIO_IDS["plain-control"];
  }
  return scenarioIdForFixMode(fixMode);
}

export function SlateLogger({
  fixMode: fixModeProp,
  captureTarget: captureTargetProp,
  editorRef,
  debugLog: debugLogProp,
  captureSlateDebug = true,
}: SlateLoggerProps = {}) {
  const [fixMode, setFixMode] = useState<SlateLoggerFixMode>(fixModeProp ?? "broken");
  const effectiveFixMode = fixModeProp ?? fixMode;
  const [captureTarget, setCaptureTarget] = useState<SlateCaptureTarget>("slate-placeholder");
  const effectiveTarget = captureTargetProp ?? captureTarget;
  const [, setValue] = useState<Descendant[]>(EMPTY_VALUE);
  const [slateEditable, setSlateEditable] = useState<HTMLElement | null>(null);
  const editor = useMemo(
    () => withReact(createEditor()),
    [effectiveTarget, effectiveFixMode],
  );

  const slateDebugEnabled =
    effectiveTarget === "slate-placeholder" && captureSlateDebug && effectiveFixMode !== "broken";
  const internalDebugLog = useMemo(
    () => (slateDebugEnabled ? createSlateCompositionDebugLog() : null),
    [slateDebugEnabled, effectiveTarget, effectiveFixMode],
  );
  const debugLog = debugLogProp ?? internalDebugLog;

  const useAlternative =
    effectiveTarget === "slate-placeholder" && effectiveFixMode !== "broken";
  const alternativeProps = useSlatePlaceholderAlternativeEditableProps({
    editor: useAlternative ? editor : undefined,
    mode: useAlternative ? effectiveFixMode : "alt-c",
    debugLog: useAlternative ? (debugLog ?? undefined) : undefined,
    debugLabel: effectiveFixMode,
  });

  const passiveDebug =
    effectiveTarget === "slate-placeholder" && captureSlateDebug && !useAlternative;
  const passiveDebugLog = useMemo(
    () => (passiveDebug ? createSlateCompositionDebugLog() : null),
    [passiveDebug, effectiveTarget],
  );
  const exportDebugLog = debugLogProp ?? (useAlternative ? debugLog : passiveDebugLog);

  return (
    <ImeCaptureShell
      title="Slate placeholder Hangul first syllable"
      description="Android Slate #5989 — broken / alt-a / alt-b / alt-c. JSON: events + slateDebug."
      scenarioId={scenarioId(effectiveFixMode, effectiveTarget)}
      listenerDeps={[effectiveTarget, effectiveFixMode]}
      traceExtra={
        exportDebugLog
          ? ({ events }) => ({
              slateDebug: exportDebugLog.toExport(editor, {
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
        clearSlateFixDebugState(editor);
        exportDebugLog?.clear();
      }}
      beforeField={() => (
        <CaptureInstructions
          footer={
            captureTargetProp === undefined ? (
              <div className="mt-3 space-y-3">
                <CaptureTargetToolbar target={captureTarget} onTargetChange={setCaptureTarget} />
                {effectiveTarget === "slate-placeholder" && fixModeProp === undefined ? (
                  <SlateFixModeToolbar mode={fixMode} onModeChange={setFixMode} />
                ) : null}
              </div>
            ) : null
          }
        >
          <li>
            <strong>broken</strong> upstream · <strong>alt-a</strong> composition anchor ·{" "}
            <strong>alt-b</strong> force-render guard · <strong>alt-c</strong> A+B (upstream-style)
          </li>
          <li>
            Device: Clear → each mode → <code>가나다가나다</code> → JSON (scenarioId suffix).
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
            key={`${effectiveTarget}-${effectiveFixMode}`}
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
              {...alternativeProps}
            />
          </Slate>
        )
      }
    </ImeCaptureShell>
  );
}
