import type { ComposedEventRecord } from "../_internal";
import { confirmAndEndComposition, getImeSession, ImeTrace } from "../_internal";
import type { ImeProfile } from "../profiles";

/**
 * Enter while composing — order depends on profile facet (webkit vs chromium).
 * When not composing, fires a plain Enter keydown/keyup.
 */
export async function composeEnter(
  element: HTMLInputElement | HTMLTextAreaElement,
  profile: ImeProfile,
): Promise<ComposedEventRecord[]> {
  const trace = new ImeTrace(element);
  const session = getImeSession(element);

  if (!session?.composing) {
    trace.keydown({
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      isComposing: false,
    });
    trace.keyup({
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      isComposing: false,
    });
    return trace.records;
  }

  switch (profile.enterDuringComposition) {
    case "webkit": {
      confirmAndEndComposition(trace);
      trace.keydown({
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        isComposing: false,
      });
      trace.keyup({
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        isComposing: false,
      });
      break;
    }
    case "chromium": {
      trace.keydown({
        key: "Process",
        code: "Enter",
        keyCode: 229,
        isComposing: true,
      });
      confirmAndEndComposition(trace);
      trace.keyup({
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        isComposing: false,
      });
      break;
    }
    case "chromium-duplicate": {
      trace.keydown({
        key: "Process",
        code: "Enter",
        keyCode: 229,
        isComposing: true,
      });
      confirmAndEndComposition(trace);
      trace.keydown({
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        isComposing: false,
      });
      trace.keyup({
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        isComposing: false,
      });
      break;
    }
    case "chromium-apple": {
      trace.keydown({
        key: "Enter",
        code: "Enter",
        keyCode: 229,
        isComposing: true,
      });
      confirmAndEndComposition(trace);
      trace.keyup({
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        isComposing: false,
      });
      trace.keydown({
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        isComposing: false,
      });
      trace.keyup({
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        isComposing: false,
      });
      break;
    }
  }

  return trace.records;
}
