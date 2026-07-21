import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { LOGGED_EVENT_TYPES, readEditableValue } from "./recordInputEvents";
import {
  buildImeTrace,
  formatImeTraceJson,
  profileIdFromMeta,
  serializeImeEvent,
  type ImeEventRecord,
  type ImeTrace,
} from "./serializeImeEvent";
import { useImeLoggerMeta } from "./useImeLoggerMeta";

export type UseImeEventCaptureOptions<T extends HTMLElement = HTMLElement> = {
  scenarioId: string;
  /** Filename stem after profileId; default uses scenarioId. */
  downloadStem?: string;
  /**
   * `effect` — bind via useEffect on inputRef (+ listenerDeps).
   * `callback` — bind only through attachInputRef (e.g. remounting child fields).
   */
  attachment?: "effect" | "callback";
  /** Extra deps that remount effect-based listeners (e.g. mode). */
  listenerDeps?: unknown[];
  /** Customize clearing the input node; default clears `.value` or `textContent`. */
  clearField?: (input: T | null) => void;
};

function defaultClearField(input: HTMLElement | null) {
  if (!input) return;
  if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
    input.value = "";
  } else if (input.isContentEditable) {
    input.textContent = "";
  }
}

export function useImeEventCapture<T extends HTMLElement = HTMLElement>({
  scenarioId,
  downloadStem,
  attachment = "effect",
  listenerDeps = [],
  clearField = defaultClearField as (input: T | null) => void,
}: UseImeEventCaptureOptions<T>) {
  const { os, browser, ime, setOs, setBrowser, setIme } = useImeLoggerMeta();
  const [events, setEvents] = useState<ImeEventRecord[]>([]);
  const [fieldValue, setFieldValue] = useState("");
  const [status, setStatus] = useState("");
  const inputRef = useRef<T>(null);
  const listenersCleanupRef = useRef<(() => void) | null>(null);

  const profileId = useMemo(() => profileIdFromMeta(os, browser, ime), [os, browser, ime]);

  const appendEvent = useCallback((event: Event) => {
    const value = readEditableValue(event.target);
    setFieldValue(value);
    setEvents((prev) => [...prev, serializeImeEvent(event, value)]);
  }, []);

  const bindListeners = useCallback(
    (node: T) => {
      for (const type of LOGGED_EVENT_TYPES) {
        node.addEventListener(type, appendEvent);
      }
      return () => {
        for (const type of LOGGED_EVENT_TYPES) {
          node.removeEventListener(type, appendEvent);
        }
      };
    },
    [appendEvent],
  );

  const attachInputRef = useCallback(
    (node: T | null) => {
      listenersCleanupRef.current?.();
      listenersCleanupRef.current = null;
      inputRef.current = node;
      if (!node) return;
      listenersCleanupRef.current = bindListeners(node);
    },
    [bindListeners],
  );

  useEffect(() => {
    if (attachment !== "effect") return;
    const node = inputRef.current;
    if (!node) return;
    return bindListeners(node);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- listenerDeps is intentional remount key
  }, [attachment, bindListeners, ...listenerDeps]);

  const buildTrace = useCallback((): ImeTrace => {
    return buildImeTrace({
      os,
      browser,
      ime,
      events,
      capturedAt: new Date().toISOString(),
      scenarioId,
      source: "os-ime",
    });
  }, [os, browser, ime, events, scenarioId]);

  const clear = useCallback(() => {
    setEvents([]);
    setFieldValue("");
    setStatus("");
    clearField(inputRef.current);
    queueMicrotask(() => inputRef.current?.focus());
  }, [clearField]);

  const copyJson = useCallback(async () => {
    const json = formatImeTraceJson(buildTrace());
    await navigator.clipboard.writeText(json);
    setStatus("클립보드에 복사했습니다.");
  }, [buildTrace]);

  const downloadJson = useCallback(() => {
    const json = formatImeTraceJson(buildTrace());
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    const stem = downloadStem ?? scenarioId;
    anchor.download = `${profileId || "ime-trace"}-${stem}-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("JSON 파일을 다운로드했습니다.");
  }, [buildTrace, downloadStem, profileId, scenarioId]);

  return {
    events,
    fieldValue,
    setFieldValue,
    status,
    os,
    browser,
    ime,
    setOs,
    setBrowser,
    setIme,
    profileId,
    inputRef,
    attachInputRef,
    clear,
    copyJson,
    downloadJson,
    buildTrace,
  };
}
