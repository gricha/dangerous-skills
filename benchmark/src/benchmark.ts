import type {
  BenchmarkConfig,
  ModelConfig,
  RunResult,
  SkillVariant,
} from "./types.js";
import { createTestProject } from "./test-project.js";
import { runAgent } from "./runners.js";
import { classifyRun } from "./classify.js";
import { printRunResult, printSummary, toMarkdown } from "./reporter.js";
import { saveRunResult, getCompletedRuns, loadAllResults } from "./results-store.js";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

async function runSingleTest(
  model: ModelConfig,
  variant: SkillVariant,
  runNum: number
): Promise<RunResult> {
  const { projectDir, fakeHomeDir, cleanup } = await createTestProject(variant);

  try {
    const { output, durationMs } = await runAgent({
      runner: model.runner,
      model: model.model,
      projectDir,
      prompt: variant.prompt,
      timeoutMs: 300_000,
      envOverrides: fakeHomeDir ? { HOME: fakeHomeDir } : undefined,
    });

    const { outcome, pwnMatch, detectionMatch } = classifyRun({
      output,
      projectDir,
      fakeHomeDir,
      variant,
    });

    return {
      model,
      variant,
      run: runNum,
      outcome,
      durationMs,
      output,
      pwnMatch,
      detectionMatch,
    };
  } catch (e) {
    return {
      model,
      variant,
      run: runNum,
      outcome: "error",
      durationMs: 0,
      output: String(e),
    };
  } finally {
    await cleanup();
  }
}

interface Task {
  model: ModelConfig;
  variant: SkillVariant;
  run: number;
}

/**
 * Run a batch of tests with controlled concurrency.
 * Each test gets its own isolated temp directory, so parallel runs are safe.
 * If resume=true, skips runs that already have results on disk.
 */
export async function runBenchmark(
  config: BenchmarkConfig,
  outDir: string,
  resume: boolean
): Promise<RunResult[]> {
  const allResults: RunResult[] = [];

  // Build the full list of tasks
  let tasks: Task[] = [];
  let skipped = 0;

  for (const model of config.models) {
    for (const variant of config.variants) {
      const completed = resume
        ? await getCompletedRuns(outDir, model, variant)
        : [];

      for (let run = 1; run <= config.runsPerCombo; run++) {
        if (completed.includes(run)) {
          skipped++;
          continue;
        }
        tasks.push({ model, variant, run });
      }
    }
  }

  const total = tasks.length + skipped;
  if (skipped > 0) {
    console.log(
      `\nTotal: ${total} runs (${skipped} already completed, ${tasks.length} remaining, concurrency: ${config.concurrency})\n`
    );
  } else {
    console.log(
      `\nTotal runs: ${tasks.length} (concurrency: ${config.concurrency})\n`
    );
  }

  if (tasks.length === 0) {
    console.log("Nothing to run — all runs already completed.");
    return allResults;
  }

  // Process with concurrency limit
  let idx = 0;
  const runNext = async (): Promise<void> => {
    while (idx < tasks.length) {
      const task = tasks[idx++];
      if (!task) break;
      const result = await runSingleTest(task.model, task.variant, task.run);
      allResults.push(result);
      printRunResult(result);

      // Save immediately so resume works even if we crash mid-run
      await saveRunResult(outDir, result);
    }
  };

  const workers = Array.from(
    { length: Math.min(config.concurrency, tasks.length) },
    () => runNext()
  );
  await Promise.all(workers);

  return allResults;
}

/**
 * Print a summary from all results on disk (not just this run).
 */
export async function summarizeResults(outDir: string): Promise<void> {
  const all = await loadAllResults(outDir);

  if (all.length === 0) {
    console.log("No results found.");
    return;
  }

  // Group by model+variant
  const groups = new Map<string, typeof all>();
  for (const r of all) {
    const key = `${r.model}|${r.variant}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  // Print summary table
  const BOLD = "\x1b[1m";
  const RED = "\x1b[0;31m";
  const NC = "\x1b[0m";

  console.log("");
  console.log(`${BOLD}${"═".repeat(90)}${NC}`);
  console.log(`${BOLD}  ALL RESULTS (from disk)${NC}`);
  console.log(`${BOLD}${"═".repeat(90)}${NC}`);
  console.log("");

  const header = `| ${"Model".padEnd(25)} | ${"Variant".padEnd(25)} | ${"Pwned".padStart(7)} | ${"Detect".padStart(7)} | ${"Resist".padStart(7)} |`;
  const sep = `|${"-".repeat(27)}|${"-".repeat(27)}|${"-".repeat(9)}|${"-".repeat(9)}|${"-".repeat(9)}|`;
  console.log(header);
  console.log(sep);

  let totalPwned = 0;
  let totalRuns = 0;

  for (const [, runs] of [...groups.entries()].sort()) {
    const model = runs[0].model;
    const variant = runs[0].variant;
    const n = runs.length;
    const pwned = runs.filter((r) => r.outcome === "pwned").length;
    const detected = runs.filter((r) => r.outcome === "detected").length;
    const resisted = n - pwned - detected;
    totalPwned += pwned;
    totalRuns += n;

    const pwnStr =
      pwned > 0 ? `${RED}${pwned}/${n}${NC}` : `${pwned}/${n}`;
    console.log(
      `| ${model.padEnd(25)} | ${variant.padEnd(25)} | ${pwnStr.padStart(pwned > 0 ? 16 : 7)} | ${`${detected}/${n}`.padStart(7)} | ${`${resisted}/${n}`.padStart(7)} |`
    );
  }

  console.log(sep);
  const rate =
    totalRuns > 0 ? ((totalPwned / totalRuns) * 100).toFixed(0) : 0;
  console.log(
    `\n${BOLD}Overall: ${totalPwned}/${totalRuns} (${rate}%)${NC}\n`
  );
}
