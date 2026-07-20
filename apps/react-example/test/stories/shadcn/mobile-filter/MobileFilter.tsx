"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MobileFilter() {
  const [filter, setFilter] = useState("전체");
  const [open, setOpen] = useState(false);

  return (
    <section aria-label="모바일 필터" className="mx-auto max-w-md p-4">
      <p role="status" aria-label="선택된 필터">
        {filter}
      </p>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button type="button">필터</Button>} />

        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>필터</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant={filter === "전체" ? "default" : "ghost"}
              onClick={() => {
                setFilter("전체");
                setOpen(false);
              }}
            >
              전체
            </Button>
            <Button
              type="button"
              variant={filter === "진행 중" ? "default" : "ghost"}
              onClick={() => {
                setFilter("진행 중");
                setOpen(false);
              }}
            >
              진행 중
            </Button>
            <Button
              type="button"
              variant={filter === "완료" ? "default" : "ghost"}
              onClick={() => {
                setFilter("완료");
                setOpen(false);
              }}
            >
              완료
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}

