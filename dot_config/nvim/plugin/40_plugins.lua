-- plugin configuration
local add, now, later = MiniDeps.add, MiniDeps.now, MiniDeps.later
local now_if_args = _G.Config.now_if_args

-- colorscheme
add({ source = 'ellisonleao/gruvbox.nvim' })
require('gruvbox').setup({ terminal_colors = true })
now(function() vim.cmd('colorscheme gruvbox') end)

now_if_args(function()
  add({
    source = 'nvim-treesitter/nvim-treesitter',
    hooks = { post_checkout = function() vim.cmd('TSUpdate') end },
  })
  add({
    source = 'nvim-treesitter/nvim-treesitter-textobjects',
    -- Use `main` branch since `master` branch is frozen, yet still default
    -- It is needed for compatibility with 'nvim-treesitter' `main` branch
    checkout = 'main',
  })
  add({ 'MagicDuck/grug-far.nvim' })
end)

now_if_args(function()
  add('mason-org/mason.nvim')
  require('mason').setup()
end)

now_if_args(function()
  add('neovim/nvim-lspconfig')
end)

later(function()
  add('stevearc/conform.nvim')

  require('conform').setup({
    default_format_opts = {
      lsp_format = 'fallback',
    },
  })
end)
