# Personal Dotfiles

Managed with [chezmoi](https://www.chezmoi.io/). Secrets fetched from [1Password](https://1password.com/) at apply time.

## Setup

Prerequisites: `chezmoi`, `git`, 1Password desktop app + CLI (signed in).

```bash
sh -c "$(curl -fsLS get.chezmoi.io)"
chezmoi init --apply https://github.com/trly/dotfiles.git
```

You'll be prompted for primary/secondary email and a profile (`work` or `home`).

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
