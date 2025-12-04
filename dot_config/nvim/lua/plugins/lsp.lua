return {
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        jedi_language_server = { enabled = false },
        ruff = {
          capabilities = {
            general = {
              positionEncodings = { "utf-16" },
            },
          },
        },
      },
    },
  },
}
