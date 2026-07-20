"use client";

import { Dialog as ArkDialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";

import { cn } from "@/lib/utils";

function Dialog({
  open,
  onOpenChange,
  trigger,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactElement;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <ArkDialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      lazyMount
      unmountOnExit
    >
      <ArkDialog.Trigger asChild>{trigger}</ArkDialog.Trigger>
      <Portal>
        <ArkDialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        />
        <ArkDialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <ArkDialog.Content
            className={cn(
              "w-full max-w-md rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10 outline-none",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            )}
          >
            <ArkDialog.Title className="text-base font-medium">{title}</ArkDialog.Title>
            <div className="mt-4">{children}</div>
          </ArkDialog.Content>
        </ArkDialog.Positioner>
      </Portal>
    </ArkDialog.Root>
  );
}

export { Dialog };
