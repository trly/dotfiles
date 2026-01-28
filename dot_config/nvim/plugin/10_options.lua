vim.g.mapleader = ' ' -- Use `<Space>` as <Leader> key

vim.cmd('filetype plugin indent on')
if vim.fn.exists('syntax_on') ~= 1 then vim.cmd('syntax enable') end

