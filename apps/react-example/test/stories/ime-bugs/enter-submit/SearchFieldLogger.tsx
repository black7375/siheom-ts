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
import { SearchField, type SearchFieldProps } from "./SearchField";

/**
 * Capture shell: type Hangul then Enter mid-composition on a real OS IME (esp. Safari).
 * Emulator coverage uses createImeActions({ profile: "macos-safari" }) in tests.
 */
export function SearchFieldLogger() {
  const [mode, setMode] = useState<NonNullable<SearchFieldProps["mode"]>>("broken");
  const [os, setOs] = useState("linux");
  const [browser, setBrowser] = useState("chrome");
  const [ime, setIme] = useState("ibus-hangul");
  const [events, setEvents] = useState<ImeEventRecord[]>([]);
  const [fieldValue, setFieldValue] = useState("");
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const profileId = useMemo(() => profileIdFromMeta(os, browser, ime), [os, browser, ime]);
  const scenarioId = `enter-submit-${mode}`;

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
        <h1 className="text-xl font-semibold">Enter-submit SearchField (IME bug)</h1>
        <p className="text-sm text-muted-foreground">
          조합 중 Enter(확정)가 검색 submit으로 가는지 확인합니다. Safari는 compositionend 후{" "}
          <code className="rounded bg-muted px-1">isComposing: false</code> Enter를 보냅니다.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-muted/30 p-3 text-sm" aria-label="캡처 지시">
        <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
          <li>
            Linux Chrome+ibus도 Safari처럼 compositionend 뒤 Enter(isComposing:false)가 옵니다
            (fixtures/linux-chrome-ibus-hangul 참고).
          </li>
          <li>검색란에 「김」을 조합한 뒤, 음절 확정용 Enter를 한 번 누릅니다.</li>
          <li>broken이면 submit 1, fixed(다음 Enter 무시)면 0이어야 합니다.</li>
          <li>진짜 검색은 fixed에서 Enter를 한 번 더 누릅니다.</li>
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

      <SearchField
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
