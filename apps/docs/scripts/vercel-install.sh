#!/usr/bin/env bash
set -euo pipefail

export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$PATH"

install_bun_canary() {
	curl -fsSL https://bun.sh/install | bash -s canary
	export PATH="$BUN_INSTALL/bin:$PATH"
}

if ! command -v bun >/dev/null 2>&1; then
	install_bun_canary
fi

# Vercel's preinstalled Bun can lag behind the repo (packageManager: bun@1.4.0).
bun_version="$(bun --version)"
if [[ ! "$bun_version" =~ ^1\.4\. ]]; then
	install_bun_canary
fi

echo "Using Bun $(bun --version)"
bun install
