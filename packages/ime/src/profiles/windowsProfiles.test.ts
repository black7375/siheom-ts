import { describe, expect, it } from "vitest";
import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  overrideSiheom,
  query,
} from "@siheom/core";

import { attachImeRecorder } from "../attachImeRecorder";
import { composeEnter } from "../composeEnter";
import { composeHangul } from "../composeHangul";
import { createImeActions } from "../createImeActions";
import { fromFirstCompositionStart, goldenCritical } from "../goldenCritical";
import { resolveProfile } from "../profiles";
import { toCriticalEvents } from "../toCriticalEvents";

import msContinuous from "../../fixtures/windows-chrome-ms/continuous-hangul.json";
import msMixed from "../../fixtures/windows-chrome-ms/mixed-en-ko.json";
import msBackspace from "../../fixtures/windows-chrome-ms/backspace-mid.json";
import msArrow from "../../fixtures/windows-chrome-ms/arrow-edit-mid.json";
import ngsContinuous from "../../fixtures/windows-chrome-ngs/continuous-hangul.json";
import ngsEnterSubmit from "../../fixtures/windows-chrome-ngs/enter-submit-broken.json";
import ngsMixed from "../../fixtures/windows-chrome-ngs/mixed-en-ko.json";
import ngsBackspace from "../../fixtures/windows-chrome-ngs/backspace-mid.json";
import ngsArrow from "../../fixtures/windows-chrome-ngs/arrow-edit-mid.json";
import ngsCoverageChosung from "../../fixtures/windows-chrome-ngs/sebeol-coverage-chosung.json";
import ngsCoverageJungseong from "../../fixtures/windows-chrome-ngs/sebeol-coverage-jungseong.json";
import ngsCoverageCompoundJong from "../../fixtures/windows-chrome-ngs/sebeol-coverage-compound-jong.json";
import ngsCoverageYa from "../../fixtures/windows-chrome-ngs/sebeol-coverage-ya.json";
import firefoxContinuous from "../../fixtures/windows-firefox-ms/continuous-hangul.json";
import firefoxEnterSubmit from "../../fixtures/windows-firefox-ms/enter-submit-broken.json";
import firefoxMixed from "../../fixtures/windows-firefox-ms/mixed-en-ko.json";
import firefoxBackspace from "../../fixtures/windows-firefox-ms/backspace-mid.json";
import firefoxArrow from "../../fixtures/windows-firefox-ms/arrow-edit-mid.json";

function withRecordedInput(
  run: (input: HTMLInputElement, recorder: ReturnType<typeof attachImeRecorder>) => Promise<void>,
) {
  return async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const recorder = attachImeRecorder(input);
    try {
      await run(input, recorder);
    } finally {
      recorder.detach();
      input.remove();
    }
  };
}

type RecordedEvent = ReturnType<typeof attachImeRecorder>["events"][number];

/** Slice from the Hangul compositionstart (Ngs mixed captures Latin via composition). */
function eventsFromHangulCompositionStart(events: RecordedEvent[]): RecordedEvent[] {
  const hangulUpdateIndex = events.findIndex(
    (event) =>
      event.type === "compositionupdate" &&
      typeof event.data === "string" &&
      /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(event.data),
  );
  if (hangulUpdateIndex < 0) return fromFirstCompositionStart(events);
  let start = hangulUpdateIndex;
  while (start > 0 && events[start - 1]?.type !== "compositionstart") start -= 1;
  if (events[start]?.type !== "compositionstart" && start > 0) start -= 1;
  return events.slice(start);
}

async function renderNamedInput(recorderRef: {
  current: ReturnType<typeof attachImeRecorder> | undefined;
}): Promise<void> {
  document.body.innerHTML = "";
  const label = document.createElement("label");
  label.append("이름");
  const input = document.createElement("input");
  label.append(input);
  document.body.append(label);
  recorderRef.current = attachImeRecorder(input);
}

function setupType(profile: string) {
  const recorderRef: { current: ReturnType<typeof attachImeRecorder> | undefined } = {
    current: undefined,
  };

  const { runSiheom, actions, assertions, given } = overrideSiheom(
    {
      actions: createDefaultActions(),
      assertions: createDefaultAssertions(),
      givens: {
        render: () => renderNamedInput(recorderRef),
      },
      effects: defaultEffects,
    },
    {
      actions: createImeActions({ profile }),
    },
  );

  return { runSiheom, actions, assertions, given, recorderRef };
}

async function expectMixedHangulCriticalMatches(options: {
  profile: string;
  golden: { events: RecordedEvent[] };
  text: string;
  expected: string;
}): Promise<void> {
  const { runSiheom, actions, assertions, given, recorderRef } = setupType(options.profile);

  await runSiheom(
    given.render(),
    actions.type(query.textbox("이름"), options.text),
    assertions.value(query.textbox("이름"), options.expected),
  );

  const recorded = recorderRef.current!.events;
  expect(toCriticalEvents(eventsFromHangulCompositionStart(recorded))).toEqual(
    goldenCritical(eventsFromHangulCompositionStart(options.golden.events)),
  );
  recorderRef.current!.detach();
}

async function expectTypedScriptCriticalMatches(options: {
  profile: string;
  golden: { events: RecordedEvent[] };
  script: string;
  expected: string;
}): Promise<void> {
  const { runSiheom, actions, assertions, given, recorderRef } = setupType(options.profile);

  await runSiheom(
    given.render(),
    actions.type(query.textbox("이름"), options.script),
    assertions.value(query.textbox("이름"), options.expected),
  );

  expect(toCriticalEvents(recorderRef.current!.events)).toEqual(
    goldenCritical(options.golden.events),
  );
  recorderRef.current!.detach();
}

describe("Windows IME profiles (MS / Ngs / Firefox)", () => {
  it("resolves windows-chrome-ms and windows-chrome-ngs as chromium-duplicate composition", () => {
    expect(resolveProfile("windows-chrome-ms")).toMatchObject({
      enterDuringComposition: "chromium-duplicate",
      hangulKeyEventKey: "process",
      hangulComposeMode: "composition",
      hangulCompositionBoundary: "syllable",
      hangulKeyboard: "dubeolsik",
      postCompositionEndInput: false,
    });
    expect(resolveProfile("windows-chrome-ngs")).toMatchObject({
      enterDuringComposition: "chromium-duplicate",
      hangulKeyEventKey: "process",
      hangulComposeMode: "composition",
      hangulCompositionBoundary: "syllable",
      hangulKeyboard: "sebeolsik-ngs",
      postCompositionEndInput: false,
    });
  });

  it("resolves windows-firefox-ms as webkit Enter (compositionend then Enter 13)", () => {
    expect(resolveProfile("windows-firefox-ms")).toMatchObject({
      enterDuringComposition: "webkit",
      hangulKeyEventKey: "process",
      hangulComposeMode: "composition",
      hangulCompositionBoundary: "syllable",
      hangulKeyboard: "dubeolsik",
      postCompositionEndInput: true,
    });
  });

  it("matches windows-chrome-ms continuous-hangul critical fields for 김태희", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "김태희", { profile: "windows-chrome-ms" });
    expect(input.value).toBe("김태희");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(msContinuous.events));

    input.remove();
  });

  it("matches windows-chrome-ngs continuous-hangul critical fields for 김태희", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "김태희", { profile: "windows-chrome-ngs" });
    expect(input.value).toBe("김태희");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(ngsContinuous.events));

    input.remove();
  });

  it.each([
    {
      label: "chosung",
      text: "가나다라마바사아자차카타파하",
      golden: ngsCoverageChosung,
    },
    {
      label: "jungseong",
      text: "개걔거게겨고교구규그기",
      golden: ngsCoverageJungseong,
    },
    {
      label: "compound-jong",
      text: "과괘괴궈궤귀의각갂간갇갈감갑값갓갔강",
      golden: ngsCoverageCompoundJong,
    },
    {
      label: "ya",
      text: "갸",
      golden: ngsCoverageYa,
    },
  ] as const)(
    "matches windows-chrome-ngs sebeol coverage $label critical fields",
    async ({ text, golden }) => {
      const input = document.createElement("input");
      document.body.append(input);

      const events = await composeHangul(input, text, { profile: "windows-chrome-ngs" });
      expect(input.value).toBe(text);
      expect(toCriticalEvents(events)).toEqual(goldenCritical(golden.events));

      input.remove();
    },
  );

  // TipTap enter fixture for Ngs was captured with 2-set codes; use enter-submit (세벌식) golden.
  it("windows-chrome-ngs enter-submit: Hangul then Enter matches OS golden critical path", async () => {
    await withRecordedInput(async (input, recorder) => {
      await composeHangul(input, "김", {
        commitFinal: false,
        profile: "windows-chrome-ngs",
      });
      await composeEnter(input, resolveProfile("windows-chrome-ngs"));

      expect(input.value).toBe("김");
      expect(toCriticalEvents(recorder.events)).toEqual(goldenCritical(ngsEnterSubmit.events));
    })();
  });

  it("windows-firefox-ms Enter during composition is compositionend then Enter 13", async () => {
    await withRecordedInput(async (input, recorder) => {
      await composeHangul(input, "김", {
        commitFinal: false,
        profile: "windows-firefox-ms",
      });
      await composeEnter(input, resolveProfile("windows-firefox-ms"));

      const types = toCriticalEvents(recorder.events).map((event) => ({
        type: event.type,
        key: event.key,
        code: event.code,
        keyCode: event.keyCode,
        isComposing: event.isComposing,
      }));
      const endIndex = types.findIndex((event) => event.type === "compositionend");
      const processEnter = types.findIndex(
        (event) =>
          event.type === "keydown" &&
          event.key === "Process" &&
          event.code === "Enter" &&
          event.keyCode === 229,
      );
      const enterIndex = types.findIndex(
        (event) => event.type === "keydown" && event.key === "Enter" && event.keyCode === 13,
      );

      expect(endIndex).toBeGreaterThan(-1);
      expect(enterIndex).toBeGreaterThan(endIndex);
      expect(processEnter).toBe(-1);
      expect(types[enterIndex]?.isComposing).toBe(false);
    })();
  });

  it("matches windows-firefox-ms continuous-hangul critical fields for 김태희", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "김태희", { profile: "windows-firefox-ms" });
    expect(input.value).toBe("김태희");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(firefoxContinuous.events));

    input.remove();
  });

  it("windows-firefox-ms enter-submit: Hangul then Enter matches OS golden critical path", async () => {
    await withRecordedInput(async (input, recorder) => {
      await composeHangul(input, "김", {
        commitFinal: false,
        profile: "windows-firefox-ms",
      });
      await composeEnter(input, resolveProfile("windows-firefox-ms"));

      expect(input.value).toBe("김");
      expect(toCriticalEvents(recorder.events)).toEqual(goldenCritical(firefoxEnterSubmit.events));
    })();
  });

  it.each([
    {
      profile: "windows-chrome-ms",
      golden: msMixed,
      text: "hello 김태희",
      expected: "hello 김태희",
    },
    { profile: "windows-chrome-ngs", golden: ngsMixed, text: "hello 안녕", expected: "hello 안녕" },
    {
      profile: "windows-firefox-ms",
      golden: firefoxMixed,
      text: "hello 김태희",
      expected: "hello 김태희",
    },
  ] as const)(
    "$profile mixed-en-ko: Hangul portion matches golden critical fields",
    ({ profile, golden, text, expected }) =>
      expectMixedHangulCriticalMatches({ profile, golden, text, expected }),
  );

  it.each([
    {
      profile: "windows-chrome-ms",
      golden: msBackspace,
      script: "김태희{Backspace}{Backspace}{Backspace}{Backspace}철수",
    },
    {
      profile: "windows-chrome-ngs",
      golden: ngsBackspace,
      // 세벌식: 희→ㅎ→empty (2) + delete 태 (1) = 3 Backspaces to leave 김
      script: "김태희{Backspace}{Backspace}{Backspace}철수",
    },
    {
      profile: "windows-firefox-ms",
      golden: firefoxBackspace,
      script: "김태희{Backspace}{Backspace}{Backspace}{Backspace}철수",
    },
  ] as const)(
    "$profile backspace-mid matches golden critical fields",
    ({ profile, golden, script }) =>
      expectTypedScriptCriticalMatches({
        profile,
        golden,
        script,
        expected: "김철수",
      }),
  );

  it.each([
    { profile: "windows-chrome-ms", golden: msArrow },
    { profile: "windows-chrome-ngs", golden: ngsArrow },
    { profile: "windows-firefox-ms", golden: firefoxArrow },
  ] as const)("$profile arrow-edit-mid matches golden critical fields", ({ profile, golden }) =>
    expectTypedScriptCriticalMatches({
      profile,
      golden,
      script: "김희{ArrowLeft}태",
      expected: "김태희",
    }),
  );
});
