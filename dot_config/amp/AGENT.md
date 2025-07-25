# Global Agent Instructions

## Version Communication
I use `jj` backed by `git` for all my version control operations. You can find the CLI reference [here](https://jj-vcs.github.io/jj/latest/cli-reference/).

Always run `jj` non-interactively with `--no-pager`.
Limit the size of log output with `--limit`.

### Common jj commands and workflows:

- **Compare current changes against main**: `jj diff --no-pager --from main`
- **Compare specific revisions**: `jj diff --no-pager --from <rev1> --to <rev2>`
- **View commit history**: `jj log --no-pager` (shows mutable revisions only)
- **View history with diffs**: `jj log -p --no-pager --limit=10`
- **View commits that modified a file**: `jj log --no-pager --limit=50 <filename>`
- **Check current status**: `jj status`

## Development Philosophy

### Test-Driven Development (TDD)
1. **Always write tests for the desired behavior FIRST**
2. **Then implement code until the initial tests pass**
3. **Never skip this step** - tests must be written before implementation

### Communication
- Be concise and direct in responses
- Focus on the specific task at hand
- Avoid unnecessary explanations unless requested
- Use file links for code references

