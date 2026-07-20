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
import { FocusStealCombobox, type FocusStealComboboxProps } from "./FocusStealCombobox";

const SCENARIO_ID = "focus-steal-hangul";

/**
 * Storybook capture shell: broken/fixed combobox + IME event log.
 * Type Hangul with a real OS IME; broken mode aborts composition by focusing options.
 */
export function FocusStealComboboxLogger() {
  const [mode, setMode] = useState<NonNullable<FocusStealComboboxProps["mode"]>>("broken");
  const [os, setOs] = useState("linux");
  const [browser, setBrowser] = useState("chrome");
  const [ime, setIme] = useState("ibus-hangul");
  const [events, setEvents] = useState<ImeEventRecord[]>([]);
  const [fieldValue, setFieldValue] = useState("");
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const profileId = useMemo(() => profileIdFromMeta(os, browser, ime), [os, browser, ime]);

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
      scenarioId: SCENARIO_ID,
      source: "os-ime",
    });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatImeTraceJson(buildTrace()));
    setStatus("클립보드에 복사했습니다.");
  };

  const handleDownload = () => {
    const json = formatImeTraceJson(buildTrace());
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${profileId || "ime-trace"}-${SCENARIO_ID}-${mode}-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("JSON 파일을 다운로드했습니다.");
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 text-foreground">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Focus-steal Combobox (IME bug)</h1>
        <p className="text-sm text-muted-foreground">
          broken 모드에서는 매 <code className="rounded bg-muted px-1">input</code>마다 첫 제안으로
          포커스가 이동합니다. 한글 조합이 끊기면 자모가 풀어진 트레이스를 캡처하세요.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-muted/30 p-3 text-sm" aria-label="캡처 지시">
        <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
          <li>모드를 broken으로 둡니다 (기본값).</li>
          <li>검색란에 한글로 「김태희」를 입력합니다.</li>
          <li>조합이 중간에 풀리거나 포커스가 옵션으로 가는지 확인합니다.</li>
          <li>JSON을 복사·다운로드해 fixtures에 저장합니다.</li>
          <li>같은 입력을 fixed 모드에서도 한 번 캡처해 대비합니다.</li>
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

      <FocusStealCombobox
        key={mode}
        mode={mode}
        inputRef={inputRef}
        onValueChange={setFieldValue}
      />

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleCopy} disabled={events.length === 0}>
          JSON 복사
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleDownload}
          disabled={events.length === 0}
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
            ? "아직 이벤트가 없습니다. broken 모드에서 한글로 입력해 보세요."
            : formatImeTraceJson(buildTrace())}
        </pre>
      </section>
    </div>
  );
}
