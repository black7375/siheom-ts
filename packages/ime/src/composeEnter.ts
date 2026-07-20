import type { ComposedEventRecord } from "./composeHangulTypes";
import {
  applyPreedit,
  dispatch,
  setInputValue,
  snapshot,
} from "./composeHangulInternals";
import { clearImeSession, getImeSession } from "./imeSession";
import type { ImeProfile } from "./profiles";

function confirmAndEndComposition(
  element: HTMLInputElement | HTMLTextAreaElement,
  records: ComposedEventRecord[],
) {
  const session = getImeSession(element);
  if (!session?.composing) return;

  const caret = session.committed.length + session.preedit.length;
  const value = session.committed + session.preedit + session.suffix;
  applyPreedit(element, session.preedit, value, records, caret);

  dispatch(element, "compositionend", {
    bubbles: true,
    data: session.preedit,
  });
  records.push(
    snapshot(element, "compositionend", {
      data: session.preedit,
      value,
    }),
  );
  clearImeSession(element);
  setInputValue(element, value, caret);
}

function dispatchEnterKeydown(
  element: HTMLInputElement | HTMLTextAreaElement,
  records: ComposedEventRecord[],
  init: { key: string; code: string; keyCode: number; isComposing: boolean },
) {
  dispatch(element, "keydown", {
    bubbles: true,
    cancelable: true,
    ...init,
  });
  records.push(snapshot(element, "keydown", init));
}

function dispatchEnterKeyup(
  element: HTMLInputElement | HTMLTextAreaElement,
  records: ComposedEventRecord[],
  isComposing: boolean,
) {
  dispatch(element, "keyup", {
    bubbles: true,
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    isComposing,
  });
  records.push(
    snapshot(element, "keyup", {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      isComposing,
    }),
  );
}

/**
 * Enter while composing — order depends on profile facet (webkit vs chromium).
 * When not composing, fires a plain Enter keydown/keyup.
 */
export async function composeEnter(
  element: HTMLInputElement | HTMLTextAreaElement,
  profile: ImeProfile,
): Promise<ComposedEventRecord[]> {
  const records: ComposedEventRecord[] = [];
  const session = getImeSession(element);

  if (!session?.composing) {
    dispatchEnterKeydown(element, records, {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      isComposing: false,
    });
    dispatchEnterKeyup(element, records, false);
    return records;
  }

  switch (profile.enterDuringComposition) {
    case "webkit": {
      confirmAndEndComposition(element, records);
      dispatchEnterKeydown(element, records, {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        isComposing: false,
      });
      dispatchEnterKeyup(element, records, false);
      break;
    }
    case "chromium": {
      dispatchEnterKeydown(element, records, {
        key: "Process",
        code: "Enter",
        keyCode: 229,
        isComposing: true,
      });
      confirmAndEndComposition(element, records);
      dispatchEnterKeyup(element, records, false);
      break;
    }
    case "chromium-duplicate": {
      dispatchEnterKeydown(element, records, {
        key: "Process",
        code: "Enter",
        keyCode: 229,
        isComposing: true,
      });
      confirmAndEndComposition(element, records);
      dispatchEnterKeydown(element, records, {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        isComposing: false,
      });
      dispatchEnterKeyup(element, records, false);
      break;
    }
  }

  return records;
}
