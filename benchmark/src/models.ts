import type { ModelConfig } from "./types.js";

/**
 * Canonical model list for benchmarking.
 * Grouped by provider/family for readability.
 */

// Claude models (via opencode — consistent runner for all)
const CLAUDE: ModelConfig[] = [
  { runner: "opencode", model: "opencode/claude-haiku-4-5" },
  { runner: "opencode", model: "opencode/claude-sonnet-4-6" },
  { runner: "opencode", model: "opencode/claude-opus-4-6" },
];

// OpenAI base models
const OPENAI: ModelConfig[] = [
  { runner: "opencode", model: "opencode/gpt-5-nano" },
  { runner: "opencode", model: "opencode/gpt-5" },
  { runner: "opencode", model: "opencode/gpt-5.4" },
  { runner: "opencode", model: "opencode/gpt-5.4-pro" },
];

// OpenAI codex (agentic-tuned) models
const CODEX: ModelConfig[] = [
  { runner: "opencode", model: "opencode/gpt-5-codex" },
  { runner: "opencode", model: "opencode/gpt-5.1-codex-mini" },
  { runner: "opencode", model: "opencode/gpt-5.3-codex" },
];

// Google models
const GOOGLE: ModelConfig[] = [
  { runner: "opencode", model: "opencode/gemini-3-flash" },
  { runner: "opencode", model: "opencode/gemini-3.1-pro" },
];

// Other providers
const OTHER: ModelConfig[] = [
  { runner: "opencode", model: "opencode/kimi-k2.5" },
  { runner: "opencode", model: "opencode/glm-5" },
];

/** All models we benchmark against */
export const ALL_MODELS: ModelConfig[] = [
  ...CLAUDE,
  ...OPENAI,
  ...CODEX,
  ...GOOGLE,
  ...OTHER,
];

/** Quick subset for smoke testing */
export const QUICK_MODELS: ModelConfig[] = [
  { runner: "opencode", model: "opencode/gpt-5-nano" },
  { runner: "opencode", model: "opencode/gemini-3-flash" },
];

export const MODEL_PRESETS: Record<string, ModelConfig[]> = {
  all: ALL_MODELS,
  quick: QUICK_MODELS,
  claude: CLAUDE,
  openai: OPENAI,
  codex: CODEX,
  google: GOOGLE,
  other: OTHER,
};
