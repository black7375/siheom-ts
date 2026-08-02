import type {
  A11yAttributes,
  A11yInteraction,
  A11yNode,
  A11yStates,
  A11yProperties,
  A11yRelation,
  A11yRelations,
  A11yLiveRegion,
  A11yOther,
  A11yDragDrop,
  SerializeOptions,
} from "./types.ts";

function escapeString(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function serializeStates(states: A11yStates): string {
  const parts: string[] = [];

  if (states.hidden !== undefined) parts.push(`[hidden=${states.hidden}]`);
  if (states.disabled !== undefined) parts.push(`[disabled=${states.disabled}]`);
  if (states.focusable !== undefined) parts.push(`[focusable=${states.focusable}]`);
  if (states.focused !== undefined) parts.push(`[focused=${states.focused}]`);
  if (states.modal !== undefined) parts.push(`[modal=${states.modal}]`);
  if (states.expanded !== undefined) parts.push(`[expanded=${states.expanded}]`);
  if (states.pressed !== undefined) parts.push(`[pressed=${states.pressed}]`);
  if (states.checked !== undefined) parts.push(`[checked=${states.checked}]`);
  if (states.selected !== undefined) parts.push(`[selected=${states.selected}]`);
  if (states.current !== undefined) parts.push(`[current=${states.current}]`);
  if (states.invalid !== undefined) parts.push(`[invalid=${states.invalid}]`);
  if (states.required !== undefined) parts.push(`[required=${states.required}]`);
  if (states.readonly !== undefined) parts.push(`[readonly=${states.readonly}]`);

  return parts.join(" ");
}

function serializeInteraction(interaction: A11yInteraction, isVerbose: boolean): string {
  const parts: string[] = [];
  if (isVerbose || interaction.focusable) parts.push(`[focusable=${interaction.focusable}]`);
  if (isVerbose || interaction.tabbable) parts.push(`[tabbable=${interaction.tabbable}]`);
  if (isVerbose || interaction.focused) parts.push(`[focused=${interaction.focused}]`);
  if (interaction.keyshortcuts)
    parts.push(`[keyshortcuts="${escapeString(interaction.keyshortcuts)}"]`);
  if (interaction.accesskey) parts.push(`[accesskey="${escapeString(interaction.accesskey)}"]`);
  return parts.join(" ");
}

function serializeAttributes(attributes: A11yAttributes): string {
  return Object.entries(attributes)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `[${key}="${escapeString(value)}"]`)
    .join(" ");
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

function formatRelation(rel: A11yRelation | { id: string; name: string | null }): string {
  if (rel.name === null) {
    return `null (#${rel.id})`;
  }
  return `"${escapeString(rel.name)}" (#${rel.id})`;
}

function serializeRelationsBlock(relations: A11yRelations, baseIndent: string): string[] {
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
  if (liveRegion.live !== undefined) {
    const live = liveRegion.live === null ? null : `"${escapeString(liveRegion.live)}"`;
    parts.push(`[live=${live}]`);
  }
  if (liveRegion.atomic !== undefined) parts.push(`[atomic=${liveRegion.atomic}]`);
  if (liveRegion.relevant !== undefined) {
    const relevant = liveRegion.relevant === null ? null : `"${escapeString(liveRegion.relevant)}"`;
    parts.push(`[relevant=${relevant}]`);
  }
  if (liveRegion.busy !== undefined) parts.push(`[busy=${liveRegion.busy}]`);
  return parts.join(" ");
}

function serializeDragDrop(dragDrop: A11yDragDrop): string {
  const parts: string[] = [];
  if (dragDrop.dropeffect !== undefined) {
    if (dragDrop.dropeffect === null) {
      parts.push("[dropeffect=null] (deprecated)");
    } else {
      parts.push(`[dropeffect="${escapeString(dragDrop.dropeffect)}"] (deprecated)`);
    }
  }
  if (dragDrop.grabbed !== undefined) {
    if (dragDrop.grabbed === null) {
      parts.push("[grabbed=null] (deprecated)");
    } else {
      parts.push(`[grabbed=${dragDrop.grabbed}] (deprecated)`);
    }
  }
  return parts.join(" ");
}

function serializeOther(other: A11yOther): string {
  const keys = Object.keys(other).sort();
  const parts: string[] = [];

  for (const key of keys) {
    const val = other[key];
    if (val === undefined) continue;

    if (val === null) {
      parts.push(`[${key}=null]`);
    } else if (typeof val === "string") {
      parts.push(`[${key}="${escapeString(val)}"]`);
    } else {
      parts.push(`[${key}=${val}]`);
    }
  }

  return parts.join(" ");
}

export function serializeA11yTree(node: A11yNode, options: SerializeOptions = {}): string {
  return serializeNode(node, 0, options);
}

function serializeNode(node: A11yNode, depth: number, options: SerializeOptions): string {
  const indent = "  ".repeat(depth);
  const lines: string[] = [];
  const isVerbose = options.mode === "verbose";
  const hasDetails =
    node.value !== undefined ||
    node.description !== undefined ||
    node.states !== undefined ||
    node.interaction !== undefined ||
    node.properties !== undefined ||
    node.relations !== undefined ||
    node.liveRegion !== undefined ||
    node.dragDrop !== undefined ||
    node.attributes !== undefined ||
    node.other !== undefined;

  if (node.role === "" && node.name && node.children.length === 0 && !hasDetails) {
    lines.push(`${indent}"${escapeString(node.name)}"\n`);
    return lines.join("");
  }

  if (node.role === "" && !hasDetails) {
    for (const child of node.children) {
      lines.push(serializeNode(child, depth, options));
    }
    return lines.join("");
  }

  const role = node.role || "generic";
  let header = `${indent}${role}:`;
  if (node.name || isVerbose || node.children.length === 0) {
    header += ` "${escapeString(node.name)}"`;
  }

  const headerExtras: string[] = [];
  if (node.value !== undefined) {
    if (node.value === null) {
      headerExtras.push("[value=null]");
    } else {
      headerExtras.push(`[value="${escapeString(node.value)}"]`);
    }
  }
  if (node.description) {
    if (node.description === null) {
      headerExtras.push("[description=null]");
    } else {
      headerExtras.push(`[description="${escapeString(node.description)}"]`);
    }
  }
  if (isVerbose) headerExtras.push(`[childCount=${node.children.length}]`);
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

  const interactionStr = node.interaction ? serializeInteraction(node.interaction, isVerbose) : "";
  if (interactionStr) lines.push(`${childIndent}- interaction: ${interactionStr}\n`);

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

  const attributesStr = isVerbose && node.attributes ? serializeAttributes(node.attributes) : "";
  if (attributesStr) lines.push(`${childIndent}- attributes: ${attributesStr}\n`);

  if (node.other) {
    const otherStr = serializeOther(node.other);
    if (otherStr) {
      lines.push(`${childIndent}- other: ${otherStr}\n`);
    }
  }

  for (const child of node.children) {
    lines.push(serializeNode(child, depth + 1, options));
  }

  return lines.join("");
}
