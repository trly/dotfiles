-- plugin configuration
local add, now, later = MiniDeps.add, MiniDeps.now, MiniDeps.later
local now_if_args = _G.Config.now_if_args
local treesitter_highlight_filetypes = {
  'css',
  'go',
  'groovy',
  'html',
  'ini',
  'java',
  'javascript',
  'json',
  'kotlin',
  'lua',
  'markdown',
  'python',
  'svelte',
  'toml',
  'typescript',
  'yaml',
}
local treesitter_install_parsers = { 'svelte', 'html', 'css', 'javascript' }

now(function()
  add({
    source = 'nvim-treesitter/nvim-treesitter',
    checkout = 'main',
    hooks = { post_checkout = function() vim.cmd('TSUpdate') end },
  })

  pcall(function()
    require('nvim-treesitter').install(treesitter_install_parsers)
  end)

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

  add({
    source = 'mason-org/mason-lspconfig.nvim',
    depends = {
      'mason-org/mason.nvim',
      'neovim/nvim-lspconfig',
    },
  })
  require('mason-lspconfig').setup({
    ensure_installed = {
      'gopls',
      'jdtls',
      'kotlin_lsp',
      'lua_ls',
      'basedpyright',
      'svelte',
      'tsc',
    },
    automatic_enable = true,
  })

  vim.api.nvim_create_autocmd('BufWritePost', {
    group = vim.api.nvim_create_augroup('svelte-lsp-sync-ts-js', { clear = true }),
    pattern = { '*.js', '*.ts' },
    callback = function(args)
      for _, client in ipairs(vim.lsp.get_clients({ name = 'svelte' })) do
        client:notify('$/onDidChangeTsOrJsFile', { uri = vim.uri_from_bufnr(args.buf) })
      end
    end,
  })
end)

later(function()
  add({ source = 'folke/trouble.nvim', depends = { 'nvim-mini/mini.icons' } })
  require('trouble').setup()
end)

later(function()
  add('MagicDuck/grug-far.nvim')
  require('grug-far').setup()

  add({
    source = 'MeanderingProgrammer/render-markdown.nvim',
    depends = {
      'nvim-treesitter/nvim-treesitter',
      'nvim-mini/mini.icons',
    },
  })
  require('render-markdown').setup()

  add('stevearc/conform.nvim')
  require('conform').setup({
    default_format_opts = {
      lsp_format = 'fallback',
    },
    format_on_save = {
      lsp_format = 'fallback',
      timeout_ms = 500,
    },
  })
end)
