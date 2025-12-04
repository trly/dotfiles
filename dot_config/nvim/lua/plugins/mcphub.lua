return {
  "ravitemer/mcphub.nvim",
  lazy = false,
  priority = 10000,
  build = "bundled_build.lua",
  config = function()
    require("mcphub").setup({
      use_bundled_binary = true,
    })
  end,
}
