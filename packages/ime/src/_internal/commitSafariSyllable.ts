import type { ComposedEventRecord } from "./types";
import { applyPreedit } from "./applyPreedit";
import { dispatch, pushCompositionStart, setInputValue, snapshot } from "./events";

/** Safari composition: commit a syllable via deleteCompositionText + insertFromComposition. */
export function commitSafariSyllable(
  element: HTMLInputElement | HTMLTextAreaElement,
  syllable: string,
  committedValue: string,
  records: ComposedEventRecord[],
) {
  applyPreedit(element, syllable, committedValue, records, committedValue.length);
  commitSafariSyllableCore(element, syllable, committedValue, records);
}

/** deleteCompositionText + insertFromComposition (no compositionend). */
export function commitSafariInsertFromComposition(
  element: HTMLInputElement | HTMLTextAreaElement,
  syllable: string,
  committedValue: string,
  records: ComposedEventRecord[],
) {
  dispatch(element, "beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: "deleteCompositionText",
    data: null,
    isComposing: true,
  });
  records.push(
    snapshot(element, "beforeinput", {
      inputType: "deleteCompositionText",
      data: null,
      isComposing: true,
      value: committedValue,
    }),
  );

  const cleared = committedValue.slice(0, committedValue.length - syllable.length);
  setInputValue(element, cleared, cleared.length);
  dispatch(element, "input", {
    bubbles: true,
    inputType: "deleteCompositionText",
    data: null,
    isComposing: true,
  });
  records.push(
    snapshot(element, "input", {
      inputType: "deleteCompositionText",
      data: null,
      isComposing: true,
      value: cleared,
    }),
  );

  dispatch(element, "beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: "insertFromComposition",
    data: syllable,
    isComposing: true,
  });
  records.push(
    snapshot(element, "beforeinput", {
      inputType: "insertFromComposition",
      data: syllable,
      isComposing: true,
      value: cleared,
    }),
  );

  setInputValue(element, committedValue, committedValue.length);
  dispatch(element, "input", {
    bubbles: true,
    inputType: "insertFromComposition",
    data: syllable,
    isComposing: true,
  });
  records.push(
    snapshot(element, "input", {
      inputType: "insertFromComposition",
      data: syllable,
      isComposing: true,
      value: committedValue,
    }),
  );
}

/** The delete + insertFromComposition + compositionend block, without the preedit echo. */
export function commitSafariSyllableCore(
  element: HTMLInputElement | HTMLTextAreaElement,
  syllable: string,
  committedValue: string,
  records: ComposedEventRecord[],
) {
  commitSafariInsertFromComposition(element, syllable, committedValue, records);

  dispatch(element, "compositionend", { bubbles: true, data: syllable });
  records.push(
    snapshot(element, "compositionend", {
      data: syllable,
      value: committedValue,
    }),
  );
}

export function restartSafariComposition(
  element: HTMLInputElement | HTMLTextAreaElement,
  records: ComposedEventRecord[],
) {
  pushCompositionStart(element, records);
}
