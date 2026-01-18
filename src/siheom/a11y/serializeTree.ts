import type { A11yNode } from "./types.ts";

export function serializeA11yTree(node: A11yNode, depth = 0): string {
	const indent = "  ".repeat(depth);
	const lines: string[] = [];

	if (node.role === "" && node.name && node.children.length === 0) {
		lines.push(`${indent}"${node.name}"\n`);
		return lines.join("");
	}

	if (node.role === "") {
		for (const child of node.children) {
			lines.push(serializeA11yTree(child, depth));
		}
		return lines.join("");
	}

	let line = indent + node.role;

	if (node.name) {
		line += `: "${node.name}"`;
	}

	const stateStrings: string[] = [];

	if (node.level !== undefined) {
		stateStrings.push(`[level=${node.level}]`);
	}

	if (node.states.disabled) {
		stateStrings.push("[disabled]");
	}
	if (node.states.checked !== undefined) {
		stateStrings.push(`[checked=${node.states.checked}]`);
	}
	if (node.states.expanded !== undefined) {
		stateStrings.push(`[expanded=${node.states.expanded}]`);
	}
	if (node.states.selected !== undefined) {
		stateStrings.push(`[selected=${node.states.selected}]`);
	}
	if (node.states.pressed !== undefined) {
		stateStrings.push(`[pressed=${node.states.pressed}]`);
	}
	if (node.states.current !== undefined) {
		stateStrings.push(`[current=${node.states.current}]`);
	}
	if (node.states.busy !== undefined) {
		stateStrings.push(`[busy=${node.states.busy}]`);
	}
	if (node.states.invalid !== undefined) {
		stateStrings.push(`[invalid=${node.states.invalid}]`);
	}
	if (node.states.required !== undefined) {
		stateStrings.push(`[required=${node.states.required}]`);
	}
	if (node.states.readonly !== undefined) {
		stateStrings.push(`[readonly=${node.states.readonly}]`);
	}
	if (node.states.valueNow !== undefined) {
		stateStrings.push(`[valuenow=${node.states.valueNow}]`);
	}
	if (node.posinset !== undefined) {
		stateStrings.push(`[posinset=${node.posinset}]`);
	}
	if (node.setsize !== undefined) {
		stateStrings.push(`[setsize=${node.setsize}]`);
	}
	if (node.value !== undefined) {
		stateStrings.push(`[value="${node.value}"]`);
	}
	if (node.description) {
		stateStrings.push(`[description="${node.description}"]`);
	}

	if (stateStrings.length > 0) {
		line += ` ${stateStrings.join(" ")}`;
	}

	lines.push(`${line.trimEnd()}\n`);

	for (const child of node.children) {
		lines.push(serializeA11yTree(child, depth + 1));
	}

	return lines.join("");
}
