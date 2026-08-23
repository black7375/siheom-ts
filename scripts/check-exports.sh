#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: check-exports.sh <package-directory> [attw args...]" >&2
  exit 1
fi

package_dir=$1
shift

cd "$package_dir"

tarball=.siheom-attw.tgz
trap 'rm -f "$tarball"' EXIT

yarn pack --out "$tarball" >/dev/null
yarn run -T attw "$tarball" "$@"
