import { useState } from "react";

import { ImeCaptureShell } from "../../ime-logger/ImeCaptureShell";
import { CaptureInstructions, ModeToolbar } from "../shared/imeBugLoggerChrome";
import { MaxLengthField, type MaxLengthFieldProps } from "./MaxLengthField";

/**
 * Capture shell: type Hangul past `maxLength` on a real OS IME.
 * Emulator coverage uses createImeActions in MaxLengthField.ime.test.tsx.
 */
export function MaxLengthFieldLogger() {
  const [mode, setMode] = useState<NonNullable<MaxLengthFieldProps["mode"]>>("broken");
  const [maxLength, setMaxLength] = useState(6);
  const scenarioId = `maxlength-${mode}-${maxLength}`;

  return (
    <ImeCaptureShell
      title="MaxLength Field (IME bug)"
      description={
        <>
          조합 중 <code className="rounded bg-muted px-1">maxLength</code>를 넘어 입력되는지
          확인합니다. 브라우저 기본 동작(broken)과 입력마다 clamp(fixed)를 비교합니다.
        </>
      }
      scenarioId={scenarioId}
      listenerDeps={[mode, maxLength]}
      clearField={() => {}}
      scenarioLabel={
        <>
          mode: <code className="rounded bg-muted px-1.5 py-0.5">{mode}</code>
          {" · "}
          maxLength: <code className="rounded bg-muted px-1.5 py-0.5">{maxLength}</code>
        </>
      }
      emptyLogMessage="아직 이벤트가 없습니다."
      beforeField={({ clear }) => (
        <>
          <CaptureInstructions>
            <li>maxLength를 6으로 두고 한글로 「가나다라마바사」(7글자)를 끊지 않고 입력합니다.</li>
            <li>broken이면 조합 중 글자 수가 7까지 올라갈 수 있습니다.</li>
            <li>fixed이면 입력 단계부터 6글자에서 멈춥니다.</li>
            <li>JSON을 복사·다운로드해 fixtures에 저장합니다.</li>
          </CaptureInstructions>
          <ModeToolbar
            mode={mode}
            onModeChange={(next) => {
              setMode(next);
              clear();
            }}
          />
          <label className="flex flex-col gap-1 text-sm">
            maxLength
            <input
              className="h-8 w-24 rounded-lg border border-input px-2.5"
              type="number"
              min={1}
              max={20}
              value={maxLength}
              onChange={(event) => {
                setMaxLength(Number(event.target.value) || 6);
                clear();
              }}
            />
          </label>
        </>
      )}
    >
      {({ inputRef, setFieldValue, fieldValue }) => (
        <>
          <MaxLengthField
            key={`${mode}-${maxLength}`}
            mode={mode}
            maxLength={maxLength}
            inputRef={inputRef}
            onValueChange={setFieldValue}
          />
          <p className="text-sm text-muted-foreground">
            현재 입력: <span className="font-mono">{fieldValue || "(비어 있음)"}</span>
          </p>
        </>
      )}
    </ImeCaptureShell>
  );
}
