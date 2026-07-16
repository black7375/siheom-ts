import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  activeNav,
  className,
}: {
  children: ReactNode;
  activeNav?: "articles" | "notices" | "login" | "terms";
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground", className)}>
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Siheom Showcase
            </p>
            <p className="text-sm font-semibold">프론트엔드 라우팅 예제</p>
          </div>
          <nav aria-label="주요 메뉴" className="flex items-center gap-3 text-sm">
            <NavItem active={activeNav === "articles"}>글</NavItem>
            <NavItem active={activeNav === "notices"}>공지</NavItem>
            <NavItem active={activeNav === "terms"}>약관</NavItem>
            <NavItem active={activeNav === "login"}>로그인</NavItem>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-12 border-t">
        <div className="mx-auto max-w-3xl px-4 py-6 text-xs text-muted-foreground">
          Storybook과 Vitest browser에서 동일한 UI를 라우터 provider와 함께 확인할 수 있습니다.
        </div>
      </footer>
    </div>
  );
}

function NavItem({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-1",
        active ? "bg-secondary font-medium text-secondary-foreground" : "text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  titleId,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  titleId: string;
}) {
  return (
    <div className="space-y-2">
      {eyebrow ? (
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 id={titleId} className="text-2xl font-semibold tracking-tight">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      ) : null}
      <Separator className="mt-4" />
    </div>
  );
}
