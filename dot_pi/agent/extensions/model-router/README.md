# model-router

Dynamic model selection for pi: automatically switches the session model based on the intent of each prompt.

## Concept

Before every agent turn, the incoming prompt is classified into a **routing tier** by a cheap classifier model, and the session model is switched to the tier's configured model before the first LLM call of the turn. Each switch is recorded in session history (`model_change`), so it is restored on session resume.

## Routing tiers

| Tier | Primary model | Fallback order | Thinking | Used for |
|------|-------|----------|----------|----------|
| `trivial` | `opencode-go/gpt-6-luna` | `openai-codex/gpt-6-luna` | `low` | Quick questions, one-line edits, lookups |
| `normal` | `opencode-go/gpt-6-luna` | `openai-codex/gpt-6-luna` | `medium` | Everyday coding: features, multi-step edits, routine debugging |
| `heavy` | `openai-codex/gpt-6.1-sol` | `opencode-go/gpt-6-luna` → `openai-codex/gpt-6-luna` | `xhigh` | Architecture/design, large refactors, deep analysis, complex planning |
| `systems` | `openai-codex/gpt-6-astra` | `openai-codex/gpt-6.1-sol` → `opencode-go/gpt-6-luna` → `openai-codex/gpt-6-luna` | `xhigh` | Low-level work: C/C++/Rust/Cython/SIMD/FFI/native build systems |

Fallbacks are explicit, ordered, and never move up to a more expensive tier: Luna can switch provider to the other Luna, heavy work can drop to Luna, and systems work can drop to Sol or Luna. Pi tries each candidate when its catalog entry or configured auth is missing, and the router tries the next candidate if Pi rejects the model switch. If none work, it warns and leaves the active model unchanged. This handles catalog/auth/switch failures, not quota or request errors after a model has been selected.

The [model review](MODEL_REVIEW.md) records the current catalog assessment and why `@animakit/complexity-scorer` was not adopted.

## Behavior details

- **Thinking levels**: every tier sets its own level, including `normal` at `medium`; routine work does not inherit `low` or `xhigh` from the preceding turn. The level also applies to fallbacks.
- **Classifier**: only `opencode-go/gpt-6-luna`, via a nested model call with no reasoning enabled. Judges reasoning complexity, not reply length. Falls back to the `normal` tier on timeout (10 s) or error.
- **Sticky continuations**: short prompts ("continue", "ok", "yes") reuse the previous tier with no classifier call.
- **No mid-run switching**: steered/queued messages during a run are skipped to avoid fragmenting turns and invalidating prompt cache.
- **Nested-call headers**: nested calls bypass pi's stream wrapper, so `x-opencode-session`/`x-opencode-client` headers are injected for opencode-hosted models.
- **Footer**: replaces pi's default footer with a faithful replica (pwd, token/cost/context stats, model indicator) and shows `router: <tier> → <model>` right-aligned below the model indicator. Uses `setFooter()` because `setStatus()` placement is fixed. Two cosmetic caveats vs. the built-in footer: the auto-compact `(auto)` tag is always shown (pi doesn't expose the setting) and the experimental-features `xp` badge is omitted.

## Commands

- `/router` or `/router status` — show routing table, classifier, last tier, active model
- `/router on` / `/router off` — enable/disable automatic routing

## Configuration

Edit the `ROUTER_CONFIG` table at the top of `index.ts`, then `/reload`:

- `classifier` — model used for intent classification
- `tiers` — tier list: key, description (what the classifier matches on), primary `model`, ordered cheaper/provider `fallbacks`, optional `thinkingLevel`
- `timeoutMs` — classifier call timeout

## Debugging

Run pi with `ROUTER_DEBUG=1` to log the raw classifier reply and routing decision to stderr.

## Tests

Run the public-event regression tests through Pi’s extension loader (no model calls or extra dependencies):

```bash
pi --print --no-extensions --extension ./extensions/model-router/tests/router.ts \
  --offline --no-session --no-tools --no-mcp --no-skills --no-context-files \
  --no-prompt-templates --no-themes </dev/null
```
