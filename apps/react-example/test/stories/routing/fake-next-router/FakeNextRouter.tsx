import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
  const historyRef = useRef<string[]>([initialPath]);

  const applyLocation = useCallback((href: string) => {
    const next = parseHref(href);
    setPathname(next.pathname);
    setSearch(next.search);
    setHash(next.hash);
  }, []);

  const navigate = useCallback(
    (href: string, mode: "push" | "replace") => {
      const current = historyRef.current;
      historyRef.current =
        mode === "replace" ? [...current.slice(0, -1), href] : [...current, href];
      applyLocation(href);
    },
    [applyLocation],
  );

  const back = useCallback(() => {
    const current = historyRef.current;
    if (current.length <= 1) {
      return;
    }
    const previous = current.at(-2);
    if (!previous) {
      return;
    }
    historyRef.current = current.slice(0, -1);
    applyLocation(previous);
  }, [applyLocation]);

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
      back,
    }),
    [back, hash, navigate, pathname, search],
  );

  return <FakeNextRouterContext.Provider value={value}>{children}</FakeNextRouterContext.Provider>;
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
