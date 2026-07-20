export const NOTICES = [
  { id: "1", title: "서버 점검 안내", body: "3월 15일 새벽 2시부터 4시까지 점검합니다." },
  { id: "2", title: "연말 휴무 공지", body: "12월 30일부터 1월 2일까지 휴무입니다." },
  { id: "3", title: "신규 기능 출시", body: "팀 초대 기능이 추가되었습니다." },
] as const;

export type Notice = (typeof NOTICES)[number];

export function filterNotices(notices: readonly Notice[], query: string): Notice[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return [...notices];

  return notices.filter(
    (notice) =>
      notice.title.toLowerCase().includes(keyword) || notice.body.toLowerCase().includes(keyword),
  );
}
