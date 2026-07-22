import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { formatImeTraceJson } from "./serializeImeEvent";
import { useImeEventCapture, type UseImeEventCaptureOptions } from "./useImeEventCapture";

export type ImeCaptureApi<T extends HTMLElement = HTMLElement> = ReturnType<
  typeof useImeEventCapture<T>
>;

export type ImeCaptureShellProps<T extends HTMLElement = HTMLElement> = {
  title: string;
  description: ReactNode;
  scenarioId: string;
  downloadStem?: string;
  attachment?: UseImeEventCaptureOptions<T>["attachment"];
  listenerDeps?: UseImeEventCaptureOptions<T>["listenerDeps"];
  clearField?: UseImeEventCaptureOptions<T>["clearField"];
  /** Above meta (scenario picker, instructions, mode toolbar). */
  beforeField?: (capture: ImeCaptureApi<T>) => ReactNode;
  /** Demo field. */
  children: (capture: ImeCaptureApi<T>) => ReactNode;
  /** Extra bits after the scenarioId segment (e.g. mode). */
  profileExtra?: ReactNode;
  emptyLogMessage?: string;
  /** Replace default `scenarioId: …` segment. */
  scenarioLabel?: ReactNode;
  /** Merged into downloaded/copied JSON (e.g. Slate debug trace). */
  traceExtra?: UseImeEventCaptureOptions<T>["traceExtra"];
  onEventRecorded?: UseImeEventCaptureOptions<T>["onEventRecorded"];
};

/**
 * Shared IME OS-capture chrome: meta fields, copy/download/clear, event log.
 * Demo-specific UI goes in `beforeField` and `children`.
 */
export function ImeCaptureShell<T extends HTMLElement = HTMLElement>({
  title,
  description,
  scenarioId,
  downloadStem,
  attachment,
  listenerDeps,
  clearField,
  beforeField,
  children,
  profileExtra,
  emptyLogMessage = "아직 이벤트가 없습니다. 시나리오를 고른 뒤 IME로 타이핑하세요.",
  scenarioLabel,
  traceExtra,
  onEventRecorded,
}: ImeCaptureShellProps<T>) {
  const capture = useImeEventCapture<T>({
    scenarioId,
    downloadStem,
    attachment,
    listenerDeps,
    clearField,
    traceExtra,
    onEventRecorded,
  });

  const {
    events,
    status,
    os,
    browser,
    ime,
    setOs,
    setBrowser,
    setIme,
    profileId,
    clear,
    copyJson,
    downloadJson,
    buildTrace,
  } = capture;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 text-foreground">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>

      {beforeField?.(capture)}

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
        {scenarioLabel !== undefined ? (
          <>
            {" · "}
            {scenarioLabel}
          </>
        ) : (
          <>
            {" · "}
            scenarioId: <code className="rounded bg-muted px-1.5 py-0.5">{scenarioId}</code>
          </>
        )}
        {profileExtra}
      </p>

      {children(capture)}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={copyJson} disabled={events.length === 0}>
          JSON 복사
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={downloadJson}
          disabled={events.length === 0}
        >
          JSON 다운로드
        </Button>
        <Button type="button" variant="ghost" onClick={clear}>
          지우기
        </Button>
      </div>

      {status ? (
        <p className="text-sm text-muted-foreground" role="status" aria-label="캡처 상태">
          {status}
        </p>
      ) : null}

      <section className="flex flex-col gap-2" aria-label="이벤트 로그">
        <h2 className="text-sm font-medium">Events ({events.length})</h2>
        <pre className="max-h-[28rem] overflow-auto rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed">
          {events.length === 0 ? emptyLogMessage : formatImeTraceJson(buildTrace())}
        </pre>
      </section>
    </div>
  );
}

/** Pre-bound generic alias for input-based capture shells (JSX cannot close `</Tag<T>>`). */
export const ImeCaptureShellInput = ImeCaptureShell<HTMLInputElement>;
