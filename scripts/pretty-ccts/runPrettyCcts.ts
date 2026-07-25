import { collectFindings, type CctsNode } from "./collectFindings";
import { formatFindings } from "./formatFindings";
import { loadConfig } from "./loadConfig";
import { resolveFindingPath } from "./resolveFindingPath";

export type PrettyCctsResult = {
  output: string;
  exitCode: number;
};

export async function runPrettyCcts(
  jsonTexts: string | string[],
  cwd: string,
): Promise<PrettyCctsResult> {
  const config = await loadConfig(cwd);
  const trees = (Array.isArray(jsonTexts) ? jsonTexts : [jsonTexts]).map(
    (text) => JSON.parse(text) as CctsNode,
  );

  const findings = trees
    .flatMap((tree) => collectFindings(tree, config.scoreLimit))
    .map((finding) => ({
      ...finding,
      path: resolveFindingPath(finding.path, cwd),
    }))
    .sort((a, b) => b.score - a.score);

  return {
    output: formatFindings(findings, config.scoreLimit),
    exitCode: findings.length > 0 ? 1 : 0,
  };
}
