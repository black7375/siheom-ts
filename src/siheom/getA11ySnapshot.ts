import { buildA11yTree } from "./a11y/buildTree.ts";
import { serializeA11yTree } from "./a11y/serializeTree.ts";
import type { BuildA11yTreeOptions, SerializeOptions } from "./a11y/types.ts";

export type {
	A11yNode,
	A11yStates,
	BuildA11yTreeOptions,
} from "./a11y/types.ts";

export interface A11ySnapshotOptions extends BuildA11yTreeOptions {
	serialize?: SerializeOptions;
}

/**
 * Serializes an HTML element to an accessibility tree string.
 * Used for snapshot testing to verify accessible semantics.
 */
export function getA11ySnapshot(
	element: HTMLElement,
	options: A11ySnapshotOptions = {},
): string {
	const tree = buildA11yTree(element, options);
	if (!tree) {
		return "";
	}
	const serializeOpts: SerializeOptions = {
		mode: options.serialize?.mode ?? options.mode,
	};
	return serializeA11yTree(tree, serializeOpts).trim();
}

/**
 * Returns the structured accessibility tree for programmatic access.
 */
export function getA11yTree(
	element: HTMLElement,
	options: BuildA11yTreeOptions = {},
) {
	return buildA11yTree(element, options);
}
