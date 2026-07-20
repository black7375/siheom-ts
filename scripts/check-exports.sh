#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: check-exports.sh <package-directory> [attw args...]" >&2
  exit 1
fi

package_dir=$1
shift

repo_root=$(cd "$(dirname "$0")/.." && pwd)
cd "$package_dir"

tarball=$(bun pm pack --quiet | tr -d '\n\r')
trap 'rm -f "$tarball"' EXIT

exec bunx attw "$tarball" "$@"
