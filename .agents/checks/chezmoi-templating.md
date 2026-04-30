---
name: chezmoi-templating
description: Validate chezmoi template rendering, profile gating, and secret handling
severity-default: medium
tools: [Bash, Grep, Read]
---

Only apply this check when the review touches a chezmoi source repo or files that affect chezmoi rendering, such as `*.tmpl`, `.chezmoi.toml.tmpl`, or template-backed dotfiles. If the diff does not touch templated chezmoi sources, return no findings.

Validate template changes for these failure modes:

- Broken Go template syntax or helper usage.
- References to missing data, prompts, or built-in variables.
- Incorrect quoting or escaping that would render invalid shell, TOML, Git, SSH, or editor config.
- Profile-gated blocks that would leak `work` settings into `home` or `home` settings into `work`.
- Secrets or tokens hardcoded instead of loaded through a secret provider such as `onepasswordRead`.

When templating changes are present, confirm the review considered the right chezmoi validation command for the change:

- `chezmoi execute-template --file <source-template>` for raw template rendering.
- `chezmoi diff --source-path <source-file> --no-pager` or `chezmoi apply --dry-run --source-path <source-file>` for a single rendered target.
- `chezmoi apply --dry-run --verbose` or `chezmoi verify` when shared data or repo-wide rendering behavior changed.

Report concrete findings with file and line references. Explain what would render incorrectly or unsafely, and name the command that would reproduce or validate the issue.
