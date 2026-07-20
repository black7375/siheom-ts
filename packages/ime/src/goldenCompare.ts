import type { ComposedEventRecord } from "./composeHangul";
import { toCriticalEvents } from "./composeHangul";

export type GoldenEventRecord = {
  type: string;
  key: string | null;
  code: string | null;
  keyCode: number | null;
  isComposing: boolean | null;
  inputType: string | null;
  data: string | null;
  value: string;
};

export function goldenToRecords(events: GoldenEventRecord[]): ComposedEventRecord[] {
  return events.map((event) => ({ ...event }));
}

export function goldenCritical(events: GoldenEventRecord[]) {
  return toCriticalEvents(goldenToRecords(events));
}

/** Slice golden/events from the first compositionstart (Hangul session after Latin, etc.). */
export function fromFirstCompositionStart<T extends { type: string }>(events: T[]): T[] {
  const index = events.findIndex((event) => event.type === "compositionstart");
  return index === -1 ? events : events.slice(index);
}
