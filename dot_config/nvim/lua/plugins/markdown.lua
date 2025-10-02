return {
  -- Inline Markdown rendering
  {
    "MeanderingProgrammer/render-markdown.nvim",
    ft = { "markdown", "mdx", "rmd" },
    dependencies = {
      "nvim-treesitter/nvim-treesitter",
      "3rd/image.nvim",
    },
    opts = {
      file_types = { "markdown", "mdx", "rmd" },
      heading = {
        enabled = true,
        sign = false,
        icons = {},
      },
      bullet = { enabled = true },
      checkbox = { enabled = true },
      table = { enabled = true },
      code = {
        enabled = true,
        sign = false,
        width = "block",
        right_pad = 1,
      },
      latex = { enabled = true },
      anti_conceal = {
        enabled = true,
      },
      max_file_size = 10.0,
      debounce = 100,
    },
    keys = {
      {
        "<leader>mp",
        function()
          require("render-markdown").toggle()
        end,
        ft = { "markdown", "mdx" },
        desc = "Toggle Markdown Render",
      },
    },
  },

  -- Image backend for inline images
  {
    "3rd/image.nvim",
    ft = { "markdown", "mdx", "rmd" },
    opts = {
      backend = "kitty",
      integrations = {
        markdown = {
          enabled = true,
          clear_in_insert_mode = false,
          download_remote_images = true,
          only_render_image_at_cursor = false,
        },
      },
      max_width = 60,
      max_height = 20,
      max_width_window_percentage = 0.5,
      max_height_window_percentage = 0.5,
      window_overlap_clear_enabled = true,
      window_overlap_clear_ft_ignore = { "cmp_menu", "cmp_docs", "" },
    },
  },
}
