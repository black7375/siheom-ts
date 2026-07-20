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

const siheomVitestBrowserReact = path.resolve(
	dirname,
	"../../packages/vitest-browser-react/src/index.ts",
);

export default defineConfig({
	plugins: [react(), tailwindcss()],
	define: vitestBrowserDefine,
	root: "./",
	resolve: {
		tsconfigPaths: true,
		alias: {
			"@siheom/react": siheomVitestBrowserReact,
			"@showcase/tanstack-link": tanstackLinkStub,
		},
	},
	test: {
		alias: {
			"@siheom/react": siheomVitestBrowserReact,
			"@showcase/tanstack-link": tanstackLinkStub,
			"@testing-library/react": "vitest-browser-react"
		},
		setupFiles: "./test/setupTests.vitest-browser-react.ts",
		include: ["test/**/*.test.tsx"],
		css: true,
		globals: true,
		...vitestBrowserMode,
	},
});
