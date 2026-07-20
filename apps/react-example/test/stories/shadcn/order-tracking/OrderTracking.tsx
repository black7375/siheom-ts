"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ORDER, ORDER_STEPS } from "./orders.fixture";

export function OrderTracking() {
  return (
    <section aria-label="주문 추적" className="mx-auto max-w-md p-4">
      <h2 id="order-tracking-title" className="mb-4 text-lg font-semibold">
        주문 추적
      </h2>

      <section aria-label="주문 정보" className="mb-4">
        <Card>
          <CardHeader>
            <CardTitle>{ORDER.id}</CardTitle>
            <CardDescription>{ORDER.product}</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section aria-label="주문 배송">
        <ol className="flex flex-col gap-3">
          {ORDER_STEPS.map((step) => (
            <li
              key={step.id}
              aria-label={step.title}
              aria-current={step.state === "current" ? "step" : undefined}
            >
              <Card
                className={step.state === "current" ? "border-primary font-semibold" : undefined}
              >
                <CardHeader>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
