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

function eventLooksComposing(event: Event): boolean {
  if (event.type === "compositionstart" || event.type === "compositionupdate") return true;
  if (event.type === "compositionend") return false;
  if ("isComposing" in event && Boolean((event as KeyboardEvent).isComposing)) return true;
  if (event instanceof KeyboardEvent && event.keyCode === 229) return true;
  if (
    event instanceof InputEvent &&
    (event.inputType === "insertCompositionText" || event.inputType === "deleteCompositionText")
  ) {
    return true;
  }
  return false;
}

/**
 * Capture shell: Hanja conversion (Option+Enter) vs autocomplete combobox key conflicts.
 * Event UI state is buffered during composition — sync setState mid-IME breaks 김→金 replacement.
 */
export function HanjaAutocompleteFieldLogger() {
  const [mode, setMode] = useState<NonNullable<HanjaAutocompleteFieldProps["mode"]>>("broken");
  const { os, browser, ime, setOs, setBrowser, setIme } = useImeLoggerMeta();
  const [events, setEvents] = useState<ImeEventRecord[]>([]);
  const [fieldValue, setFieldValue] = useState("");
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listenersCleanupRef = useRef<(() => void) | null>(null);
  const eventsRef = useRef<ImeEventRecord[]>([]);
  const composingRef = useRef(false);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const profileId = useMemo(() => profileIdFromMeta(os, browser, ime), [os, browser, ime]);
  const scenario = CAPTURE_SCENARIOS[0];

  const flushToReact = useCallback((value: string) => {
    setEvents([...eventsRef.current]);
    setFieldValue(value);
  }, []);

  const scheduleFlush = useCallback(
    (value: string) => {
      if (flushTimerRef.current !== null) clearTimeout(flushTimerRef.current);
      flushTimerRef.current = setTimeout(() => {
        flushTimerRef.current = null;
        if (composingRef.current) return;
        flushToReact(value);
      }, 0);
    },
    [flushToReact],
  );

  const appendEvent = useCallback(
    (event: Event) => {
      const value = readEditableValue(event.target);
      eventsRef.current = [...eventsRef.current, serializeImeEvent(event, value)];

      if (event.type === "compositionstart" || eventLooksComposing(event)) {
        composingRef.current = true;
        if (flushTimerRef.current !== null) {
          clearTimeout(flushTimerRef.current);
          flushTimerRef.current = null;
        }
      }

      if (event.type === "compositionend") {
        composingRef.current = false;
        scheduleFlush(value);
        return;
      }

      if (
        composingRef.current &&
        "isComposing" in event &&
        (event as KeyboardEvent).isComposing === false &&
        !(event instanceof KeyboardEvent && event.keyCode === 229)
      ) {
        composingRef.current = false;
        scheduleFlush(value);
        return;
      }

      if (composingRef.current) {
        // Buffer only — React re-render mid-IME appends 金 after 김 instead of replacing.
        return;
      }

      flushToReact(value);
    },
    [flushToReact, scheduleFlush],
  );

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
    if (flushTimerRef.current !== null) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = null;
    composingRef.current = false;
    eventsRef.current = [];
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
      events: eventsRef.current.length > events.length ? eventsRef.current : events,
      capturedAt: new Date().toISOString(),
      scenarioId: SCENARIO_ID_BY_MODE[mode],
      source: "os-ime",
    });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 text-foreground">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Hanja autocomplete conflict (IME bug)</h1>
        <p className="text-sm text-muted-foreground">
          macOS 한자 변환(Option+Enter)은 composition 범위 위에서 「김」을 「金」으로{" "}
          <em>대체</em>합니다. 조합 중 React setState(로거·combobox query)가 나가면 범위가 깨져{" "}
          「김金」처럼 붙습니다. fixed 모드와 이 로거는 조합이 끝날 때까지 UI state를 버퍼링합니다.
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
          <span className="text-xs text-muted-foreground">
            (조합 중에는 이벤트가 버퍼링되어 로그가 잠시 멈출 수 있습니다)
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
        onValueChange={(value) => {
          // Field may call this after settle; keep display in sync without dropping buffered events.
          setFieldValue(value);
        }}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={async () => {
            flushToReact(inputRef.current?.value ?? fieldValue);
            await navigator.clipboard.writeText(formatImeTraceJson(buildTrace()));
            setStatus("클립보드에 복사했습니다.");
          }}
          disabled={eventsRef.current.length === 0 && events.length === 0}
        >
          JSON 복사
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={eventsRef.current.length === 0 && events.length === 0}
          onClick={() => {
            flushToReact(inputRef.current?.value ?? fieldValue);
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
        <h2 className="text-sm font-medium">
          Events ({eventsRef.current.length > events.length ? eventsRef.current.length : events.length}
          )
        </h2>
        <pre className="max-h-[28rem] overflow-auto rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed">
          {events.length === 0 && eventsRef.current.length === 0
            ? "아직 이벤트가 없습니다. fixed 모드에서 한자 변환을 시도해 보세요."
            : formatImeTraceJson(buildTrace())}
        </pre>
      </section>
    </div>
  );
}
