import { useState } from "react";

import { ImeCaptureShell } from "../../ime-logger/ImeCaptureShell";
import { CaptureInstructions, ModeToolbar } from "../shared/imeBugLoggerChrome";
import { DelayedControlledField, type DelayedControlledFieldProps } from "./DelayedControlledField";

/**
 * Capture shell: type Hangul quickly into a controlled input whose setState lags.
 * Emulator: createImeActions({ settle: "macrotask", deferredUpdateRace: true }).
 */
export function DelayedControlledFieldLogger() {
  const [mode, setMode] = useState<NonNullable<DelayedControlledFieldProps["mode"]>>("broken");
  const scenarioId = `delayed-update-${mode}`;

  return (
    <ImeCaptureShell
      title="Delayed controlled update (IME bug)"
      description={
        <>
          React controlled input에서 <code className="rounded bg-muted px-1">setState</code>가 한
          박자 늦으면, IME preedit 위를 오래된 <code className="rounded bg-muted px-1">value</code>
          가 덮어써 한글 조합이 깨집니다. 영어는 composition이 없어 잘 안 보입니다.
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
            <li>broken이면 입력란에 「김태희」를 빠르게 조합합니다.</li>
            <li>값이 깨지거나 뒤로 돌아가면 재현 성공입니다 (fixed는 김태희 유지).</li>
            <li>
              에뮬레이터는{" "}
              <code className="rounded bg-muted px-1">
                createImeActions({"{"} settle: &quot;macrotask&quot;, deferredUpdateRace: true {"}"}
                )
              </code>
              로 같은 레이스를 만듭니다.
            </li>
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
          <DelayedControlledField
            key={mode}
            mode={mode}
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
