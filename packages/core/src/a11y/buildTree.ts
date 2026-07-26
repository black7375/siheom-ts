import { computeAccessibleName, computeAccessibleDescription } from "dom-accessibility-api";
import type { A11yNode, BuildA11yTreeOptions } from "./types.ts";
import { getRole } from "./roleHelpers.ts";
import { isInaccessible } from "./isAccessible.ts";
import { computeStates } from "./computeStates.ts";
import { computeProperties } from "./computeProperties.ts";
import { computeRelations } from "./computeRelations.ts";
import { computeLiveRegion } from "./computeLiveRegion.ts";
import { computeDragDrop } from "./computeDragDrop.ts";
import { isNameFromContentRole } from "./ariaRoles.ts";

const SKIP_ROLES = new Set(["generic", "presentation", "none"]);

function isSkippedMediaElement(el: HTMLElement): boolean {
  return el.tagName === "IFRAME" || el.tagName === "SVG";
}

function shouldSkipNameFromContentChildren(el: HTMLElement, role: string, name: string): boolean {
  return isNameFromContentRole(role) && hasOnlyTextMatchingName(el, name);
}

type SkipRoleBranch = { kind: "node"; node: A11yNode } | { kind: "null" } | { kind: "continue" };

function tryBuildSkipRoleBranch(
  el: HTMLElement,
  role: string,
  options: BuildA11yTreeOptions,
): SkipRoleBranch {
  if (!SKIP_ROLES.has(role) && role !== "") return { kind: "continue" };

  const isVerbose = options.mode === "verbose";
  const states = computeStates(el, role, isVerbose);
  const relations = computeRelations(el, isVerbose);
  const liveRegion = computeLiveRegion(el, isVerbose);
  const dragDrop = computeDragDrop(el, isVerbose);
  const other = options.computeOther?.(el);
  const hasMeaningfulAttributes = states || relations || liveRegion || dragDrop || other;

  if (isVerbose || hasMeaningfulAttributes) {
    return {
      kind: "node",
      node: buildGenericRoleNode(el, options, {
        states,
        relations,
        liveRegion,
        dragDrop,
        other,
      }),
    };
  }

  const children = processChildren(el, options);
  if (children.length > 0) {
    return { kind: "node", node: { role: "", name: "", children } };
  }
  return { kind: "null" };
}

function attachA11yAnnotations(
  node: A11yNode,
  el: HTMLElement,
  role: string,
  options: BuildA11yTreeOptions,
): A11yNode {
  const isVerbose = options.mode === "verbose";
  const annotated = { ...node };

  const description = computeAccessibleDescription(el);
  if (description) annotated.description = description;

  if (isFormControl(el)) {
    annotated.value = (el as HTMLInputElement).value;
  }

  const states = computeStates(el, role, isVerbose);
  if (states) annotated.states = states;

  const properties = computeProperties(el, role);
  if (properties) annotated.properties = properties;

  const relations = computeRelations(el, isVerbose);
  if (relations) annotated.relations = relations;

  const liveRegion = computeLiveRegion(el, isVerbose);
  if (liveRegion) annotated.liveRegion = liveRegion;

  const dragDrop = computeDragDrop(el, isVerbose);
  if (dragDrop) annotated.dragDrop = dragDrop;

  const other = options.computeOther?.(el);
  if (other && Object.keys(other).length > 0) annotated.other = other;

  return annotated;
}

export function buildA11yTree(
  el: HTMLElement,
  options: BuildA11yTreeOptions = {},
): A11yNode | null {
  if (isInaccessible(el) || isSkippedMediaElement(el)) return null;

  const role = getRole(el);
  const skipBranch = tryBuildSkipRoleBranch(el, role, options);
  if (skipBranch.kind === "null") return null;
  if (skipBranch.kind === "node") return skipBranch.node;

  const name = computeAccessibleName(el);
  const shouldSkipChildren = shouldSkipNameFromContentChildren(el, role, name);

  return attachA11yAnnotations(
    {
      role,
      name,
      children: shouldSkipChildren ? [] : processChildren(el, options),
    },
    el,
    role,
    options,
  );
}

type GenericRoleNodeAttributes = {
  states?: A11yNode["states"];
  relations?: A11yNode["relations"];
  liveRegion?: A11yNode["liveRegion"];
  dragDrop?: A11yNode["dragDrop"];
  other?: A11yNode["other"];
};

function buildGenericRoleNode(
  el: HTMLElement,
  options: BuildA11yTreeOptions,
  { states, relations, liveRegion, dragDrop, other }: GenericRoleNodeAttributes,
): A11yNode {
  const name = computeAccessibleName(el);
  const description = computeAccessibleDescription(el);

  const node: A11yNode = {
    role: "generic",
    name,
    children: processChildren(el, options),
  };

  if (description) node.description = description;
  if (states) node.states = states;
  if (relations) node.relations = relations;
  if (liveRegion) node.liveRegion = liveRegion;
  if (dragDrop) node.dragDrop = dragDrop;
  if (other && Object.keys(other).length > 0) node.other = other;

  return node;
}

function hasOnlyTextMatchingName(el: HTMLElement, name: string): boolean {
  const textContent = el.textContent?.trim() || "";
  return textContent === name;
}

function isFormControl(el: HTMLElement): boolean {
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function appendTextNodeChild(children: A11yNode[], textNode: Text): void {
  const text = textNode.textContent?.trim();
  if (!text) return;
  children.push({ role: "", name: text, children: [] });
}

function pushOrFlattenChild(children: A11yNode[], node: A11yNode, isVerbose: boolean): void {
  if (isVerbose) {
    children.push(node);
    return;
  }
  if (node.role === "" && node.children.length > 0) {
    children.push(...node.children);
    return;
  }
  if (node.role !== "") {
    children.push(node);
  }
}

function appendElementChild(
  children: A11yNode[],
  el: HTMLElement,
  options: BuildA11yTreeOptions,
): void {
  const node = buildA11yTree(el, options);
  if (!node) return;
  pushOrFlattenChild(children, node, options.mode === "verbose");
}

function processChildren(el: HTMLElement, options: BuildA11yTreeOptions = {}): A11yNode[] {
  const children: A11yNode[] = [];
  for (const child of el.childNodes) {
    if (child instanceof HTMLElement) {
      appendElementChild(children, child, options);
      continue;
    }
    if (child instanceof Text) {
      appendTextNodeChild(children, child);
    }
  }
  return children;
}
