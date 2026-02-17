-- plugin configuration
local add, now, later = MiniDeps.add, MiniDeps.now, MiniDeps.later
local now_if_args = _G.Config.now_if_args

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

  add('mason-org/mason.nvim')
  require('mason').setup()

  add('neovim/nvim-lspconfig')
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
