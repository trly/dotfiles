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
        handlers = {
          ["textDocument/publishDiagnostics"] = function(_, result, ctx, config)
            if result.diagnostics then
              -- Filter out "declared but never read" hints for Svelte files
              result.diagnostics = vim.tbl_filter(function(diagnostic)
                return not (
                  diagnostic.severity == vim.diagnostic.severity.HINT
                  and diagnostic.message:match("is declared but its value is never read")
                )
              end, result.diagnostics)
            end
            vim.lsp.diagnostic.on_publish_diagnostics(_, result, ctx, config)
          end,
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
