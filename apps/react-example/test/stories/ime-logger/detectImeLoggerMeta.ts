export type ImeLoggerMetaFields = {
  os: string;
  browser: string;
  ime: string;
};

export type NavigatorLike = Pick<Navigator, "userAgent" | "platform"> & {
  maxTouchPoints?: number;
  userAgentData?: {
    platform?: string;
    brands?: Array<{ brand: string }>;
  };
};

export function detectOs(nav: NavigatorLike = navigator): string {
  const platform = nav.userAgentData?.platform?.toLowerCase();
  if (platform) {
    if (platform.includes("mac")) return "macos";
    if (platform.includes("win")) return "windows";
    if (platform === "linux") return "linux";
    if (platform === "android") return "android";
    if (platform === "ios") return "ios";
  }

  const ua = nav.userAgent;
  const plat = nav.platform?.toLowerCase() ?? "";

  if (/iphone|ipad|ipod/i.test(ua) || (plat === "macintel" && (nav.maxTouchPoints ?? 0) > 1)) {
    return "ios";
  }
  if (/android/i.test(ua)) return "android";
  if (/mac os x|macintosh/i.test(ua) || plat.includes("mac")) return "macos";
  if (/windows/i.test(ua) || plat.includes("win")) return "windows";
  if (/linux/i.test(ua) || plat.includes("linux")) return "linux";

  return "";
}

export function detectBrowser(nav: NavigatorLike = navigator): string {
  const brands = nav.userAgentData?.brands;
  if (brands?.length) {
    const names = brands.map((brand) => brand.brand.toLowerCase());
    if (names.some((name) => name.includes("edge"))) return "edge";
    if (names.some((name) => name.includes("opera"))) return "opera";
    if (names.some((name) => name.includes("samsung"))) return "samsung";
    if (names.some((name) => name.includes("firefox"))) return "firefox";
    if (names.some((name) => name.includes("chrome"))) return "chrome";
  }

  const ua = nav.userAgent;
  if (/edg\//i.test(ua)) return "edge";
  if (/firefox\//i.test(ua)) return "firefox";
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return "opera";
  if (/samsungbrowser/i.test(ua)) return "samsung";
  if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) return "chrome";
  if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) return "safari";

  return "";
}

/** OS-level default IME when the browser cannot expose the active engine. */
export function detectIme(os: string): string {
  switch (os) {
    case "macos":
    case "ios":
      return "apple";
    case "windows":
      return "ms";
    default:
      return "";
  }
}

export function detectImeLoggerMeta(nav: NavigatorLike = navigator): ImeLoggerMetaFields {
  const os = detectOs(nav);
  return {
    os,
    browser: detectBrowser(nav),
    ime: detectIme(os),
  };
}
