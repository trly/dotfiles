-- mini.hues palette per 'background'; re-sourced automatically on bg change
local bases = {
  dark = { background = '#232634', foreground = '#c6d0f5' },
  light = { background = '#eff1f5', foreground = '#4c4f69' },
}
require('mini.hues').setup(bases[vim.o.background] or bases.dark)
vim.g.colors_name = 'minihues'
vim.defer_fn(function() print("DBG-FILE colors_name:", vim.g.colors_name) end, 300)
