import { useMemo, useState, type MutableRefObject } from "react";
import { createEditor, type Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";

import "./slate-custom-types";

import { ImeCaptureShell } from "../../ime-logger/ImeCaptureShell";
import { CaptureInstructions } from "../shared/imeBugLoggerChrome";
import { CaptureTargetToolbar, type SlateCaptureTarget } from "./CaptureTargetToolbar";
import {
  createSlateCompositionDebugLog,
  type SlateCompositionDebugLog,
} from "./slateCompositionDebugLog";
import { clearSlateFixDebugState } from "./slateFixDebugState";

const EMPTY_VALUE: Descendant[] = [{ type: "paragraph", children: [{ text: "" }] }];
const PLACEHOLDER_TEXT = "여기에 입력…";

const SCENARIO_IDS: Record<SlateCaptureTarget, string> = {
  "slate-placeholder": "slate-ac-first-hangul-placeholder",
  "plain-control": "slate-ac-plain-control",
};

export type SlateLoggerProps = {
  captureTarget?: SlateCaptureTarget;
  editorRef?: MutableRefObject<HTMLElement | null>;
  debugLog?: SlateCompositionDebugLog;
  captureSlateDebug?: boolean;
};

export function SlateLogger({
  captureTarget: captureTargetProp,
  editorRef,
  debugLog: debugLogProp,
  captureSlateDebug = true,
}: SlateLoggerProps = {}) {
  const [captureTarget, setCaptureTarget] = useState<SlateCaptureTarget>("slate-placeholder");
  const effectiveTarget = captureTargetProp ?? captureTarget;
  const [, setValue] = useState<Descendant[]>(EMPTY_VALUE);
  const [slateEditable, setSlateEditable] = useState<HTMLElement | null>(null);
  const editor = useMemo(() => withReact(createEditor()), [effectiveTarget]);

  const slateDebugEnabled = effectiveTarget === "slate-placeholder" && captureSlateDebug;
  const internalDebugLog = useMemo(
    () => (slateDebugEnabled ? createSlateCompositionDebugLog() : null),
    [slateDebugEnabled, effectiveTarget],
  );
  const debugLog = debugLogProp ?? internalDebugLog;

  return (
    <ImeCaptureShell
      title="Slate placeholder Hangul first syllable"
      description="Android Slate #5989 — upstream capture + slateDebug.final. Exploration: docs/research/slate-placeholder-exploration-hypotheses.md"
      scenarioId={SCENARIO_IDS[effectiveTarget]}
      listenerDeps={[effectiveTarget]}
      traceExtra={
        debugLog
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
        clearSlateFixDebugState(editor);
        debugLog?.clear();
      }}
      beforeField={() => (
        <CaptureInstructions
          footer={
            captureTargetProp === undefined ? (
              <div className="mt-3">
                <CaptureTargetToolbar target={captureTarget} onTargetChange={setCaptureTarget} />
              </div>
            ) : null
          }
        >
          <li>
            Upstream Slate + official <code>placeholder</code> — capture only, no app patches.
          </li>
          <li>
            Next: exploration hypotheses in{" "}
            <code>docs/research/slate-placeholder-exploration-hypotheses.md</code>
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
          <Slate editor={editor} initialValue={EMPTY_VALUE} onValueChange={setValue}>
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
          </Slate>
        )
      }
    </ImeCaptureShell>
  );
}
