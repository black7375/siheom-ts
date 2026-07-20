import path from "node:path";
import { fileURLToPath } from "node:url";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [qwikVite()],
  resolve: {
    alias: {
      "@siheom/core": path.resolve(dirname, "../core/src/index.ts"),
    },
  },
  test: {
    globals: true,
    include: ["src/**/*.test.tsx"],
    environment: "jsdom",
    setupFiles: ["src/testSetup.ts"],
  },
});
