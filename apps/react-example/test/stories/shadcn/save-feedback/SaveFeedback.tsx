"use client";

import { Toaster, toast } from "sonner";

import { Button } from "@/components/ui/button";

export function SaveFeedback() {
  return (
    <section aria-label="저장 피드백" className="mx-auto max-w-md p-4">
      <Button type="button" onClick={() => toast.success("저장됨")}>
        저장
      </Button>

      <Toaster richColors />
    </section>
  );
}
