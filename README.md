# Personal Dotfiles with Chezmoi

Personal dotfiles managed with [chezmoi](https://www.chezmoi.io/)

## 🚀 Quick Start

```bash
# Install chezmoi
sh -c "$(curl -fsLS get.chezmoi.io)"

# Initialize and apply dotfiles
chezmoi init --apply https://github.com/trly/dotfiles.git
```

## 📋 Requirements

- macOS or Linux with Zsh
- chezmoi >= v2.42
- 1Password CLI
- Git 2.30+

**Optional but recommended:**
```bash
brew install diff-so-fancy neovim mise fzf zsh-autosuggestions zsh-syntax-highlighting
```

## 🔧 Installation

### First-time Setup

1. **Install chezmoi** (if not already installed):
   ```bash
   sh -c "$(curl -fsLS get.chezmoi.io)"
   ```

2. **Initialize dotfiles**:
   ```bash
   chezmoi init --apply https://github.com/trly/dotfiles.git
   ```

3. **You'll be prompted for**:
   - Email address (used in Git configuration)
   - Profile (`work` or `personal`)

4. **Authenticate 1Password CLI**:
   ```bash
   eval "$(op signin)"
   ```

5. **Apply to pull secrets**:
   ```bash
   chezmoi apply
   ```

6. **Restart your shell** or open a new terminal

### Non-interactive Installation

```bash
export CHEZMOI_EMAIL="your@email.com"
export CHEZMOI_PROFILE="personal"
chezmoi init --apply https://github.com/trly/dotfiles.git
```

Files prefixed with `dot_` map to dotfiles in `$HOME`. Templates use `{{ .variable }}` syntax.

## 🔐 Secrets Management

All secrets are stored in 1Password and referenced via templates:

```bash
export AMP_API_KEY={{ onepasswordRead "op://Private/Amp API Key/credential" }}
```

**Requirements:**
- 1Password CLI installed and signed in
- Secrets stored in 1Password with correct vault/item paths

**Adding new secrets:**
1. Store in 1Password
2. Reference in templates using `onepasswordRead`
3. Apply changes with `chezmoi apply`

**Auto-commit enabled**: Changes are automatically committed and pushed when you run `chezmoi apply`.

## 📄 License

MIT License - feel free to use and modify as needed.
