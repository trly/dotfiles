-- plugin configuration
local add, now, later = MiniDeps.add, MiniDeps.now, MiniDeps.later
local now_if_args = _G.Config.now_if_args
local treesitter_highlight_filetypes = { 
	'go',
	'groovy',
	'ini',
	'java',
	'json',
	'kotlin', 
	'lua',
	'markdown', 
	'toml', 
	'yaml' 
}

-- colorscheme
now(function()
  add({ source = 'ellisonleao/gruvbox.nvim' })
  require('gruvbox').setup({ terminal_colors = true })
  vim.cmd('colorscheme gruvbox')
end)

later(function()
  add({
    source = 'nvim-neo-tree/neo-tree.nvim',
    checkout = 'v3.x',
    depends = {
      "nvim-lua/plenary.nvim",
      "MunifTanjim/nui.nvim",
    }
  })
end)

now(function()
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

  -- Start Tree-sitter explicitly for filetypes that should always use it.
  vim.api.nvim_create_autocmd('FileType', {
    group = vim.api.nvim_create_augroup('treesitter-highlight', { clear = true }),
    pattern = treesitter_highlight_filetypes,
    callback = function(args)
      pcall(vim.treesitter.start, args.buf)
    end,
  })

  for _, buf in ipairs(vim.api.nvim_list_bufs()) do
    if vim.api.nvim_buf_is_loaded(buf) and vim.tbl_contains(treesitter_highlight_filetypes, vim.bo[buf].filetype) then
      pcall(vim.treesitter.start, buf)
    end
  end
end)

now_if_args(function()
  add('mason-org/mason.nvim')
  require('mason').setup()

  add('neovim/nvim-lspconfig')
  vim.lsp.enable('jdtls')
  vim.lsp.enable('kotlin_language_server')
end)

now(function()
  add({ source = 'sourcegraph/amp.nvim' })
  require('amp').setup({ auto_start = true, log_level = 'info' })
end)

later(function()
  add({
    source = 'olimorris/codecompanion.nvim',
    depends = {
      'nvim-lua/plenary.nvim',
      'nvim-treesitter/nvim-treesitter',
    },
  })
  require('codecompanion').setup({
	  interactions = {
		  chat = {
			  adapter = {
				  name = "claude_code",
				  model = "opus",
			  }
		  }
	  }
  })
end)

later(function()
  add({ source = 'folke/trouble.nvim', depends = { 'nvim-mini/mini.icons' } })
  require('trouble').setup()
end)

now_if_args(function()
  add({
    source = 'iamcco/markdown-preview.nvim',
    hooks = { post_checkout = function() vim.fn['mkdp#util#install']() end },
  })
end)

later(function()
  add('MagicDuck/grug-far.nvim')
  require('grug-far').setup()

  add({
    source = 'MeanderingProgrammer/render-markdown.nvim',
    depends = {
      'nvim-treesitter/nvim-treesitter',
      'nvim-mini/mini.icons'
    }
  })
  require('render-markdown').setup()

  add('stevearc/conform.nvim')
  require('conform').setup({
    default_format_opts = {
      lsp_format = 'fallback',
    },
  })
end)
