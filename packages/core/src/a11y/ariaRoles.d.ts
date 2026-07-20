import { type ARIARole, type ARIADPubRole } from "aria-query";
export type ConcreteAriaRole = ARIARole | ARIADPubRole;
export declare const concreteRoles: readonly ConcreteAriaRole[];
export declare function isCheckableRole(role: string): boolean;
export declare function isNameFromContentRole(role: string): boolean;
