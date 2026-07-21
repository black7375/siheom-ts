import { playEventPlan } from "./eventPlan";
import type { ImeTrace } from "./imeTrace";
import { readMaxLength } from "./maxLength";
import {
  planSafariInsertFromComposition,
  planSafariSyllableCommit,
  planSafariSyllableCommitCore,
  planRestartSafariComposition,
  type PlanSafariInsertOptions,
} from "./planSafari";

export type CommitSafariInsertOptions = PlanSafariInsertOptions;

/** Safari composition: commit a syllable via deleteCompositionText + insertFromComposition. */
export function commitSafariSyllable(trace: ImeTrace, syllable: string, committedValue: string) {
  playEventPlan(
    trace,
    planSafariSyllableCommit(syllable, committedValue, {
      valueBefore: trace.element.value,
      maxLength: readMaxLength(trace.element),
    }),
  );
}

/** deleteCompositionText + insertFromComposition (no compositionend). */
export function commitSafariInsertFromComposition(
  trace: ImeTrace,
  syllable: string,
  committedValue: string,
  options: CommitSafariInsertOptions = {},
) {
  playEventPlan(trace, planSafariInsertFromComposition(syllable, committedValue, options));
}

/** The delete + insertFromComposition + compositionend block, without the preedit echo. */
export function commitSafariSyllableCore(
  trace: ImeTrace,
  syllable: string,
  committedValue: string,
) {
  playEventPlan(trace, planSafariSyllableCommitCore(syllable, committedValue));
}

export function restartSafariComposition(trace: ImeTrace) {
  playEventPlan(trace, planRestartSafariComposition());
}
