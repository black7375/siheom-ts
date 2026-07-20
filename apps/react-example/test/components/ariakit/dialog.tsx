"use client";

import {
  Dialog,
  DialogDisclosure,
  DialogHeading,
  DialogProvider,
  useDialogStore,
} from "@ariakit/react";

import { cn } from "@/lib/utils";

function SubscribeDialog({
  store,
  trigger,
  title,
  children,
}: {
  store: ReturnType<typeof useDialogStore>;
  trigger: React.ReactElement;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <DialogProvider store={store}>
      <DialogDisclosure render={trigger} />
      <Dialog
        backdrop={
          <div className="fixed inset-0 bg-black/10 supports-backdrop-filter:backdrop-blur-xs" />
        }
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10 outline-none",
        )}
      >
        <DialogHeading className="text-base font-medium">{title}</DialogHeading>
        <div className="mt-4">{children}</div>
      </Dialog>
    </DialogProvider>
  );
}

export { SubscribeDialog as Dialog, useDialogStore };
