/**
 * Copies showcase outputs (a11y snapshots, screenshots, test sources) into the
 * docs site for section 7 examples.
 *
 * Intended to run locally before `bun run build` and in CI once the full
 * React showcase emits artifacts. For now this is a no-op placeholder.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const showcaseRoot = resolve(import.meta.dirname, "../../react-example");
const docsPublic = resolve(import.meta.dirname, "../public/showcase");

if (!existsSync(showcaseRoot)) {
	console.warn(
		`[sync-showcase] showcase app not found at ${showcaseRoot}; skipping.`,
	);
	process.exit(0);
}

console.log(
	`[sync-showcase] placeholder — will copy artifacts to ${docsPublic} when showcase outputs are wired.`,
);
