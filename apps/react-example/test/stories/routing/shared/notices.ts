export type Notice = {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  content: string;
};

export const NOTICES: Notice[] = [
  {
    id: "123",
    title: "공지 123",
    summary: "7월 정기 점검 일정과 영향 범위 안내",
    publishedAt: "2026-07-01",
    content:
      "2026년 7월 20일 02:00–04:00 동안 인프라 점검이 진행됩니다. 점검 시간 동안 알림 발송과 파일 업로드가 일시 중단될 수 있습니다.",
  },
  {
    id: "456",
    title: "공지 456",
    summary: "공지 상세 페이지와 Accordion deep link 소개",
    publishedAt: "2026-07-08",
    content:
      "외부 링크나 목록에서 /notice?id=456 으로 진입하면 해당 Accordion이 열린 상태로 렌더됩니다. query string 파싱은 가짜 Next Router 구현체가 담당합니다.",
  },
];
