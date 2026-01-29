import { computeAccessibleName } from "dom-accessibility-api";
import type {
	A11yRelation,
	A11yRelationOrNull,
	A11yRelations,
} from "./types.ts";

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

function resolveRelation(
	id: string,
	root: Element,
	isVerbose: boolean,
): A11yRelation | A11yRelationOrNull | null {
	const doc = root.ownerDocument ?? (root as unknown as Document);
	const el = doc.getElementById(id);
	if (!el) {
		return isVerbose ? { id, name: null } : null;
	}

	const name = computeAccessibleName(el);
	if (!name) {
		return isVerbose ? { id, name: null } : null;
	}

	return { id, name };
}

function getIdRefs(el: Element, attr: string): string[] {
	const value = el.getAttribute(attr);
	if (!value) return [];
	return value.trim().split(/\s+/).filter(Boolean);
}

export function computeRelations(
	el: Element,
	isVerbose = false,
): A11yRelations | undefined {
	const relations: A11yRelations = {};
	const root = el.ownerDocument?.documentElement ?? el;
	let hasAny = false;

	for (const [key, attr] of Object.entries(RELATION_ATTRIBUTES)) {
		const hasAttr = el.hasAttribute(attr);
		const ids = getIdRefs(el, attr);

		if (isVerbose && hasAttr && ids.length === 0) {
			(relations as Record<string, null>)[key] = null;
			hasAny = true;
			continue;
		}

		if (ids.length === 0) continue;

		if (SINGLE_RELATIONS.has(key)) {
			const firstId = ids[0];
			if (firstId) {
				const resolved = resolveRelation(firstId, root, isVerbose);
				if (resolved) {
					(relations as Record<string, A11yRelation | A11yRelationOrNull>)[
						key
					] = resolved;
					hasAny = true;
				}
			}
		} else if (MULTI_RELATIONS.has(key)) {
			const resolved = ids
				.map((id) => resolveRelation(id, root, isVerbose))
				.filter((r): r is A11yRelation | A11yRelationOrNull => r !== null);
			if (resolved.length > 0) {
				(relations as Record<string, (A11yRelation | A11yRelationOrNull)[]>)[
					key
				] = resolved;
				hasAny = true;
			}
		}
	}

	return hasAny ? relations : undefined;
}
