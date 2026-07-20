"use client";

import { useState } from "react";

import { Button } from "@/components/radix/button";
import { Checkbox } from "@/components/radix/checkbox";
import { Dialog } from "@/components/radix/dialog";
import { Select, SelectItem } from "@/components/radix/select";
import { TextField } from "@/components/radix/text-field";
import {
  SUBSCRIPTION_PLANS,
  type SubscribeData,
  type SubscriptionPlan,
} from "./subscribe.fixture";

export function RadixSubscribe({
  onSubscribe,
}: {
  onSubscribe: (data: SubscribeData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState("");

  return (
    <section aria-label="radix-subscribe" className="mx-auto max-w-md p-4">
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="구독하기"
        trigger={<Button>구독하기</Button>}
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);

            await onSubscribe({
              name: String(formData.get("name") ?? ""),
              email: String(formData.get("email") ?? ""),
              plan: String(formData.get("plan") ?? "") as SubscriptionPlan,
              terms: formData.get("terms") === "on",
            });
            setOpen(false);
          }}
        >
          <TextField label="이름" id="name" name="name" required />
          <TextField label="이메일" id="email" name="email" type="email" required />
          <Select
            label="구독할 항목"
            id="plan"
            name="plan"
            value={plan}
            onValueChange={setPlan}
            required
          >
            {SUBSCRIPTION_PLANS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </Select>
          <Checkbox id="terms" name="terms" required>
            약관에 동의합니다
          </Checkbox>
          <Button type="submit">구독하기</Button>
        </form>
      </Dialog>
    </section>
  );
}
