"use client";

import { Form } from "react-aria-components";
import { useState } from "react";

import { Button } from "@/components/react-aria/button";
import { Checkbox } from "@/components/react-aria/checkbox";
import { Dialog, DialogTitle, DialogTrigger, Modal } from "@/components/react-aria/modal";
import { Select, SelectItem } from "@/components/react-aria/select";
import { TextField } from "@/components/react-aria/text-field";
import { SUBSCRIPTION_PLANS, type SubscribeData, type SubscriptionPlan } from "./subscribe.fixture";

export type { SubscribeData };

export function ReactAriaSubscribe({
  onSubscribe,
}: {
  onSubscribe: (data: SubscribeData) => Promise<void>;
}) {
  const [isOpen, setOpen] = useState(false);

  return (
    <section aria-label="react-aria-subscribe" className="mx-auto max-w-md p-4">
      <DialogTrigger isOpen={isOpen} onOpenChange={setOpen}>
        <Button>구독하기</Button>
        <Modal isDismissable>
          <Dialog>
            <DialogTitle>구독하기</DialogTitle>
            <Form
              className="flex flex-col gap-4"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const plan = String(formData.get("plan") ?? "");

                await onSubscribe({
                  name: String(formData.get("name") ?? ""),
                  email: String(formData.get("email") ?? ""),
                  plan: plan as SubscriptionPlan,
                  terms: formData.get("terms") === "on",
                });
                setOpen(false);
              }}
            >
              <TextField label="이름" name="name" isRequired />
              <TextField label="이메일" name="email" type="email" isRequired />
              <Select label="구독할 항목" name="plan" isRequired>
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <SelectItem key={plan} id={plan} textValue={plan}>
                    {plan}
                  </SelectItem>
                ))}
              </Select>
              <Checkbox name="terms" isRequired>
                약관에 동의합니다
              </Checkbox>
              <Button type="submit">구독하기</Button>
            </Form>
          </Dialog>
        </Modal>
      </DialogTrigger>
    </section>
  );
}
