import type { A11yNodeStates } from "./types.ts";
import { isCheckableRole } from "./ariaRoles.ts";

function checkBooleanAttribute(el: Element, attr: string): boolean | undefined {
	const val = el.getAttribute(attr);
	if (val === "true") return true;
	if (val === "false") return false;
	return undefined;
}

function checkTriStateAttribute(
	el: Element,
	attr: string,
): boolean | "mixed" | undefined {
	const val = el.getAttribute(attr);
	if (val === "true") return true;
	if (val === "false") return false;
	if (val === "mixed") return "mixed";
	return undefined;
}

export function computeAriaChecked(el: Element): boolean | "mixed" | undefined {
	if ("indeterminate" in el && (el as HTMLInputElement).indeterminate) {
		return "mixed";
	}
	if ("checked" in el) {
		return (el as HTMLInputElement).checked;
	}
	return checkTriStateAttribute(el, "aria-checked");
}

export function computeAriaExpanded(el: Element): boolean | undefined {
	return checkBooleanAttribute(el, "aria-expanded");
}

export function computeAriaSelected(el: Element): boolean | undefined {
	if (el.tagName === "OPTION") {
		return (el as HTMLOptionElement).selected;
	}
	return checkBooleanAttribute(el, "aria-selected");
}

export function computeAriaPressed(el: Element): boolean | "mixed" | undefined {
	return checkTriStateAttribute(el, "aria-pressed");
}

export function computeAriaDisabled(el: Element): boolean {
	if ((el as HTMLButtonElement).disabled) {
		return true;
	}
	return el.getAttribute("aria-disabled") === "true";
}

export function computeAriaCurrent(el: Element): string | boolean | undefined {
	const value = el.getAttribute("aria-current");
	if (value === "true") return true;
	if (value === "false") return false;
	if (value) return value;
	return undefined;
}

export function computeAriaBusy(el: Element): boolean | undefined {
	return checkBooleanAttribute(el, "aria-busy");
}

export function computeAriaInvalid(
	el: Element,
): boolean | "grammar" | "spelling" | undefined {
	const val = el.getAttribute("aria-invalid");
	if (val === "true") return true;
	if (val === "false") return false;
	if (val === "grammar") return "grammar";
	if (val === "spelling") return "spelling";
	return undefined;
}

export function computeAriaRequired(el: Element): boolean | undefined {
	if ("required" in el && (el as HTMLInputElement).required) {
		return true;
	}
	return checkBooleanAttribute(el, "aria-required");
}

export function computeAriaReadonly(el: Element): boolean | undefined {
	if ("readOnly" in el && (el as HTMLInputElement).readOnly) {
		return true;
	}
	return checkBooleanAttribute(el, "aria-readonly");
}

export function computeHeadingLevel(el: Element): number | undefined {
	const implicit: Record<string, number> = {
		H1: 1,
		H2: 2,
		H3: 3,
		H4: 4,
		H5: 5,
		H6: 6,
	};

	const ariaLevel = el.getAttribute("aria-level");
	if (ariaLevel) {
		return Number(ariaLevel);
	}

	return implicit[el.tagName];
}

export function computeAriaValueNow(el: Element): number | undefined {
	const val = el.getAttribute("aria-valuenow");
	return val ? Number(val) : undefined;
}

export function computeAriaValueMin(el: Element): number | undefined {
	const val = el.getAttribute("aria-valuemin");
	return val ? Number(val) : undefined;
}

export function computeAriaValueMax(el: Element): number | undefined {
	const val = el.getAttribute("aria-valuemax");
	return val ? Number(val) : undefined;
}

export function computeAriaValueText(el: Element): string | undefined {
	return el.getAttribute("aria-valuetext") ?? undefined;
}

export function computeAriaPosinset(el: Element): number | undefined {
	const val = el.getAttribute("aria-posinset");
	return val ? Number(val) : undefined;
}

export function computeAriaSetsize(el: Element): number | undefined {
	const val = el.getAttribute("aria-setsize");
	return val ? Number(val) : undefined;
}

export function computeAllStates(el: Element, role: string): A11yNodeStates {
	const states: A11yNodeStates = {};

	if (isCheckableRole(role)) {
		const checked = computeAriaChecked(el);
		if (checked !== undefined) states.checked = checked;
	}

	const expanded = computeAriaExpanded(el);
	if (expanded !== undefined) states.expanded = expanded;

	const selected = computeAriaSelected(el);
	if (selected !== undefined) states.selected = selected;

	const disabled = computeAriaDisabled(el);
	if (disabled) states.disabled = disabled;

	const pressed = computeAriaPressed(el);
	if (pressed !== undefined) states.pressed = pressed;

	const current = computeAriaCurrent(el);
	if (current !== undefined) states.current = current;

	const busy = computeAriaBusy(el);
	if (busy !== undefined) states.busy = busy;

	const invalid = computeAriaInvalid(el);
	if (invalid !== undefined) states.invalid = invalid;

	const required = computeAriaRequired(el);
	if (required !== undefined) states.required = required;

	const readonly = computeAriaReadonly(el);
	if (readonly !== undefined) states.readonly = readonly;

	const valueNow = computeAriaValueNow(el);
	if (valueNow !== undefined) states.valueNow = valueNow;

	const valueMin = computeAriaValueMin(el);
	if (valueMin !== undefined) states.valueMin = valueMin;

	const valueMax = computeAriaValueMax(el);
	if (valueMax !== undefined) states.valueMax = valueMax;

	const valueText = computeAriaValueText(el);
	if (valueText !== undefined) states.valueText = valueText;

	return states;
}
