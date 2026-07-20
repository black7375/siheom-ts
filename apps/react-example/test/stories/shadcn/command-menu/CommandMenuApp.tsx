"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

export function CommandMenuApp() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  function runCommand(label: string) {
    setResult(label);
    setOpen(false);
  }

  return (
    <section aria-label="빠른 실행 데모" className="mx-auto max-w-md space-y-4 p-4">
      <Button onClick={() => setOpen(true)}>
        빠른 실행
        <KbdGroup aria-hidden="true" className="ml-2">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="빠른 실행"
        description="실행할 명령을 검색합니다"
      >
        <Command>
          <CommandInput aria-label="명령 검색" placeholder="명령 검색..." />
          <CommandList>
            <CommandEmpty>일치하는 명령이 없습니다</CommandEmpty>
            <CommandGroup heading="동작">
              <CommandItem onSelect={() => runCommand("새 문서")}>새 문서</CommandItem>
              <CommandItem onSelect={() => runCommand("설정 열기")}>설정 열기</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>

      {result ? (
        <p role="status" aria-label="실행 결과">
          {result} 실행됨
        </p>
      ) : null}
    </section>
  );
}
