-- mini.nvim module config
local now, later = MiniDeps.now, MiniDeps.later
local now_if_args = _G.Config.now_if_args

now(function() require('mini.basics').setup() end)
now(function()
  require('mini.icons').setup()
  MiniIcons.mock_nvim_web_devicons()
end)
now(function() require('mini.notify').setup() end)
now(function() require('mini.tabline').setup() end)

-- Miscellaneous small but useful functions. Example usage:
-- - `<Leader>oz` - toggle between "zoomed" and regular view of current buffer
-- - `<Leader>or` - resize window to its "editable width"
-- - `:lua put_text(vim.lsp.get_clients())` - put output of a function below
--   cursor in current buffer. Useful for a detailed exploration.
-- - `:lua put(MiniMisc.stat_summary(MiniMisc.bench_time(f, 100)))` - run
--   function `f` 100 times and report statistical summary of execution times
--
-- Uses `now()` for `setup_xxx()` to work when started like `nvim -- path/to/file`
now_if_args(function()
  -- Makes `:h MiniMisc.put()` and `:h MiniMisc.put_text()` public
  require('mini.misc').setup()

  -- Change current working directory based on the current file path. It
  -- searches up the file tree until the first root marker ('.git' or 'Makefile')
  -- and sets their parent directory as a current directory.
  -- This is helpful when simultaneously dealing with files from several projects.
  MiniMisc.setup_auto_root()

  -- Restore latest cursor position on file open
  MiniMisc.setup_restore_cursor()

  -- Synchronize terminal emulator background with Neovim's background to remove
  -- possibly different color padding around Neovim instance
  MiniMisc.setup_termbg_sync()
end)

later(function()
  require('mini.extra').setup()
  require('mini.cmdline').setup()
  require('mini.pick').setup()
  require('mini.files').setup()
  require('mini.diff').setup()
  require('mini.ai').setup({ search_method = 'cover' })
  require('mini.bracketed').setup()
  require('mini.operators').setup()
  require('mini.surround').setup()
  require('mini.pairs').setup({ modes = { command = true } })
  require('mini.git').setup()
end)

later(function()
  local hipatterns = require('mini.hipatterns')
  local hi_words = MiniExtra.gen_highlighter.words
  hipatterns.setup({
    highlighters = {
      fixme = hi_words({ 'FIXME', 'Fixme', 'fixme' }, 'MiniHipatternsFixme'),
      hack  = hi_words({ 'HACK',  'Hack',  'hack' },  'MiniHipatternsHack'),
      todo  = hi_words({ 'TODO',  'Todo',  'todo' },  'MiniHipatternsTodo'),
      note  = hi_words({ 'NOTE',  'Note',  'note' },  'MiniHipatternsNote'),
      hex_color = hipatterns.gen_highlighter.hex_color(),
    },
  })
end)

-- Show next key clues in a bottom right window. Requires explicit opt-in for
-- keys that act as clue trigger. Example usage:
-- - Press `<Leader>` and wait for 1 second. A window with information about
--   next available keys should appear.
-- - Press one of the listed keys. Window updates immediately to show information
--   about new next available keys. You can press `<BS>` to go back in key sequence.
-- - Press keys until they resolve into some mapping.
--
-- Note: it is designed to work in buffers for normal files. It doesn't work in
-- special buffers (like for 'mini.starter' or 'mini.files') to not conflict
-- with its local mappings.
--
-- See also:
-- - `:h MiniClue-examples` - examples of common setups
-- - `:h MiniClue.ensure_buf_triggers()` - use it to enable triggers in buffer
-- - `:h MiniClue.set_mapping_desc()` - change mapping description not from config
later(function()
   local miniclue = require('mini.clue')
   -- stylua: ignore
   miniclue.setup({
     -- Define which clues to show. By default shows only clues for custom mappings
     -- (uses `desc` field from the mapping; takes precedence over custom clue).
     clues = {
       -- This is defined in 'plugin/20_keymap.lua' with Leader group descriptions
       Config.leader_group_clues,
       miniclue.gen_clues.builtin_completion(),
       miniclue.gen_clues.g(),
       miniclue.gen_clues.marks(),
       miniclue.gen_clues.registers(),
       miniclue.gen_clues.square_brackets(),
       -- This creates a submode for window resize mappings. Try the following:
       -- - Press `<C-w>s` to make a window split.
       -- - Press `<C-w>+` to increase height. Clue window still shows clues as if
       --   `<C-w>` is pressed again. Keep pressing just `+` to increase height.
       --   Try pressing `-` to decrease height.
       -- - Stop submode either by `<Esc>` or by any key that is not in submode.
       miniclue.gen_clues.windows({ submode_resize = true }),
       miniclue.gen_clues.z(),
       -- mini.surround text object operations
       { mode = 'n', keys = 's', desc = '+Surround' },
       { mode = 'x', keys = 's', desc = '+Surround' },
     },
    -- Explicitly opt-in for set of common keys to trigger clue window
    triggers = {
      { mode = { 'n', 'x' }, keys = '<Leader>' }, -- Leader triggers
      { mode =   'n',        keys = '\\' },       -- mini.basics
      { mode = { 'n', 'x' }, keys = '[' },        -- Built-in [ mappings
      { mode = { 'n', 'x' }, keys = ']' },        -- Built-in ] mappings
      { mode =   'i',        keys = '<C-x>' },    -- Built-in completion
      { mode = { 'n', 'x' }, keys = 'g' },        -- `g` key
      { mode = { 'n', 'x' }, keys = "'" },        -- Marks
      { mode = { 'n', 'x' }, keys = '`' },
      { mode = { 'n', 'x' }, keys = '"' },        -- Registers
      { mode = { 'i', 'c' }, keys = '<C-r>' },
      { mode =   'n',        keys = '<C-w>' },    -- Window commands
      { mode = { 'n', 'x' }, keys = 's' },        -- `s` key
      { mode = { 'n', 'x' }, keys = 'z' },        -- `z` key
    },
  })
end)
