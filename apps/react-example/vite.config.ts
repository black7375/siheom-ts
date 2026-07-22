import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { vitestBrowserDefine, vitestBrowserMode } from "../../scripts/vitest-browser.ts";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const tanstackLinkStub = path.resolve(
  dirname,
  "test/stories/routing/tanstack-router/stubs/link.tsx",
);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: vitestBrowserDefine,
  root: "./",
  resolve: {
    dedupe: ["react", "react-dom"],
    tsconfigPaths: true,
    alias: {
      "@showcase/tanstack-link": tanstackLinkStub,
    },
  },
  optimizeDeps: {
    include: [
      "react-aria-components",
      "@ariakit/react",
      "@ark-ui/react",
      "recharts",
      "lexical",
      "@lexical/react/LexicalComposer",
      "@lexical/react/LexicalContentEditable",
      "@lexical/react/LexicalErrorBoundary",
      "@lexical/react/LexicalPlainTextPlugin",
      "@lexical/react/LexicalHistoryPlugin",
    ],
  },
  test: {
    alias: {
      "@showcase/tanstack-link": tanstackLinkStub,
      "@siheom/ime-cdp": path.resolve(dirname, "../../packages/ime-cdp/src/index.ts"),
      "@siheom/ime/hanja": path.resolve(dirname, "../../packages/ime/src/hanja.ts"),
      "@siheom/ime": path.resolve(dirname, "../../packages/ime/src/index.ts"),
    },
    setupFiles: "./test/setupTests.ts",
    include: ["test/**/*.test.tsx"],
    css: true,
    globals: true,
    api: { allowWrite: true, allowExec: true },
    // Browser CDP Input + per-file navigator.userAgent shims (Slate Android/Linux)
    // share one Chromium session; parallel files race focus/UA and flake.
    fileParallelism: false,
    ...vitestBrowserMode,
    browser: {
      ...vitestBrowserMode.browser,
      api: { allowWrite: true, allowExec: true },
    },
  },
});
