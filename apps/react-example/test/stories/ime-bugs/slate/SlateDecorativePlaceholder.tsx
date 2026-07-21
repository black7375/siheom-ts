import type { ReactNode } from "react";

/**
 * Visual placeholder that lives *outside* the contenteditable tree.
 *
 * Slate's built-in `placeholder` renders a non-contenteditable leaf inside the
 * editor. On Android that leaf interferes with Hangul IME (#5989). A decorative
 * overlay keeps the UX without participating in composition.
 */
export function SlateDecorativePlaceholder({
  text,
  empty,
  children,
}: {
  text: string;
  empty: boolean;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      {empty ? (
        <div
          className="pointer-events-none absolute inset-0 px-3 py-2 text-muted-foreground"
          aria-hidden="true"
          data-slate-decorative-placeholder="true"
        >
          {text}
        </div>
      ) : null}
      {children}
    </div>
  );
}
