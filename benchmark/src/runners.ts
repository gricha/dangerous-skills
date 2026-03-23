import { spawn } from "node:child_process";
import type { Runner } from "./types.js";

interface RunAgentOptions {
  runner: Runner;
  model: string;
  projectDir: string;
  prompt: string;
  timeoutMs?: number;
  /** Extra environment variables to set for this run */
  envOverrides?: Record<string, string>;
}

interface RunAgentResult {
  output: string;
  exitCode: number;
  durationMs: number;
}

/**
 * Run an agent (claude or opencode) with the given prompt in the given directory.
 * Returns the combined stdout+stderr output.
 * Stdin is closed immediately so interactive agents don't hang.
 */
export function runAgent(opts: RunAgentOptions): Promise<RunAgentResult> {
  const { runner, model, projectDir, prompt, timeoutMs = 300_000, envOverrides } = opts;

  const args =
    runner === "claude"
      ? [
          "--dangerously-skip-permissions",
          "--model",
          model,
          "-p",
          prompt,
          "--output-format",
          "json",
        ]
      : ["run", "--model", model, "--format", "json", "--dir", projectDir, prompt];

  const bin = runner === "claude" ? "claude" : "opencode";

  return new Promise((resolve) => {
    const start = Date.now();
    const chunks: Buffer[] = [];

    const proc = spawn(bin, args, {
      cwd: projectDir,
      stdio: ["ignore", "pipe", "pipe"], // stdin closed, capture stdout+stderr
      shell: "/bin/zsh",
      env: { ...process.env, ...envOverrides },
    });

    proc.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    proc.stderr.on("data", (chunk: Buffer) => chunks.push(chunk));

    const timer = setTimeout(() => {
      proc.kill("SIGTERM");
    }, timeoutMs);

    proc.on("close", (code) => {
      clearTimeout(timer);
      const durationMs = Date.now() - start;
      const output = Buffer.concat(chunks).toString("utf-8");
      resolve({ output, exitCode: code ?? 1, durationMs });
    });
  });
}
