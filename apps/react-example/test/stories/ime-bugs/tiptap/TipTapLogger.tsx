import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { ImeCaptureShell } from "../../ime-logger/ImeCaptureShell";

export function TipTapLogger() {
  return (
    <ImeCaptureShell
      title="TipTap IME"
      description="TipTap contenteditable에서 한글 IME 버그를 재현·캡처합니다."
      scenarioId="tiptap-enter-김"
    >
      {({ attachInputRef }) => <TipTapEditorField attachInputRef={attachInputRef} />}
    </ImeCaptureShell>
  );
}

function TipTapEditorField({
  attachInputRef,
}: {
  attachInputRef: (element: HTMLElement | null) => void;
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
      attachInputRef(created.view.dom);
    },
    onDestroy: () => {
      attachInputRef(null);
    },
  });

  return <EditorContent editor={editor} />;
}
