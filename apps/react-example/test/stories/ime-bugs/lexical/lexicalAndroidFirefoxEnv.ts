/**
 * Vitest browser runs Chromium; Lexical reads IS_FIREFOX / IS_ANDROID at module init.
 * Patch UA before any `lexical` import so composition handlers match Android Firefox (#6377).
 */
const ANDROID_FIREFOX_UA = "Mozilla/5.0 (Android 14; Mobile; rv:128.0) Gecko/128.0 Firefox/128.0";

if (!/Firefox/i.test(navigator.userAgent)) {
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    get: () => ANDROID_FIREFOX_UA,
  });
}
