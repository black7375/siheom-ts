#!/usr/bin/env bash
set -euo pipefail

NOSE_VERSION="${NOSE_VERSION:-0.19.0}"
INSTALLER_URL="https://github.com/corca-ai/nose/releases/download/v${NOSE_VERSION}/nose-cli-installer.sh"

curl --proto '=https' --tlsv1.2 -LsSf "${INSTALLER_URL}" | sh

echo "nose installed. Ensure ~/.cargo/bin is on your PATH."
