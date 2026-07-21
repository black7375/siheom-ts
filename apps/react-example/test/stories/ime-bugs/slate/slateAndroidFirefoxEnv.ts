/**
 * Patch UA before slate-react init for Android Firefox IME paths.
 */
const ANDROID_FIREFOX_UA = "Mozilla/5.0 (Android 14; Mobile; rv:128.0) Gecko/128.0 Firefox/128.0";

if (!/Firefox/i.test(navigator.userAgent)) {
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    get: () => ANDROID_FIREFOX_UA,
  });
}
