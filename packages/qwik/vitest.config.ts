import path from "node:path";
import { fileURLToPath } from "node:url";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { defineConfig } from "vitest/config";
import { vitestBrowserDefine, vitestBrowserMode } from "../../scripts/vitest-browser.ts";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [qwikVite()],
  // qwikVite sets `esbuild: false` in serve mode; Vite 8 expects `oxc: false` instead.
  oxc: false,
  define: vitestBrowserDefine,
  resolve: {
    alias: {
      "@siheom/core": path.resolve(dirname, "../core/src/index.ts"),
    },
  },
  test: {
    globals: true,
    include: ["src/**/*.test.tsx"],
    setupFiles: ["src/testSetup.ts"],
    ...vitestBrowserMode,
  },
});
