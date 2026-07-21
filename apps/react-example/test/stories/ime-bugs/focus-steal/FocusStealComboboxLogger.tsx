import { useState } from "react";

import { ImeCaptureShellInput } from "../../ime-logger/ImeCaptureShell";
import {
  CaptureInstructions,
  ModeToolbar,
  clearWithInputEvent,
} from "../shared/imeBugLoggerChrome";
import { FocusStealCombobox, type FocusStealComboboxProps } from "./FocusStealCombobox";

const SCENARIO_ID_BY_MODE = {
  broken: "focus-steal-hangul-broken",
  fixed: "focus-steal-hangul-fixed",
} as const;

/**
 * Storybook capture shell: broken/fixed combobox + IME event log.
 * Broken mode briefly focuses an option then returns to the input — Hangul composition aborts on blur; Latin does not care.
 */
export function FocusStealComboboxLogger() {
  const [mode, setMode] = useState<NonNullable<FocusStealComboboxProps["mode"]>>("broken");

  return (
    <ImeCaptureShellInput
      title="Focus-steal Combobox (IME bug)"
      description={
        <>
          broken: 매 input마다 option → input DOM focus 왕복 (한글만 조합이 풀림). fixed: DOM
          focus는 유지하고 aria-selected / aria-activedescendant로만 하이라이트합니다. 예전 fixed가
          compositionend마다 bounce하거나 controlled value를 조합 중에 다시 쓰면{" "}
          <code className="rounded bg-muted px-1">김ㅐㅢ</code>처럼 깨집니다.
        </>
      }
      scenarioId={SCENARIO_ID_BY_MODE[mode]}
      downloadStem={`${mode}-hangul`}
      listenerDeps={[mode]}
      clearField={clearWithInputEvent}
      scenarioLabel={
        <>
          mode: <code className="rounded bg-muted px-1.5 py-0.5">{mode}</code>
        </>
      }
      emptyLogMessage="아직 이벤트가 없습니다. broken 모드에서 한글로 입력해 보세요."
      beforeField={({ clear, fieldValue }) => (
        <>
          <CaptureInstructions
            footer={
              <p className="mt-3 flex flex-wrap gap-2">
                <span>현재 입력:</span>
                <span role="status" aria-label="현재 입력값" className="font-mono text-xs">
                  {fieldValue || "(비어 있음)"}
                </span>
              </p>
            }
          >
            <li>broken으로 「김태희」→ 풀어쓰기 트레이스 (이미 fixtures에 있음).</li>
            <li>fixed로 같은 입력을 다시 캡처해 최종값이 「김태희」인지 확인합니다.</li>
            <li>JSON을 복사·다운로드해 linux-ibus-hangul-chrome/fixed-hangul.json을 덮어씁니다.</li>
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
      {({ inputRef, setFieldValue }) => (
        <FocusStealCombobox
          key={mode}
          mode={mode}
          inputRef={inputRef}
          onValueChange={setFieldValue}
        />
      )}
    </ImeCaptureShellInput>
  );
}
