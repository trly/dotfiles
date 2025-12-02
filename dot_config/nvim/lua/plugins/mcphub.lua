return {
  "ravitemer/mcphub.nvim",
  lazy = false,
  priority = 10000,
  config = function()
    require("mcphub").setup()
  end,
}
