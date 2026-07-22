import { useRef, type MutableRefObject } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { ImeCaptureShell, type ImeCaptureApi } from "../../ime-logger/ImeCaptureShell";
import { CaptureInstructions } from "../shared/imeBugLoggerChrome";
import { readTipTapCompositionSnapshot } from "./readTipTapCompositionSnapshot";

export type TipTapLoggerProps = {
  /** Test seam: latest ImeCaptureShell API (buildTrace / download). */
  captureApiRef?: MutableRefObject<ImeCaptureApi | null>;
};

export function TipTapLogger({ captureApiRef }: TipTapLoggerProps = {}) {
  const editorRef = useRef<Editor | null>(null);

  return (
    <ImeCaptureShell
      title="TipTap IME"
      description="TipTap contenteditable에서 한글 IME 버그를 재현·캡처합니다."
      scenarioId="tiptap-enter-김"
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
          <CaptureInstructions>
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
        <TipTapEditorField attachInputRef={attachInputRef} editorRef={editorRef} />
      )}
    </ImeCaptureShell>
  );
}

function TipTapEditorField({
  attachInputRef,
  editorRef,
}: {
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
