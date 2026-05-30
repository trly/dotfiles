<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->
---
name: Waybar
description: Personal Wayland status bar — sharp, technical, muted
---

# Design System: Waybar

## 1. Overview

**Creative North Star: "The Instrument Panel"**

A status bar belongs in the periphery, not the foreground. Like a cockpit instrument cluster, it delivers precise information at a glance and asks nothing more. Every element earns its place by utility; nothing is decorative.

This system rejects garish/gaming aesthetics (neon gradients, RGB extremes, aggressive contrast), the default Waybar look (uncoordinated colors, no palette logic), MacOS menu bar clones (frosted glass, pill modules), and stock desktop taskbars (generic, no point of view).

**Key Characteristics:**
- Almost-black background that recedes behind content
- Monospace typography for technical precision
- Single warm accent (amber-copper) for focus/state — nothing else gets color
- Flat surfaces — no shadows, no elevation
- State is communicated through text color and subtle surface shifts, never through decorative backgrounds

## 2. Colors

**Strategy: Restrained.** Tinted warm neutrals carry the bar; a single amber-copper accent signals active/focused state. No module gets its own background color.

### Primary

- **Amber-Copper** (`#c48535`): The one accent. Focused workspace, active toggle, any element that needs to say "this is the thing." ≤10% of the bar surface at any time.

### Neutral

- **Almost-Black** (`#1d1b19`): Bar background. Deep enough to disappear into dark wallpapers, with a faint warm tint so it's not sterile.
- **Warm Light Gray** (`#c2bbb0`): Default text.
- **Warm Mid Gray** (`#6e6860`): Muted/inactive labels.

### Semantic (state only)

- **Warm Red** (`#b84737`): Critical battery, disconnection, error states.
- **Muted Green** (`#5c8748`): Battery charging, success.

### Platform Constraints

**Waybar uses GTK's CSS engine which does not support modern CSS color functions** (`oklch()`, `oklab()`, `color()`, `hwb()`). All color values must use hex (`#rrggbb`) or legacy `rgb()`/`rgba()`. The palette below is stored in hex and mirrored in `style.css`.

### Named Rules

**The One Accent Rule.** Amber-copper is the single chromatic accent. It appears only for focused/active state. If an element is not communicating focus or activity, it gets neutral text. The accent's rarity is the point.

**The No-Module-Background Rule.** Individual modules never get their own background color. Every module inherits the bar background. State is communicated through text color, bottom-border, and hover surface shifts.

## 3. Typography

**Display/Mono Font:** JetBrains Mono or Iosevka (with `monospace` fallback)

**Character:** Monospace reinforces the sharp, technical, developer-adjacent personality. Each character occupies equal ground — no fuss, no distraction. The bar reads like a terminal status line.

### Hierarchy

- **Label** (400, 13px, 30px line-height): Default module text. Single line, vertically centered in the bar.
- **Emphasis** (600, 13px, 30px line-height): Clock time, focused workspace label, values that need to stand out.

### Named Rules

**The Single-Size Rule.** 13px at two weights (400/600) is the entire scale. A status bar has no room for multi-step hierarchy. Weight does the work of size.

## 4. Elevation

The bar is flat. It sits on the screen edge with a single `1px` border separating it from content below. No shadows, no drop-shadows, no layering. Depth is not a tool this system uses.

Hover states shift the module background by one stop on the surface scale (`#2c2925` over `#1d1b19`). This is a surface change, not an elevation change.

### Named Rules

**The Flat-By-Default Rule.** No shadows anywhere. Hover is a surface color shift, not a lift.

## 5. Components

*No custom components exist yet. Waybar provides the module system; this design system provides the visual language applied to those modules. Re-run `/impeccable document` in scan mode once custom components or CSS tokens are defined.*

## 6. Do's and Don'ts

### Do:

- **Do** use the amber-copper accent sparingly — only for the one element that needs to say "active" or "focused"
- **Do** let the almost-black bar background do its job: make modules recede until looked at
- **Do** use weight (600) for the clock time and focused workspace — weight is your hierarchy tool
- **Do** keep the bar bottom-border subtle: `1px` at barely-lighter-than-bg
- **Do** communicate state through text color, not module background color

### Don't:

- **Don't** use neon gradients, RGB extremes, or aggressive contrast — this is not a gaming peripheral
- **Don't** give modules their own background colors — every module inherits the bar
- **Don't** use glassmorphism, frosted glass, pill modules — this is not a MacOS clone
- **Don't** use pure `#000` or `#fff` — tint every neutral toward the warm hue
- **Don't** use animated transitions beyond the battery critical blink — waybar is glanceable, not watchable
- **Don't** use border-left or border-right greater than 1px as a colored accent stripe
- **Don't** use gradient text anywhere
