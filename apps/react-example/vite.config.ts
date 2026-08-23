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

const siheomCoreSource = path.resolve(dirname, "../../packages/core/src/index.ts");
const siheomReactSource = path.resolve(dirname, "../../packages/react/src/index.ts");
const siheomVirtualScreenReaderSource = path.resolve(
  dirname,
  "../../packages/virtual-screen-reader/src/index.ts",
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
      // Vite 8's rolldown optimizer can't resolve PnP workspace dist builds,
      // and built CJS deps lose named exports when served raw in browser mode.
      // Aliasing siheom packages to source keeps aria-query imports on the
      // working raw-CJS path (same as @siheom/core's own browser tests).
      "@siheom/core": siheomCoreSource,
      "@siheom/react": siheomReactSource,
      "@siheom/virtual-screen-reader": siheomVirtualScreenReaderSource,
    },
  },
  optimizeDeps: {
    include: [
      // Vite 8 (Rolldown) dep optimizer in Vitest browser mode breaks
      // CJS named-export interop unless the testing-library chain is
      // pre-bundled up front (aria-query is inlined into these bundles).
      "@testing-library/dom",
      "@testing-library/jest-dom/vitest",
      "@testing-library/user-event",
      "react-dom/client",
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
      "@siheom/core": siheomCoreSource,
      "@siheom/react": siheomReactSource,
      "@siheom/virtual-screen-reader": siheomVirtualScreenReaderSource,
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
