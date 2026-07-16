import type { ReactNode } from "react";

type TanStackLinkStubProps = {
  to: string;
  children: ReactNode;
  className?: string;
  "aria-labelledby"?: string;
};

export function Link({ to, children, className, "aria-labelledby": ariaLabelledBy }: TanStackLinkStubProps) {
  return (
    <a href={to} className={className} aria-labelledby={ariaLabelledBy}>
      {children}
    </a>
  );
}
