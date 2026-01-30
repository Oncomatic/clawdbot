# ExecPlan: Fix Ollama/Custom Provider Crash (undefined API)

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

Reference: This document must be maintained in accordance with PLANS.md.

## Purpose / Big Picture

When users configure custom model providers (like Ollama or OpenAI-compatible proxies) via `clawdbot.json`, the gateway crashes with "Unhandled API in mapOptionsForApi: undefined". This happens because custom provider configs may omit the `api` field, which is required by the pi-ai streaming library.

After this fix, users can configure custom providers without specifying the `api` field, and it will default to `"openai-completions"` (the most common API format for compatible providers).

## Progress

- [ ] Add default `api: "openai-completions"` in `normalizeProviders` for providers without an `api` field
- [ ] Add test case for custom provider without `api` field
- [ ] Run existing tests to verify no regressions
- [ ] Commit changes

## Surprises & Discoveries

(None yet)

## Decision Log

- Decision: Default to `"openai-completions"` when `api` is not specified
  Rationale: This is the most common API format for OpenAI-compatible providers (Ollama, LM Studio, vLLM, etc.). The built-in Ollama provider uses this same default.
  Date/Author: 2026-01-30 / Jarvis

## Outcomes & Retrospective

(To be completed after implementation)

## Context and Orientation

The gateway crashes when a user configures a custom provider without the `api` field. The error originates in the pi-ai dependency at `mapOptionsForApi` which doesn't handle `undefined` API types.

**Key file:** `src/agents/models-config.providers.ts`

The `normalizeProviders` function processes provider configs before writing to `models.json`. It handles API key normalization but doesn't ensure the `api` field has a default value.

**Built-in providers define their API:**
- `buildOllamaProvider()` sets `api: "openai-completions"`
- `buildMinimaxProvider()` sets `api: "openai-completions"`
- etc.

**But user-configured providers may not:**
    models:
      providers:
        ollama:
          apiKey: ollama
          baseUrl: http://127.0.0.1:11434/v1
          models:
            - id: llama3
              name: Llama 3
          # NO api field - crashes!

**Valid API types from `src/config/types.models.ts`:**
- `"openai-completions"` (most common)
- `"openai-responses"`
- `"anthropic-messages"`
- `"google-generative-ai"`
- `"github-copilot"`
- `"bedrock-converse-stream"`

## Plan of Work

1. In `src/agents/models-config.providers.ts`, find the `normalizeProviders` function
2. Add logic to set `api: "openai-completions"` when the provider has no `api` field
3. Add a test case for this scenario
4. Run the test suite to verify

## Concrete Steps

Working directory: `/home/admin/src/clawdbot/.worktrees/fix-ollama-custom-provider-crash`

    # Find the exact location in normalizeProviders
    grep -n "for.*entries.*providers" src/agents/models-config.providers.ts
    
    # After the loop that normalizes apiKey, add:
    # If no api is specified, default to openai-completions (most common)
    if (!normalizedProvider.api) {
      mutated = true;
      normalizedProvider = {
        ...normalizedProvider,
        api: "openai-completions",
      };
    }
    
    # Run tests
    pnpm test src/agents/models-config
    
    # Commit
    git add -A
    git commit -m "fix(providers): default custom providers to openai-completions API

When users configure custom providers via models.providers config without
specifying the 'api' field, the gateway crashes with 'Unhandled API in
mapOptionsForApi: undefined'.

This adds a default of 'openai-completions' for providers without an api
field, which is the most common API format for OpenAI-compatible providers
(Ollama, LM Studio, vLLM, etc.).

Fixes #4857

Co-authored-by: Jarvis <jarvis@medmatic.ai>"

## Validation and Acceptance

1. Run `pnpm test src/agents/models-config` - all tests should pass
2. The new test should verify that a provider without `api` gets `"openai-completions"` assigned
3. Existing tests should not regress

## Idempotence and Recovery

This change is safe to run multiple times. If `api` is already set, it won't be overwritten.

## Artifacts and Notes

Error from issue:
    [openclaw] Unhandled promise rejection: Error: Unhandled API in mapOptionsForApi: undefined
        at mapOptionsForApi (.../node_modules/@mariozechner/pi-ai/src/stream.ts:471:10)

User config that triggers the crash:
    openclaw config set models.providers.ollama '{ "apiKey": "ollama", "baseUrl": "http://127.0.0.1:11434/v1", "models": [{ "id": "llama3", "name": "Llama 3" }] }'
