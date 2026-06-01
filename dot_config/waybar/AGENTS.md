# Waybar config — Hyprland

Single-user developer status bar. Sharp, technical, muted. Hyprland, not Sway.

## Repo layout

| File | Purpose |
|---|---|
| `config.jsonc` | Module order, format strings, per-module options |
| `style.css` | Visual styling |

## What matters

**Never use sway/ modules.** This is Hyprland. Valid prefixes: `hyprland/workspaces`, `hyprland/window`, `hyprland/submap`, `hyprland/language`. Sway modules silently produce no output.

**Module layout (current):**
- Left: `hyprland/workspaces`, `hyprland/submap`
- Center: `hyprland/window`
- Right: `tray`, `network`, `bluetooth`, `pipewire`, `battery`, `clock`

Order follows glance priority. Don't reorder without reason.

## DESIGN.md rules (must follow)

- **No module background colors.** Every module inherits the bar background. State via text color and bottom-border only.
- **Monospace font** (JetBrains Mono or Iosevka)
- **Flat surfaces** — no shadows, no elevation.
- **No gradient text, no side-stripe borders, no glassmorphism.**

## Dependencies

- Waybar auto-reloads on config changes. Run `pkill -USR2 waybar` if it doesn't pick up changes.

## GTK CSS Reference (from waybar source)

Waybar uses GTK3 CSS via `Gtk::CssProvider`. All styling targets standard GTK widget paths.

### Top-level selectors

| Selector | How | Source |
|---|---|---|
| `window#waybar` | `window.set_name("waybar")` | `bar.cpp:147` |
| `window#waybar.<output-name>` | `add_class(output->name)` (e.g. `DP-1`) | `bar.cpp:149` |
| `window#waybar.top`, `.bottom`, `.left`, `.right` | `add_class(to_string(position))` | `bar.cpp:157` |
| `window#waybar.mode-<mode>` | `add_class("mode-" + mode)` | `bar.cpp:336` |
| `window#waybar.hidden` | `add_class("hidden")` | `bar.cpp:369` |
| `window#waybar.solo`, `.empty`, `.floating`, `.fullscreen`, `.swallowing` | Bar-level window state classes | `hyprland/window.cpp:89-93` |

### Module selectors

- **`#<module-name>`** — every module widget gets `set_name(name)` (e.g. `#clock`, `#battery`, `#network`, `#workspaces`, `#window`). Source: `ALabel.cpp:32`, `ASlider.cpp:12`.
- **`#<user-id>`** — config syntax `"module#myid"` sets a custom CSS ID. Source: `factory.cpp:131`.
- **`.module`** — `MODULE_CLASS` constant applied to every label/slider/workspace widget. Source: `AModule.hpp:15`, used in `ALabel.cpp:36`, `ASlider.cpp:16`, `workspaces.cpp:28`.
- **`#<module-name>.<state>`** — dynamic state classes toggled per module.

### Dynamic state classes by module

| Module | Classes |
|---|---|
| `#battery` | `.charging`, `.plugged`, `.critical`, `.<status>` (`discharging`, `full`, `not-charging`), plus user-defined state thresholds |
| `#network` | `.disconnected` |
| `#pulseaudio`, `#wireplumber` | `.muted` |
| `#idle_inhibitor` | `.activated` |
| `#power-profiles-daemon` | `.performance`, `.balanced`, `.power-saver` |
| `#temperature` | `.critical` |
| `#custom-media` | `.custom-<name>` (e.g. `.custom-spotify`, `.custom-vlc`) |
| `#mpd` | `.disconnected`, `.stopped`, `.paused` |
| `#language` | No states (static styling only) |
| `#scratchpad` | `.empty` |
| `#keyboard-state > label` | `.locked` |
| `#privacy-item` | `.screenshare`, `.audio-in`, `.audio-out` |
| `#tray > .passive` | `-gtk-icon-effect: dim` |
| `#tray > .needs-attention` | `-gtk-icon-effect: highlight` |

### Workspace button classes (`hyprland/workspaces`)

Each workspace is a `Gtk::Button` inside `#workspaces`. Dynamic classes from `workspace.cpp:234-241`:

- `.active` — focused workspace on this bar
- `.special` — special workspace (scratchpad)
- `.empty` — no windows
- `.persistent` — defined in config or workspace rules
- `.urgent` — window requesting attention
- `.visible` — visible on some monitor
- `.hosting-monitor` — parked on this bar's monitor
- `.workspace-label` — inner label of workspace button

### Groups & drawers

- `group/<name>` — group box name
- `group/<name>#<id>` — optional group ID
- `.drawer` — revealer widget for drawer groups
- `.drawer-child` (configurable via `drawer.children-class`) — child widgets inside drawer

### Bar layout containers

- `.modules-left`, `.modules-center`, `.modules-right` — position boxes on the bar. Source: `bar.cpp:164-166`.

### Key GTK3 APIs used

| API | Purpose | Source |
|---|---|---|
| `widget.set_name("name")` | Sets CSS ID `#name` | `ALabel.cpp:32`, `bar.cpp:147` |
| `add_class(name)` / `remove_class(name)` / `has_class(name)` | Toggle CSS classes | throughout |
| `set_state_flags(STATE_FLAG_PRELIGHT)` | Hover state for drawer/group | `AModule.cpp:132`, `group.cpp:96` |
| `Gtk::CssProvider::load_from_path()` | Load `style.css` | `client.cpp:214` |
| `Gtk::CssProvider::load_from_data()` | Load transformed CSS (8-bit colors) | `client.cpp:212` |
| `@import url(...)` | CSS imports supported | `waybar-styles.5.scd.in:24` |
| `label:focus` | Focus pseudo-class | `style.css:167` |
| `button:hover` | Hover pseudo-class on workspace buttons | `style.css:46` |
| `#module:hover` | Hover effect on any module | `waybar-styles.5.scd.in:37` |

### Styling rules

- No module background colors — inherit from `window#waybar`
- State via text color and bottom-border only
- Monospace font (JetBrains Mono or Iosevka)
- Flat surfaces — no shadows, no elevation
- No gradient text, no side-stripe borders, no glassmorphism

## Validation

```sh
# config.jsonc uses JSONC (C-style comments). Strip before JSON parse:
python3 -c "import json, re; text = open('config.jsonc').read(); json.loads(re.sub(r'//.*', '', text)); print('valid')"
```

