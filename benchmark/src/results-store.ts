import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { RunResult, ModelConfig, SkillVariant } from "./types.js";

/**
 * Structured results storage.
 *
 * Each run is saved as an individual JSON file:
 *   results/{variant}/{model}_run{N}.json
 *
 * This makes resume trivial — just check what files exist.
 */

function sanitize(s: string): string {
  return s.replace(/\//g, "_");
}

function resultKey(
  model: ModelConfig,
  variant: SkillVariant,
  run: number
): { dir: string; filename: string } {
  return {
    dir: variant.name,
    filename: `${sanitize(model.model)}_run${run}.json`,
  };
}

export async function saveRunResult(
  baseDir: string,
  result: RunResult
): Promise<void> {
  const { dir, filename } = resultKey(
    result.model,
    result.variant,
    result.run
  );
  const outDir = join(baseDir, dir);
  await mkdir(outDir, { recursive: true });

  const data = {
    runner: result.model.runner,
    model: result.model.model,
    variant: result.variant.name,
    run: result.run,
    outcome: result.outcome,
    durationMs: result.durationMs,
    pwnMatch: result.pwnMatch,
    detectionMatch: result.detectionMatch,
    outputPreview: result.output.slice(0, 2000),
  };

  await writeFile(join(outDir, filename), JSON.stringify(data, null, 2));
}

export async function getCompletedRuns(
  baseDir: string,
  model: ModelConfig,
  variant: SkillVariant,
  maxDurationMs = 299_000 // treat 300s timeouts as incomplete
): Promise<number[]> {
  const { dir } = resultKey(model, variant, 1);
  const outDir = join(baseDir, dir);

  try {
    const files = await readdir(outDir);
    const prefix = sanitize(model.model) + "_run";
    const completed: number[] = [];

    for (const file of files) {
      if (!file.startsWith(prefix) || !file.endsWith(".json")) continue;

      const raw = await readFile(join(outDir, file), "utf-8");
      const data = JSON.parse(raw);

      // Only count as completed if it didn't timeout
      if (data.durationMs < maxDurationMs) {
        const runNum = parseInt(
          file.slice(prefix.length, file.indexOf(".json")),
          10
        );
        if (!isNaN(runNum)) completed.push(runNum);
      }
    }

    return completed.sort((a, b) => a - b);
  } catch {
    return []; // directory doesn't exist yet
  }
}

export async function loadAllResults(
  baseDir: string
): Promise<
  {
    runner: string;
    model: string;
    variant: string;
    run: number;
    outcome: string;
    durationMs: number;
    pwnMatch?: string;
    detectionMatch?: string;
  }[]
> {
  const results: Awaited<ReturnType<typeof loadAllResults>> = [];

  try {
    const variantDirs = await readdir(baseDir);
    for (const variantDir of variantDirs) {
      const dirPath = join(baseDir, variantDir);
      const files = await readdir(dirPath).catch(() => []);
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        const raw = await readFile(join(dirPath, file), "utf-8");
        results.push(JSON.parse(raw));
      }
    }
  } catch {
    // no results yet
  }

  return results;
}
