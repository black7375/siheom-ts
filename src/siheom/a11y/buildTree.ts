import {
	computeAccessibleName,
	computeAccessibleDescription,
} from "dom-accessibility-api";
import type { A11yNode, BuildA11yTreeOptions } from "./types.ts";
import { getRole } from "./roleHelpers.ts";
import { isInaccessible } from "./isAccessible.ts";
import { computeStates } from "./computeStates.ts";
import { computeProperties } from "./computeProperties.ts";
import { computeRelations } from "./computeRelations.ts";
import { computeLiveRegion } from "./computeLiveRegion.ts";
import { computeDragDrop } from "./computeDragDrop.ts";
import { isNameFromContentRole } from "./ariaRoles.ts";

const SKIP_ROLES = new Set(["generic", "presentation", "none"]);

export function buildA11yTree(
	el: HTMLElement,
	options: BuildA11yTreeOptions = {},
): A11yNode | null {
	const isVerbose = options.mode === "verbose";
	if (isInaccessible(el)) {
		return null;
	}

	if (el.tagName === "IFRAME" || el.tagName === "SVG") {
		return null;
	}

	const role = getRole(el);

	if (SKIP_ROLES.has(role) || role === "") {
		const states = computeStates(el, role, isVerbose);
		const relations = computeRelations(el, isVerbose);
		const liveRegion = computeLiveRegion(el, isVerbose);
		const dragDrop = computeDragDrop(el, isVerbose);
		const other = options.computeOther?.(el);

		const hasMeaningfulAttributes =
			states || relations || liveRegion || dragDrop || other;

		// Verbose mode: always output as generic: "" with full tree preserved
		if (isVerbose) {
			const name = computeAccessibleName(el);
			const description = computeAccessibleDescription(el);

			const node: A11yNode = {
				role: "generic",
				name,
				children: processChildren(el, options),
			};

			if (description) node.description = description;
			if (states) node.states = states;
			if (relations) node.relations = relations;
			if (liveRegion) node.liveRegion = liveRegion;
			if (dragDrop) node.dragDrop = dragDrop;
			if (other && Object.keys(other).length > 0) node.other = other;

			return node;
		}

		// Compact mode: only output if has meaningful attributes
		if (hasMeaningfulAttributes) {
			const name = computeAccessibleName(el);
			const description = computeAccessibleDescription(el);

			const node: A11yNode = {
				role: "generic",
				name,
				children: processChildren(el, options),
			};

			if (description) node.description = description;
			if (states) node.states = states;
			if (relations) node.relations = relations;
			if (liveRegion) node.liveRegion = liveRegion;
			if (dragDrop) node.dragDrop = dragDrop;
			if (other && Object.keys(other).length > 0) node.other = other;

			return node;
		}

		const children = processChildren(el, options);
		if (children.length > 0) {
			return { role: "", name: "", children };
		}
		return null;
	}

	const name = computeAccessibleName(el);
	const description = computeAccessibleDescription(el);

	const shouldSkipChildren =
		isNameFromContentRole(role) && hasOnlyTextMatchingName(el, name);

	const node: A11yNode = {
		role,
		name,
		children: shouldSkipChildren ? [] : processChildren(el, options),
	};

	if (description) {
		node.description = description;
	}

	if (isFormControl(el)) {
		const value = (el as HTMLInputElement).value;
		node.value = value;
	}

	const states = computeStates(el, role, isVerbose);
	if (states) {
		node.states = states;
	}

	const properties = computeProperties(el, role);
	if (properties) {
		node.properties = properties;
	}

	const relations = computeRelations(el, isVerbose);
	if (relations) {
		node.relations = relations;
	}

	const liveRegion = computeLiveRegion(el, isVerbose);
	if (liveRegion) {
		node.liveRegion = liveRegion;
	}

	const dragDrop = computeDragDrop(el, isVerbose);
	if (dragDrop) {
		node.dragDrop = dragDrop;
	}

	const other = options.computeOther?.(el);
	if (other && Object.keys(other).length > 0) {
		node.other = other;
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

function processChildren(
	el: HTMLElement,
	options: BuildA11yTreeOptions = {},
): A11yNode[] {
	const children: A11yNode[] = [];
	const isVerbose = options.mode === "verbose";

	for (const child of el.childNodes) {
		if (child instanceof HTMLElement) {
			const node = buildA11yTree(child, options);
			if (node) {
				if (isVerbose) {
					children.push(node);
				} else if (node.role === "" && node.children.length > 0) {
					children.push(...node.children);
				} else if (node.role !== "") {
					children.push(node);
				}
			}
		} else if (child instanceof Text) {
			const text = child.textContent?.trim();
			if (text) {
				children.push({
					role: "",
					name: text,
					children: [],
				});
			}
		}
	}

	return children;
}
