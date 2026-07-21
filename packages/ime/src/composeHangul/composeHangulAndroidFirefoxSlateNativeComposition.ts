import type { ComposedEventRecord } from "../_internal";
import { ContentEditableImeTrace } from "../_internal/contentEditableImeTrace";
import { readEditableText } from "../_internal/editableElement";
import { settleAfterPreedit } from "./settle";

export type NativeCompositionStep = {
  index: number;
  phase: "native-paint" | "reconcile";
  value: string;
};

export type NativeCompositionResult = {
  records: ComposedEventRecord[];
  /** DOM text observed at native-paint (browser) and reconcile (Slate) per step. */
  visibleTimeline: NativeCompositionStep[];
  final: string;
};

/**
 * Faithful Android-Firefox composition model for contenteditable editors.
 *
 * The device flicker (`가가나`, `가나가나ㄷ`) is a *native browser* artifact: after the editor
 * commits a syllable (`가`), the OS IME sends a **cumulative** preedit (`가나`) for the next
 * syllable, and native contenteditable paints it *after* the committed text → `가` + `가나` =
 * `가가나`, until the editor reconciles. Golden event replay never shows it (no native paint);
 * dispatching to Slate alone never shows it (Slate applies from `data`). This model performs the
 * native DOM writeback (`committed + preedit`) so the editor sees what the device Slate saw, then
 * dispatches the composition events and lets the editor reconcile.
 *
 * `intents` are the IME's composition intents for the run (from a device capture until a
 * generative Hangul-IME model lands). Each entry drives one native paint + event pulse; `commit`
 * entries fire `compositionend` and become the new committed prefix.
 *
 * See `docs/research/slate-closed-loop-emulator.md`.
 */
export type CompositionIntent =
  | { kind: "start" }
  | { kind: "update"; data: string }
  | { kind: "commit"; data: string };

function placeCaretAtEnd(node: Text): void {
  const doc = node.ownerDocument;
  const selection = doc.getSelection();
  if (!selection) return;
  const range = doc.createRange();
  range.setStart(node, node.data.length);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

export async function composeHangulAndroidFirefoxSlateNativeComposition(
  element: HTMLElement,
  intents: CompositionIntent[],
): Promise<NativeCompositionResult> {
  const trace = new ContentEditableImeTrace(element);
  element.focus();

  const visibleTimeline: NativeCompositionStep[] = [];
  let stepIndex = 0;
  // The browser's single composing text node, sitting after the committed content.
  let composingNode: Text | null = null;

  for (const intent of intents) {
    if (intent.kind === "start") {
      trace.keydown({ key: "Process", code: "", keyCode: 229, isComposing: readEditableText(element) !== "" });
      trace.compositionStart("");
      composingNode = null;
      continue;
    }

    if (intent.kind === "update") {
      trace.compositionUpdate(intent.data);
      trace.beforeInput({ inputType: "insertCompositionText", data: intent.data, isComposing: true });
      // Browser native paint: replace the composing node's text (cumulative preedit) in place,
      // after the committed content — no mid-composition reconcile (device holds the value).
      if (!composingNode || !composingNode.isConnected) {
        composingNode = element.ownerDocument.createTextNode(intent.data);
        element.appendChild(composingNode);
      } else {
        composingNode.data = intent.data;
      }
      placeCaretAtEnd(composingNode);
      visibleTimeline.push({ index: stepIndex, phase: "native-paint", value: readEditableText(element) });
      trace.input({ inputType: "insertCompositionText", data: intent.data, isComposing: true });
      stepIndex++;
      continue;
    }

    // commit — now let Slate reconcile the composition into its model.
    trace.compositionEnd(intent.data);
    await settleAfterPreedit("macrotask");
    visibleTimeline.push({ index: stepIndex - 1, phase: "reconcile", value: readEditableText(element) });
    composingNode = null;
  }

  return { records: trace.records, visibleTimeline, final: readEditableText(element) };
}

/** Extract Android composition intents from a device capture's raw events. */
export function compositionIntentsFromEvents(
  events: readonly { type: string; data: string | null }[],
): CompositionIntent[] {
  const intents: CompositionIntent[] = [];
  for (const event of events) {
    if (event.type === "compositionstart") {
      intents.push({ kind: "start" });
    } else if (event.type === "compositionupdate" && event.data) {
      intents.push({ kind: "update", data: event.data });
    } else if (event.type === "compositionend" && event.data) {
      intents.push({ kind: "commit", data: event.data });
    }
  }
  return intents;
}
