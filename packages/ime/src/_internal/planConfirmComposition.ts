import type { ImeComposeSession } from "./session";
import type { EventPlanStep } from "./eventPlan";
import { planPreedit } from "./planPreedit";

export type PlanConfirmFacts = {
  valueBefore: string;
  maxLength: number | null;
};

/** Pure: preedit pulse + compositionend + clear session + settle caret. */
export function planConfirmAndEndComposition(
  session: ImeComposeSession,
  facts: PlanConfirmFacts,
  options: { pulse?: boolean } = {},
): EventPlanStep[] {
  if (!session.composing) return [];

  const caret = session.committed.length + session.preedit.length;
  const value = session.committed + session.preedit + session.suffix;
  const pulse = options.pulse !== false;

  return [
    ...(pulse ? planPreedit(session.preedit, value, caret, facts) : []),
    { kind: "compositionend", data: session.preedit, value },
    { kind: "clearSession" },
    { kind: "setValue", value, caret },
  ];
}
