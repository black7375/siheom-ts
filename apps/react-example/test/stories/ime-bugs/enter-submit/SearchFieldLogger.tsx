import { useState } from "react";

import { ImeCaptureShellInput } from "../../ime-logger/ImeCaptureShell";
import { CaptureInstructions, ModeToolbar } from "../shared/imeBugLoggerChrome";
import { SearchField, type SearchFieldProps } from "./SearchField";

/**
 * Capture shell: type Hangul then Enter mid-composition on a real OS IME (esp. Safari).
 * Emulator coverage uses createImeActions({ profile: "macos-safari" }) in tests.
 */
export function SearchFieldLogger() {
  const [mode, setMode] = useState<NonNullable<SearchFieldProps["mode"]>>("broken");
  const scenarioId = `enter-submit-${mode}`;

  return (
    <ImeCaptureShellInput
      title="Enter-submit SearchField (IME bug)"
      description={
        <>
          조합 중 Enter(확정)가 검색 submit으로 가는지 확인합니다. Safari는 compositionend 후{" "}
          <code className="rounded bg-muted px-1">isComposing: false</code> Enter를 보냅니다.
        </>
      }
      scenarioId={scenarioId}
      listenerDeps={[mode]}
      clearField={() => {}}
      scenarioLabel={
        <>
          mode: <code className="rounded bg-muted px-1.5 py-0.5">{mode}</code>
        </>
      }
      emptyLogMessage="아직 이벤트가 없습니다."
      beforeField={({ clear }) => (
        <>
          <CaptureInstructions>
            <li>
              Linux Chrome+ibus도 Safari처럼 compositionend 뒤 Enter(isComposing:false)가 옵니다
              (fixtures/linux-ibus-hangul-chrome 참고).
            </li>
            <li>검색란에 「김」을 조합한 뒤, 음절 확정용 Enter를 한 번 누릅니다.</li>
            <li>broken이면 submit 1, fixed(다음 Enter 무시)면 0이어야 합니다.</li>
            <li>진짜 검색은 fixed에서 Enter를 한 번 더 누릅니다.</li>
          </CaptureInstructions>
          <ModeToolbar
            mode={mode}
            onModeChange={(next) => {
              setMode(next);
              clear();
            }}
          />
        </>
      )}
    >
      {({ inputRef, setFieldValue, fieldValue }) => (
        <>
          <SearchField key={mode} mode={mode} inputRef={inputRef} onValueChange={setFieldValue} />
          <p className="text-sm text-muted-foreground">
            현재 입력: <span className="font-mono">{fieldValue || "(비어 있음)"}</span>
          </p>
        </>
      )}
    </ImeCaptureShellInput>
  );
}
