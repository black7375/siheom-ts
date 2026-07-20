"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export function TwoFactorForm() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  return (
    <section aria-label="2단계 인증" className="mx-auto max-w-md space-y-4 p-4">
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (code === "123456") {
            setStatus("인증되었습니다");
          }
        }}
      >
        <InputOTP maxLength={6} value={code} onChange={setCode} aria-label="인증 코드">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <Button type="submit">확인</Button>
      </form>

      {status ? (
        <p role="status" aria-label="인증 결과">
          {status}
        </p>
      ) : null}
    </section>
  );
}
