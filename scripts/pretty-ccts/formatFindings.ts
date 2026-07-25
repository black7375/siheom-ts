import type { Finding } from "./collectFindings";

const bold = (text: string) => `\u001b[1m${text}\u001b[22m`;
const greenBold = (text: string) => `\u001b[1m\u001b[32m${text}\u001b[39m\u001b[22m`;
const dim = (text: string) => `\u001b[90m${text}\u001b[39m`;

export function formatFindings(
  findings: Finding[],
  scoreLimit: number,
): string {
  const lines: string[] = [];

  for (const finding of findings) {
    const name = finding.name || "(anonymous)";
    lines.push(bold(`Complexity found (${finding.kind})`));
    lines.push(
      ` - ${greenBold(finding.path)} [${finding.line}:${finding.column}] (score ${finding.score}) ${name}`,
    );
  }

  const noun = findings.length === 1 ? "function" : "functions";
  lines.push(
    dim(`Found ${findings.length} complex ${noun} (score > ${scoreLimit}).`),
  );

  return lines.join("\n");
}
