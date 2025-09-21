#!/usr/bin/env bash
# Helper script for CI to prepare artifacts for publishing
set -euo pipefail

echo "Preparing artifacts..."
# placeholder: copy build artifacts to /artifacts
mkdir -p artifacts
cp -r dist/* artifacts/ || true

echo "Artifacts ready in ./artifacts"
