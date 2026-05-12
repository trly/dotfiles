---
name: create-batch-spec
description: "Creates and validates Sourcegraph batch spec YAML. Use when asked to create a batch spec, batch change, or src-cli validated multi-repository code change."
---

# Create Batch Specs

Use this skill to create Sourcegraph Batch Changes batch specs and validate them before presenting them as complete.

## Authoritative References

- Batch spec definition: https://sourcegraph.com/docs/batch-changes/batch-spec-yaml-reference
- Sourcegraph query syntax: https://sourcegraph.com/docs/code-search/queries

Reference the batch spec definition when deciding which YAML fields are valid, required, optional, or templated. Reference the query syntax documentation when writing or debugging `repositoriesMatchingQuery` searches, including filters, quoting, boolean operators, regex behavior, and search result selection.

## Required Workflow

1. **Define the target scope**
   - Identify repositories, files, languages, and code patterns the batch change should affect.
   - Prefer a narrow `repositoriesMatchingQuery` that finds only repositories needing the change.
   - If query syntax is uncertain, consult https://sourcegraph.com/docs/code-search/queries before finalizing the query.

2. **Validate every Sourcegraph search query with src-cli**
   - Run `src search` for each query that will be used in `on.repositoriesMatchingQuery`.
   - Add `count:1` for validation unless the query already contains an explicit `count:` filter.
   - Use `--` before the query so leading negated terms are not parsed as CLI flags.

   Example:

   ```sh
   query='repo:^github\.com/example-org/ file:\.go$ OldSymbol'
   src search -json -- "$query count:1" >/dev/null
   ```

   If the query already includes `count:`, validate it without appending another count filter:

   ```sh
   query='repo:^github\.com/example-org/ file:\.go$ OldSymbol count:10'
   src search -json -- "$query" >/dev/null
   ```

   Treat a nonzero exit code as a blocker: read the error, fix the query, and rerun validation. If the local environment lacks Sourcegraph authentication or configuration, report the exact command attempted and the missing requirement, usually `SRC_ENDPOINT` or `SRC_ACCESS_TOKEN`.

3. **Create the batch spec YAML**
   - Use the batch spec definition as the source of truth for schema and field names: https://sourcegraph.com/docs/batch-changes/batch-spec-yaml-reference
   - Prefer `version: 2` unless the user specifically asks for another supported format.
   - Include a clear `name`, `description`, `on`, `steps`, and `changesetTemplate`.
   - Ensure `changesetTemplate` includes the required changeset fields, especially title, branch, and commit message.
   - Keep shell steps idempotent and safe to rerun.
   - Use pinned container versions rather than `latest`.

4. **Validate the batch spec with src-cli**
   - Run `src batch validate` against the generated YAML file before calling the work complete.

   ```sh
   src batch validate -f batch.spec.yaml
   ```

   If validating content that has not been saved to its final path, write it to a temporary or requested file and validate that file. Fix validation failures and rerun `src batch validate` until it passes, or clearly report why validation could not be completed.

## Completion Checklist

- [ ] The batch spec YAML follows the batch spec definition reference.
- [ ] Every `repositoriesMatchingQuery` query has been validated with `src search`.
- [ ] Query syntax questions were checked against https://sourcegraph.com/docs/code-search/queries.
- [ ] The batch spec file has been validated with `src batch validate -f <file>`.
- [ ] Any validation blockers are reported with the exact command and error.
