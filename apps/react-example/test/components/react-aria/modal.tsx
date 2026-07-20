"use client";

import {
  Dialog as RACDialog,
  DialogTrigger,
  Heading,
  Modal as RACModal,
  ModalOverlay,
  type ModalOverlayProps,
} from "react-aria-components";

import { cn } from "@/lib/utils";

function Modal({ className, ...props }: ModalOverlayProps) {
  return (
    <ModalOverlay
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-4 supports-backdrop-filter:backdrop-blur-xs",
        "data-entering:animate-in data-entering:fade-in-0 data-exiting:animate-out data-exiting:fade-out-0",
      )}
      {...props}
    >
      <RACModal
        className={cn(
          "w-full max-w-md rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10 outline-none",
          "data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95",
          className,
        )}
      >
        {props.children}
      </RACModal>
    </ModalOverlay>
  );
}

function Dialog({ className, ...props }: React.ComponentProps<typeof RACDialog>) {
  return (
    <RACDialog className={cn("flex flex-col gap-4 outline-none", className)} {...props} />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof Heading>) {
  return (
    <Heading
      slot="title"
      className={cn("text-base font-medium", className)}
      {...props}
    />
  );
}

export { Dialog, DialogTitle, DialogTrigger, Modal };
