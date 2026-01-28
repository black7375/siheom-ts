import type { A11yDragDrop } from "./types.ts";

export function computeGrabbed(el: Element): boolean | undefined {
	const val = el.getAttribute("aria-grabbed");
	if (val === "true") return true;
	if (val === "false") return false;
	return undefined;
}

export function computeDropeffect(el: Element): string | undefined {
	const val = el.getAttribute("aria-dropeffect");
	if (val) return val;
	return undefined;
}

export function computeDragDrop(el: Element): A11yDragDrop | undefined {
	const dragDrop: A11yDragDrop = {};
	let hasAny = false;

	const grabbed = computeGrabbed(el);
	if (grabbed !== undefined) {
		dragDrop.grabbed = grabbed;
		hasAny = true;
	}

	const dropeffect = computeDropeffect(el);
	if (dropeffect !== undefined) {
		dragDrop.dropeffect = dropeffect;
		hasAny = true;
	}

	return hasAny ? dragDrop : undefined;
}
