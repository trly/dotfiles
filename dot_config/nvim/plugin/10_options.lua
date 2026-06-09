-- Disable netrw so neo-tree handles directory opens
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1

vim.g.mapleader = ' ' -- Use `<Space>` as <leader> key
vim.g.maplocalleader = '\\' -- Use `\` as <localleader> key

-- Sync yank/paste with system clipboard
vim.opt.clipboard = 'unnamedplus'
