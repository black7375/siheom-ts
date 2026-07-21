import { useState, type MutableRefObject } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import type { LexicalEditor } from "lexical";

import { ImeCaptureShell } from "../../ime-logger/ImeCaptureShell";
import { CaptureInstructions, ModeToolbar } from "../shared/imeBugLoggerChrome";
import { LexicalAndroidFirefoxCompositionFixPlugin } from "./LexicalAndroidFirefoxCompositionFixPlugin";
import { LexicalEditorRefPlugin } from "./LexicalEditorRefPlugin";

const initialConfig = {
  namespace: "LexicalLogger",
  onError: (error: Error) => {
    throw error;
  },
};

export type LexicalLoggerMode = "broken" | "fixed";

export type LexicalLoggerProps = {
  /** broken = upstream Lexical; fixed = skip NBSP composition sentinel (#6377). */
  mode?: LexicalLoggerMode;
  /** Optional: receive mounted LexicalEditor (tests). */
  editorRef?: MutableRefObject<LexicalEditor | null>;
};

export function LexicalLogger({ mode: modeProp, editorRef }: LexicalLoggerProps = {}) {
  const [mode, setMode] = useState<LexicalLoggerMode>(modeProp ?? "broken");
  const effectiveMode = modeProp ?? mode;

  return (
    <ImeCaptureShell
      title="Lexical Android Firefox composition break"
      description="Android Firefox에서 Lexical contenteditable로 한글 조합 중 끊김을 재현·캡처합니다."
      scenarioId={
        effectiveMode === "fixed"
          ? "lexical-af-continuous-hangul-fixed"
          : "lexical-af-continuous-hangul"
      }
      beforeField={() => (
        <CaptureInstructions
          footer={
            modeProp === undefined ? (
              <div className="mt-3">
                <ModeToolbar mode={mode} onModeChange={setMode} />
              </div>
            ) : null
          }
        >
          <li>Android Firefox + Gboard에서 Lexical 편집기를 탭해 포커스를 줍니다.</li>
          <li>「가나다」처럼 연속된 한글을 조합하면서 조합 중 끊김 여부를 확인합니다.</li>
          <li>broken은 Lexical 기본(Firefox NBSP sentinel), fixed는 sentinel 삽입을 건너뜁니다.</li>
          <li>이벤트 로그가 기록되면 JSON 복사 또는 다운로드로 트레이스를 저장합니다.</li>
        </CaptureInstructions>
      )}
    >
      {({ attachInputRef }) => (
        <LexicalComposer initialConfig={initialConfig}>
          <PlainTextPlugin
            contentEditable={
              <ContentEditable
                ref={attachInputRef}
                className="min-h-[8rem] rounded-md border border-input bg-background px-3 py-2"
                aria-label="Lexical editor"
                role="textbox"
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          {editorRef ? <LexicalEditorRefPlugin editorRef={editorRef} /> : null}
          {effectiveMode === "fixed" ? <LexicalAndroidFirefoxCompositionFixPlugin /> : null}
        </LexicalComposer>
      )}
    </ImeCaptureShell>
  );
}
