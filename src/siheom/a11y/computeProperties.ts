import type { A11yProperties } from "./types.ts";

function getNumberAttribute(el: Element, attr: string): number | undefined {
	const val = el.getAttribute(attr);
	if (val === null) return undefined;
	const num = Number(val);
	return Number.isNaN(num) ? undefined : num;
}

export function computeLevel(el: Element, role: string): number | undefined {
	if (role !== "heading") return undefined;

	const ariaLevel = getNumberAttribute(el, "aria-level");
	if (ariaLevel !== undefined && ariaLevel >= 1 && ariaLevel <= 6) {
		return ariaLevel;
	}

	const tag = el.tagName;
	if (/^H[1-6]$/.test(tag)) {
		return Number.parseInt(tag[1] as string, 10);
	}

	return undefined;
}

export function computeHaspopup(el: Element): string | boolean | undefined {
	const val = el.getAttribute("aria-haspopup");
	if (val === null) return undefined;
	if (val === "true") return true;
	if (val === "false") return false;
	return val;
}

export function computeOrientation(
	el: Element,
): "horizontal" | "vertical" | undefined {
	const val = el.getAttribute("aria-orientation");
	if (val === "horizontal") return "horizontal";
	if (val === "vertical") return "vertical";
	return undefined;
}

export function computeMultiselectable(el: Element): boolean | undefined {
	const val = el.getAttribute("aria-multiselectable");
	if (val === "true") return true;
	return undefined;
}

export function computeAutocomplete(el: Element): string | undefined {
	const val = el.getAttribute("aria-autocomplete");
	if (val === "none" || val === "inline" || val === "list" || val === "both") {
		return val;
	}
	return undefined;
}

export function computeValuemin(el: Element): number | undefined {
	return getNumberAttribute(el, "aria-valuemin");
}

export function computeValuemax(el: Element): number | undefined {
	return getNumberAttribute(el, "aria-valuemax");
}

export function computeValuenow(el: Element): number | undefined {
	return getNumberAttribute(el, "aria-valuenow");
}

export function computeValuetext(el: Element): string | undefined {
	return el.getAttribute("aria-valuetext") ?? undefined;
}

export function computePosinset(el: Element): number | undefined {
	return getNumberAttribute(el, "aria-posinset");
}

export function computeSetsize(el: Element): number | undefined {
	return getNumberAttribute(el, "aria-setsize");
}

export function computeColcount(el: Element): number | undefined {
	return getNumberAttribute(el, "aria-colcount");
}

export function computeColindex(el: Element): number | undefined {
	return getNumberAttribute(el, "aria-colindex");
}

export function computeColspan(el: Element): number | undefined {
	return getNumberAttribute(el, "aria-colspan");
}

export function computeRowcount(el: Element): number | undefined {
	return getNumberAttribute(el, "aria-rowcount");
}

export function computeRowindex(el: Element): number | undefined {
	return getNumberAttribute(el, "aria-rowindex");
}

export function computeRowspan(el: Element): number | undefined {
	return getNumberAttribute(el, "aria-rowspan");
}

export function computeSort(
	el: Element,
): "ascending" | "descending" | "none" | "other" | undefined {
	const val = el.getAttribute("aria-sort");
	if (
		val === "ascending" ||
		val === "descending" ||
		val === "none" ||
		val === "other"
	) {
		return val;
	}
	return undefined;
}

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

const VALUE_RANGE_ROLES = new Set([
	"slider",
	"spinbutton",
	"progressbar",
	"scrollbar",
	"meter",
]);

const TABLE_ROLES = new Set(["table", "grid", "treegrid"]);
const CELL_ROLES = new Set(["cell", "gridcell", "columnheader", "rowheader"]);
const ROW_ROLE = "row";

export function computeProperties(
	el: Element,
	role: string,
): A11yProperties | undefined {
	const props: A11yProperties = {};
	let hasAny = false;

	const level = computeLevel(el, role);
	if (level !== undefined) {
		props.level = level;
		hasAny = true;
	}

	const haspopup = computeHaspopup(el);
	if (haspopup !== undefined) {
		props.haspopup = haspopup;
		hasAny = true;
	}

	const orientation = computeOrientation(el);
	if (orientation !== undefined) {
		props.orientation = orientation;
		hasAny = true;
	}

	const multiselectable = computeMultiselectable(el);
	if (multiselectable !== undefined) {
		props.multiselectable = multiselectable;
		hasAny = true;
	}

	const autocomplete = computeAutocomplete(el);
	if (autocomplete !== undefined) {
		props.autocomplete = autocomplete;
		hasAny = true;
	}

	if (VALUE_RANGE_ROLES.has(role)) {
		const valuemin = computeValuemin(el);
		if (valuemin !== undefined) {
			props.valuemin = valuemin;
			hasAny = true;
		}

		const valuemax = computeValuemax(el);
		if (valuemax !== undefined) {
			props.valuemax = valuemax;
			hasAny = true;
		}

		const valuenow = computeValuenow(el);
		if (valuenow !== undefined) {
			props.valuenow = valuenow;
			hasAny = true;
		}

		const valuetext = computeValuetext(el);
		if (valuetext !== undefined) {
			props.valuetext = valuetext;
			hasAny = true;
		}
	}

	if (SET_ITEM_ROLES.has(role)) {
		const posinset = computePosinset(el);
		if (posinset !== undefined) {
			props.posinset = posinset;
			hasAny = true;
		}

		const setsize = computeSetsize(el);
		if (setsize !== undefined) {
			props.setsize = setsize;
			hasAny = true;
		}
	}

	if (TABLE_ROLES.has(role)) {
		const colcount = computeColcount(el);
		if (colcount !== undefined) {
			props.colcount = colcount;
			hasAny = true;
		}

		const rowcount = computeRowcount(el);
		if (rowcount !== undefined) {
			props.rowcount = rowcount;
			hasAny = true;
		}
	}

	if (role === ROW_ROLE) {
		const rowindex = computeRowindex(el);
		if (rowindex !== undefined) {
			props.rowindex = rowindex;
			hasAny = true;
		}
	}

	if (CELL_ROLES.has(role)) {
		const colindex = computeColindex(el);
		if (colindex !== undefined) {
			props.colindex = colindex;
			hasAny = true;
		}

		const colspan = computeColspan(el);
		if (colspan !== undefined) {
			props.colspan = colspan;
			hasAny = true;
		}

		const rowspan = computeRowspan(el);
		if (rowspan !== undefined) {
			props.rowspan = rowspan;
			hasAny = true;
		}
	}

	if (role === "columnheader" || role === "rowheader") {
		const sort = computeSort(el);
		if (sort !== undefined) {
			props.sort = sort;
			hasAny = true;
		}
	}

	return hasAny ? props : undefined;
}
