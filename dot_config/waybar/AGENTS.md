# Waybar config — Hyprland

Single-user developer status bar. Sharp, technical, muted. Hyprland, not Sway.

## Repo layout

| File | Purpose |
|---|---|
| `config.jsonc` | Module order, format strings, per-module options |
| `style.css` | Visual styling (currently stale default — needs DESIGN.md overhaul) |
| `PRODUCT.md` | Product context for design decisions |
| `DESIGN.md` | Design system spec — color, typography, elevation rules |

## What matters

**Never use sway/ modules.** This is Hyprland. Valid prefixes: `hyprland/workspaces`, `hyprland/window`, `hyprland/submap`, `hyprland/language`. Sway modules silently produce no output.

**Module layout (current):**
- Left: `hyprland/workspaces`, `hyprland/submap`
- Center: `hyprland/window`
- Right: `clock`, `battery`, `network`, `pulseaudio`, `tray`

Order follows glance priority. Don't reorder without reason.

## DESIGN.md rules (must follow)

- **No module background colors.** Every module inherits the bar background. State via text color and bottom-border only.
- **Single amber-copper accent** for focused/active state only (≤10% of surface).
- **Almost-black background** with warm tint — never `#000` or `#fff`.
- **Monospace font** (JetBrains Mono or Iosevka), 13px.
- **Flat surfaces** — no shadows, no elevation.
- **No gradient text, no side-stripe borders, no glassmorphism.**

Current `style.css` violates most of these — it's the old default with rainbow module backgrounds. Expect a full rewrite.

## Dependencies

- `otf-font-awesome` for Nerd Font glyphs (Ubuntu package). Missing glyphs = blank squares.
- Waybar auto-reloads on config changes. Run `pkill -USR2 waybar` if it doesn't pick up changes.

## Validation

```sh
# config.jsonc uses JSONC (C-style comments). Strip before JSON parse:
python3 -c "import json, re; text = open('config.jsonc').read(); json.loads(re.sub(r'//.*', '', text)); print('valid')"
```

## Design context

Referenced via `impeccable` skill at `~/.agents/skills/impeccable/`. Run `node ~/.agents/skills/impeccable/scripts/load-context.mjs` to load PRODUCT.md + DESIGN.md context before any styling work.
