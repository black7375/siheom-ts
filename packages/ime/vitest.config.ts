import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { vitestBrowserDefine, vitestBrowserMode } from "../../scripts/vitest-browser.ts";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  define: vitestBrowserDefine,
  resolve: {
    alias: {
      "@siheom/core": path.resolve(dirname, "../core/src/index.ts"),
    },
  },
  test: {
    globals: true,
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/testSetup.ts"],
    ...vitestBrowserMode,
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/index.ts"],
    },
  },
});

