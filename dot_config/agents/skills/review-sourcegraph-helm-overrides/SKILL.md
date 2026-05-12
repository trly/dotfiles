---
name: review-sourcegraph-helm-overrides
description: "Runs repeatable reviews for Sourcegraph Helm override validation, including chart key mapping, render checks, RBAC verification, and security-context risk checks. Use when asked to validate sourcegraph override.yaml files before deployment."
---

# Review Sourcegraph Helm Overrides

Performs a consistent pre-deployment review of Sourcegraph Helm override files.

## Use This Skill When

- You are asked to review a Sourcegraph `override.yaml`.
- You need a repeatable validation workflow for Helm overrides.
- You need to identify ignored keys, RBAC/service-account mismatches, or OpenShift SCC risks.

## Inputs

- Path to an `override.yaml` file.
- Path to a checked-out `deploy-sourcegraph-helm` repository.
- Optional: path to a checked-out `customer-assets` repository for environment context.

## Workflow

1. Confirm scope and versions.
2. Run deterministic lint/render validation.
3. Perform targeted risk checks (RBAC, security context, executor/auth, ingress/route, storage, image).
4. Produce a structured report with findings and risk level.

## Step 1: Confirm Scope And Versions

Capture:

- `override.yaml` path and target environment/namespace.
- `deploy-sourcegraph-helm` revision.
- Expected Sourcegraph version/tag.

If source references are missing, ask for them before continuing.

## Step 2: Run Deterministic Validation

Run `scripts/run-validation.sh` to produce lint output and rendered manifests.

```bash
scripts/run-validation.sh \
  --override /path/to/override.yaml \
  --deploy-dir /path/to/deploy-sourcegraph-helm \
  --out-dir /tmp/sourcegraph-override-review \
  --namespace sourcegraph
```

Rendered manifests may contain Secret data from the override. Keep the output directory private and redact sensitive values before sharing report evidence.

Outputs:

- `sourcegraph-rendered.yaml`
- `executor-rendered.yaml`
- `rbac-subjects.txt` with Sourcegraph and executor chart subjects

If lint or template generation fails, stop and report failure details first.

## Step 3: Risk Checks

Use the override and rendered manifests to review these risk areas.

### Key Mapping And Silent-Ignore Risk

- Map non-comment override keys against chart `values.yaml` and chart docs.
- Flag unknown/deprecated keys that Helm may silently ignore.

### RBAC And Service Accounts

- If `serviceAccount.create: false`, verify `serviceAccount.name` is set and expected to exist.
- Confirm `RoleBinding`/`ClusterRoleBinding` subjects reference intended service accounts.
- Validate privileged toggles (`frontend.privileged`, `prometheus.privileged`) match intended access.

### Security Context And Platform Compatibility

- Check hardcoded `runAsUser`, `runAsGroup`, and `fsGroup` against cluster constraints (especially OpenShift SCC).
- Flag `readOnlyRootFilesystem: true` for workloads that need write access.
- Confirm hardened defaults (`allowPrivilegeEscalation: false`, `capabilities.drop: ["ALL"]`) where expected.

### Service-Specific Checks

- Executor: verify `executor.frontendUrl` and that `executor.frontendPassword` is not placeholder data.
- Ingress/Route: if `ingress.enabled: false`, verify `extraResources` route/ingress targets and namespace values.
- Storage: validate `storageClass.name`, `storageSize`, and note platform-specific PVC constraints.
- Image source: validate `sourcegraph.image.repository` and tag behavior.

## Step 4: Report Format

Use `reference/review-report-template.md` for final output.

Rules:

- Findings come first, ordered by severity.
- Each finding must include evidence (file path, manifest object, or command output).
- Evidence must not expose credentials, Secret values, or other sensitive data.
- Explicitly state if no findings are present.

## Commands For Manual Drill-Down

```bash
# Show override service-account settings
yq '.serviceAccount' /path/to/override.yaml

# Extract privileged toggles
yq '.frontend.privileged, .prometheus.privileged' /path/to/override.yaml

# Inspect RBAC subjects in rendered manifests
yq -N 'select(.kind == "RoleBinding" or .kind == "ClusterRoleBinding") | .kind + " " + .metadata.name + " -> " + ((.subjects // []) | map(.kind + ":" + .name) | join(","))' /tmp/sourcegraph-override-review/sourcegraph-rendered.yaml
```

## Definition Of Done

- Lint and template commands complete successfully.
- RBAC subject mapping is reviewed.
- Security-context and service-specific checks are completed.
- Final report is written with severity, evidence, and recommendations.
