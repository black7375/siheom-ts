import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ImeCaptureShell } from "./ImeCaptureShell";
import { CAPTURE_SCENARIOS, getCaptureScenario, type CaptureScenario } from "./scenarios";

const DEFAULT_SCENARIO = CAPTURE_SCENARIOS[0] as CaptureScenario;

export function ImeEventLogger() {
  const [scenarioId, setScenarioId] = useState(DEFAULT_SCENARIO.id);
  const scenario = getCaptureScenario(scenarioId) ?? DEFAULT_SCENARIO;

  return (
    <ImeCaptureShell
      title="IME Event Logger"
      description={
        <>
          시나리오를 고른 뒤 지시대로 OS IME로 입력하세요. 끝나면 JSON을 복사·다운로드해 트레이스로
          넘기면 됩니다. user-event 대비 스냅샷은{" "}
          <code className="rounded bg-muted px-1">fixtures/user-event/</code>에 있습니다.
        </>
      }
      scenarioId={scenario.id}
      beforeField={({ fieldValue, clear }) => {
        const valueMatches = fieldValue === scenario.expectedValue;
        return (
          <section className="flex flex-col gap-2" aria-label="캡처 시나리오">
            <h2 className="text-sm font-medium">시나리오</h2>
            <div className="flex flex-wrap gap-2">
              {CAPTURE_SCENARIOS.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant={item.id === scenario.id ? "default" : "outline"}
                  aria-pressed={item.id === scenario.id}
                  onClick={() => {
                    setScenarioId(item.id);
                    clear();
                  }}
                >
                  {item.title}
                </Button>
              ))}
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <p className="font-medium">{scenario.title}</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                {scenario.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="mt-3 flex flex-wrap items-center gap-2">
                <span>기대값:</span>
                <span
                  role="status"
                  aria-label="시나리오 기대값"
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs"
                >
                  {scenario.expectedValue}
                </span>
                {fieldValue ? (
                  <>
                    <span>· 현재:</span>
                    <span
                      role="status"
                      aria-label="현재 입력값"
                      className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs"
                    >
                      {fieldValue}
                      {valueMatches ? " ✓" : ""}
                    </span>
                  </>
                ) : null}
              </p>
            </div>
          </section>
        );
      }}
    >
      {({ inputRef, setFieldValue }) => (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ime-logger-input">IME 입력</Label>
          <Input
            ref={inputRef}
            id="ime-logger-input"
            defaultValue=""
            onChange={(e) => setFieldValue(e.target.value)}
            placeholder="시나리오 지시대로 입력"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
      )}
    </ImeCaptureShell>
  );
}
