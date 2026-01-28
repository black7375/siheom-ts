import type { A11yStates } from "./types.ts";
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

export function computeAriaHidden(el: Element): boolean | undefined {
	return checkBooleanAttribute(el, "aria-hidden");
}

export function computeAriaDisabled(el: Element): boolean | undefined {
	if ((el as HTMLButtonElement).disabled) {
		return true;
	}
	const val = el.getAttribute("aria-disabled");
	if (val === "true") return true;
	return undefined;
}

export function computeAriaModal(el: Element): boolean | undefined {
	return checkBooleanAttribute(el, "aria-modal");
}

export function computeAriaExpanded(el: Element): boolean | undefined {
	return checkBooleanAttribute(el, "aria-expanded");
}

export function computeAriaPressed(el: Element): boolean | "mixed" | undefined {
	return checkTriStateAttribute(el, "aria-pressed");
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

export function computeAriaSelected(el: Element): boolean | undefined {
	if (el.tagName === "OPTION") {
		return (el as HTMLOptionElement).selected;
	}
	return checkBooleanAttribute(el, "aria-selected");
}

export function computeAriaCurrent(el: Element): string | boolean | undefined {
	const value = el.getAttribute("aria-current");
	if (value === "true") return true;
	if (value === "false") return false;
	if (value) return value;
	return undefined;
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

export function computeAriaBusy(el: Element): boolean | undefined {
	return checkBooleanAttribute(el, "aria-busy");
}

export function computeStates(
	el: Element,
	role: string,
): A11yStates | undefined {
	const states: A11yStates = {};
	let hasAny = false;

	const hidden = computeAriaHidden(el);
	if (hidden !== undefined) {
		states.hidden = hidden;
		hasAny = true;
	}

	const disabled = computeAriaDisabled(el);
	if (disabled !== undefined) {
		states.disabled = disabled;
		hasAny = true;
	}

	const modal = computeAriaModal(el);
	if (modal !== undefined) {
		states.modal = modal;
		hasAny = true;
	}

	const expanded = computeAriaExpanded(el);
	if (expanded !== undefined) {
		states.expanded = expanded;
		hasAny = true;
	}

	const pressed = computeAriaPressed(el);
	if (pressed !== undefined) {
		states.pressed = pressed;
		hasAny = true;
	}

	if (isCheckableRole(role)) {
		const checked = computeAriaChecked(el);
		if (checked !== undefined) {
			states.checked = checked;
			hasAny = true;
		}
	}

	const selected = computeAriaSelected(el);
	if (selected !== undefined) {
		states.selected = selected;
		hasAny = true;
	}

	const current = computeAriaCurrent(el);
	if (current !== undefined) {
		states.current = current;
		hasAny = true;
	}

	const invalid = computeAriaInvalid(el);
	if (invalid !== undefined) {
		states.invalid = invalid;
		hasAny = true;
	}

	const required = computeAriaRequired(el);
	if (required !== undefined) {
		states.required = required;
		hasAny = true;
	}

	const readonly = computeAriaReadonly(el);
	if (readonly !== undefined) {
		states.readonly = readonly;
		hasAny = true;
	}

	const busy = computeAriaBusy(el);
	if (busy !== undefined) {
		states.busy = busy;
		hasAny = true;
	}

	return hasAny ? states : undefined;
}
