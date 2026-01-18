import {
	computeAccessibleName,
	computeAccessibleDescription,
} from "dom-accessibility-api";
import type { A11yNode } from "./types.ts";
import { getRole } from "./roleHelpers.ts";
import { isInaccessible } from "./isAccessible.ts";
import {
	computeAllStates,
	computeHeadingLevel,
	computeAriaPosinset,
	computeAriaSetsize,
} from "./computeStates.ts";
import { isNameFromContentRole } from "./ariaRoles.ts";

const SKIP_ROLES = new Set(["generic", "presentation", "none"]);
const SET_ITEM_ROLES = new Set([
	"listitem",
	"menuitem",
	"menuitemcheckbox",
	"menuitemradio",
	"option",
	"tab",
	"treeitem",
	"row",
]);

export function buildA11yTree(el: HTMLElement): A11yNode | null {
	if (isInaccessible(el)) {
		return null;
	}

	if (el.tagName === "IFRAME" || el.tagName === "SVG") {
		return null;
	}

	const role = getRole(el);

	if (SKIP_ROLES.has(role) || role === "") {
		const children = processChildren(el);
		if (children.length > 0) {
			return { role: "", name: "", states: {}, children };
		}
		return null;
	}

	const name = computeAccessibleName(el);
	const description = computeAccessibleDescription(el);
	const states = computeAllStates(el, role);

	const shouldSkipChildren =
		isNameFromContentRole(role) && hasOnlyTextMatchingName(el, name);

	const node: A11yNode = {
		role,
		name,
		states,
		children: shouldSkipChildren ? [] : processChildren(el),
	};

	if (description) {
		node.description = description;
	}

	if (role === "heading") {
		const level = computeHeadingLevel(el);
		if (level) {
			node.level = level;
		}
	}

	if (isFormControl(el)) {
		const value = (el as HTMLInputElement).value;
		node.value = value;
	}

	if (SET_ITEM_ROLES.has(role)) {
		const posinset = computeAriaPosinset(el);
		const setsize = computeAriaSetsize(el);
		if (posinset !== undefined) node.posinset = posinset;
		if (setsize !== undefined) node.setsize = setsize;
	}

	return node;
}

function hasOnlyTextMatchingName(el: HTMLElement, name: string): boolean {
	const textContent = el.textContent?.trim() || "";
	return textContent === name;
}

function isFormControl(el: HTMLElement): boolean {
	const tag = el.tagName;
	return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function processChildren(el: HTMLElement): A11yNode[] {
	const children: A11yNode[] = [];

	for (const child of el.childNodes) {
		if (child instanceof HTMLElement) {
			const node = buildA11yTree(child);
			if (node) {
				// Flatten empty wrapper nodes (no role)
				if (node.role === "" && node.children.length > 0) {
					children.push(...node.children);
				} else if (node.role !== "") {
					children.push(node);
				}
			}
		} else if (child instanceof Text) {
			const text = child.textContent?.trim();
			if (text) {
				// Raw text without explicit role (per user preference)
				children.push({
					role: "",
					name: text,
					states: {},
					children: [],
				});
			}
		}
	}

	return children;
}
