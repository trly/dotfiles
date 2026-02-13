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

`mini.deps` (`MiniDeps`) is the plugin manager. It provides three loading functions:

- **`now(fn)`** — Execute immediately during startup. Use for UI-affecting plugins (colorschemes, statusline, notifications, icons).
- **`later(fn)`** — Defer execution until after startup. Use for plugins not needed immediately (pickers, file explorers, formatters, command line).
- **`add(spec)`** — Declare a plugin dependency. Accepts a source string (`'author/repo'`) or a table with `source`, `depends`, `checkout`, and `hooks` fields.
- **`Config.now_if_args`** — Resolves to `now` when files are passed on the command line, `later` otherwise. Use for plugins that must be ready when editing a file but can be deferred for a bare `nvim` launch.

### Adding a new plugin

```lua
-- In plugin/40_plugins.lua (or plugin/30_mini.lua for mini modules)
later(function()
  add('author/plugin-name')
  require('plugin-name').setup({})
end)
```

Use `now()` instead of `later()` only if the plugin must be visible at startup. Wrap both `add()` and `require().setup()` inside the same loading function.

### Adding a new mini.nvim module

```lua
-- In plugin/30_mini.lua
later(function()
  require('mini.modulename').setup({})
end)
```

No `add()` call is needed — all mini modules are already available from the `mini.nvim` package installed at bootstrap. New modules can be added to an existing `later()` block if they have no ordering dependency with the other modules in that block.

## Icons

`mini.icons` is loaded with `now()` and calls `MiniIcons.mock_nvim_web_devicons()` to provide a drop-in replacement for `nvim-tree/nvim-web-devicons`. Third-party plugins that depend on `nvim-web-devicons` (e.g., Neo-tree, render-markdown) do not need it listed in their `depends` — the mock handles it.

## Key Mappings

Mappings are defined in `plugin/20_keymap.lua` using helper functions:

- `nmap(lhs, rhs, desc)` — Normal mode mapping
- `nmap_leader(suffix, rhs, desc)` — Normal mode `<Leader>` + suffix mapping
- `xmap_leader(suffix, rhs, desc)` — Visual mode `<Leader>` + suffix mapping

Leader key is `<Space>` (set in `10_options.lua`).

### Leader groups

Leader mappings are organized into groups. When adding a new group:

1. Add a clue entry to `Config.leader_group_clues` in `20_keymap.lua`
2. Add the actual mappings below using `nmap_leader()`

This ensures `mini.clue` displays the group description in its popup.

## Conventions

- Use `<Cmd>...<CR>` for mapping RHS strings — this avoids requiring functions/commands to exist at mapping creation time (lazy loading friendly)
- Every mapping must include a `desc` string for discoverability via `mini.clue`
- mini.nvim modules do not need `add()` — they ship with the single `mini.nvim` install
- Third-party plugins go in `plugin/40_plugins.lua`; mini modules go in `plugin/30_mini.lua`
- Prefer mini.nvim modules over third-party plugins when a suitable module exists
- Each mini module creates a global `Mini*` object after `setup()` (e.g., `MiniFiles`, `MiniPick`) which can be used in mappings and commands
- Wrap both `add()` and `require().setup()` inside the same `now()`/`later()`/`now_if_args()` block — do not leave `add()` calls at the top level
- Use `mini.icons` with `mock_nvim_web_devicons()` instead of the `nvim-tree/nvim-web-devicons` plugin

## References

- [mini.nvim documentation](https://github.com/nvim-mini/mini.nvim)
- [MiniMax reference config](https://nvim-mini.org/MiniMax/)
- [mini.deps help](https://github.com/nvim-mini/mini.nvim/blob/main/readmes/mini-deps.md)
