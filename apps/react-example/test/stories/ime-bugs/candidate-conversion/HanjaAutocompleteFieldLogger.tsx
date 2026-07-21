import { useState } from "react";

import { ImeCaptureShellInput } from "../../ime-logger/ImeCaptureShell";
import { ModeToolbar, clearWithInputEvent } from "../shared/imeBugLoggerChrome";
import { HanjaAutocompleteField, type HanjaAutocompleteFieldProps } from "./HanjaAutocompleteField";
import { CAPTURE_SCENARIOS } from "./scenarios";

const SCENARIO_ID_BY_MODE = {
  broken: "hanja-name-broken",
  fixed: "hanja-name-fixed",
} as const;

const scenario = CAPTURE_SCENARIOS[0]!;

/**
 * Capture shell: Hanja conversion vs autocomplete key conflict.
 * macOS Chrome appends Hanja (김金); fixed mode strips the leftover Hangul.
 */
export function HanjaAutocompleteFieldLogger() {
  const [mode, setMode] = useState<NonNullable<HanjaAutocompleteFieldProps["mode"]>>("broken");

  return (
    <ImeCaptureShellInput
      title="Hanja autocomplete conflict (IME bug)"
      description={
        <>
          broken: combobox가 한자 후보 키를 가로챕니다. fixed: 키는 IME에 넘기고, macOS Chrome이
          「김」→「김金」처럼 <em>append</em>하는 브라우저 한계는 직전에 남은 한글을 지워 「金」으로
          맞춥니다 (IME 의도 보정).
        </>
      }
      scenarioId={SCENARIO_ID_BY_MODE[mode]}
      downloadStem={`${mode}-hanja-name`}
      attachment="callback"
      clearField={clearWithInputEvent}
      scenarioLabel={
        <>
          mode: <code className="rounded bg-muted px-1.5 py-0.5">{mode}</code>
        </>
      }
      emptyLogMessage="아직 이벤트가 없습니다. fixed에서 김→金 변환 후 값이 金인지 확인하세요."
      beforeField={({ clear, fieldValue }) => (
        <>
          <section
            className="rounded-lg border border-border bg-muted/30 p-3 text-sm"
            aria-label="캡처 지시"
          >
            <p className="mb-1 font-medium">{scenario.title}</p>
            <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
              {scenario.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-3 flex flex-wrap gap-2">
              <span>현재 입력:</span>
              <span role="status" aria-label="현재 입력값" className="font-mono text-xs">
                {fieldValue || "(비어 있음)"}
              </span>
            </p>
          </section>
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
      {({ attachInputRef, setFieldValue }) => (
        <HanjaAutocompleteField
          key={mode}
          mode={mode}
          inputRef={attachInputRef}
          onValueChange={setFieldValue}
        />
      )}
    </ImeCaptureShellInput>
  );
}
