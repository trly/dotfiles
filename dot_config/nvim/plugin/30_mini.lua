-- mini.nvim module config
local now, later = MiniDeps.now, MiniDeps.later

now(function() require('mini.basics').setup() end)
now(function() require('mini.icons').setup() end)
now(function() require('mini.pick').setup() end)
now(function() require('mini.files').setup() end)
now(function() require('mini.cmdline').setup() end)
now(function() require('mini.notify').setup() end)
