import { parseArgs } from "node:util";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { BenchmarkConfig, ModelConfig } from "./types.js";
import { runBenchmark, summarizeResults } from "./benchmark.js";
import {
  ALL_VARIANTS,
  REMOTE_EXEC_CURL,
  PROMPT_SMUGGLE_PLAIN_SIGHT,
  TEST_FILE_RCE,
  DEP_INSTALL_RCE,
  LICENSE_CHECKER_RCE,
  IMAGE_INJECTION,
  MEMORY_POISON,
  HOOK_EXPLOIT,
  SYMLINK_EXFIL,
} from "./variants.js";
import { MODEL_PRESETS } from "./models.js";

const VARIANT_MAP: Record<string, (typeof ALL_VARIANTS)[number]> = {
  "remote-curl": REMOTE_EXEC_CURL,
  smuggle: PROMPT_SMUGGLE_PLAIN_SIGHT,
  "test-rce": TEST_FILE_RCE,
  "dep-install": DEP_INSTALL_RCE,
  "license-checker": LICENSE_CHECKER_RCE,
  "image-injection": IMAGE_INJECTION,
  "memory-poison": MEMORY_POISON,
  "hook-exploit": HOOK_EXPLOIT,
  "symlink-exfil": SYMLINK_EXFIL,
};

const USAGE = `
Usage: pnpm bench [options] <models...|preset>

Models can be individual model IDs or presets:
  Presets: all, quick, claude, openai, codex, google, other
  Models:  opencode/gpt-5.4 opencode/gemini-3.1-pro ...
  Claude:  claude:haiku claude:sonnet claude:opus

Options:
  --variant <name>     remote-curl, remote-local, smuggle, test-rce,
                       dep-install, license-checker, image-injection,
                       hook-exploit, all (default: remote-curl)
  --runs <n>           Runs per model/variant combo (default: 3)
  --concurrency <n>    Max parallel runs (default: 3)
  --out <dir>          Output directory (default: results/)
  --resume             Skip runs that already have results on disk.
                       Timeouts (>=299s) are treated as incomplete.

Examples:
  pnpm bench all                                # All models, remote-curl, 3 runs
  pnpm bench --runs 5 google                    # Google models, 5 runs
  pnpm bench --variant all quick                # All variants, quick model set
  pnpm bench --resume --variant image-injection all  # Finish incomplete runs
`;

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      variant: { type: "string", default: "remote-curl" },
      runs: { type: "string", default: "3" },
      concurrency: { type: "string", default: "3" },
      out: { type: "string", default: "results" },
      resume: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  if (values.help || positionals.length === 0) {
    console.log(USAGE);
    process.exit(values.help ? 0 : 1);
  }

  const runsPerCombo = parseInt(values.runs!, 10);
  const concurrency = parseInt(values.concurrency!, 10);
  const outDir = join(import.meta.dirname, "..", values.out!);
  const resume = values.resume!;

  // Parse models: check for presets first, then treat as model IDs
  let models: ModelConfig[] = [];
  for (const arg of positionals) {
    if (MODEL_PRESETS[arg]) {
      models.push(...MODEL_PRESETS[arg]);
    } else if (arg.startsWith("claude:")) {
      models.push({ runner: "claude", model: arg.slice("claude:".length) });
    } else {
      const model = arg.startsWith("opencode/") ? arg : `opencode/${arg}`;
      models.push({ runner: "opencode", model });
    }
  }

  // Deduplicate by model ID
  const seen = new Set<string>();
  models = models.filter((m) => {
    if (seen.has(m.model)) return false;
    seen.add(m.model);
    return true;
  });

  // Parse variants
  const variants =
    values.variant === "all"
      ? ALL_VARIANTS
      : [VARIANT_MAP[values.variant!]];

  if (!variants || variants.some((v) => !v)) {
    console.error(
      `Unknown variant: ${values.variant}. Options: ${Object.keys(VARIANT_MAP).join(", ")}, all`
    );
    process.exit(1);
  }

  const config: BenchmarkConfig = {
    models,
    variants,
    runsPerCombo,
    concurrency,
  };

  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  Dangerous Skills Benchmark                         ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log("");
  console.log(`Models:      ${models.map((m) => m.model).join(", ")}`);
  console.log(`Variants:    ${variants.map((v) => v.name).join(", ")}`);
  console.log(`Runs/combo:  ${runsPerCombo}`);
  console.log(`Concurrency: ${concurrency}`);
  if (resume) console.log(`Resume:      yes (skipping completed runs)`);

  await mkdir(outDir, { recursive: true });

  await runBenchmark(config, outDir, resume);

  // Always print summary from all results on disk
  await summarizeResults(outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
