import { userEvent, type UserEvent } from "@testing-library/user-event";
import { type ActionStepDefinitionDict, type Locator } from "@siheom/core";

import { composeArrowLeft } from "../composeArrowLeft";
import { composeBackspace } from "../composeBackspace";
import { composeEnter } from "../composeEnter";
import { composeHangul, type ComposeHangulOptions } from "../composeHangul";
import { resolveProfile, type ImeProfile } from "../profiles";
import { segmentTypeText } from "../segmentTypeText";
import { isEditable, withPresentElement } from "../withPresentElement";

export type CreateImeActionsOptions = {
  user?: UserEvent;
  resolveElement?: "sync" | "waitFor";
  /** Profile id, profile object, or env `SIHEOM_IME_PROFILE` / default linux-chrome-ibus-hangul */
  profile?: string | ImeProfile;
  /** Passed through to `composeHangul` (e.g. stale controlled-input races). */
  settle?: ComposeHangulOptions["settle"];
  deferredUpdateRace?: ComposeHangulOptions["deferredUpdateRace"];
};

async function typeKeySegment(
  user: UserEvent,
  element: HTMLInputElement | HTMLTextAreaElement,
  text: string,
  profile: ImeProfile,
): Promise<void> {
  let i = 0;
  while (i < text.length) {
    if (text[i] === "{") {
      const end = text.indexOf("}", i + 1);
      if (end === -1) {
        await user.keyboard(text.slice(i));
        return;
      }
      const name = text.slice(i + 1, end);
      if (/^Backspace$/i.test(name)) {
        await composeBackspace(element);
      } else if (/^ArrowLeft$/i.test(name)) {
        await composeArrowLeft(element);
      } else if (/^Enter$/i.test(name)) {
        await composeEnter(element, profile);
      } else {
        await user.keyboard(`{${name}}`);
      }
      i = end + 1;
      continue;
    }

    let j = i + 1;
    while (j < text.length && text[j] !== "{") j++;
    await user.keyboard(text.slice(i, j));
    i = j;
  }
}

async function typeImeText(
  user: UserEvent,
  element: HTMLElement,
  text: string,
  profile: ImeProfile,
  composeOptions: Pick<ComposeHangulOptions, "settle" | "deferredUpdateRace">,
): Promise<void> {
  if (!isEditable(element)) {
    await user.type(element, text);
    return;
  }

  const segments = segmentTypeText(text);
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    if (!segment) continue;
    const next = segments[index + 1];

    if (segment.kind === "hangul") {
      const leaveOpen = next?.kind === "keys" && /\{(Backspace|ArrowLeft|Enter)\}/i.test(next.text);
      await composeHangul(element, segment.text, {
        commitFinal: !leaveOpen,
        profile,
        ...composeOptions,
      });
    } else {
      await typeKeySegment(user, element, segment.text, profile);
    }
  }
}

/**
 * Drop-in `fill` / `type` implementations for `overrideSiheom({ actions: createImeActions() })`.
 * Hangul runs use composition emulation; everything else uses `@testing-library/user-event`.
 */
export function createImeActions(options: CreateImeActionsOptions = {}) {
  const user = options.user ?? userEvent.setup();
  const resolveElement = options.resolveElement ?? "waitFor";
  const profile = resolveProfile(options.profile);
  const composeOptions = {
    settle: options.settle,
    deferredUpdateRace: options.deferredUpdateRace,
  };

  return {
    fill: async (target: Locator, text: string) =>
      withPresentElement(target, resolveElement, async (element) => {
        await user.click(element);
        await user.clear(element);
        await typeImeText(user, element, text, profile, composeOptions);
      }),
    type: async (target: Locator, text: string) =>
      withPresentElement(target, resolveElement, async (element) => {
        await user.click(element);
        await typeImeText(user, element, text, profile, composeOptions);
      }),
  } satisfies Pick<ActionStepDefinitionDict, "fill" | "type">;
}

export type ImeActions = ReturnType<typeof createImeActions>;
