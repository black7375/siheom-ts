import { useCallback, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import { LOGGED_EVENT_TYPES, readEditableValue } from "../../ime-logger/recordInputEvents";
import {
  buildImeTrace,
  formatImeTraceJson,
  profileIdFromMeta,
  serializeImeEvent,
  type ImeEventRecord,
} from "../../ime-logger/serializeImeEvent";
import { useImeLoggerMeta } from "../../ime-logger/useImeLoggerMeta";
import { HanjaAutocompleteField, type HanjaAutocompleteFieldProps } from "./HanjaAutocompleteField";
import { CAPTURE_SCENARIOS } from "./scenarios";

const SCENARIO_ID_BY_MODE = {
  broken: "hanja-name-broken",
  fixed: "hanja-name-fixed",
} as const;

/**
 * Capture shell: Hanja conversion (Option+Enter) vs autocomplete combobox key conflicts.
 */
export function HanjaAutocompleteFieldLogger() {
  const [mode, setMode] = useState<NonNullable<HanjaAutocompleteFieldProps["mode"]>>("broken");
  const { os, browser, ime, setOs, setBrowser, setIme } = useImeLoggerMeta();
  const [events, setEvents] = useState<ImeEventRecord[]>([]);
  const [fieldValue, setFieldValue] = useState("");
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listenersCleanupRef = useRef<(() => void) | null>(null);

  const profileId = useMemo(() => profileIdFromMeta(os, browser, ime), [os, browser, ime]);
  const scenario = CAPTURE_SCENARIOS[0];

  const appendEvent = useCallback((event: Event) => {
    const value = readEditableValue(event.target);
    setFieldValue(value);
    setEvents((prev) => [...prev, serializeImeEvent(event, value)]);
  }, []);

  const attachInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      listenersCleanupRef.current?.();
      listenersCleanupRef.current = null;
      inputRef.current = node;
      if (!node) return;

      for (const type of LOGGED_EVENT_TYPES) {
        node.addEventListener(type, appendEvent);
      }
      listenersCleanupRef.current = () => {
        for (const type of LOGGED_EVENT_TYPES) {
          node.removeEventListener(type, appendEvent);
        }
      };
    },
    [appendEvent],
  );

  const clear = () => {
    setEvents([]);
    setFieldValue("");
    setStatus("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
    queueMicrotask(() => inputRef.current?.focus());
  };

  const buildTrace = () =>
    buildImeTrace({
      os,
      browser,
      ime,
      events,
      capturedAt: new Date().toISOString(),
      scenarioId: SCENARIO_ID_BY_MODE[mode],
      source: "os-ime",
    });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 text-foreground">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Hanja autocomplete conflict (IME bug)</h1>
        <p className="text-sm text-muted-foreground">
          macOS 한자 변환(Option+Enter) 후보 탐색은 방향키·숫자·Enter를 씁니다. 자동완성 combobox가{" "}
          <code className="rounded bg-muted px-1">isComposing</code> /{" "}
          <code className="rounded bg-muted px-1">keyCode 229</code>를 무시하고 같은 키를 처리하면
          「김」→「金」 같은 한 글자씩 변환이 깨집니다. focus-steal과 달리 blur가 아니라{" "}
          <strong>키 충돌</strong>입니다.
        </p>
      </header>

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

      <HanjaAutocompleteField
        key={mode}
        mode={mode}
        inputRef={attachInputRef}
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
            anchor.download = `${profileId}-${mode}-hanja-name-${Date.now()}.json`;
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

      <section className="flex flex-col gap-2" aria-label="이벤트 로그">
        <h2 className="text-sm font-medium">Events ({events.length})</h2>
        <pre className="max-h-[28rem] overflow-auto rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed">
          {events.length === 0
            ? "아직 이벤트가 없습니다. broken 모드에서 한자 변환 입력을 시도해 보세요."
            : formatImeTraceJson(buildTrace())}
        </pre>
      </section>
    </div>
  );
}
