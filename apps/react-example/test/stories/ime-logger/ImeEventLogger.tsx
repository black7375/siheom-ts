import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { LOGGED_EVENT_TYPES, readEditableValue } from "./recordInputEvents";
import { CAPTURE_SCENARIOS, getCaptureScenario, type CaptureScenario } from "./scenarios";
import {
  buildImeTrace,
  formatImeTraceJson,
  profileIdFromMeta,
  serializeImeEvent,
  type ImeEventRecord,
} from "./serializeImeEvent";

const DEFAULT_SCENARIO = CAPTURE_SCENARIOS[0] as CaptureScenario;

export function ImeEventLogger() {
  const [os, setOs] = useState("linux");
  const [browser, setBrowser] = useState("chrome");
  const [ime, setIme] = useState("ibus-hangul");
  const [scenarioId, setScenarioId] = useState(DEFAULT_SCENARIO.id);
  const [events, setEvents] = useState<ImeEventRecord[]>([]);
  const [fieldValue, setFieldValue] = useState("");
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const scenario = getCaptureScenario(scenarioId) ?? DEFAULT_SCENARIO;

  const profileId = useMemo(() => profileIdFromMeta(os, browser, ime), [os, browser, ime]);

  const clearFieldAndLog = useCallback(() => {
    setEvents([]);
    setFieldValue("");
    setStatus("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const selectScenario = (next: CaptureScenario) => {
    setScenarioId(next.id);
    clearFieldAndLog();
    queueMicrotask(() => inputRef.current?.focus());
  };

  const appendEvent = useCallback((event: Event) => {
    const value = readEditableValue(event.target);
    setFieldValue(value);
    setEvents((prev) => [...prev, serializeImeEvent(event, value)]);
  }, []);

  useEffect(() => {
    const node = inputRef.current;
    if (!node) return;

    for (const type of LOGGED_EVENT_TYPES) {
      node.addEventListener(type, appendEvent);
    }

    return () => {
      for (const type of LOGGED_EVENT_TYPES) {
        node.removeEventListener(type, appendEvent);
      }
    };
  }, [appendEvent]);

  const buildTrace = useCallback(() => {
    return buildImeTrace({
      os,
      browser,
      ime,
      events,
      capturedAt: new Date().toISOString(),
      scenarioId: scenario.id,
      source: "os-ime",
    });
  }, [os, browser, ime, events, scenario.id]);

  const handleCopy = async () => {
    const json = formatImeTraceJson(buildTrace());
    await navigator.clipboard.writeText(json);
    setStatus("클립보드에 복사했습니다.");
  };

  const handleDownload = () => {
    const json = formatImeTraceJson(buildTrace());
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${profileId || "ime-trace"}-${scenario.id}-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("JSON 파일을 다운로드했습니다.");
  };

  const handleClear = () => {
    clearFieldAndLog();
    inputRef.current?.focus();
  };

  const valueMatches = fieldValue === scenario.expectedValue;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 text-foreground">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">IME Event Logger</h1>
        <p className="text-sm text-muted-foreground">
          시나리오를 고른 뒤 지시대로 OS IME로 입력하세요. 끝나면 JSON을 복사·다운로드해 트레이스로
          넘기면 됩니다. user-event 대비 스냅샷은{" "}
          <code className="rounded bg-muted px-1">fixtures/user-event/</code>에 있습니다.
        </p>
      </header>

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
              onClick={() => selectScenario(item)}
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
            <span role="status" aria-label="시나리오 기대값" className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {scenario.expectedValue}
            </span>
            {fieldValue ? (
              <>
                <span>· 현재:</span>
                <span role="status" aria-label="현재 입력값" className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {fieldValue}
                  {valueMatches ? " ✓" : ""}
                </span>
              </>
            ) : null}
          </p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="트레이스 메타데이터">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ime-logger-os">OS</Label>
          <Input
            id="ime-logger-os"
            value={os}
            onChange={(e) => setOs(e.target.value)}
            placeholder="macos | windows | linux"
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ime-logger-browser">Browser</Label>
          <Input
            id="ime-logger-browser"
            value={browser}
            onChange={(e) => setBrowser(e.target.value)}
            placeholder="chrome | safari | firefox"
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ime-logger-ime">IME</Label>
          <Input
            id="ime-logger-ime"
            value={ime}
            onChange={(e) => setIme(e.target.value)}
            placeholder="apple | ms | nalgaeset | ibus-hangul"
            autoComplete="off"
          />
        </div>
      </section>

      <p className="text-sm">
        profileId: <code className="rounded bg-muted px-1.5 py-0.5">{profileId || "(empty)"}</code>
        {" · "}
        scenarioId: <code className="rounded bg-muted px-1.5 py-0.5">{scenario.id}</code>
      </p>

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

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleCopy} disabled={events.length === 0}>
          JSON 복사
        </Button>
        <Button type="button" variant="outline" onClick={handleDownload} disabled={events.length === 0}>
          JSON 다운로드
        </Button>
        <Button type="button" variant="ghost" onClick={handleClear}>
          지우기
        </Button>
      </div>

      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}

      <section className="flex flex-col gap-2" aria-label="이벤트 로그">
        <h2 className="text-sm font-medium">Events ({events.length})</h2>
        <pre className="max-h-[28rem] overflow-auto rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed">
          {events.length === 0
            ? "아직 이벤트가 없습니다. 시나리오를 고른 뒤 IME로 타이핑하세요."
            : formatImeTraceJson(buildTrace())}
        </pre>
      </section>
    </div>
  );
}
