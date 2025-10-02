return {
  "neovim/nvim-lspconfig",
  opts = {
    servers = {
      svelte = {},
      marksman = {},
      ltex = {
        filetypes = { "markdown", "tex", "bib" },
      },
    },
  },
}
