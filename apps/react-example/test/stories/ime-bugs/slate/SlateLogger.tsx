import { useMemo, useState, type MutableRefObject } from "react";
import { createEditor, type Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";

import "./slate-custom-types";

import { ImeCaptureShell } from "../../ime-logger/ImeCaptureShell";
import { CaptureInstructions } from "../shared/imeBugLoggerChrome";
import { PlaceholderToolbar } from "./PlaceholderToolbar";

const EMPTY_VALUE: Descendant[] = [{ type: "paragraph", children: [{ text: "" }] }];

export type SlateLoggerProps = {
  /** Lock placeholder visibility (tests). Omit to show on-screen toggle. */
  showPlaceholder?: boolean;
  /** Optional: receive mounted contenteditable (tests). */
  editorRef?: MutableRefObject<HTMLElement | null>;
};

export function SlateLogger({ showPlaceholder: showPlaceholderProp, editorRef }: SlateLoggerProps = {}) {
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const effectiveShowPlaceholder = showPlaceholderProp ?? showPlaceholder;
  const editor = useMemo(() => withReact(createEditor()), []);

  return (
    <ImeCaptureShell
      title="Slate placeholder Hangul first syllable"
      description="Android Chrome 등에서 Slate Editable + placeholder 상태의 첫 한글 음절 조합 깨짐을 재현·캡처합니다."
      scenarioId={
        effectiveShowPlaceholder
          ? "slate-ac-first-hangul-placeholder"
          : "slate-ac-first-hangul-no-placeholder"
      }
      beforeField={() => (
        <CaptureInstructions
          footer={
            showPlaceholderProp === undefined ? (
              <div className="mt-3">
                <PlaceholderToolbar
                  showPlaceholder={showPlaceholder}
                  onShowPlaceholderChange={setShowPlaceholder}
                />
              </div>
            ) : null
          }
        >
          <li>Android Chrome + Gboard에서 Slate 편집기를 탭해 포커스를 줍니다.</li>
          <li>placeholder가 켜진 상태에서 첫 음절(예: 「가」)을 조합합니다.</li>
          <li>placeholder off와 비교해 첫 음절만 깨지는지 확인합니다.</li>
          <li>이벤트 로그가 기록되면 JSON 복사 또는 다운로드로 트레이스를 저장합니다.</li>
        </CaptureInstructions>
      )}
    >
      {({ attachInputRef }) => (
        <Slate editor={editor} initialValue={EMPTY_VALUE}>
          <Editable
            ref={(node) => {
              attachInputRef(node);
              if (editorRef) {
                editorRef.current = node;
              }
            }}
            className="min-h-[8rem] rounded-md border border-input bg-background px-3 py-2"
            aria-label="Slate editor"
            role="textbox"
            placeholder={effectiveShowPlaceholder ? "여기에 입력…" : undefined}
          />
        </Slate>
      )}
    </ImeCaptureShell>
  );
}
