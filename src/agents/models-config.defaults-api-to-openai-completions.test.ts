import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { withTempHome as withTempHomeBase } from "../../test/helpers/temp-home.js";
import type { OpenClawConfig } from "../config/config.js";

async function withTempHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  return withTempHomeBase(fn, { prefix: "openclaw-models-" });
}

describe("models-config", () => {
  let previousHome: string | undefined;

  beforeEach(() => {
    previousHome = process.env.HOME;
  });

  afterEach(() => {
    process.env.HOME = previousHome;
  });

  it("defaults provider api to openai-completions when not specified", async () => {
    await withTempHome(async () => {
      vi.resetModules();
      const { ensureOpenClawModelsJson } = await import("./models-config.js");
      const { resolveOpenClawAgentDir } = await import("./agent-paths.js");

      // Config without api field - this would previously crash with
      // "Unhandled API in mapOptionsForApi: undefined"
      const cfg: OpenClawConfig = {
        models: {
          providers: {
            ollama: {
              baseUrl: "http://127.0.0.1:11434/v1",
              apiKey: "ollama",
              models: [
                {
                  id: "llama3",
                  name: "Llama 3",
                  reasoning: false,
                  input: ["text"],
                  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                  contextWindow: 128000,
                  maxTokens: 8192,
                },
              ],
            },
          },
        },
      };

      await ensureOpenClawModelsJson(cfg);

      const modelPath = path.join(resolveOpenClawAgentDir(), "models.json");
      const raw = await fs.readFile(modelPath, "utf8");
      const parsed = JSON.parse(raw) as {
        providers: Record<string, { api?: string }>;
      };

      expect(parsed.providers.ollama?.api).toBe("openai-completions");
    });
  });

  it("preserves existing api field when specified", async () => {
    await withTempHome(async () => {
      vi.resetModules();
      const { ensureOpenClawModelsJson } = await import("./models-config.js");
      const { resolveOpenClawAgentDir } = await import("./agent-paths.js");

      const cfg: OpenClawConfig = {
        models: {
          providers: {
            "custom-anthropic": {
              baseUrl: "http://localhost:8080/v1",
              apiKey: "test-key",
              api: "anthropic-messages",
              models: [
                {
                  id: "custom-model",
                  name: "Custom Model",
                  reasoning: false,
                  input: ["text"],
                  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                  contextWindow: 200000,
                  maxTokens: 8192,
                },
              ],
            },
          },
        },
      };

      await ensureOpenClawModelsJson(cfg);

      const modelPath = path.join(resolveOpenClawAgentDir(), "models.json");
      const raw = await fs.readFile(modelPath, "utf8");
      const parsed = JSON.parse(raw) as {
        providers: Record<string, { api?: string }>;
      };

      expect(parsed.providers["custom-anthropic"]?.api).toBe("anthropic-messages");
    });
  });
});
