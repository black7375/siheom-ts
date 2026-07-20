import path from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  resolve: {
    alias: {
      "@siheom/core": path.resolve(dirname, "../core/src/index.ts"),
    },
    conditions: ["browser"],
  },
  define: {
    "import.meta.env.SSR": false,
  },
  test: {
    globals: true,
    include: ["src/**/*.test.ts"],
    environment: "jsdom",
    setupFiles: ["src/testSetup.ts"],
  },
});
