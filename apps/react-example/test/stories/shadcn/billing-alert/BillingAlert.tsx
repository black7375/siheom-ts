"use client";

import { useState } from "react";
import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function BillingAlert() {
  const [visible, setVisible] = useState(true);

  return (
    <section aria-label="청구 알림" className="mx-auto max-w-md p-4">
      {visible ? (
        <Alert variant="destructive" aria-label="결제 실패">
          <CircleAlertIcon />
          <AlertTitle>결제 실패</AlertTitle>
          <AlertDescription>등록된 카드로 결제할 수 없습니다.</AlertDescription>
          <AlertAction>
            <Button type="button" size="sm" variant="outline" onClick={() => setVisible(false)}>
              확인
            </Button>
          </AlertAction>
        </Alert>
      ) : null}
    </section>
  );
}
