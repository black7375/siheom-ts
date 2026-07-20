export const SUBSCRIPTION_PLANS = ["뉴스레터", "제품 업데이트", "이벤트 소식"] as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const SUBSCRIBER = {
  name: "홍길동",
  email: "hong@example.com",
  plan: "뉴스레터" satisfies SubscriptionPlan,
  terms: true,
} as const;
