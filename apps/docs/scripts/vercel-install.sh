#!/usr/bin/env bash
set -euo pipefail

BUN_VERSION="1.3.12"
export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$PATH"

install_bun() {
	curl -fsSL https://bun.sh/install | bash -s "bun-v${BUN_VERSION}"
	export PATH="$BUN_INSTALL/bin:$PATH"
}

if ! command -v bun >/dev/null 2>&1 || [[ "$(bun --version)" != "${BUN_VERSION}" ]]; then
	install_bun
fi

echo "Using Bun $(bun --version)"
bun install
