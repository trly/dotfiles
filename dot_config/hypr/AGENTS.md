# hypr config

Hyprland Lua config (`hyprland.lua`). Config changes apply on the fly — no restart needed.

## Commands

- `hyprctl reload` — reload entire config
- `hyprctl dispatch ...` — dispatch actions at runtime

## Architecture

- **Entrypoint**: `hyprland.lua` only. Can split into Lua modules with `require(...)`.
- Config uses the Lua API (`hl.*`), not the legacy keyword-based format.
- **External deps** in use: `ghostty`, `yazi`, `hyprlauncher`, `waybar`, `playerctl`, `wpctl`, `brightnessctl`, `hyprshutdown`.

## Key gotchas

- Permission changes (`hl.config({ ecosystem = { enforce_permissions = true } })`) need a Hyprland restart — not hot-reloadable.
- `hl.workspace_rule` and `hl.window_rule` support `:set_enabled(false)` toggling — useful for quick experiments.
- Refer to https://wiki.hypr.land/Configuring/Start/ for the full API reference.
