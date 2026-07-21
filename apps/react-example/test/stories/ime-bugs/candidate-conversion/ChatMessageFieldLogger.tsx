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
import { useImeLoggerMeta } from "../../ime-logger/useImeLoggerMeta";
import { ChatMessageField, type ChatMessageFieldProps } from "./ChatMessageField";

const CONVERSION_CAPTURE_SCENARIOS = [
  {
    id: "pinyin-raw-enter",
    title: "중국어 Pinyin — 후보 없이 원문 확정",
    steps: [
      "중국어 IME(예: Pinyin)를 켠 채 영문 hello를 입력합니다.",
      "후보 창이 뜨면 Enter로 후보를 고르지 않고 버퍼 원문을 확정합니다.",
      "broken이면 메시지가 전송되고, fixed면 send 0이어야 합니다.",
    ],
    reference: "https://meta.discourse.org/t/ime-composition-enter-key-triggers-message-send-instead-of-confirming-input/385840",
  },
  {
    id: "pinyin-candidate-enter",
    title: "중국어 Pinyin — 후보 선택 확정",
    steps: [
      "nihao 등을 입력해 후보(你好 등)를 띄웁니다.",
      "숫자키나 화살표로 후보를 고른 뒤 Enter로 확정합니다.",
      "확정 Enter가 send로 가지 않는지 확인합니다.",
    ],
  },
  {
    id: "japanese-romaji",
    title: "일본어 — 로마자 → 한자 후보",
    steps: [
      "일본어 IME로 nihongo 등을 입력해 日本語 후보를 띄웁니다.",
      "Enter로 후보를 확정합니다.",
      "확정 전 send가 발생하면 재현 성공(broken)입니다.",
    ],
  },
  {
    id: "korean-hanja",
    title: "한글 → 한자 변환",
    steps: [
      "한글을 입력한 뒤 한자 변환(한/영 키 등)으로 후보 창을 띄웁니다.",
      "Enter 또는 숫자키로 한자를 확정합니다.",
      "확정 키가 send로 가지 않는지 확인합니다.",
    ],
  },
] as const;

/**
 * Capture shell for conversion-type IME (candidate window).
 * OS golden traces feed a future @siheom/ime conversion layer — not Hangul composition.
 */
export function ChatMessageFieldLogger() {
  const [mode, setMode] = useState<NonNullable<ChatMessageFieldProps["mode"]>>("broken");
  const [scenarioId, setScenarioId] = useState<string>(CONVERSION_CAPTURE_SCENARIOS[0].id);
  const { os, browser, ime, setOs, setBrowser, setIme } = useImeLoggerMeta();
  const [events, setEvents] = useState<ImeEventRecord[]>([]);
  const [fieldValue, setFieldValue] = useState("");
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const profileId = useMemo(() => profileIdFromMeta(os, browser, ime), [os, browser, ime]);
  const fullScenarioId = `candidate-conversion-${scenarioId}-${mode}`;
  const activeScenario = CONVERSION_CAPTURE_SCENARIOS.find((s) => s.id === scenarioId);

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
      scenarioId: fullScenarioId,
      source: "os-ime",
    });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 text-foreground">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Candidate conversion — chat Enter (IME bug)</h1>
        <p className="text-sm text-muted-foreground">
          후보-변환형 IME(Pinyin, 일본어, 한자)에서 Enter는 후보 확정 또는 preedit 원문 입력용입니다.
          채팅 UI가 <code className="rounded bg-muted px-1">!isComposing</code> Enter를 전송으로 처리하면
          CJK 입력이 깨집니다. Hangul 조합형과 이벤트 시퀀스가 겹치지만, 후보 창 단계가 더 깁니다.
        </p>
      </header>

      <section
        className="rounded-lg border border-border bg-muted/30 p-3 text-sm"
        aria-label="캡처 시나리오"
      >
        <p className="mb-2 font-medium">시나리오 선택</p>
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="변환 시나리오">
          {CONVERSION_CAPTURE_SCENARIOS.map((scenario) => (
            <label key={scenario.id} className="flex cursor-pointer items-start gap-2">
              <input
                type="radio"
                name="conversion-scenario"
                className="mt-1"
                checked={scenarioId === scenario.id}
                onChange={() => {
                  setScenarioId(scenario.id);
                  clear();
                }}
              />
              <span>
                <span className="font-medium">{scenario.title}</span>
                <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-muted-foreground">
                  {scenario.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                {"reference" in scenario && scenario.reference ? (
                  <a
                    href={scenario.reference}
                    className="mt-1 inline-block text-xs text-primary underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    참고 사례
                  </a>
                ) : null}
              </span>
            </label>
          ))}
        </div>
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
        scenario: <code className="rounded bg-muted px-1.5 py-0.5">{activeScenario?.id}</code>
        {" · "}
        mode: <code className="rounded bg-muted px-1.5 py-0.5">{mode}</code>
      </p>

      <ChatMessageField key={mode} mode={mode} inputRef={inputRef} onValueChange={setFieldValue} />

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
            anchor.download = `${profileId}-${fullScenarioId}-${Date.now()}.json`;
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
          {events.length === 0 ? "아직 이벤트가 없습니다." : formatImeTraceJson(buildTrace())}
        </pre>
      </section>
    </div>
  );
}
