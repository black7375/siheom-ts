import type { ViteUserConfigFnObject } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

// not promise or fn, just object
type UserConfig = ReturnType<ViteUserConfigFnObject>
type TestConfig = NonNullable<UserConfig["test"]>;
/** Vite `define` shims for testing-library packages in real browsers. */
export const vitestBrowserDefine = {
  "process.env.NODE_ENV": JSON.stringify("test"),
  "process.env.VTL_SKIP_AUTO_CLEANUP": "undefined",
  "process.env.QTL_SKIP_AUTO_CLEANUP": "undefined",
} as const;

/** Shared Vitest browser mode config (matches apps/react-example). */
export const vitestBrowserMode = {
  browser: {
    enabled: true,
    headless: true,
    provider: playwright({
      contextOptions: {
        timezoneId: "Asia/Seoul",
        locale: "ko-KR",
        permissions: ["clipboard-read"],
      },
    }),
    instances: [{ browser: "chromium" }],
  },
  testTimeout: 1000,
} satisfies Pick<TestConfig, "browser" | "testTimeout">;
