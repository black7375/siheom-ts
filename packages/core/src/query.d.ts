import type { Locator } from "./types";
import { type ConcreteAriaRole } from "./a11y/ariaRoles";
export declare const getElement: <T extends boolean>(locator: Locator, isVisible: T) => T extends true ? HTMLElement : HTMLElement | null;
export declare const getElements: <T extends boolean>(locator: Locator, isVisible: T) => T extends true ? HTMLElement[] : HTMLElement[] | null;
export declare function locatorLog(target: Locator): string;
declare const CUSTOM_ROLES: readonly ["label", "text"];
type CustomRole = (typeof CUSTOM_ROLES)[number];
export type RoleName = ConcreteAriaRole | CustomRole;
type QueryObject = {
    [K in RoleName]: (name: string | RegExp) => Locator;
} & {
    within: (container: Locator, target: Locator) => Locator;
};
export declare const query: QueryObject;
export {};
