import type { RunResult, ModelConfig, SkillVariant } from "./types.js";

// ANSI colors
const RED = "\x1b[0;31m";
const GREEN = "\x1b[0;32m";
const YELLOW = "\x1b[0;33m";
const CYAN = "\x1b[0;36m";
const BOLD = "\x1b[1m";
const NC = "\x1b[0m";

const OUTCOME_COLORS: Record<string, string> = {
  pwned: `${RED}${BOLD}PWNED${NC}`,
  detected: `${GREEN}DETECTED${NC}`,
  resisted: `${GREEN}RESISTED${NC}`,
  api_error: `${YELLOW}API BLOCKED${NC}`,
  error: `${YELLOW}ERROR${NC}`,
};

export function printRunResult(result: RunResult): void {
  const label = `${result.model.model} / ${result.variant.name} #${result.run}`;
  const outcome = OUTCOME_COLORS[result.outcome] ?? result.outcome;
  const duration = `${(result.durationMs / 1000).toFixed(1)}s`;
  console.log(`  ${label} ... ${outcome} (${duration})`);
}

export function printSummary(results: RunResult[]): void {
  // Group by model+variant
  const groups = new Map<string, RunResult[]>();
  for (const r of results) {
    const key = `${r.model.runner}/${r.model.model}|${r.variant.name}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  console.log("");
  console.log(`${BOLD}${"═".repeat(90)}${NC}`);
  console.log(`${BOLD}  SUMMARY${NC}`);
  console.log(`${BOLD}${"═".repeat(90)}${NC}`);
  console.log("");

  const header = `| ${"Model".padEnd(25)} | ${"Variant".padEnd(25)} | ${"Pwned".padStart(7)} | ${"Detect".padStart(7)} | ${"Resist".padStart(7)} |`;
  const sep = `|${"-".repeat(27)}|${"-".repeat(27)}|${"-".repeat(9)}|${"-".repeat(9)}|${"-".repeat(9)}|`;

  console.log(header);
  console.log(sep);

  let totalPwned = 0;
  let totalRuns = 0;

  for (const [, runs] of groups) {
    const model = runs[0].model.model;
    const variant = runs[0].variant.name;
    const n = runs.length;
    const pwned = runs.filter((r) => r.outcome === "pwned").length;
    const detected = runs.filter((r) => r.outcome === "detected").length;
    const resisted = runs.filter(
      (r) => r.outcome === "resisted" || r.outcome === "error"
    ).length;

    totalPwned += pwned;
    totalRuns += n;

    const pwnStr = pwned > 0 ? `${RED}${pwned}/${n}${NC}` : `${pwned}/${n}`;
    console.log(
      `| ${model.padEnd(25)} | ${variant.padEnd(25)} | ${pwnStr.padStart(pwned > 0 ? 16 : 7)} | ${`${detected}/${n}`.padStart(7)} | ${`${resisted}/${n}`.padStart(7)} |`
    );
  }

  console.log(sep);
  const rate = totalRuns > 0 ? ((totalPwned / totalRuns) * 100).toFixed(0) : 0;
  console.log("");
  console.log(
    `${BOLD}Overall pwn rate: ${totalPwned}/${totalRuns} (${rate}%)${NC}`
  );
  console.log("");
}

export function toMarkdown(results: RunResult[]): string {
  const groups = new Map<string, RunResult[]>();
  for (const r of results) {
    const key = `${r.model.runner}/${r.model.model}|${r.variant.name}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const lines: string[] = [
    "# Benchmark Results",
    "",
    `Generated: ${new Date().toISOString().slice(0, 16)}`,
    "",
    "| Model | Variant | Pwned | Detected | Resisted |",
    "|-------|---------|-------|----------|----------|",
  ];

  for (const [, runs] of groups) {
    const model = runs[0].model.model;
    const variant = runs[0].variant.name;
    const n = runs.length;
    const pwned = runs.filter((r) => r.outcome === "pwned").length;
    const detected = runs.filter((r) => r.outcome === "detected").length;
    const resisted = runs.filter(
      (r) => r.outcome === "resisted" || r.outcome === "error"
    ).length;

    const pwnStr = pwned > 0 ? `**${pwned}/${n}**` : `${pwned}/${n}`;
    lines.push(
      `| ${model} | ${variant} | ${pwnStr} | ${detected}/${n} | ${resisted}/${n} |`
    );
  }

  return lines.join("\n") + "\n";
}
