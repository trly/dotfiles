# Zellij Config

Single file: `config.kdl` (chezmoi source `dot_config/zellij/config.kdl`). Plain managed file, **not** a `.tmpl` — no secrets, no templating.

## Gotchas
- Edit the chezmoi **source** here, never the live target — target edits get clobbered.
- After `chezmoi apply`, the target may have drifted if Zellij rewrote it; re-run `chezmoi diff` to reconcile, and pull intentional UI-made changes back into source rather than overwriting them blindly.
- `keybinds clear-defaults=true` means the **entire** keymap is custom. Don't assume any default Zellij binding exists; check the file.
- `default_mode "locked"` — sessions start locked. `Ctrl g` toggles locked/normal; most mode switches return to `locked`.

## Config facts
- Language is [KDL](https://kdl.dev). Root-level keys (`theme_dark`, `default_mode`, etc.) are "options"; `keybinds`, `plugins`, `ui`, `themes`, `env` are blocks.
- Zellij hot-reloads the active config file; most option changes apply without restart. Fields needing a restart say so in their inline comment (and in the docs).

## Verify
- `zellij setup --check` — validates config + reports the dirs/files actually in use. Run this after editing.
- `chezmoi verify ~/.config/zellij/config.kdl`
- `chezmoi diff --source-path config.kdl --no-pager`
- Do **not** use `chezmoi execute-template` here (file is not a template).

## Going past basic config
For anything beyond editing existing options/keybinds, consult the docs instead of guessing:
- Options reference (every root key): https://zellij.dev/documentation/options.html
- Keybindings + modifiers: https://zellij.dev/documentation/keybindings.html
- Themes: https://zellij.dev/documentation/themes.html
- Layouts: https://zellij.dev/documentation/layouts.html
- Plugins / plugin aliases: https://zellij.dev/documentation/plugins.html
- Docs root: https://zellij.dev/documentation/
