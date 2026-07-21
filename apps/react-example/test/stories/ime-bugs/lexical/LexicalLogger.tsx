import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";

import { ImeCaptureShell } from "../../ime-logger/ImeCaptureShell";
import { CaptureInstructions } from "../shared/imeBugLoggerChrome";

const initialConfig = {
  namespace: "LexicalLogger",
  onError: (error: Error) => {
    throw error;
  },
};

export function LexicalLogger() {
  return (
    <ImeCaptureShell
      title="Lexical Android Firefox composition break"
      description="Android Firefox에서 Lexical contenteditable로 한글 조합 중 끊김을 재현·캡처합니다."
      scenarioId="lexical-af-continuous-hangul"
      beforeField={() => (
        <CaptureInstructions>
          <li>Android Firefox + Gboard에서 Lexical 편집기를 탭해 포커스를 줍니다.</li>
          <li>「가나다」처럼 연속된 한글을 조합하면서 조합 중 끊김 여부를 확인합니다.</li>
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
        </LexicalComposer>
      )}
    </ImeCaptureShell>
  );
}
