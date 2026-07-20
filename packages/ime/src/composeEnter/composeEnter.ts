import type { ComposedEventRecord } from "../_internal";
import { confirmAndEndComposition, getImeSession, pushKeydown, pushKeyup } from "../_internal";
import type { ImeProfile } from "../profiles";

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
    pushKeydown(element, records, {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      isComposing: false,
    });
    pushKeyup(element, records, {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      isComposing: false,
    });
    return records;
  }

  switch (profile.enterDuringComposition) {
    case "webkit": {
      confirmAndEndComposition(element, records);
      pushKeydown(element, records, {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        isComposing: false,
      });
      pushKeyup(element, records, {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        isComposing: false,
      });
      break;
    }
    case "chromium": {
      pushKeydown(element, records, {
        key: "Process",
        code: "Enter",
        keyCode: 229,
        isComposing: true,
      });
      confirmAndEndComposition(element, records);
      pushKeyup(element, records, {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        isComposing: false,
      });
      break;
    }
    case "chromium-duplicate": {
      pushKeydown(element, records, {
        key: "Process",
        code: "Enter",
        keyCode: 229,
        isComposing: true,
      });
      confirmAndEndComposition(element, records);
      pushKeydown(element, records, {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        isComposing: false,
      });
      pushKeyup(element, records, {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        isComposing: false,
      });
      break;
    }
  }

  return records;
}
