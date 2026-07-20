export const ORDER = {
  id: "ORD-2024-001",
  product: "무선 이어폰",
} as const;

export const ORDER_STEPS = [
  {
    id: "placed",
    title: "주문 접수",
    description: "2024년 3월 10일 14:20",
    state: "completed" as const,
  },
  {
    id: "preparing",
    title: "배송 준비",
    description: "2024년 3월 10일 18:00",
    state: "completed" as const,
  },
  {
    id: "shipping",
    title: "배송 중",
    description: "2024년 3월 11일 09:30",
    state: "current" as const,
  },
  {
    id: "delivered",
    title: "배달 완료",
    description: "도착 예정: 2024년 3월 11일",
    state: "upcoming" as const,
  },
] as const;

export type OrderStep = (typeof ORDER_STEPS)[number];
