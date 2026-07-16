import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { parseHref, parseQueryString } from "./parseHref";

type FakeNextRouterContextValue = {
  pathname: string;
  searchParams: URLSearchParams;
  hash: string;
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
};

const FakeNextRouterContext = createContext<FakeNextRouterContextValue | null>(null);

function useFakeNextRouterContext() {
  const context = useContext(FakeNextRouterContext);
  if (!context) {
    throw new Error("FakeNextRouterProvider is required");
  }
  return context;
}

export function FakeNextRouterProvider({
  initialPath = "/",
  children,
}: {
  initialPath?: string;
  children: ReactNode;
}) {
  const initial = parseHref(initialPath);
  const [pathname, setPathname] = useState(initial.pathname);
  const [search, setSearch] = useState(initial.search);
  const [hash, setHash] = useState(initial.hash);
  const [history, setHistory] = useState<string[]>([initialPath]);

  const navigate = useCallback((href: string, mode: "push" | "replace") => {
    const next = parseHref(href);
    setPathname(next.pathname);
    setSearch(next.search);
    setHash(next.hash);
    setHistory((current) => {
      if (mode === "replace") {
        return [...current.slice(0, -1), href];
      }
      return [...current, href];
    });
  }, []);

  const value = useMemo<FakeNextRouterContextValue>(
    () => ({
      pathname,
      searchParams: parseQueryString(search),
      hash,
      push: (href) => {
        navigate(href, "push");
      },
      replace: (href) => {
        navigate(href, "replace");
      },
      back: () => {
        setHistory((current) => {
          if (current.length <= 1) {
            return current;
          }
          const previous = current.at(-2);
          if (!previous) {
            return current;
          }
          const next = parseHref(previous);
          setPathname(next.pathname);
          setSearch(next.search);
          setHash(next.hash);
          return current.slice(0, -1);
        });
      },
    }),
    [hash, navigate, pathname, search],
  );

  return <FakeNextRouterContext.Provider value={value}>{children}</FakeNextRouterContext.Provider>;
}

export function useRouter() {
  const { push, replace, back } = useFakeNextRouterContext();
  return { push, replace, back };
}

export function usePathname() {
  return useFakeNextRouterContext().pathname;
}

export function useSearchParams() {
  return useFakeNextRouterContext().searchParams;
}

export function Link({
  href,
  children,
  className,
  "aria-labelledby": ariaLabelledBy,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  "aria-labelledby"?: string;
}) {
  const { push } = useFakeNextRouterContext();

  return (
    <a
      href={href}
      className={className}
      aria-labelledby={ariaLabelledBy}
      onClick={(event) => {
        event.preventDefault();
        push(href);
      }}
    >
      {children}
    </a>
  );
}
