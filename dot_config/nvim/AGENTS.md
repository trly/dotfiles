# Neovim Configuration with mini.nvim

This configuration is based on [MiniMax](https://nvim-mini.org/MiniMax/), a Neovim config approach built primarily on [mini.nvim](https://github.com/nvim-mini/mini.nvim) modules.

## Architecture

### Bootstrap (`init.lua`)

- Auto-installs `mini.nvim` into the standard package path if missing
- Sets up `mini.deps` as the plugin manager
- Creates the `_G.Config` global table for shared state
- Defines `Config.now_if_args` — loads a plugin immediately if Neovim was opened with file arguments, otherwise defers it (optimizes startup for bare `nvim`)

### Plugin Files (`plugin/`)

Files in `plugin/` are automatically sourced by Neovim in alphabetical order. The numeric prefix controls load order:

| File | Purpose |
|------|---------|
| `10_options.lua` | Leader key settings |
| `20_keymap.lua` | Key mappings and leader group definitions |
| `30_mini.lua` | mini.nvim module configuration |
| `40_plugins.lua` | Third-party (non-mini) plugin configuration |

### Shared State (`_G.Config`)

The `_G.Config` global table passes data between plugin files. For example, `20_keymap.lua` defines `Config.leader_group_clues` which `30_mini.lua` consumes when setting up `mini.clue`.

## Plugin Management with mini.deps

This configuration uses `mini.deps` for plugin management. Plugin setup, mappings, and configuration guidelines are documented in `plugin/AGENTS.md`.

Core loading functions:

- **`now(fn)`** — Execute immediately during startup (UI-affecting plugins)
- **`later(fn)`** — Defer execution until after startup
- **`add(spec)`** — Declare a plugin dependency
- **`Config.now_if_args`** — Use `now` if files passed on command line, `later` otherwise

## References

- [mini.nvim documentation](https://github.com/nvim-mini/mini.nvim)
- [MiniMax reference config](https://nvim-mini.org/MiniMax/)
- [mini.deps help](https://github.com/nvim-mini/mini.nvim/blob/main/readmes/mini-deps.md)
