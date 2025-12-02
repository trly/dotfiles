return {
  "olimorris/codecompanion.nvim",
  lazy = false,
  version = "v17.33.0",
  opts = {
    adapters = {
      claude_code = {
        env = {
          api_key = "ANTHROPIC_API_KEY",
        },
      },
    },
    strategies = {
      chat = {
        adapter = "claude_code",
      },
    },
  },
  dependencies = {
    "nvim-lua/plenary.nvim",
    "ravitemer/mcphub.nvim",
  },
}
