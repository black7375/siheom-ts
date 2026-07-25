export type CctsNode = {
  kind?: string;
  name?: string;
  score?: number;
  line?: number;
  column?: number;
  inner?: CctsNode[];
  [key: string]: unknown;
};

export type Finding = {
  path: string;
  kind: "function";
  name: string;
  score: number;
  line: number;
  column: number;
};

export function collectFindings(tree: CctsNode, scoreLimit: number): Finding[] {
  const findings: Finding[] = [];

  function walk(node: CctsNode, pathParts: string[]) {
    if (node.kind === "file") {
      const filePath = pathParts.join("/");
      walkContainers(node.inner ?? [], filePath);
      return;
    }

    if (node.kind) {
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (value && typeof value === "object") {
        walk(value as CctsNode, [...pathParts, key]);
      }
    }
  }

  function walkContainers(containers: CctsNode[], filePath: string) {
    for (const container of containers) {
      if (
        container.kind === "function" &&
        typeof container.score === "number" &&
        container.score > scoreLimit
      ) {
        findings.push({
          path: filePath,
          kind: "function",
          name: container.name ?? "",
          score: container.score,
          line: container.line ?? 0,
          column: container.column ?? 0,
        });
      }
      if (container.inner?.length) {
        walkContainers(container.inner, filePath);
      }
    }
  }

  walk(tree, []);
  return findings.sort((a, b) => b.score - a.score);
}
