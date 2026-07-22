import { useRef, useState, type MutableRefObject } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { Button } from "@/components/ui/button";
import { ImeCaptureShell, type ImeCaptureApi } from "../../ime-logger/ImeCaptureShell";
import { CaptureInstructions } from "../shared/imeBugLoggerChrome";
import { readTipTapCompositionSnapshot } from "./readTipTapCompositionSnapshot";

export type TipTapScenario = "enter-newline" | "list-item-start";

const SCENARIO_IDS: Record<TipTapScenario, string> = {
  "enter-newline": "tiptap-enter-김",
  "list-item-start": "tiptap-list-ime",
};

export type TipTapLoggerProps = {
  scenario?: TipTapScenario;
  /** Test seam: latest ImeCaptureShell API (buildTrace / download). */
  captureApiRef?: MutableRefObject<ImeCaptureApi | null>;
};

export function TipTapLogger({ scenario: scenarioProp, captureApiRef }: TipTapLoggerProps = {}) {
  const [scenario, setScenario] = useState<TipTapScenario>(scenarioProp ?? "enter-newline");
  const effectiveScenario = scenarioProp ?? scenario;
  const editorRef = useRef<Editor | null>(null);

  return (
    <ImeCaptureShell
      title="TipTap IME"
      description="TipTap contenteditable에서 한글 IME 버그를 재현·캡처합니다."
      scenarioId={SCENARIO_IDS[effectiveScenario]}
      downloadStem={effectiveScenario === "list-item-start" ? "broken-list-ime" : "broken-enter-김"}
      traceExtra={() => ({
        tiptapDebug: {
          final: editorRef.current ? readTipTapCompositionSnapshot(editorRef.current) : null,
        },
      })}
      beforeField={(capture) => {
        if (captureApiRef) {
          captureApiRef.current = capture;
        }
        return (
          <CaptureInstructions
            footer={
              scenarioProp === undefined ? (
                <div className="mt-3">
                  <ScenarioToolbar scenario={scenario} onScenarioChange={setScenario} />
                </div>
              ) : null
            }
          >
            <li>
              <strong>enter-newline (#4108):</strong> 한글 조합 중 Enter → 마지막 음절 소실 여부를
              확인합니다.
            </li>
            <li>
              <strong>list-item-start (#6825):</strong> 빈 bullet 첫 항목 시작에서 IME 입력 이상을
              확인합니다 (Safari 우선).
            </li>
            <li>이벤트 로그가 기록되면 JSON 복사 또는 다운로드로 트레이스를 저장합니다.</li>
          </CaptureInstructions>
        );
      }}
    >
      {({ attachInputRef }) => (
        <TipTapEditorField
          key={effectiveScenario}
          scenario={effectiveScenario}
          attachInputRef={attachInputRef}
          editorRef={editorRef}
        />
      )}
    </ImeCaptureShell>
  );
}

function ScenarioToolbar({
  scenario,
  onScenarioChange,
}: {
  scenario: TipTapScenario;
  onScenarioChange: (scenario: TipTapScenario) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="시나리오">
      <Button
        type="button"
        size="sm"
        variant={scenario === "enter-newline" ? "default" : "outline"}
        aria-pressed={scenario === "enter-newline"}
        onClick={() => onScenarioChange("enter-newline")}
      >
        enter-newline
      </Button>
      <Button
        type="button"
        size="sm"
        variant={scenario === "list-item-start" ? "default" : "outline"}
        aria-pressed={scenario === "list-item-start"}
        onClick={() => onScenarioChange("list-item-start")}
      >
        list-item-start
      </Button>
    </div>
  );
}

function TipTapEditorField({
  scenario,
  attachInputRef,
  editorRef,
}: {
  scenario: TipTapScenario;
  attachInputRef: (element: HTMLElement | null) => void;
  editorRef: MutableRefObject<Editor | null>;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-label": "TipTap editor",
        role: "textbox",
        class: "min-h-[8rem] rounded-md border border-input bg-background px-3 py-2",
      },
    },
    onCreate: ({ editor: created }) => {
      if (scenario === "list-item-start") {
        created.chain().focus().toggleBulletList().run();
      }
      editorRef.current = created;
      attachInputRef(created.view.dom);
    },
    onDestroy: () => {
      editorRef.current = null;
      attachInputRef(null);
    },
  });

  return <EditorContent editor={editor} />;
}
