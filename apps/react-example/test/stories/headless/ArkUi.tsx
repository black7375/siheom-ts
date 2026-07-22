"use client";

import { useState } from "react";

import { Button } from "@/components/ark-ui/button";
import { Checkbox } from "@/components/ark-ui/checkbox";
import { Dialog } from "@/components/ark-ui/dialog";
import { Select } from "@/components/ark-ui/select";
import { TextField } from "@/components/ark-ui/text-field";
import { formDataText } from "@/utils/formDataText";
import { SUBSCRIPTION_PLANS, type SubscribeData, type SubscriptionPlan } from "./subscribe.fixture";

export function ArkUiSubscribe({
  onSubscribe,
}: {
  onSubscribe: (data: SubscribeData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState("");

  return (
    <section aria-label="ark-ui-subscribe" className="mx-auto max-w-md p-4">
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
              name: formDataText(formData, "name"),
              email: formDataText(formData, "email"),
              plan: formDataText(formData, "plan") as SubscriptionPlan,
              terms: formData.get("terms") === "on",
            });
            setOpen(false);
          }}
        >
          <TextField label="이름" id="name" name="name" required />
          <TextField label="이메일" id="email" name="email" type="email" required />
          <Select
            label="구독할 항목"
            name="plan"
            items={SUBSCRIPTION_PLANS}
            value={plan}
            onValueChange={setPlan}
            required
          />
          <Checkbox id="terms" name="terms" required>
            약관에 동의합니다
          </Checkbox>
          <Button type="submit">구독하기</Button>
        </form>
      </Dialog>
    </section>
  );
}
