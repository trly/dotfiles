return {
{
"nvim-treesitter/nvim-treesitter",
opts = function(_, opts)
local add = {
"bash",
"css",
"html",
"go",
"java",
"javascript",
"json",
"lua",
"markdown",
"markdown_inline",
"python",
"query",
"regex",
"scss",
"svelte",
"tsx",
"typescript",
"vimdoc",
"vim",
 "yaml",
 }
  opts.ensure_installed = vim.list_extend(opts.ensure_installed or {}, add)
		end,
	},
}
