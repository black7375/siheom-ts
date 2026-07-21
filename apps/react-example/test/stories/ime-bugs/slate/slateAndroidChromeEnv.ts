/**
 * Vitest browser runs Chromium; slate-dom reads IS_ANDROID at module init.
 * Patch UA before any `slate-react` import so Android IM + placeholder paths match device.
 */
const ANDROID_CHROME_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";

if (!/Android/.test(navigator.userAgent)) {
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    get: () => ANDROID_CHROME_UA,
  });
}
