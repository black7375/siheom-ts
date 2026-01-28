import type {
	A11yNode,
	A11yStates,
	A11yProperties,
	A11yRelation,
	A11yRelations,
	A11yLiveRegion,
	A11yDragDrop,
} from "./types.ts";

function escapeString(str: string): string {
	return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function serializeStates(states: A11yStates): string {
	const parts: string[] = [];

	if (states.hidden !== undefined) parts.push(`[hidden=${states.hidden}]`);
	if (states.disabled !== undefined)
		parts.push(`[disabled=${states.disabled}]`);
	if (states.focusable !== undefined)
		parts.push(`[focusable=${states.focusable}]`);
	if (states.focused !== undefined) parts.push(`[focused=${states.focused}]`);
	if (states.modal !== undefined) parts.push(`[modal=${states.modal}]`);
	if (states.expanded !== undefined)
		parts.push(`[expanded=${states.expanded}]`);
	if (states.pressed !== undefined) parts.push(`[pressed=${states.pressed}]`);
	if (states.checked !== undefined) parts.push(`[checked=${states.checked}]`);
	if (states.selected !== undefined)
		parts.push(`[selected=${states.selected}]`);
	if (states.current !== undefined) parts.push(`[current=${states.current}]`);
	if (states.invalid !== undefined) parts.push(`[invalid=${states.invalid}]`);
	if (states.required !== undefined)
		parts.push(`[required=${states.required}]`);
	if (states.readonly !== undefined)
		parts.push(`[readonly=${states.readonly}]`);
	if (states.busy !== undefined) parts.push(`[busy=${states.busy}]`);

	return parts.join(" ");
}

const PROPERTY_ORDER: (keyof A11yProperties)[] = [
	"autocomplete",
	"colcount",
	"colindex",
	"colspan",
	"haspopup",
	"level",
	"multiselectable",
	"orientation",
	"posinset",
	"rowcount",
	"rowindex",
	"rowspan",
	"setsize",
	"sort",
	"valuemax",
	"valuemin",
	"valuenow",
	"valuetext",
];

function serializeProperties(props: A11yProperties): string {
	const parts: string[] = [];

	for (const key of PROPERTY_ORDER) {
		const val = props[key];
		if (val === undefined) continue;

		if (typeof val === "string") {
			parts.push(`[${key}="${escapeString(val)}"]`);
		} else {
			parts.push(`[${key}=${val}]`);
		}
	}

	return parts.join(" ");
}

function formatRelation(rel: A11yRelation): string {
	return `"${escapeString(rel.name)}" (#${rel.id})`;
}

function serializeRelationsBlock(
	relations: A11yRelations,
	baseIndent: string,
): string[] {
	const lines: string[] = [];
	const indent = `${baseIndent}  `;

	lines.push(`${baseIndent}- relations:\n`);

	const keys = Object.keys(relations).sort() as (keyof A11yRelations)[];
	for (const key of keys) {
		const val = relations[key];
		if (!val) continue;

		if (Array.isArray(val)) {
			const values = val.map(formatRelation).join(", ");
			lines.push(`${indent}${key}: ${values}\n`);
		} else {
			lines.push(`${indent}${key}: ${formatRelation(val)}\n`);
		}
	}

	return lines;
}

function serializeLiveRegion(liveRegion: A11yLiveRegion): string {
	const parts: string[] = [];
	if (liveRegion.live !== undefined) parts.push(`[live=${liveRegion.live}]`);
	if (liveRegion.atomic !== undefined)
		parts.push(`[atomic=${liveRegion.atomic}]`);
	if (liveRegion.relevant !== undefined)
		parts.push(`[relevant="${escapeString(liveRegion.relevant)}"]`);
	return parts.join(" ");
}

function serializeDragDrop(dragDrop: A11yDragDrop): string {
	const parts: string[] = [];
	if (dragDrop.grabbed !== undefined) {
		parts.push(`[grabbed=${dragDrop.grabbed}] (deprecated)`);
	}
	if (dragDrop.dropeffect !== undefined) {
		parts.push(
			`[dropeffect="${escapeString(dragDrop.dropeffect)}"] (deprecated)`,
		);
	}
	return parts.join(" ");
}

export function serializeA11yTree(node: A11yNode, depth = 0): string {
	const indent = "  ".repeat(depth);
	const lines: string[] = [];

	if (node.role === "" && node.name && node.children.length === 0) {
		lines.push(`${indent}"${escapeString(node.name)}"\n`);
		return lines.join("");
	}

	if (node.role === "") {
		for (const child of node.children) {
			lines.push(serializeA11yTree(child, depth));
		}
		return lines.join("");
	}

	let header = `${indent}${node.role}:`;
	if (node.name) {
		header += ` "${escapeString(node.name)}"`;
	}

	const headerExtras: string[] = [];
	if (node.value !== undefined) {
		headerExtras.push(`[value="${escapeString(node.value)}"]`);
	}
	if (node.description) {
		headerExtras.push(`[description="${escapeString(node.description)}"]`);
	}
	if (headerExtras.length > 0) {
		header += ` ${headerExtras.join(" ")}`;
	}

	lines.push(`${header.trimEnd()}\n`);

	const childIndent = `${indent}  `;

	if (node.states) {
		const statesStr = serializeStates(node.states);
		if (statesStr) {
			lines.push(`${childIndent}- states: ${statesStr}\n`);
		}
	}

	if (node.properties) {
		const propsStr = serializeProperties(node.properties);
		if (propsStr) {
			lines.push(`${childIndent}- properties: ${propsStr}\n`);
		}
	}

	if (node.relations) {
		lines.push(...serializeRelationsBlock(node.relations, childIndent));
	}

	if (node.liveRegion) {
		const liveStr = serializeLiveRegion(node.liveRegion);
		if (liveStr) {
			lines.push(`${childIndent}- live-region: ${liveStr}\n`);
		}
	}

	if (node.dragDrop) {
		const dragStr = serializeDragDrop(node.dragDrop);
		if (dragStr) {
			lines.push(`${childIndent}- drag-and-drop: ${dragStr}\n`);
		}
	}

	for (const child of node.children) {
		lines.push(serializeA11yTree(child, depth + 1));
	}

	return lines.join("");
}
