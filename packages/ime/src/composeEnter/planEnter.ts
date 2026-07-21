import type { EnterDuringCompositionFacet } from "../profiles";
import type { EventPlanStep } from "../_internal/eventPlan";
import type { ImeComposeSession } from "../_internal/session";
import {
  planConfirmAndEndComposition,
  type PlanConfirmFacts,
} from "../_internal/planConfirmComposition";

export type PlanEnterInput = {
  composing: boolean;
  facet: EnterDuringCompositionFacet;
  session?: ImeComposeSession;
  confirmFacts: PlanConfirmFacts;
};

const plainEnterKeydown = {
  kind: "keydown" as const,
  fields: { key: "Enter", code: "Enter", keyCode: 13, isComposing: false },
};

const plainEnterKeyup = {
  kind: "keyup" as const,
  fields: { key: "Enter", code: "Enter", keyCode: 13, isComposing: false },
};

/** Pure: Enter ordering by profile facet (and plain Enter when not composing). */
export function planEnter(input: PlanEnterInput): EventPlanStep[] {
  if (!input.composing || !input.session) {
    return [plainEnterKeydown, plainEnterKeyup];
  }

  const confirm = planConfirmAndEndComposition(input.session, input.confirmFacts);

  switch (input.facet) {
    case "webkit":
      return [...confirm, plainEnterKeydown, plainEnterKeyup];
    case "chromium":
      return [
        {
          kind: "keydown",
          fields: { key: "Process", code: "Enter", keyCode: 229, isComposing: true },
        },
        ...confirm,
        plainEnterKeyup,
      ];
    case "chromium-duplicate":
      return [
        {
          kind: "keydown",
          fields: { key: "Process", code: "Enter", keyCode: 229, isComposing: true },
        },
        ...confirm,
        plainEnterKeydown,
        plainEnterKeyup,
      ];
    case "chromium-apple":
      return [
        {
          kind: "keydown",
          fields: { key: "Enter", code: "Enter", keyCode: 229, isComposing: true },
        },
        ...confirm,
        plainEnterKeyup,
        plainEnterKeydown,
        plainEnterKeyup,
      ];
  }
}
