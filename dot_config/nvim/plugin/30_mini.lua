-- mini.nvim module config
local now, later = MiniDeps.now, MiniDeps.later

now(function()
  require('mini.icons').setup()
  MiniIcons.mock_nvim_web_devicons()
end)
now(function() require('mini.notify').setup() end)
now(function() require('mini.tabline').setup() end)
now(function() require('mini.statusline').setup() end)
now(function() require('mini.files').setup() end)

later(function()
  local hipatterns = require('mini.hipatterns')
  hipatterns.setup({
    highlighters = {
      fixme = { pattern = '%f[%w]()[Ff][Ii][Xx][Mm][Ee]()%f[%W]', group = 'MiniHipatternsFixme' },
      hack = { pattern = '%f[%w]()[Hh][Aa][Cc][Kk]()%f[%W]', group = 'MiniHipatternsHack' },
      todo = { pattern = '%f[%w]()[Tt][Oo][Dd][Oo]()%f[%W]', group = 'MiniHipatternsTodo' },
      note = { pattern = '%f[%w]()[Nn][Oo][Tt][Ee]()%f[%W]', group = 'MiniHipatternsNote' },
      hex_color = hipatterns.gen_highlighter.hex_color(),
    },
  })
end)

later(function()
  local miniclue = require('mini.clue')
  miniclue.setup({
    clues = {
      Config.leader_group_clues,
      miniclue.gen_clues.builtin_completion(),
      miniclue.gen_clues.g(),
      miniclue.gen_clues.marks(),
      miniclue.gen_clues.registers(),
      miniclue.gen_clues.square_brackets(),
      miniclue.gen_clues.windows({ submode_resize = true }),
      miniclue.gen_clues.z(),
    },
    triggers = {
      { mode = { 'n', 'x' }, keys = '<Leader>' },
      { mode = { 'n', 'x' }, keys = '[' },
      { mode = { 'n', 'x' }, keys = ']' },
      { mode = 'i', keys = '<C-x>' },
      { mode = { 'n', 'x' }, keys = 'g' },
      { mode = { 'n', 'x' }, keys = "'" },
      { mode = { 'n', 'x' }, keys = '`' },
      { mode = { 'n', 'x' }, keys = '"' },
      { mode = { 'i', 'c' }, keys = '<C-r>' },
      { mode = 'n', keys = '<C-w>' },
      { mode = { 'n', 'x' }, keys = 'z' },
    },
  })
end)
