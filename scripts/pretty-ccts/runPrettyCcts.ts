import { collectFindings, type CctsNode } from "./collectFindings";
import { formatFindings } from "./formatFindings";
import { loadConfig } from "./loadConfig";
import { resolveFindingPath } from "./resolveFindingPath";

export type PrettyCctsResult = {
  output: string;
  exitCode: number;
};

export async function runPrettyCcts(
  jsonText: string,
  cwd: string,
): Promise<PrettyCctsResult> {
  const config = await loadConfig(cwd);
  const tree = JSON.parse(jsonText) as CctsNode;
  const findings = collectFindings(tree, config.scoreLimit).map((finding) => ({
    ...finding,
    path: resolveFindingPath(finding.path, cwd),
  }));

  return {
    output: formatFindings(findings, config.scoreLimit),
    exitCode: findings.length > 0 ? 1 : 0,
  };
}
