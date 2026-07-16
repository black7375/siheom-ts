import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Notice } from "../shared/notices";

export function NoticeAccordion({ items, openId }: { items: Notice[]; openId?: string | null }) {
  return (
    <Accordion
      key={openId ?? "none"}
      defaultValue={openId ? [openId] : []}
      className="rounded-xl border bg-card px-4 shadow-sm"
    >
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger>
            <span className="flex flex-col items-start gap-1 text-left">
              <span aria-hidden="true" className="text-xs font-normal text-muted-foreground">
                {item.publishedAt}
              </span>
              <span>{item.title}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
