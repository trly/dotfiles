return {
  "neovim/nvim-lspconfig",
  opts = {
    servers = {
      svelte = {
        capabilities = {
          workspace = {
            didChangeWatchedFiles = vim.fn.has("nvim-0.10") == 0 and { dynamicRegistration = true },
          },
        },
      },
      marksman = {},
      ltex = {
        filetypes = { "markdown", "tex", "bib" },
      },
      ts_ls = {
        init_options = {
          maxTsServerMemory = 8192,
        },
      },
    },
  },
}
