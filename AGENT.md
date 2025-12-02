# Agent Guidelines for chezmoi dotfiles

## Architecture & Structure
- This is a **chezmoi** dotfiles repository for personal configuration management
- Files use the `dot_` prefix for dotfiles (e.g., `dot_zshrc.tmpl` → `~/.zshrc`)
- Templates use `.tmpl` extension for variable substitution
- Main config areas: shell (zsh), git, terminal (ghostty), SSH configs

## Key Commands
- `chezmoi apply` - Apply dotfiles to home directory
- `chezmoi diff` - Show differences between source and target
- `chezmoi add <file>` - Add file to chezmoi management
- `chezmoi edit <file>` - Edit a managed file
- `chezmoi cd` - Change to chezmoi source directory
- `chezmoi status` - Show status of managed files
- `chezmoi doctor` - Check for potential issues

## Configuration
- `.chezmoi.toml.tmpl` contains prompts for email/profile variables
- Templates use `{{ .variable }}` syntax for substitution
- Git auto-commit/push enabled in chezmoi config
- Profile-specific config (work vs home) using `{{ if eq .profile "work" }}`

## Style Guidelines
- Use template variables for personal data (email, API keys)
- Store secrets in 1Password with `onepasswordRead` function
- Maintain consistent indentation (tabs for git config, spaces for others)
- Use descriptive aliases and maintain existing naming conventions
- Keep configs organized by application in `dot_config/` directory
