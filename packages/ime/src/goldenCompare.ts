import type { ComposedEventRecord } from "./composeHangul";
import { toCriticalEvents } from "./composeHangul";

export function goldenToRecords(
  events: Array<{
    type: string;
    key: string | null;
    code: string | null;
    keyCode: number | null;
    isComposing: boolean | null;
    inputType: string | null;
    data: string | null;
    value: string;
  }>,
): ComposedEventRecord[] {
  return events.map((event) => ({
    type: event.type,
    key: event.key,
    code: event.code,
    keyCode: event.keyCode,
    isComposing: event.isComposing,
    inputType: event.inputType,
    data: event.data,
    value: event.value,
  }));
}

export function goldenCritical(
  events: Array<{
    type: string;
    key: string | null;
    code: string | null;
    keyCode: number | null;
    isComposing: boolean | null;
    inputType: string | null;
    data: string | null;
    value: string;
  }>,
) {
  return toCriticalEvents(goldenToRecords(events));
}

/** Slice golden/events from the first compositionstart (Hangul session after Latin, etc.). */
export function fromFirstCompositionStart<T extends { type: string }>(events: T[]): T[] {
  const index = events.findIndex((event) => event.type === "compositionstart");
  return index === -1 ? events : events.slice(index);
}
