import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AccordionItemData = {
  id: string;
  title: string;
  content: string;
  publishedAt?: string;
  summary?: string;
};

function AccordionPanel({
  item,
  defaultOpen = false,
}: {
  item: AccordionItemData;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const headingId = `accordion-heading-${item.id}`;
  const panelId = `accordion-panel-${item.id}`;

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <h2 id={headingId}>
        <Button
          type="button"
          variant="ghost"
          className="h-auto min-h-14 w-full items-start justify-between gap-4 rounded-none px-4 py-4 text-left font-medium"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            setOpen((current) => !current);
          }}
        >
          <span className="space-y-1">
            {item.publishedAt ? (
              <span aria-hidden="true" className="block text-xs font-normal text-muted-foreground">
                {item.publishedAt}
              </span>
            ) : null}
            <span className="block">{item.title}</span>
            {item.summary && !open ? (
              <span aria-hidden="true" className="block text-sm font-normal text-muted-foreground">
                {item.summary}
              </span>
            ) : null}
          </span>
        </Button>
      </h2>
      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headingId}
          className="border-t px-4 py-4 text-sm leading-6 text-foreground/90"
        >
          {item.content}
        </div>
      ) : null}
    </div>
  );
}

export function Accordion({
  items,
  openId,
  className,
}: {
  items: AccordionItemData[];
  openId?: string | null;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <AccordionPanel key={item.id} item={item} defaultOpen={openId === item.id} />
      ))}
    </section>
  );
}
