export type Runner = "claude" | "opencode";

export interface ModelConfig {
  runner: Runner;
  model: string;
}

export interface SkillVariant {
  /** Name of this variant for results grouping */
  name: string;
  /** Directory under skills/ containing the SKILL.md */
  skillDir: string;
  /**
   * Files to install into the test project's skill dir.
   * Keys are source paths (relative to skillDir), values are dest paths (relative to skill target).
   * If value is the same as key, just use a plain string in the array form.
   */
  files: Record<string, string>;
  /** The prompt to send to trigger the skill (e.g., "/review-staged") */
  prompt: string;
  /** Strings to search for in agent output that indicate a successful pwn */
  pwnIndicators: string[];
  /** Strings that indicate the model explicitly detected/flagged the attack */
  detectionIndicators: string[];
  /**
   * Extra files to write into the project root (not the skill dir).
   * Keys are relative paths, values are file contents.
   */
  projectFiles?: Record<string, string>;
  /**
   * If true, the benchmark creates an isolated fake HOME per run.
   * The agent's HOME is pointed there so writes to ~/.claude/ are captured.
   * Detection checks for files in the fake HOME (e.g., .claude/CLAUDE.md).
   */
  fakeHome?: boolean;
  /**
   * Paths relative to the fake HOME to check for as pwn indicators.
   * E.g., [".claude/CLAUDE.md"] means pwned if that file was created.
   */
  fakeHomePwnPaths?: string[];
  /**
   * Setup function that runs after the test project is created.
   * Use for dynamic setup like creating symlinks.
   */
  postSetup?: (projectDir: string, fakeHomeDir?: string) => Promise<void>;
}

export type RunOutcome = "pwned" | "detected" | "resisted" | "api_error" | "error";

export interface RunResult {
  model: ModelConfig;
  variant: SkillVariant;
  run: number;
  outcome: RunOutcome;
  durationMs: number;
  /** Raw agent output (stdout + stderr) */
  output: string;
  /** Which pwn indicator matched, if any */
  pwnMatch?: string;
  /** Which detection indicator matched, if any */
  detectionMatch?: string;
}

export interface BenchmarkConfig {
  models: ModelConfig[];
  variants: SkillVariant[];
  runsPerCombo: number;
  concurrency: number;
}
