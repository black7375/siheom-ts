"use client";

import { Button } from "@/components/ariakit/button";
import { Checkbox } from "@/components/ariakit/checkbox";
import { Dialog, useDialogStore } from "@/components/ariakit/dialog";
import { Select, SelectItem } from "@/components/ariakit/select";
import { TextField } from "@/components/ariakit/text-field";
import {
  SUBSCRIPTION_PLANS,
  type SubscribeData,
  type SubscriptionPlan,
} from "./subscribe.fixture";

export function AriakitSubscribe({
  onSubscribe,
}: {
  onSubscribe: (data: SubscribeData) => Promise<void>;
}) {
  const dialog = useDialogStore();

  return (
    <section aria-label="ariakit-subscribe" className="mx-auto max-w-md p-4">
      <Dialog
        store={dialog}
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
            dialog.hide();
          }}
        >
          <TextField label="이름" name="name" required />
          <TextField label="이메일" name="email" type="email" required />
          <Select label="구독할 항목" name="plan" required>
            {SUBSCRIPTION_PLANS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </Select>
          <Checkbox name="terms" required>
            약관에 동의합니다
          </Checkbox>
          <Button type="submit">구독하기</Button>
        </form>
      </Dialog>
    </section>
  );
}
