/** Reset UA for Linux desktop Slate tests (isolated from Android env shims). */
const LINUX_CHROME_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

Object.defineProperty(navigator, "userAgent", {
  configurable: true,
  get: () => LINUX_CHROME_UA,
});
