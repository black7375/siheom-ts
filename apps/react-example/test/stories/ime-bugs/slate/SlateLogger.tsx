import { useCallback, useMemo, useRef, useState, type MutableRefObject } from "react";
import { createEditor, type Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";

import "./slate-custom-types";

import { ImeCaptureShell } from "../../ime-logger/ImeCaptureShell";
import { CaptureInstructions } from "../shared/imeBugLoggerChrome";
import { CaptureTargetToolbar, type SlateCaptureTarget } from "./CaptureTargetToolbar";
import { readSlateCompositionSnapshot } from "./readSlateCompositionSnapshot";
import { createSlateExplorationLog, type SlateExplorationLog } from "./slateExplorationCapture";
import { clearSlateFixDebugState } from "./slateFixDebugState";
import { readSlatePatchProbe } from "./readSlatePatchProbe";
import { useSlateExplorationCapture } from "./useSlateExplorationCapture";

const EMPTY_VALUE: Descendant[] = [{ type: "paragraph", children: [{ text: "" }] }];
const PLACEHOLDER_TEXT = "여기에 입력…";

const SCENARIO_IDS: Record<SlateCaptureTarget, string> = {
  "slate-placeholder": "slate-ac-first-hangul-placeholder-explore",
  "plain-control": "slate-ac-plain-control",
};

export type SlateLoggerProps = {
  captureTarget?: SlateCaptureTarget;
  editorRef?: MutableRefObject<HTMLElement | null>;
  explorationLog?: SlateExplorationLog;
  captureExploration?: boolean;
};

export function SlateLogger({
  captureTarget: captureTargetProp,
  editorRef,
  explorationLog: explorationLogProp,
  captureExploration = true,
}: SlateLoggerProps = {}) {
  const [captureTarget, setCaptureTarget] = useState<SlateCaptureTarget>("slate-placeholder");
  const effectiveTarget = captureTargetProp ?? captureTarget;
  const [, setValue] = useState<Descendant[]>(EMPTY_VALUE);
  const [slateEditable, setSlateEditable] = useState<HTMLElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editor = useMemo(() => withReact(createEditor()), [effectiveTarget]);

  const exploreEnabled = effectiveTarget === "slate-placeholder" && captureExploration;
  const internalExplorationLog = useMemo(
    () => (exploreEnabled ? createSlateExplorationLog() : null),
    [exploreEnabled, effectiveTarget],
  );
  const explorationLog = explorationLogProp ?? internalExplorationLog;

  const { onEventRecorded, resetIndex } = useSlateExplorationCapture({
    editor,
    slateEditable,
    textareaRef,
    explorationLog: explorationLog ?? undefined,
    enabled: exploreEnabled,
  });

  const handleClear = useCallback(
    (node: HTMLElement | null) => {
      if (node instanceof HTMLTextAreaElement) {
        node.value = "";
      } else if (node?.isContentEditable) {
        node.textContent = "";
      }
      if (textareaRef.current) {
        textareaRef.current.value = "";
      }
      clearSlateFixDebugState(editor);
      resetIndex();
    },
    [editor, resetIndex],
  );

  return (
    <ImeCaptureShell
      title="Slate placeholder Hangul — exploration capture"
      description="H1 timeline + H2 DOM diff + H3 source map in slateDebug.exploration"
      scenarioId={SCENARIO_IDS[effectiveTarget]}
      listenerDeps={[effectiveTarget]}
      onEventRecorded={exploreEnabled ? onEventRecorded : undefined}
      traceExtra={
        exploreEnabled && explorationLog
          ? ({ events }) => {
              const final =
                slateEditable &&
                readSlateCompositionSnapshot(editor, slateEditable, { passive: true });

              return {
                slateDebug: {
                  patch: readSlatePatchProbe(),
                  imeEventCount: events.length,
                  final: final
                    ? {
                        slateText: final.slateText,
                        domText: final.domText,
                        placeholderPresent: final.placeholderPresent,
                        placeholderDisplay: final.placeholderDisplay,
                        pendingDiffCount: final.pendingDiffCount,
                      }
                    : undefined,
                  exploration: explorationLog.toExport({ events }),
                },
              };
            }
          : undefined
      }
      clearField={handleClear}
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
            Focus <strong>Slate editor</strong> → type <code>가나다</code> → JSON 다운로드.
          </li>
          <li>
            JSON includes <code>slateDebug.patch.patchActive</code> — must be <strong>true</strong>{" "}
            (false = Storybook served stale slate-react; restart after{" "}
            <code>bun run storybook</code>).
          </li>
          <li>
            JSON includes <code>slateDebug.exploration.timeline</code> (H1),{" "}
            <code>domStructures</code> (H2), <code>sourceMapHints</code> + minimal HTML path (H3).
          </li>
          <li>
            Reference textarea below Slate — snapshot only at key steps (do not type there during
            capture).
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
          <div className="space-y-3">
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
            <div>
              <p className="mb-1 text-xs text-muted-foreground">
                H2 reference (empty — structural snapshot only)
              </p>
              <textarea
                ref={textareaRef}
                readOnly
                tabIndex={-1}
                aria-label="Reference textarea for DOM structure"
                className="min-h-[3rem] w-full rounded-md border border-dashed border-input bg-muted/20 px-3 py-2 text-muted-foreground"
                placeholder="(reference — do not focus during Slate capture)"
              />
            </div>
          </div>
        )
      }
    </ImeCaptureShell>
  );
}
