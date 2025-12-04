return {
  {
    "folke/sidekick.nvim",
    opts = {
      cli = {
        mux = {
          backend = "zellij",
          enabled = true,
        },
        tools = {
          amp = {
            cmd = { "amp" },
          },
        },
      },
    },
  },
  {
    "saghen/blink.cmp",
    opts = {
      keymap = {
        ["<Tab>"] = {
          "snippet_forward",
          function()
            return require("sidekick").nes_jump_or_apply()
          end,
          "select_next",
          "fallback",
        },
      },
    },
  },
}
