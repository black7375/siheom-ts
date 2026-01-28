import type { A11yLiveRegion } from "./types.ts";

export function computeLive(
	el: Element,
): "off" | "polite" | "assertive" | undefined {
	const val = el.getAttribute("aria-live");
	if (val === "off" || val === "polite" || val === "assertive") {
		return val;
	}
	return undefined;
}

export function computeAtomic(el: Element): boolean | undefined {
	const val = el.getAttribute("aria-atomic");
	if (val === "true") return true;
	if (val === "false") return false;
	return undefined;
}

export function computeRelevant(el: Element): string | undefined {
	const val = el.getAttribute("aria-relevant");
	if (val) return val;
	return undefined;
}

export function computeLiveRegion(el: Element): A11yLiveRegion | undefined {
	const region: A11yLiveRegion = {};
	let hasAny = false;

	const live = computeLive(el);
	if (live !== undefined) {
		region.live = live;
		hasAny = true;
	}

	const atomic = computeAtomic(el);
	if (atomic !== undefined) {
		region.atomic = atomic;
		hasAny = true;
	}

	const relevant = computeRelevant(el);
	if (relevant !== undefined) {
		region.relevant = relevant;
		hasAny = true;
	}

	return hasAny ? region : undefined;
}
