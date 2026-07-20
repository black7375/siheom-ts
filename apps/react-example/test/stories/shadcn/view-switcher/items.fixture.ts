export const VIEW_ITEMS = [
  { id: "1", title: "서버 점검 안내" },
  { id: "2", title: "연말 휴무 공지" },
  { id: "3", title: "신규 기능 출시" },
] as const;

export type ViewItem = (typeof VIEW_ITEMS)[number];

export type ViewMode = "list" | "grid";
