import type { A11yStates } from "./types.ts";
import { isCheckableRole } from "./ariaRoles.ts";

function checkBooleanAttribute(
	el: Element,
	attr: string,
	isVerbose: boolean,
): boolean | null | undefined {
	const val = el.getAttribute(attr);
	if (val === "true") return true;
	if (val === "false") return false;
	if (isVerbose && el.hasAttribute(attr)) return null;
	return undefined;
}

function checkTriStateAttribute(
	el: Element,
	attr: string,
	isVerbose: boolean,
): boolean | "mixed" | null | undefined {
	const val = el.getAttribute(attr);
	if (val === "true") return true;
	if (val === "false") return false;
	if (val === "mixed") return "mixed";
	if (isVerbose && el.hasAttribute(attr)) return null;
	return undefined;
}

export function computeAriaHidden(
	el: Element,
	isVerbose = false,
): boolean | null | undefined {
	return checkBooleanAttribute(el, "aria-hidden", isVerbose);
}

export function computeAriaDisabled(
	el: Element,
	isVerbose = false,
): boolean | null | undefined {
	if ((el as HTMLButtonElement).disabled) {
		return true;
	}
	const val = el.getAttribute("aria-disabled");
	if (val === "true") return true;
	if (isVerbose && el.hasAttribute("aria-disabled")) return null;
	return undefined;
}

export function computeAriaModal(
	el: Element,
	isVerbose = false,
): boolean | null | undefined {
	return checkBooleanAttribute(el, "aria-modal", isVerbose);
}

export function computeAriaExpanded(
	el: Element,
	isVerbose = false,
): boolean | null | undefined {
	return checkBooleanAttribute(el, "aria-expanded", isVerbose);
}

export function computeAriaPressed(
	el: Element,
	isVerbose = false,
): boolean | "mixed" | null | undefined {
	return checkTriStateAttribute(el, "aria-pressed", isVerbose);
}

export function computeAriaChecked(
	el: Element,
	isVerbose = false,
): boolean | "mixed" | null | undefined {
	if ("indeterminate" in el && (el as HTMLInputElement).indeterminate) {
		return "mixed";
	}
	if ("checked" in el) {
		return (el as HTMLInputElement).checked;
	}
	return checkTriStateAttribute(el, "aria-checked", isVerbose);
}

export function computeAriaSelected(
	el: Element,
	isVerbose = false,
): boolean | null | undefined {
	if (el.tagName === "OPTION") {
		return (el as HTMLOptionElement).selected;
	}
	return checkBooleanAttribute(el, "aria-selected", isVerbose);
}

export function computeAriaCurrent(
	el: Element,
	isVerbose = false,
): string | boolean | null | undefined {
	const value = el.getAttribute("aria-current");
	if (value === "true") return true;
	if (value === "false") return false;
	if (value) return value;
	if (isVerbose && el.hasAttribute("aria-current")) return null;
	return undefined;
}

export function computeAriaInvalid(
	el: Element,
	isVerbose = false,
): boolean | "grammar" | "spelling" | null | undefined {
	const val = el.getAttribute("aria-invalid");
	if (val === "true") return true;
	if (val === "false") return false;
	if (val === "grammar") return "grammar";
	if (val === "spelling") return "spelling";
	if (isVerbose && el.hasAttribute("aria-invalid")) return null;
	return undefined;
}

export function computeAriaRequired(
	el: Element,
	isVerbose = false,
): boolean | null | undefined {
	if ("required" in el && (el as HTMLInputElement).required) {
		return true;
	}
	return checkBooleanAttribute(el, "aria-required", isVerbose);
}

export function computeAriaReadonly(
	el: Element,
	isVerbose = false,
): boolean | null | undefined {
	if ("readOnly" in el && (el as HTMLInputElement).readOnly) {
		return true;
	}
	return checkBooleanAttribute(el, "aria-readonly", isVerbose);
}

export function computeAriaBusy(
	el: Element,
	isVerbose = false,
): boolean | null | undefined {
	return checkBooleanAttribute(el, "aria-busy", isVerbose);
}

export function computeStates(
	el: Element,
	role: string,
	isVerbose = false,
): A11yStates | undefined {
	const states: A11yStates = {};
	let hasAny = false;

	const hidden = computeAriaHidden(el, isVerbose);
	if (hidden !== undefined) {
		states.hidden = hidden;
		hasAny = true;
	}

	const disabled = computeAriaDisabled(el, isVerbose);
	if (disabled !== undefined) {
		states.disabled = disabled;
		hasAny = true;
	}

	const modal = computeAriaModal(el, isVerbose);
	if (modal !== undefined) {
		states.modal = modal;
		hasAny = true;
	}

	const expanded = computeAriaExpanded(el, isVerbose);
	if (expanded !== undefined) {
		states.expanded = expanded;
		hasAny = true;
	}

	const pressed = computeAriaPressed(el, isVerbose);
	if (pressed !== undefined) {
		states.pressed = pressed;
		hasAny = true;
	}

	if (isCheckableRole(role)) {
		const checked = computeAriaChecked(el, isVerbose);
		if (checked !== undefined) {
			states.checked = checked;
			hasAny = true;
		}
	}

	const selected = computeAriaSelected(el, isVerbose);
	if (selected !== undefined) {
		states.selected = selected;
		hasAny = true;
	}

	const current = computeAriaCurrent(el, isVerbose);
	if (current !== undefined) {
		states.current = current;
		hasAny = true;
	}

	const invalid = computeAriaInvalid(el, isVerbose);
	if (invalid !== undefined) {
		states.invalid = invalid;
		hasAny = true;
	}

	const required = computeAriaRequired(el, isVerbose);
	if (required !== undefined) {
		states.required = required;
		hasAny = true;
	}

	const readonly = computeAriaReadonly(el, isVerbose);
	if (readonly !== undefined) {
		states.readonly = readonly;
		hasAny = true;
	}

	const busy = computeAriaBusy(el, isVerbose);
	if (busy !== undefined) {
		states.busy = busy;
		hasAny = true;
	}

	return hasAny ? states : undefined;
}
