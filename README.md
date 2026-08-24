# Personal Dotfiles

## Description

Personal dotfiles source managed with [chezmoi](https://www.chezmoi.io/). Source
files render from this repository into `$HOME`, with secrets fetched from
[1Password](https://1password.com/) at apply time. It configures the shell (zsh +
antidote plugins), Git, SSH, Neovim, Ghostty, jj, and other tools, gated by a
`work`/`personal` profile and the target OS. This is a personal configuration
repo, not a distributable library or service.

## Setup

Prerequisites: `chezmoi`, `git`, 1Password desktop app + CLI (signed in).

```bash
sh -c "$(curl -fsLS get.chezmoi.io)"
chezmoi init --apply https://github.com/trly/dotfiles.git
```

You'll be prompted for primary/secondary email and a profile (`work` or
`personal`); see `.chezmoi.toml.tmpl`.

## Post-setup

```bash
mise install        # install runtimes declared in dot_config/mise/config.toml
exec zsh            # new shell triggers antidote to clone+cache plugins
```

## Updating

```bash
chezmoi update      # pull repo + apply changes
```

## Troubleshooting

- **Plugin order changed but not picked up**: `rm ~/.zsh/zsh_plugins.zsh` then `exec zsh`.
- **Secrets failing to render**: ensure 1Password is unlocked and `op` is signed in.

## System context

Adjacent dependencies that this repository relies on:

| Dependency | Relationship | Evidence |
| --- | --- | --- |
| [chezmoi](https://www.chezmoi.io/) | Renders/applies this source tree into `$HOME` | `.chezmoi.toml.tmpl` |
| [1Password](https://1password.com/) CLI (`op`) | Provides secrets via `onepasswordRead` at apply time | `dot_zshrc.tmpl` |
| [antidote](https://github.com/mattmc3/antidote) | External git checkout; loads zsh plugins | `.chezmoiexternal.toml`, `dot_zsh/zsh_plugins.txt` |
| [trly/skills](https://github.com/trly/skills) | External git checkout into `~/.local/agent_skills/trly` | `.chezmoiexternal.toml` |
| [mise](https://mise.jdx.dev/) | Installs declared language runtimes (Go, Node, pnpm); Python via `uv` | `dot_config/mise/config.toml` |
