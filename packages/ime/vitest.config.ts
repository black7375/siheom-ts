import { defineConfig } from "vitest/config";
import { vitestBrowserDefine, vitestBrowserMode } from "../../scripts/vitest-browser.ts";

export default defineConfig({
  define: vitestBrowserDefine,
  test: {
    globals: true,
    include: ["src/**/*.test.ts"],
    ...vitestBrowserMode,
  },
});
