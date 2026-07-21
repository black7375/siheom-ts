import { applyPreedit } from "./applyPreedit";
import { setInputValue } from "./events";
import type { ImeTrace } from "./imeTrace";

/** Safari composition: commit a syllable via deleteCompositionText + insertFromComposition. */
export function commitSafariSyllable(trace: ImeTrace, syllable: string, committedValue: string) {
  applyPreedit(trace, syllable, committedValue, committedValue.length);
  commitSafariSyllableCore(trace, syllable, committedValue);
}

export type CommitSafariInsertOptions = {
  /** Caret after clearing composition text (default: end of cleared value). */
  clearedCaret?: number;
  /** Caret after re-inserting (default: end of committedValue). */
  finalCaret?: number;
};

/** deleteCompositionText + insertFromComposition (no compositionend). */
export function commitSafariInsertFromComposition(
  trace: ImeTrace,
  syllable: string,
  committedValue: string,
  options: CommitSafariInsertOptions = {},
) {
  const { element } = trace;
  const cleared = committedValue.slice(0, committedValue.length - syllable.length);
  const clearedCaret = options.clearedCaret ?? cleared.length;
  const finalCaret = options.finalCaret ?? committedValue.length;

  trace.beforeInput({
    inputType: "deleteCompositionText",
    data: null,
    isComposing: true,
    value: committedValue,
  });

  setInputValue(element, cleared, clearedCaret);
  trace.input({
    inputType: "deleteCompositionText",
    data: null,
    isComposing: true,
    value: cleared,
  });

  trace.beforeInput({
    inputType: "insertFromComposition",
    data: syllable,
    isComposing: true,
    value: cleared,
  });

  setInputValue(element, committedValue, finalCaret);
  trace.input({
    inputType: "insertFromComposition",
    data: syllable,
    isComposing: true,
    value: committedValue,
  });
}

/** The delete + insertFromComposition + compositionend block, without the preedit echo. */
export function commitSafariSyllableCore(
  trace: ImeTrace,
  syllable: string,
  committedValue: string,
) {
  commitSafariInsertFromComposition(trace, syllable, committedValue);
  trace.compositionEnd(syllable, committedValue);
}

export function restartSafariComposition(trace: ImeTrace) {
  trace.compositionStart();
}
