import type { BuildA11yTreeOptions, SerializeOptions } from "./a11y/types.ts";
export type { A11yNode, A11yStates, BuildA11yTreeOptions } from "./a11y/types.ts";
export interface A11ySnapshotOptions extends BuildA11yTreeOptions {
    serialize?: SerializeOptions;
}
/**
 * Serializes an HTML element to an accessibility tree string.
 * Used for snapshot testing to verify accessible semantics.
 */
export declare function getA11ySnapshot(element: HTMLElement, options?: A11ySnapshotOptions): string;
/**
 * Returns the structured accessibility tree for programmatic access.
 */
export declare function getA11yTree(element: HTMLElement, options?: BuildA11yTreeOptions): import("./getA11ySnapshot.ts").A11yNode | null;
