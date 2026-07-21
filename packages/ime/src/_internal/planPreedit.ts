import type { EventPlanStep } from "./eventPlan";

export type PlanPreeditFacts = {
  valueBefore: string;
  maxLength: number | null;
};

/** Pure: compositionupdate → beforeinput → setValue → input (+ optional maxLength arm). */
export function planPreedit(
  preedit: string,
  value: string,
  caret: number,
  facts: PlanPreeditFacts,
): EventPlanStep[] {
  const inputData = preedit === "" ? null : preedit;
  const steps: EventPlanStep[] = [
    { kind: "compositionupdate", data: preedit, value: facts.valueBefore },
    {
      kind: "beforeinput",
      fields: {
        inputType: "insertCompositionText",
        data: preedit,
        isComposing: true,
        value: facts.valueBefore,
      },
    },
    { kind: "setValue", value, caret },
    {
      kind: "input",
      fields: {
        inputType: "insertCompositionText",
        data: inputData,
        isComposing: true,
      },
    },
  ];

  if (facts.maxLength !== null && value.length > facts.maxLength) {
    steps.push({
      kind: "markPendingMaxLengthReject",
      preedit,
      overflowValue: value,
    });
  }

  return steps;
}
