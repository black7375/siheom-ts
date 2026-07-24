export type CaptureScenario = {
  id: string;
  title: string;
  steps: string[];
  expectedValue: string;
  userEventScript: string;
};

export const CAPTURE_SCENARIOS: CaptureScenario[] = [
  {
    id: "hanja-name",
    title: "김태희 → 金泰熙 (한 글자씩 한자 변환)",
    steps: [
      "broken 모드에서 이름 입력란에 「김」을 조합합니다.",
      "Option+Enter(⌥↩)로 한자 변환 후보 창을 띄웁니다.",
      "방향키 또는 숫자키로 「金」 후보를 확정합니다 — broken이면 combobox 제안이 움직이거나 선택될 수 있습니다.",
      "같은 방식으로 「태」→「泰」, 「희」→「熙」를 넣어 최종 「金泰熙」를 만듭니다.",
      "fixed 모드에서는 한자 후보 탐색 키가 combobox에 가로채이지 않아야 합니다.",
    ],
    expectedValue: "金泰熙",
    userEventScript: "金泰熙",
  },
];

