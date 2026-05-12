---
name: create-sourcegraph-regex
description: "Creates RE2 regular-expression patterns and Sourcegraph search query snippets that are compatible with github.com/sourcegraph/sourcegraph query syntax. Use when asked to write, convert, or debug regex for Sourcegraph code search filters and patterns."
---

# Create Sourcegraph Regex

Builds RE2-compatible regex patterns that work in Sourcegraph queries, including content patterns and regex-capable filters.

## Use This Skill When

- You are asked to write a regex for Sourcegraph code search.
- You are asked to convert PCRE/JavaScript/Python regex into Sourcegraph-compatible syntax.
- You need to debug why a Sourcegraph regex query is failing or matching incorrectly.

## Core Compatibility Rules

1. Sourcegraph regex syntax is RE2 (via `github.com/grafana/regexp`, a performance-optimized fork of Go's standard `regexp` package with identical semantics).
2. Do not use lookarounds (`(?=...)`, `(?!...)`, `(?<=...)`, `(?<!...)`) or backreferences (`\1`, `\2`, ...); RE2 does not support them.
3. Assume case-insensitive matching unless the query includes `case:yes`.
4. For `repo:` and `file:` filters, regex is unanchored by default; add `^...$` when exact matching is required.
5. In `patterntype:regexp`, unescaped spaces between tokens are treated as fuzzy separators. Use `/.../`, escaped spaces (`\ `), or quoted phrases when you need literal spaces.

## RE2 Feature Reference

Sourcegraph parses regex patterns with these flags: `syntax.ClassNL | syntax.PerlX | syntax.UnicodeGroups`. This determines what is and is not available.

### Supported Features

- **Perl character classes** (`PerlX` flag): `\d`, `\D`, `\s`, `\S`, `\w`, `\W`
- **Unicode character classes** (`UnicodeGroups` flag): `\p{L}`, `\p{N}`, `\p{Greek}`, etc.
- **Dot matches newline** (`ClassNL` flag): `.` matches `\n` (no need for `[\s\S]` to cross lines)
- **Character classes**: `[abc]`, `[^abc]`, `[a-z]`
- **Quantifiers**: `*`, `+`, `?`, `{n}`, `{n,}`, `{n,m}`
- **Anchors**: `^`, `$`, `\b`, `\B`
- **Grouping**: `(...)` (capturing), `(?:...)` (non-capturing)
- **Alternation**: `|`
- **Escape sequences**: `\t`, `\n`, `\r`, `\f`, `\a`, `\x{hex}`, `\pN`, `\PN`
- **Inline flags**: `(?i:...)` (case-insensitive), `(?m:...)` (multiline), `(?s:...)` (dot-all), `(?U:...)` (ungreedy)
- **Named captures**: `(?P<name>...)`

### NOT Supported (RE2 Limitations)

These PCRE/Perl features are excluded because RE2 guarantees linear-time execution (no catastrophic backtracking):

- **Backreferences**: `\1`, `\2`, etc.
- **Lookahead**: `(?=...)`, `(?!...)`
- **Lookbehind**: `(?<=...)`, `(?<!...)`
- **Atomic groups**: `(?>...)`
- **Possessive quantifiers**: `*+`, `++`, `?+`
- **Conditional patterns**: `(?(cond)yes|no)`
- **Recursive patterns**: `(?R)`, `(?1)`

## Where Regex Patterns Appear in Queries

Regex can appear in several positions; escaping and anchoring rules differ by context.

1. **Content pattern** (`patterntype:regexp` or `/.../` in keyword mode): matches file content.
2. **Regex-capable filters**: `repo:`, `file:`, `-repo:`, `-file:`, `author:`, `message:`, `file:has.content(...)`, `file:has.contributor(...)` — each filter value is compiled as a separate RE2 pattern.
3. **`content:"..."`**: literal-disambiguation wrapper; escape backslashes as `\\` inside the quotes.

## Workflow

1. Identify which query position the regex targets (content pattern vs. filter value).
2. Detect unsupported PCRE features and plan a safe RE2 rewrite.
3. Build the RE2 pattern with explicit anchors and character classes where needed.
4. Return the regex, embedding context (filter or content), and any approximation notes if semantics changed.

## Rewrite Recipes For Unsupported PCRE Features

### Lookaheads / Lookbehinds

- Exact lookaround semantics are not available in RE2.
- Prefer query decomposition using boolean operators and filters when possible.
- If ordering in content matters, use explicit sequence matching like `A.{0,200}B` (or another bounded span). Since the `ClassNL` flag is enabled, `.` already matches newlines, so `[\s\S]` is unnecessary.

### Backreferences

- RE2 cannot enforce "same capture reused later" constraints.
- Return a two-phase strategy:
  1. Broad RE2 candidate query in Sourcegraph.
  2. Optional post-filter outside Sourcegraph (for example with `src search --json` + a PCRE-capable tool).

### Atomic/possessive groups and other PCRE-only operators

- Replace with equivalent plain RE2 grouping when possible.
- If no exact equivalent exists, provide the closest safe superset and call out false-positive risk.

## Output Contract

When producing an answer with this skill, always include:

1. `RE2 pattern`: the final regex only.
2. `Sourcegraph query`: a complete runnable query snippet.
3. `Compatibility notes`: why this is RE2-safe for Sourcegraph.
4. `Approximation notes`: only when exact PCRE semantics were not preserved.

## Examples

### Example 1: Exact repository and Go file scope

Request: find `context.Background()` in Go files in `github.com/sourcegraph/sourcegraph`.

- RE2 pattern: `\bcontext\.Background\(\)`
- Sourcegraph query: `repo:^github\.com/sourcegraph/sourcegraph$ file:\.go$ /\bcontext\.Background\(\)/`
- Notes: repo is anchored for exact repo match; pattern is RE2-safe.

### Example 2: Convert lookahead-heavy request

Request: `foo(?=.*bar)` style requirement.

- RE2 pattern: `foo.{0,200}bar`
- Sourcegraph query: `/foo.{0,200}bar/ patterntype:regexp`
- Notes: this is an ordered-nearby approximation, not true lookahead semantics.

### Example 3: Regex filter with explicit anchors

Request: only TypeScript files under `client/`.

- RE2 pattern (file filter): `^client/.*\.tsx?$`
- Sourcegraph query: `file:^client/.*\.tsx?$ yourPattern patterntype:regexp`
- Notes: `file:` is unanchored by default, so anchors are used for exact path intent.

## Validation Checklist

- No lookarounds or backreferences remain.
- Any regex used in `repo:` or `file:` is anchored if exact matching was requested.
- Space handling is intentional (`/.../`, escaped spaces, or quoted phrase).
- Case behavior is explicit (`case:yes` if needed).
- Query is complete and runnable as written.

