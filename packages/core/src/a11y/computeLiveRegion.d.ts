import type { A11yLiveRegion } from "./types.ts";
export declare function computeLive(el: Element, isVerbose?: boolean): "off" | "polite" | "assertive" | null | undefined;
export declare function computeAtomic(el: Element, isVerbose?: boolean): boolean | null | undefined;
export declare function computeRelevant(el: Element, isVerbose?: boolean): string | null | undefined;
export declare function computeLiveRegion(el: Element, isVerbose?: boolean): A11yLiveRegion | undefined;
