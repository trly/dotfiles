# model-router

Dynamic model selection for pi: automatically switches the session model based on the intent of each prompt.

## Concept

Before every agent turn, the incoming prompt is classified into a **routing tier** by a cheap classifier model, and the session model is switched to the tier's configured model before the first LLM call of the turn. Each switch is recorded in session history (`model_change`), so it is restored on session resume.

## Routing tiers

| Tier | Model | Thinking | Used for |
|------|-------|----------|----------|
| `trivial` | `opencode-go/glm-5.3-flash` | — | Quick questions, one-line edits, lookups |
| `normal` | `opencode-go/glm-5.3-flash` | `max` | Everyday coding: features, multi-step edits, routine debugging |
| `heavy` | `openai-codex/gpt-5.6-terra` | `xhigh` | Architecture/design, large refactors, deep analysis, complex planning |
| `systems` | `openai-codex/gpt-6-astra` | `xhigh` | Low-level work: C/C++/Rust/Cython/SIMD/FFI/native build systems |

If a tier's model has no configured auth, routing falls back down the ladder (systems → heavy → normal → trivial) instead of failing.

## Behavior details

- **Classifier**: `opencode-go/glm-5.3-flash` via a nested model call (~300–500 ms). Judges reasoning complexity, not reply length. Falls back to the `normal` tier on timeout (10 s) or error.
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
- `tiers` — tier list: key, description (what the classifier matches on), model, optional `thinkingLevel`
- `timeoutMs` — classifier call timeout

## Debugging

Run pi with `ROUTER_DEBUG=1` to log the raw classifier reply and routing decision to stderr.
