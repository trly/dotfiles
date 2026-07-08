vim.g.mapleader = ' ' -- Use `<Space>` as <leader> key
vim.g.maplocalleader = '\\' -- Use `\` as <localleader> key

-- Sync yank/paste with system clipboard
vim.opt.clipboard = 'unnamedplus'

-- Soft-wrap long lines at the window edge, breaking at word boundaries
vim.opt.wrap = true
vim.opt.linebreak = true
