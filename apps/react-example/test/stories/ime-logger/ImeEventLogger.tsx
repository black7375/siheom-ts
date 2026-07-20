import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  buildImeTrace,
  formatImeTraceJson,
  profileIdFromMeta,
  serializeImeEvent,
  type ImeEventRecord,
} from "./serializeImeEvent";

const LOGGED_EVENTS = [
  "keydown",
  "keyup",
  "keypress",
  "compositionstart",
  "compositionupdate",
  "compositionend",
  "beforeinput",
  "input",
] as const;

function readFieldValue(target: EventTarget | null): string {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return target.value;
  }
  return "";
}

export function ImeEventLogger() {
  const [os, setOs] = useState("linux");
  const [browser, setBrowser] = useState("chrome");
  const [ime, setIme] = useState("ibus-hangul");
  const [events, setEvents] = useState<ImeEventRecord[]>([]);
  const [fieldValue, setFieldValue] = useState("");
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const profileId = useMemo(() => profileIdFromMeta(os, browser, ime), [os, browser, ime]);

  const appendEvent = useCallback((event: Event) => {
    const value = readFieldValue(event.target);
    setFieldValue(value);
    setEvents((prev) => [...prev, serializeImeEvent(event, value)]);
  }, []);

  useEffect(() => {
    const node = inputRef.current;
    if (!node) return;

    for (const type of LOGGED_EVENTS) {
      node.addEventListener(type, appendEvent);
    }

    return () => {
      for (const type of LOGGED_EVENTS) {
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
    });
  }, [os, browser, ime, events]);

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
    anchor.download = `${profileId || "ime-trace"}-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("JSON 파일을 다운로드했습니다.");
  };

  const handleClear = () => {
    setEvents([]);
    setFieldValue("");
    setStatus("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 text-foreground">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">IME Event Logger</h1>
        <p className="text-sm text-muted-foreground">
          OS IME로 아래 필드에 입력하세요. composition / key / input 이벤트가 기록됩니다. 메타데이터를
          채운 뒤 JSON을 복사하거나 다운로드해 트레이스로 넘기면 됩니다.
        </p>
      </header>

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
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ime-logger-input">IME 입력</Label>
        <Input
          ref={inputRef}
          id="ime-logger-input"
          defaultValue=""
          onChange={(e) => setFieldValue(e.target.value)}
          placeholder="여기에 한글 등을 입력하세요"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <p className="text-xs text-muted-foreground">현재 value: {fieldValue || "(empty)"}</p>
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
            ? "아직 이벤트가 없습니다. 입력 필드에 포커스한 뒤 IME로 타이핑하세요."
            : formatImeTraceJson(buildTrace())}
        </pre>
      </section>
    </div>
  );
}
