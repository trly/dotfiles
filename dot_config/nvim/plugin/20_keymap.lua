-- This file contains definitions of custom general and Leader mappings.

-- General mappings ===========================================================

local nmap = function(lhs, rhs, desc)
  -- See `:h vim.keymap.set()`
  vim.keymap.set('n', lhs, rhs, { desc = desc })
end

-- Paste linewise before/after current line
-- Usage: `yiw` to yank a word and `]p` to put it on the next line.
nmap('[p', '<Cmd>exe "put! " . v:register<CR>', 'Paste Above')
nmap(']p', '<Cmd>exe "put "  . v:register<CR>', 'Paste Below')

-- Create a global table with information about Leader groups in certain modes.
-- This is used to provide 'mini.clue' with extra clues.
-- Add an entry if you create a new group.
_G.Config.leader_group_clues = {
  { mode = 'n', keys = '<Leader>c', desc = '+Code' },
  { mode = 'n', keys = '<Leader>e', desc = '+Explore' },
  { mode = 'n', keys = '<Leader>f', desc = '+Find' },
  { mode = 'n', keys = '<Leader>l', desc = '+LSP/Language' },
  { mode = 'n', keys = '<Leader>q', desc = '+Quit' },
}

-- Helpers for a more concise `<Leader>` mappings.
-- Most of the mappings use `<Cmd>...<CR>` string as a right hand side (RHS) in
-- an attempt to be more concise yet descriptive. See `:h <Cmd>`.
-- This approach also doesn't require the underlying commands/functions to exist
-- during mapping creation: a "lazy loading" approach to improve startup time.
local nmap_leader = function(suffix, rhs, desc)
  vim.keymap.set('n', '<Leader>' .. suffix, rhs, { desc = desc })
end

-- f is for 'Find'.
nmap_leader('fr', '<Cmd>GrugFar<CR>', 'Find/Replace')

-- e is for 'Explore'.
nmap_leader('ed', '<Cmd>lua MiniFiles.open()<CR>', 'Explorer in current working directory')
nmap_leader('ef', '<Cmd>lua MiniFiles.open(vim.api.nvim_buf_get_name(0), false)<CR>', 'Explorer at current file')

-- c is for 'Code'
nmap_leader('cd', '<Cmd>Trouble diagnostics toggle<CR>', 'Diagnostics')
nmap_leader('cD', '<Cmd>Trouble diagnostics toggle filter.buf=0<CR>', 'Buffer diagnostics')
nmap_leader('cf', '<Cmd>lua require("conform").format()<CR>', 'Format buffer')
nmap_leader('cs', '<Cmd>Trouble symbols toggle<CR>', 'Symbols')
nmap_leader('cq', '<Cmd>Trouble qflist toggle<CR>', 'Quickfix list')

-- l is for 'LSP/Language'
nmap_leader('li', '<Cmd>lua vim.lsp.buf.hover()<CR>', 'Hover')
nmap_leader('ld', '<Cmd>lua vim.lsp.buf.definition()<CR>', 'Go to definition')
nmap_leader('lr', '<Cmd>lua vim.lsp.buf.references()<CR>', 'References')
nmap_leader('ln', '<Cmd>lua vim.lsp.buf.rename()<CR>', 'Rename')

-- q is for 'Quit'
nmap_leader('qq', '<Cmd>qa<CR>', 'Quit all')
