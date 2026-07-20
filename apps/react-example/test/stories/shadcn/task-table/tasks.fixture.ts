export const TASKS = [
  { id: "1", title: "API 문서 작성", status: "in_progress" as const, statusLabel: "진행 중" },
  { id: "2", title: "디자인 리뷰", status: "done" as const, statusLabel: "완료" },
  { id: "3", title: "배포 자동화", status: "todo" as const, statusLabel: "대기" },
  { id: "4", title: "버그 수정", status: "in_progress" as const, statusLabel: "진행 중" },
  { id: "5", title: "회고 작성", status: "todo" as const, statusLabel: "대기" },
] as const;

export type Task = (typeof TASKS)[number];
export type TaskStatus = Task["status"];

export const PAGE_SIZE = 2;

export function paginateTasks<T>(items: readonly T[], page: number, pageSize = PAGE_SIZE): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getTotalPages(itemCount: number, pageSize = PAGE_SIZE): number {
  return Math.ceil(itemCount / pageSize);
}

export function getTaskBadgeVariant(status: TaskStatus): "default" | "secondary" | "outline" {
  if (status === "done") return "secondary";
  if (status === "in_progress") return "default";
  return "outline";
}
