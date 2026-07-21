export type CaptureScenario = {
  id: string;
  title: string;
  /** What the human should do with a real OS IME */
  steps: string[];
  /** Final field value after following the steps correctly */
  expectedValue: string;
  /**
   * Script for `@testing-library/user-event` / siheom `type`.
   * Finished CJK appears without composition — contrast with OS IME captures.
   */
  userEventScript: string;
  /** Optional link to a real-world bug report */
  reference?: string;
};

export const CAPTURE_SCENARIOS: CaptureScenario[] = [
  {
    id: "pinyin-raw-enter",
    title: "중국어 Pinyin — 후보 없이 원문 확정",
    steps: [
      "중국어 IME(예: Pinyin)를 켠 채 영문 hello를 입력합니다.",
      "후보 창이 뜨면 Enter로 후보를 고르지 않고 버퍼 원문을 확정합니다.",
      "broken이면 메시지가 전송되고, fixed면 send 0이어야 합니다.",
    ],
    expectedValue: "hello",
    userEventScript: "hello",
    reference:
      "https://meta.discourse.org/t/ime-composition-enter-key-triggers-message-send-instead-of-confirming-input/385840",
  },
  {
    id: "pinyin-candidate-enter",
    title: "중국어 Pinyin — 후보 선택 확정",
    steps: [
      "nihao 등을 입력해 후보(你好 등)를 띄웁니다.",
      "숫자키나 화살표로 후보를 고른 뒤 Enter로 확정합니다.",
      "확정 Enter가 send로 가지 않는지 확인합니다.",
    ],
    expectedValue: "你好",
    userEventScript: "你好",
  },
  {
    id: "japanese-romaji",
    title: "일본어 — 로마자 → 한자 후보",
    steps: [
      "일본어 IME로 nihongo 등을 입력해 日本語 후보를 띄웁니다.",
      "Enter로 후보를 확정합니다.",
      "확정 전 send가 발생하면 재현 성공(broken)입니다.",
    ],
    expectedValue: "日本語",
    userEventScript: "日本語",
  },
  {
    id: "korean-hanja",
    title: "한글 → 한자 변환",
    steps: [
      "한글을 입력한 뒤 한자 변환(한/영 키 등)으로 후보 창을 띄웁니다.",
      "Enter 또는 숫자키로 한자를 확정합니다.",
      "확정 키가 send로 가지 않는지 확인합니다.",
    ],
    expectedValue: "金",
    userEventScript: "金",
  },
];

export function getCaptureScenario(id: string): CaptureScenario | undefined {
  return CAPTURE_SCENARIOS.find((scenario) => scenario.id === id);
}
