vim.g.mapleader = ' ' -- Use `<Space>` as <leader> key
vim.g.maplocalleader = '\\' -- Use `\` as <localleader> key

vim.cmd('filetype plugin indent on')
if vim.fn.exists('syntax_on') ~= 1 then vim.cmd('syntax enable') end

