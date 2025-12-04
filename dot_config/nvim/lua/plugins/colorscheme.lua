return {
  {
    "LazyVim/LazyVim",
    opts = {
      colorscheme = "catppuccin",
    },
  },
  {
    "catppuccin/nvim",
    name = "catppuccin",
    opts = {
      flavour = "auto", -- latte, frappe, macchiato, mocha
      transparent_background = true, -- disables setting the background color.
      background = { -- :h background
        light = "latte",
        dark = "frappe",
      },
    },
  },
}
