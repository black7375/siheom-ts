/** Compact DOM tree for H2 structural diff (device JSON). */

export type DomStructureNode = {
  tag: string;
  /** contenteditable attribute if present */
  ce?: string | null;
  /** data-slate-node */
  sn?: string | null;
  /** data-slate-placeholder present */
  ph?: boolean;
  /** direct text length (not recursive) */
  tlen?: number;
  /** first 8 chars of direct text (debug) */
  tpre?: string;
  children?: DomStructureNode[];
};

export function compactDomStructure(
  root: HTMLElement | null,
  options?: { maxDepth?: number; maxChildren?: number },
): DomStructureNode[] {
  if (!root) {
    return [];
  }

  const maxDepth = options?.maxDepth ?? 8;
  const maxChildren = options?.maxChildren ?? 12;

  function walk(el: Element, depth: number): DomStructureNode {
    const node: DomStructureNode = { tag: el.tagName.toLowerCase() };

    if (el.hasAttribute("contenteditable")) {
      node.ce = el.getAttribute("contenteditable");
    }
    const slateNode = el.getAttribute("data-slate-node");
    if (slateNode) {
      node.sn = slateNode;
    }
    if (el.hasAttribute("data-slate-placeholder")) {
      node.ph = true;
    }

    if (el.childNodes.length === 1 && el.childNodes[0]?.nodeType === Node.TEXT_NODE) {
      const text = el.textContent ?? "";
      node.tlen = text.length;
      if (text.length > 0) {
        node.tpre = text.slice(0, 8);
      }
    } else if (el.childNodes.length === 0 && el.textContent) {
      node.tlen = (el.textContent ?? "").length;
    }

    if (depth < maxDepth && el.children.length > 0) {
      node.children = [...el.children].slice(0, maxChildren).map((child) => walk(child, depth + 1));
    }

    return node;
  }

  return [...root.children].slice(0, maxChildren).map((child) => walk(child, 0));
}

/** Textarea / input — single-node summary. */
export function compactControlStructure(
  control: HTMLTextAreaElement | HTMLInputElement | null,
): DomStructureNode[] {
  if (!control) {
    return [];
  }

  return [
    {
      tag: control.tagName.toLowerCase(),
      tlen: control.value.length,
      tpre: control.value.slice(0, 8) || undefined,
    },
  ];
}
