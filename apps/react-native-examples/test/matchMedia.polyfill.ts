const mediaQueryStub = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

const globalScope = globalThis as typeof globalThis & {
  window?: Window & typeof globalThis;
  matchMedia?: typeof mediaQueryStub;
};

globalScope.matchMedia = mediaQueryStub;
globalScope.window = globalScope.window ?? (globalScope as unknown as Window);
globalScope.window.matchMedia = mediaQueryStub;

export {};
