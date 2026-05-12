#!/usr/bin/env bash

set -euo pipefail
umask 077

usage() {
  cat <<'EOF'
Usage:
  run-validation.sh --override <path> --deploy-dir <path> --out-dir <path> [--namespace <name>]

Required arguments:
  --override    Path to Sourcegraph override.yaml
  --deploy-dir  Path to deploy-sourcegraph-helm checkout
  --out-dir     Output directory for rendered manifests and logs

Optional arguments:
  --namespace   Kubernetes namespace used when rendering Helm manifests
EOF
}

require_value() {
  local option="$1"
  local value="${2:-}"

  if [[ -z "$value" || "$value" == --* ]]; then
    echo "Missing value for $option" >&2
    usage
    exit 1
  fi
}

override_file=""
deploy_dir=""
out_dir=""
namespace=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --override)
      require_value "$1" "${2:-}"
      override_file="${2:-}"
      shift 2
      ;;
    --deploy-dir)
      require_value "$1" "${2:-}"
      deploy_dir="${2:-}"
      shift 2
      ;;
    --out-dir)
      require_value "$1" "${2:-}"
      out_dir="${2:-}"
      shift 2
      ;;
    --namespace)
      require_value "$1" "${2:-}"
      namespace="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$override_file" || -z "$deploy_dir" || -z "$out_dir" ]]; then
  usage
  exit 1
fi

if ! command -v helm >/dev/null 2>&1; then
  echo "helm is required but was not found in PATH" >&2
  exit 1
fi

if ! command -v yq >/dev/null 2>&1; then
  echo "yq is required but was not found in PATH" >&2
  exit 1
fi

if [[ ! -f "$override_file" ]]; then
  echo "override file not found: $override_file" >&2
  exit 1
fi

if [[ ! -d "$deploy_dir/charts/sourcegraph" ]]; then
  echo "sourcegraph chart not found: $deploy_dir/charts/sourcegraph" >&2
  exit 1
fi

if [[ ! -d "$deploy_dir/charts/sourcegraph-executor/k8s" ]]; then
  echo "executor chart not found: $deploy_dir/charts/sourcegraph-executor/k8s" >&2
  exit 1
fi

mkdir -p "$out_dir"
chmod go-rwx "$out_dir"

namespace_args=()
if [[ -n "$namespace" ]]; then
  namespace_args=(--namespace "$namespace")
fi

echo "Running helm lint checks..."
helm lint "${namespace_args[@]}" "$deploy_dir/charts/sourcegraph" -f "$override_file" | tee "$out_dir/lint-sourcegraph.log"
helm lint "${namespace_args[@]}" "$deploy_dir/charts/sourcegraph-executor/k8s" -f "$override_file" | tee "$out_dir/lint-executor.log"

echo "Rendering manifests..."
helm template "${namespace_args[@]}" sourcegraph "$deploy_dir/charts/sourcegraph" -f "$override_file" > "$out_dir/sourcegraph-rendered.yaml"
helm template "${namespace_args[@]}" executor "$deploy_dir/charts/sourcegraph-executor/k8s" -f "$override_file" > "$out_dir/executor-rendered.yaml"

echo "Extracting RBAC subjects..."
{
  echo "# sourcegraph-rendered.yaml"
  yq -N 'select(.kind == "RoleBinding" or .kind == "ClusterRoleBinding") | .kind + " " + .metadata.name + " -> " + ((.subjects // []) | map(.kind + ":" + .name) | join(","))' "$out_dir/sourcegraph-rendered.yaml"
  echo
  echo "# executor-rendered.yaml"
  yq -N 'select(.kind == "RoleBinding" or .kind == "ClusterRoleBinding") | .kind + " " + .metadata.name + " -> " + ((.subjects // []) | map(.kind + ":" + .name) | join(","))' "$out_dir/executor-rendered.yaml"
} > "$out_dir/rbac-subjects.txt"

echo "Validation complete. Artifacts in: $out_dir"
