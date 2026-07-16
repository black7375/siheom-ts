export function parseHref(href: string): { pathname: string; search: string; hash: string } {
  const url = new URL(href, "http://localhost");

  return {
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
  };
}

export function parseQueryString(search: string): URLSearchParams {
  const normalized = search.startsWith("?") ? search : search ? `?${search}` : "";
  return new URLSearchParams(normalized);
}
