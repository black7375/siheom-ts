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
		include: ["react-aria-components", "@ariakit/react", "@ark-ui/react"],
	},
	test: {
		alias: {
			"@showcase/tanstack-link": tanstackLinkStub,
		},
		setupFiles: "./test/setupTests.ts",
		include: ["test/**/*.test.tsx"],
		css: true,
		globals: true,
		...vitestBrowserMode,
	},
});
