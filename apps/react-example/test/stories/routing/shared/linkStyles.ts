import { cn } from "@/lib/utils";

export const linkClassName = cn(
  "inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline",
);

export const articleCardLinkClassName = cn(
  "block rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-colors",
  "hover:border-primary/30 hover:bg-muted/20",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
);

export const noticeCardLinkClassName = articleCardLinkClassName;
