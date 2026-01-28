import { computeAccessibleName } from "dom-accessibility-api";
import type { A11yRelation, A11yRelations } from "./types.ts";

const RELATION_ATTRIBUTES = {
	activedescendant: "aria-activedescendant",
	controls: "aria-controls",
	describedby: "aria-describedby",
	details: "aria-details",
	errormessage: "aria-errormessage",
	flowto: "aria-flowto",
	labelledby: "aria-labelledby",
	owns: "aria-owns",
} as const;

const SINGLE_RELATIONS = new Set([
	"activedescendant",
	"errormessage",
	"details",
]);
const MULTI_RELATIONS = new Set([
	"labelledby",
	"describedby",
	"controls",
	"owns",
	"flowto",
]);

function resolveRelation(id: string, root: Element): A11yRelation | null {
	const doc = root.ownerDocument ?? (root as unknown as Document);
	const el = doc.getElementById(id);
	if (!el) return null;

	const name = computeAccessibleName(el);
	if (!name) return null;

	return { id, name };
}

function getIdRefs(el: Element, attr: string): string[] {
	const value = el.getAttribute(attr);
	if (!value) return [];
	return value.trim().split(/\s+/).filter(Boolean);
}

export function computeRelations(el: Element): A11yRelations | undefined {
	const relations: A11yRelations = {};
	const root = el.ownerDocument?.documentElement ?? el;
	let hasAny = false;

	for (const [key, attr] of Object.entries(RELATION_ATTRIBUTES)) {
		const ids = getIdRefs(el, attr);
		if (ids.length === 0) continue;

		if (SINGLE_RELATIONS.has(key)) {
			const firstId = ids[0];
			if (firstId) {
				const resolved = resolveRelation(firstId, root);
				if (resolved) {
					(relations as Record<string, A11yRelation>)[key] = resolved;
					hasAny = true;
				}
			}
		} else if (MULTI_RELATIONS.has(key)) {
			const resolved = ids
				.map((id) => resolveRelation(id, root))
				.filter((r): r is A11yRelation => r !== null);
			if (resolved.length > 0) {
				(relations as Record<string, A11yRelation[]>)[key] = resolved;
				hasAny = true;
			}
		}
	}

	return hasAny ? relations : undefined;
}
