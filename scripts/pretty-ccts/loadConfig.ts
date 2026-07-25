import { join } from "node:path";

export type CctsConfig = {
  scoreLimit: number;
};

const DEFAULT_CONFIG: CctsConfig = {
  scoreLimit: 10,
};

export async function loadConfig(cwd: string): Promise<CctsConfig> {
  const configPath = join(cwd, "ccts.config.json");
  const file = Bun.file(configPath);
  if (!(await file.exists())) {
    return { ...DEFAULT_CONFIG };
  }

  const parsed = (await file.json()) as Partial<CctsConfig>;
  return {
    scoreLimit:
      typeof parsed.scoreLimit === "number"
        ? parsed.scoreLimit
        : DEFAULT_CONFIG.scoreLimit,
  };
}
