export type CaptureScenario = {
  id: string;
  title: string;
  /** What the human should do with a real OS IME */
  steps: string[];
  /** Final value after following the steps correctly */
  expectedValue: string;
  /**
   * Script for `@testing-library/user-event` / siheom `type`.
   * Hangul appears as finished syllables (no composition) — that contrast is intentional.
   */
  userEventScript: string;
};

export const CAPTURE_SCENARIOS: CaptureScenario[] = [
  {
    id: "continuous-hangul",
    title: "쭉 입력 (한글)",
    steps: [
      "입력란을 비운 뒤 포커스합니다.",
      "한글로 「김태희」를 끊지 않고 입력합니다.",
      "입력이 끝나면 JSON을 복사·다운로드합니다.",
    ],
    expectedValue: "김태희",
    userEventScript: "김태희",
  },
  {
    id: "mixed-en-ko",
    title: "영어가 섞인 입력",
    steps: [
      "영문 모드로 「hello 」까지 입력합니다 (끝에 공백 포함).",
      "한글 모드로 「안녕」을 입력합니다.",
      "최종값이 「hello 안녕」인지 확인한 뒤 저장합니다.",
    ],
    expectedValue: "hello 안녕",
    userEventScript: "hello 안녕",
  },
  {
    id: "backspace-mid",
    title: "쓰다가 중간에 지우기",
    steps: [
      "한글로 「김태희」를 입력합니다.",
      "Backspace를 두 번 눌러 「김」만 남깁니다.",
      "다시 「철수」를 입력해 「김철수」로 만듭니다.",
    ],
    expectedValue: "김철수",
    userEventScript: "김태희{Backspace}{Backspace}철수",
  },
  {
    id: "arrow-edit-mid",
    title: "방향키로 이동 후 중간 수정",
    steps: [
      "한글로 「김희」를 입력합니다.",
      "← 방향키를 한 번 눌러 커서를 「김」과 「희」 사이에 둡니다.",
      "「태」를 입력해 「김태희」로 만듭니다.",
    ],
    expectedValue: "김태희",
    userEventScript: "김희{ArrowLeft}태",
  },
];

export function getCaptureScenario(id: string): CaptureScenario | undefined {
  return CAPTURE_SCENARIOS.find((scenario) => scenario.id === id);
}
