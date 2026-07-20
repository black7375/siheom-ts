import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import { LOGGED_EVENT_TYPES, readEditableValue } from "../../ime-logger/recordInputEvents";
import {
  buildImeTrace,
  formatImeTraceJson,
  profileIdFromMeta,
  serializeImeEvent,
  type ImeEventRecord,
} from "../../ime-logger/serializeImeEvent";
import {
  DelayedControlledField,
  type DelayedControlledFieldProps,
} from "./DelayedControlledField";

/**
 * Capture shell: type Hangul quickly into a controlled input whose setState lags.
 * Emulator: createImeActions({ settle: "macrotask", deferredUpdateRace: true }).
 */
export function DelayedControlledFieldLogger() {
  const [mode, setMode] =
    useState<NonNullable<DelayedControlledFieldProps["mode"]>>("broken");
  const [os, setOs] = useState("linux");
  const [browser, setBrowser] = useState("chrome");
  const [ime, setIme] = useState("ibus-hangul");
  const [events, setEvents] = useState<ImeEventRecord[]>([]);
  const [fieldValue, setFieldValue] = useState("");
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const profileId = useMemo(() => profileIdFromMeta(os, browser, ime), [os, browser, ime]);
  const scenarioId = `delayed-update-${mode}`;

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
  }, [appendEvent, mode]);

  const clear = () => {
    setEvents([]);
    setFieldValue("");
    setStatus("");
    queueMicrotask(() => inputRef.current?.focus());
  };

  const buildTrace = () =>
    buildImeTrace({
      os,
      browser,
      ime,
      events,
      capturedAt: new Date().toISOString(),
      scenarioId,
      source: "os-ime",
    });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 text-foreground">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Delayed controlled update (IME bug)</h1>
        <p className="text-sm text-muted-foreground">
          React controlled input에서 <code className="rounded bg-muted px-1">setState</code>가 한
          박자 늦으면, IME preedit 위를 오래된 <code className="rounded bg-muted px-1">value</code>가
          덮어써 한글 조합이 깨집니다. 영어는 composition이 없어 잘 안 보입니다.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-muted/30 p-3 text-sm" aria-label="캡처 지시">
        <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
          <li>broken이면 입력란에 「김태희」를 빠르게 조합합니다.</li>
          <li>값이 깨지거나 뒤로 돌아가면 재현 성공입니다 (fixed는 김태희 유지).</li>
          <li>
            에뮬레이터는{" "}
            <code className="rounded bg-muted px-1">
              createImeActions({"{"} settle: &quot;macrotask&quot;, deferredUpdateRace: true {"}"})
            </code>
            로 같은 레이스를 만듭니다.
          </li>
        </ol>
      </section>

      <div className="flex flex-wrap gap-2" role="group" aria-label="모드">
        <Button
          type="button"
          size="sm"
          variant={mode === "broken" ? "default" : "outline"}
          aria-pressed={mode === "broken"}
          onClick={() => {
            setMode("broken");
            clear();
          }}
        >
          broken
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "fixed" ? "default" : "outline"}
          aria-pressed={mode === "fixed"}
          onClick={() => {
            setMode("fixed");
            clear();
          }}
        >
          fixed
        </Button>
      </div>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="트레이스 메타데이터">
        <label className="flex flex-col gap-1 text-sm">
          OS
          <input
            className="h-8 rounded-lg border border-input px-2.5"
            value={os}
            onChange={(e) => setOs(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Browser
          <input
            className="h-8 rounded-lg border border-input px-2.5"
            value={browser}
            onChange={(e) => setBrowser(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          IME
          <input
            className="h-8 rounded-lg border border-input px-2.5"
            value={ime}
            onChange={(e) => setIme(e.target.value)}
          />
        </label>
      </section>

      <p className="text-sm">
        profileId: <code className="rounded bg-muted px-1.5 py-0.5">{profileId}</code>
        {" · "}
        mode: <code className="rounded bg-muted px-1.5 py-0.5">{mode}</code>
      </p>

      <DelayedControlledField
        key={mode}
        mode={mode}
        inputRef={inputRef}
        onValueChange={setFieldValue}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(formatImeTraceJson(buildTrace()));
            setStatus("클립보드에 복사했습니다.");
          }}
          disabled={events.length === 0}
        >
          JSON 복사
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={events.length === 0}
          onClick={() => {
            const json = formatImeTraceJson(buildTrace());
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `${profileId}-${scenarioId}-${Date.now()}.json`;
            anchor.click();
            URL.revokeObjectURL(url);
            setStatus("JSON 파일을 다운로드했습니다.");
          }}
        >
          JSON 다운로드
        </Button>
        <Button type="button" variant="ghost" onClick={clear}>
          지우기
        </Button>
      </div>

      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}

      <p className="text-sm text-muted-foreground">
        현재 입력: <span className="font-mono">{fieldValue || "(비어 있음)"}</span>
      </p>

      <section className="flex flex-col gap-2" aria-label="이벤트 로그">
        <h2 className="text-sm font-medium">Events ({events.length})</h2>
        <pre className="max-h-[28rem] overflow-auto rounded-lg border border-border bg-muted/40 p-3 text-xs">
          {events.length === 0
            ? "아직 이벤트가 없습니다."
            : formatImeTraceJson(buildTrace())}
        </pre>
      </section>
    </div>
  );
}
