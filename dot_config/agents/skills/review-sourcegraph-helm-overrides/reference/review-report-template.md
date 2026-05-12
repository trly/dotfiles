# Sourcegraph Helm Override Review Report

## Scope

- Override file: `<path>`
- Environment/namespace: `<environment>`
- deploy-sourcegraph-helm revision: `<revision>`
- Validation artifacts: `<path; contains rendered manifests and must be handled as sensitive>`
- Review date: `<YYYY-MM-DD>`

## Findings

1. **[SEVERITY] Short finding title**
Evidence: `<command output / rendered manifest reference / key path>`
Impact: `<why this matters>`
Recommendation: `<specific remediation>`

2. **[SEVERITY] Short finding title**
Evidence: `<command output / rendered manifest reference / key path>`
Impact: `<why this matters>`
Recommendation: `<specific remediation>`

## Checklist Status

- Key mapping and silent-ignore risk reviewed: `<pass/fail>`
- RBAC and service accounts reviewed: `<pass/fail>`
- Security context compatibility reviewed: `<pass/fail>`
- Service-specific checks reviewed: `<pass/fail>`
- Lint and template commands succeeded: `<pass/fail>`
- Sensitive values redacted from evidence: `<pass/fail>`

## Residual Risks

- `<remaining deployment risk or dependency on platform-side controls>`

## Final Recommendation

- `<approve / approve with changes / block>`
